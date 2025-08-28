import { useState, useEffect } from "react";
import { Plus, Search, UserPlus, Crown, Shield, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
    avatar_url?: string;
  };
}

export default function Equipe() {
  const { user } = useAuth();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
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

      // Récupérer tous les membres de l'entreprise
      const { data: membersData, error } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', companyId)
        .order('joined_at');

      if (error) {
        console.error('Error fetching team members:', error);
        toast.error('Erreur lors du chargement de l\'équipe');
        return;
      }

      setTeamMembers(membersData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const memberName = `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim();
    const memberEmail = member.profiles?.email || '';
    
    return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "manager":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "manager":
        return "Manager";
      default:
        return "Employé";
    }
  };

  const getStatusBadge = (is_active: boolean) => {
    return (
      <Badge variant={is_active ? "default" : "secondary"}>
        {is_active ? "Actif" : "Inactif"}
      </Badge>
    );
  };

  const getMemberName = (member: TeamMember) => {
    const name = `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim();
    return name || member.profiles?.email || 'Membre sans nom';
  };

  const activeMembers = teamMembers.filter(m => m.is_active);
  const managers = teamMembers.filter(m => m.role === 'manager');
  const owners = teamMembers.filter(m => m.role === 'owner');

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Équipe</h1>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Équipe</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Gérez les membres de votre équipe et leurs permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{teamMembers.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Membres totaux</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{activeMembers.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Membres actifs</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{managers.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Managers</p>
          </CardContent>
        </Card>
        <Card className="modern-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">{owners.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Propriétaires</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un membre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Members List */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {teamMembers.length === 0 ? "Aucun membre" : "Aucun résultat"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {teamMembers.length === 0 
                ? "Commencez par inviter des membres à votre équipe"
                : "Aucun membre ne correspond à vos critères"
              }
            </p>
            {teamMembers.length === 0 && (
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter un membre
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="modern-card hover-lift">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getMemberName(member).split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {getMemberName(member)}
                        </h3>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {member.profiles?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getRoleLabel(member.role)}
                        </Badge>
                        {getStatusBadge(member.is_active)}
                      </div>
                      <div className="mt-2 sm:hidden">
                        <p className="text-xs text-muted-foreground">
                          Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2 sm:gap-1">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-muted-foreground">
                        Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto sm:mt-2">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        Modifier
                      </Button>
                      {member.role !== "owner" && (
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex-1 sm:flex-none">
                          <span className="hidden xs:inline">Supprimer</span>
                          <span className="xs:hidden">Suppr.</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
);
}