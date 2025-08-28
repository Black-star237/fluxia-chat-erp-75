import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, AlertTriangle, TrendingDown, Filter, Download, Edit, Trash2, Eye, BarChart3, Grid, List, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price?: number;
  selling_price: number;
  min_stock_level?: number;
  current_stock: number;
  image_url?: string;
  is_active: boolean;
  categories?: { name: string };
  suppliers?: { name: string };
}

export default function Stocks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Mock user role - in real app this would come from auth context
  const userRole = "owner"; // "owner", "manager", "employee"
  
  const canEdit = userRole === "owner" || userRole === "manager";
  const canAddProduct = userRole === "owner" || userRole === "manager";

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const fetchProducts = async () => {
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

      // Récupérer les produits
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Erreur lors du chargement des produits');
        return;
      }

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!user) return;

    try {
      // Récupérer la première entreprise de l'utilisateur
      const { data: membershipData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!membershipData || membershipData.length === 0) return;

      const companyId = membershipData[0].company_id;

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredStock = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.categories?.name === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === "low") {
      matchesStatus = item.current_stock <= (item.min_stock_level || 0);
    } else if (selectedStatus === "out") {
      matchesStatus = item.current_stock === 0;
    } else if (selectedStatus === "available") {
      matchesStatus = item.current_stock > (item.min_stock_level || 0);
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(item => item.current_stock <= (item.min_stock_level || 0) && item.current_stock > 0).length;
  const outOfStockCount = products.filter(item => item.current_stock === 0).length;
  const totalValue = products.reduce((acc, item) => acc + ((item.cost_price || 0) * item.current_stock), 0);

  const getStatusBadge = (item: Product) => {
    if (item.current_stock === 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Rupture</Badge>;
    }
    if (item.current_stock <= (item.min_stock_level || 0)) {
      return <Badge variant="outline" className="gap-1 text-warning border-warning"><TrendingDown className="h-3 w-3" />Stock bas</Badge>;
    }
    return <Badge variant="outline" className="gap-1 text-success border-success"><Package className="h-3 w-3" />Disponible</Badge>;
  };

  const AddProductDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Nom du produit</Label>
            <Input id="productName" placeholder="Ex: iPhone 15 Pro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productRef">Référence</Label>
            <Input id="productRef" placeholder="Ex: IPH-15-PRO" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input id="supplier" placeholder="Nom du fournisseur" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input id="quantity" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Stock min</Label>
              <Input id="minQuantity" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix</Label>
              <Input id="price" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => navigate("/stocks/add")}>Ajouter le produit</Button>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Stocks</h1>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Stocks</h1>
          <p className="text-muted-foreground">Gérez votre inventaire et surveillez les niveaux de stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          {canAddProduct && (
            <Button className="gap-2" onClick={() => navigate("/stocks/add")}>
              <Plus className="h-4 w-4" />
              Nouveau Produit
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produits</p>
                <p className="text-xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Bas</p>
                <p className="text-xl font-bold text-warning">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rupture</p>
                <p className="text-xl font-bold text-destructive">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-xl font-bold text-success">{totalValue.toFixed(0)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, référence ou fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="low">Stock bas</SelectItem>
                  <SelectItem value="out">Rupture</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button 
                  variant={viewMode === "cards" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "table" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredStock.length} produit{filteredStock.length !== 1 ? 's' : ''} trouvé{filteredStock.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stock Display */}
      {viewMode === "cards" ? (
        <div className="grid gap-4">
          {filteredStock.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer glass-card" onClick={() => navigate(`/stocks/${item.id}`)}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img 
                        src={item.image_url || "/lovable-uploads/9d49caf7-7895-4386-93ac-67a0abbb0322.png"} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Réf: {item.sku || 'N/A'}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline">{item.categories?.name || 'Aucune'}</Badge>
                        {getStatusBadge(item)}
                        <span className="text-sm text-muted-foreground">
                          Stock: <span className="font-medium">{item.current_stock}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-end sm:items-end justify-between sm:justify-start gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {(item.max_price || 0).toFixed(0)} FCFA
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Valeur stock: {((item.cost_price || 0) * item.current_stock).toFixed(0)} FCFA
                      </div>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => navigate(`/stocks/${item.id}`)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/stocks/${item.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={item.image_url || "/lovable-uploads/9d49caf7-7895-4386-93ac-67a0abbb0322.png"} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.categories?.name || 'Aucune'}</TableCell>
                  <TableCell>{item.current_stock}</TableCell>
                  <TableCell>{(item.max_price || 0).toFixed(0)} FCFA</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => navigate(`/stocks/${item.id}`)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredStock.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0 
                ? "Commencez par ajouter votre premier produit"
                : "Aucun produit ne correspond à vos critères de recherche"
              }
            </p>
            {canAddProduct && products.length === 0 && (
              <Button onClick={() => navigate("/stocks/add")}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AddProductDialog />
    </div>
  );
}