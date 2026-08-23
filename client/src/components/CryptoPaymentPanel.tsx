import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { Check, CheckCircle2, Clock, Copy, ExternalLink, Loader2, RefreshCw, X, XCircle } from "lucide-react";
import { CryptoCoinIcon } from "@/components/CryptoCoinSelector";

export type CryptoInvoiceData = {
  paymentId: string;
  checkoutUrl: string;
  currency: string;
  cryptoAmount?: string;
  paymentAddress?: string;
  paymentUri?: string;
  expiresAt?: number;
  usdAmountCents: number;
  orderId?: number;
};

type CryptoPaymentPanelProps = {
  invoice: CryptoInvoiceData;
  coinName?: string;
  coinTicker?: string;
  coinColor?: string;
  onReset: () => void;
  onPaymentComplete?: (orderId?: number) => void;
};

function statusCopy(status: string) {
  if (status === "completed" || status === "fulfilled") return { label: "Payment confirmed", color: "text-[#67e68c]" };
  if (status === "failed" || status === "expired") return { label: status === "expired" ? "Invoice expired" : "Payment failed", color: "text-[#ff8585]" };
  if (status === "underpaid") return { label: "Waiting for the full amount", color: "text-[#ffe177]" };
  return { label: "Waiting for payment", color: "text-[#aab6e6]" };
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permissions are optional; the value remains visible for manual copying.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex min-w-0 items-center gap-2 text-left font-mono text-[10px] font-bold text-[#fff0c5] hover:text-white"
      aria-label={`Copy ${label}`}
    >
      <span className="min-w-0 break-all">{value}</span>
      {copied ? <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#67e68c]" /> : <Copy className="h-3.5 w-3.5 flex-shrink-0 text-[#aab6e6]" />}
    </button>
  );
}

export function CryptoPaymentPanel({
  invoice,
  coinName = invoice.currency,
  coinTicker = invoice.currency,
  coinColor = "#4f7cff",
  onReset,
  onPaymentComplete,
}: CryptoPaymentPanelProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const completionNotified = useRef(false);
  const qrValue = invoice.paymentUri || invoice.paymentAddress || invoice.checkoutUrl;
  const { data: paymentStatus, refetch, isFetching } = useQuery<{
    status: string;
    orderId?: number;
  }>({
    queryKey: ["/api/payments/crypto", invoice.paymentId, "status"],
    queryFn: async () => {
      const response = await fetch(`/api/payments/crypto/${encodeURIComponent(invoice.paymentId)}/status`);
      if (!response.ok) throw new Error("Unable to refresh payment status");
      return response.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ["completed", "fulfilled", "failed", "expired"].includes(status) ? false : 5000;
    },
  });

  useEffect(() => {
    let mounted = true;
    setQrDataUrl("");
    QRCode.toDataURL(qrValue, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#080b16", light: "#ffffff" },
    }).then((dataUrl) => {
      if (mounted) setQrDataUrl(dataUrl);
    }).catch((error) => console.error("Could not create crypto QR code:", error));
    return () => { mounted = false; };
  }, [qrValue]);

  useEffect(() => {
    if (paymentStatus?.status === "completed" || paymentStatus?.status === "fulfilled") {
      if (!completionNotified.current) {
        completionNotified.current = true;
        onPaymentComplete?.(paymentStatus.orderId ?? invoice.orderId);
      }
    }
  }, [invoice.orderId, onPaymentComplete, paymentStatus?.orderId, paymentStatus?.status]);

  const status = paymentStatus?.status ?? "pending";
  const statusDetails = statusCopy(status);
  const terminal = ["completed", "fulfilled", "failed", "expired"].includes(status);
  const exactCryptoAmount = invoice.cryptoAmount || "See checkout";
  const expiresAt = invoice.expiresAt
    ? invoice.expiresAt < 1_000_000_000_000 ? invoice.expiresAt * 1000 : invoice.expiresAt
    : null;
  const expiresLabel = expiresAt ? new Date(expiresAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Provider-managed";

  return (
    <div className="overflow-hidden border-[3px] border-[#080f2c] bg-[#18296d] text-[#fff0c5]" data-testid="crypto-payment-panel">
      <div className="flex items-center justify-between gap-3 border-b-[2px] border-[#0e1b4e] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CryptoCoinIcon ticker={coinTicker} color={coinColor} className="h-7 w-7 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold">Pay with {coinName}</p>
            <p className="font-mono text-[10px] text-[#aab6e6]">{coinTicker} · secure in-app invoice</p>
          </div>
        </div>
        <div className={`flex flex-shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold ${statusDetails.color}`}>
          {status === "completed" || status === "fulfilled" ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === "failed" || status === "expired" ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {statusDetails.label}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {!terminal && (
          <div className="border-[2px] border-[#f5d000] bg-[#18296d] px-3 py-2.5 text-center">
            <p className="font-mono text-[10px] font-bold leading-relaxed text-[#fff0c5]">
              Send the exact amount only{" "}
              <span className="font-black text-[#ff7924]">{exactCryptoAmount} {coinTicker}</span>
              {" "}— do not send a different amount. Wrong amount = no credit.
            </p>
          </div>
        )}

        {status === "completed" || status === "fulfilled" ? (
          <div className="border-[2px] border-[#67e68c] bg-[#103b2b] p-5 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-[#67e68c]" />
            <p className="mt-2 font-bold text-[#fff0c5]">Payment confirmed</p>
            <p className="mt-1 font-mono text-[10px] text-[#b7eec6]">Your payment has been matched and credited.</p>
          </div>
        ) : status === "failed" || status === "expired" ? (
          <div className="border-[2px] border-[#9a3c59] bg-[#3c1728] p-5 text-center">
            <XCircle className="mx-auto h-9 w-9 text-[#ff8585]" />
            <p className="mt-2 font-bold text-[#fff0c5]">{statusDetails.label}</p>
            <p className="mt-1 font-mono text-[10px] text-[#f0b1bb]">No funds were credited. You can create a new invoice below.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto border-[3px] border-[#080808] bg-white p-1">
              {qrDataUrl ? <img src={qrDataUrl} alt={`QR code for ${coinTicker} payment`} className="block h-48 w-48 sm:h-56 sm:w-56" /> : <div className="flex h-48 w-48 items-center justify-center text-black"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            </div>
            <div className="min-w-0 divide-y-[2px] divide-[#0e1b4e] border-y-[2px] border-[#0e1b4e]">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-mono text-[10px] text-[#9ca9de]">USD total</span>
                <strong className="font-mono text-[11px] text-[#ff7924]">${(invoice.usdAmountCents / 100).toFixed(2)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-mono text-[10px] text-[#9ca9de]">Send exactly</span>
                <CopyValue value={`${exactCryptoAmount} ${coinTicker}`} label="crypto amount" />
              </div>
              {invoice.paymentAddress && (
                <div className="flex items-start justify-between gap-3 py-2.5">
                  <span className="pt-0.5 font-mono text-[10px] text-[#9ca9de]">Wallet address</span>
                  <CopyValue value={invoice.paymentAddress} label="wallet address" />
                </div>
              )}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-mono text-[10px] text-[#9ca9de]">Expires</span>
                <span className="text-right font-mono text-[10px] text-[#fff0c5]">{expiresLabel}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching || terminal}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 border-[2px] border-[#080808] bg-[#203b8f] px-3 font-mono text-[10px] font-bold text-[#fff0c5] shadow-[2px_2px_0_#080808] hover:bg-[#2d4da9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> REFRESH STATUS
          </button>
          <a
            href={invoice.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 border-[2px] border-[#080808] bg-[#fff0c5] px-3 font-mono text-[10px] font-bold text-[#111a42] shadow-[2px_2px_0_#080808] hover:bg-white"
          >
            OPEN HOSTED FALLBACK <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <button type="button" onClick={onReset} className="flex w-full items-center justify-center gap-1 pt-1 font-mono text-[10px] text-white/35 hover:text-white/70">
          <X className="h-3 w-3" /> create a new payment
        </button>
      </div>
    </div>
  );
}