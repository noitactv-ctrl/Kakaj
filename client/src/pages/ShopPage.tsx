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
        {/* Image area */}
        <div
          className="relative w-full flex flex-col items-center justify-center overflow-hidden"
          style={{ height: 130, background: "#080808" }}
        >
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <>
              {/* Topographic contour SVG pattern */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 320 130"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="hsl(330 70% 45%)" strokeWidth="0.7" fill="none" opacity="0.55">
                  <path d="M-20,20 C20,10 60,35 100,18 S160,5 200,22 S260,40 300,20 S340,8 380,25"/>
                  <path d="M-20,30 C15,22 55,45 95,28 S158,14 198,32 S258,50 298,30 S338,18 380,35"/>
                  <path d="M-20,42 C10,34 52,56 90,40 S152,24 195,44 S255,62 295,42 S336,28 380,46"/>
                  <path d="M-20,56 C5,46 48,68 86,54 S148,36 192,56 S252,76 292,56 S334,40 380,58"/>
                  <path d="M-20,8 C25,2 65,22 105,8 S165,-5 205,12 S265,28 305,10 S342,0 380,14"/>
                  <path d="M30,0 C40,15 35,35 50,50 S55,75 45,95 S38,115 50,135"/>
                  <path d="M80,0 C88,18 82,40 95,55 S100,78 90,100 S83,118 95,138"/>
                  <path d="M130,0 C136,20 128,44 140,60 S144,82 133,104 S127,122 138,142"/>
                  <path d="M180,0 C184,22 175,46 186,63 S188,86 177,108 S172,125 182,145"/>
                  <path d="M230,0 C232,24 222,48 232,66 S232,90 220,112 S216,128 226,148"/>
                  <path d="M275,0 C278,26 268,50 278,68 S277,93 265,115 S261,131 270,150"/>
                  <path d="M-10,70 C8,60 42,80 78,68 S135,52 172,70 S228,88 268,70 S318,55 360,72"/>
                  <path d="M-15,86 C4,74 38,94 74,82 S130,64 168,82 S224,100 264,82 S315,66 360,84"/>
                  <path d="M-18,100 C0,88 35,106 70,96 S127,78 164,96 S220,112 260,95 S312,78 358,97"/>
                  <path d="M10,0 C22,12 18,30 28,45 S30,68 20,88 S14,108 24,128"/>
                  <path d="M55,0 C64,14 59,34 70,48 S73,72 62,92 S56,112 67,132"/>
                  <path d="M105,0 C112,16 106,38 116,53 S119,76 108,98 S102,118 112,138"/>
                  <path d="M155,0 C160,18 153,42 162,58 S164,80 153,102 S148,121 157,142"/>
                  <path d="M205,0 C208,20 200,44 208,61 S209,84 198,106 S194,124 202,145"/>
                  <path d="M255,0 C256,22 247,46 255,63 S254,87 243,109 S239,127 247,148"/>
                  <path d="M305,0 C304,24 295,48 302,65 S300,90 289,112 S285,130 292,150"/>
                </g>
                {/* Bottom pink radial glow */}
                <defs>
                  <radialGradient id={`glow-${product.id}`} cx="50%" cy="100%" r="60%">
                    <stop offset="0%" stopColor="hsl(330,80%,55%)" stopOpacity="0.55"/>
                    <stop offset="100%" stopColor="hsl(330,80%,55%)" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="320" height="130" fill={`url(#glow-${product.id})`}/>
              </svg>

              {/* Dark overlay gradient — top dark, bottom slightly lit */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.0) 100%)"
              }}/>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-3 text-center gap-1">
                <span
                  className="font-black uppercase select-none leading-tight tracking-tight"
                  style={{
                    fontSize: product.name.length > 14 ? "0.75rem" : product.name.length > 10 ? "0.9rem" : "1.1rem",
                    color: "#ffffff",
                    textShadow: "0 0 18px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {product.name}
                </span>
                <span className="text-[9px] font-bold" style={{ color: "hsl(330 80% 60%)" }}>
                  foodplug<span className="text-white">.lol</span>
                </span>
              </div>

              {/* Bottom pink line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px]"
                style={{ background: "linear-gradient(90deg, transparent 0%, hsl(330,80%,60%) 30%, hsl(330,80%,55%) 50%, hsl(330,80%,60%) 70%, transparent 100%)" }}
              />
            </>
          )}

          {/* Rank badges */}
          {isTop1 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-[hsl(330_80%_60%)] text-white shadow z-20">
              ⚡ Top 1
            </div>
          )}
          {isTop2 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-[hsl(330_80%_60%)]/50 text-[hsl(330_80%_60%)] bg-[hsl(330_80%_60%)]/10 z-20">
              🔥 Top 2
            </div>
          )}
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
