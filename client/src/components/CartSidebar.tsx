import { useLocation } from "wouter";
import { ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CartSidebar({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    items,
    cardItems,
    bulkBundle,
    removeItem,
    removeCard,
    clearBulkBundle,
    clearCart,
    total,
  } = useCart();

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
    + cardItems.length
    + (bulkBundle?.cardIds.length ?? 0);
  const productTotal = total();
  const cardSubtotal = cardItems.reduce((sum, card) => sum + card.price, 0);
  const cartTotal = productTotal + cardSubtotal + (bulkBundle?.discountedTotal ?? 0);
  const isEmpty = itemCount === 0;

  const balanceOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        setLocation("/auth");
        throw new Error("Please sign in to checkout");
      }
      const response = await apiRequest("POST", api.orders.create.path, {
        items: items.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
        cardIds: cardItems.map(card => card.id),
        bulkCardIds: bulkBundle?.cardIds ?? [],
        discountCodeId: null,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Order failed");
      }
      return response.json();
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/card-bases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Order placed!", description: "Your order has been placed and will be fulfilled soon." });
      onClose();
      setLocation("/orders");
    },
    onError: (error: Error) => {
      if (error.message === "Please sign in to checkout") return;
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <aside
        className={`fixed inset-y-0 right-0 z-40 hidden w-[292px] flex-col border-l-[3px] border-black bg-[#14276b] text-[#fff0c5] shadow-[-5px_0_0_rgba(0,0,0,0.45)] transition-transform duration-200 lg:flex 2xl:w-[320px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b-[3px] border-black bg-[#162d78] px-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5 text-[#ffe177]" />
            <h2 className="pixel-text text-[10px] text-white">YOUR CART</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#b9cfff] transition-colors hover:text-white"
            aria-label="Close cart panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#14276b] p-2">
          {isEmpty ? (
            <div className="border-[3px] border-black bg-[#0c174b] px-3 py-4 text-center">
              <p className="font-mono text-[10px] text-[#b9cfff]">Your cart is empty.</p>
            </div>
          ) : (
            <div className="border-[3px] border-black bg-[#0c174b]">
              {bulkBundle && (
                <div className="flex items-start gap-2 border-b-2 border-black px-2.5 py-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center border-2 border-black bg-[#ee292b]">
                    <ShoppingCart className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-white">20-CARD BULK BUNDLE</p>
                    <p className="mt-1 font-mono text-[9px] text-[#72df7c]">
                      ${(bulkBundle.discountedTotal / 100).toFixed(2)} · 50% OFF
                    </p>
                  </div>
                  <button
                    onClick={clearBulkBundle}
                    className="shrink-0 p-1 text-[#b9cfff] hover:text-white"
                    aria-label="Remove bulk bundle"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {cardItems.map(card => (
                <div key={`card-${card.id}`} className="flex items-center gap-2 border-b-2 border-black px-2.5 py-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center border-2 border-black bg-[#1d3d93]">
                    <span className="text-[8px] font-bold text-[#ffe177]">{card.brand || "CARD"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-white">{card.bin || "CARD"}</p>
                    <p className="mt-1 font-mono text-[9px] text-[#b9cfff]">${(card.price / 100).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeCard(card.id)}
                    className="shrink-0 p-1 text-[#b9cfff] hover:text-white"
                    aria-label={`Remove ${card.bin || "card"}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {items.map(item => (
                <div key={`item-${item.variantId}`} className="flex items-center gap-2 border-b-2 border-black px-2.5 py-3 last:border-b-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center border-2 border-black bg-[#1d3d93]">
                    <span className="text-[11px] font-bold text-[#ffe177]">{item.productName?.charAt(0) || "?"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-white">{item.productName}</p>
                    <p className="mt-1 font-mono text-[9px] text-[#b9cfff]">
                      Qty {item.quantity} · ${(item.price * item.quantity / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="shrink-0 p-1 text-[#b9cfff] hover:text-white"
                    aria-label={`Remove ${item.productName}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t-[3px] border-black bg-[#10215e] p-2.5">
          <div className="flex items-end justify-between border-b-2 border-black/50 pb-2">
            <div>
              <p className="pixel-label">TOTAL</p>
              <p className="mt-1 font-mono text-[9px] text-[#aabbe9]">
                Balance: ${((user?.balance ?? 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-white">${(cartTotal / 100).toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={clearCart}
            disabled={isEmpty}
            className="w-full border-[2px] border-black bg-[#a7a4aa] py-2 pixel-text text-[8px] text-[#17110a] disabled:cursor-not-allowed disabled:opacity-45"
          >
            ▪ Clear cart
          </button>
          <button
            onClick={() => balanceOrderMutation.mutate()}
            disabled={isEmpty}
            className="w-full border-[2px] border-black bg-[#43b94e] py-2.5 pixel-text text-[8px] text-white shadow-[2px_2px_0_#07130a] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {balanceOrderMutation.isPending ? "▪ Placing order..." : "▪ Checkout with Balance"}
          </button>
        </div>
      </aside>
  );
}