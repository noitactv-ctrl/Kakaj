import { SiBitcoin } from "react-icons/si";

export type CryptoCurrencyOption = {
  id: number;
  code: string;
  name: string;
  ticker: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
};

export function CryptoCoinIcon({ ticker, color, className = "" }: {
  ticker: string;
  color: string;
  className?: string;
}) {
  if (ticker === "BTC") {
    return <SiBitcoin className={className} style={{ color }} aria-label="Bitcoin" />;
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-black text-[9px] text-white ${className}`}
      style={{ backgroundColor: color }}
      aria-label={ticker}
    >
      {ticker.slice(0, 3)}
    </span>
  );
}

export function CryptoCoinSelector({
  currencies,
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  currencies: CryptoCurrencyOption[];
  value: string | null;
  onChange: (code: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  if (currencies.length === 0) {
    return (
      <p className="border-[2px] border-black bg-[#0a1645] px-3 py-3 font-mono text-[10px] text-[#abbceb]">
        No crypto currencies are available right now.
      </p>
    );
  }

  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"}`}>
      {currencies.map((currency) => {
        const selected = value === currency.code;
        return (
          <button
            type="button"
            key={currency.id}
            onClick={() => onChange(currency.code)}
            disabled={disabled}
            className={`flex min-h-[92px] flex-col items-center justify-center gap-1 border-[3px] border-black px-2 py-2 transition-all ${
              selected ? "bg-[#2555c5] shadow-[2px_2px_0_#ffe177]" : "bg-[#0b1849] hover:bg-[#17337d]"
            }`}
            style={{ outline: selected ? `2px solid ${currency.color}` : "none" }}
            data-testid={`button-crypto-currency-${currency.code}`}
          >
            <CryptoCoinIcon ticker={currency.ticker} color={currency.color} className="h-8 w-8" />
            <span className="pixel-text text-center text-[8px] text-white">{currency.name}</span>
            <span className="font-mono text-[9px] text-white/55">{currency.ticker}</span>
          </button>
        );
      })}
    </div>
  );
}