import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useForebitPolling } from "@/hooks/use-forebit-polling";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Pages
import AuthPage from "@/pages/AuthPage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import OrderDetailPageNew from "@/pages/OrderDetailPageNew";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import DepositPage from "@/pages/DepositPage";
import OrdersPage from "@/pages/OrdersPage";
import MyCodePage from "@/pages/MyCodePage";
import CartPage from "@/pages/CartPage";
import RanksPage from "@/pages/RanksPage";
import WorkerDashboardPage from "@/pages/WorkerDashboardPage";
import CardsPage from "@/pages/CardsPage";
import CheckerPage from "@/pages/CheckerPage";
import BecomeResellerPage from "@/pages/BecomeSellerPage";
import ProfilePage from "@/pages/ProfilePage";
import SupportPage from "@/pages/SupportPage";

function useFeatureRedirect(
  isOff: (f: any) => boolean,
  fallback: (f: any) => string,
) {
  const { data: features } = useQuery<any>({ queryKey: ["/api/settings/features"], staleTime: 60000 });
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (features && isOff(features)) setLocation(fallback(features));
  }, [features]);
  return features;
}

function HomeRedirect() {
  const features = useFeatureRedirect(
    f => f.logs === false,
    f => f.cards !== false ? "/cards" : "/deposit",
  );
  if (!features || features.logs === false) return null;
  return <ShopPage />;
}

function ShopRedirect() {
  const features = useFeatureRedirect(
    f => f.logs === false,
    f => f.cards !== false ? "/cards" : "/deposit",
  );
  if (!features || features.logs === false) return null;
  return <ShopPage />;
}

function CardsRedirect() {
  const features = useFeatureRedirect(
    f => f.cards === false,
    () => "/deposit",
  );
  if (!features || features.cards === false) return null;
  return <CardsPage />;
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  useForebitPolling();

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
        <Route path="/" component={HomeRedirect} />
        <Route path="/deposit" component={DepositPage} />
        <Route path="/shop" component={ShopRedirect} />
        <Route path="/product/:name" component={ProductDetailPage} />
        <Route path="/order/:id" component={OrderDetailPageNew} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/my-code" component={MyCodePage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/ranks" component={RanksPage} />
        <Route path="/worker" component={WorkerDashboardPage} />
        <Route path="/cards" component={CardsRedirect} />
        <Route path="/checker" component={CheckerPage} />
        <Route path="/become-reseller" component={BecomeResellerPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/support" component={SupportPage} />
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
