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

  return (
    <Link href={`/product/${encodeURIComponent(product.name)}`}>
      <div
        className="cursor-pointer group select-none overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
        style={{
          borderRadius: 6,
          border: isTop1
            ? "1px solid hsl(330 80% 58%)"
            : "1px solid hsla(330,80%,60%,0.18)",
          boxShadow: isTop1
            ? "0 0 14px hsla(330,80%,55%,0.22), 0 2px 6px rgba(0,0,0,0.6)"
            : "0 1px 4px rgba(0,0,0,0.5)",
          background: "#0b0b14",
        }}
        data-testid={`card-product-${product.id}`}
      >
        {/* ── Background panel ── */}
        <div className="relative w-full aspect-square overflow-hidden" style={{ background: "#08080e" }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g stroke="hsl(330 60% 38%)" strokeWidth="0.6" fill="none" opacity="0.55">
              <path d="M-20,8  C15,2  50,16 90,8  S145,-2 185,10 S215,20 240,8"/>
              <path d="M-20,22 C12,16 48,30 88,22 S143,10 183,24 S213,34 238,22"/>
              <path d="M-20,36 C10,28 46,44 86,36 S141,22 181,38 S211,48 236,36"/>
              <path d="M-20,50 C8, 42 44,58 84,50 S139,36 179,52 S209,62 234,50"/>
              <path d="M-20,64 C6, 56 42,72 82,64 S137,50 177,66 S207,76 232,64"/>
              <path d="M-20,78 C4, 70 40,86 80,78 S135,64 175,80 S205,90 230,78"/>
              <path d="M-20,92 C2, 84 38,100 78,92 S133,78 173,94 S203,104 228,92"/>
              <path d="M-20,106 C0,98 36,114 76,106 S131,92 171,108 S201,118 226,106"/>
              <path d="M20,-4  C24,26 20,54 28,80  S30,100 22,124"/>
              <path d="M55,-4  C59,26 55,54 63,80  S65,100 57,124"/>
              <path d="M90,-4  C94,26 90,54 98,80  S100,100 92,124"/>
              <path d="M125,-4 C129,26 125,54 133,80 S135,100 127,124"/>
              <path d="M160,-4 C164,26 160,54 168,80 S170,100 162,124"/>
              <path d="M195,-4 C199,26 195,54 203,80 S205,100 197,124"/>
            </g>
            <defs>
              <radialGradient id="cg" cx="50%" cy="100%" r="70%">
                <stop offset="0%" stopColor="hsl(330,78%,48%)" stopOpacity="0.65"/>
                <stop offset="100%" stopColor="hsl(330,78%,48%)" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="200" height="120" fill="url(#cg)"/>
          </svg>

          {/* top-left badge */}
          {(isTop1 || isTop2) && (
            <span className="absolute top-1 left-1 z-20 text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm"
              style={{
                background: isTop1 ? "hsl(330 80% 52%)" : "hsla(330,80%,60%,0.15)",
                color: "#fff",
                border: isTop1 ? "none" : "1px solid hsla(330,80%,60%,0.35)",
              }}>
              {isTop1 ? "⚡ #1" : "🔥 #2"}
            </span>
          )}

          {/* Price pill — top right */}
          <span
            className="absolute top-1 right-1 z-20 text-[8px] font-black tabular-nums px-1.5 py-0.5 rounded-sm"
            style={{ background: "rgba(0,0,0,0.55)", color: "hsl(330 80% 70%)", border: "1px solid hsla(330,80%,60%,0.25)" }}
          >
            {lowestPrice > 0 ? `$${(lowestPrice / 100).toFixed(2)}` : "Free"}
          </span>

          {/* bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px]"
            style={{ background: "linear-gradient(90deg, transparent 0%, hsl(330,80%,54%) 30%, hsl(330,85%,60%) 50%, hsl(330,80%,54%) 70%, transparent 100%)" }} />
        </div>

        {/* ── Info strip ── */}
        <div className="px-2.5 py-2 flex items-center justify-between gap-1">
          <span
            className="font-bold text-white leading-tight truncate"
            style={{ fontSize: "0.68rem", letterSpacing: "0.02em" }}
          >
            {product.name}
          </span>
          <span className="shrink-0 text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-sm transition-colors group-hover:bg-[hsl(330,80%,48%)]"
            style={{ background: "hsl(330 80% 42%)", color: "#fff" }}>
            Buy
          </span>
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
  const [activeCategory, setActiveCategory] = useState<string>("all");
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

  const categories = useMemo(() => {
    if (!sortedProducts) return [];
    const cats = [...new Set(sortedProducts.map((p: any) => p.category).filter(Boolean))];
    return cats.sort();
  }, [sortedProducts]);

  const filtered = useMemo(() => {
    let base = sortedProducts;
    if (activeCategory !== "all") base = base.filter((p: any) => p.category === activeCategory);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((p: any) =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [sortedProducts, search, activeCategory]);

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
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="h-10 rounded border border-white/10 bg-[#0d0d18] text-sm text-white/80 pl-8 pr-8 outline-none cursor-pointer appearance-none focus:border-primary/50 transition-colors"
            data-testid="filter-select"
          >
            <option value="all">All</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {filtered.map((product: any) => {
            const rank = !search.trim() ? topIds.indexOf(product.id) : -1;
            return <ProductCard key={product.id} product={product} rank={rank} />;
          })}
        </div>
      )}
    </div>
  );
}
