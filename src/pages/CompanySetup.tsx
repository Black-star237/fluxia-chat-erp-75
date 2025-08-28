import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Users, Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

const CompanySetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload();

  const handleFileChange = (file: File | null, type: 'logo' | 'banner') => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          setLogoFile(file);
          setLogoPreview(result);
        } else {
          setBannerFile(file);
          setBannerPreview(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (type === 'logo') {
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        setBannerFile(null);
        setBannerPreview(null);
      }
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) throw new Error('Non authentifié');

      let logoUrl = null;
      let bannerUrl = null;

      // Upload logo if provided
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'company-logos', user.id);
      }

      // Upload banner if provided
      if (bannerFile) {
        bannerUrl = await uploadFile(bannerFile, 'company-banners', user.id);
      }

      console.log('About to insert company with user ID:', user.id);

      // Step 1: Create company first (without members)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          description,
          address,
          phone,
          email,
          tax_number: taxNumber,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          created_by: user.id,
        })
        .select()
        .single();

      console.log('Company creation result:', { companyData, companyError });

      if (companyError) throw companyError;

      // Step 2: Add the creator as owner to company_members
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: companyData.id,
          user_id: user.id,
          role: 'owner',
          invited_by: user.id,
        });

      console.log('Member creation result:', { memberError });

      if (memberError) {
        console.error('Error adding user as company owner:', memberError);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Entreprise créée mais impossible d'ajouter les permissions. Contactez le support.",
        });
        return;
      }

      toast({
        title: "Entreprise créée",
        description: `${companyName} a été créée avec succès !`,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Full error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer l'entreprise",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Bienvenue sur FluxiaBiz !
            </h1>
            <p className="text-emerald-200/80 text-lg mb-8">
              Pour commencer, vous devez créer votre première entreprise ou rejoindre une entreprise existante.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-black/40 backdrop-blur-xl border-emerald-500/20 p-8 text-center hover:bg-black/50 transition-all cursor-pointer group">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Plus className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Créer une entreprise</h3>
              <p className="text-emerald-200/70 mb-6">
                Créez votre propre entreprise et invitez votre équipe à vous rejoindre
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Créer maintenant
              </Button>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-emerald-500/20 p-8 text-center hover:bg-black/50 transition-all cursor-pointer group opacity-50">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Rejoindre une entreprise</h3>
              <p className="text-emerald-200/70 mb-6">
                Utilisez un code d'invitation pour rejoindre une entreprise existante
              </p>
              <Button
                disabled
                className="w-full bg-gray-500 text-white cursor-not-allowed"
              >
                Bientôt disponible
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border-emerald-500/20">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Créer votre entreprise</h1>
            <p className="text-emerald-200/80">
              Configurez votre entreprise pour commencer à utiliser FluxiaBiz
            </p>
          </div>

          <form onSubmit={handleCreateCompany} className="space-y-6">
            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-2">
                Nom de l'entreprise *
              </label>
              <Input
                type="text"
                placeholder="Ex: Ma Super Entreprise"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                placeholder="Décrivez votre activité..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="contact@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-2">
                Adresse
              </label>
              <Textarea
                placeholder="Adresse complète de l'entreprise"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-2">
                Numéro fiscal
              </label>
              <Input
                type="text"
                placeholder="Numéro d'identification fiscale"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <Label className="block text-emerald-200 text-sm font-medium mb-2">
                Logo de l'entreprise
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <Image className="w-8 h-8 mb-2 text-emerald-300" />
                      )}
                      <p className="text-sm text-emerald-200">
                        {logoFile ? logoFile.name : "Cliquez pour choisir un logo"}
                      </p>
                      <p className="text-xs text-emerald-300/70">PNG, JPG, JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'logo')}
                    />
                  </label>
                </div>
                {logoFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange(null, 'logo')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Supprimer le logo
                  </Button>
                )}
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <Label className="block text-emerald-200 text-sm font-medium mb-2">
                Bannière de l'entreprise
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {bannerPreview ? (
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-24 h-16 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <Upload className="w-8 h-8 mb-2 text-emerald-300" />
                      )}
                      <p className="text-sm text-emerald-200">
                        {bannerFile ? bannerFile.name : "Cliquez pour choisir une bannière"}
                      </p>
                      <p className="text-xs text-emerald-300/70">PNG, JPG, JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'banner')}
                    />
                  </label>
                </div>
                {bannerFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange(null, 'banner')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Supprimer la bannière
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setIsCreating(false)}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Retour
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading || !companyName}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {loading || uploading 
                  ? (uploading ? "Upload en cours..." : "Création...") 
                  : "Créer l'entreprise"
                }
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CompanySetup;