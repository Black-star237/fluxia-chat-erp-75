import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useToast } from "@/hooks/use-toast";
import { useCompanyNavigation } from "@/hooks/useCompanyNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  TrendingDown,
  Percent,
  Upload,
  Plus
} from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';

// Mock user role - in real app this would come from auth context
const userRole = "owner"; // "owner", "manager", "employee"

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { company, loading } = useCurrentCompany();
  const { navigateTo } = useCompanyNavigation();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    sellingPriceMin: 0,
    sellingPriceMax: 0,
    purchasePrice: 0,
    quantity: 0,
    promotion: 0,
    category: "",
    minQuantity: 0,
    maxQuantity: 100,
    ref: "",
    supplier: "",
    location: "",
    description: "",
    features: [] as string[],
    images: [] as string[]
  });

  const [newFeature, setNewFeature] = useState("");

  const canEdit = userRole === "owner" || userRole === "manager";
  const canSeePurchasePrice = userRole === "owner";

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentImageIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!company) return;
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .eq('company_id', company.id)
          .eq('is_active', true);

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [company]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleSave = async () => {
    console.log("Bouton de sauvegarde cliqué !");
    console.log("Tentative de sauvegarde du produit", { formData, company });

    if (!company) {
      console.error("Aucune entreprise sélectionnée");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune entreprise sélectionnée",
      });
      return;
    }

    if (!formData.name || !formData.sellingPriceMax) {
      console.error("Nom ou prix de vente manquant");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir le nom et le prix de vente",
      });
      return;
    }

    // Log : Vérification/création de catégorie
    console.log("--- Vérification catégorie ---");
    let categoryId = formData.category;
    if (!categoryId && categories.length === 0) {
      console.log("Aucune catégorie disponible → Création de 'Général'...");
      try {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert([{ name: 'Général', company_id: company.id, is_active: true }])
          .select()
          .single();

        if (categoryError) {
          console.error("Échec création catégorie :", categoryError);
          throw categoryError;
        }
        console.log("Catégorie créée :", newCategory);
        categoryId = newCategory.id;
        setCategories([newCategory]);
      } catch (error: any) {
        console.error("Erreur détaillée catégorie :", error);
        toast({
          variant: "destructive",
          title: "Erreur catégorie",
          description: error.message || "Échec création catégorie par défaut",
        });
        return;
      }
    } else {
      console.log("Catégorie existante utilisée (ID) :", categoryId || "Aucune (optionnel)");
    }

    try {
      // Générer un SKU unique si vide
      let skuValue = formData.ref;
      let barcodeValue = formData.ref;
      if (!skuValue || skuValue.trim() === '') {
        skuValue = `PROD-${Date.now()}`; // SKU unique basé sur le timestamp
        barcodeValue = skuValue; // Même valeur pour le barcode
        console.log("SKU/Barcode généré automatiquement :", skuValue);
      }

      // Log : Préparation des données du produit
      console.log("--- Début insertion produit ---");
      const productData = {
        name: formData.name,
        description: formData.description || '',
        min_price: formData.sellingPriceMin,
        max_price: formData.sellingPriceMax,
        cost_price: formData.purchasePrice || 0,
        current_stock: formData.quantity || 0,
        min_stock_level: formData.minQuantity || 0,
        max_stock_level: formData.maxQuantity || 100,
        sku: skuValue,
        barcode: barcodeValue,
        company_id: company.id,
        category_id: categoryId,
        image_url: null, // Le champ image_url reste vide lors de l'ajout
        is_active: true,
        created_by: user?.id || null
      };
      console.log("Données du produit prêtes :", productData);

      // Log : Tentative d'insertion Supabase
      console.log("Tentative d'insertion dans 'products'...");
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) {
        console.error("Échec insertion produit :", {
          message: productError.message,
          details: productError.details,
          hint: productError.hint,
          code: productError.code
        });
        throw productError;
      }

      console.log("Produit inséré avec succès :", product);

      // Ajouter les images dans product_images
      if (formData.images.length > 0) {
        const imageInsertPromises = formData.images.map(async (imageUrl) => {
          const { data: imageData, error: imageError } = await supabase
            .from('product_images')
            .insert([{
              product_id: product.id,
              url: imageUrl
            }])
            .select();

          if (imageError) {
            console.error("Erreur lors de l'ajout d'une image :", imageError);
            return null;
          }
          return imageData;
        });

        await Promise.all(imageInsertPromises);

        // Mettre à jour le champ image_url du produit avec la première image
        if (formData.images[0]) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: formData.images[0] })
            .eq('id', product.id);

          if (updateError) {
            console.error("Erreur lors de la mise à jour de image_url :", updateError);
          }
        }
      }

      toast({ title: "Succès", description: "Produit créé avec succès" });
      navigateTo("/stocks");
    } catch (error: any) {
      console.error("Erreur complète :", {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Échec : ${error.message || "Erreur inconnue"}`,
      });
    }
  };

  const handleCancel = () => {
    navigateTo("/stocks");
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Gestionnaire d'upload d'image appelé");
    const files = e.target.files;
    if (files) {
      console.log(`Nombre de fichiers sélectionnés : ${files.length}`);
      const uploadPromises = Array.from(files).map(async (file) => {
        console.log(`Traitement du fichier : ${file.name}`);
        // Nettoyer le nom de fichier en remplaçant les caractères spéciaux et les espaces
        const sanitizedFileName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_') // Remplacer les caractères spéciaux par des underscores
          .replace(/\s+/g, '_'); // Remplacer les espaces par des underscores

        const fileName = `${Date.now()}-${sanitizedFileName}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (error) {
          console.error('Error uploading image:', error);
          return null;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];

      console.log(`URLs d'images valides : ${validUrls.length}`);
      setFormData({
        ...formData,
        images: [...formData.images, ...validUrls]
      });
    } else {
      console.log("Aucun fichier sélectionné");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-6">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Accès non autorisé</h2>
            <p className="text-muted-foreground mb-4">Vous n'avez pas les permissions pour ajouter des produits.</p>
            <Button onClick={() => navigate("/stocks")}>Retour aux stocks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nouveau Produit</h1>
              <p className="text-sm text-muted-foreground">Créer un nouveau produit</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Créer le produit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <AspectRatio ratio={1}>
                  <div className="embla relative h-full" ref={emblaRef}>
                    {formData.images.length > 0 ? (
                      <>
                        <div className="embla__container flex h-full">
                          {formData.images.map((image, index) => (
                            <div key={index} className="embla__slide flex-none w-full h-full relative">
                              <img
                                src={image}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover bg-muted"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Navigation buttons */}
                        {formData.images.length > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={scrollPrev}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={scrollNext}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Aucune image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </AspectRatio>
              </CardContent>
            </Card>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Images du produit</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Bouton d'upload cliqué");
                    document.getElementById('image-upload')?.click();
                  }}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Ajouter des images
                </Button>
              </div>
            </div>

            {/* Image indicators */}
            {formData.images.length > 1 && (
              <div className="flex justify-center gap-2">
                {formData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-primary w-8' 
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Informations Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label>Nom du produit <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nom du produit"
                  />
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <Label>Prix de vente *</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Prix minimum <span className="text-destructive">*</span></Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.sellingPriceMin || ""}
                        onChange={(e) => setFormData({...formData, sellingPriceMin: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Prix maximum <span className="text-destructive">*</span></Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.sellingPriceMax || ""}
                        onChange={(e) => setFormData({...formData, sellingPriceMax: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Purchase Price (Owner only) */}
                {canSeePurchasePrice && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-warning" />
                        <Label>Prix d'achat</Label>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice || ""}
                        onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}

                <Separator />

                {/* Category */}
                <div className="space-y-2">
                  <Label>Catégorie <span className="text-destructive">*</span></Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Stock Management */}
                <div className="space-y-4">
                  <Label>Gestion du stock</Label>
                  
                  {/* Current Quantity */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quantité initiale</span>
                      <span className="font-medium">{formData.quantity}</span>
                    </div>
                    <Slider
                      value={[formData.quantity]}
                      onValueChange={([value]) => setFormData({...formData, quantity: value})}
                      max={formData.maxQuantity}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Min/Max Quantities */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Stock minimum</Label>
                      <Input
                        type="number"
                        value={formData.minQuantity || ""}
                        onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Stock maximum</Label>
                      <Input
                        type="number"
                        value={formData.maxQuantity || ""}
                        onChange={(e) => setFormData({...formData, maxQuantity: parseInt(e.target.value) || 100})}
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Promotion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-accent" />
                    <Label>Promotion</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Réduction</span>
                      <span className="font-medium">{formData.promotion}%</span>
                    </div>
                    <Slider
                      value={[formData.promotion]}
                      onValueChange={([value]) => setFormData({...formData, promotion: value})}
                      max={50}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Informations complémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Référence</Label>
                    <Input
                      value={formData.ref}
                      onChange={(e) => setFormData({...formData, ref: e.target.value})}
                      placeholder="REF-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emplacement</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="A1-05"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Nom du fournisseur"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Caractéristiques</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Ajouter une caractéristique"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button onClick={addFeature} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs gap-1">
                        {feature}
                        <button onClick={() => removeFeature(index)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description du produit"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}