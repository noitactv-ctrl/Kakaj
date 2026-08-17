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

  const nameFontSize =
    product.name.length > 20 ? "0.62rem"
    : product.name.length > 14 ? "0.78rem"
    : product.name.length > 9  ? "0.95rem"
    : "1.15rem";

  return (
    <Link href={`/product/${encodeURIComponent(product.name)}`}>
      <div
        className="cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] flex flex-col select-none overflow-hidden"
        style={{
          border: isTop1
            ? "1.5px solid hsl(330 80% 62%)"
            : isTop2
            ? "1.5px solid hsla(330,80%,60%,0.45)"
            : "1.5px solid hsla(330,80%,60%,0.22)",
          borderRadius: 5,
          boxShadow: isTop1
            ? "0 0 18px hsla(330,80%,60%,0.25), 0 2px 8px rgba(0,0,0,0.7)"
            : "0 2px 8px rgba(0,0,0,0.55)",
        }}
        data-testid={`card-product-${product.id}`}
      >
        {/* ── Card face — topographic background ── */}
        <div className="relative w-full overflow-hidden flex flex-col items-center justify-center" style={{ height: 120, background: "#08080e" }}>

          {/* Topographic SVG — same for every card */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g stroke="hsl(330 65% 42%)" strokeWidth="0.65" fill="none" opacity="0.6">
              <path d="M-30,10 C20,2 70,22 120,8 S190,-4 240,14 S290,28 340,10"/>
              <path d="M-30,22 C15,14 65,34 115,20 S185,6 235,26 S288,40 338,22"/>
              <path d="M-30,36 C10,26 60,48 110,34 S180,18 230,38 S285,54 335,36"/>
              <path d="M-30,52 C5,40 55,62 105,50 S175,32 225,52 S282,68 332,52"/>
              <path d="M-30,68 C2,56 50,78 100,66 S172,48 220,68 S280,84 330,68"/>
              <path d="M-30,84 C0,72 47,94 97,82 S170,62 218,84 S278,100 328,84"/>
              <path d="M-30,100 C-2,88 44,108 94,98 S168,78 216,100 S276,116 326,100"/>
              <path d="M30,-5 C38,14 32,35 44,52 S48,76 36,98 S30,115 42,128"/>
              <path d="M75,-5 C82,16 76,38 88,56 S91,80 79,102 S74,118 85,130"/>
              <path d="M120,-5 C126,18 119,42 130,60 S133,84 121,106 S116,122 127,132"/>
              <path d="M165,-5 C170,20 162,46 173,64 S175,88 163,110 S158,126 169,136"/>
              <path d="M210,-5 C214,22 205,48 215,67 S217,92 204,114 S200,130 210,140"/>
              <path d="M255,-5 C258,24 248,52 258,70 S259,96 246,118 S242,134 252,144"/>
              <path d="M300,-5 C302,26 292,54 301,73 S301,100 288,122 S284,138 293,148"/>
              <path d="M53,0 C60,18 54,40 65,57 S68,82 56,104 S51,120 62,132"/>
              <path d="M98,0 C104,20 97,44 108,62 S110,86 98,108 S93,124 104,136"/>
              <path d="M143,0 C148,22 140,47 150,66 S152,90 140,112 S135,128 146,140"/>
              <path d="M188,0 C192,24 183,50 193,69 S194,94 181,116 S177,132 188,144"/>
              <path d="M233,0 C236,26 226,54 236,72 S236,98 223,120 S219,136 230,148"/>
              <path d="M278,0 C280,28 270,56 280,75 S279,102 266,124 S262,140 272,152"/>
            </g>
            {/* Bottom pink radial glow */}
            <defs>
              <radialGradient id="cardGlow" cx="50%" cy="100%" r="65%">
                <stop offset="0%" stopColor="hsl(330,80%,52%)" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="hsl(330,80%,52%)" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="320" height="120" fill="url(#cardGlow)"/>
          </svg>

          {/* Dark overlay — stronger at top, fades toward bottom glow */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)" }} />

          {/* Rank badge */}
          {(isTop1 || isTop2) && (
            <span className="absolute top-1.5 left-1.5 z-20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{
                background: isTop1 ? "hsl(330 80% 55%)" : "hsla(330,80%,60%,0.18)",
                color: "#fff",
                border: isTop1 ? "none" : "1px solid hsla(330,80%,60%,0.4)",
              }}>
              {isTop1 ? "⚡ #1" : "🔥 #2"}
            </span>
          )}

          {/* Product name */}
          <span
            className="relative z-10 font-black uppercase text-center px-3 leading-tight"
            style={{
              fontSize: nameFontSize,
              color: "#ffffff",
              textShadow: "0 0 24px rgba(255,255,255,0.55), 0 2px 6px rgba(0,0,0,0.9)",
              wordBreak: "break-word",
            }}
          >
            {product.name}
          </span>

          {/* Branding */}
          <span className="relative z-10 mt-1.5 text-[9px] font-bold" style={{ color: "hsl(330 80% 62%)" }}>
            foodplug<span style={{ color: "rgba(255,255,255,0.5)" }}>.lol</span>
          </span>

          {/* Bottom pink line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px]"
            style={{ background: "linear-gradient(90deg, transparent 0%, hsl(330,80%,58%) 25%, hsl(330,85%,62%) 50%, hsl(330,80%,58%) 75%, transparent 100%)" }} />
        </div>

        {/* ── Purchase strip ── */}
        <div
          className="w-full text-center text-[10px] font-black uppercase tracking-wider text-white py-2"
          style={{ background: "linear-gradient(90deg, hsl(330 80% 44%) 0%, hsl(330 75% 38%) 100%)" }}
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
