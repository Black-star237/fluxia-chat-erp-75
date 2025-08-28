
import { DashboardStats } from "@/components/DashboardStats";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import heroImage from "@/assets/fluxiabiz-hero.jpg";
import bestSellingImage from "@/assets/best-selling-products.jpg";
import supplierOrdersImage from "@/assets/supplier-orders.jpg";
import analyticsImage from "@/assets/analytics-reports.jpg";
import automationImage from "@/assets/automation.jpg";

const heroSlides = [
  {
    title: "Bienvenue sur Fluxiabiz",
    description: "Votre ERP intelligent pour une gestion d'entreprise simplifiée",
    image: heroImage,
    gradient: "bg-gradient-primary"
  },
  {
    title: "Produits les Plus Vendus",
    description: "Analysez vos performances commerciales en temps réel",
    image: bestSellingImage,
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-600"
  },
  {
    title: "Commandes Fournisseurs",
    description: "Gérez vos approvisionnements et optimisez votre stock",
    image: supplierOrdersImage,
    gradient: "bg-gradient-to-br from-orange-500 to-red-600"
  },
  {
    title: "Rapports Analytiques",
    description: "Prenez des décisions éclairées avec nos tableaux de bord",
    image: analyticsImage,
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600"
  },
  {
    title: "Automatisation Intelligente",
    description: "Gagnez du temps avec notre IA intégrée",
    image: automationImage,
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600"
  }
];

const Index = () => {
  const { company } = useCurrentCompany();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Company Welcome Message */}
      {company && (
        <div className="bg-gradient-card rounded-lg p-4 border border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Espace {company.name}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Bienvenue dans votre espace de gestion d'entreprise
          </p>
        </div>
      )}
      {/* Hero Carousel Section */}
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
      {heroSlides.map((slide, index) => (
        <CarouselItem key={index}>
          <div className="modern-card hover-lift relative overflow-hidden p-6 text-foreground min-h-[180px] sm:min-h-[220px] bg-gradient-card">
            <div className="absolute inset-0 opacity-5">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 leading-tight text-foreground">
                {slide.title}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>
        </CarouselItem>
      ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10" />
          <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10" />
        </Carousel>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Two Column Layout - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Index;
