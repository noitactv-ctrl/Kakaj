import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Loader2, RotateCcw, Trophy } from "lucide-react";
import { useGames } from "@/hooks/use-games";
import { useAuth } from "@/hooks/use-auth";

const multipliers = [5, 2.2, 1.4, 0.7, 0.3, 0.7, 1.4, 2.2, 5];

export default function PlinkoGamePage() {
  const { user } = useAuth();
  const { playPlinko } = useGames();
  const [bet, setBet] = useState("1.00");
  const [landedSlot, setLandedSlot] = useState<number | null>(null);
  const [lastPayout, setLastPayout] = useState<number | null>(null);

  const balance = (user?.balance ?? 0) / 100;
  const betCents = Math.round(Number(bet) * 100);
  const validBet = Number.isFinite(betCents) && betCents > 0 && betCents <= Math.floor(balance * 100);
  const resultText = useMemo(() => {
    if (landedSlot === null || lastPayout === null) return "Pick a bet and drop the ball.";
    const multiplier = multipliers[landedSlot];
    return lastPayout > 0
      ? `Landed x${multiplier} · won $${(lastPayout / 100).toFixed(2)}`
      : `Landed x${multiplier} · no payout`;
  }, [landedSlot, lastPayout]);

  const play = () => {
    if (!validBet || playPlinko.isPending) return;
    setLandedSlot(null);
    setLastPayout(null);
    playPlinko.mutate(betCents, {
      onSuccess: ({ slot, payout }) => {
        setTimeout(() => {
          setLandedSlot(slot);
          setLastPayout(payout);
        }, 180);
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 border-b-[3px] border-[#233f9b] pb-5">
        <p className="pixel-text text-[9px] text-[#ffe177]">GAMES / PLINKO</p>
        <h1 className="mt-3 text-xl leading-relaxed text-white sm:text-2xl">DROP THE BALL</h1>
        <p className="mt-3 max-w-xl text-sm text-white/60">Choose a stake. The server picks the landing slot and settles every result against your wallet.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_285px]">
        <section className="pixel-panel bg-[#0e205f] p-3 sm:p-5">
          <div className="relative min-h-[420px] overflow-hidden border-[3px] border-black bg-[#1b48b8] px-3 pt-10">
            <div className="absolute inset-x-0 top-0 h-9 border-b-[3px] border-black bg-[#77a3ff] px-3 py-2">
              <p className="pixel-text text-[8px] text-[#11131f]">PLINKO BOARD · 8 ROWS</p>
            </div>

            <div className="mx-auto grid max-w-[530px] grid-cols-9 gap-x-1 gap-y-4 pt-8 sm:gap-x-2">
              {Array.from({ length: 72 }).map((_, index) => {
                const row = Math.floor(index / 9);
                const column = index % 9;
                return (
                  <span
                    key={index}
                    className={`mx-auto h-2.5 w-2.5 rounded-full border-2 border-[#0b1b50] bg-[#ffe39d] ${column < row || column > 8 - row ? "opacity-0" : ""}`}
                  />
                );
              })}
            </div>

            <span
              aria-label="Plinko ball"
              className="absolute top-14 h-5 w-5 rounded-full border-[3px] border-[#110b08] bg-[#ef2b2b] shadow-[2px_2px_0_#080808] transition-all duration-700 ease-in"
              style={{ left: landedSlot === null ? "calc(50% - 10px)" : `calc(${((landedSlot + 0.5) / 9) * 100}% - 10px)`, top: landedSlot === null ? "55px" : "350px" }}
            />

            <div className="absolute inset-x-2 bottom-3 grid grid-cols-9 gap-1">
              {multipliers.map((multiplier, index) => (
                <div
                  key={index}
                  className={`border-2 border-black py-2 text-center font-mono text-[10px] font-bold ${
                    index === landedSlot ? "bg-[#ee292b] text-white" : multiplier >= 2 ? "bg-[#ffe09b] text-[#17100b]" : "bg-[#78a3ff] text-[#0d173c]"
                  }`}
                >
                  {multiplier}x
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="pixel-panel h-fit bg-[#101b4c] p-4">
          <p className="pixel-text text-[9px] text-[#ffe177]">YOUR BET</p>
          <label className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-white/50">Amount (USD)</label>
          <div className="mt-2 flex border-[3px] border-black bg-[#080c20]">
            <span className="px-3 py-3 font-mono text-sm text-[#ffe177]">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={bet}
              onChange={event => setBet(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-3 pr-3 font-mono text-sm text-white outline-none"
              aria-label="Bet amount"
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[1, 5, 10].map(amount => (
              <button key={amount} onClick={() => setBet(amount.toFixed(2))} className="pixel-button py-2 text-[8px]">${amount}</button>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-white/55">Balance: <span className="text-[#ffe177]">${balance.toFixed(2)}</span></p>

          <button
            onClick={play}
            disabled={!validBet || playPlinko.isPending}
            className="pixel-button mt-5 flex w-full items-center justify-center gap-2 py-3 text-[9px] !bg-[#ee292b] !text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {playPlinko.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trophy className="h-3 w-3" />}
            {playPlinko.isPending ? "DROPPING..." : "DROP BALL"}
          </button>
          {!validBet && bet && <p className="mt-2 text-[10px] text-[#ff9d9d]">Enter a stake within your available balance.</p>}

          <div className="mt-5 border-t border-white/15 pt-4">
            <p className="pixel-text text-[8px] text-[#ffe177]">RESULT</p>
            <p className="mt-3 min-h-9 text-xs leading-relaxed text-white/75">{resultText}</p>
            {landedSlot !== null && (
              <button onClick={() => { setLandedSlot(null); setLastPayout(null); }} className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#ffe177] hover:text-white">
                <RotateCcw className="h-3 w-3" /> Reset board
              </button>
            )}
          </div>
          <Link href="/deposit" className="mt-5 block text-center text-[10px] text-[#ffe177] underline underline-offset-4">Need a balance? Top up</Link>
        </aside>
      </div>
    </div>
  );
}