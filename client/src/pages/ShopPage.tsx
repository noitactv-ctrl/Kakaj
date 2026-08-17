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
  const hasImage = !!product.image;
  const isTop1 = rank === 0;
  const isTop2 = rank === 1;

  return (
    <Link href={`/product/${encodeURIComponent(product.name)}`}>
      <div
        className="rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] flex flex-col"
        style={{
          background: "#0d0d18",
          border: isTop1
            ? "1.5px solid hsl(330 80% 60%)"
            : isTop2
            ? "1.5px solid hsla(330,80%,60%,0.55)"
            : "1.5px solid hsla(330,80%,60%,0.25)",
          boxShadow: isTop1
            ? "0 0 18px hsla(330,80%,60%,0.35), inset 0 0 0 0.5px hsla(330,80%,60%,0.1)"
            : isTop2
            ? "0 0 10px hsla(330,80%,60%,0.18)"
            : "0 0 6px hsla(330,80%,60%,0.08)",
        }}
        data-testid={`card-product-${product.id}`}
      >
        {/* Image / placeholder area */}
        <div
          className="relative w-full flex flex-col items-center justify-center overflow-hidden"
          style={{
            height: 120,
            background: hasImage
              ? "#0a0a14"
              : "linear-gradient(135deg, #0f0f2a 0%, #0a1a3a 40%, #0d1f4a 100%)",
          }}
        >
          {/* Blue wave overlay for no-image cards */}
          {!hasImage && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 8px,
                  hsla(330,80%,60%,0.15) 8px,
                  hsla(330,80%,60%,0.15) 9px
                )`,
              }}
            />
          )}

          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="relative flex flex-col items-center justify-center w-full h-full px-3 text-center">
              <span
                className="text-2xl font-black uppercase tracking-widest select-none leading-tight"
                style={{
                  color: "rgba(255,255,255,0.12)",
                  textShadow: "0 0 20px hsla(330,80%,60%,0.3)",
                }}
              >
                PLACEHOLDER
              </span>
              <span className="text-[9px] font-bold mt-1" style={{ color: "hsl(330 80% 60%)", opacity: 0.7 }}>
                foodplug
              </span>
            </div>
          )}

          {/* Rank badges */}
          {isTop1 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-[hsl(330_80%_60%)] text-white shadow">
              ⚡ Top 1
            </div>
          )}
          {isTop2 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-[hsl(330_80%_60%)]/50 text-[hsl(330_80%_60%)] bg-[hsl(330_80%_60%)]/10">
              🔥 Top 2
            </div>
          )}

          {/* Blue bottom glow line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, hsla(330,80%,60%,0.6), transparent)" }}
          />
        </div>

        {/* Info */}
        <div className="px-3 pt-2.5 pb-3 space-y-2">
          <p className="text-[13px] font-bold text-white leading-tight line-clamp-2">{product.name}</p>
          <button
            className="w-full py-2 rounded text-white text-xs font-bold text-center transition-all hover:opacity-90"
            style={{ background: "linear-gradient(90deg, hsl(330 80% 60%), hsl(330 80% 60%))" }}
          >
            Purchase | {lowestPrice > 0 ? `$${(lowestPrice / 100).toFixed(2)}` : "Free"}
          </button>
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
      <div className="flex gap-2 mb-6">
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
          {/* grid icon */}
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-sm bg-primary block" />
            ))}
          </div>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        </div>
      </div>

      {/* ── Hot Products heading ── */}
      <h2 className="text-base font-bold text-white text-center mb-4">Hot Products</h2>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/40 text-sm">No products found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((product: any) => {
            const rank = !search.trim() ? topIds.indexOf(product.id) : -1;
            return <ProductCard key={product.id} product={product} rank={rank} />;
          })}
        </div>
      )}
    </div>
  );
}
