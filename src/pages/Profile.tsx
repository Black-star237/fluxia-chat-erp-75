import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  Camera,
  Key,
  Trash2
} from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadFile, uploading } = useFileUpload();

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    avatar_url: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    salesAlerts: true,
    stockAlerts: true,
    reportReminders: false
  });

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        avatar_url: data.avatar_url || ''
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const imageUrl = await uploadFile(file, 'avatars', user.id);
    if (imageUrl) {
      setProfileData({ ...profileData, avatar_url: imageUrl });
      await updateProfile({ avatar_url: imageUrl });
    }
  };

  const updateProfile = async (updates: Partial<typeof profileData>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
      return;
    }

    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const handleSaveProfile = async () => {
    await updateProfile(profileData);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Paramètres mis à jour",
      description: "Vos préférences ont été sauvegardées.",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} alt="Photo de profil" />
            <AvatarFallback className="text-lg">
              {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profileData.first_name} {profileData.last_name}
            </h1>
            <p className="text-muted-foreground">{profileData.position || 'Utilisateur'}</p>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={uploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Changer la photo'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de profil et préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Poste</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                    placeholder="Ex: Directeur des ventes"
                  />
                </div>

                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  Sauvegarder les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevez les notifications importantes par email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, emailNotifications: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevez les alertes urgentes par SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, smsNotifications: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Alertes de vente</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications pour les nouvelles ventes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.salesAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, salesAlerts: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Alertes de stock</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications quand un produit est en rupture
                      </p>
                    </div>
                    <Switch
                      checked={notifications.stockAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, stockAlerts: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Rappels de rapports</Label>
                      <p className="text-sm text-muted-foreground">
                        Rappels pour générer vos rapports mensuels
                      </p>
                    </div>
                    <Switch
                      checked={notifications.reportReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, reportReminders: checked})
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Gérez votre mot de passe et les paramètres de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>
                </div>

                <Button className="w-full md:w-auto">
                  <Key className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-destructive">Zone de danger</h3>
                  <p className="text-sm text-muted-foreground">
                    Ces actions sont irréversibles. Procédez avec prudence.
                  </p>
                  <Button variant="destructive" className="w-full md:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;