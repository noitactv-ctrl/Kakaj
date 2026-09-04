import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, ReceiptText, Coins, Crown } from "lucide-react";
import { Link } from "wouter";

type TabType = "all" | "logs" | "cards" | "ach";

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
  return (order.orderId ?? "").startsWith("ACH-") ||
    (order.items ?? []).some((item: any) => item.itemType === "ach");
}

function isCardOrder(order: any): boolean {
  return (
    (order.orderId ?? "").startsWith("CARD-") ||
    (!isAchOrder(order) && (order.items ?? []).some((i: any) => i.itemType === "card" || i.cardId != null))
  );
}

function isLogOrder(order: any): boolean {
  return (order.items ?? []).some((item: any) => item.itemType === "product");
}

function isDepositOrder(order: any): boolean {
  if (order.recordType === "deposit") return true;
  const paymentMethod = String(order.paymentMethod ?? "").toLowerCase();
  return (order.items ?? []).length === 0 &&
    ["cashapp", "chime", "venmo", "zelle"].includes(paymentMethod);
}

function depositMethodLabel(type: string): string {
  const labels: Record<string, string> = {
    cashapp: "CashApp",
    chime: "Chime",
    venmo: "Venmo",
    zelle: "Zelle",
    crypto: "Crypto",
  };
  return labels[type.toLowerCase()] ?? "Deposit";
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    fulfilled: { label: "FULFILLED", cls: "bg-green-900/40 text-green-400" },
    delivering: { label: "FULFILLED", cls: "bg-green-900/40 text-green-400" },
    completed: { label: "CREDITED", cls: "bg-green-900/40 text-green-400" },
    pending: { label: "PENDING", cls: "bg-yellow-900/40 text-yellow-400" },
    waiting_payment: { label: "UNPAID", cls: "bg-orange-900/40 text-orange-400" },
    unpaid: { label: "UNPAID", cls: "bg-orange-900/40 text-orange-400" },
    underpaid: { label: "UNDERPAID", cls: "bg-orange-900/40 text-orange-400" },
    failed: { label: "FAILED", cls: "bg-red-900/40 text-red-400" },
    expired: { label: "EXPIRED", cls: "bg-red-900/40 text-red-400" },
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
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");

  const { data: deposits = [], isLoading: depositsLoading, refetch: refetchDeposits } = useQuery<{
    id: string;
    type: string;
    amount: number;
    status: string;
    currency?: string;
    createdAt: string;
  }[]>({
    queryKey: ["/api/deposits"],
    enabled: !!user,
    refetchInterval: 20000,
  });

  const { data: rankData } = useQuery<{ rank: string; discountPct: number; totalDeposited: number }>({
    queryKey: ["/api/user/rank"],
    enabled: !!user,
  });

  const totalDepositsCents = rankData?.totalDeposited ?? 0;
  const tier = {
    label: rankLabels[rankData?.rank ?? "newbie"] ?? "Newbie",
    discount: `${rankData?.discountPct ?? 0}% off`,
  };
  const allOrders = useMemo(() => {
    const purchaseOrders = (orders ?? []).filter((order: any) => !isDepositOrder(order));
    const depositOrders = deposits.map((deposit) => ({
      id: `deposit-${deposit.id}`,
      orderId: `DEP-${deposit.id.replace(/_/g, "-").toUpperCase()}`,
      recordType: "deposit" as const,
      depositType: deposit.type,
      paymentMethod: depositMethodLabel(deposit.type),
      depositCurrency: deposit.currency,
      items: [],
      total: deposit.amount,
      status: deposit.status,
      createdAt: deposit.createdAt,
    }));
    return [...purchaseOrders, ...depositOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [orders, deposits]);

  const cardOrders = useMemo(() => allOrders.filter(isCardOrder), [allOrders]);
  const achOrders = useMemo(() => allOrders.filter(isAchOrder), [allOrders]);
  const logOrders = useMemo(() => allOrders.filter(isLogOrder), [allOrders]);
  const tabOrders = tab === "cards" ? cardOrders : tab === "logs" ? logOrders : tab === "ach" ? achOrders : allOrders;

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return tabOrders;
    const q = search.toLowerCase();
    return tabOrders.filter((o: any) =>
      (o.orderId ?? "").toLowerCase().includes(q) ||
      (o.status ?? "").toLowerCase().includes(q) ||
      (o.paymentMethod ?? "").toLowerCase().includes(q) ||
      (o.depositType ?? "").toLowerCase().includes(q)
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
      <div className="pixel-panel mx-auto flex min-h-[260px] max-w-lg flex-col items-center justify-center bg-[#10215e] px-5 text-center">
        <ReceiptText className="h-8 w-8 text-[#ffcf3f]" />
        <p className="mt-4 text-sm font-bold text-white">HISTORY UNAVAILABLE</p>
        <p className="mt-2 text-xs text-white/55">Your purchases could not be loaded.</p>
        <button className="pixel-button mt-5 px-4 py-3 text-[8px]" onClick={() => { refetch(); refetchDeposits(); }}>RETRY HISTORY</button>
      </div>
    );
  }

  const now = new Date();

  const tabs: { key: TabType; label: string; count: number; href?: string }[] = [
    { key: "all", label: "all", count: allOrders.length },
    { key: "logs", label: "logs", count: logOrders.length, href: "/logs" },
    { key: "cards", label: "cards", count: cardOrders.length, href: "/cards" },
    ...(achOrders.length > 0 ? [{ key: "ach" as TabType, label: "ach", count: achOrders.length }] : []),
  ];

  return (
    <div className="pixel-page space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl leading-relaxed text-white sm:text-2xl">ORDER &amp; DEPOSIT HISTORY</h1>
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
          placeholder="search orders and deposits..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="pixel-input max-w-sm"
        data-testid="input-search-orders"
      />

      {/* Order list */}
      {filteredOrders.length === 0 && depositsLoading ? (
        <div className="pixel-panel flex min-h-[180px] items-center justify-center bg-[#10215e]">
          <Loader2 className="h-6 w-6 animate-spin text-[#ffe177]" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="pixel-panel bg-[#10215e] px-5 py-14 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-[#ffe177]" />
          <h2 className="mt-5 text-sm leading-relaxed text-white">NO ORDERS YET</h2>
           <p className="mx-auto mt-3 max-w-md text-xs text-white/55">When you buy logs, cards, or add balance, your activity will show up here.</p>
          <div className="mt-5 flex justify-center">
             <Link href="/logs" className="pixel-button inline-flex items-center gap-2 px-3 py-3 text-[8px]"><ReceiptText className="h-3 w-3" />BROWSE LOGS</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order: any) => {
            const isDeposit = isDepositOrder(order);
            const isCard = isCardOrder(order);
            const isLog = isLogOrder(order);
            const row = (
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-mono text-white/40 truncate">#{order.orderId}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                        isDeposit ? "bg-green-900/30 text-green-300" :
                        isCard ? "bg-blue-900/30 text-blue-400" :
                        isAchOrder(order) ? "bg-cyan-900/30 text-cyan-400" :
                        isLog ? "bg-red-900/30 text-red-300" : "bg-white/10 text-white/60"
                      }`}>
                        {isDeposit ? "deposit" : isCard ? "card" : isAchOrder(order) ? "ach" : isLog ? "log" : "other"}
                      </span>
                    </div>
                    <p className={`text-xs ${isDeposit ? "text-green-200/70" : "text-white/60"}`}>
                      {isDeposit
                        ? `${order.paymentMethod ?? "Deposit"} deposit`
                        : `${order.items?.length ?? 0} item${(order.items?.length ?? 0) !== 1 ? "s" : ""}`}
                      {isDeposit && order.depositCurrency ? ` · ${order.depositCurrency}` : ""}
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
            );
            return isDeposit ? (
              <div
                key={order.id}
                className="w-full border-[3px] border-[#1d713e] bg-[#10215e] px-4 py-3"
                data-testid={`row-deposit-${order.id}`}
              >
                {row}
              </div>
            ) : (
              <button
                key={order.id}
                onClick={() => setLocation(`/order/${order.orderId}`)}
                className="w-full border-[3px] border-black bg-[#10215e] px-4 py-3 text-left transition-all hover:bg-[#19377e]"
                data-testid={`btn-order-${order.id}`}
              >
                {row}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
