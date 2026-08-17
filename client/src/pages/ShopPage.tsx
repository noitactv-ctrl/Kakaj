import { useProducts } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldX, Search, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function ProductCard({ product, rank }: { product: any; rank: number }) {
  const lowestVariant = product.variants?.length > 0
    ? product.variants.reduce((a: any, b: any) => a.price < b.price ? a : b)
    : null;
  const lowestPrice = lowestVariant?.price ?? 0;
  const isTop1 = rank === 0;
  const isTop2 = rank === 1;

  // font scale based on name length
  const nameFontSize =
    product.name.length > 20 ? "0.6rem"
    : product.name.length > 14 ? "0.72rem"
    : product.name.length > 9  ? "0.85rem"
    : "1.05rem";

  return (
    <Link href={`/product/${encodeURIComponent(product.name)}`}>
      <div
        className="cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] flex flex-col select-none overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0c0c14 0%, #080810 100%)",
          border: isTop1
            ? "1.5px solid hsl(330 80% 62%)"
            : isTop2
            ? "1.5px solid hsla(330,80%,60%,0.45)"
            : "1.5px solid hsla(330,80%,60%,0.2)",
          borderRadius: 5,
          boxShadow: isTop1
            ? "0 0 18px hsla(330,80%,60%,0.28), 0 2px 6px rgba(0,0,0,0.7)"
            : "0 2px 6px rgba(0,0,0,0.55)",
        }}
        data-testid={`card-product-${product.id}`}
      >
        {/* ── Body ── */}
        <div className="flex flex-col items-center justify-between px-2.5 pt-3 pb-2 gap-1.5 text-center flex-1">

          {/* Rank badge */}
          {(isTop1 || isTop2) && (
            <span
              className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded self-start"
              style={{
                background: isTop1 ? "hsl(330 80% 58%)" : "hsla(330,80%,60%,0.14)",
                color: isTop1 ? "#fff" : "hsl(330 80% 65%)",
                border: isTop1 ? "none" : "1px solid hsla(330,80%,60%,0.35)",
              }}
            >
              {isTop1 ? "⚡ #1" : "🔥 #2"}
            </span>
          )}

          {/* Product name */}
          <span
            className="font-black uppercase leading-tight tracking-tight text-white w-full"
            style={{
              fontSize: nameFontSize,
              textShadow: "0 0 16px rgba(255,255,255,0.18)",
              wordBreak: "break-word",
            }}
          >
            {product.name}
          </span>

          {/* Branding */}
          <span className="text-[8px] font-bold tracking-wide" style={{ color: "hsl(330 75% 58%)" }}>
            foodplug<span style={{ color: "rgba(255,255,255,0.4)" }}>.lol</span>
          </span>

          {/* Image (if available) */}
          {product.image ? (
            <div
              className="w-full mt-1 overflow-hidden flex items-center justify-center"
              style={{
                height: 58,
                background: "#050508",
                border: "1px solid hsla(330,80%,60%,0.2)",
                borderRadius: 4,
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* ── Purchase strip ── */}
        <div
          className="w-full text-center text-[10px] font-black uppercase tracking-wider text-white py-2 mt-1"
          style={{
            background: "linear-gradient(90deg, hsl(330 80% 48%) 0%, hsl(330 75% 40%) 100%)",
          }}
        >
          Purchase | {lowestPrice > 0 ? `$${(lowestPrice / 100).toFixed(2)}` : "Free"}
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const { user } = useAuth();
  const { data: products, isLoading, isError } = useProducts();
  const { data: topProducts } = useQuery<any[]>({
    queryKey: ["/api/products/top-selling"],
    refetchInterval: 60 * 60 * 1000,
  });
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [shuffleSeed] = useState(() => Math.random() * 233280);

  const topIds: number[] = useMemo(() => (topProducts ?? []).map((p: any) => p.id), [topProducts]);

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const shuffled = seededShuffle([...products], shuffleSeed);
    if (topIds.length === 0) return shuffled;
    const top = topIds.map((id) => shuffled.find((p: any) => p.id === id)).filter(Boolean);
    const rest = shuffled.filter((p: any) => !topIds.includes(p.id));
    return [...top, ...rest];
  }, [products, shuffleSeed, topIds]);

  const filtered = useMemo(() => {
    let base = sortedProducts;
    if (activeFilter !== "all") base = base.filter((p: any) => p.name === activeFilter);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((p: any) =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [sortedProducts, search, activeFilter]);

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[hsl(330_80%_60%)]" /></div>;
  }

  if (isError) {
    return <div className="flex h-[50vh] items-center justify-center text-sm text-red-400">Failed to load products. Please refresh.</div>;
  }

  if (user?.isBanned) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-3">
          <ShieldX className="h-8 w-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-400 font-bold">Account Restricted</p>
          <p className="text-xs text-white/40 leading-relaxed">Your account has been restricted. Contact support if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 pb-8">
      {/* ── Hero ── */}
      <div className="text-center pt-8 pb-6 space-y-1">
        <h1
          className="text-3xl sm:text-4xl font-black tracking-wide uppercase"
          style={{ color: "hsl(330 80% 60%)", textShadow: "0 0 30px hsla(330,80%,60%,0.4)" }}
        >
          foodplug
        </h1>
        <p className="text-sm text-white/50">Providing high quality accounts and cards since 2023.</p>
      </div>

      {/* ── Search + filter row ── */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
          <input
            type="text"
            placeholder="Search for a Product"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded border border-white/10 bg-[#0d0d18] pl-9 pr-4 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
            data-testid="input-search"
          />
        </div>
        <div className="relative">
          <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value)}
            className="h-10 rounded border border-white/10 bg-[#0d0d18] text-sm text-white/80 pl-8 pr-8 outline-none cursor-pointer appearance-none focus:border-primary/50 transition-colors"
            data-testid="filter-select"
          >
            <option value="all">All</option>
            {sortedProducts.map((p: any) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-sm bg-primary block" />
            ))}
          </div>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        </div>
      </div>

      {/* ── Count ── */}
      <p className="text-xs text-white/30 mb-4">
        Total found: <span className="text-white/60 font-semibold">{filtered.length}</span>
      </p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/40 text-sm">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((product: any) => {
            const rank = !search.trim() ? topIds.indexOf(product.id) : -1;
            return <ProductCard key={product.id} product={product} rank={rank} />;
          })}
        </div>
      )}
    </div>
  );
}
