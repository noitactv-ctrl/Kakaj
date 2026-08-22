import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(...upper.split("").map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
}

const countryDisplayNames = typeof Intl !== "undefined" && (Intl as any).DisplayNames
  ? new (Intl as any).DisplayNames(["en"], { type: "region" })
  : null;

function countryName(code: string): string {
  if (!code || code.length !== 2) return "";
  try {
    return countryDisplayNames?.of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function extractBin(cardNumber: string): string {
  return (cardNumber ?? "").replace(/\D/g, "").substring(0, 6);
}

function extractZip(extras: string): string {
  if (!extras) return "";
  const tokens = extras.split(/[|\t:;,\s]+/).map(t => t.trim()).filter(Boolean);
  for (const token of tokens) {
    const zipMatch = token.match(/^(\d{5})(?:-\d{4})?$/);
    if (zipMatch) {
      const num = parseInt(zipMatch[1], 10);
      if (num >= 501 && num <= 99950 && !(num >= 1900 && num <= 2100)) return zipMatch[1];
    }
  }
  for (const token of tokens) {
    const digits = token.replace(/\D/g, "");
    if (digits.length >= 13) continue;
    const m = token.match(/\b(\d{5})(?:-\d{4})?\b/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num >= 501 && num <= 99950 && !(num >= 1900 && num <= 2100)) return m[1];
    }
  }
  return "";
}

const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
  "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
]);

function extractCity(extras: string): string {
  if (!extras) return "";
  const parts = extras.split(/[|\t]/);
  // Find state abbreviation index, city is typically just before it
  for (let i = 1; i < parts.length; i++) {
    const t = parts[i].trim();
    if (US_STATES.has(t)) {
      // city is the token before the state (skip blanks)
      for (let j = i - 1; j >= 0; j--) {
        const c = parts[j].trim();
        if (c && c.length > 1 && !/^\d/.test(c) && !c.includes("@") && !c.includes(".") && !/^\d{1,3}\.\d{1,3}/.test(c)) {
          return c.length > 20 ? c.substring(0, 18) + "…" : c;
        }
      }
      break;
    }
  }
  return "";
}

function hasBilling(extras: string): boolean {
  return (extras ?? "").split(/[|\t]/).length >= 5;
}

function formatType(binData: any): string {
  if (!binData) return "";
  const t = binData.type?.toUpperCase();
  return t || "";
}

function formatBrand(binData: any): string {
  if (!binData) return "";
  return (binData.scheme || binData.brand || "").toUpperCase();
}

function formatBank(binData: any): string {
  if (!binData) return "";
  const b = binData.bank;
  if (!b || b === "Unknown") return "";
  return b.length > 18 ? b.substring(0, 16) + "..." : b;
}

function extractState(extras: string): string {
  if (!extras) return "";
  const tokens = extras.split(/[|\t:;,\s]+/).map(token => token.trim().toUpperCase());
  return tokens.find(token => US_STATES.has(token)) || "";
}

export default function CardsPage() {
  const [selectedBase, setSelectedBase] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<"DEBIT" | "CREDIT" | null>(null);
  const [cartCardIds, setCartCardIds] = useState<Set<number>>(new Set());

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const setBulkBundle = useCart(s => s.setBulkBundle);

  const { data: bases } = useQuery<any[]>({
    queryKey: ["/api/card-bases"],
    refetchInterval: 30000,
  });

  const { data: cards, isLoading } = useQuery<any[]>({
    queryKey: ["/api/cards", selectedBase],
    queryFn: async () => {
      const url = selectedBase ? `/api/cards?baseId=${selectedBase}` : "/api/cards";
      const res = await fetch(url, { credentials: "include" });
      return res.json();
    },
    refetchInterval: 20000,
  });

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    return cards.filter((card: any) => !selectedType || formatType(card.binData) === selectedType);
  }, [cards, selectedType]);

  const cartCards = useMemo(() => (cards ?? []).filter((c: any) => cartCardIds.has(c.id)), [cards, cartCardIds]);
  const toggleCart = (card: any) => {
    setCartCardIds(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else if (next.size >= 20) {
        toast({ title: "BULK BUNDLE IS FULL", description: "Select exactly 20 cards to continue.", variant: "destructive" });
      } else {
        next.add(card.id);
      }
      return next;
    });
  };

  const addBulkBundle = () => {
    if (cartCards.length !== 20) return;
    const originalTotal = cartCards.reduce((total: number, card: any) => total + card.price, 0);
    setBulkBundle({
      cardIds: cartCards.map((card: any) => card.id),
      cards: cartCards.map((card: any) => ({
        id: card.id,
        bin: extractBin(card.cardNumber),
        brand: formatBrand(card.binData),
        type: formatType(card.binData),
        baseName: card.baseName || "Unnamed base",
        price: card.price,
      })),
      originalTotal,
      discountedTotal: Math.round(originalTotal / 2),
    });
    setCartCardIds(new Set());
    toast({ title: "BULK BUNDLE ADDED", description: "20 cards are locked at 50% off each." });
    setLocation("/cart");
  };

  return (
    <div className="max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto">

      <div className="pixel-panel bg-[#0e1c50] px-3 py-3 space-y-3 sticky top-[60px] z-30">
        <div className="flex flex-wrap gap-2">
          {(["DEBIT", "CREDIT"] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(current => current === type ? null : type)}
              className={`pixel-button px-3 py-2 text-[8px] ${selectedType === type ? "!bg-[#ee292b] !text-white" : ""}`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t-2 border-black/60 pt-3">
          <button onClick={() => setSelectedBase(null)} className={`pixel-button px-3 py-2 text-[8px] ${selectedBase === null ? "!bg-[#ee292b] !text-white" : ""}`}>ALL BASES</button>
          {(bases ?? []).map((base: any) => (
            <button key={base.id} onClick={() => setSelectedBase(base.id)} className={`pixel-button px-3 py-2 text-[8px] ${selectedBase === base.id ? "!bg-[#ee292b] !text-white" : ""}`}>
              {base.name}
            </button>
          ))}
        </div>
        <div className="border-t-2 border-black/60 pt-3">
          <button
            onClick={addBulkBundle}
            disabled={cartCards.length !== 20}
            className="pixel-button flex w-full items-center justify-center gap-2 !bg-[#43b94e] px-3 py-3 text-[9px] !text-white disabled:opacity-50"
            data-testid="btn-create-bulk-bundle"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            BULK BUNDLE · {cartCards.length}/20 · 50% OFF EACH
          </button>
          <p className="mt-2 text-center text-[10px] font-bold text-[#ffe177]">SELECT EXACTLY 20 CARDS TO LOCK YOUR BULK DISCOUNT</p>
        </div>
      </div>

      {/* Table */}
      <div className="pixel-panel mt-4 overflow-x-auto bg-[#0b1744]">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-4 w-4 animate-spin text-white/30" />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/35">No cards available</div>
        ) : (
          <table className="w-full text-xs border-collapse" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="border-b-[3px] border-black bg-[#1d3d93]">
                <th className="w-10 px-2.5 py-2 text-left pixel-text text-[7px] text-[#ffe177]">ADD</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">BIN</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">TYPE</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">ISSUER</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">STATE</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">ZIP</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">COUNTRY</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">NAME</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">FIRST HANDED</th>
                <th className="px-2.5 py-3 text-right pixel-text text-[7px] text-[#ffe177]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card: any) => (
                <CardTableRow
                  key={card.id}
                  card={card}
                  inCart={cartCardIds.has(card.id)}
                  onToggleCart={toggleCart}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CardTableRow({ card, inCart, onToggleCart }: { card: any; inCart: boolean; onToggleCart: (c: any) => void }) {
  const bin = extractBin(card.cardNumber);
  const zip = extractZip(card.extras ?? "");
  const flag = countryFlag(card.binData?.countryCode ?? "");
  const ccCountry = countryName(card.binData?.countryCode ?? "");
  const cardType = formatType(card.binData);
  const bank = formatBank(card.binData);
  const state = extractState(card.extras ?? "");

  return (
    <tr
      className={`border-b-[2px] border-black/70 transition-colors ${inCart ? "bg-[#21469f]" : "bg-[#122766] hover:bg-[#19357e]"}`}
      data-testid={`card-row-${card.id}`}
    >
      <td className="px-2.5 py-2">
        <input
          type="checkbox"
          checked={inCart}
          onChange={() => onToggleCart(card)}
          className="w-3.5 h-3.5 rounded border-white/15 cursor-pointer accent-green-500"
          data-testid={`checkbox-card-${card.id}`}
        />
      </td>
      <td className="px-2.5 py-2">
        <span className="font-bold font-mono text-xs text-white">{bin || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] font-mono font-bold text-[#f7ebd8]">{cardType || "—"}</span>
      </td>
      <td className="px-2.5 py-3 max-w-[130px]">
        <span className="text-[10px] text-white/75 truncate block">{bank || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] font-mono text-white/75">{state || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] font-mono text-white/75">{zip || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] text-white/85">{flag} {ccCountry || "—"}</span>
      </td>
      <td className="px-2.5 py-3 max-w-[115px]">
        <span className="text-[10px] font-bold text-[#ffe177] truncate block">{card.baseName || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className={card.isFirstHand ? "pixel-status-yes" : "pixel-status-no"}>{card.isFirstHand ? "YES" : "NO"}</span>
      </td>
      <td className="px-2.5 py-3 text-right whitespace-nowrap">
        <button
          onClick={() => onToggleCart(card)}
          className={`inline-flex items-center justify-center border-[2px] border-black px-2 py-1.5 text-[8px] font-bold transition-colors ${
            inCart ? "bg-[#ee292b] text-white" : "bg-[#ffe1aa] text-[#20140d] hover:bg-[#fff0c9]"
          }`}
          data-testid={`btn-select-card-${card.id}`}
        >
          {inCart ? "SELECTED" : "SELECT"}
        </button>
      </td>
    </tr>
  );
}
