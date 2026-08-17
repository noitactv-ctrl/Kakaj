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
        <div className="relative w-full aspect-square overflow-hidden flex flex-col items-center justify-center" style={{ background: "#08080e" }}>

          {/* Topographic SVG — same for every card */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g stroke="hsl(330 65% 42%)" strokeWidth="0.65" fill="none" opacity="0.6">
              {/* Horizontal contour lines spanning full height */}
              <path d="M-30,10 C20,2 70,22 120,8 S190,-4 240,14 S290,28 340,10"/>
              <path d="M-30,36 C15,28 65,48 115,34 S185,20 235,40 S288,54 338,36"/>
              <path d="M-30,62 C10,52 60,72 110,60 S180,44 230,64 S285,78 335,62"/>
              <path d="M-30,88 C5,78 55,98 105,86 S175,70 225,90 S282,104 332,88"/>
              <path d="M-30,114 C2,104 50,124 100,112 S172,96 220,116 S280,130 330,114"/>
              <path d="M-30,140 C0,130 47,150 97,138 S170,122 218,142 S278,156 328,140"/>
              <path d="M-30,166 C-2,156 44,176 94,164 S168,148 216,168 S276,184 326,166"/>
              <path d="M-30,192 C0,182 46,202 96,190 S169,174 217,194 S277,210 327,192"/>
              <path d="M-30,218 C1,208 47,228 97,216 S170,200 218,220 S278,236 328,218"/>
              <path d="M-30,244 C2,234 48,254 98,242 S171,226 219,246 S279,262 329,244"/>
              <path d="M-30,270 C3,260 49,280 99,268 S172,252 220,272 S280,288 330,270"/>
              <path d="M-30,296 C4,286 50,306 100,294 S173,278 221,298 S281,314 331,296"/>
              {/* Vertical contour lines spanning full height */}
              <path d="M30,-5 C38,40 32,85 44,130 S48,186 36,232 S30,278 42,325"/>
              <path d="M75,-5 C82,42 76,88 88,134 S91,190 79,236 S74,282 85,328"/>
              <path d="M120,-5 C126,44 119,92 130,138 S133,194 121,240 S116,286 127,332"/>
              <path d="M165,-5 C170,46 162,96 173,142 S175,198 163,244 S158,290 169,336"/>
              <path d="M210,-5 C214,48 205,98 215,145 S217,202 204,248 S200,294 210,340"/>
              <path d="M255,-5 C258,50 248,102 258,148 S259,206 246,252 S242,298 252,344"/>
              <path d="M300,-5 C302,52 292,106 301,152 S301,210 288,256 S284,302 293,348"/>
              <path d="M53,-5 C60,44 54,90 65,136 S68,192 56,238 S51,284 62,330"/>
              <path d="M98,-5 C104,46 97,94 108,140 S110,196 98,242 S93,288 104,334"/>
              <path d="M143,-5 C148,48 140,98 150,144 S152,200 140,246 S135,292 146,338"/>
              <path d="M188,-5 C192,50 183,102 193,148 S194,204 181,250 S177,296 188,342"/>
              <path d="M233,-5 C236,52 226,106 236,152 S236,208 223,254 S219,300 230,346"/>
              <path d="M278,-5 C280,54 270,108 280,154 S279,212 266,258 S262,304 272,350"/>
            </g>
            {/* Bottom pink radial glow */}
            <defs>
              <radialGradient id="cardGlow" cx="50%" cy="100%" r="65%">
                <stop offset="0%" stopColor="hsl(330,80%,52%)" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="hsl(330,80%,52%)" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="320" height="320" fill="url(#cardGlow)"/>
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
