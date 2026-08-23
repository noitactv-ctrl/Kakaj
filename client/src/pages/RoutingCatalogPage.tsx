import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, Loader2, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const selectRandom = () => {
    const randomItems = [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(5, items.length));
    setSelected(current => Array.from(new Set([...current, ...randomItems.map(item => item.id)])));
  };

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
  const selectedTotal = items.filter(item => selected.includes(item.id)).reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <section className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#725d42]" />
          <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by bank, routing, state, zip..."
            className="h-10 pl-9 bg-[#ffe1aa] border-[3px] border-black rounded-none text-[#171108] placeholder:text-[#725d42]" data-testid="input-routing-search" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => purchaseMutation.mutate(selected)} disabled={purchaseMutation.isPending || selected.length === 0}
            className="pixel-button h-8 rounded-none !bg-[#ffe1aa] !text-[#171108] !shadow-[3px_3px_0_#000] text-[8px]" data-testid="button-add-selected-routings">
            + add selected ({selected.length})
          </Button>
          <Button onClick={selectRandom} disabled={items.length === 0}
            className="pixel-button h-8 rounded-none !bg-[#ffe1aa] !text-[#171108] !shadow-[3px_3px_0_#000] text-[8px]" data-testid="button-bulk-random-routings">
            × bulk add random
          </Button>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-white/45">
          <span>{visibleItems.length} banks available</span>
          <span>{selected.length} selected · ${(selectedTotal / 100).toFixed(2)}</span>
        </div>
      </section>

      <section className="pixel-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[42px_1.6fr_1fr_.7fr_.8fr_.6fr] gap-4 bg-[#183c9d] px-5 py-3 pixel-text text-[8px] text-[#ffe177]">
          <span />
          <span>BANK</span><span>ROUTING NUMBER</span><span>STATE</span><span>ZIP</span><span>PRICE</span>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16 bg-[#07102a]"><Loader2 className="animate-spin text-[#ffe177]" /></div>
        ) : visibleItems.length === 0 ? (
          <div className="py-16 text-center bg-[#07102a]">
            <Landmark className="mx-auto h-8 w-8 text-white/25 mb-3" />
            <p className="text-sm text-white/60">No routing records match your search.</p>
          </div>
        ) : visibleItems.map(item => {
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
                <Button size="sm" onClick={() => purchaseMutation.mutate([item.id])} disabled={purchaseMutation.isPending}
                  className="md:hidden h-8 bg-[#43b94e] hover:bg-[#31973a] text-white" data-testid={`button-buy-routing-${item.id}`}>
                  Buy
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      {selected.length > 0 && (
        <div className="sticky bottom-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-[3px] border-[#0a1021] bg-[#43b94e] px-4 py-3 shadow-[4px_4px_0_#0a1021]">
          <p className="pixel-text text-[9px] text-white">{selected.length} selected · ${(selectedTotal / 100).toFixed(2)}</p>
          <Button onClick={() => purchaseMutation.mutate(selected)} disabled={purchaseMutation.isPending}
            className="pixel-button h-9 !bg-[#ffe177] !text-[#171108]" data-testid="button-buy-selected-routings">
            {purchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-2 h-4 w-4" />Buy selected</>}
          </Button>
        </div>
      )}
    </div>
  );
}