import { useState, useEffect } from "react";
import { Plus, Search, Percent, Calendar, Tag, Edit, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { toast } from "sonner";

type PromotionType = "percentage" | "fixed_amount" | "buy_x_get_y";

interface Promotion {
  id: string;
  name: string;
  description?: string;
  promotion_type: PromotionType;
  value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  times_used?: number;
  usage_limit?: number;
  created_at: string;
}

export default function Promotions() {
  const { company, loading: companyLoading } = useCurrentCompany();
  
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    promotion_type: "percentage" as PromotionType,
    value: 0,
    start_date: "",
    end_date: "",
    usage_limit: undefined as number | undefined
  });

  useEffect(() => {
    if (company) {
      fetchPromotions();
    }
  }, [company]);

  const fetchPromotions = async () => {
    if (!company) return;

    try {
      setLoading(true);

      const { data: promotionsData, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promotions:', error);
        toast.error('Erreur lors du chargement des promotions');
        return;
      }

      setPromotions(promotionsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      promotion_type: "percentage" as PromotionType,
      value: 0,
      start_date: "",
      end_date: "",
      usage_limit: undefined
    });
  };

  const handleAddPromotion = async () => {
    if (!formData.name.trim() || !formData.start_date || !formData.end_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!company) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .insert({
          name: formData.name,
          description: formData.description,
          promotion_type: formData.promotion_type as "percentage" | "fixed_amount" | "buy_x_get_y",
          value: formData.value,
          start_date: formData.start_date,
          end_date: formData.end_date,
          usage_limit: formData.usage_limit,
          company_id: company.id,
          is_active: true,
          times_used: 0
        });

      if (error) {
        console.error('Error adding promotion:', error);
        toast.error('Erreur lors de l\'ajout de la promotion');
        return;
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchPromotions();
      toast.success("Promotion créée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'ajout de la promotion');
    }
  };

  const handleEditPromotion = async () => {
    if (!formData.name.trim() || !formData.start_date || !formData.end_date || !editingPromotion) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const { error } = await supabase
        .from('promotions')
        .update({
          name: formData.name,
          description: formData.description,
          promotion_type: formData.promotion_type,
          value: formData.value,
          start_date: formData.start_date,
          end_date: formData.end_date,
          usage_limit: formData.usage_limit
        })
        .eq('id', editingPromotion.id);

      if (error) {
        console.error('Error updating promotion:', error);
        toast.error('Erreur lors de la modification de la promotion');
        return;
      }

      setIsEditDialogOpen(false);
      setEditingPromotion(null);
      resetForm();
      fetchPromotions();
      toast.success("Promotion modifiée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la modification de la promotion');
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: false })
        .eq('id', promotionId);

      if (error) {
        console.error('Error deleting promotion:', error);
        toast.error('Erreur lors de la suppression de la promotion');
        return;
      }

      fetchPromotions();
      toast.success("Promotion supprimée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression de la promotion');
    }
  };

  const handleDuplicatePromotion = async (promotion: Promotion) => {
    if (!company) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .insert({
          name: `${promotion.name} (Copie)`,
          description: promotion.description,
          promotion_type: promotion.promotion_type,
          value: promotion.value,
          start_date: promotion.start_date,
          end_date: promotion.end_date,
          usage_limit: promotion.usage_limit,
          company_id: company.id,
          is_active: true,
          times_used: 0
        });

      if (error) {
        console.error('Error duplicating promotion:', error);
        toast.error('Erreur lors de la duplication de la promotion');
        return;
      }

      fetchPromotions();
      toast.success("Promotion dupliquée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la duplication de la promotion');
    }
  };

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description || "",
      promotion_type: promotion.promotion_type,
      value: promotion.value,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      usage_limit: promotion.usage_limit
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    
    if (now < startDate) {
      return <Badge variant="secondary">Programmée</Badge>;
    }
    
    if (now > endDate) {
      return <Badge variant="destructive">Expirée</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return type === "percentage" ? (
      <Percent className="h-4 w-4 text-green-500" />
    ) : (
      <Tag className="h-4 w-4 text-blue-500" />
    );
  };

  const formatValue = (type: string, value: number) => {
    return type === "percentage" ? `${value}%` : `${value} FCFA`;
  };

  const activePromotions = promotions.filter(p => {
    const now = new Date();
    const startDate = new Date(p.start_date);
    const endDate = new Date(p.end_date);
    return p.is_active && now >= startDate && now <= endDate;
  }).length;

  const totalUsage = promotions.reduce((sum, p) => sum + (p.times_used || 0), 0);

  if (loading || companyLoading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Promotions</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Gérez vos offres promotionnelles et remises
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Créer une promotion</span>
              <span className="xs:hidden">Créer</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{promotions.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Promotions totales</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{activePromotions}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Promotions actives</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{totalUsage}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Utilisations totales</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">
              {promotions.filter(p => {
                const now = new Date();
                const startDate = new Date(p.start_date);
                return p.is_active && now < startDate;
              }).length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Programmées</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une promotion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Promotions List */}
      {filteredPromotions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {promotions.length === 0 ? "Aucune promotion" : "Aucun résultat"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {promotions.length === 0 
                ? "Commencez par créer votre première promotion"
                : "Aucune promotion ne correspond à vos critères"
              }
            </p>
            {promotions.length === 0 && (
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une promotion
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPromotions.map((promotion) => (
            <Card key={promotion.id} className="modern-card hover-lift">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(promotion.promotion_type)}
                        <h3 className="font-semibold text-foreground text-base sm:text-lg">{promotion.name}</h3>
                      </div>
                      {getStatusBadge(promotion)}
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">{promotion.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Remise:</span>
                        <div className="font-semibold text-primary">
                          {formatValue(promotion.promotion_type, promotion.value)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Début:</span>
                        <div className="font-semibold text-sm">
                          {new Date(promotion.start_date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Fin:</span>
                        <div className="font-semibold text-sm">
                          {new Date(promotion.end_date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Utilisations:</span>
                        <div className="font-semibold text-green-500">{promotion.times_used || 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none lg:w-24" onClick={() => openEditDialog(promotion)}>
                      <Edit className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Modifier</span>
                      <span className="xs:hidden">Modif.</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none lg:w-24" onClick={() => handleDuplicatePromotion(promotion)}>
                      <Copy className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Dupliquer</span>
                      <span className="xs:hidden">Dupl.</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex-1 lg:flex-none lg:w-24">
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="hidden xs:inline">Supprimer</span>
                          <span className="xs:hidden">Suppr.</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la promotion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la promotion "{promotion.name}" ? 
                            Cette action peut être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePromotion(promotion.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Promotion Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle promotion</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle promotion pour attirer vos clients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la promotion</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Soldes d'été"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la promotion"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de remise</Label>
                <Select value={formData.promotion_type} onValueChange={(value) => setFormData({ ...formData, promotion_type: value as PromotionType })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valeur</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  placeholder={formData.promotion_type === "percentage" ? "%" : "FCFA"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage_limit">Limite d'utilisation (optionnel)</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit || ""}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Nombre maximum d'utilisations"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleAddPromotion} className="w-full sm:w-auto">
              Créer la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la promotion</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la promotion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de la promotion</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Soldes d'été"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la promotion"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type de remise</Label>
                <Select value={formData.promotion_type} onValueChange={(value) => setFormData({ ...formData, promotion_type: value as PromotionType })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Valeur</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  placeholder={formData.promotion_type === "percentage" ? "%" : "FCFA"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Date de début</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Date de fin</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-usage_limit">Limite d'utilisation (optionnel)</Label>
              <Input
                id="edit-usage_limit"
                type="number"
                value={formData.usage_limit || ""}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Nombre maximum d'utilisations"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleEditPromotion} className="w-full sm:w-auto">
              Modifier la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}