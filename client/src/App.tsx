import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useCryptoPolling } from "@/hooks/use-crypto-polling";
import { useFeatureVisibility } from "@/hooks/use-feature-visibility";
import { useQuery } from "@tanstack/react-query";
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
import LinkPage from "@/pages/LinkPage";

function Router() {
  const { user, isLoading, isError, error, refetch } = useAuth();
  const { features } = useFeatureVisibility();
  const { data: creditBotStatus } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/telegram/status"],
    staleTime: 15000,
  });
  const [location, setLocation] = useLocation();
  useCryptoPolling();

  useEffect(() => {
    if (!isLoading && !isError && !user && location !== "/auth") {
      setLocation("/auth");
    }
  }, [user, isLoading, isError, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
        <div>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ff2939]" />
          <p className="text-sm font-semibold">Loading TurtleCC…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
        <div className="max-w-md">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#ff5a66] bg-[#2a1114] font-extrabold text-[#ff6973]">
            !
          </div>
          <h1 className="text-lg font-semibold">TurtleCC could not reach the server</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            The app is online, but its API is unavailable. Check the deployment database and environment settings, then retry.
          </p>
          <p className="mt-3 break-words text-xs text-white/40">
            {error instanceof Error ? error.message : "The authentication request failed."}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-6 rounded-xl border border-[#ff5a66] bg-[#ff2939] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e51f30]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={DepositPage} />
        <Route path="/deposit" component={DepositPage} />
        <Route path="/redeem" component={RedeemPage} />
        <Route path="/link">
          {() => creditBotStatus?.enabled === false ? <Redirect to="/deposit" /> : <LinkPage />}
        </Route>
        <Route path="/shop">{() => features.logs ? <Redirect to="/logs" /> : <Redirect to="/deposit" />}</Route>
        <Route path="/products">{() => features.logs ? <LogsPage /> : <Redirect to="/deposit" />}</Route>
        <Route path="/logs">{() => features.logs ? <LogsPage /> : <Redirect to="/deposit" />}</Route>
        <Route path="/product/:name">{() => features.logs ? <ProductDetailPage /> : <Redirect to="/deposit" />}</Route>
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
