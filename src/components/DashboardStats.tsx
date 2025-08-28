import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, Users, Euro, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
  color: "success" | "primary" | "warning";
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStat[]>([
    {
      title: "Chiffre d'Affaires",
      value: "0 FCFA",
      change: "0%",
      trend: "up",
      icon: Euro,
      color: "success"
    },
    {
      title: "Commandes",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Package,
      color: "primary"
    },
    {
      title: "Clients Actifs",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Users,
      color: "primary"
    },
    {
      title: "Alerts Stock",
      value: "0",
      change: "0",
      trend: "down",
      icon: AlertTriangle,
      color: "warning"
    }
  ]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { company } = useCurrentCompany();

  useEffect(() => {
    if (user && company) {
      fetchDashboardStats();
    }
  }, [user, company]);

  const fetchDashboardStats = async () => {
    if (!user || !company) return;

    try {
      setLoading(true);

      // Récupérer les statistiques en parallèle pour l'entreprise sélectionnée
      const [salesData, clientsData, alertsData] = await Promise.all([
        // Chiffre d'affaires du mois actuel
        supabase
          .from('sales')
          .select('total_amount')
          .eq('company_id', company.id)
          .eq('status', 'completed')
          .gte('sale_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

        // Nombre de clients actifs
        supabase
          .from('clients')
          .select('id')
          .eq('company_id', company.id)
          .eq('is_active', true),

        // Alertes de stock de l'entreprise
        supabase
          .from('inventory_alerts')
          .select('id')
          .eq('company_id', company.id)
          .eq('is_resolved', false)
      ]);

      // Calculer le chiffre d'affaires
      const totalRevenue = salesData.data?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      
      // Compter les commandes
      const totalOrders = salesData.data?.length || 0;
      
      // Compter les clients actifs
      const activeClients = clientsData.data?.length || 0;
      
      // Compter les alertes
      const stockAlerts = alertsData.data?.length || 0;

      setStats([
        {
          title: "Chiffre d'Affaires",
          value: `${totalRevenue.toLocaleString()} FCFA`,
          change: "+0%", // TODO: Calculer le pourcentage par rapport au mois précédent
          trend: "up",
          icon: Euro,
          color: "success"
        },
        {
          title: "Commandes",
          value: totalOrders.toString(),
          change: "+0%", // TODO: Calculer le pourcentage
          trend: "up",
          icon: Package,
          color: "primary"
        },
        {
          title: "Clients Actifs",
          value: activeClients.toString(),
          change: "+0%", // TODO: Calculer le pourcentage
          trend: "up",
          icon: Users,
          color: "primary"
        },
        {
          title: "Alerts Stock",
          value: stockAlerts.toString(),
          change: "0",
          trend: "down",
          icon: AlertTriangle,
          color: "warning"
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title} className="modern-card hover-lift relative overflow-hidden">
            {/* Mobile Layout */}
            <div className="sm:hidden p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  stat.color === 'success' ? 'bg-success/20 border border-success/30' :
                  stat.color === 'warning' ? 'bg-warning/20 border border-warning/30' :
                  'bg-primary/20 border border-primary/30'
                }`}>
                  <IconComponent className={`h-5 w-5 ${
                    stat.color === 'success' ? 'text-success' :
                    stat.color === 'warning' ? 'text-warning' :
                    'text-primary'
                  }`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="flex items-center gap-1">
                <span className={`status-pill ${
                  stat.trend === 'up' ? 'status-success' : 'bg-destructive/20 text-destructive border border-destructive/30'
                }`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {stat.change}
                </span>
                <span className="text-muted-foreground text-xs ml-1">ce mois</span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  stat.color === 'success' ? 'bg-success/20 border border-success/30' :
                  stat.color === 'warning' ? 'bg-warning/20 border border-warning/30' :
                  'bg-primary/20 border border-primary/30'
                }`}>
                  <IconComponent className={`h-6 w-6 ${
                    stat.color === 'success' ? 'text-success' :
                    stat.color === 'warning' ? 'text-warning' :
                    'text-primary'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-3">
                  {stat.value}
                </div>
                <div className="flex items-center">
                  <span className={`status-pill ${
                    stat.trend === 'up' ? 'status-success' : 'bg-destructive/20 text-destructive border border-destructive/30'
                  }`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">ce mois</span>
                </div>
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
}