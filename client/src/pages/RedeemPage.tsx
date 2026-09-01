import { FormEvent, useState } from "react";
import { Gift, Loader2, ShieldCheck } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const { redeemCode } = useWallet();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    redeemCode.mutate(normalized, {
      onSuccess: () => setCode(""),
    });
  }

  return (
    <div className="pixel-page mx-auto max-w-xl space-y-5 pb-8">
      <div>
        <h1 className="text-xl leading-relaxed text-white sm:text-2xl">REDEEM CODE</h1>
        <p className="mt-1 text-xs text-white/45">Use a reward code to add credit to your wallet.</p>
      </div>

      <section className="pixel-panel space-y-5 bg-[#151515] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff2933] text-[#121212]">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Enter your code</h2>
            <p className="mt-1 text-xs text-white/45">Codes can only be used once.</p>
          </div>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="pixel-label">REDEEM CODE</span>
            <input
              value={code}
              onChange={event => setCode(event.target.value.toUpperCase())}
              placeholder="VOUCH-XXXXXXXX"
              autoComplete="off"
              className="pixel-input h-12 w-full border-[#373737] bg-[#222] font-mono text-sm uppercase tracking-wider text-white placeholder:text-white/25"
              data-testid="input-redeem-code"
            />
          </label>
          <button
            type="submit"
            disabled={!code.trim() || redeemCode.isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#ff2933] text-sm font-bold text-[#121212] transition-colors hover:bg-[#ff414a] disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="button-redeem-code"
          >
            {redeemCode.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {redeemCode.isPending ? "REDEEMING..." : "REDEEM"}
          </button>
        </form>

        <div className="flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#ffcf3f]" />
          <p>Redeemed rewards are added as wallet credit and are separate from deposits or payment history.</p>
        </div>
      </section>
    </div>
  );
}