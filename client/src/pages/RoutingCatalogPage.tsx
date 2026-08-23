import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, ShoppingCart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type RoutingItem = {
  id: number;
  bankName: string;
  routingNumber: string;
  state: string;
  zip: string;
  bin: string;
  issuer: string;
  price: number;
};

const BULK_BANK_COUNT = 20;
const BULK_BANK_PRICE = 100;

export default function RoutingCatalogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [regularSelected, setRegularSelected] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const { data: items = [], isLoading } = useQuery<RoutingItem[]>({ queryKey: ["/api/routings"] });

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;
    return items.filter(item => [item.bankName, item.routingNumber, item.state, item.zip, item.bin, item.issuer]
      .some(value => value.toLowerCase().includes(search)));
  }, [items, query]);

  const handlePurchaseSuccess = (result: { orderId: number; total: number; discountPct?: number }, bulk = false) => {
    setSelected([]);
    setRegularSelected([]);
    setBulkMode(false);
    queryClient.invalidateQueries({ queryKey: ["/api/routings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    toast({
      title: bulk ? "BANK BULK PURCHASE COMPLETE" : "Purchase complete",
      description: bulk ? "20 banks purchased for $20 total." : (result.discountPct ? `Rank discount applied: ${result.discountPct}%` : "Your routing details are ready in Orders."),
    });
    setLocation(`/order/${result.orderId}`);
  };

  const purchaseMutation = useMutation({
    mutationFn: async (itemIds: number[]) => {
      const response = await apiRequest("POST", "/api/routings/purchase", { itemIds });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to complete purchase");
      }
      return response.json() as Promise<{ orderId: number; total: number; discountPct: number }>;
    },
    onSuccess: result => handlePurchaseSuccess(result),
    onError: (error: Error) => toast({ title: "Purchase unavailable", description: error.message, variant: "destructive" }),
  });

  const bulkPurchaseMutation = useMutation({
    mutationFn: async (itemIds: number[]) => {
      const response = await apiRequest("POST", "/api/routings/bulk-purchase", { itemIds });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to complete bank bulk purchase");
      }
      return response.json() as Promise<{ orderId: number; total: number }>;
    },
    onSuccess: result => handlePurchaseSuccess(result, true),
    onError: (error: Error) => toast({ title: "Bulk purchase unavailable", description: error.message, variant: "destructive" }),
  });

  const toggleSelected = (id: number) => setSelected(current => current.includes(id)
    ? current.filter(itemId => itemId !== id)
    : current.length >= BULK_BANK_COUNT
      ? (toast({ title: "BULK BUNDLE IS FULL", description: "Select exactly 20 banks.", variant: "destructive" }), current)
      : [...current, id]);
  const toggleRegularSelected = (id: number) => setRegularSelected(current => current.includes(id)
    ? current.filter(itemId => itemId !== id)
    : current.length >= 100
      ? (toast({ title: "SELECTION LIMIT REACHED", description: "You can buy up to 100 banks at once.", variant: "destructive" }), current)
      : [...current, id]);
  const regularSelectedTotal = items
    .filter(item => regularSelected.includes(item.id))
    .reduce((total, item) => total + item.price, 0);
  const cancelBulkSelection = () => {
    setSelected([]);
    setBulkMode(false);
  };

  return (
    <div className="pixel-page space-y-4">
      <section className="pixel-panel sticky top-[68px] z-30 bg-[#10276a] px-3 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#725d42]" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="SEARCH BANK, ROUTING, STATE OR ZIP..."
            className="pixel-input h-11 pl-10 text-xs" data-testid="input-routing-search" />
        </div>
        <div className="border-t-2 border-black/60 pt-3">
          {!bulkMode ? (
            <div className="space-y-2">
              <button
                onClick={() => { setSelected([]); setRegularSelected([]); setBulkMode(true); }}
                className="pixel-button flex w-full items-center justify-center gap-2 !bg-[#43b94e] px-3 py-3 text-[9px] !text-white"
                data-testid="btn-start-bank-bulk-selection"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                SELECT 20 FOR BULK · $1 EACH
              </button>
              <button
                onClick={() => purchaseMutation.mutate(regularSelected)}
                disabled={purchaseMutation.isPending || regularSelected.length === 0}
                className="pixel-button flex w-full items-center justify-center gap-2 !bg-[#ffe1aa] px-3 py-2 text-[8px] !text-[#171108] disabled:opacity-50"
                data-testid="button-add-selected-routings"
              >
                {purchaseMutation.isPending ? "PROCESSING..." : `ADD SELECTED BANKS · ${regularSelected.length}${regularSelected.length ? ` · $${(regularSelectedTotal / 100).toFixed(2)}` : ""}`}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => bulkPurchaseMutation.mutate(selected)}
                disabled={bulkPurchaseMutation.isPending || selected.length !== BULK_BANK_COUNT}
                className="pixel-button flex min-w-0 flex-1 items-center justify-center gap-2 !bg-[#43b94e] px-3 py-3 text-[9px] !text-white disabled:opacity-50"
                data-testid="btn-create-bank-bulk-bundle"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {bulkPurchaseMutation.isPending ? "PROCESSING..." : `BULK · ${selected.length}/20`}
              </button>
              <button
                onClick={cancelBulkSelection}
                className="pixel-button px-3 py-3 text-[9px] !bg-[#ee292b] !text-white"
                data-testid="btn-cancel-bank-bulk-selection"
              >
                CANCEL
              </button>
            </div>
          )}
          <p className="mt-2 text-center text-[10px] font-bold text-[#ffe177]">
            {bulkMode ? "SELECT EXACTLY 20 BANKS · $1 EACH · $20 TOTAL" : "BUY SELECTED BANKS NORMALLY OR START A 20-BANK BULK BUNDLE"}
          </p>
        </div>
      </section>

      <div className="pixel-panel mt-4 overflow-x-auto bg-[#0b1744]">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-4 w-4 animate-spin text-white/30" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/35">
            No banks available
          </div>
        ) : (
          <>
            <div className={`hidden md:grid ${bulkMode ? "grid-cols-[42px_1.3fr_1.3fr_1fr_.6fr_.7fr_.8fr_.6fr]" : "grid-cols-[42px_1.3fr_1.3fr_1fr_.6fr_.7fr_.8fr_.6fr_.7fr]"} gap-4 bg-[#183c9d] px-5 py-3 pixel-text text-[8px] text-[#ffe177]`}>
              <span />
              <span>BANK</span><span>ISSUER</span><span>ROUTING NUMBER</span><span>STATE</span><span>ZIP</span><span>BIN</span><span>PRICE</span>
              {!bulkMode && <span>ACTIONS</span>}
            </div>
            {visibleItems.map(item => {
              const isSelected = bulkMode ? selected.includes(item.id) : regularSelected.includes(item.id);
              return (
                <div key={item.id} className={`grid grid-cols-1 ${bulkMode ? "md:grid-cols-[42px_1.3fr_1.3fr_1fr_.6fr_.7fr_.8fr_.6fr]" : "md:grid-cols-[42px_1.3fr_1.3fr_1fr_.6fr_.7fr_.8fr_.6fr_.7fr]"} gap-2 md:gap-4 items-center px-5 py-4 border-t border-[#1b3065] bg-[#07102a] ${isSelected ? "bg-[#102b6a]" : ""}`}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => bulkMode ? toggleSelected(item.id) : toggleRegularSelected(item.id)}
                      disabled={bulkMode && !isSelected && selected.length >= BULK_BANK_COUNT}
                      className="w-3.5 h-3.5 rounded border-white/15 cursor-pointer accent-green-500 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Select ${item.bankName}`}
                    />
                  </label>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">Bank</span><span className="font-semibold text-white">{item.bankName}</span></div>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">Issuer</span>{item.issuer || "—"}</div>
                  <div className="font-mono text-sm text-[#7fa9ff]"><span className="md:hidden mr-2 text-[10px] text-white/45">Routing</span>{item.routingNumber}</div>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">State</span>{item.state}</div>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">ZIP</span>{item.zip}</div>
                  <div className="font-mono"><span className="md:hidden mr-2 text-[10px] text-white/45">BIN</span>{item.bin || "—"}</div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#ffe177]">${((bulkMode ? BULK_BANK_PRICE : item.price) / 100).toFixed(2)}</span>
                  </div>
                  {!bulkMode && (
                    <button
                      onClick={() => purchaseMutation.mutate([item.id])}
                      disabled={purchaseMutation.isPending}
                      className="pixel-button inline-flex items-center justify-center !bg-[#43b94e] px-2 py-1.5 text-[8px] font-bold !text-white transition-colors hover:!bg-[#58cf63] disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid={`btn-buy-routing-${item.id}`}
                    >
                      {purchaseMutation.isPending ? "..." : `Buy $${(item.price / 100).toFixed(2)}`}
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}