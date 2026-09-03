import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  Coins,
  CreditCard,
  Crown,
  Lock,
  ReceiptText,
  Sparkles,
} from "lucide-react";

const RANKS = [
  {
    key: "newbie",
    label: "Newbie",
    emoji: "🌱",
    color: "text-white/60",
    bar: "#ffffff40",
    border: "border-white/10",
    glow: "",
    discount: 0,
    threshold: 0,
    next: 10000,
    benefit: "Start your member journey",
  },
  {
    key: "regular",
    label: "Regular",
    emoji: "⭐",
    color: "text-blue-400",
    bar: "#60a5fa",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/10",
    discount: 2,
    threshold: 10000,
    next: 50000,
    benefit: "2% off every eligible order",
  },
  {
    key: "vip",
    label: "VIP",
    emoji: "💎",
    color: "text-purple-400",
    bar: "#c084fc",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/10",
    discount: 5,
    threshold: 50000,
    next: 100000,
    benefit: "5% off every eligible order",
  },
  {
    key: "nyc",
    label: "NYC",
    emoji: "🗽",
    color: "text-amber-400",
    bar: "#fbbf24",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/10",
    discount: 10,
    threshold: 100000,
    next: null,
    benefit: "10% off every eligible order",
  },
];

function getRankIdx(totalDeposited: number) {
  if (totalDeposited >= 100000) return 3;
  if (totalDeposited >= 50000) return 2;
  if (totalDeposited >= 10000) return 1;
  return 0;
}

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function RanksPage() {
  const { data: rankData, isLoading } = useQuery<any>({
    queryKey: ["/api/user/rank"],
  });
  const [selectedTier, setSelectedTier] = useState(0);

  const totalDeposited = rankData?.totalDeposited ?? 0;
  const currentIdx = getRankIdx(totalDeposited);
  const current = RANKS[currentIdx];
  const next = RANKS[currentIdx + 1] ?? null;
  const selected = RANKS[selectedTier];
  const progress = next
    ? Math.min(
        100,
        Math.round(
          ((totalDeposited - current.threshold) /
            (next.threshold - current.threshold)) *
            100,
        ),
      )
    : 100;

  useEffect(() => {
    setSelectedTier(currentIdx);
  }, [currentIdx]);

  return (
    <div className="pixel-page min-h-screen pb-10">
      <div className="pixel-page pt-2">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="pixel-text text-[9px] text-[#ffe177]">
                REWARDS / MEMBER STATUS
              </p>
              <h1 className="mt-3 text-xl leading-relaxed text-white sm:text-2xl">
                RANKS
              </h1>
              <p className="mt-2 max-w-md font-mono text-[10px] leading-relaxed text-white/45">
                Deposit more, unlock better pricing, and keep your status for
                every order.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <Link href="/deposit">
                <span className="pixel-button inline-flex w-full items-center justify-center gap-1.5 px-2.5 py-2 text-[8px] sm:w-auto">
                  <Coins className="h-3 w-3" /> ADD BALANCE
                </span>
              </Link>
              <Link href="/orders">
                <span className="pixel-button inline-flex w-full items-center justify-center gap-1.5 px-2.5 py-2 text-[8px] sm:w-auto">
                  <ReceiptText className="h-3 w-3" /> ORDERS
                </span>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="pixel-panel bg-[#10215e] px-6 py-5">
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4 animate-pulse text-[#ffe177]" />
                  <span className="pixel-text text-[8px] text-white/60">
                    LOADING STATUS...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <section
                className={`pixel-panel ${current.border} ${current.glow} bg-[#19367f] p-4 shadow-lg sm:p-5`}
              >
                <div className="flex items-center justify-between border-b-[2px] border-black/25 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#ffe177]" />
                    <p className="pixel-text text-[8px] text-[#ffe177]">
                      CURRENT MEMBERSHIP
                    </p>
                  </div>
                  <span className="border border-[#ffe177]/40 bg-[#0a1645]/40 px-2 py-1 font-mono text-[8px] text-[#ffe177]">
                    TIER {currentIdx + 1} / {RANKS.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-16 w-16 place-items-center border-[3px] border-black bg-[#10215e] text-3xl shadow-[3px_3px_0_#080808]">
                        {current.emoji}
                      </span>
                      <div>
                        <p className={`text-2xl font-bold ${current.color}`}>
                          {current.label}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-[#c5d6ff]">
                          {current.benefit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-md">
                      <div className="border-[2px] border-black bg-[#10215e] px-3 py-2.5">
                        <p className="pixel-text text-[7px] text-white/45">
                          LIFETIME DEPOSIT
                        </p>
                        <p className="mt-1 font-mono text-sm font-bold text-white">
                          {dollars(totalDeposited)}
                        </p>
                      </div>
                      <div className="border-[2px] border-black bg-[#10215e] px-3 py-2.5">
                        <p className="pixel-text text-[7px] text-white/45">
                          MEMBER DISCOUNT
                        </p>
                        <p className={`mt-1 font-mono text-sm font-bold ${current.color}`}>
                          {current.discount > 0 ? `${current.discount}% OFF` : "NOT YET"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 lg:w-[300px]">
                    {next ? (
                      <div className="border-[2px] border-black/60 bg-[#0a1645]/65 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="pixel-text text-[7px] text-white/50">
                            NEXT UNLOCK
                          </p>
                          <p className={`font-mono text-[10px] font-bold ${next.color}`}>
                            {next.emoji} {next.label}
                          </p>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-3 font-mono text-[10px]">
                          <span className="text-white/65">{progress}% complete</span>
                          <span className="text-[#ffe177]">
                            {dollars(next.threshold)} total
                          </span>
                        </div>
                        <div className="mt-2 h-3 overflow-hidden border-[2px] border-black bg-[#050b25]">
                          <div
                            className="h-full transition-[width] duration-700 ease-out"
                            style={{ width: `${progress}%`, backgroundColor: current.bar }}
                          />
                        </div>
                        <p className="mt-2 font-mono text-[9px] leading-relaxed text-white/40">
                          {dollars(Math.max(0, next.threshold - totalDeposited))} more to unlock {next.discount}% off.
                        </p>
                      </div>
                    ) : (
                      <div className="border-[2px] border-[#f5d000] bg-[#0a1645]/65 p-3">
                        <p className="pixel-text text-[8px] text-[#ffe177]">
                          MAXIMUM TIER UNLOCKED
                        </p>
                        <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/65">
                          You receive {current.discount}% off eligible orders automatically.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="pixel-label">TIER ROADMAP</p>
                    <p className="mt-1 font-mono text-[10px] text-white/40">
                      Select a tier to inspect its benefits.
                    </p>
                  </div>
                  <span className="hidden font-mono text-[9px] text-[#ffe177]/60 sm:block">
                    {currentIdx + 1} UNLOCKED
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {RANKS.map((rank, index) => {
                    const isUnlocked = index <= currentIdx;
                    const isSelected = index === selectedTier;
                    return (
                      <button
                        key={rank.key}
                        type="button"
                        onClick={() => setSelectedTier(index)}
                        className={`group relative flex min-h-[150px] flex-col justify-between border-[3px] border-black p-3 text-left transition-all ${
                          isSelected
                            ? "bg-[#1f439b] shadow-[3px_3px_0_#ffe177]"
                            : isUnlocked
                              ? "bg-[#10215e] hover:bg-[#17337d]"
                              : "bg-[#0b153d] opacity-65 hover:opacity-90"
                        }`}
                        style={{
                          outline: isSelected ? `2px solid ${rank.bar}` : "none",
                        }}
                        aria-pressed={isSelected}
                        data-testid={`button-rank-${rank.key}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="grid h-10 w-10 place-items-center border-2 border-black bg-[#0b153d] text-xl">
                            {rank.emoji}
                          </span>
                          {isUnlocked ? (
                            <span className="flex items-center gap-1 font-mono text-[8px] text-[#72df7c]">
                              <Check className="h-3 w-3" /> UNLOCKED
                            </span>
                          ) : (
                            <Lock className="h-3 w-3 text-white/30" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-bold ${isUnlocked ? rank.color : "text-white/40"}`}>
                              {rank.label}
                            </p>
                            <ArrowRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-1 ${isSelected ? "text-[#ffe177]" : "text-white/25"}`} />
                          </div>
                          <p className="mt-1 font-mono text-[9px] text-white/35">
                            {rank.threshold === 0 ? "Starting tier" : `${dollars(rank.threshold)} deposited`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="pixel-panel bg-[#10215e] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center border-[3px] border-black bg-[#0a1645] text-xl">
                      {selected.emoji}
                    </span>
                    <div>
                      <p className="pixel-text text-[8px] text-[#ffe177]">
                        TIER BENEFIT
                      </p>
                      <h2 className={`mt-1 text-lg font-bold ${selected.color}`}>
                        {selected.label}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 border-l-2 border-[#28417e] pl-4 sm:pr-3">
                    <div>
                      <p className="pixel-text text-[7px] text-white/40">UNLOCK AT</p>
                      <p className="mt-1 font-mono text-xs text-white">
                        {selected.threshold === 0 ? "SIGN UP" : dollars(selected.threshold)}
                      </p>
                    </div>
                    <div>
                      <p className="pixel-text text-[7px] text-white/40">DISCOUNT</p>
                      <p className={`mt-1 font-mono text-xs font-bold ${selected.color}`}>
                        {selected.discount > 0 ? `${selected.discount}% OFF` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 border-t-2 border-[#28417e] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-[10px] text-white/55">
                    {selected.benefit}. Discounts apply automatically at checkout.
                  </p>
                  <Link href={selectedTier <= currentIdx ? "/cards" : "/deposit"}>
                    <span className="pixel-button inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-[8px] sm:w-auto">
                      {selectedTier <= currentIdx ? "SHOP CARDS" : "ADD BALANCE"} <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              </section>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/cards">
                  <span className="pixel-button flex items-center justify-between gap-3 px-3 py-3 text-[8px]">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" /> BROWSE CARD INVENTORY
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
                <Link href="/deposit">
                  <span className="pixel-button flex items-center justify-between gap-3 px-3 py-3 text-[8px]">
                    <span className="flex items-center gap-2">
                      <Coins className="h-3.5 w-3.5" /> BUILD YOUR BALANCE
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              <p className="text-center font-mono text-[10px] leading-relaxed text-white/30">
                Discounts apply automatically at checkout.
                <br />
                Rank progress is based on your total lifetime deposits.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}