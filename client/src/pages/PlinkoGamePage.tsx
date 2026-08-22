import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Loader2, RotateCcw, Trophy } from "lucide-react";
import { useGames } from "@/hooks/use-games";
import { useAuth } from "@/hooks/use-auth";

const BOARD_ROWS = 16;
const PEG_STEP = 5.8;
const multipliers = [20, 10, 5, 5, 2, 1, 0.75, 0.5, 0.3, 0.5, 0.75, 1, 2, 5, 5, 10, 20];
type DropResult = { slot: number; multiplier: number; payout: number; newBalance?: number; path: number[] };

export default function PlinkoGamePage() {
  const { user } = useAuth();
  const { playPlinko } = useGames();
  const [bet, setBet] = useState("1.00");
  const [dropCount, setDropCount] = useState<1 | 10 | 20>(1);
  const [landedSlots, setLandedSlots] = useState<number[]>([]);
  const [lastPayout, setLastPayout] = useState<number | null>(null);
  const [dropResults, setDropResults] = useState<DropResult[]>([]);
  const [ballPositions, setBallPositions] = useState<Record<number, { x: number; top: number }>>({});
  const [batchPayoutTotal, setBatchPayoutTotal] = useState(0);
  const [recentDrops, setRecentDrops] = useState<DropResult[]>([]);
  const [isSettled, setIsSettled] = useState(false);

  const balanceCents = user?.balance ?? 0;
  const balance = balanceCents / 100;
  const parsedBet = bet.trim();
  const betCents = /^\d+(?:\.\d{1,2})?$/.test(parsedBet) ? Math.round(Number(parsedBet) * 100) : 0;
  const totalBetCents = betCents * dropCount;
  const validBet = Number.isInteger(betCents) && betCents > 0 && totalBetCents <= balanceCents;
  const isDropping = playPlinko.isPending || (dropResults.length > 0 && !isSettled);
  const resultText = useMemo(() => {
    if (isDropping) {
      return dropResults.length > 1
        ? `Dropping all ${dropResults.length} balls through the board...`
        : "The ball is bouncing through the board...";
    }
    if (landedSlots.length === 0 || lastPayout === null) return "Pick a bet and drop the ball.";
    if (dropResults.length > 1) {
      return `Completed ${dropResults.length} drops · total payout $${(batchPayoutTotal / 100).toFixed(2)}`;
    }
    const multiplier = dropResults[0]?.multiplier ?? multipliers[landedSlots[0]];
    return lastPayout > 0
      ? `Landed x${multiplier} · won $${(lastPayout / 100).toFixed(2)}`
      : `Landed x${multiplier} · no payout`;
  }, [isDropping, dropResults.length, landedSlots, lastPayout, batchPayoutTotal]);

  useEffect(() => {
    if (dropResults.length === 0) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setBallPositions(Object.fromEntries(dropResults.map((_, index) => [index, { x: 50, top: 5 }])));

    dropResults.forEach((drop, ballIndex) => {
      let rightSteps = 0;
      drop.path.forEach((direction, pathIndex) => {
        const row = pathIndex + 1;
        if (direction === 1) rightSteps += 1;
        const x = 50 + (rightSteps - row / 2) * PEG_STEP;
        timers.push(setTimeout(() => {
          if (cancelled) return;
          setBallPositions(previous => ({
            ...previous,
            [ballIndex]: { x, top: 7 + (row / BOARD_ROWS) * 74 },
          }));
        }, pathIndex * 75));
      });
    });

    timers.push(setTimeout(() => {
      if (cancelled) return;
      setBallPositions(Object.fromEntries(dropResults.map((drop, index) => [
        index,
         { x: 50 + (drop.slot - (multipliers.length - 1) / 2) * PEG_STEP, top: 89 },
      ])));
      setLandedSlots(dropResults.map(drop => drop.slot));
      setLastPayout(dropResults[dropResults.length - 1].payout);
      setRecentDrops(previous => [...dropResults.slice().reverse(), ...previous].slice(0, 6));
      setIsSettled(true);
    }, BOARD_ROWS * 75 + 160));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [dropResults]);

  const play = () => {
    if (!validBet || isDropping) return;
    setLandedSlots([]);
    setLastPayout(null);
    setDropResults([]);
    setBallPositions({});
    setBatchPayoutTotal(0);
    setIsSettled(false);
    playPlinko.mutate({ betAmount: betCents, count: dropCount }, {
      onSuccess: data => {
        const results = data.results?.length ? data.results : [data];
        setDropResults(results);
        setBatchPayoutTotal(results.reduce((total, result) => total + result.payout, 0));
      },
    });
  };

  const resetBoard = () => {
    setLandedSlots([]);
    setLastPayout(null);
    setDropResults([]);
    setBallPositions({});
    setBatchPayoutTotal(0);
    setIsSettled(false);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 border-b-[3px] border-[#233f9b] pb-5">
        <p className="pixel-text text-[9px] text-[#ffe177]">GAMES / PLINKO</p>
        <h1 className="mt-3 text-xl leading-relaxed text-white sm:text-2xl">DROP THE BALL</h1>
        <p className="mt-3 max-w-xl text-sm text-white/60">Provably fair · instant drop.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        <section className="pixel-panel bg-[#0e205f] p-3 sm:p-5">
          <div className="plinko-board relative min-h-[470px] overflow-hidden border-[3px] border-black bg-[#122d88] px-2 pt-10 sm:min-h-[500px]">
            <div className="absolute inset-x-0 top-0 h-9 border-b-[3px] border-black bg-[#77a3ff] px-3 py-2">
              <p className="pixel-text text-[8px] text-[#11131f]">PLINKO BOARD · {BOARD_ROWS} ROWS</p>
            </div>

            <div className="absolute inset-x-0 bottom-[58px] top-12">
              {Array.from({ length: BOARD_ROWS - 1 }).flatMap((_, rowIndex) => {
                const row = rowIndex + 1;
                return Array.from({ length: row + 1 }).map((__, column) => (
                  <span
                    key={`${row}-${column}`}
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-[#0b1b50] bg-[#ffe39d] shadow-[0_0_7px_#c9dcff]"
                    style={{
                      left: `${50 + (column - row / 2) * PEG_STEP}%`,
                      top: `${4 + (row / BOARD_ROWS) * 78}%`,
                    }}
                  />
                ));
              })}
            </div>

            {dropResults.map((_, index) => {
              const position = ballPositions[index] ?? { x: 50, top: 5 };
              return (
                <span
                  key={`ball-${index}`}
                  aria-label={`Plinko ball ${index + 1}`}
                  className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#110b08] bg-[#ef2b2b] shadow-[2px_2px_0_#080808] transition-[left,top] duration-75 ease-linear"
                  style={{ left: `${position.x}%`, top: `${position.top}%` }}
                />
              );
            })}

            <div className="absolute inset-x-2 bottom-3 grid grid-cols-[repeat(17,minmax(0,1fr))] gap-0.5">
              {multipliers.map((multiplier, index) => (
                <div
                  key={index}
                  className={`border-2 border-black py-2 text-center font-mono text-[8px] font-bold sm:text-[9px] ${
                    landedSlots.includes(index) && isSettled ? "bg-[#ee292b] text-white" : multiplier >= 5 ? "bg-[#ffe09b] text-[#17100b]" : multiplier < 1 ? "bg-[#78a3ff] text-[#0d173c]" : "bg-[#c27ac7] text-[#17100b]"
                  }`}
                >
                  {multiplier}x
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="pixel-panel bg-[#101b4c] p-4">
            <p className="pixel-text text-[9px] text-[#ffe177]">RECENT DROPS</p>
            <div className="mt-3 max-h-36 overflow-y-auto border-[3px] border-black bg-[#0a1235]">
              {recentDrops.length === 0 ? (
                <p className="p-3 text-[10px] text-white/50">No drops yet. Your results will appear here.</p>
              ) : (
                recentDrops.map((drop, index) => (
                  <div key={`${drop.slot}-${index}`} className="flex items-center justify-between border-b border-white/10 px-2.5 py-2 font-mono text-[9px] last:border-0">
                    <span className="text-white/65">DROP {recentDrops.length - index}</span>
                    <span className="text-[#76e27b]">x{drop.multiplier}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="pixel-panel h-fit bg-[#101b4c] p-4">
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
           <label className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-white/50">Drops per click</label>
           <div className="mt-2 grid grid-cols-3 gap-2">
             {([1, 10, 20] as const).map(count => (
               <button
                 key={count}
                 onClick={() => setDropCount(count)}
                 className={`pixel-button py-2 text-[8px] ${dropCount === count ? "!bg-[#ee292b] !text-white" : ""}`}
                 disabled={isDropping}
               >
                 {count === 1 ? "1 DROP" : `DROP ${count}`}
               </button>
             ))}
           </div>
          <p className="mt-3 font-mono text-xs text-white/55">Balance: <span className="font-bold text-[#ffe177]">${balance.toFixed(2)}</span></p>

          <button
            onClick={play}
            disabled={!validBet || isDropping}
            className="pixel-button mt-5 flex w-full items-center justify-center gap-2 py-3 text-[9px] !bg-[#ee292b] !text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDropping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trophy className="h-3 w-3" />}
             {isDropping ? "DROPPING..." : dropCount === 1 ? "DROP BALL" : `DROP ${dropCount} BALLS`}
          </button>
           {!validBet && bet && <p className="mt-2 text-[10px] text-[#ff9d9d]">Enter a valid amount within your balance for {dropCount} drop{dropCount === 1 ? "" : "s"}.</p>}

          <div className="mt-5 border-t border-white/15 pt-4">
            <p className="pixel-text text-[8px] text-[#ffe177]">RESULT</p>
            <p className="mt-3 min-h-9 text-xs leading-relaxed text-white/75">{resultText}</p>
            {landedSlots.length > 0 && (
              <button onClick={resetBoard} className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#ffe177] hover:text-white">
                <RotateCcw className="h-3 w-3" /> Reset board
              </button>
            )}
          </div>
          <Link href="/deposit" className="mt-5 block text-center text-[10px] text-[#ffe177] underline underline-offset-4">Need a balance? Top up</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}