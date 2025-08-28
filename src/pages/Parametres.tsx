import { useState, useEffect, useRef } from "react";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, Upload } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function Parametres() {
  const { company, loading } = useCurrentCompany();
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    banner_url: "",
  });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        website: (company as any)?.website || "",
        logo_url: company.logo_url || "",
        banner_url: company.banner_url || "",
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file || !company) return;

    try {
      const publicUrl = await uploadFile(file, "company-assets", `logos/${company.id}`);
      if (publicUrl) {
        setFormData(prev => ({ ...prev, logo_url: publicUrl }));
        toast({
          title: "Succès",
          description: "Logo téléversé avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de téléverser le logo.",
        variant: "destructive",
      });
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file || !company) return;

    try {
      const publicUrl = await uploadFile(file, "company-assets", `banners/${company.id}`);
      if (publicUrl) {
        setFormData(prev => ({ ...prev, banner_url: publicUrl }));
        toast({
          title: "Succès",
          description: "Bannière téléversée avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de téléverser la bannière.",
        variant: "destructive",
      });
    }
  };

  const triggerLogoUpload = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const triggerBannerUpload = () => {
    if (bannerInputRef.current) {
      bannerInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      const { error } = await supabase
        .from("companies")
        .update(formData)
        .eq("id", company.id);

      if (error) throw error;

      window.location.reload();
      toast({
        title: "Succès",
        description: "Les paramètres de l'entreprise ont été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Paramètres de l'entreprise</h1>
      </div>

      {/* Logo et Bannière */}
      <Card>
        <CardHeader>
          <CardTitle>Identité visuelle</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-4">
            <Label>Logo</Label>
            <div className="flex flex-col items-center gap-4">
              {formData.logo_url ? (
                <img
                  src={formData.logo_url}
                  alt="Logo actuel"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <span className="text-gray-400">Aucun logo</span>
                </div>
              )}
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                onClick={triggerLogoUpload}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Téléversement..." : "Téléverser un logo"}
              </Button>
            </div>
          </div>

          {/* Bannière */}
          <div className="space-y-4">
            <Label>Bannière</Label>
            <div className="flex flex-col items-center gap-4">
              {formData.banner_url ? (
                <img
                  src={formData.banner_url}
                  alt="Bannière actuelle"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <span className="text-gray-400">Aucune bannière</span>
                </div>
              )}
              <input
                type="file"
                ref={bannerInputRef}
                onChange={handleBannerUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                onClick={triggerBannerUpload}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Téléversement..." : "Téléverser une bannière"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="mt-4">
              Enregistrer les modifications
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}