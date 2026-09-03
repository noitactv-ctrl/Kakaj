import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Loader2, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

function DetailArtwork({ image, name }: { image?: string | null; name: string }) {
  return (
    <div className="flex h-full min-h-[290px] items-center justify-center overflow-hidden bg-[#202020] text-[#a0a0a0]">
      <Package className="h-24 w-24" strokeWidth={1.2} />
    </div>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:name");
  const { toast } = useToast();
  const addItem = useCart(state => state.addItem);
  const { data: products, isLoading, isError, refetch } = useProducts();
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

  useEffect(() => {
    const firstAvailable = product?.variants.find(variant => variant.stockCount > 0);
    if (firstAvailable && !variantId) setVariantId(String(firstAvailable.id));
  }, [product, variantId]);

  useEffect(() => {
    if (selectedVariant) setQuantity(Math.min(Math.max(quantity, minQuantity), maxQuantity));
  }, [selectedVariant, minQuantity, maxQuantity]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant) throw new Error("Select an option first");
      if (quantity < minQuantity || quantity > maxQuantity) throw new Error("Quantity is no longer available");
      addItem({
        variantId: selectedVariant.id,
        productId: product!.id,
        productName: product!.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        quantity,
        image: product!.image ?? "",
        minQuantity,
      });
    },
    onSuccess: () => {
      toast({ title: "ADDED TO CART", description: `${product?.name} is ready for checkout from your cart.` });
    },
    onError: (error: Error) => toast({ title: "COULD NOT ADD TO CART", description: error.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="pixel-panel mx-auto mt-8 flex min-h-[260px] max-w-4xl items-center justify-center bg-[#151515]"><Loader2 className="h-6 w-6 animate-spin text-[#ff2933]" /></div>;
  }

  if (isError) {
    return <div className="pixel-panel mx-auto mt-8 flex min-h-[260px] max-w-lg flex-col items-center justify-center bg-[#151515] px-5 text-center"><Package className="h-8 w-8 text-[#ffcf3f]" /><p className="mt-4 text-sm font-bold text-white">PRODUCT FILE UNAVAILABLE</p><p className="mt-2 text-xs text-white/55">We could not load this product right now.</p><button className="pixel-button mt-5 px-4 py-3 text-[8px]" onClick={() => refetch()}>TRY AGAIN</button></div>;
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
          <DetailArtwork image={product.image} name={product.name} />
        </div>
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#ff5360]">{product.category || "LOG PRODUCT"}</p>
            <h1 className="mt-2 inline-block border-[3px] border-[#ffcf3f] bg-[#ffcf3f] px-2 py-2 text-sm leading-relaxed text-[#111] shadow-[3px_3px_0_#050505] sm:text-base">{product.name}</h1>
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
              <p className="mt-1 font-mono text-xl font-bold text-white">{total > 0 ? `$${(total / 100).toFixed(2)}` : "—"}</p>
            </div>
          </div>

          <button
            onClick={() => addToCartMutation.mutate()}
            disabled={!available || !selectedVariant || addToCartMutation.isPending}
            className="pixel-button flex min-h-11 w-full items-center justify-center gap-2 !bg-[#ff2933] px-3 py-3 text-[9px] !text-white disabled:cursor-not-allowed disabled:opacity-45"
            data-testid="button-add-product"
          >
            {addToCartMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {addToCartMutation.isPending ? "ADDING..." : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}