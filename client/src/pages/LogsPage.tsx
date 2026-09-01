import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronDown, Loader2, Package, Search, ShieldX, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";

type Product = {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  category?: string | null;
  pinned?: boolean;
  variants: { id: number; price: number; comparePrice?: number | null; stockCount: number }[];
};

function ProductArtwork({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (product.image && !imageFailed) {
    return (
      <img
        src={product.image}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#161616]">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,transparent_48%,#3b3b3b_49%,transparent_51%),linear-gradient(45deg,transparent_48%,#262626_49%,transparent_51%)] [background-size:22px_22px]" />
      <div className="relative flex h-16 w-16 items-center justify-center border-[3px] border-[#777] bg-[#242424] text-[#a9a9a9] shadow-[4px_4px_0_#090909]">
        <Package className="h-8 w-8" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  const inStockVariants = product.variants?.filter(variant => variant.stockCount > 0) ?? [];
  const lowestVariant = inStockVariants.length
    ? inStockVariants.reduce((lowest, variant) => variant.price < lowest.price ? variant : lowest)
    : product.variants?.[0];
  const availableStock = inStockVariants.reduce((total, variant) => total + variant.stockCount, 0);
  const price = lowestVariant?.price ?? 0;
  const comparePrice = lowestVariant?.comparePrice;

  return (
    <Link href={`/product/${encodeURIComponent(product.name)}`}>
      <article
        className="group flex h-full cursor-pointer flex-col overflow-hidden border-[2px] border-[#292929] bg-[#151515] shadow-[3px_3px_0_#050505] transition-colors hover:border-[#555]"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative h-40 border-b-[2px] border-[#2a2a2a] sm:h-44">
          <ProductArtwork product={product} />
          {product.pinned && (
            <span className="absolute left-2 top-2 border-[2px] border-black bg-[#ffcf3f] px-1.5 py-1 text-[8px] font-bold text-black">
              FEATURED
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3">
          <div className="min-h-[45px]">
            <h2 className="line-clamp-2 text-sm font-bold leading-tight text-white">{product.name}</h2>
            {product.category && (
              <p className="mt-1 text-[10px] text-white/45">{product.category}</p>
            )}
          </div>
          <p className="line-clamp-2 min-h-[30px] text-[10px] leading-relaxed text-white/55">
            {product.description || "Digital product delivered after purchase."}
          </p>
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              <p className="text-[9px] text-white/40">PRICE PER LINE</p>
              <p className="mt-1 font-mono text-sm font-bold text-white">
                {price > 0 ? `$${(price / 100).toFixed(2)}` : "Unavailable"}
                {comparePrice && comparePrice > price && (
                  <span className="ml-1 text-[9px] text-white/30 line-through">${(comparePrice / 100).toFixed(2)}</span>
                )}
              </p>
            </div>
            <span className={`border-[2px] border-black px-1.5 py-1 text-[9px] font-bold ${availableStock > 0 ? "bg-[#ededed] text-black" : "bg-[#3f3f3f] text-white/55"}`}>
              {availableStock > 0 ? availableStock : "SOLD OUT"}
            </span>
          </div>
          <div className={`flex min-h-9 items-center justify-center gap-2 border-[2px] border-black px-2 py-2 text-[9px] font-bold text-white shadow-[2px_2px_0_#050505] ${availableStock > 0 ? "bg-[#ff2933] group-hover:bg-[#ff4650]" : "bg-[#555]"}`}>
            <ShoppingCart className="h-3.5 w-3.5" />
            {availableStock > 0 ? "PURCHASE" : "OUT OF STOCK"}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function LogsPage() {
  const { user } = useAuth();
  const { data: products, isLoading, isError } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(
      (products ?? [])
        .map(product => product.category)
        .filter((value): value is string => Boolean(value)),
    )).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (products ?? []).filter(product => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = !query || [product.name, product.description, product.category]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  if (isLoading) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#ff2933]" /></div>;
  }

  if (isError) {
    return <div className="flex min-h-[420px] items-center justify-center text-sm text-red-400">Failed to load products. Please refresh.</div>;
  }

  if (user?.isBanned) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="border-[3px] border-red-950 bg-red-950/20 p-8 text-center">
          <ShieldX className="mx-auto h-9 w-9 text-red-400" />
          <p className="mt-4 text-sm font-bold text-red-400">ACCOUNT RESTRICTED</p>
          <p className="mt-2 text-xs text-white/45">Contact support if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pixel-page space-y-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl leading-relaxed text-white sm:text-2xl">LOGS</h1>
          <p className="mt-1 text-xs text-white/45">Browse and purchase log products</p>
        </div>
        <Link href="/orders">
          <span className="pixel-button inline-flex items-center gap-2 !bg-[#ff2933] px-3 py-3 text-[8px] !text-white">
            <ShoppingCart className="h-3 w-3" />
            MY PURCHASES
          </span>
        </Link>
      </div>

      <section className="pixel-panel bg-[#151515] p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search logs..."
              className="pixel-input h-10 border-[#373737] bg-[#222] pl-10 text-xs text-white placeholder:text-white/35 focus:bg-[#292929]"
              data-testid="input-search-logs"
            />
          </div>
          <div className="relative sm:w-44">
            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="pixel-input h-10 appearance-none border-[#373737] bg-[#222] pr-8 text-xs text-white"
              data-testid="filter-product-category"
            >
              <option value="all">All Categories</option>
              {categories.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
        </div>
        <p className="mt-3 text-[10px] text-white/40">
          {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} available
        </p>
      </section>

      {filteredProducts.length === 0 ? (
        <div className="pixel-panel bg-[#151515] px-5 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-4 text-sm text-white/60">NO PRODUCTS FOUND</p>
          <p className="mt-2 text-xs text-white/35">Try another search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(product => <ProductTile key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}