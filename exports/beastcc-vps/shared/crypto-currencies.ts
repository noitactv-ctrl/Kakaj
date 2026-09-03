import { z } from "zod";

export type SupportedCryptoCurrency = {
  code: string;
  name: string;
  ticker: string;
  color: string;
};

// These identifiers are sent to Plisio as both currency and allowed_psys_cids.
// Keep the server allow-list explicit so arbitrary provider identifiers cannot
// be inserted through the admin UI.
export const SUPPORTED_PLISIO_CURRENCIES: SupportedCryptoCurrency[] = [
  { code: "BTC", name: "Bitcoin", ticker: "BTC", color: "#F7931A" },
  { code: "ETH", name: "Ethereum", ticker: "ETH", color: "#627EEA" },
  { code: "USDT", name: "Tether USDT", ticker: "USDT", color: "#26A17B" },
  { code: "USDC", name: "USD Coin", ticker: "USDC", color: "#2775CA" },
  { code: "SOL", name: "Solana", ticker: "SOL", color: "#9945FF" },
  { code: "LTC", name: "Litecoin", ticker: "LTC", color: "#BEBEBE" },
  { code: "TRX", name: "TRON", ticker: "TRX", color: "#FF0013" },
  { code: "DOGE", name: "Dogecoin", ticker: "DOGE", color: "#C2A633" },
  { code: "BCH", name: "Bitcoin Cash", ticker: "BCH", color: "#8DC351" },
];

export const DEFAULT_CRYPTO_CURRENCIES = SUPPORTED_PLISIO_CURRENCIES.slice(0, 6);

export function getSupportedPlisioCurrency(code: string | undefined | null): SupportedCryptoCurrency | undefined {
  const normalized = String(code ?? "").trim().toUpperCase();
  return SUPPORTED_PLISIO_CURRENCIES.find((currency) => currency.code === normalized);
}

export const cryptoCurrencyCreateSchema = z.object({
  code: z.string().trim().min(2).max(16),
  name: z.string().trim().min(2).max(48).optional(),
  ticker: z.string().trim().min(2).max(16).optional(),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #F7931A").optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  enabled: z.boolean().optional(),
});

export const cryptoCurrencyUpdateSchema = cryptoCurrencyCreateSchema
  .omit({ code: true })
  .partial();