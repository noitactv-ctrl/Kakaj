import { useProducts } from "@/hooks/use-products";
import { useRoute, useLocation } from "wouter";
import { Loader2, X, ShoppingCart, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:name");
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const name = decodeURIComponent(params?.name || "");
  const { data: products } = useProducts();
  const product = products?.find((p: any) => p.name === name);
  const isLoading = !products;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const selectedVariant = product?.variants.find((v: any) => v.id.toString() === selectedVariantId);
  const minQty = selectedVariant?.minQuantity || 1;
  const maxQty = selectedVariant?.stockCount ?? 999;
  const totalAmount = selectedVariant ? selectedVariant.price * quantity : 0;

  const { data: rankData } = useQuery<any>({ queryKey: ["/api/user/rank"] });
  const rankDiscountPct = rankData?.discountPct ?? 0;
  const discountedAmount = rankDiscountPct > 0 && totalAmount > 0
    ? Math.round(totalAmount * (1 - rankDiscountPct / 100))
    : totalAmount;

  useEffect(() => {
    if (selectedVariant) setQuantity(Math.min(Math.max(minQty, 1), maxQty));
  }, [selectedVariantId, minQty, maxQty]);

  // Auto-select first in-stock variant
  useEffect(() => {
    if (product?.variants?.length && !selectedVariantId) {
      const first = product.variants.find((v: any) => v.stockCount !== 0);
      if (first) setSelectedVariantId(first.id.toString());
    }
  }, [product]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
  if (!product) return (
    <div className="p-8 text-center text-white/40 text-sm">Product not found</div>
  );

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant) throw new Error("Select an option first");
      if (quantity < minQty) throw new Error(`Minimum order is ${minQty}`);
      const res = await apiRequest("POST", "/api/orders", {
        items: [{ variantId: selectedVariant.id, quantity }],
        cardIds: [],
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Purchase failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/orders"] });
      qc.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Purchase complete", description: "Delivered to your orders" });
      setLocation("/orders");
    },
    onError: (e: Error) => {
      toast({ title: "Purchase failed", description: e.message, variant: "destructive" });
    },
  });

  const priceDisplay = discountedAmount > 0
    ? `$${(discountedAmount / 100).toFixed(2)}`
    : "—";

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-6">
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: "#0d0d18",
          border: "1.5px solid hsla(25,58%,50%,0.3)",
          boxShadow: "0 0 40px hsla(25,58%,42%,0.18)",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid hsla(25,58%,50%,0.15)" }}
        >
          <span className="text-sm font-bold text-white">Add To Cart</span>
          <button
            onClick={() => setLocation("/")}
            className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            data-testid="button-close-product"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Blue accent bar */}
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(90deg, hsl(25 58% 48%), hsl(25 62% 55%), hsl(25 58% 48%))" }}
        />

        <div className="px-5 py-4 space-y-4">
          {/* Product name */}
          <h2 className="text-base font-black text-white leading-tight">{product.name}</h2>

          {/* Description */}
          {product.description && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">About product</p>
              <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "hsl(25 58% 48%)", color: "#fff" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant select */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Available options</p>
            <div className="relative">
              <select
                value={selectedVariantId ?? ""}
                onChange={e => setSelectedVariantId(e.target.value)}
                className="w-full h-10 rounded appearance-none pl-3 pr-8 text-xs text-white/90 outline-none cursor-pointer"
                style={{
                  background: "#0a0a14",
                  border: "1px solid hsla(25,58%,50%,0.25)",
                }}
                data-testid="select-variant"
              >
                <option value="" disabled>Select an option</option>
                {product.variants.map((v: any) => {
                  const outOfStock = v.stockCount === 0;
                  return (
                    <option key={v.id} value={v.id.toString()} disabled={outOfStock}>
                      {v.name} — Price: {(v.price / 100).toFixed(2)}$
                      {outOfStock ? " (out of stock)" : ""}
                    </option>
                  );
                })}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Amount to add */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Amount to add</p>
            <div
              className="flex items-center rounded overflow-hidden"
              style={{ border: "1px solid hsla(25,58%,50%,0.25)", background: "#0a0a14" }}
            >
              <input
                type="number"
                min={minQty}
                max={maxQty}
                value={quantity}
                onChange={e => {
                  const v = parseInt(e.target.value) || minQty;
                  setQuantity(Math.min(Math.max(minQty, v), maxQty));
                }}
                className="flex-1 h-10 bg-transparent px-3 text-sm text-white outline-none min-w-0"
                data-testid="input-quantity"
              />
              <div
                className="flex items-center gap-1 px-3 h-10 shrink-0"
                style={{ borderLeft: "1px solid hsla(25,58%,50%,0.15)" }}
              >
                <span className="text-xs text-white/40">$</span>
                <span className="text-sm font-bold text-white/90">
                  {discountedAmount > 0 ? (discountedAmount / 100).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
            {rankDiscountPct > 0 && discountedAmount < totalAmount && (
              <p className="text-[10px] text-amber-400 font-bold">
                {rankDiscountPct}% rank discount applied — was ${(totalAmount / 100).toFixed(2)}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => purchaseMutation.mutate()}
              disabled={!selectedVariantId || purchaseMutation.isPending}
              className="w-full h-10 rounded text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, hsl(25 58% 48%), hsl(25 62% 55%))" }}
              data-testid="button-purchase"
            >
              {purchaseMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><ShoppingCart className="h-4 w-4" /> Add to cart</>}
            </button>
            <button
              onClick={() => setLocation("/orders")}
              className="w-full h-10 rounded text-sm font-bold text-white/80 flex items-center justify-center gap-2 transition-all hover:text-white hover:border-primary/50 active:scale-[0.98]"
              style={{ border: "1px solid hsla(25,58%,50%,0.3)", background: "transparent" }}
            >
              <Eye className="h-4 w-4" /> View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
