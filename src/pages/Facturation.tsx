import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Eye, Download, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  issue_date: string;
  due_date?: string;
  total_amount: number;
  status: string;
  clients?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
}

export default function Facturation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
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

      // Récupérer les factures
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(first_name, last_name, company_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Erreur lors du chargement des factures');
        return;
      }

      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const clientName = invoice.clients?.company_name || 
                      `${invoice.clients?.first_name || ''} ${invoice.clients?.last_name || ''}`.trim() ||
                      'Client anonyme';
    
    return invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">Payée</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-warning border-warning">En attente</Badge>;
      case "overdue":
        return <Badge variant="destructive">En retard</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTotalAmount = () => {
    return invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  };

  const getPaidAmount = () => {
    return invoices
      .filter(invoice => invoice.status === "paid")
      .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  };

  const getClientName = (invoice: Invoice) => {
    if (invoice.clients?.company_name) return invoice.clients.company_name;
    return `${invoice.clients?.first_name || ''} ${invoice.clients?.last_name || ''}`.trim() || 'Client anonyme';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Facturation</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-2xl font-bold text-foreground">Facturation</h1>
          <p className="text-muted-foreground">Gérez vos factures et suivez les paiements</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/vente')}>
          <Plus className="h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Factures</p>
                <p className="text-xl font-bold">{getTotalAmount().toFixed(0)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payées</p>
                <p className="text-xl font-bold text-success">{getPaidAmount().toFixed(0)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-xl font-bold text-warning">{(getTotalAmount() - getPaidAmount()).toFixed(0)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtres</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune facture trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {invoices.length === 0 
                ? "Commencez par créer votre première facture"
                : "Aucune facture ne correspond à vos critères de recherche"
              }
            </p>
            {invoices.length === 0 && (
              <Button onClick={() => navigate('/vente')}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une facture
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{invoice.invoice_number}</h3>
                        <p className="text-sm text-muted-foreground">{getClientName(invoice)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {getStatusBadge(invoice.status)}
                      <span className="text-muted-foreground">
                        Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                      </span>
                      {invoice.due_date && (
                        <span className="text-muted-foreground">
                          Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {(invoice.total_amount || 0).toFixed(0)} FCFA
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
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