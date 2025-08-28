import { useState, useEffect } from "react";
import { Search, Filter, Plus, Calendar, User, ShoppingCart, DollarSign, Trash2, RotateCcw, Edit, Eye, Phone, Mail, MapPin, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCompanyNavigation } from "@/hooks/useCompanyNavigation";

interface Client {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  total_purchases: number;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company } = useCurrentCompany();
  const { navigateTo } = useCompanyNavigation();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [selectedAmount, setSelectedAmount] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    if (user && company) {
      fetchClients();
    }
  }, [user, company, showDeleted]);

  const fetchClients = async () => {
    if (!user || !company) return;

    try {
      setLoading(true);

      // Récupérer les clients de l'entreprise active
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', !showDeleted)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Erreur lors du chargement des clients');
        return;
      }

      setClients(clientsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.company_name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone?.includes(searchTerm) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddClient = async () => {
    if (!newClient.phone || (!newClient.first_name && !newClient.company_name)) {
      toast.error("Téléphone et nom (ou nom d'entreprise) sont obligatoires");
      return;
    }

    if (!user || !company) return;

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          ...newClient,
          company_id: company.id,
          created_by: user.id,
          total_purchases: 0,
          is_active: true
        });

      if (error) {
        console.error('Error adding client:', error);
        toast.error('Erreur lors de l\'ajout du client');
        return;
      }

      setNewClient({ first_name: "", last_name: "", company_name: "", phone: "", email: "" });
      setShowAddDialog(false);
      fetchClients();
      toast.success("Client ajouté avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'ajout du client');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      first_name: client.first_name || "",
      last_name: client.last_name || "",
      company_name: client.company_name || "",
      phone: client.phone || "",
      email: client.email || ""
    });
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !newClient.phone || (!newClient.first_name && !newClient.company_name)) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update(newClient)
        .eq('id', editingClient.id);

      if (error) {
        console.error('Error updating client:', error);
        toast.error('Erreur lors de la modification du client');
        return;
      }
      
      setEditingClient(null);
      setNewClient({ first_name: "", last_name: "", company_name: "", phone: "", email: "" });
      fetchClients();
      toast.success("Client modifié avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la modification du client');
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        toast.error('Erreur lors de la suppression du client');
        return;
      }

      fetchClients();
      toast.success("Client supprimé");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression du client');
    }
  };

  const handleRestoreClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: true })
        .eq('id', id);

      if (error) {
        console.error('Error restoring client:', error);
        toast.error('Erreur lors de la restauration du client');
        return;
      }

      fetchClients();
      toast.success("Client restauré");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la restauration du client');
    }
  };

  const handleViewClient = (id: string) => {
    navigateTo(`/clients/${id}`);
  };

  const getClientName = (client: Client) => {
    if (client.company_name) return client.company_name;
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client sans nom';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Clients</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            {showDeleted ? "Clients supprimés" : "Gérez vos clients et leur historique"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {showDeleted ? "Voir actifs" : "Voir supprimés"}
          </Button>
          {!showDeleted && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Client
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau client</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du client
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                      placeholder="Prénom du client"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                      placeholder="Nom du client"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name">Nom d'entreprise</Label>
                    <Input
                      id="company_name"
                      value={newClient.company_name}
                      onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                      placeholder="Nom de l'entreprise (optionnel)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="client@email.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={editingClient ? handleUpdateClient : handleAddClient}>
                    {editingClient ? 'Modifier' : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      {!showDeleted && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Clients</p>
                  <p className="text-lg font-bold">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-muted-foreground">CA Total</p>
                  <p className="text-lg font-bold">
                    {clients.reduce((acc, c) => acc + (c.total_purchases || 0), 0).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                  <p className="text-lg font-bold">
                    {clients.filter(c => c.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                  <p className="text-lg font-bold">
                    {clients.filter(c => {
                      const createdDate = new Date(c.created_at);
                      const currentDate = new Date();
                      return createdDate.getMonth() === currentDate.getMonth() && 
                             createdDate.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, téléphone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>
            {showDeleted ? "Clients Supprimés" : "Liste des Clients"}
            <Badge variant="secondary" className="ml-2">
              {filteredClients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {clients.length === 0 ? "Aucun client" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {clients.length === 0 
                  ? "Commencez par ajouter votre premier client"
                  : "Aucun client ne correspond à vos critères"
                }
              </p>
              {clients.length === 0 && !showDeleted && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un client
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Achats</TableHead>
                    <TableHead className="hidden lg:table-cell">Ajouté</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getClientName(client)}</p>
                          <p className="text-sm text-muted-foreground sm:hidden">
                            {client.phone}
                          </p>
                          <Badge 
                            variant={client.is_active ? "default" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {client.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="font-medium">{(client.total_purchases || 0).toLocaleString()} FCFA</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {new Date(client.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewClient(client.id)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {showDeleted ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRestoreClient(client.id)}
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce client ? Cette action peut être annulée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit_first_name">Prénom</Label>
              <Input
                id="edit_first_name"
                value={newClient.first_name}
                onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                placeholder="Prénom du client"
              />
            </div>
            <div>
              <Label htmlFor="edit_last_name">Nom</Label>
              <Input
                id="edit_last_name"
                value={newClient.last_name}
                onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                placeholder="Nom du client"
              />
            </div>
            <div>
              <Label htmlFor="edit_company_name">Nom d'entreprise</Label>
              <Input
                id="edit_company_name"
                value={newClient.company_name}
                onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Téléphone *</Label>
              <Input
                id="edit_phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="client@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClient(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateClient}>Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}