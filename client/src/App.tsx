import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useCryptoPolling } from "@/hooks/use-crypto-polling";
import { useFeatureVisibility } from "@/hooks/use-feature-visibility";
import { useEffect } from "react";

// Pages
import AuthPage from "@/pages/AuthPage";
import OrderDetailPageNew from "@/pages/OrderDetailPageNew";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import DepositPage from "@/pages/DepositPage";
import OrdersPage from "@/pages/OrdersPage";
import RanksPage from "@/pages/RanksPage";
import CardsPage from "@/pages/CardsPage";
import SupportPage from "@/pages/SupportPage";
import PlinkoGamePage from "@/pages/PlinkoGamePage";
import RoutingCatalogPage from "@/pages/RoutingCatalogPage";
import LogsPage from "@/pages/LogsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import RedeemPage from "@/pages/RedeemPage";

function Router() {
  const { user, isLoading } = useAuth();
  const { features } = useFeatureVisibility();
  const [location, setLocation] = useLocation();
  useCryptoPolling();

  useEffect(() => {
    if (!isLoading && !user && location !== "/auth") {
      setLocation("/auth");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return null;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={DepositPage} />
        <Route path="/deposit" component={DepositPage} />
        <Route path="/redeem" component={RedeemPage} />
        <Route path="/shop"><Redirect to="/logs" /></Route>
        <Route path="/products" component={LogsPage} />
        <Route path="/logs" component={LogsPage} />
        <Route path="/product/:name" component={ProductDetailPage} />
        <Route path="/order/:id" component={OrderDetailPageNew} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/ranks">{() => features.ranks ? <RanksPage /> : <Redirect to="/deposit" />}</Route>
        <Route path="/cards">{() => features.cards ? <CardsPage /> : <Redirect to="/deposit" />}</Route>
        <Route path="/routings"><Redirect to="/deposit" /></Route>
        <Route path="/support" component={SupportPage} />
        <Route path="/plinko" component={PlinkoGamePage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
