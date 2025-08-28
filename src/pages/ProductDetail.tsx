import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Star,
  Percent,
  TrendingUp,
  TrendingDown,
  Camera
} from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';

// Interface pour les données du produit
interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  ref?: string;
  description?: string;
  cost_price?: number;
  min_price?: number;
  max_price?: number;
  current_stock?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  category_id?: string;
  category?: string;
  supplier?: string;
  location?: string;
  status?: string;
  features?: string[];
  image_url?: string;
  promotion?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  company_id?: string;
  has_variants?: boolean;
}

// Interface pour les images du produit
interface ProductImage {
  url: string;
}

// Rôle utilisateur - à remplacer par le contexte d'authentification réel
const userRole = "owner"; // "owner", "manager", "employee"

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    sellingPriceMin: 0,
    sellingPriceMax: 0,
    purchasePrice: 0,
    quantity: 0,
    promotion: 0,
    category: "",
    minQuantity: 0,
    maxQuantity: 0
  });

  // Récupérer les détails du produit depuis Supabase
  useEffect(() => {
    const fetchProductData = async () => {
      console.log("ID du produit reçu :", id);
      if (!id) {
        console.error("ID du produit manquant dans l'URL");
        setError("ID du produit manquant");
        setLoading(false);
        return;
      }

      try {
        console.log("Tentative de récupération des détails du produit avec ID :", id);

        // Récupérer les données du produit
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) {
          console.error("Erreur Supabase lors de la récupération du produit :", productError);
          throw productError;
        }

        // Récupérer les images supplémentaires depuis product_images
        const { data: productImages, error: imagesError } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', id) as { data: { url: string }[] | null, error: any };

        if (imagesError) {
          console.error("Erreur Supabase lors de la récupération des images du produit :", imagesError);
        }

        // Récupérer le nom de la catégorie
        let categoryName = "Non spécifiée";
        if (product.category_id) {
          const { data: category, error: categoryError } = await supabase
            .from('categories')
            .select('name')
            .eq('id', product.category_id)
            .single();

          if (!categoryError && category) {
            categoryName = category.name;
          }
        }


        console.log("Données du produit récupérées avec succès :", product);

        // Préparer les images
        const images = [];
        if (product.image_url) {
          images.push(product.image_url);
        }
        if (productImages && productImages.length > 0) {
          productImages.forEach(img => {
            if (img.url) {
              images.push(img.url);
            }
          });
        }

        // Mise à jour de productData avec toutes les propriétés nécessaires
        const mappedProductData = {
          ...product,
          sellingPriceMin: (product as any).min_price || 0,
          sellingPriceMax: (product as any).max_price || 0,
          purchasePrice: (product as any).cost_price || 0,
          quantity: (product as any).current_stock || 0,
          promotion: (product as any).promotion || 0,
          category: categoryName,
          minQuantity: (product as any).min_stock_level || 0,
          maxQuantity: (product as any).max_stock_level || 100,
          supplier: (product as any).supplier || "Non spécifié",
          location: (product as any).location || "Non spécifié",
          ref: (product as any).ref || (product as any).sku || (product as any).barcode || "Non spécifié",
          status: (product as any).status || "available",
          features: (product as any).features || [],
          description: (product as any).description || "",
          images: images
        };
        setProductData(mappedProductData);
        setFormData({
          name: mappedProductData.name,
          sellingPriceMin: mappedProductData.sellingPriceMin,
          sellingPriceMax: mappedProductData.sellingPriceMax,
          purchasePrice: mappedProductData.purchasePrice,
          quantity: mappedProductData.quantity,
          promotion: mappedProductData.promotion,
          category: mappedProductData.category,
          minQuantity: mappedProductData.minQuantity,
          maxQuantity: mappedProductData.maxQuantity
        });
      } catch (error) {
        console.error("Erreur complète lors de la récupération du produit :", error);
        setError("Impossible de charger les détails du produit");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const canEdit = userRole === "owner" || userRole === "manager";
  const canSeePurchasePrice = userRole === "owner";

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentImageIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleSave = async () => {
    if (!id || !productData) return;

    try {
      // Mettre à jour les informations du produit
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: productData.description,
          min_price: formData.sellingPriceMin,
          max_price: formData.sellingPriceMax,
          cost_price: formData.purchasePrice,
          current_stock: formData.quantity,
          min_stock_level: formData.minQuantity,
          max_stock_level: formData.maxQuantity,
          promotion: formData.promotion,
          category_id: productData.category_id,
          supplier: productData.supplier,
          location: productData.location,
          ref: productData.ref,
          status: productData.status,
          features: productData.features,
        })
        .eq('id', id);

      if (productError) {
        console.error("Erreur lors de la mise à jour du produit :", productError);
        return;
      }

      // Mettre à jour l'état local
      setProductData((prev: any) => ({
        ...prev,
        name: formData.name,
        sellingPriceMin: formData.sellingPriceMin,
        sellingPriceMax: formData.sellingPriceMax,
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity,
        promotion: formData.promotion,
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Erreur complète lors de la sauvegarde :", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (error) {
          console.error('Erreur lors du téléchargement de l\'image:', error);
          return null;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];

      if (validUrls.length > 0) {
        // Ajouter les nouvelles images dans product_images
        const imageInsertPromises = validUrls.map(async (imageUrl) => {
          const { data: imageData, error: imageError } = await supabase
            .from('product_images')
            .insert([{
              product_id: id,
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

        // Mettre à jour l'état local avec les nouvelles images
        setProductData((prev: any) => ({
          ...prev,
          images: [...prev.images, ...validUrls]
        }));
      }
    } catch (error) {
      console.error("Erreur complète lors de l'ajout des images :", error);
    }
  };

  const removeProductImage = async (index: number) => {
    if (!id || !productData || !productData.images || index >= productData.images.length) return;

    try {
      const imageUrlToRemove = productData.images[index];

      // Supprimer l'image de product_images
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id)
        .eq('url', imageUrlToRemove);

      if (deleteError) {
        console.error("Erreur lors de la suppression de l'image :", deleteError);
        return;
      }

      // Mettre à jour l'état local
      const updatedImages = productData.images.filter((_: string, i: number) => i !== index);
      setProductData((prev: any) => ({
        ...prev,
        images: updatedImages
      }));

      // Mettre à jour image_url si l'image supprimée était la première
      if (index === 0 && updatedImages.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: updatedImages[0] })
          .eq('id', id);

        if (updateError) {
          console.error("Erreur lors de la mise à jour de image_url :", updateError);
        }
      } else if (updatedImages.length === 0) {
        // Si plus aucune image, mettre image_url à null
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: null })
          .eq('id', id);

        if (updateError) {
          console.error("Erreur lors de la mise à jour de image_url :", updateError);
        }
      }
    } catch (error) {
      console.error("Erreur complète lors de la suppression de l'image :", error);
    }
  };

  const handleCancel = () => {
    if (!productData) return;
    setFormData({
      name: productData.name,
      sellingPriceMin: productData.min_price || 0,
      sellingPriceMax: productData.max_price || 0,
      purchasePrice: productData.cost_price || 0,
      quantity: productData.current_stock || 0,
      promotion: productData.promotion || 0,
      category: productData.category || "",
      minQuantity: productData.min_stock_level || 0,
      maxQuantity: productData.max_stock_level || 100
    });
    setIsEditing(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!productData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Produit non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{productData.name}</h1>
              <p className="text-sm text-muted-foreground">Réf: {productData.sku || productData.barcode || "N/A"}</p>
            </div>
            
            {canEdit && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} className="gap-2">
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </>
                )}
              </div>
            )}
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
                    {isEditing && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="product-image-upload"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('product-image-upload')?.click()}
                          className="gap-2 bg-background/80 backdrop-blur-sm"
                        >
                          <Camera className="h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                    )}
                    <div className="embla__container flex h-full">
                      {productData.images && productData.images.length > 0 ? (
                        productData.images.map((image, index) => (
                          <div key={index} className="embla__slide flex-none w-full h-full relative">
                            <img
                              src={image}
                              alt={`${productData.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover bg-muted"
                            />
                            {isEditing && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeProductImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="embla__slide flex-none w-full h-full relative flex items-center justify-center bg-muted">
                          <p className="text-muted-foreground">Aucune image disponible</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Navigation buttons */}
                    {productData.images && productData.images.length > 1 && (
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
                  </div>
                </AspectRatio>
              </CardContent>
            </Card>

            {/* Image indicators */}
            {productData.images && productData.images.length > 1 && (
              <div className="flex justify-center gap-2">
                {productData.images.map((_, index) => (
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
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-foreground">{productData.name}</p>
                  )}
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <Label>Prix de vente</Label>
                  </div>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Prix minimum <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.sellingPriceMin}
                          onChange={(e) => setFormData({...formData, sellingPriceMin: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Prix maximum <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.sellingPriceMax}
                          onChange={(e) => setFormData({...formData, sellingPriceMax: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success">{(productData.sellingPriceMin || 0).toFixed(2)}€</p>
                        <p className="text-xs text-muted-foreground">Minimum</p>
                      </div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success">{(productData.sellingPriceMax || 0).toFixed(2)}€</p>
                        <p className="text-xs text-muted-foreground">Maximum</p>
                      </div>
                    </div>
                  )}
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
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
                        />
                      ) : (
                        <p className="text-xl font-semibold text-warning">{(productData.purchasePrice || 0).toFixed(2)}€</p>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Category */}
                <div className="space-y-2">
                  <Label>Catégorie <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Téléphonie">Téléphonie</SelectItem>
                        <SelectItem value="Informatique">Informatique</SelectItem>
                        <SelectItem value="Accessoires">Accessoires</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="w-fit">{productData.category || "Non spécifiée"}</Badge>
                  )}
                </div>

                <Separator />

                {/* Stock Management */}
                <div className="space-y-4">
                  <Label>Gestion du stock</Label>
                  
                  {/* Current Quantity */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quantité actuelle</span>
                      <span className="font-medium">{isEditing ? formData.quantity : productData.quantity}</span>
                    </div>
                    {isEditing && (
                      <Slider
                        value={[formData.quantity]}
                        onValueChange={([value]) => setFormData({...formData, quantity: value})}
                        max={formData.maxQuantity}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    )}
                  </div>

                  {/* Min/Max Quantities */}
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Stock minimum</Label>
                        <Input
                          type="number"
                          value={formData.minQuantity}
                          onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Stock maximum</Label>
                        <Input
                          type="number"
                          value={formData.maxQuantity}
                          onChange={(e) => setFormData({...formData, maxQuantity: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Min: {productData.minQuantity}</span>
                      <span>Max: {productData.maxQuantity}</span>
                    </div>
                  )}
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
                      <span className="font-medium">{isEditing ? formData.promotion : (productData.promotion || 0)}%</span>
                    </div>
                    {isEditing && (
                      <Slider
                        value={[formData.promotion]}
                        onValueChange={([value]) => setFormData({...formData, promotion: value})}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    )}
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fournisseur</p>
                    <p className="font-medium">{productData.supplier || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Emplacement</p>
                    <p className="font-medium">{productData.location || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Référence</p>
                    <p className="font-medium">{productData.ref || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    <Badge variant={(productData.status || "available") === "available" ? "default" : "destructive"}>
                      {(productData.status || "available") === "available" ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                </div>

                {productData.features && productData.features.length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Caractéristiques</p>
                    <div className="flex flex-wrap gap-2">
                      {productData.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {productData.description && productData.description.length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Description</p>
                    <p className="text-sm">{productData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}