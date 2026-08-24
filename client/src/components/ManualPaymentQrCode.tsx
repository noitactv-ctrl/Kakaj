import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, ExternalLink } from "lucide-react";

type ManualPaymentMethod = "cashapp" | "chime" | "zelle" | "venmo";

const methodNames: Record<ManualPaymentMethod, string> = {
  cashapp: "CashApp",
  chime: "Chime",
  zelle: "Zelle",
  venmo: "Venmo",
};

function venmoUrl(handle: string) {
  if (/^https?:\/\//i.test(handle)) return handle;
  const username = handle.trim().replace(/^@/, "").replace(/\s+/g, "");
  return username ? `https://venmo.com/u/${username}` : "";
}

function qrValue(method: ManualPaymentMethod, destination: string) {
  if (method === "venmo") return venmoUrl(destination);
  if (method === "cashapp" && /^https?:\/\//i.test(destination)) return destination;
  return `${methodNames[method]}: ${destination}`;
}

function destinationLabel(method: ManualPaymentMethod) {
  if (method === "cashapp") return "CashApp URL";
  if (method === "venmo") return "Venmo handle";
  return `${methodNames[method]} handle`;
}

export function ManualPaymentQrCode({
  method,
  destination,
  amountCents,
  note,
}: {
  method: ManualPaymentMethod;
  destination: string;
  amountCents: number;
  note?: string;
}) {
  const [dataUrl, setDataUrl] = useState("");
  const [copied, setCopied] = useState<"amount" | "destination" | "note" | null>(null);
  const name = methodNames[method];
  const amount = `$${(amountCents / 100).toFixed(2)}`;
  const link = method === "cashapp" || method === "venmo"
    ? (method === "cashapp" ? destination : venmoUrl(destination))
    : "";
  const encodedDestination = qrValue(method, destination);

  useEffect(() => {
    let mounted = true;
    setDataUrl("");
    if (!encodedDestination) return () => { mounted = false; };

    QRCode.toDataURL(encodedDestination, {
      width: 192,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#080b16", light: "#ffffff" },
    }).then(nextDataUrl => {
      if (mounted) setDataUrl(nextDataUrl);
    }).catch(error => {
      console.error(`Could not create ${name} QR code:`, error);
    });

    return () => { mounted = false; };
  }, [encodedDestination, name]);

  const copyValue = (value: string, field: "amount" | "destination" | "note") => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    window.setTimeout(() => setCopied(current => current === field ? null : current), 1600);
  };

  const copyButton = (value: string, field: "amount" | "destination" | "note") => (
    <button
      type="button"
      onClick={() => copyValue(value, field)}
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[#a5b2e7] transition-colors hover:text-white"
      aria-label={`Copy ${field === "destination" ? `${name} handle` : field}`}
    >
      {copied === field ? <Check className="h-3.5 w-3.5 text-[#43b94e]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  if (!destination || !dataUrl) return null;

  return (
    <div className="border-[3px] border-[#080f2c] bg-[#18296d] p-3 text-[#fff0c5] sm:p-4">
      <div className="border-[2px] border-[#f5d000] bg-[#18296d] px-3 py-2.5 text-center">
        <p className="font-mono text-[10px] font-bold leading-relaxed text-[#fff0c5] sm:text-[11px]">
          Send the exact {name} amount only{" "}
          <span className="font-black text-[#ff7924]">{amount}</span>
          {" "}— do not send a different amount. Wrong amount = no credit.
        </p>
      </div>

      <div className="mt-3 divide-y-[2px] divide-[#0e1b4e] border-y-[2px] border-[#0e1b4e]">
        <div className="flex items-center justify-between gap-3 py-2.5">
          <span className="font-mono text-[10px] text-[#9ca9de]">Amount (send this)</span>
          <div className="flex items-center gap-1">
            <strong className="font-mono text-[11px] text-[#ff7924]">{amount}</strong>
            {copyButton(amount, "amount")}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <span className="font-mono text-[10px] text-[#9ca9de]">{destinationLabel(method)}</span>
          <div className="flex min-w-0 items-center gap-1">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[190px] truncate font-mono text-[10px] font-bold text-[#fff0c5] hover:underline"
              >
                {destination}
              </a>
            ) : (
              <strong className="max-w-[190px] truncate font-mono text-[10px] font-bold text-[#fff0c5]">{destination}</strong>
            )}
            {copyButton(destination, "destination")}
          </div>
        </div>
        {note && (
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="font-mono text-[10px] text-[#9ca9de]">Payment note</span>
            <div className="flex items-center gap-1">
              <strong className="font-mono text-[10px] text-[#ff7924]">{note}</strong>
              {copyButton(note, "note")}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="mx-auto w-fit border-[3px] border-[#080808] bg-white p-1">
          <img src={dataUrl} alt={`QR code for ${name} payment`} className="block h-48 w-48 sm:h-52 sm:w-52" />
        </div>
        <p className="mx-auto mt-4 max-w-xl font-mono text-[10px] leading-relaxed text-[#aab6e6]">
          Send exactly <strong className="text-[#ff7924]">{amount}</strong> to this {name} destination.
          <br />
          Scan the code to view the payment destination and complete your payment.
        </p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 border-[2px] border-[#080808] bg-[#fff0c5] px-5 py-2 font-mono text-[10px] font-bold text-[#111a42] shadow-[2px_2px_0_#080808] hover:bg-white"
          >
            OPEN {name.toUpperCase()} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => copyValue(destination, "destination")}
            className="mt-4 inline-flex items-center gap-2 border-[2px] border-[#080808] bg-[#fff0c5] px-5 py-2 font-mono text-[10px] font-bold text-[#111a42] shadow-[2px_2px_0_#080808] hover:bg-white"
          >
            {copied === "destination" ? "COPIED HANDLE" : `COPY ${name.toUpperCase()} HANDLE`} <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}