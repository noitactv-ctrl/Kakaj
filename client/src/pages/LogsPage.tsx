import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Package, Search, ShieldX, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";

type Product = {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  category?: string | null;
  pinned?: boolean;
  variants: { id: number; name: string; price: number; comparePrice?: number | null; stockCount: number }[];
};

function ProductArtwork({ product }: { product: Product }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#202020] text-[#a0a0a0]">
      <Package className="h-7 w-7" strokeWidth={1.8} />
    </div>
  );
}

function ProductTile({ product, onCategorySelect }: { product: Product; onCategorySelect: (category: string) => void }) {
  const [, setLocation] = useLocation();
  const inStockVariants = product.variants?.filter(variant => variant.stockCount > 0) ?? [];
  const lowestVariant = inStockVariants.length
    ? inStockVariants.reduce((lowest, variant) => variant.price < lowest.price ? variant : lowest)
    : product.variants?.[0];
  const availableStock = inStockVariants.reduce((total, variant) => total + variant.stockCount, 0);
  const price = lowestVariant?.price ?? 0;
  const comparePrice = lowestVariant?.comparePrice;
  const options = product.variants ?? [];

  const openProduct = () => setLocation(`/product/${encodeURIComponent(product.name)}`);

  return (
      <article
        role="link"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProduct();
          }
        }}
        className="store-log-card group flex h-full min-h-[258px] cursor-crosshair flex-col overflow-hidden rounded-2xl bg-[#10215e] p-4 shadow-[4px_4px_0_#050505] transition-colors hover:bg-[#163078] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff2933]"
        data-testid={`card-product-${product.id}`}
      >
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#1d3d93]">
            <ProductArtwork product={product} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="truncate text-sm font-bold leading-tight text-[#f4f4f4]">{product.name}</h2>
            {product.category && (
              <button
                type="button"
                className="pixel-button mt-1.5 inline-flex max-w-full truncate !min-h-0 !border-2 !px-2 !py-1 !text-[8px] !leading-none transition-colors hover:!bg-[#ee292b] hover:!text-white"
                onClick={event => {
                  event.stopPropagation();
                  onCategorySelect(product.category!);
                }}
                aria-label={`Filter by ${product.category}`}
              >
                {product.category}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 min-h-[43px]">
          <p className="pixel-label">OPTIONS</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {options.length > 0 ? options.map(option => (
              <span
                key={option.id}
                className={`rounded-md bg-[#0a1645] px-2 py-1 text-[10px] font-mono text-white/80 ${option.stockCount === 0 ? "text-white/30 line-through" : ""}`}
              >
                {option.name}
              </span>
            )) : (
              <span className="text-[10px] font-mono text-white/40">No options available</span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#abbceb]">Starting price</span>
            <span className="font-bold text-[#f4f4f4]">
              {price > 0 ? `$${(price / 100).toFixed(2)}` : "Unavailable"}
              {comparePrice && comparePrice > price && (
                <span className="ml-1.5 text-[10px] font-normal text-[#686868] line-through">${(comparePrice / 100).toFixed(2)}</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#abbceb]">Available stock</span>
            <span className="min-w-6 rounded-md bg-[#eeeeee] px-1.5 py-0.5 text-center text-[10px] font-bold text-[#202020]">
              {availableStock}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-3">
          <div className={`pixel-button flex h-10 w-full items-center justify-center gap-2 !border-2 !text-[8px] transition-colors ${availableStock > 0 ? "!bg-[#ee292b] !text-white group-hover:!bg-[#ff414a]" : "!bg-[#3a3a3a] !text-[#999]"}`}>
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>{availableStock > 0 ? "Add to cart" : "Out of stock"}</span>
          </div>
        </div>
      </article>
  );
}

export default function LogsPage() {
  const { user } = useAuth();
  const { data: products, isLoading, isError, refetch } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const normalizeCategory = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
  const categories = useMemo(
    () => Array.from(
      (products ?? [])
        .map(product => product.category?.trim().replace(/\s+/g, " "))
        .filter((value): value is string => Boolean(value))
        .reduce((map, value) => map.set(normalizeCategory(value), map.get(normalizeCategory(value)) ?? value), new Map<string, string>()),
    )
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (products ?? []).filter(product => {
      const matchesCategory = category === "all" || (product.category ? normalizeCategory(product.category) === category : false);
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
    return (
      <div className="pixel-panel mx-auto flex min-h-[260px] max-w-lg flex-col items-center justify-center bg-[#151515] px-5 text-center">
        <Package className="h-8 w-8 text-[#ffcf3f]" />
        <p className="mt-4 text-sm font-bold text-white">CATALOG UNAVAILABLE</p>
        <p className="mt-2 text-xs leading-relaxed text-white/55">The log shelf did not respond. Try again in a moment.</p>
        <button className="pixel-button mt-5 px-4 py-3 text-[8px]" onClick={() => refetch()}>RETRY CATALOG</button>
      </div>
    );
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
    <div className="pixel-page space-y-4 pb-8">
      <div className="pixel-panel sticky top-[68px] z-30 space-y-3 bg-[#10276a] px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl leading-relaxed text-white sm:text-2xl">LOGS</h1>
            <p className="mt-1 text-xs text-white/55">Browse and add log products to your cart</p>
          </div>
          <Link href="/orders">
            <span className="pixel-button inline-flex items-center gap-2 !bg-[#ff2933] px-3 py-3 text-[8px] !text-white">
              <ShoppingCart className="h-3 w-3" />
              MY PURCHASES
            </span>
          </Link>
        </div>
        <div className="relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#725d42]" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="SEARCH LOGS..."
              className="pixel-input h-11 pl-10 text-xs"
              data-testid="input-search-logs"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t-2 border-black/60 pt-3" data-testid="filter-product-category">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`pixel-button px-3 py-2 text-[8px] ${category === "all" ? "!bg-[#ee292b] !text-white" : ""}`}
          >
            ALL CATEGORIES
          </button>
          {categories.map(option => (
            <button
              type="button"
              key={option.key}
              onClick={() => setCategory(option.key)}
              className={`pixel-button px-3 py-2 text-[8px] ${category === option.key ? "!bg-[#ee292b] !text-white" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#ffe177]">
          {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} available
        </p>
       </div>

      {filteredProducts.length === 0 ? (
        <div className="pixel-panel bg-[#151515] px-5 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-4 text-sm text-white/60">NO PRODUCTS FOUND</p>
          <p className="mt-2 text-xs text-white/35">Try another search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
           {filteredProducts.map(product => (
             <ProductTile
               key={product.id}
               product={product}
               onCategorySelect={value => setCategory(normalizeCategory(value))}
             />
           ))}
        </div>
      )}
    </div>
  );
}