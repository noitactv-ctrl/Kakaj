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

// Generate a unique hue from a string so each product has its own accent color
function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h % 360;
}

function ProductCard({ product, rank }: { product: any; rank: number }) {
  const lowestVariant = product.variants?.length > 0
    ? product.variants.reduce((a: any, b: any) => a.price < b.price ? a : b)
    : null;
  const lowestPrice = lowestVariant?.price ?? 0;
  const isTop1 = rank === 0;
  const isTop2 = rank === 1;

  const hue = nameToHue(product.name);

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
          border: isTop1
            ? "1.5px solid hsl(330 80% 62%)"
            : isTop2
            ? "1.5px solid hsla(330,80%,60%,0.45)"
            : "1.5px solid hsla(330,80%,60%,0.2)",
          borderRadius: 5,
          boxShadow: isTop1
            ? "0 0 18px hsla(330,80%,60%,0.25), 0 2px 6px rgba(0,0,0,0.7)"
            : "0 2px 6px rgba(0,0,0,0.55)",
          background: "#080810",
        }}
        data-testid={`card-product-${product.id}`}
      >
        {/* ── Auto background box ── */}
        <div
          className="w-full flex items-center justify-center relative overflow-hidden"
          style={{
            height: 90,
            background: `linear-gradient(135deg, hsl(${hue} 40% 8%) 0%, hsl(${hue} 55% 14%) 60%, hsl(${hue} 45% 10%) 100%)`,
          }}
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 50% 110%, hsla(${hue},70%,45%,0.35) 0%, transparent 70%)`,
          }} />
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
            background: `linear-gradient(90deg, transparent, hsl(${hue} 70% 55%), transparent)`,
          }} />
          {/* Product name centered */}
          <span
            className="relative z-10 font-black uppercase leading-tight tracking-tight text-white text-center px-2"
            style={{
              fontSize: nameFontSize,
              textShadow: `0 0 20px hsla(${hue},80%,70%,0.6), 0 2px 4px rgba(0,0,0,0.9)`,
              wordBreak: "break-word",
            }}
          >
            {product.name}
          </span>
          {/* Rank badge */}
          {(isTop1 || isTop2) && (
            <span
              className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{
                background: isTop1 ? "hsl(330 80% 58%)" : "hsla(330,80%,60%,0.2)",
                color: "#fff",
                border: isTop1 ? "none" : "1px solid hsla(330,80%,60%,0.4)",
              }}
            >
              {isTop1 ? "⚡ #1" : "🔥 #2"}
            </span>
          )}
        </div>

        {/* ── Info strip ── */}
        <div className="px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[8px] font-bold" style={{ color: `hsl(${hue} 65% 60%)` }}>
            foodplug<span style={{ color: "rgba(255,255,255,0.35)" }}>.lol</span>
          </span>
        </div>

        {/* ── Purchase strip ── */}
        <div
          className="w-full text-center text-[10px] font-black uppercase tracking-wider text-white py-2"
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
