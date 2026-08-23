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
  price: number;
};

export default function RoutingCatalogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const { data: items = [], isLoading } = useQuery<RoutingItem[]>({ queryKey: ["/api/routings"] });

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;
    return items.filter(item => [item.bankName, item.routingNumber, item.state, item.zip]
      .some(value => value.toLowerCase().includes(search)));
  }, [items, query]);
  const purchaseMutation = useMutation({
    mutationFn: async (itemIds: number[]) => {
      const response = await apiRequest("POST", "/api/routings/purchase", { itemIds });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to complete purchase");
      }
      return response.json() as Promise<{ orderId: number; discountPct: number }>;
    },
    onSuccess: (result) => {
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["/api/routings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Purchase complete", description: result.discountPct ? `Rank discount applied: ${result.discountPct}%` : "Your routing details are ready in Orders." });
      setLocation(`/order/${result.orderId}`);
    },
    onError: (error: Error) => toast({ title: "Purchase unavailable", description: error.message, variant: "destructive" }),
  });

  const toggleSelected = (id: number) => setSelected(current => current.includes(id)
    ? current.filter(itemId => itemId !== id)
    : [...current, id]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <section className="pixel-panel sticky top-[68px] z-30 bg-[#10276a] px-3 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#725d42]" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="SEARCH BANK, ROUTING, STATE OR ZIP..."
            className="pixel-input h-11 pl-10 text-xs" data-testid="input-routing-search" />
        </div>
        <div className="border-t-2 border-black/60 pt-3">
          <button onClick={() => purchaseMutation.mutate(selected)} disabled={purchaseMutation.isPending || selected.length === 0}
            className="pixel-button flex w-full items-center justify-center gap-2 !bg-[#43b94e] px-3 py-3 text-[9px] !text-white"
            data-testid="button-add-selected-routings">
            <ShoppingCart className="h-3.5 w-3.5" />
            {purchaseMutation.isPending ? "PROCESSING..." : `ADD SELECTED BANKS · ${selected.length}`}
          </button>
          <p className="mt-2 text-center text-[10px] font-bold text-[#ffe177]">
            SELECT BANKS INDIVIDUALLY OR ADD A BULK ORDER
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
            <div className="hidden md:grid grid-cols-[42px_1.6fr_1fr_.7fr_.8fr_.6fr] gap-4 bg-[#183c9d] px-5 py-3 pixel-text text-[8px] text-[#ffe177]">
              <span />
              <span>BANK</span><span>ROUTING NUMBER</span><span>STATE</span><span>ZIP</span><span>PRICE</span>
            </div>
            {visibleItems.map(item => {
              const isSelected = selected.includes(item.id);
              return (
                <div key={item.id} className={`grid grid-cols-1 md:grid-cols-[42px_1.6fr_1fr_.7fr_.8fr_.6fr] gap-2 md:gap-4 items-center px-5 py-4 border-t border-[#1b3065] bg-[#07102a] ${isSelected ? "bg-[#102b6a]" : ""}`}>
                  <label className="flex items-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelected(item.id)} className="accent-[#ffe177]" aria-label={`Select ${item.bankName}`} />
                  </label>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">Bank</span><span className="font-semibold text-white">{item.bankName}</span></div>
                  <div className="font-mono text-sm text-[#7fa9ff]"><span className="md:hidden mr-2 text-[10px] text-white/45">Routing</span>{item.routingNumber}</div>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">State</span>{item.state}</div>
                  <div><span className="md:hidden mr-2 text-[10px] text-white/45">ZIP</span>{item.zip}</div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#ffe177]">${(item.price / 100).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}