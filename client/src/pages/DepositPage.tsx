import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2, Clock, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, ExternalLink
} from "lucide-react";
import { SiBitcoin, SiCashapp } from "react-icons/si";
import { calculateDepositCredit, DEPOSIT_BONUS_TIERS } from "@shared/deposit";
import { CashAppQrCode } from "@/components/CashAppQrCode";

type Method = "crypto" | "cashapp";

type Deposit = {
  id: string;
  type: string;
  amount: number;
  status: string;
  paymentId?: string;
  checkoutUrl?: string;
  paymentNote?: string;
  createdAt: string;
};

type ManualResult = { note: string; handle: string; url: string; amount: number; method: Method };

function methodColor(type: string) {
  if (type === "cashapp") return "#00D632";
  return "#F7931A";
}
function methodLabel(type: string) {
  if (type === "cashapp") return "CashApp";
  return "Crypto";
}

function StatusBadge({ status }: { status: string }) {
  if (["completed","delivering","fulfilled"].includes(status))
    return <span className="flex items-center gap-1 text-[10px] font-mono text-green-400"><CheckCircle2 className="h-3 w-3" />credited</span>;
  if (["failed","expired"].includes(status))
    return <span className="flex items-center gap-1 text-[10px] font-mono text-red-400/70"><XCircle className="h-3 w-3" />{status}</span>;
  if (status === "underpaid")
    return <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400/70"><AlertTriangle className="h-3 w-3" />underpaid</span>;
  return <span className="flex items-center gap-1 text-[10px] font-mono text-white/30 animate-pulse"><Clock className="h-3 w-3" />pending</span>;
}

function DepositRow({ deposit }: { deposit: Deposit }) {
  const isCredited = ["completed","delivering","fulfilled"].includes(deposit.status);
  const color = methodColor(deposit.type);
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
      isCredited ? "bg-green-950/10 border-green-900/15" :
      ["failed","expired"].includes(deposit.status) ? "bg-red-950/10 border-red-900/15" :
      "bg-white/[0.02] border-white/[0.05]"
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: `${color}18`, color }}>
          {deposit.type === "crypto" ? "₿" : deposit.type.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-white">
              {deposit.amount > 0 ? `$${(deposit.amount / 100).toFixed(2)}` : "pending"}
            </span>
            <StatusBadge status={deposit.status} />
          </div>
          <p className="text-[9px] text-white/20 font-mono">{methodLabel(deposit.type)} · {new Date(deposit.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      {deposit.checkoutUrl && !isCredited && (
        <a href={deposit.checkoutUrl} target="_blank" rel="noopener noreferrer" className="ml-2 flex-shrink-0 text-white/20 hover:text-white/60 transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}


/* ── MANUAL DEPOSIT PANEL ── */
function ManualDepositPanel({ result, onReset }: { result: ManualResult; onReset: () => void }) {
  const name = methodLabel(result.method);

  return (
    <div className="overflow-hidden border-[3px] border-[#080f2c] bg-[#18296d] text-[#fff0c5]">
      <div className="flex items-center gap-2 border-b-[2px] border-[#0e1b4e] bg-[#18296d] px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D632] text-[#071509]">
          <SiCashapp className="h-4 w-4" aria-label="Cash App" />
        </div>
        <p className="text-sm font-bold text-[#fff0c5]">Send via {name}</p>
      </div>
      <div className="space-y-3 bg-[#18296d] p-4">
        {result.url && <CashAppQrCode url={result.url} amountCents={result.amount} note={result.note} />}
        <p className="text-[10px] text-white/20 font-mono text-center">include the exact note · admin will confirm and credit balance</p>
        <button onClick={onReset} className="w-full text-[11px] text-white/25 hover:text-white/50 transition-colors font-mono pt-1" data-testid="btn-new-deposit">
          ← create new deposit
        </button>
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════
   MAIN DEPOSIT PAGE
══════════════════════════════════════════════ */
export default function DepositPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [manualResult, setManualResult] = useState<ManualResult | null>(null);

  const { data: manualMethods } = useQuery<{
    cashapp: { enabled: boolean; tag: string; url: string; fee: number };
  }>({ queryKey: ["/api/site-settings/manual-payments"] });

  const { data: minDeposits } = useQuery<Record<string, number>>({
    queryKey: ["/api/site-settings/min-deposits"],
  });

  const { data: deposits, refetch: refetchDeposits } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits"],
    enabled: !!user,
    refetchInterval: 20000,
  });

  const cashappEnabled = manualMethods?.cashapp.enabled !== false;

  function minimumForMethod(method: string | null) {
    if (method === "crypto") return Math.max(1, minDeposits?.crypto ?? 0);
    if (method) return Math.max(0.01, minDeposits?.[method] ?? 0);
    return 0.01;
  }

  const selectedMinimum = minimumForMethod(selectedOption);
  const parsedAmount = parseFloat(amountInput) || 0;
  const amountCents = Math.max(0, Math.round(parsedAmount * 100));
  const selectedFeePercent = selectedOption === "cashapp" ? (manualMethods?.cashapp?.fee ?? 0) : 0;
  const depositCredit = calculateDepositCredit(amountCents, selectedFeePercent);
  const activeTier = DEPOSIT_BONUS_TIERS.find(tier =>
    amountCents >= tier.minCents && (tier.maxCents === null || amountCents <= tier.maxCents)
  );

  const recentDeposits = deposits?.slice(0, 15) ?? [];

  /* ── Crypto mutation ── */
  const cryptoMutation = useMutation({
    mutationFn: async () => {
      const amount = parsedAmount;
      const cryptoMin = Math.max(1, minDeposits?.crypto ?? 0);
      if (!amount || amount < cryptoMin) throw new Error(`Minimum deposit is $${cryptoMin.toFixed(2)}`);
      const res = await apiRequest("POST", "/api/payments/crypto/create", {
        amount: String(Math.round(amount * 100)),
        purpose: "deposit",
      });
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/deposits"] });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({ title: "Error", description: "Payment provider did not return a checkout link.", variant: "destructive" });
      }
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  /* ── Manual mutations ── */
  async function createManual(endpoint: string, method: Method) {
    const amount = parsedAmount;
    if (!amount || amount < 0.01) throw new Error("Enter the amount you want to deposit");
    const min = minDeposits?.[method] ?? 0;
    if (min > 0 && amount < min) throw new Error(`Minimum deposit for ${methodLabel(method)} is $${min.toFixed(2)}`);
    const res = await apiRequest("POST", endpoint, { amount });
    return res.json();
  }

  const cashappMutation = useMutation({
    mutationFn: () => createManual("/api/orders/cashapp", "cashapp"),
    onSuccess: (data) => {
      setManualResult({
        note: data.paymentNote,
        handle: data.cashappTag || manualMethods?.cashapp.tag || "",
        url: data.cashappUrl || manualMethods?.cashapp.url || "",
        amount: Math.round(parsedAmount * 100),
        method: "cashapp",
      });
      qc.invalidateQueries({ queryKey: ["/api/deposits"] });
      qc.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const isManualPending = cashappMutation.isPending;
  const isPending = cryptoMutation.isPending || isManualPending;

  function feeLabel(fee: number | undefined) {
    if (!fee || fee === 0) return "0% fee";
    return `${fee}% fee`;
  }

  const paymentOptions = [
    { id: "crypto", label: "Crypto", sub: "BTC · ETH · LTC · SOL · USDT", Icon: SiBitcoin, color: "#F7931A", fee: "0% fee" },
    ...(cashappEnabled ? [{ id: "cashapp", label: "CashApp", sub: "instant", Icon: SiCashapp, color: "#00D632", fee: feeLabel(manualMethods?.cashapp?.fee) }] : []),
  ];

  const selected = paymentOptions.find(o => o.id === selectedOption) || null;
  const isSelectedCrypto = selectedOption === "crypto";

  function handleContinue() {
    if (!selectedOption) return;
    if (parsedAmount < 5) {
      setAmountInput("5.00");
      return;
    }
    if (isSelectedCrypto) cryptoMutation.mutate();
    else if (selectedOption === "cashapp") cashappMutation.mutate();
  }

  function handlePaymentMethodSelect(method: string) {
    setSelectedOption(method);
  }

  function handleAmountChange(value: string) {
    setAmountInput(value);
  }

  return (
    <div className="pixel-page min-h-screen flex flex-col">
      <div className="pixel-page flex-1 space-y-4">
        {manualResult ? (
          <ManualDepositPanel result={manualResult} onReset={() => { setManualResult(null); setSelectedOption(null); setAmountInput(""); }} />
        ) : (
          <div className="pixel-panel space-y-4 bg-[#10215e] p-4 sm:p-5">
            <div className="space-y-2">
              <p className="pixel-label">ENTER AMOUNT</p>
              <input
                 type="text"
                 inputMode="decimal"
                placeholder={selectedOption ? `Minimum $${selectedMinimum.toFixed(2)}` : "Enter amount in USD"}
                value={amountInput}
                onChange={e => handleAmountChange(e.target.value)}
                className="pixel-input h-12"
                data-testid="input-amount"
              />
              {selectedOption ? (
                <p className="font-mono text-[10px] leading-relaxed text-[#abbceb]">
                  {selectedOption === "crypto"
                    ? `Minimum $${selectedMinimum.toFixed(2)} for BTC (Bitcoin). You must send the exact crypto amount shown (not USD). Wrong amount = no credit.`
                    : `Minimum $${selectedMinimum.toFixed(2)} for ${selected?.label ?? "this method"}.`}
                </p>
              ) : (
                <p className="font-mono text-[10px] text-[#abbceb]">Pick a payment method below — your balance credits automatically.</p>
              )}
              {selectedOption && amountCents >= Math.round(selectedMinimum * 100) && (
                <div className="flex items-center justify-between border-[3px] border-black bg-[#0a1645] px-3 py-3">
                  <span className="text-[10px] font-bold text-white">You receive</span>
                  <span className="font-mono text-sm font-bold text-[#ffe177]">${(depositCredit.creditCents / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-[3px] border-black bg-[#0a1645] p-4">
              <p className="pixel-label">BONUS TIERS</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {DEPOSIT_BONUS_TIERS.slice(0, 5).map(tier => (
                  <div key={tier.minCents} className={`border-[3px] border-black px-4 py-3 text-center ${activeTier?.minCents === tier.minCents ? "bg-[#43b94e]" : "bg-[#152d75]"}`}>
                    <p className="font-mono text-[10px] text-white/75">${tier.minCents / 100}{tier.maxCents ? "+" : ""}</p>
                    <p className={`pixel-text mt-1 text-[8px] ${activeTier?.minCents === tier.minCents ? "text-white" : "text-[#72df7c]"}`}>+{tier.bonusPercent}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="pixel-label">CHOOSE A PAYMENT METHOD</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {paymentOptions.map(opt => {
                  const isActive = selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePaymentMethodSelect(opt.id)}
                      className={`flex min-h-20 flex-col items-center justify-center gap-1.5 border-[3px] border-black px-2 py-2 transition-all ${isActive ? "bg-[#2555c5] shadow-[2px_2px_0_#ffe177]" : "bg-[#0b1849] hover:bg-[#17337d]"}`}
                      style={{
                        outline: isActive ? `2px solid ${opt.color}` : "none",
                      }}
                      data-testid={`btn-payment-${opt.id}`}
                    >
                      <opt.Icon className="h-5 w-5 flex-shrink-0" style={{ color: opt.color }} />
                      <span className="pixel-text text-[8px] text-white">{opt.label}</span>
                      <span className="font-mono text-[9px] text-white/55">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedOption || isPending || !amountInput || parsedAmount <= 0}
              className="w-full border-[3px] border-black bg-[#43b94e] py-3 pixel-text text-[9px] text-white transition-colors hover:bg-[#31973a] disabled:opacity-40"
              data-testid="btn-continue-deposit"
            >
              {isPending ? "PROCESSING..." : selected ? `TOPUP WITH ${selected.label.toUpperCase()}` : "SELECT A METHOD"}
            </button>
          </div>
        )}

        {recentDeposits.length > 0 && (
          <div className="pixel-panel space-y-2 bg-[#10215e] p-3">
            <div className="flex items-center justify-between">
              <p className="pixel-label">DEPOSIT HISTORY</p>
              <button onClick={() => refetchDeposits()} className="text-[#ffe177] hover:text-white transition-colors" data-testid="btn-refresh-deposits">
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {recentDeposits.map(dep => <DepositRow key={dep.id} deposit={dep} />)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
