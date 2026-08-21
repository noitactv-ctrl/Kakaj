import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, TicketCheck, ChevronRight, AlertCircle, CheckCircle2, RefreshCw, XCircle, ShoppingBag } from "lucide-react";

type Ticket = {
  id: number;
  orderId: string;
  subject: string;
  description: string;
  imageUrl: string;
  status: "open" | "refunded" | "replaced" | "resolved";
  adminMessage: string | null;
  createdAt: string;
};

type Order = {
  id: number;
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
};

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map: Record<string, { label: string; cls: string; Icon: any }> = {
    open:     { label: "Open",     cls: "bg-amber-500/15 text-amber-400 border-amber-500/25",   Icon: AlertCircle },
    refunded: { label: "Refunded", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", Icon: CheckCircle2 },
    replaced: { label: "Replaced", cls: "bg-sky-500/15 text-sky-400 border-sky-500/25",         Icon: RefreshCw },
    resolved: { label: "Resolved", cls: "bg-white/8 text-white/40 border-white/10",             Icon: XCircle },
  };
  const s = map[status] ?? map.open;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>
      <s.Icon className="h-2.5 w-2.5" />
      {s.label}
    </span>
  );
}

export default function SupportPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"submit" | "history">("submit");

  // form state
  const [agreed, setAgreed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderIdError, setOrderIdError] = useState("");
  const [orderIdValid, setOrderIdValid] = useState(false);
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/support"],
    staleTime: 30000,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    staleTime: 60000,
  });

  // Validate order ID against user's real orders
  function handleOrderIdChange(val: string) {
    setOrderId(val);
    setOrderIdError("");
    setOrderIdValid(false);
  }

  function validateOrderId() {
    const trimmed = orderId.trim();
    if (!trimmed) {
      setOrderIdError("Order ID is required");
      return false;
    }
    if (!orders) return false;
    const match = orders.find(o => o.orderId === trimmed);
    if (!match) {
      setOrderIdError("Order ID not found. Check your Orders page for the correct ID.");
      return false;
    }
    setOrderIdValid(true);
    setOrderIdError("");
    return true;
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!validateOrderId()) throw new Error("Invalid Order ID");
      if (!issue) throw new Error("Please select an issue type");
      if (!description.trim()) throw new Error("Please provide a description");
      const res = await apiRequest("POST", "/api/support", {
        orderId: orderId.trim(),
        subject: issue,
        description: description.trim(),
        imageUrl: imageUrl.trim(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/support"] });
      toast({ title: "Ticket submitted", description: "Our team will review it shortly." });
      setOrderId(""); setIssue(""); setDescription(""); setImageUrl("");
      setAgreed(false); setOrderIdValid(false);
      setTab("history");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openCount = (tickets ?? []).filter(t => t.status === "open").length;

  return (
    <div className="pixel-page min-h-screen flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-1 py-2">

        {/* Header */}
        <div className="mb-6">
          <p className="pixel-text text-[8px] text-[#ffe177]">HELP DESK</p>
          <h1 className="mt-3 text-xl leading-relaxed text-white">SUPPORT TICKETS</h1>
          <p className="text-xs text-white/55 mt-2">Get help with a completed order.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-[3px] border-black bg-[#10215e] p-1 mb-6 gap-1">
          {(["submit", "history"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-bold tracking-wide rounded-md transition-all ${
                tab === t
                  ? "bg-[#d94343] text-white"
                  : "text-white/55 hover:text-white hover:bg-[#17337d]"
              }`}
            >
              {t === "submit" ? "New Ticket" : `History${openCount > 0 ? ` (${openCount})` : ""}`}
            </button>
          ))}
        </div>

        {/* ── Submit Ticket ── */}
        {tab === "submit" && (
          <div className="space-y-4">
            {/* Instructions card */}
            <div className="pixel-panel bg-[#10215e] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <h2 className="text-sm font-bold text-white">Before submitting</h2>
              </div>
              <ul className="text-xs text-white/55 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />Copy your <span className="text-primary font-medium">Order ID</span> from the Orders page</li>
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />Choose Refund or Replace depending on your issue</li>
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />Describe the problem clearly so we can help faster</li>
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />Attach a screenshot link if applicable (imgur, etc.)</li>
              </ul>
              <label className="flex items-center gap-3 cursor-pointer pt-1 border-t border-white/8 mt-3">
                <div
                  onClick={() => setAgreed(v => !v)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${agreed ? "bg-primary border-primary" : "border-white/20 bg-transparent"}`}
                >
                  {agreed && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <span className="text-xs text-white/60">I understand and agree to the terms</span>
              </label>
            </div>

            {/* Form */}
            <fieldset disabled={!agreed} className="space-y-4 disabled:opacity-35 disabled:pointer-events-none transition-opacity">
              {/* Order ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Order ID</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. ORD-12345"
                    value={orderId}
                    onChange={e => handleOrderIdChange(e.target.value)}
                    onBlur={validateOrderId}
                    className={`w-full h-11 border-[3px] border-black bg-[#ffe1aa] px-3 text-sm text-[#1b130b] placeholder:text-[#735c44] outline-none transition-colors ${
                      orderIdError ? "border-red-500/60 focus:border-red-500" :
                      orderIdValid ? "border-emerald-500/50 focus:border-emerald-500" :
                      "border-white/10 focus:border-primary/50"
                    }`}
                  />
                  {orderIdValid && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  )}
                </div>
                {orderIdError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />{orderIdError}
                  </p>
                )}
              </div>

              {/* Issue Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Issue Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Refund", "Replace"].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIssue(opt)}
                      className={`h-11 rounded-lg border text-sm font-semibold transition-all ${
                        issue === opt
                          ? "border-black bg-[#d94343] text-white"
                          : "border-black bg-[#17337d] text-white/70 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Description</label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border-[3px] border-black bg-[#ffe1aa] px-3 py-2.5 text-sm text-[#1b130b] placeholder:text-[#735c44] outline-none resize-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                  Screenshot URL <span className="text-white/25 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://imgur.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full h-11 border-[3px] border-black bg-[#ffe1aa] px-3 text-sm text-[#1b130b] placeholder:text-[#735c44] outline-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                  className="w-full border-[3px] border-black bg-[#43b94e] py-3 pixel-text text-[9px] text-white hover:bg-[#31973a] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                {submitMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  : <><Send className="h-4 w-4" /> Submit Ticket</>}
              </button>
            </fieldset>
          </div>
        )}

        {/* ── History ── */}
        {tab === "history" && (
          <div className="space-y-3">
            {ticketsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !tickets?.length ? (
              <div className="text-center py-16 space-y-3">
                <TicketCheck className="h-10 w-10 text-white/15 mx-auto" />
                <p className="text-sm text-white/35">No tickets yet</p>
                <button onClick={() => setTab("submit")} className="text-xs text-primary hover:underline">
                  Submit your first ticket
                </button>
              </div>
            ) : (
              tickets.map(ticket => {
                const matchedOrder = orders?.find(o => o.orderId === ticket.orderId);
                const purchasedAt = matchedOrder?.createdAt
                  ? new Date(matchedOrder.createdAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "numeric", minute: "2-digit", hour12: true,
                    })
                  : null;
                return (
                <div key={ticket.id} className="pixel-panel bg-[#10215e] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-mono text-white/35">{ticket.orderId}</p>
                      <p className="text-sm font-bold text-white">{ticket.subject}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  {/* Purchase time */}
                  {purchasedAt && (
                    <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                      <ShoppingBag className="h-3 w-3 shrink-0" />
                      <span>Purchased {purchasedAt}</span>
                    </div>
                  )}

                  <p className="text-xs text-white/50 leading-relaxed">{ticket.description}</p>
                  {ticket.imageUrl && (
                    <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      View screenshot <ChevronRight className="h-3 w-3" />
                    </a>
                  )}
                  {ticket.adminMessage && (
                    <div className="bg-primary/8 border border-primary/20 rounded-lg px-3 py-2.5">
                      <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1">Response from team</p>
                      <p className="text-xs text-white/70 leading-relaxed">{ticket.adminMessage}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-white/20">
                    Ticket opened {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                );
              })
            )}
          </div>
        )}
      </div>

    </div>
  );
}
