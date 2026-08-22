import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function CashAppQrCode({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    setDataUrl("");

    if (!url) return () => { mounted = false; };

    QRCode.toDataURL(url, {
      width: 192,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#080b16",
        light: "#ffffff",
      },
    }).then(nextDataUrl => {
      if (mounted) setDataUrl(nextDataUrl);
    }).catch(error => {
      console.error("Could not create CashApp QR code:", error);
    });

    return () => { mounted = false; };
  }, [url]);

  if (!dataUrl) return null;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-4 text-center">
      <p className="mb-3 text-[9px] font-mono uppercase tracking-widest text-white/35">Scan to open CashApp</p>
      <div className="mx-auto w-fit border-[4px] border-white bg-white p-1">
        <img src={dataUrl} alt="QR code for CashApp payment" className="block h-44 w-44" />
      </div>
      <p className="mt-3 text-[10px] font-mono text-white/30">Scan this code to open the CashApp URL</p>
    </div>
  );
}