import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCompanyNavigation } from "@/hooks/useCompanyNavigation";
import { ArrowLeft, Phone, Mail, MapPin, ShoppingCart, CreditCard, Edit, Trash2, MessageCircle, Calendar, User, TrendingUp, Package, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Facture {
  id: string;
  numero: string;
  date: string;
  montant: number;
  statut: "payee" | "impayee" | "partiellement_payee";
  produits: string[];
}

interface ClientDetail {
  id: string;
  nom: string;
  telephone: string;
  whatsapp?: string;
  email?: string;
  adresse?: string;
  totalAchats: number;
  nombreCommandes: number;
  dateAjout: string;
  ajoutePar: string;
  statut: "actif" | "inactif";
  produitsPreferes: string[];
  derniereActivite: string;
  reductionPersonnalisee: number;
  noteInterne?: string;
  factures: Facture[];
}


export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company, loading } = useCurrentCompany();
  const { navigateTo } = useCompanyNavigation();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    nom: "",
    telephone: "",
    whatsapp: "",
    email: "",
    adresse: "",
    reductionPersonnalisee: 0,
    noteInterne: ""
  });

  const fetchClient = async () => {
    if (!id || !company) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          sales (
            id,
            sale_number,
            sale_date,
            total_amount,
            status,
            sale_items (
              products (name)
            )
          )
        `)
        .eq('id', id)
        .eq('company_id', company.id)
        .single();

      if (error) throw error;

      if (data) {
        const clientDetail: ClientDetail = {
          id: data.id,
          nom: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          telephone: data.phone || '',
          whatsapp: data.phone || '',
          email: data.email || '',
          adresse: '',
          totalAchats: data.total_purchases || 0,
          nombreCommandes: data.sales?.length || 0,
          dateAjout: new Date(data.created_at).toLocaleDateString(),
          ajoutePar: 'Système',
          statut: data.is_active ? 'actif' : 'inactif',
          produitsPreferes: [],
          derniereActivite: data.last_purchase_date ? new Date(data.last_purchase_date).toLocaleDateString() : 'Aucune',
          reductionPersonnalisee: 0,
          noteInterne: '',
          factures: data.sales?.map((sale: any) => ({
            id: sale.id,
            numero: sale.sale_number,
            date: new Date(sale.sale_date).toLocaleDateString(),
            montant: sale.total_amount,
            statut: sale.status === 'completed' ? 'payee' : 'impayee',
            produits: sale.sale_items?.map((item: any) => item.products?.name).filter(Boolean) || []
          })) || []
        };

        setClient(clientDetail);
        setEditData({
          nom: clientDetail.nom,
          telephone: clientDetail.telephone,
          whatsapp: clientDetail.whatsapp || "",
          email: clientDetail.email || "",
          adresse: clientDetail.adresse || "",
          reductionPersonnalisee: clientDetail.reductionPersonnalisee,
          noteInterne: clientDetail.noteInterne || ""
        });
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error("Erreur lors du chargement du client");
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id, company]);

  const handleEdit = async () => {
    if (!client || !company) return;

    try {
      const [firstName, ...lastNameParts] = editData.nom.split(' ');
      const lastName = lastNameParts.join(' ');

      const { error } = await supabase
        .from('clients')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: editData.telephone,
          email: editData.email || null,
        })
        .eq('id', client.id)
        .eq('company_id', company.id);

      if (error) throw error;

      toast.success("Informations client mises à jour");
      setShowEditDialog(false);
      fetchClient();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!client || !company) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', client.id)
        .eq('company_id', company.id);

      if (error) throw error;

      toast.success("Client supprimé");
      navigateTo("/clients");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const handleCallPhone = () => {
    if (client?.telephone) {
      window.location.href = `tel:${client.telephone}`;
    }
  };

  const handleCallWhatsApp = () => {
    if (client?.whatsapp) {
      window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleSendEmail = () => {
    if (client?.email) {
      window.location.href = `mailto:${client.email}`;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "payee": return "default";
      case "impayee": return "destructive";
      case "partiellement_payee": return "secondary";
      default: return "outline";
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case "payee": return "Payée";
      case "impayee": return "Impayée";
      case "partiellement_payee": return "Partiellement payée";
      default: return statut;
    }
  };

  const totalFactures = client?.factures.length || 0;
  const facturesPayees = client?.factures.filter(f => f.statut === "payee").length || 0;
  const facturesImpayees = client?.factures.filter(f => f.statut === "impayee").length || 0;
  const montantImpaye = client?.factures
    .filter(f => f.statut === "impayee")
    .reduce((acc, f) => acc + f.montant, 0) || 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigateTo("/clients")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{client?.nom || 'Chargement...'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client?.statut === "actif" ? "default" : "secondary"}>
                {client?.statut || 'inconnu'}
              </Badge>
              {client && client.reductionPersonnalisee > 0 && (
                <Badge variant="outline" className="text-green-600">
                  -{client.reductionPersonnalisee}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier les informations client</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de {client?.nom}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nom">Nom complet</Label>
                    <Input
                      id="edit-nom"
                      value={editData.nom}
                      onChange={(e) => setEditData({...editData, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-telephone">Téléphone</Label>
                    <Input
                      id="edit-telephone"
                      value={editData.telephone}
                      onChange={(e) => setEditData({...editData, telephone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                    <Input
                      id="edit-whatsapp"
                      value={editData.whatsapp}
                      onChange={(e) => setEditData({...editData, whatsapp: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-adresse">Adresse</Label>
                  <Textarea
                    id="edit-adresse"
                    value={editData.adresse}
                    onChange={(e) => setEditData({...editData, adresse: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-reduction">Réduction personnalisée (%)</Label>
                  <Input
                    id="edit-reduction"
                    type="number"
                    min="0"
                    max="100"
                    value={editData.reductionPersonnalisee}
                    onChange={(e) => setEditData({...editData, reductionPersonnalisee: Number(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-note">Note interne</Label>
                  <Textarea
                    id="edit-note"
                    value={editData.noteInterne}
                    onChange={(e) => setEditData({...editData, noteInterne: e.target.value})}
                    rows={3}
                    placeholder="Notes privées sur le client..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleEdit}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95vw] max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer {client?.nom} ? 
                  Cette action peut être annulée dans les 30 jours.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client?.telephone}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCallPhone}>
                  Appeler
                </Button>
              </div>
              
              {client?.whatsapp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{client?.whatsapp}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCallWhatsApp}>
                    WhatsApp
                  </Button>
                </div>
              )}
              
              {client?.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm break-all">{client?.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSendEmail}>
                    Email
                  </Button>
                </div>
              )}
              
              {client?.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{client?.adresse}</span>
                </div>
              )}
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Ajouté le {client?.dateAjout}</p>
                    <p className="text-xs text-muted-foreground">par {client?.ajoutePar}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Dernière activité</p>
                    <p className="text-xs text-muted-foreground">{client?.derniereActivite}</p>
                  </div>
                </div>
              </div>
              
              {client?.noteInterne && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Note interne</h4>
                  <p className="text-sm text-muted-foreground">{client?.noteInterne}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{client?.totalAchats.toLocaleString()} €</p>
                  <p className="text-xs text-muted-foreground">Total dépensé</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{client?.nombreCommandes}</p>
                  <p className="text-xs text-muted-foreground">Commandes</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-medium">
                  {Math.round((client?.totalAchats || 0) / Math.max(client?.nombreCommandes || 1, 1))} €
                </p>
                <p className="text-xs text-muted-foreground">Panier moyen</p>
              </div>
              
              {client && client.reductionPersonnalisee > 0 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-lg font-medium text-green-600">-{client.reductionPersonnalisee}%</p>
                  <p className="text-xs text-muted-foreground">Réduction personnalisée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="factures" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="factures">Factures</TabsTrigger>
              <TabsTrigger value="produits">Produits préférés</TabsTrigger>
              <TabsTrigger value="historique">Historique</TabsTrigger>
            </TabsList>

            {/* Onglet Factures */}
            <TabsContent value="factures" className="space-y-4">
              {/* Résumé des factures */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{totalFactures}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Payées</p>
                        <p className="text-lg font-bold">{facturesPayees}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Impayées</p>
                        <p className="text-lg font-bold">{facturesImpayees}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">À recouvrer</p>
                        <p className="text-lg font-bold">{montantImpaye.toLocaleString()} €</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Liste des factures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Numéro</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="hidden md:table-cell">Produits</TableHead>
                        </TableRow>
                      </TableHeader>
                       <TableBody>
                         {client?.factures.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-medium">{facture.numero}</TableCell>
                            <TableCell>{facture.date}</TableCell>
                            <TableCell>{facture.montant.toLocaleString()} €</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(facture.statut)}>
                                {getStatusText(facture.statut)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {facture.produits.slice(0, 2).map((produit, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {produit}
                                  </Badge>
                                ))}
                                {facture.produits.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{facture.produits.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Produits préférés */}
            <TabsContent value="produits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Produits préférés
                  </CardTitle>
                  <CardDescription>
                    Basé sur l'historique d'achat de {client?.nom}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {client?.produitsPreferes.map((produit, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Package className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{produit}</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.floor(Math.random() * 5) + 1} achats
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {(client?.produitsPreferes.length || 0) === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun produit préféré identifié</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Historique */}
            <TabsContent value="historique">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des activités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Commande passée</p>
                        <p className="text-sm text-muted-foreground">
                          Facture FAC-2024-001 - 450.00 €
                        </p>
                        <p className="text-xs text-muted-foreground">20 janvier 2024</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <Edit className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Informations modifiées</p>
                        <p className="text-sm text-muted-foreground">
                          Adresse email mise à jour
                        </p>
                        <p className="text-xs text-muted-foreground">18 janvier 2024</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <User className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Client créé</p>
                        <p className="text-sm text-muted-foreground">
                          Ajouté par Jean Martin
                        </p>
                        <p className="text-xs text-muted-foreground">15 janvier 2024</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}