import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { ShoppingCart, ArrowRight, Loader2, Wallet, X, Clock, Tag, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SiCashapp, SiBitcoin } from "react-icons/si";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { CashAppQrCode } from "@/components/CashAppQrCode";
import { CryptoCoinIcon, CryptoCoinSelector, type CryptoCurrencyOption } from "@/components/CryptoCoinSelector";
import { CryptoPaymentPanel, type CryptoInvoiceData } from "@/components/CryptoPaymentPanel";

type PaymentMethod = "balance" | "cashapp" | "crypto";

interface AppliedDiscount {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  discountAmount: number;
}

function CashAppModal({ orderId, total, paymentNote, cashappUrl, onClose }: {
  orderId: string;
  total: number;
  paymentNote: string;
  cashappUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm space-y-4 border-[3px] border-[#080f2c] bg-[#18296d] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SiCashapp className="h-5 w-5 text-[#00D632]" aria-label="Cash App" />
            <span className="text-sm font-bold text-[#fff0c5]">CashApp Payment</span>
          </div>
          <button onClick={onClose} className="text-[#aab6e6] transition-colors hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-[#aab6e6]">
          Send the exact amount below to the CashApp URL. You <strong className="text-[#fff0c5]">must</strong> include the note — it's how we match your order.
        </p>

        {cashappUrl && <CashAppQrCode url={cashappUrl} amountCents={total} note={paymentNote} />}

        <div className="flex items-start gap-2 bg-[#0d0d0d] rounded-xl px-3 py-2.5">
          <Clock className="h-3.5 w-3.5 text-white/45 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/45 leading-relaxed">
            Order <span className="text-white font-mono">{orderId}</span> is pending. It takes <strong className="text-white">up to 4 hours</strong> to be pushed after payment. If not received, contact support.
          </p>
        </div>

        <button
          className="h-9 w-full border-[2px] border-[#080808] bg-[#fff0c5] text-xs font-bold text-[#111a42] shadow-[2px_2px_0_#080808] transition-colors hover:bg-white"
          onClick={onClose}
        >
          Done — I've sent it
        </button>
      </div>
    </div>
  );
}

function CryptoPaymentModal({ invoice, onClose, onComplete }: {
  invoice: CryptoInvoiceData;
  onClose: () => void;
  onComplete: (orderId?: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6">
      <div className="mx-auto w-full max-w-xl">
        <CryptoPaymentPanel
          invoice={invoice}
          onReset={onClose}
          onPaymentComplete={onComplete}
        />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, cardItems, bulkBundle, removeItem, removeCard, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cashapp");
  const [selectedCryptoCode, setSelectedCryptoCode] = useState<string | null>(null);
  const [cashappModal, setCashappModal] = useState<{ orderId: string; total: number; paymentNote: string; cashappUrl: string } | null>(null);
  const [cryptoInvoice, setCryptoInvoice] = useState<CryptoInvoiceData | null>(null);

  const productTotal = total();
  const cardSubtotal = cardItems.reduce((sum, card) => sum + card.price, 0);
  const bundleSubtotal = bulkBundle?.originalTotal ?? 0;
  const bundleDiscount = bulkBundle ? bulkBundle.originalTotal - bulkBundle.discountedTotal : 0;
  const cartTotal = productTotal + cardSubtotal + bundleSubtotal;
  const discountAmount = appliedDiscount?.discountAmount ?? 0;
  const discountedTotal = Math.max(0, cartTotal - bundleDiscount - discountAmount);
  const userBalance = user?.balance || 0;
  const hasCardPurchase = cardItems.length > 0 || !!bulkBundle;

  const { data: rankData } = useQuery<any>({ queryKey: ["/api/user/rank"], enabled: !!user });
  const rankDiscountPct = rankData?.discountPct ?? 0;
  const rankDiscountAmount = !bulkBundle && rankDiscountPct > 0 ? Math.round(discountedTotal * rankDiscountPct / 100) : 0;
  const finalTotal = Math.max(0, discountedTotal - rankDiscountAmount);

  const hasEnoughBalance = userBalance >= finalTotal;

  const { data: enabledMethods } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/payment-methods"],
  });
  const { data: cryptoCurrencies = [] } = useQuery<CryptoCurrencyOption[]>({
    queryKey: ["/api/crypto-currencies"],
  });
  const selectedCrypto = cryptoCurrencies.find((currency) => currency.code === selectedCryptoCode) ?? null;
  const cashappEnabled = enabledMethods?.cashapp !== false;
  const walletEnabled = enabledMethods?.wallet !== false;
  const cryptoEnabled = enabledMethods?.crypto === true && cryptoCurrencies.length > 0;

  const { data: manualMethods } = useQuery<{
     cashapp: { enabled: boolean; tag: string; url: string; fee: number };
  }>({ queryKey: ["/api/site-settings/manual-payments"] });

  const feePercentFor = (m: PaymentMethod) => m === "cashapp" ? (manualMethods?.cashapp?.fee ?? 0) : 0;

  useEffect(() => {
    if (hasCardPurchase && selectedMethod !== "balance") {
      setSelectedMethod("balance");
      return;
    }
    if (selectedMethod === "cashapp" && !cashappEnabled) {
      setSelectedMethod(walletEnabled ? "balance" : cryptoEnabled ? "crypto" : "balance");
    }
    if (selectedMethod === "balance" && !walletEnabled) {
      setSelectedMethod(cashappEnabled ? "cashapp" : cryptoEnabled ? "crypto" : "balance");
    }
    if (selectedMethod === "crypto" && !cryptoEnabled) {
      setSelectedMethod(walletEnabled ? "balance" : cashappEnabled ? "cashapp" : "balance");
    }
  }, [cashappEnabled, walletEnabled, cryptoEnabled, selectedMethod, hasCardPurchase]);

  useEffect(() => {
    if (!cryptoCurrencies.length) {
      setSelectedCryptoCode(null);
      return;
    }
    if (!selectedCryptoCode || !cryptoCurrencies.some((currency) => currency.code === selectedCryptoCode)) {
      setSelectedCryptoCode(cryptoCurrencies[0].code);
    }
  }, [cryptoCurrencies, selectedCryptoCode]);

  // Clear discount if cart changes
  useEffect(() => {
    if (appliedDiscount) setAppliedDiscount(null);
  }, [cartTotal, bulkBundle]);

  const validateDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/discount/validate", { code, cartTotal });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Invalid code");
      }
      return res.json();
    },
    onSuccess: (data: AppliedDiscount) => {
      setAppliedDiscount(data);
      setCouponCode("");
      const label = data.type === "percent" ? `${data.value}% off` : `$${(data.value / 100).toFixed(2)} off`;
      toast({ title: `Discount applied — ${label}`, description: `You save $${(data.discountAmount / 100).toFixed(2)}` });
    },
    onError: (e: any) => {
      toast({ title: "Code not valid", description: e.message, variant: "destructive" });
    },
  });

  const processorFeePercent = selectedMethod === "balance" ? 0 : feePercentFor(selectedMethod);
  const processorFee = Math.round(finalTotal * processorFeePercent / 100);
  const dueTotal = finalTotal + processorFee;
  const selectedCardIds = [...cardItems.map(card => card.id), ...(bulkBundle?.cardIds ?? [])];
  const refreshPurchaseData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
    queryClient.invalidateQueries({ queryKey: ["/api/card-bases"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  };
  const handleCheckoutError = (e: any) => {
    const message = e.message || "Could not create order.";
    if (/card.*(?:sold|available|not found)/i.test(message)) {
      clearCart();
      refreshPurchaseData();
      toast({ title: "CART UPDATED", description: "One or more cards were no longer available. Your cart was cleared with the latest inventory.", variant: "destructive" });
      return;
    }
    toast({ title: "Checkout failed", description: message, variant: "destructive" });
  };

  const cashappOrderMutation = useMutation({
    mutationFn: async () => {
      const cartItems = items.map(i => ({ variantId: i.variantId, quantity: i.quantity }));
      const res = await apiRequest("POST", "/api/orders/cashapp", {
        items: cartItems,
        cardIds: selectedCardIds,
        bulkCardIds: bulkBundle?.cardIds ?? [],
        discountCodeId: bulkBundle ? null : appliedDiscount?.id ?? null,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Order failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      clearCart();
      refreshPurchaseData();
      setCashappModal({
        orderId: data.order?.orderId || data.orderId || "N/A",
        total: data.order?.total ?? dueTotal,
        paymentNote: data.paymentNote || data.order?.orderId || "",
        cashappUrl: data.cashappUrl || manualMethods?.cashapp.url || "",
      });
    },
    onError: handleCheckoutError,
  });

  const balanceOrderMutation = useMutation({
    mutationFn: async () => {
      const cartItems = items.map(i => ({ variantId: i.variantId, quantity: i.quantity }));
      const res = await apiRequest("POST", api.orders.create.path, {
        items: cartItems,
        cardIds: selectedCardIds,
        bulkCardIds: bulkBundle?.cardIds ?? [],
        discountCodeId: bulkBundle ? null : appliedDiscount?.id ?? null,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Order failed");
      }
      return res.json();
    },
    onSuccess: () => {
      clearCart();
      refreshPurchaseData();
      toast({ title: "Order placed!", description: "Your order has been placed and will be fulfilled soon." });
      setLocation("/orders");
    },
    onError: handleCheckoutError,
  });

  const cryptoOrderMutation = useMutation({
    mutationFn: async () => {
      const cartItems = items.map(i => ({ variantId: i.variantId, quantity: i.quantity }));
      const res = await apiRequest("POST", "/api/orders/crypto", {
        items: cartItems,
        cardIds: selectedCardIds,
        bulkCardIds: bulkBundle?.cardIds ?? [],
        discountCodeId: bulkBundle ? null : appliedDiscount?.id ?? null,
        currencyCode: selectedCryptoCode,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Order failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      clearCart();
      refreshPurchaseData();
      setCryptoInvoice({ ...data, orderId: data.order?.id });
    },
    onError: handleCheckoutError,
  });

  const isPending = cashappOrderMutation.isPending || balanceOrderMutation.isPending || cryptoOrderMutation.isPending;

  const handleCheckout = () => {
    if (!user) return setLocation("/auth");
    if (selectedMethod === "balance") {
      if (!hasEnoughBalance) {
        toast({ title: "Insufficient balance", description: `You need $${(finalTotal / 100).toFixed(2)} but have $${(userBalance / 100).toFixed(2)}.`, variant: "destructive" });
        return;
      }
      balanceOrderMutation.mutate();
    } else if (selectedMethod === "cashapp") {
      cashappOrderMutation.mutate();
    } else if (selectedMethod === "crypto") {
      cryptoOrderMutation.mutate();
    }
  };

  const handleApplyCoupon = () => {
    if (bulkBundle) {
      toast({ title: "BULK BUNDLE LOCKED", description: "The 50% bundle price cannot be combined with a coupon.", variant: "destructive" });
      return;
    }
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    if (!user) { toast({ title: "Sign in to apply a discount code", variant: "destructive" }); return; }
    validateDiscountMutation.mutate(trimmed);
  };

  if (items.length === 0 && cardItems.length === 0 && !bulkBundle && !cashappModal && !cryptoInvoice) {
    return (
      <div className="pixel-page flex flex-col items-center justify-center py-24 space-y-6 max-w-sm mx-auto text-center">
        <div className="grid h-20 w-20 place-items-center border-[3px] border-black bg-[#10215e]">
          <ShoppingCart className="h-9 w-9 text-[#ffe177]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm leading-relaxed text-white">YOUR CART IS EMPTY</h2>
          <p className="text-sm text-white/55">Browse cards to get started.</p>
        </div>
        <Link href="/">
          <button className="pixel-button flex items-center gap-2 px-4 py-3 text-[8px]" data-testid="button-browse-shop">
            BROWSE CARDS <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {cashappModal && (
        <CashAppModal
          orderId={cashappModal.orderId}
          total={cashappModal.total}
          paymentNote={cashappModal.paymentNote}
          cashappUrl={cashappModal.cashappUrl}
          onClose={() => { setCashappModal(null); setLocation("/orders"); }}
        />
      )}
      {cryptoInvoice && (
        <CryptoPaymentModal
          invoice={cryptoInvoice}
          onClose={() => {
            setCryptoInvoice(null);
            setLocation("/orders");
          }}
          onComplete={(orderId) => {
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            if (orderId) setLocation(`/order/${orderId}`);
          }}
        />
      )}

      <div className="pixel-page space-y-4 pb-20">

        {/* Products header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="pixel-text text-[8px] text-[#ffe177]">CHECKOUT</p>
            <h2 className="mt-2 text-base leading-relaxed text-white">CART ({items.reduce((count, item) => count + item.quantity, 0) + cardItems.length + (bulkBundle?.cardIds.length ?? 0)})</h2>
          </div>
          <span className="font-mono text-[10px] text-white/45">Review your order</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-4">
        {/* Product list */}
        <div className="pixel-panel bg-[#10215e] overflow-hidden divide-y-2 divide-black">
          {bulkBundle && (
            <div className="border-[3px] border-black bg-[#ee292b] px-4 py-4 text-white" data-testid="locked-bulk-bundle">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="pixel-text text-[9px]">LOCKED CARD BULK BUNDLE</p>
                  <p className="mt-2 text-xs font-bold">20 CARDS · 50% OFF EACH · INDIVIDUAL REMOVAL DISABLED</p>
                </div>
                <ShoppingCart className="h-5 w-5 shrink-0" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {bulkBundle.cards.map(card => (
                  <span key={card.id} className="border-2 border-black bg-[#ffe1aa] px-1.5 py-1 text-[8px] font-bold text-[#21140c]">
                    {card.bin || "CARD"} · {card.brand || card.type || "CARD"}
                  </span>
                ))}
              </div>
            </div>
          )}
          {cardItems.map(card => (
            <div key={`card-${card.id}`} className="flex items-center gap-3 px-3 py-3" data-testid={`card-cart-item-${card.id}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#1d3d93]">
                <span className="text-[9px] font-bold text-[#ffe177]">{card.brand || "CARD"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white/90">{card.bin || "CARD"} · {card.baseName || "Unnamed base"}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{card.type || "CARD"} · Individual card</p>
                <p className="mt-0.5 text-xs font-bold text-primary">${(card.price / 100).toFixed(2)}</p>
              </div>
              <button
                onClick={() => removeCard(card.id)}
                className="flex-shrink-0 border-2 border-black bg-[#d94343] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[#b92b31]"
                data-testid={`button-remove-card-${card.id}`}
              >
                Remove
              </button>
            </div>
          ))}
          {items.map((item) => (
            <div key={`v-${item.variantId}`} className="flex items-center gap-3 px-3 py-3" data-testid={`card-cart-item-${item.variantId}`}>
              <div className="h-10 w-10 rounded-lg bg-[#111]/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.productName} className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-white/45">{item.productName?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white/90 leading-tight truncate">{item.productName}</p>
                <p className="text-[11px] text-white/45 mt-0.5">{item.variantName} · Qty: {item.quantity}</p>
                <p className="text-xs font-bold text-primary mt-0.5">${((item.price * item.quantity) / 100).toFixed(2)}</p>
              </div>
              <button
                onClick={() => removeItem(item.variantId)}
                className="flex-shrink-0 border-2 border-black bg-[#d94343] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#b92b31] transition-colors"
                data-testid={`button-remove-item-${item.variantId}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Coupon input */}
        <div className="space-y-2">
          {bulkBundle ? (
            <div className="border-[3px] border-black bg-[#1d3d93] px-3 py-3 text-[10px] font-bold text-[#ffe177]">
              BULK BUNDLE PRICE IS LOCKED AT 50% OFF. COUPONS AND RANK DISCOUNTS DO NOT STACK.
            </div>
          ) : appliedDiscount ? (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-primary">{appliedDiscount.code}</p>
                  <p className="text-[10px] text-primary/60">
                    {appliedDiscount.type === "percent" ? `${appliedDiscount.value}% off` : `$${(appliedDiscount.value / 100).toFixed(2)} off`}
                    {" · "}saves ${(appliedDiscount.discountAmount / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <button onClick={() => setAppliedDiscount(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter discount code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                className="pixel-input flex-1 h-10"
                data-testid="input-coupon"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={validateDiscountMutation.isPending || !couponCode.trim()}
                className="pixel-button h-10 px-4 text-[8px] disabled:opacity-50 flex items-center gap-1.5"
                data-testid="button-apply-coupon"
              >
                {validateDiscountMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                Apply
              </button>
            </div>
          )}
        </div>

          </div>

          <aside className="pixel-panel bg-[#162b71] p-4 space-y-5 lg:sticky lg:top-[72px]">
            <div className="flex items-center justify-between border-b-2 border-black/60 pb-3">
              <h3 className="pixel-text text-[10px] text-[#fff0c5]">YOUR CART</h3>
              <span className="font-mono text-[10px] text-[#b9cfff]">{items.reduce((count, item) => count + item.quantity, 0) + cardItems.length + (bulkBundle?.cardIds.length ?? 0)} ITEMS</span>
            </div>
        {/* Checkout summary */}
        <div className="space-y-0">
          <h3 className="pixel-text mb-3 text-[9px] text-[#ffe177]">ORDER SUMMARY</h3>

          <div className="space-y-0 divide-y divide-white/[0.04]">
            <div className="flex justify-between py-2.5 text-xs">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white font-bold">${(cartTotal / 100).toFixed(2)}</span>
            </div>
            {bulkBundle && (
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-[#ffe177] font-bold">20-card bulk discount (50%)</span>
                <span className="text-[#43b94e] font-bold">-${(bundleDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            {appliedDiscount && (
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-primary/80 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Discount ({appliedDiscount.code})
                </span>
                <span className="text-primary font-bold">-${(discountAmount / 100).toFixed(2)}</span>
              </div>
            )}
            {rankDiscountAmount > 0 && (
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-amber-400/80 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Rank discount ({rankDiscountPct}% · {rankData?.rank?.toUpperCase()})
                </span>
                <span className="text-amber-400 font-bold">-${(rankDiscountAmount / 100).toFixed(2)}</span>
              </div>
            )}
            {processorFee > 0 && (
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-white/50">Processing fee ({processorFeePercent}%)</span>
                <span className="text-white/70 font-bold">+${(processorFee / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 text-xs font-bold">
              <span className="text-white">Total</span>
              <span className="text-white">${(dueTotal / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment processor */}
        <div>
          <p className="pixel-label mb-2">{hasCardPurchase ? "CARD PAYOUT · BALANCE ONLY" : "SELECT PAYMENT PROCESSOR"}</p>
          {hasCardPurchase && (
            <p className="mb-2 text-[10px] font-mono text-[#b9cfff]">Cards are paid from your available balance.</p>
          )}
          <div className="space-y-1.5">
            {!hasCardPurchase && cashappEnabled && (
              <button
                onClick={() => setSelectedMethod("cashapp")}
                data-testid="button-payment-cashapp"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                  selectedMethod === "cashapp"
                    ? "border-white/15 bg-[#0d0d0d]"
                    : "border-white/10 bg-[#111] hover:border-white/10"
                }`}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedMethod === "cashapp" ? "border-primary" : "border-white/15"}`}>
                  {selectedMethod === "cashapp" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <SiCashapp className="h-4 w-4 text-[#00D632] flex-shrink-0" />
                <span className="flex-1 text-left text-xs font-bold text-white">CashApp</span>
                <span className="text-[11px] font-semibold text-white/45">
                  {feePercentFor("cashapp") > 0 ? `${feePercentFor("cashapp")}% Fee` : "0% Fee"}
                </span>
              </button>
            )}

            {!hasCardPurchase && cryptoEnabled && (
              <div className={`rounded-xl border p-1.5 ${selectedMethod === "crypto" ? "border-primary/50 bg-[#0d0d0d]" : "border-white/10 bg-[#111]"}`}>
                <button
                  onClick={() => setSelectedMethod("crypto")}
                  data-testid="button-payment-crypto"
                  className="w-full flex items-center gap-3 px-1.5 py-1"
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedMethod === "crypto" ? "border-primary" : "border-white/15"}`}>
                    {selectedMethod === "crypto" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  {selectedCrypto ? (
                    <CryptoCoinIcon ticker={selectedCrypto.ticker} color={selectedCrypto.color} className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <SiBitcoin className="h-4 w-4 text-[#f7931a] flex-shrink-0" />
                  )}
                  <span className="flex-1 text-left text-xs font-bold text-white">Crypto</span>
                  <span className="text-[11px] font-semibold text-white/45">0% Fee</span>
                </button>
                {selectedMethod === "crypto" && (
                  <div className="mt-2 border-t border-white/10 pt-2">
                    <p className="mb-2 px-1 text-[10px] font-mono font-bold text-white/55">CHOOSE A PAYMENT COIN</p>
                    <CryptoCoinSelector
                      currencies={cryptoCurrencies}
                      value={selectedCryptoCode}
                      onChange={setSelectedCryptoCode}
                      compact
                    />
                  </div>
                )}
              </div>
            )}

            {walletEnabled && (
              <button
                onClick={() => setSelectedMethod("balance")}
                data-testid="button-payment-balance"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                  selectedMethod === "balance"
                    ? "border-white/15 bg-[#0d0d0d]"
                    : "border-white/10 bg-[#111] hover:border-white/10"
                }`}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedMethod === "balance" ? "border-primary" : "border-white/15"}`}>
                  {selectedMethod === "balance" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <Wallet className="h-4 w-4 text-white/45 flex-shrink-0" />
                <span className="flex-1 text-left text-xs font-bold text-white">Balance</span>
                <span className="text-[11px] font-semibold text-white/45">0% Fee</span>
                <span className={`text-[11px] font-semibold ${hasEnoughBalance ? "text-primary" : "text-red-400"}`}>
                  You have ${(userBalance / 100).toFixed(2)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Proceed to Payment */}
        <button
          className="w-full border-[3px] border-black bg-[#43b94e] py-3 pixel-text text-[9px] text-white hover:bg-[#31973a] transition-colors disabled:opacity-50 uppercase flex items-center justify-center gap-2"
          disabled={isPending}
          onClick={handleCheckout}
          data-testid="button-proceed-payment"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {hasCardPurchase ? "CHECKOUT WITH BALANCE" : "PROCEED TO PAYMENT"}
        </button>
          </aside>
        </div>
      </div>
    </>
  );
}
