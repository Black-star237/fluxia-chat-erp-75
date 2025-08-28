import { useState, useEffect } from "react";
import { Plus, Building2, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CompanySetup from "./CompanySetup";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  role: string;
  members: number;
  status: string;
}

export default function Entreprises() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserCompanies();
    }
  }, [user]);

  const fetchUserCompanies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer les entreprises où l'utilisateur est membre
      const { data: membershipData, error: membershipError } = await supabase
        .from('company_members')
        .select(`
          role,
          is_active,
          company_id,
          companies(
            id,
            name,
            logo_url,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (membershipError) {
        console.error('Error fetching companies:', membershipError);
        toast.error('Erreur lors du chargement des entreprises');
        return;
      }

      // Transformer les données pour le format attendu
      const formattedCompanies: Company[] = membershipData?.filter(membership => membership.companies && typeof membership.companies === 'object').map(membership => {
        const company = membership.companies as any;
        return {
          id: company.id,
          name: company.name,
          logo_url: company.logo_url,
          role: membership.role === 'owner' ? 'Propriétaire' : 
                membership.role === 'manager' ? 'Manager' : 'Employé',
          members: 0, // Sera mis à jour avec une requête séparée si nécessaire
          status: company.is_active ? 'active' : 'inactive'
        };
      }) || [];

      setCompanies(formattedCompanies);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = () => {
    setShowCreateDialog(false);
    fetchUserCompanies();
    toast.success('Entreprise créée avec succès!');
  };

  const handleAccessCompany = (companyId: string) => {
    // Rediriger vers le dashboard de l'entreprise ou définir l'entreprise active
    navigate(`/?company=${companyId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes Entreprises</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Entreprises</h1>
          <p className="text-muted-foreground">Gérez vos entreprises et organisations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <JoinCompanyDialog onRequestSent={fetchUserCompanies} />
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer une entreprise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>Créer une nouvelle entreprise</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-60px)] p-6 pt-0">
                <CompanySetup />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={`Logo ${company.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={company.role === "Propriétaire" ? "default" : company.role === "Manager" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {company.role}
                      </Badge>
                      <Badge 
                        variant={company.status === "active" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {company.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{company.members} membres</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => handleAccessCompany(company.id)}
                >
                  Accéder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add New Company Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 border-muted-foreground/20 hover:border-primary/50">
          <CardContent className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Nouvelle entreprise</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Créez une nouvelle entreprise ou rejoignez une existante
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Créer
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button variant="outline" size="sm" className="w-full">
                Rejoindre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{companies.length}</p>
                <p className="text-sm text-muted-foreground">Entreprises</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {companies.reduce((acc, company) => acc + company.members, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Membres totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {companies.filter(c => c.role === "Propriétaire").length}
                </p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InvitationsReceived />
          <InvitationsSent />
        </div>
      </div>

      {/* Membership Requests Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Demandes d'adhésion</h2>
        <MembershipRequests />
      </div>
    </div>
  );
}