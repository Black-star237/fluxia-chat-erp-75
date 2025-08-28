import { useState, useEffect } from "react";
import { Plus, Search, FolderOpen, Package, Edit, Trash2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  sort_order?: number;
  parent_id?: string;
}

export default function Categories() {
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6"
  });

  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", 
    "#06B6D4", "#84CC16", "#F97316", "#A855F7"
  ];

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer la première entreprise de l'utilisateur
      const { data: membershipData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!membershipData || membershipData.length === 0) {
        setLoading(false);
        return;
      }

      const companyId = membershipData[0].company_id;

      // Récupérer les catégories
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Erreur lors du chargement des catégories');
        return;
      }

      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3B82F6"
    });
  };

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    if (!user) return;

    try {
      // Récupérer la première entreprise de l'utilisateur
      const { data: membershipData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!membershipData || membershipData.length === 0) {
        toast.error("Aucune entreprise trouvée");
        return;
      }

      const companyId = membershipData[0].company_id;

      const { error } = await supabase
        .from('categories')
        .insert({
          name: formData.name,
          description: formData.description,
          company_id: companyId,
          created_by: user.id,
          is_active: true,
          sort_order: 0
        });

      if (error) {
        console.error('Error adding category:', error);
        toast.error('Erreur lors de l\'ajout de la catégorie');
        return;
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchCategories();
      toast.success("Catégorie créée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de l\'ajout de la catégorie');
    }
  };

  const handleEditCategory = async () => {
    if (!formData.name.trim() || !editingCategory) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          description: formData.description
        })
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Error updating category:', error);
        toast.error('Erreur lors de la modification de la catégorie');
        return;
      }

      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
      toast.success("Catégorie modifiée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la modification de la catégorie');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Erreur lors de la suppression de la catégorie');
        return;
      }

      fetchCategories();
      toast.success("Catégorie supprimée avec succès");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: "#3B82F6"
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Catégories</h1>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Catégories</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Organisez vos produits par catégories
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Créer une catégorie</span>
              <span className="xs:hidden">Créer</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{categories.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Catégories totales</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{categories.filter(c => c.is_active).length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Catégories actives</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">0</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Produits liés</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">0</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Sous-catégories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {categories.length === 0 ? "Aucune catégorie" : "Aucun résultat"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {categories.length === 0 
                ? "Commencez par créer votre première catégorie"
                : "Aucune catégorie ne correspond à vos critères"
              }
            </p>
            {categories.length === 0 && (
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une catégorie
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="modern-card hover-lift">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${formData.color}20` }}
                  >
                    <FolderOpen 
                      className="h-5 w-5 sm:h-6 sm:w-6" 
                      style={{ color: formData.color }}
                    />
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <Package className="h-3 w-3" />
                    0
                  </Badge>
                </div>

                <h3 className="font-semibold text-foreground text-base sm:text-lg mb-2">
                  {category.name}
                </h3>
                
                <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-2">
                  {category.description || "Aucune description"}
                </p>

                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Créée le {new Date(category.created_at).toLocaleDateString('fr-FR')}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(category)}>
                      <Edit className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Modifier</span>
                      <span className="xs:hidden">Modif.</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex-1">
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="hidden xs:inline">Supprimer</span>
                          <span className="xs:hidden">Suppr.</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la catégorie "{category.name}" ? 
                            Cette action peut être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
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

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle catégorie pour organiser vos produits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Électronique"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleAddCategory} className="w-full sm:w-auto">
              Créer la catégorie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de la catégorie</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Électronique"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleEditCategory} className="w-full sm:w-auto">
              Modifier la catégorie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}