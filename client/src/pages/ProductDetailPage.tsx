import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, Loader2, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:name");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useProducts();
  const productName = decodeURIComponent(params?.name ?? "");
  const product = products?.find(item => item.name === productName);
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => product?.variants.find(variant => String(variant.id) === variantId),
    [product, variantId],
  );
  const minQuantity = selectedVariant?.minQuantity ?? 1;
  const maxQuantity = selectedVariant?.stockCount ?? 0;
  const total = (selectedVariant?.price ?? 0) * quantity;

  const { data: rank } = useQuery<{ discountPct?: number }>({ queryKey: ["/api/user/rank"] });
  const discountPct = rank?.discountPct ?? 0;
  const discountedTotal = Math.round(total * (1 - discountPct / 100));

  useEffect(() => {
    const firstAvailable = product?.variants.find(variant => variant.stockCount > 0);
    if (firstAvailable && !variantId) setVariantId(String(firstAvailable.id));
  }, [product, variantId]);

  useEffect(() => {
    if (selectedVariant) setQuantity(Math.min(Math.max(quantity, minQuantity), maxQuantity));
  }, [selectedVariant, minQuantity, maxQuantity]); // eslint-disable-line react-hooks/exhaustive-deps

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant) throw new Error("Select an option first");
      if (quantity < minQuantity || quantity > maxQuantity) throw new Error("Quantity is no longer available");
      const response = await apiRequest("POST", "/api/orders", {
        items: [{ variantId: selectedVariant.id, quantity }],
        cardIds: [],
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Purchase failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "PURCHASE COMPLETE", description: "Your product is ready in My Purchases." });
      setLocation("/orders");
    },
    onError: (error: Error) => toast({ title: "PURCHASE FAILED", description: error.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#ff2933]" /></div>;
  }

  if (!product) {
    return (
      <div className="pixel-panel mx-auto max-w-lg bg-[#151515] px-5 py-16 text-center">
        <Package className="mx-auto h-8 w-8 text-white/25" />
        <p className="mt-4 text-sm text-white/60">PRODUCT NOT FOUND</p>
        <Link href="/logs"><span className="pixel-button mt-5 inline-flex px-3 py-3 text-[8px]">BACK TO LOGS</span></Link>
      </div>
    );
  }

  const available = (product.variants ?? []).some(variant => variant.stockCount > 0);

  return (
    <div className="pixel-page pb-8">
      <Link href="/logs">
        <span className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[9px] text-white/55 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO LOGS
        </span>
      </Link>
      <div className="pixel-panel mx-auto grid max-w-4xl overflow-hidden bg-[#151515] md:grid-cols-[1fr_1fr]">
        <div className="min-h-[290px] border-b-[3px] border-black md:border-b-0 md:border-r-[3px]">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full min-h-[290px] w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[290px] items-center justify-center bg-[#191919]">
              <Package className="h-24 w-24 text-white/20" strokeWidth={1} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#ff5360]">{product.category || "LOG PRODUCT"}</p>
            <h1 className="mt-2 text-lg leading-relaxed text-white sm:text-xl">{product.name}</h1>
            <p className="mt-3 text-xs leading-relaxed text-white/55">{product.description || "Digital product delivered after purchase."}</p>
          </div>

          <label className="space-y-2">
            <span className="pixel-label">SELECT OPTION</span>
            <select
              value={variantId}
              onChange={event => setVariantId(event.target.value)}
              className="pixel-input border-[#373737] bg-[#222] text-xs text-white"
              data-testid="select-product-variant"
            >
              <option value="">Select an option</option>
              {product.variants.map(variant => (
                <option key={variant.id} value={variant.id} disabled={variant.stockCount === 0}>
                  {variant.name} — ${(variant.price / 100).toFixed(2)} {variant.stockCount === 0 ? "(out of stock)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <span className="pixel-label">QUANTITY</span>
            <div className="flex h-10 border-[2px] border-[#373737] bg-[#222]">
              <button className="px-3 text-white/65 hover:text-white disabled:opacity-30" onClick={() => setQuantity(value => Math.max(minQuantity, value - 1))} disabled={!selectedVariant || quantity <= minQuantity} aria-label="Decrease quantity">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex flex-1 items-center justify-center font-mono text-sm text-white">{quantity}</span>
              <button className="px-3 text-white/65 hover:text-white disabled:opacity-30" onClick={() => setQuantity(value => Math.min(maxQuantity, value + 1))} disabled={!selectedVariant || quantity >= maxQuantity} aria-label="Increase quantity">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between border-t-[2px] border-white/10 pt-4">
            <div>
              <p className="text-[9px] text-white/40">TOTAL</p>
              <p className="mt-1 font-mono text-xl font-bold text-white">{discountedTotal > 0 ? `$${(discountedTotal / 100).toFixed(2)}` : "—"}</p>
            </div>
            {discountPct > 0 && total > discountedTotal && <p className="text-[9px] font-bold text-[#ffcf3f]">{discountPct}% RANK DISCOUNT</p>}
          </div>

          <button
            onClick={() => purchaseMutation.mutate()}
            disabled={!available || !selectedVariant || purchaseMutation.isPending}
            className="pixel-button flex min-h-11 w-full items-center justify-center gap-2 !bg-[#ff2933] px-3 py-3 text-[9px] !text-white disabled:cursor-not-allowed disabled:opacity-45"
            data-testid="button-purchase-product"
          >
            {purchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {purchaseMutation.isPending ? "PROCESSING..." : "PURCHASE NOW"}
          </button>
        </div>
      </div>
    </div>
  );
}