import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, CreditCard, ReceiptText, Coins, Crown } from "lucide-react";
import { Link } from "wouter";

type TabType = "all" | "cards" | "ach";

const rankLabels: Record<string, string> = {
  newbie: "Newbie",
  regular: "Regular",
  vip: "VIP",
  nyc: "NYC",
};

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function isAchOrder(order: any): boolean {
  return (order.orderId ?? "").startsWith("ACH-");
}

function isCardOrder(order: any): boolean {
  return (
    (order.orderId ?? "").startsWith("CARD-") ||
    (!isAchOrder(order) && (order.items ?? []).some((i: any) => i.itemType === "card" || i.cardId != null))
  );
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    fulfilled: { label: "FULFILLED", cls: "bg-green-900/40 text-green-400" },
    delivering: { label: "FULFILLED", cls: "bg-green-900/40 text-green-400" },
    pending: { label: "PENDING", cls: "bg-yellow-900/40 text-yellow-400" },
    waiting_payment: { label: "UNPAID", cls: "bg-orange-900/40 text-orange-400" },
    refunded: { label: "REFUNDED", cls: "bg-red-900/40 text-red-400" },
    replaced: { label: "REPLACED", cls: "bg-blue-900/40 text-blue-400" },
  };
  const entry = map[status] ?? { label: status?.toUpperCase() ?? "—", cls: "bg-[#0d0d0d] text-white/45" };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useOrders();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");

  const { data: rankData } = useQuery<{ rank: string; discountPct: number; totalDeposited: number }>({
    queryKey: ["/api/user/rank"],
    enabled: !!user,
  });

  const totalDepositsCents = rankData?.totalDeposited ?? 0;
  const tier = {
    label: rankLabels[rankData?.rank ?? "newbie"] ?? "Newbie",
    discount: `${rankData?.discountPct ?? 0}% off`,
  };
  const allOrders = orders ?? [];

  const cardOrders = useMemo(() => allOrders.filter(isCardOrder), [allOrders]);
  const achOrders = useMemo(() => allOrders.filter(isAchOrder), [allOrders]);
  const tabOrders = tab === "cards" ? cardOrders : tab === "ach" ? achOrders : allOrders;

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return tabOrders;
    const q = search.toLowerCase();
    return tabOrders.filter((o: any) =>
      (o.orderId ?? "").toLowerCase().includes(q) ||
      (o.status ?? "").toLowerCase().includes(q)
    );
  }, [tabOrders, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-red-400">
        Failed to load orders. Please refresh.
      </div>
    );
  }

  const now = new Date();

  const tabs: { key: TabType; label: string; count: number; href?: string }[] = [
    { key: "all", label: "all", count: allOrders.length },
    { key: "cards", label: "cards", count: cardOrders.length, href: "/cards" },
    ...(achOrders.length > 0 ? [{ key: "ach" as TabType, label: "ach", count: achOrders.length }] : []),
  ];

  return (
    <div className="pixel-page space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl leading-relaxed text-white sm:text-2xl">ORDER HISTORY</h1>
          <p className="mt-2 font-mono text-[10px] text-white/45">{formatDateTime(now)}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link href="/deposit">
            <span className="pixel-button inline-flex items-center gap-1.5 px-2.5 py-2 text-[8px]">
              <Coins className="h-3 w-3" /> ADD BALANCE
            </span>
          </Link>
          <Link href="/ranks">
            <span className="pixel-button inline-flex items-center gap-1.5 px-2.5 py-2 text-[8px]">
              <Crown className="h-3 w-3" /> RANKS
            </span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b-[3px] border-[#e5be35] overflow-x-auto pt-1">
        {tabs.map(t => (
          <div key={t.key} className="flex items-center gap-1 mr-4">
            <button
              onClick={() => setTab(t.key)}
              className={`px-1 pb-2 text-xs transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "text-[#ffe177] border-[#ffe177] pixel-text text-[8px]"
                  : "text-white/40 border-transparent hover:text-white/60"
              }`}
              data-testid={`tab-${t.key}`}
            >
              {t.label} <span className="text-white/40">{t.count}</span>
            </button>
            {t.href && (
              <Link href={t.href}>
                <span className="text-[9px] pb-2 -mb-px text-green-600 hover:text-green-700 cursor-pointer font-mono underline underline-offset-2 transition-colors" data-testid={`link-shop-${t.key}`}>
                  shop →
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="search orders..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="pixel-input max-w-sm"
        data-testid="input-search-orders"
      />

      {/* Order list */}
      {filteredOrders.length === 0 ? (
        <div className="pixel-panel bg-[#10215e] px-5 py-14 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-[#ffe177]" />
          <h2 className="mt-5 text-sm leading-relaxed text-white">NO ORDERS YET</h2>
          <p className="mx-auto mt-3 max-w-md text-xs text-white/55">When you buy cards or top up, your activity will show up here.</p>
          <div className="mt-5 flex justify-center">
            <Link href="/cards"><span className="pixel-button inline-flex items-center gap-2 px-3 py-3 text-[8px]"><CreditCard className="h-3 w-3" />BROWSE CARDS</span></Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order: any) => {
            const isCard = isCardOrder(order);
            const isFulfilled = order.status === "fulfilled" || order.status === "delivering" || order.status === "replaced";
            return (
              <button
                key={order.id}
                onClick={() => setLocation(`/order/${order.orderId}`)}
                className="w-full text-left border-[3px] border-black bg-[#10215e] px-4 py-3 hover:bg-[#19377e] transition-all"
                data-testid={`btn-order-${order.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-mono text-white/40 truncate">#{order.orderId}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${isCard ? "bg-blue-900/30 text-blue-400" : isAchOrder(order) ? "bg-cyan-900/30 text-cyan-400" : "bg-purple-900/30 text-purple-400"}`}>
                        {isCard ? "card" : isAchOrder(order) ? "ach" : "order"}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] text-white/30 font-mono">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US") : ""}
                    </p>
                  </div>
                  <div className="text-right space-y-1 flex-shrink-0">
                    {statusBadge(order.status)}
                    <p className="text-sm font-mono text-white">${(order.total / 100).toFixed(2)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
