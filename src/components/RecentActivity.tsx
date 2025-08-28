import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Receipt, Package, User, CreditCard, Package2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
  icon: any;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { company } = useCurrentCompany();

  useEffect(() => {
    if (user && company) {
      fetchRecentActivities();
    }
  }, [user, company]);

  const fetchRecentActivities = async () => {
    if (!user || !company) return;

    try {
      setLoading(true);

      // Récupérer les activités récentes pour l'entreprise sélectionnée
      const [salesData, clientsData, stockMovements] = await Promise.all([
        // Dernières ventes de l'entreprise sélectionnée
        supabase
          .from('sales')
          .select(`
            id,
            sale_number,
            total_amount,
            status,
            created_at,
            clients(first_name, last_name, company_name)
          `)
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(3),

        // Nouveaux clients de l'entreprise sélectionnée
        supabase
          .from('clients')
          .select('id, first_name, last_name, company_name, created_at')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(2),

        // Mouvements de stock récents
        supabase
          .from('stock_movements')
          .select(`
            id,
            movement_type,
            quantity,
            created_at,
            products(name)
          `)
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const recentActivities: Activity[] = [];

      // Ajouter les ventes
      salesData.data?.forEach(sale => {
        const clientName = sale.clients?.company_name || 
                          `${sale.clients?.first_name || ''} ${sale.clients?.last_name || ''}`.trim() || 
                          'Client anonyme';
        
        recentActivities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: 'Nouvelle vente',
          description: `${sale.sale_number} - ${clientName} - ${sale.total_amount} FCFA`,
          time: new Date(sale.created_at).toLocaleString('fr-FR'),
          status: sale.status,
          icon: Receipt
        });
      });

      // Ajouter les nouveaux clients
      clientsData.data?.forEach(client => {
        const clientName = client.company_name || 
                          `${client.first_name || ''} ${client.last_name || ''}`.trim() || 
                          'Client sans nom';
        
        recentActivities.push({
          id: `client-${client.id}`,
          type: 'client',
          title: 'Nouveau client',
          description: `${clientName} ajouté`,
          time: new Date(client.created_at).toLocaleString('fr-FR'),
          status: 'success',
          icon: User
        });
      });

      // Ajouter les mouvements de stock
      stockMovements.data?.forEach(movement => {
        recentActivities.push({
          id: `stock-${movement.id}`,
          type: 'stock',
          title: movement.movement_type === 'in' ? 'Stock entrant' : 'Stock sortant',
          description: `${movement.products?.name || 'Produit'} - ${movement.quantity} unités`,
          time: new Date(movement.created_at).toLocaleString('fr-FR'),
          status: movement.movement_type === 'in' ? 'success' : 'warning',
          icon: movement.movement_type === 'in' ? Package2 : Package
        });
      });

      // Trier par date de création (plus récent en premier)
      recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setActivities(recentActivities.slice(0, 8)); // Limiter à 8 activités

    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="modern-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Clock className="h-5 w-5" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="modern-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Clock className="h-5 w-5" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Aucune activité récente</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les activités apparaîtront ici au fur et à mesure
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <Clock className="h-5 w-5" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                activity.status === 'success' ? 'bg-success/20 border border-success/30' :
                activity.status === 'warning' ? 'bg-warning/20 border border-warning/30' :
                activity.status === 'completed' ? 'bg-success/20 border border-success/30' :
                'bg-primary/20 border border-primary/30'
              }`}>
                <IconComponent className={`h-5 w-5 ${
                  activity.status === 'success' ? 'text-success' :
                  activity.status === 'warning' ? 'text-warning' :
                  activity.status === 'completed' ? 'text-success' :
                  'text-primary'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm">{activity.title}</h4>
                  <Badge 
                    variant={
                      activity.status === 'success' || activity.status === 'completed' ? 'default' :
                      activity.status === 'warning' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {activity.status === 'completed' ? 'Terminé' :
                     activity.status === 'pending' ? 'En attente' :
                     activity.status === 'success' ? 'Succès' :
                     activity.status === 'warning' ? 'Attention' :
                     activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}