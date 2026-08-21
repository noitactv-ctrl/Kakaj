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
    product.name.length > 18 ? "0.7rem"
    : product.name.length > 12 ? "0.88rem"
    : product.name.length > 7  ? "1.05rem"
    : "1.25rem";

  return (
    <Link href={`/product/${encodeURIComponent(product.name)}`}>
      <div
        className="cursor-pointer select-none overflow-hidden flex flex-col transition-all duration-150 hover:brightness-105 active:scale-[0.97]"
        style={{
          borderRadius: 8,
          border: isTop1
            ? "1.5px solid hsl(25 58% 52%)"
            : "1.5px solid rgba(255,255,255,0.1)",
          boxShadow: isTop1
            ? "0 0 16px hsla(25,58%,46%,0.25), 0 2px 8px rgba(0,0,0,0.7)"
            : "0 2px 8px rgba(0,0,0,0.6)",
        }}
        data-testid={`card-product-${product.id}`}
      >
        {/* ── Square topo image area ── */}
        <div className="relative w-full aspect-square overflow-hidden flex flex-col items-center justify-center" style={{ background: "#09090f" }}>

          {/* Topographic SVG — white contour lines like reference */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g stroke="rgba(255,255,255,0.13)" strokeWidth="1" fill="none">
              <path d="M-30,18  C30,8  80,28  140,14 S220,-2  280,18 S330,34 370,18"/>
              <path d="M-30,38  C28,26 78,48  138,34 S218,16  278,38 S328,54 368,38"/>
              <path d="M-30,58  C26,46 76,68  136,54 S216,34  276,58 S326,74 366,58"/>
              <path d="M-30,78  C24,66 74,88  134,74 S214,52  274,78 S324,94 364,78"/>
              <path d="M-30,100 C22,88 72,108 132,96 S212,72  272,100 S322,116 362,100"/>
              <path d="M-30,122 C20,110 70,130 130,118 S210,94  270,122 S320,138 360,122"/>
              <path d="M-30,144 C18,132 68,152 128,140 S208,116 268,144 S318,160 358,144"/>
              <path d="M-30,166 C16,154 66,174 126,162 S206,138 266,166 S316,182 356,166"/>
              <path d="M-30,188 C14,176 64,196 124,184 S204,160 264,188 S314,204 354,188"/>
              <path d="M-30,210 C12,198 62,218 122,206 S202,182 262,210 S312,226 352,210"/>
              <path d="M-30,232 C10,220 60,240 120,228 S200,204 260,232 S310,248 350,232"/>
              <path d="M-30,254 C8,242 58,262 118,250 S198,226 258,254 S308,270 348,254"/>
              <path d="M-30,276 C6,264 56,284 116,272 S196,248 256,276 S306,292 346,276"/>
              <path d="M-30,298 C4,286 54,306 114,294 S194,270 254,298 S304,314 344,298"/>
              <path d="M18,-10  C22,50 16,110 26,160 S28,220 18,310"/>
              <path d="M54,-10  C58,50 52,110 62,160 S64,220 54,310"/>
              <path d="M90,-10  C94,50 88,110 98,160 S100,220 90,310"/>
              <path d="M126,-10 C130,50 124,110 134,160 S136,220 126,310"/>
              <path d="M162,-10 C166,50 160,110 170,160 S172,220 162,310"/>
              <path d="M198,-10 C202,50 196,110 206,160 S208,220 198,310"/>
              <path d="M234,-10 C238,50 232,110 242,160 S244,220 234,310"/>
              <path d="M270,-10 C274,50 268,110 278,160 S280,220 270,310"/>
            </g>
            {/* Bottom radial glow — copper */}
            <defs>
              <radialGradient id="cg2" cx="50%" cy="100%" r="65%">
                <stop offset="0%" stopColor="hsl(25,58%,42%)" stopOpacity="0.62"/>
                <stop offset="100%" stopColor="hsl(25,58%,42%)" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="300" height="300" fill="url(#cg2)"/>
          </svg>

          {/* Dark overlay — heavier at top */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 55%,rgba(0,0,0,0) 100%)" }}/>

          {/* Rank badge */}
          {(isTop1 || isTop2) && (
            <span className="absolute top-1.5 left-1.5 z-20 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{
                background: isTop1 ? "hsl(25 58% 45%)" : "hsla(25,58%,50%,0.15)",
                color: "#fff",
                border: isTop1 ? "none" : "1px solid hsla(25,58%,50%,0.4)",
              }}>
              {isTop1 ? "⚡ #1" : "🔥 #2"}
            </span>
          )}

          {/* Product name — centered, large, bold */}
          <span
            className="relative z-10 font-black uppercase text-center leading-tight px-3"
            style={{
              fontSize: nameFontSize,
              color: "#fff",
              textShadow: "0 0 30px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,1)",
              wordBreak: "break-word",
              letterSpacing: "0.02em",
            }}
          >
            {product.name}
          </span>

          {/* Branding */}
          <span className="relative z-10 mt-2 text-[9px] font-bold tracking-wide" style={{ color: "hsl(25 65% 60%)" }}>
            foodplug<span style={{ color: "rgba(255,255,255,0.45)" }}>.lol</span>
          </span>

          {/* Bottom separator line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: "hsl(25 62% 50%)" }}/>
        </div>

        {/* ── Product name strip ── */}
        <div className="px-3 py-2 text-center" style={{ background: "#0e0e1a" }}>
          <p className="text-[0.7rem] font-bold text-white/85 leading-snug line-clamp-2">
            {product.name}
          </p>
        </div>

        {/* ── Purchase button ── */}
        <div
          className="w-full text-center text-[0.7rem] font-black uppercase tracking-wider text-white py-2"
          style={{ background: "hsl(25 58% 38%)" }}
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
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[hsl(25_58%_50%)]" /></div>;
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
          style={{ color: "hsl(25 65% 58%)", textShadow: "0 0 30px hsla(25,60%,45%,0.35)" }}
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
