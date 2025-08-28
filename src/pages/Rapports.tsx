import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  FileText,
  Calendar,
  Award,
  AlertTriangle,
  Eye
} from "lucide-react";

// Mock data for charts
const salesData = [
  { month: "Jan", sales: 4000, revenue: 120000 },
  { month: "Fév", sales: 3000, revenue: 98000 },
  { month: "Mar", sales: 5000, revenue: 150000 },
  { month: "Avr", sales: 4500, revenue: 135000 },
  { month: "Mai", sales: 6000, revenue: 180000 },
  { month: "Juin", sales: 5500, revenue: 165000 },
];

const topProducts = [
  { name: "iPhone 15", sales: 234, revenue: 234000, color: "hsl(var(--primary))" },
  { name: "Samsung Galaxy", sales: 189, revenue: 189000, color: "hsl(var(--success))" },
  { name: "MacBook Pro", sales: 145, revenue: 290000, color: "hsl(var(--warning))" },
  { name: "iPad", sales: 123, revenue: 98400, color: "hsl(var(--accent))" },
];

const sellersData = [
  { name: "Marie Dubois", sales: 89, revenue: 267000, clients: 45, rank: 1 },
  { name: "Jean Martin", sales: 76, revenue: 228000, clients: 38, rank: 2 },
  { name: "Sophie Leclerc", sales: 68, revenue: 204000, clients: 34, rank: 3 },
  { name: "Paul Durand", sales: 52, revenue: 156000, clients: 28, rank: 4 },
];

const kpiData = [
  {
    title: "Chiffre d'affaires",
    value: "1,2M FCFA",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "success"
  },
  {
    title: "Nombre de ventes",
    value: "2,845",
    change: "+8.2%",
    trend: "up",
    icon: TrendingUp,
    color: "primary"
  },
  {
    title: "Stocks faibles",
    value: "23",
    change: "-15%",
    trend: "down",
    icon: Package,
    color: "warning"
  },
  {
    title: "Factures impayées",
    value: "8",
    change: "+3",
    trend: "up",
    icon: FileText,
    color: "destructive"
  }
];

const lowStockProducts = [
  { name: "iPhone 15 Pro", stock: 3, minStock: 10, status: "critical" },
  { name: "Samsung S24", stock: 7, minStock: 15, status: "warning" },
  { name: "AirPods Pro", stock: 12, minStock: 20, status: "warning" },
];

const unpaidInvoices = [
  { id: "INV-001", client: "Tech Solutions", amount: 45000, dueDate: "2024-01-15", daysOverdue: 5 },
  { id: "INV-002", client: "Digital Corp", amount: 78000, dueDate: "2024-01-10", daysOverdue: 10 },
  { id: "INV-003", client: "StartupXYZ", amount: 32000, dueDate: "2024-01-20", daysOverdue: 0 },
];

const chartConfig = {
  sales: { color: "hsl(var(--primary))" },
  revenue: { color: "hsl(var(--success))" },
};

export default function Rapports() {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [selectedMetric, setSelectedMetric] = useState("sales");

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-success" : "text-destructive";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "warning": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 p-3 sm:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Rapports & Analytics</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Tableau de bord des performances et statistiques</p>
        </div>
        
        <div className="w-full">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full h-11 text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="this-week">Cette semaine</SelectItem>
              <SelectItem value="this-month">Ce mois</SelectItem>
              <SelectItem value="this-quarter">Ce trimestre</SelectItem>
              <SelectItem value="this-year">Cette année</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const TrendIcon = getTrendIcon(kpi.trend);
          
          return (
            <Card key={index} className="modern-card hover-lift">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between space-y-0 pb-1 sm:pb-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{kpi.title}</p>
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="flex items-center text-xs">
                    <TrendIcon className={`h-3 w-3 mr-1 flex-shrink-0 ${getTrendColor(kpi.trend)}`} />
                    <span className={getTrendColor(kpi.trend)}>{kpi.change}</span>
                    <span className="text-muted-foreground ml-1 hidden sm:inline">vs mois précédent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-2">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm py-2 px-2">Produits</TabsTrigger>
          <TabsTrigger value="sellers" className="text-xs sm:text-sm py-2 px-2">Vendeurs</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs sm:text-sm py-2 px-2">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
            {/* Sales Evolution Chart */}
            <Card className="modern-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Évolution des ventes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Performances commerciales sur 6 mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickMargin={8}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickMargin={8}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="modern-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Chiffre d'affaires</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Revenus générés par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickMargin={8}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickMargin={8}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--success))" 
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
            {/* Top Products Chart */}
            <Card className="modern-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Produits les plus vendus</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Top 4 des meilleures ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProducts}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="sales"
                      >
                        {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Products Performance */}
            <Card className="modern-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Performance produits</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Détails des ventes et revenus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: product.color }}></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} ventes</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-xs sm:text-sm">{product.revenue.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-3 sm:space-y-4">
          <Card className="modern-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Classement des vendeurs</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Performance de l'équipe commerciale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {sellersData.map((seller, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full font-bold text-xs sm:text-sm flex-shrink-0">
                        {seller.rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{seller.name}</p>
                        <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-muted-foreground">
                          <span>{seller.sales} ventes</span>
                          <span className="hidden sm:inline">{seller.clients} clients</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="flex items-center">
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">{seller.revenue.toLocaleString()} FCFA</p>
                        </div>
                        {seller.rank === 1 && <Award className="h-3 w-3 sm:h-4 sm:w-4 text-warning ml-1 sm:ml-2 flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
            {/* Low Stock Alerts */}
            <Card className="modern-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning mr-2" />
                  Stocks faibles
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Produits nécessitant un réapprovisionnement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {lowStockProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-accent/50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                    </div>
                    <Badge variant={getStatusColor(product.status) as any} className="ml-2 text-xs">
                      {product.status === "critical" ? "Critique" : "Attention"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Unpaid Invoices */}
            <Card className="modern-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-destructive mr-2" />
                  Factures impayées
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Créances en attente de paiement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {unpaidInvoices.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-accent/50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm">{invoice.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{invoice.client}</p>
                      {invoice.daysOverdue > 0 && (
                        <p className="text-xs text-destructive">{invoice.daysOverdue}j retard</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-xs sm:text-sm">{invoice.amount.toLocaleString()} FCFA</p>
                      <Button size="sm" variant="outline" className="mt-1 h-7 px-2 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Voir</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}