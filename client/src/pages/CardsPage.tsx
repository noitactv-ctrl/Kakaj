import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Loader2, Search, RefreshCw } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { refreshCardBins } from "@/lib/card-refresh";

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

function cardCountryCode(card: any): string {
  const postedCountry = String(card?.country ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(postedCountry)) return postedCountry;
  const lookupCountry = String(card?.binData?.countryCode ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(lookupCountry) ? lookupCountry : "";
}

function cardCountryLabel(card: any): string {
  const code = cardCountryCode(card);
  return countryName(code) || String(card?.country ?? "").trim() || String(card?.binData?.country ?? "").trim();
}

function extractBin(cardNumber: string): string {
  return (cardNumber ?? "").replace(/\D/g, "").substring(0, 6);
}

function cardShuffleRank(cardId: number, seed: number): number {
  let value = (Number(cardId) ^ seed) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return (value ^ (value >>> 16)) >>> 0;
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

function hasBilling(extras: string): boolean {
  return (extras ?? "").split(/[|\t]/).length >= 5;
}

function formatType(binData: any): string {
  if (!binData) return "";
  return String(binData.type ?? "").trim().toUpperCase().replace(/[_-]+/g, " ");
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

function InCartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M1 2v2h2l3.6 7.59-1.35 2.45A2 2 0 0 0 5 15c0 1.1.9 2 2 2h12v-2H7.42a.25.25 0 0 1-.22-.37L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L20.88 5.5A1 1 0 0 0 20 4H5.21l-.94-2H1Zm6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
    </svg>
  );
}

export default function CardsPage() {
  const [selectedBase, setSelectedBase] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [cartCardIds, setCartCardIds] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [refreshProgress, setRefreshProgress] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cardItems = useCart(s => s.cardItems);
  const addCard = useCart(s => s.addCard);
  const setBulkBundle = useCart(s => s.setBulkBundle);
  const directCartIds = useMemo(() => new Set(cardItems.map(card => card.id)), [cardItems]);
  const buyCard = useMutation({
    mutationFn: async (cardId: number) => {
      const response = await apiRequest("POST", `/api/cards/${cardId}/purchase`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/card-bases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "PURCHASE COMPLETE", description: "The card has been added to your orders." });
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/card-bases"] });
      toast({ title: "PURCHASE FAILED", description: error.message || "This card may no longer be available.", variant: "destructive" });
    },
  });

  const { data: bases } = useQuery<any[]>({
    queryKey: ["/api/card-bases"],
    refetchInterval: 30000,
  });

  const { data: cards, isLoading } = useQuery<any[]>({
    queryKey: ["/api/cards", selectedBase],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedBase) params.set("baseId", String(selectedBase));
      const query = params.toString();
      const url = query ? `/api/cards?${query}` : "/api/cards";
      const res = await fetch(url, { credentials: "include" });
      return res.json();
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshCardBins(setRefreshProgress),
    onMutate: () => setRefreshProgress(0),
    onSuccess: (data: any) => {
      setShuffleSeed(data?.shuffleSeed ?? (Date.now() % 2147483647));
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/card-bases"] });
      toast({
        title: "CARDS REFRESHED",
        description: `${data?.cardsUpdated ?? 0} cards re-tracked · ${data?.duplicatesRemoved ?? 0} duplicates removed · ${data?.nonCardsFlagged ?? 0} flagged NON.`,
      });
    },
    onError: (error: Error) => toast({ title: "REFRESH FAILED", description: error.message, variant: "destructive" }),
  });

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    (cards ?? []).forEach((card: any) => {
      const type = String(card.metadata?.type || formatType(card.binData)).trim().toUpperCase();
      if (type) types.add(type);
    });
    const preferredOrder = ["CREDIT", "DEBIT", "PREPAID"];
    return Array.from(types).sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? preferredOrder.length : aIndex) - (bIndex === -1 ? preferredOrder.length : bIndex);
      }
      return a.localeCompare(b);
    });
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    const term = search.trim().toLowerCase();
    const filtered = cards.filter((card: any) => {
      const metadata = card.metadata ?? {};
      if (selectedType && (metadata.type || formatType(card.binData)) !== selectedType) return false;
      if (!term) return true;
      return [
        metadata.bin || extractBin(card.cardNumber),
        formatBrand(card.binData),
        metadata.type || formatType(card.binData),
        formatBank(card.binData),
        card.baseName,
        card.country,
        metadata.state || extractState(card.extras ?? ""),
        metadata.zip || extractZip(card.extras ?? ""),
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(term));
    });
    return shuffleSeed > 0
      ? [...filtered].sort((a: any, b: any) => cardShuffleRank(a.id, shuffleSeed) - cardShuffleRank(b.id, shuffleSeed))
      : filtered;
  }, [cards, selectedType, search, shuffleSeed]);

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
    if (cardItems.length > 0) {
      toast({ title: "CLEAR REGULAR CARDS FIRST", description: "Finish or remove regular card items before creating a bulk bundle.", variant: "destructive" });
      return;
    }
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
  };

  const cancelBulkSelection = () => {
    setCartCardIds(new Set());
    setBulkMode(false);
  };

  const addCardToCart = (card: any) => {
    if (directCartIds.has(card.id)) {
      toast({ title: "ALREADY IN CART", description: "This card is already in your cart." });
      return;
    }
    addCard({
      id: card.id,
      bin: extractBin(card.cardNumber),
      brand: formatBrand(card.binData),
      type: formatType(card.binData),
      baseName: card.baseName || "Unnamed base",
      price: card.price,
    });
    toast({ title: "ADDED TO CART", description: "Card added to your cart." });
  };

  return (
    <div className="pixel-page space-y-4">
      <div className="pixel-panel bg-[#10276a] px-3 py-3 space-y-3 sticky top-[68px] z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#725d42]" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="SEARCH BIN, ISSUER, BASE, STATE OR ZIP..."
            className="pixel-input h-11 pl-10 text-xs"
            data-testid="input-card-search"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`pixel-button px-3 py-2 text-[8px] ${selectedType === null ? "!bg-[#ee292b] !text-white" : ""}`}
            data-testid="btn-filter-all-card-types"
          >
            ALL TYPES
          </button>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(current => current === type ? null : type)}
              className={`pixel-button px-3 py-2 text-[8px] ${selectedType === type ? "!bg-[#ee292b] !text-white" : ""}`}
              data-testid={`btn-filter-card-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
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
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="pixel-button ml-auto flex items-center gap-2 px-3 py-2 text-[8px] !bg-[#43b94e] !text-white disabled:opacity-50"
            title="Re-track every BIN, remove safe duplicates, and randomize the card list"
            data-testid="btn-refresh-cards"
          >
            {refreshMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {refreshMutation.isPending ? `REFRESHING ${refreshProgress}%` : "REFRESH CARDS"}
          </button>
        </div>
        {refreshMutation.isPending && (
          <div className="relative h-5 overflow-hidden border-2 border-black bg-[#081438]" aria-label={`Card refresh ${refreshProgress}% complete`}>
            <div className="h-full bg-[#43b94e] transition-[width] duration-300" style={{ width: `${refreshProgress}%` }} />
            <span className="absolute inset-0 flex items-center justify-center pixel-text text-[7px] text-white">
              {refreshProgress}% · CHECKING BIN DATA AND DUPLICATES
            </span>
          </div>
        )}
        <div className="border-t-2 border-black/60 pt-3">
          {!bulkMode ? (
            <button
              onClick={() => { setCartCardIds(new Set()); setBulkMode(true); }}
              className="pixel-button flex w-full items-center justify-center gap-2 !bg-[#43b94e] px-3 py-3 text-[9px] !text-white"
              data-testid="btn-start-bulk-selection"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              SELECT 20 FOR BULK · 50% OFF EACH
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={addBulkBundle}
                disabled={cartCards.length !== 20}
                className="pixel-button flex min-w-0 flex-1 items-center justify-center gap-2 !bg-[#43b94e] px-3 py-3 text-[9px] !text-white disabled:opacity-50"
                data-testid="btn-create-bulk-bundle"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                BULK · {cartCards.length}/20
              </button>
              <button
                onClick={cancelBulkSelection}
                className="pixel-button px-3 py-3 text-[9px] !bg-[#ee292b] !text-white"
                data-testid="btn-cancel-bulk-selection"
              >
                CANCEL
              </button>
            </div>
          )}
          <p className="mt-2 text-center text-[10px] font-bold text-[#ffe177]">
            {bulkMode ? "SELECT EXACTLY 20 CARDS TO LOCK YOUR BULK DISCOUNT" : "ADD CARDS INDIVIDUALLY OR SELECT A 20-CARD BULK BUNDLE"}
          </p>
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
                {bulkMode && <th className="w-10 px-2.5 py-2 text-left pixel-text text-[7px] text-[#ffe177]">SELECT</th>}
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">BIN</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">BRAND</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">TYPE</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">ISSUER</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">STATE</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">ZIP</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">COUNTRY</th>
                <th className="px-2.5 py-3 text-left pixel-text text-[7px] text-[#ffe177]">BASE</th>
                <th className="px-2.5 py-3 text-right pixel-text text-[7px] text-[#ffe177]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card: any) => (
                <CardTableRow
                  key={card.id}
                  card={card}
                  inCart={directCartIds.has(card.id)}
                  bulkSelected={cartCardIds.has(card.id)}
                  bulkMode={bulkMode}
                  onToggleCart={toggleCart}
                  onAddCard={addCardToCart}
                  onBuyCard={(cardId: number) => buyCard.mutate(cardId)}
                  isBuying={buyCard.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CardTableRow({
  card,
  inCart,
  bulkSelected,
  bulkMode,
  onToggleCart,
  onAddCard,
  onBuyCard,
  isBuying,
}: {
  card: any;
  inCart: boolean;
  bulkSelected: boolean;
  bulkMode: boolean;
  onToggleCart: (c: any) => void;
  onAddCard: (c: any) => void;
  onBuyCard: (cardId: number) => void;
  isBuying: boolean;
}) {
  const bin = extractBin(card.cardNumber);
  const metadata = card.metadata ?? {};
  const zip = metadata.zip || extractZip(card.extras ?? "");
  const countryCode = cardCountryCode(card);
  const flag = countryFlag(countryCode);
  const ccCountry = cardCountryLabel(card);
  const brand = formatBrand(card.binData);
  const cardType = formatType(card.binData);
  const bank = formatBank(card.binData);
  const state = metadata.state || extractState(card.extras ?? "");

  return (
    <tr
      className={`border-b-[2px] border-black/70 transition-colors ${bulkSelected ? "bg-[#21469f]" : "bg-[#122766] hover:bg-[#19357e]"}`}
      data-testid={`card-row-${card.id}`}
    >
      {bulkMode && (
        <td className="px-2.5 py-2">
          <input
            type="checkbox"
            checked={bulkSelected}
            onChange={() => onToggleCart(card)}
            disabled={inCart}
            className="w-3.5 h-3.5 rounded border-white/15 cursor-pointer accent-green-500 disabled:cursor-not-allowed disabled:opacity-40"
            data-testid={`checkbox-card-${card.id}`}
          />
        </td>
      )}
      <td className="px-2.5 py-2">
        <span className="font-bold font-mono text-xs text-white">{metadata.bin || bin || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="inline-flex border border-black bg-[#d94343] px-1.5 py-0.5 text-[9px] font-bold text-white">{brand || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] font-mono font-bold text-[#f7ebd8]">{metadata.type || cardType || "—"}</span>
      </td>
      <td className="px-2.5 py-3 max-w-[130px]">
        <span className="text-[10px] text-white/75 truncate block">{bank || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] font-mono text-white/75">{metadata.state || state || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] font-mono text-white/75">{metadata.zip || zip || "—"}</span>
      </td>
      <td className="px-2.5 py-3">
        <span className="text-[10px] text-white/85">
          <span className="sm:hidden" title={ccCountry || "Unknown country"}>{flag || "—"}</span>
          <span className="hidden sm:inline">{ccCountry || "—"}</span>
        </span>
      </td>
      <td className="px-2.5 py-3 max-w-[115px]">
        <span className="text-[10px] font-bold text-[#ffe177] truncate block">{card.baseName || "—"}</span>
      </td>
      <td className="px-2.5 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {inCart ? (
            <span
              className="inline-flex h-8 w-8 items-center justify-center text-[#43b94e]"
              title="In cart"
              aria-label="In cart"
              data-testid={`icon-cart-card-${card.id}`}
            >
              <InCartIcon />
            </span>
          ) : (
            <button
              onClick={() => bulkMode ? onToggleCart(card) : onAddCard(card)}
              className={`pixel-button inline-flex items-center justify-center px-2 py-1.5 text-[8px] font-bold transition-colors ${
                bulkMode
                  ? bulkSelected ? "bg-[#ee292b] text-white" : "bg-[#ffe1aa] text-[#20140d] hover:bg-[#fff0c9]"
                  : "bg-[#ffe1aa] text-[#20140d] hover:bg-[#fff0c9]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
              data-testid={bulkMode ? `btn-select-card-${card.id}` : `btn-add-card-${card.id}`}
            >
              {bulkMode ? (bulkSelected ? "SELECTED" : "SELECT") : "Add"}
            </button>
          )}
          {!bulkMode && (
            <button
              onClick={() => onBuyCard(card.id)}
              disabled={isBuying || card.isSold}
              className="pixel-button inline-flex items-center justify-center !bg-[#43b94e] px-2 py-1.5 text-[8px] font-bold !text-white transition-colors hover:!bg-[#58cf63] disabled:cursor-not-allowed disabled:opacity-50"
              data-testid={`btn-buy-card-${card.id}`}
            >
              Buy ${(card.price / 100).toFixed(2)}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
