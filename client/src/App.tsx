import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useCryptoPolling } from "@/hooks/use-crypto-polling";
import { useEffect } from "react";

// Pages
import AuthPage from "@/pages/AuthPage";
import OrderDetailPageNew from "@/pages/OrderDetailPageNew";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import DepositPage from "@/pages/DepositPage";
import OrdersPage from "@/pages/OrdersPage";
import CartPage from "@/pages/CartPage";
import RanksPage from "@/pages/RanksPage";
import CardsPage from "@/pages/CardsPage";
import SupportPage from "@/pages/SupportPage";
import PlinkoGamePage from "@/pages/PlinkoGamePage";
import RoutingCatalogPage from "@/pages/RoutingCatalogPage";

function CardsRedirect() {
  return <CardsPage />;
}

function Router() {
  const { user, isLoading } = useAuth();
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
        <Route path="/shop"><Redirect to="/cards" /></Route>
        <Route path="/order/:id" component={OrderDetailPageNew} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/ranks" component={RanksPage} />
        <Route path="/cards" component={CardsRedirect} />
        <Route path="/routings" component={RoutingCatalogPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/plinko" component={PlinkoGamePage} />
        <Route path="/admin">
          {() => <AdminPage />}
        </Route>
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
