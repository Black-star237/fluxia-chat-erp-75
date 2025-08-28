import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Printer, User, Package, Receipt, ShoppingCart, Search } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Déclarer le type pour jsPDF avec autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: any;
  }
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  discount?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  stock: number;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

interface Promotion {
  id: string;
  name: string;
  discount: number;
  type: 'percentage' | 'fixed';
}


export default function Vente() {
  const { toast } = useToast();
  const { company, loading } = useCurrentCompany();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [customDiscount, setCustomDiscount] = useState(0);
  const [tva, setTva] = useState(19.25); // TVA par défaut
  const [partialPayment, setPartialPayment] = useState("");
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, price: product.price }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const updatePrice = (productId: string, newPrice: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, price: newPrice }
          : item
      ));
    }
  };

  const calculateSubTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateClientDiscount = () => {
    return selectedClient?.discount ? (calculateSubTotal() * selectedClient.discount) / 100 : 0;
  };

  const calculatePromotionDiscount = () => {
    if (!selectedPromotion) return 0;
    if (selectedPromotion.type === 'percentage') {
      return (calculateSubTotal() * selectedPromotion.discount) / 100;
    }
    return selectedPromotion.discount;
  };

  const calculateCustomDiscount = () => {
    return (calculateSubTotal() * customDiscount) / 100;
  };

  const calculateTotalDiscount = () => {
    return calculateClientDiscount() + calculatePromotionDiscount() + calculateCustomDiscount();
  };

  const calculateTvaAmount = () => {
    const discountedAmount = calculateSubTotal() - calculateTotalDiscount();
    return (discountedAmount * tva) / 100;
  };

  const calculateTotal = () => {
    return calculateSubTotal() - calculateTotalDiscount() + calculateTvaAmount();
  };

  const handleSale = async (paymentType: 'full' | 'partial') => {
    if (cart.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit à la vente.",
        variant: "destructive",
      });
      return;
    }

    if (!company) {
      toast({
        title: "Erreur",
        description: "Aucune entreprise sélectionnée.",
        variant: "destructive",
      });
      return;
    }

    try {
      const saleNumber = `VTE-${Date.now()}`;
      const total = calculateTotal();
      const partialAmount = paymentType === 'partial' ? parseFloat(partialPayment) : total;

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Créer la vente avec sold_by
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          company_id: company.id,
          client_id: selectedClient?.id || null,
          subtotal: calculateSubTotal(),
          discount_amount: calculateTotalDiscount(),
          tax_amount: calculateTvaAmount(),
          total_amount: total,
          payment_method: 'cash',
          status: paymentType === 'full' ? 'completed' : 'pending',
          sold_by: user?.id || null,
        })
        .select()
        .single();

      if (saleError) {
        throw new Error(`Erreur lors de la création de la vente: ${saleError.message}`);
      }

      // 2. Créer la facture avec created_by et gestion des acomptes
      const dueDate = paymentType === 'partial'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${Date.now()}`,
          sale_id: saleData.id,
          client_id: selectedClient?.id || null,
          company_id: company.id,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate,
          subtotal: calculateSubTotal(),
          tax_amount: calculateTvaAmount(),
          total_amount: total,
          status: paymentType === 'full' ? 'paid' : 'sent',
          paid_amount: paymentType === 'full' ? total : partialAmount,
          notes: `Facture générée automatiquement pour la vente ${saleNumber}`,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (invoiceError) {
        throw new Error(`Erreur lors de la création de la facture: ${invoiceError.message}`);
      }

      // 3. Créer les articles de vente avec les IDs de sale et invoice
      const saleItems = cart.map(item => ({
        sale_id: saleData.id,
        invoice_id: invoiceData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity
      }));

      const { error: saleItemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (saleItemsError) {
        throw new Error(`Erreur lors de la création des articles de vente: ${saleItemsError.message}`);
      }

      // Mettre à jour les stocks
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({
            current_stock: item.product.stock - item.quantity
          })
          .eq('id', item.product.id);

        if (stockError) {
          throw new Error(`Erreur lors de la mise à jour du stock: ${stockError.message}`);
        }
      }

      // Générer l'aperçu de la facture
      const invoice = {
        id: saleData.id,
        number: `INV-${Date.now()}`,
        client: selectedClient,
        items: cart,
        subtotal: calculateSubTotal(),
        discount: calculateTotalDiscount(),
        tva: calculateTvaAmount(),
        total: total,
        paymentType,
        partialAmount: partialAmount,
        date: new Date().toISOString(),
      };

      setGeneratedInvoice(invoice);
      setShowInvoicePreview(true);

      toast({
        title: "Vente validée",
        description: `Vente ${saleNumber} et facture créées avec succès.`,
      });

      // Reset form
      setCart([]);
      setSelectedClient(null);
      setSelectedPromotion(null);
      setCustomDiscount(0);
      setPartialPayment("");

      // Recharger les produits pour mettre à jour les stocks
      fetchProducts();

    } catch (error: any) {
      console.error('Erreur lors de la création de la vente:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la vente.",
        variant: "destructive",
      });
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  interface Invoice {
    id: string;
    number: string;
    client: Client | null;
    items: CartItem[];
    subtotal: number;
    discount: number;
    tva: number;
    total: number;
    paymentType: 'full' | 'partial';
    partialAmount?: number;
    date: string;
  }

  const exportInvoiceToPDF = async (invoice: Invoice, company: any) => {
    // Importer dynamiquement jsPDF et jspdf-autotable
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    // Utiliser les données de l'entreprise passées en paramètre
    const companyName = company?.name || "FluxiaBiz";
    const companyAddress = company?.address || "123 Rue Principale, Douala, Cameroun";
    const companyPhone = company?.phone || "(+237) 678 901 234";
    const companyEmail = company?.email || "contact@fluxiabiz.com";
    const logoUrl = company?.logo_url || "/lovable-uploads/9d49caf7-7895-4386-93ac-67a0abbb0322.png";

    // Formatage des montants (ex: "39 480 FCFA")
    const formatCurrencyForPDF = (amount: number) =>
      new Intl.NumberFormat('fr-FR').format(amount).replace(/\s/g, ' ') + ' FCFA';

    // Ajout du logo (redimensionné pour éviter le débordement)
    try {
      doc.addImage(logoUrl, 'PNG', 15, 15, 50, 25); // (x, y, width, height)
    } catch (e) {
      console.warn("Logo non trouvé, continuation sans logo.");
    }

    // Titre (centré, police moderne)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`FACTURE N° ${invoice.number}`, 105, 45, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 105, 55, { align: 'center' });

    // En-tête de l'entreprise (à gauche, sous le logo)
    doc.setFontSize(10);
    doc.text(companyName, 15, 70);
    doc.text(`Adresse: ${companyAddress}`, 15, 78);
    doc.text(`Tél: ${companyPhone}`, 15, 86);
    doc.text(`Email: ${companyEmail}`, 15, 94);

    // Informations du client (à droite)
    if (invoice.client) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Client:', 180, 70, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom: ${invoice.client.name}`, 180, 78, { align: 'right' });
      doc.text(`Téléphone: ${invoice.client.phone}`, 180, 86, { align: 'right' });
    }

    // Tableau des articles (largeurs réduites pour éviter le débordement)
    const tableData = invoice.items.map((item: CartItem) => [
      item.product.name,
      item.quantity.toString(),
      formatCurrencyForPDF(item.price),
      formatCurrencyForPDF(item.price * item.quantity),
    ]);

    autoTable(doc, {
      startY: 100, // Déplacé vers le bas pour éviter les chevauchements
      head: [['Produit', 'Qté', 'Prix Unitaire', 'Total']],
      body: tableData,
      styles: {
        font: 'helvetica',
        fontSize: 9, // Réduite pour gagner de la place
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [41, 128, 185], // Bleu professionnel
        textColor: 255, // Blanc
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        lineColor: [220, 220, 220], // Bordures grises claires
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' },   // Réduite de 60 à 40
        1: { cellWidth: 15, halign: 'center' }, // Réduite de 20 à 15
        2: { cellWidth: 30, halign: 'right' },  // Réduite de 35 à 30
        3: { cellWidth: 30, halign: 'right' },  // Réduite de 35 à 30
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Fond gris clair pour les lignes paires
      },
    });

    // Position finale du tableau pour le résumé
    const finalY = doc.lastAutoTable.finalY + 10;

    // Résumé des montants (aligné à droite)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL: ${formatCurrencyForPDF(invoice.total)}`, 180, finalY + 20, { align: 'right' });

    // Reste à payer (si acompte)
    if (invoice.paymentType === 'partial' && invoice.partialAmount) {
      const resteAPayer = invoice.total - invoice.partialAmount;
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0); // Rouge
      doc.text(`Montant payé: ${formatCurrencyForPDF(invoice.partialAmount)}`, 180, finalY + 30, { align: 'right' });
      doc.text(`Reste à payer: ${formatCurrencyForPDF(resteAPayer)}`, 180, finalY + 40, { align: 'right' });
    }

    // Pied de page (conditions de paiement)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100); // Gris
    doc.text(`Conditions de paiement: Paiement sous 30 jours.`, 15, doc.internal.pageSize.height - 20);
    doc.text(`Merci pour votre confiance !`, 15, doc.internal.pageSize.height - 10);

    // Enregistrer le PDF
    doc.save(`Facture_${invoice.number}.pdf`);
  };

  const fetchClients = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, phone, email')
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (error) throw error;

      const formattedClients = data?.map(client => ({
        id: client.id,
        name: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
        phone: client.phone || '',
        email: client.email || '',
      })) || [];

      setClients(formattedClients);
      setFilteredClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, current_stock, cost_price')
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        return;
      }

      // Utiliser cost_price comme prix par défaut et ajouter une marge de 20% pour le prix de vente
      const formattedProducts = Array.isArray(data)
        ? data.map(product => ({
            id: product.id,
            name: product.name,
            price: product.cost_price * 1.2, // Prix de vente = coût + 20%
            minPrice: product.cost_price, // Prix minimum = coût
            maxPrice: product.cost_price * 1.5, // Prix maximum = coût + 50%
            stock: product.current_stock,
            category: 'Produit',
          }))
        : [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromotions = async () => {
    if (!company) return;
    
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('id, name, value, promotion_type')
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const formattedPromotions = data?.map(promo => ({
        id: promo.id,
        name: promo.name,
        discount: promo.value,
        type: promo.promotion_type === 'percentage' ? 'percentage' as const : 'fixed' as const,
      })) || [];
      
      setPromotions(formattedPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  useEffect(() => {
    if (company) {
      fetchClients();
      fetchProducts();
      fetchPromotions();
    }
  }, [company]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Nouvelle Vente</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sélection Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client (Optionnel)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un client..."
                  className="pl-10"
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    setFilteredClients(
                      clients.filter(client =>
                        client.name.toLowerCase().includes(searchTerm) ||
                        client.phone.toLowerCase().includes(searchTerm)
                      )
                    );
                  }}
                />
              </div>
              <Select onValueChange={(value) => setSelectedClient(clients.find(c => c.id === value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-sm text-muted-foreground">{client.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClient?.discount && (
              <Badge variant="secondary" className="mt-2">
                Réduction client: {selectedClient.discount}%
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Sélection Produits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ajouter Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.price)} - Stock: {product.stock}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Panier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Panier ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.product.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => updateQuantity(item.product.id, 0)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Prix unitaire</Label>
                    <Input
                      type="number"
                      value={item.price}
                      min={item.product.minPrice}
                      max={item.product.maxPrice}
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value);
                        if (!isNaN(newPrice)) {
                          updatePrice(item.product.id, newPrice);
                        }
                      }}
                      onBlur={(e) => {
                        const newPrice = parseFloat(e.target.value);
                        if (newPrice < item.product.minPrice || newPrice > item.product.maxPrice) {
                          alert(`Le prix doit être entre ${item.product.minPrice} et ${item.product.maxPrice}.`);
                          updatePrice(item.product.id, item.product.price);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Min: {formatCurrency(item.product.minPrice)} - Max: {formatCurrency(item.product.maxPrice)}
                    </p>
                  </div>

                  <div className="text-right font-medium">
                    Total: {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Réductions et Calculs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Réductions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Promotion</Label>
              <Select onValueChange={(value) => setSelectedPromotion(promotions.find(p => p.id === value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une promotion" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((promo) => (
                    <SelectItem key={promo.id} value={promo.id}>
                      {promo.name} ({promo.type === 'percentage' ? `${promo.discount}%` : formatCurrency(promo.discount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Réduction personnalisée (%)</Label>
              <Input
                type="number"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label>TVA (%)</Label>
              <Input
                type="number"
                value={tva}
                onChange={(e) => setTva(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{formatCurrency(calculateSubTotal())}</span>
            </div>
            
            {selectedClient?.discount && (
              <div className="flex justify-between text-green-600">
                <span>Réduction client ({selectedClient.discount}%):</span>
                <span>-{formatCurrency(calculateClientDiscount())}</span>
              </div>
            )}
            
            {selectedPromotion && (
              <div className="flex justify-between text-green-600">
                <span>Promotion:</span>
                <span>-{formatCurrency(calculatePromotionDiscount())}</span>
              </div>
            )}
            
            {customDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction personnalisée ({customDiscount}%):</span>
                <span>-{formatCurrency(calculateCustomDiscount())}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>TVA ({tva}%):</span>
              <span>{formatCurrency(calculateTvaAmount())}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Validation de la vente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={() => handleSale('full')}
              disabled={cart.length === 0}
            >
              Payé intégralement
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1" disabled={cart.length === 0}>
                  Acompte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paiement partiel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Montant total: {formatCurrency(calculateTotal())}</Label>
                  </div>
                  <div>
                    <Label>Montant payé</Label>
                    <Input
                      type="number"
                      value={partialPayment}
                      onChange={(e) => setPartialPayment(e.target.value)}
                      placeholder="Entrez le montant payé"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSale('partial')}
                    disabled={!partialPayment || parseFloat(partialPayment) <= 0}
                  >
                    Valider l'acompte
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu Facture */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Aperçu de la facture
            </DialogTitle>
          </DialogHeader>
          
          {generatedInvoice && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="text-center">
                <h2 className="text-xl font-bold">FACTURE</h2>
                <p className="text-muted-foreground">N° {generatedInvoice.number}</p>
                <p className="text-sm">Date: {new Date(generatedInvoice.date).toLocaleDateString('fr-FR')}</p>
              </div>
              
              {generatedInvoice.client && (
                <div>
                  <h3 className="font-semibold">Client:</h3>
                  <p>{generatedInvoice.client.name}</p>
                  <p>{generatedInvoice.client.phone}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Articles:</h3>
                {generatedInvoice.items.map((item: CartItem, index: number) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{formatCurrency(generatedInvoice.subtotal)}</span>
                </div>
                
                {generatedInvoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction:</span>
                    <span>-{formatCurrency(generatedInvoice.discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>TVA:</span>
                  <span>{formatCurrency(generatedInvoice.tva)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(generatedInvoice.total)}</span>
                </div>
                
                {generatedInvoice.paymentType === 'partial' && (
                  <div className="flex justify-between text-orange-600">
                    <span>Montant payé:</span>
                    <span>{formatCurrency(generatedInvoice.partialAmount)}</span>
                  </div>
                )}
              </div>
              
              <Button
                className="w-full"
                onClick={() => exportInvoiceToPDF(generatedInvoice, company)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}