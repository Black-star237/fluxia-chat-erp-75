import React, { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Stocks from "./pages/Stocks";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import Facturation from "./pages/Facturation";
import Entreprises from "./pages/Entreprises";
import Equipe from "./pages/Equipe";
import Promotions from "./pages/Promotions";
import Categories from "./pages/Categories";
import Rapports from "./pages/Rapports";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Vente from "./pages/Vente";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";
import CompanySetup from "./pages/CompanySetup";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";

// Lazy load heavy IA page
const AssistantIA = React.lazy(() => import("./pages/AssistantIA"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/stocks" element={<Layout><Stocks /></Layout>} />
              <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
              <Route path="/facturation" element={<Layout><Facturation /></Layout>} />
              <Route path="/entreprises" element={<Layout><Entreprises /></Layout>} />
              <Route path="/equipe" element={<Layout><Equipe /></Layout>} />
              <Route path="/promotions" element={<Layout><Promotions /></Layout>} />
              <Route path="/categories" element={<Layout><Categories /></Layout>} />
              <Route path="/rapports" element={<Layout><Rapports /></Layout>} />
              <Route path="/clients" element={<Layout><Clients /></Layout>} />
              <Route path="/client/:id" element={<Layout><ClientDetail /></Layout>} />
              <Route path="/vente" element={<Layout><Vente /></Layout>} />
              <Route path="/parametres" element={<Layout><Parametres /></Layout>} />
              <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/company-setup" element={<CompanySetup />} />
              <Route
                path="/assistant-ia"
                element={
                  <Suspense fallback={<div>Chargement de l'assistant IA...</div>}>
                    <Layout><AssistantIA /></Layout>
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <PwaInstallPrompt />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;