
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Plus, FileText, Package, Users, MessageSquare } from "lucide-react";
import { useCompanyNavigation } from "@/hooks/useCompanyNavigation";

const actions = [
  {
    title: "Nouvelle Facture",
    description: "Créer une facture rapidement",
    icon: FileText,
    color: "primary",
    href: "/facturation/nouvelle"
  },
  {
    title: "Ajouter Produit",
    description: "Nouveau produit au stock",
    icon: Package,
    color: "success",
    href: "/stocks/nouveau"
  },
  {
    title: "Nouveau Client",
    description: "Ajouter un client",
    icon: Users,
    color: "primary",
    href: "/clients/nouveau"
  },
  {
    title: "Assistant IA",
    description: "Poser une question",
    icon: MessageSquare,
    color: "warning",
    href: "/assistant"
  }
];

export function QuickActions() {
  const { navigateTo } = useCompanyNavigation();
  return (
    <Card className="modern-card hover-lift">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1 sm:-ml-2">
            {actions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <CarouselItem key={action.title} className="pl-1 sm:pl-2 basis-[140px] sm:basis-[160px]">
                  <Button
                    variant="outline"
                    className="h-auto w-full p-4 flex flex-col items-center gap-3 hover-lift glass-effect border-border/30"
                    onClick={() => navigateTo(action.href)}
                  >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        action.color === 'success' ? 'bg-success/20 border border-success/30' :
                        action.color === 'warning' ? 'bg-warning/20 border border-warning/30' :
                        'bg-primary/20 border border-primary/30'
                      }`}>
                        <IconComponent className={`h-7 w-7 ${
                          action.color === 'success' ? 'text-success' :
                          action.color === 'warning' ? 'text-warning' :
                          'text-primary'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm leading-tight">{action.title}</div>
                      </div>
                  </Button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  );
}
