 import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
 import { Loader2, Plus, Trash2, Pencil, X, Users, DollarSign, ShoppingBag, Receipt, ShieldX, Menu, ChevronRight, ChevronDown, Link2, Package, Wallet, Pin, Tag, Copy, Check, Upload, ImageIcon, LayoutDashboard, CreditCard, MessageSquare, Settings, Code2, KeyRound, Landmark, Gift, RefreshCw, Bot, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SiBitcoin, SiCashapp } from "react-icons/si";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CryptoCoinIcon, type CryptoCurrencyOption } from "@/components/CryptoCoinSelector";
import { refreshCardBins } from "@/lib/card-refresh";
import { splitCardEntries } from "@shared/card-input";

const adminSections = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "cards", label: "Cards",      Icon: CreditCard },
  { id: "products", label: "Products", Icon: Package },
  { id: "orders",   label: "Orders",     Icon: ShoppingBag },
  { id: "cashapp",  label: "Payments",   Icon: DollarSign, ownerOnly: true },
  { id: "deposits", label: "Deposits",   Icon: Wallet },
  { id: "codes",    label: "Codes",      Icon: Tag },
  { id: "users",    label: "Users",      Icon: Users },
  { id: "support",  label: "Support",    Icon: MessageSquare },
  { id: "credit-bot", label: "Credit Bot", Icon: Bot, ownerOnly: true },
  { id: "integrations", label: "Settings", Icon: Settings, ownerOnly: true },
];

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  const isAdmin = user?.role === "admin";
  const isOwner = Boolean((user as any)?.isOwner);
  const visibleAdminSections = adminSections.filter(section => !section.ownerOnly || isOwner);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0d]">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0d0d0d] gap-3">
        <ShieldX className="h-12 w-12 text-red-400" />
        <p className="text-base font-bold text-white/70">Access Denied</p>
        <p className="text-sm text-white/40">Admin accounts only</p>
      </div>
    );
  }

  const activeLabel = visibleAdminSections.find(s => s.id === activeSection)?.label ?? "";

  return (
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-white/10 bg-[#111]">
        <div className="px-5 py-5 border-b border-white/8">
          <p className="text-base font-black text-white">
             BEASTCC
          </p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleAdminSections.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                data-testid={`admin-nav-${id}`}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: active ? "hsl(38 95% 55% / 0.15)" : undefined,
                  color: active ? "hsl(38 95% 55%)" : "#6b7280",
                  border: active ? "1px solid hsl(38 95% 55% / 0.25)" : "1px solid transparent",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#d1d5db"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? "hsl(38 95% 55% / 0.15)" : ""; (e.currentTarget as HTMLElement).style.color = active ? "hsl(38 95% 55%)" : "#6b7280"; }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/8">
          <button
            onClick={() => setLocation("/")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-[#111]/5 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to site
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile header */}
        <header className="md:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
          <div>
            <p className="text-sm font-black text-white">
                BEASTCC
              <span className="ml-1.5 text-xs font-normal text-white/40">Admin</span>
            </p>
            <p className="text-[10px] text-white/40 font-mono">{activeLabel}</p>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="text-xs text-white/45 border border-white/10 rounded-lg px-2.5 py-1.5 hover:bg-[#0d0d0d] transition-colors"
          >
            ← Site
          </button>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="pixel-page w-full">
            {activeSection === "dashboard"    && <DashboardSection canManageDanger={isOwner} />}
            {activeSection === "cards"        && <AdminCardsSection />}
            {activeSection === "products"     && <ProductsSection />}
            {activeSection === "orders"       && <OrdersSection />}
            {activeSection === "cashapp"      && <CashAppSection />}
            {activeSection === "users"        && <UsersSection canManageStaff={isOwner} />}
            {activeSection === "support"      && <SupportSection />}
            {activeSection === "deposits"     && <DepositsSection />}
            {activeSection === "codes"        && <CodesSection />}
            {isOwner && activeSection === "credit-bot" && <CreditBotSection />}

            {activeSection === "integrations" && <IntegrationsSection />}
          </div>
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-50 flex overflow-x-auto bg-[#111] border-t border-white/10"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {visibleAdminSections.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                data-testid={`admin-tab-${id}`}
                className={`shrink-0 flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors ${active ? "text-primary" : "text-white/40"}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-medium">{label}</span>
                {active && (
                  <span className="mt-0.5 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

type CreditBotStatus = {
  enabled: boolean;
  configured: boolean;
  channelConfigured: boolean;
  channelId: string;
  channelLink: string;
  botName: string;
  botUrl: string;
  linkedUsers: number;
  rewardCents: number;
  rewardIntervalHours: number;
  brandName: string;
};

function CreditBotSection() {
  const { toast } = useToast();
  const [channelId, setChannelId] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [botName, setBotName] = useState("");
  const [token, setToken] = useState("");
  const [rewardAmount, setRewardAmount] = useState("0.25");
  const [announcement, setAnnouncement] = useState("");
  const [showNamedOnly, setShowNamedOnly] = useState(false);
  const { data: status, isLoading } = useQuery<CreditBotStatus>({
    queryKey: ["/api/admin/credit-bot"],
  });
  const { data: botUsers = [], isLoading: usersLoading } = useQuery<CreditBotUser[]>({
    queryKey: ["/api/admin/credit-bot/users"],
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (status) setChannelId(status.channelId ?? "");
    if (status) setChannelLink(status.channelLink ?? "");
    if (status) setBotName(status.botName ?? "");
    if (status) setRewardAmount((status.rewardCents / 100).toFixed(2));
  }, [status?.channelId, status?.channelLink, status?.botName, status?.rewardCents]);

  const saveMutation = useMutation({
    mutationFn: async (updates: { enabled?: boolean; channelId?: string; channelLink?: string; botName?: string; token?: string; rewardCents?: number }) => {
      const response = await apiRequest("PATCH", "/api/admin/credit-bot", updates);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Could not save bot settings");
      }
      return response.json() as Promise<CreditBotStatus>;
    },
    onSuccess: () => {
      setToken("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-bot"] });
      queryClient.invalidateQueries({ queryKey: ["/api/telegram/status"] });
      toast({ title: "Credit Bot updated" });
    },
    onError: (error: Error) => toast({ title: "Could not update bot", description: error.message, variant: "destructive" }),
  });

  const announcementMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/credit-bot/announcement", { message: announcement });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Could not send announcement");
      }
      return response.json() as Promise<{ sent: number; failed: number }>;
    },
    onSuccess: (result) => {
      setAnnouncement("");
      toast({
        title: "Announcement sent",
        description: `Delivered to ${result.sent} linked user${result.sent === 1 ? "" : "s"}${result.failed ? `; ${result.failed} failed` : ""}.`,
      });
    },
    onError: (error: Error) => toast({ title: "Announcement failed", description: error.message, variant: "destructive" }),
  });

  if (isLoading || !status) {
    return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold"><Bot className="h-6 w-6 text-primary" />Credit Bot</h1>
          <p className="mt-1 text-sm text-muted-foreground">Telegram account linking, rep rewards, and announcements.</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.enabled ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          <span className={`h-2 w-2 rounded-full ${status.enabled ? "bg-green-400" : "bg-red-400"}`} />
          {status.enabled ? "BOT ON" : "BOT OFF"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Linked users" value={status.linkedUsers} icon={Users} />
        <StatCard title="Reward" value={`$${(status.rewardCents / 100).toFixed(2)}`} icon={DollarSign} color="green" />
        <StatCard title="Reward timer" value={`${status.rewardIntervalHours}h`} icon={RefreshCw} color="orange" />
        <StatCard title="Name rule" value={status.brandName} icon={Tag} />
      </div>

      <Card className="border-white/10 bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base">Bot configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div>
              <p className="text-sm font-bold text-white">Rewards bot status</p>
              <p className="mt-1 text-xs text-white/45">
                Turning it off alerts linked users and makes every bot command return an offline message.
              </p>
            </div>
            <Switch
              checked={status.enabled}
              disabled={saveMutation.isPending}
              onCheckedChange={(enabled) => saveMutation.mutate({ enabled })}
              data-testid="switch-credit-bot-enabled"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <label htmlFor="credit-bot-channel" className="text-sm font-medium leading-none text-white">
                Main channel ID
              </label>
              <Input
                id="credit-bot-channel"
                value={channelId}
                onChange={event => setChannelId(event.target.value)}
                placeholder="@channel or -100..."
                className="border-white/10 bg-black/20 font-mono"
                data-testid="input-credit-bot-channel"
              />
              <p className="text-[11px] text-white/40">The bot checks membership in this Telegram channel before rewarding.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="credit-bot-channel-link" className="text-sm font-medium leading-none text-white">
                Main channel link
              </label>
              <Input
                id="credit-bot-channel-link"
                value={channelLink}
                onChange={event => setChannelLink(event.target.value)}
                placeholder="https://t.me/yourchannel"
                className="border-white/10 bg-black/20 font-mono"
                data-testid="input-credit-bot-channel-link"
              />
              <p className="text-[11px] text-white/40">Shown when a user needs to rejoin.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="credit-bot-token" className="text-sm font-medium leading-none text-white">
                Telegram bot token
              </label>
              <Input
                id="credit-bot-token"
                type="password"
                value={token}
                onChange={event => setToken(event.target.value)}
                placeholder={status.configured ? "Configured — leave blank to keep" : "Paste bot token"}
                autoComplete="new-password"
                className="border-white/10 bg-black/20 font-mono"
                data-testid="input-credit-bot-token"
              />
              <p className="text-[11px] text-white/40">Encrypted server-side and never returned to the browser.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="credit-bot-name" className="text-sm font-medium leading-none text-white">
                Bot name / username
              </label>
              <Input
                id="credit-bot-name"
                value={botName}
                onChange={event => setBotName(event.target.value)}
                placeholder="@your_rewards_bot"
                className="border-white/10 bg-black/20 font-mono"
                data-testid="input-credit-bot-name"
              />
              <p className="text-[11px] text-white/40">Used for the “Go to bot” button on the link page.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="credit-bot-reward" className="text-sm font-medium leading-none text-white">
                Daily reward amount
              </label>
              <Input
                id="credit-bot-reward"
                type="number"
                min="0.01"
                max="1000"
                step="0.01"
                value={rewardAmount}
                onChange={event => setRewardAmount(event.target.value)}
                className="border-white/10 bg-black/20 font-mono"
                data-testid="input-credit-bot-reward"
              />
              <p className="text-[11px] text-white/40">Credit added once every 24 hours after eligibility checks.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 text-[11px]">
              <Badge variant="outline" className={status.configured ? "border-green-500/30 text-green-400" : "border-amber-500/30 text-amber-300"}>
                Token {status.configured ? "ready" : "missing"}
              </Badge>
              <Badge variant="outline" className={status.channelConfigured ? "border-green-500/30 text-green-400" : "border-amber-500/30 text-amber-300"}>
                Channel {status.channelConfigured ? "ready" : "missing"}
              </Badge>
            </div>
            <Button
              onClick={() => {
                const rewardCents = Math.round(Number(rewardAmount) * 100);
                saveMutation.mutate({
                  channelId,
                  channelLink,
                  botName,
                  rewardCents,
                  ...(token.trim() ? { token: token.trim() } : {}),
                });
              }}
              disabled={saveMutation.isPending}
              data-testid="button-save-credit-bot"
            >
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save bot settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#111]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Send className="h-4 w-4 text-primary" />Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={announcement}
            onChange={event => setAnnouncement(event.target.value)}
            placeholder="Write a message to every linked Telegram user..."
            maxLength={4000}
            rows={6}
            className="border-white/10 bg-black/20"
            data-testid="textarea-credit-bot-announcement"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-white/40">{announcement.length}/4000 characters</p>
            <Button
              onClick={() => announcementMutation.mutate()}
              disabled={!announcement.trim() || announcementMutation.isPending}
              data-testid="button-send-credit-bot-announcement"
            >
              {announcementMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send to all linked users
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#111]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Registered users and balances</CardTitle>
            <p className="mt-1 text-xs text-white/45">All registered accounts. Telegram names are shown when a user has linked and set one.</p>
          </div>
          <Button
            size="sm"
            variant={showNamedOnly ? "default" : "outline"}
            onClick={() => setShowNamedOnly(value => !value)}
            className="shrink-0 text-xs"
            data-testid="button-filter-credit-bot-named"
          >
            {showNamedOnly ? "Showing named" : "Show name set"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-xs text-white/45">User</TableHead>
                    <TableHead className="text-xs text-white/45">Balance</TableHead>
                    <TableHead className="text-xs text-white/45">Telegram name</TableHead>
                    <TableHead className="text-xs text-white/45">Link</TableHead>
                    <TableHead className="text-right text-xs text-white/45">Last reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {botUsers.filter(user => !showNamedOnly || user.telegramNameSet).map(user => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/[0.02]">
                      <TableCell>
                        <p className="text-xs font-bold text-white">{user.username}</p>
                        <p className="text-[10px] text-white/35">{user.email}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-green-300">${(user.balance / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        {user.telegramNameSet ? (
                          <div>
                            <p className="text-xs text-white">{user.telegramName}</p>
                            {user.telegramUsername && <p className="text-[10px] text-white/35">@{user.telegramUsername.replace(/^@/, "")}</p>}
                          </div>
                        ) : <span className="text-xs text-white/30">Not set</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.telegramLinked ? "border-green-500/30 text-green-400" : "border-white/10 text-white/35"}>
                          {user.telegramLinked ? "Linked" : "Not linked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[10px] text-white/40">
                        {user.lastTelegramNameReward ? new Date(user.lastTelegramNameReward).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!botUsers.filter(user => !showNamedOnly || user.telegramNameSet).length && (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-xs text-white/35">No users match this filter.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type CreditBotUser = {
  id: number;
  username: string;
  email: string;
  balance: number;
  telegramUsername: string;
  telegramName: string;
  telegramNameSet: boolean;
  telegramLinked: boolean;
  lastTelegramNameReward: string | null;
};

function DashboardSection({ canManageDanger }: { canManageDanger: boolean }) {
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: [api.admin.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.admin.dashboard.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/clear-all-data", {});
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      setConfirmClear(false);
      queryClient.invalidateQueries();
      toast({ title: "All data cleared", description: "Products, orders, cards, and balances have been wiped." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} />
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingBag} />
        <StatCard title="Total Sales" value={`$${((stats?.totalSales || 0) / 100).toFixed(2)}`} icon={DollarSign} color="green" />
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={Receipt} color="orange" />
        <StatCard title="Stock Worth" value={`$${((stats?.stockWorth || 0) / 100).toFixed(2)}`} icon={Package} color="gold" />
      </div>

      {canManageDanger && <div className="border border-red-500/20 bg-red-950/10 rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-red-400">Danger Zone</p>
          <p className="text-xs text-white/45 mt-0.5">Permanently wipe all products, orders, cards, and reset all user balances to $0.</p>
        </div>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
            data-testid="btn-clear-all-data"
          >
            Clear All Site Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs text-red-300 font-mono">Are you sure? This cannot be undone.</p>
            <button
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              className="px-3 py-1.5 rounded bg-red-500 text-white text-xs font-black hover:bg-red-600 transition-colors disabled:opacity-50"
              data-testid="btn-clear-confirm"
            >
              {clearAllMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, wipe everything"}
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 rounded bg-[#0d0d0d] text-white/45 text-xs hover:bg-[#111]/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>}
    </div>
  );
}

function DepositsSection() {
  const { toast } = useToast();
  const { data: deposits, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/deposits"],
    queryFn: async () => {
      const res = await fetch("/api/admin/deposits");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000,
  });
  const approveMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/manual-deposit-approve`, {});
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to approve deposit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Deposit confirmed — balance credited" });
    },
    onError: (error: Error) => toast({ title: "Unable to approve deposit", description: error.message, variant: "destructive" }),
  });
  const markUnpaidMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/manual-deposit-unpaid`, {});
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to mark deposit unpaid");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Deposit marked unpaid" });
    },
    onError: (error: Error) => toast({ title: "Unable to mark deposit unpaid", description: error.message, variant: "destructive" }),
  });

  const statusBadge = (status: string, type: string) => {
    if (status === "fulfilled" || status === "delivering") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-mono">credited</span>;
    if (status === "pending") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-mono">{type === "crypto" ? "pending" : "awaiting admin"}</span>;
    if (status === "unpaid" || status === "failed" || status === "expired") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-mono">unpaid</span>;
    if (status === "waiting_payment") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-mono">unpaid</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#111]/5 text-white/45 font-mono">{status}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deposits</h1>
          <p className="text-sm text-muted-foreground mt-1">All crypto and manual deposits from all users</p>
        </div>
        <Button size="sm" variant="outline" className="text-xs border-white/10" onClick={() => refetch()}>Refresh</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : !deposits?.length ? (
        <div className="text-center py-20 text-white/40 text-sm">No deposits yet</div>
      ) : (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/45 text-xs">User</TableHead>
                <TableHead className="text-white/45 text-xs">Type</TableHead>
                <TableHead className="text-white/45 text-xs">Amount</TableHead>
                <TableHead className="text-white/45 text-xs">Status</TableHead>
                <TableHead className="text-white/45 text-xs">Note</TableHead>
                <TableHead className="text-white/45 text-xs">Date</TableHead>
                <TableHead className="text-white/45 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((d: any) => (
                <TableRow key={d.id} className="border-white/10 hover:bg-[#111]/[0.02]">
                  <TableCell className="text-xs font-mono text-white/60">{d.username}</TableCell>
                  <TableCell className="text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${d.type === "crypto" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400"}`}>
                      {d.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold">${((d.amount ?? 0) / 100).toFixed(2)}</TableCell>
                  <TableCell>{statusBadge(d.status, d.type)}</TableCell>
                  <TableCell className="text-[10px] font-mono text-white/45">{d.paymentNote ?? "—"}</TableCell>
                  <TableCell className="text-[10px] text-white/45">{new Date(d.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {d.type !== "crypto" && d.status === "pending" && d.orderId ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(d.orderId)}
                          disabled={approveMutation.isPending || markUnpaidMutation.isPending}
                          className="h-7 bg-green-600 hover:bg-green-500 text-[10px]"
                          data-testid={`button-approve-deposit-${d.orderId}`}
                        >
                          {approveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markUnpaidMutation.mutate(d.orderId)}
                          disabled={approveMutation.isPending || markUnpaidMutation.isPending}
                          className="h-7 border-red-500/30 text-red-300 hover:bg-red-500/10 text-[10px]"
                          data-testid={`button-unpaid-deposit-${d.orderId}`}
                        >
                          Unpaid
                        </Button>
                      </div>
                    ) : <span className="text-xs text-white/25">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClass = color === "green" ? "text-green-500" : color === "orange" ? "text-orange-500" : "text-primary";
  return (
    <Card className="bg-[#111] border-white/10">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${colorClass} opacity-60`} />
      </CardContent>
    </Card>
  );
}

type ProductCategoryRecord = {
  id: number;
  name: string;
  normalizedName: string;
  productCount: number;
};

function ProductImageField({
  id,
  value,
  uploading,
  onFile,
  onRemove,
}: {
  id: string;
  value?: string;
  uploading: boolean;
  onFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <FormLabel>Product Image <span className="font-normal text-white/40">(optional)</span></FormLabel>
      <div className="flex flex-col gap-3 border border-white/10 bg-black p-3 sm:flex-row sm:items-center">
        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-[#070707] sm:w-36">
          {value ? (
            <img src={value} alt="Product preview" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="text-center text-white/35">
              <ImageIcon className="mx-auto h-7 w-7" />
              <p className="mt-2 text-[10px]">No image selected</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          <label htmlFor={id}>
            <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {value ? "Replace image" : "Upload image"}
            </span>
          </label>
          <input id={id} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={onFile} />
          {value && (
            <Button type="button" size="sm" variant="outline" className="h-9 text-xs" onClick={onRemove} disabled={uploading}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />Remove
            </Button>
          )}
          <p className="w-full text-[11px] leading-relaxed text-white/45">PNG, JPG, WEBP, or GIF up to 5 MB. Images display on a black product stage.</p>
        </div>
      </div>
    </div>
  );
}

function ProductsSection() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [managingStock, setManagingStock] = useState<number | null>(null);
  const [editingVariant, setEditingVariant] = useState<number | null>(null);
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const { data: products, isLoading, isError, refetch } = useQuery<any[]>({ queryKey: ["/api/admin/products"] });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ProductCategoryRecord[]>({
    queryKey: [api.productCategories.list.path],
  });

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
  };

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: [api.productCategories.list.path] });
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, formType: "add" | "edit") => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      toast({ title: "IMAGE NOT ACCEPTED", description: "Choose a PNG, JPG, WEBP, or GIF image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "IMAGE TOO LARGE", description: "Choose an image smaller than 5 MB.", variant: "destructive" });
      return;
    }
    const setUploading = formType === "add" ? setIsUploadingAddImage : setIsUploadingEditImage;
    const form = formType === "add" ? addForm : editForm;
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that image."));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const res = await apiRequest("POST", "/api/upload", { filename: file.name, mimeType: file.type, data: base64 });
      const data = await res.json();
      form.setValue("image", data.url, { shouldDirty: true });
      toast({ title: "IMAGE READY", description: "The image will be saved with the product." });
    } catch (error: any) {
      toast({ title: "IMAGE UPLOAD FAILED", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const productSchema = z.object({
    name: z.string().min(1, "Name required"),
    description: z.string().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
  });

  const variantSchema = z.object({
    name: z.string().min(1, "Name required"),
    price: z.string().refine(value => Number.isFinite(Number(value)) && Number(value) > 0, "Enter a price greater than $0"),
    minQuantity: z.string().refine(value => Number.isInteger(Number(value)) && Number(value) >= 1, "Minimum quantity must be at least 1"),
  });

  const addForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", image: "", category: "" },
  });

  const editForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", image: "", category: "" },
  });

  const variantForm = useForm<z.infer<typeof variantSchema>>({
    resolver: zodResolver(variantSchema),
    defaultValues: { name: "", price: "", minQuantity: "1" },
  });


  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productSchema>) => {
      const res = await apiRequest("POST", api.products.create.path, { ...data, description: data.description || "" });
      return res.json();
    },
    onSuccess: () => {
      invalidateProducts();
      invalidateCategories();
      addForm.reset();
      setShowAddForm(false);
      toast({ title: "Product added" });
    },
    onError: (error: Error) => toast({ title: "PRODUCT NOT SAVED", description: error.message, variant: "destructive" }),
  });

  const editMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productSchema>) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${editingProduct.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      invalidateProducts();
      invalidateCategories();
      setEditingProduct(null);
      toast({ title: "Product updated" });
    },
    onError: (error: Error) => toast({ title: "PRODUCT NOT UPDATED", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      invalidateProducts();
      invalidateCategories();
      toast({ title: "Product deleted" });
    },
    onError: (error: Error) => toast({ title: "PRODUCT NOT DELETED", description: error.message, variant: "destructive" }),
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: number; pinned: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, { pinned });
      return res.json();
    },
    onSuccess: () => {
      invalidateProducts();
    }
  });

  const activeMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, { active });
      return res.json();
    },
    onSuccess: (_product, variables) => {
      invalidateProducts();
      toast({
        title: variables.active ? "PRODUCT VISIBLE" : "PRODUCT HIDDEN",
        description: variables.active ? "Customers can now find this product." : "The product is hidden without removing order history.",
      });
    },
    onError: (error: Error) => toast({ title: "VISIBILITY NOT UPDATED", description: error.message, variant: "destructive" }),
  });

  const addVariantMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: z.infer<typeof variantSchema> }) => {
      const res = await apiRequest("POST", api.variants.create.path, {
        productId,
        name: data.name,
        price: Math.round(parseFloat(data.price) * 100),
        minQuantity: parseInt(data.minQuantity) || 1,
      });
      return res.json();
    },
    onSuccess: () => {
      invalidateProducts();
      variantForm.reset({ name: "", price: "", minQuantity: "1" });
      toast({ title: "Variant added" });
    },
    onError: (error: Error) => toast({ title: "VARIANT NOT ADDED", description: error.message, variant: "destructive" }),
  });


  const deleteVariantMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/variants/${id}`);
    },
    onSuccess: () => {
      invalidateProducts();
      toast({ title: "Variant deleted" });
    },
    onError: (error: Error) => toast({ title: "VARIANT NOT DELETED", description: error.message, variant: "destructive" }),
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest(api.productCategories.create.method, api.productCategories.create.path, { name });
      return res.json();
    },
    onSuccess: () => {
      setNewCategoryName("");
      invalidateCategories();
      toast({ title: "CATEGORY ADDED", description: "It is now available when editing products." });
    },
    onError: (error: Error) => toast({ title: "CATEGORY NOT ADDED", description: error.message, variant: "destructive" }),
  });

  const renameCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const path = api.productCategories.update.path.replace(":id", String(id));
      const res = await apiRequest(api.productCategories.update.method, path, { name });
      return res.json();
    },
    onSuccess: () => {
      setEditingCategoryId(null);
      setEditingCategoryName("");
      invalidateCategories();
      invalidateProducts();
      toast({ title: "CATEGORY RENAMED", description: "Assigned products were updated too." });
    },
    onError: (error: Error) => toast({ title: "CATEGORY NOT RENAMED", description: error.message, variant: "destructive" }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const path = api.productCategories.delete.path.replace(":id", String(id));
      await apiRequest(api.productCategories.delete.method, path);
    },
    onSuccess: () => {
      invalidateCategories();
      toast({ title: "CATEGORY DELETED" });
    },
    onError: (error: Error) => toast({ title: "CATEGORY NOT DELETED", description: error.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center border border-red-500/25 bg-red-500/10 px-5 py-16 text-center">
        <Package className="h-9 w-9 text-red-300" />
        <p className="mt-4 text-sm font-bold text-white">Products could not be loaded.</p>
        <p className="mt-2 text-xs text-white/55">Check the server connection and try again.</p>
        <Button className="mt-5" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const startEdit = (product: any) => {
    setEditingProduct(product);
    editForm.reset({ name: product.name, description: product.description || "", image: product.image || "", category: product.category || "" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCategories(value => !value)} className="gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5" />Categories
          </Button>
          <Button size="sm" onClick={() => { setShowAddForm(!showAddForm); setEditingProduct(null); }} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />Add Product
          </Button>
        </div>
      </div>

      {showCategories && (
        <Card className="border-primary/20 bg-[#111]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Product Categories</CardTitle>
                <p className="mt-1 text-xs text-white/45">Create reusable categories and keep product filters consistent.</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowCategories(false)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (newCategoryName.trim()) createCategoryMutation.mutate(newCategoryName);
              }}
            >
              <Input
                value={newCategoryName}
                onChange={event => setNewCategoryName(event.target.value)}
                placeholder="New category name"
                maxLength={60}
                className="border-white/10 bg-white/5 text-sm"
                data-testid="input-new-product-category"
              />
              <Button type="submit" size="sm" className="h-10 shrink-0 gap-1.5 text-xs" disabled={!newCategoryName.trim() || createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Category
              </Button>
            </form>

            {categoriesLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : categories.length === 0 ? (
              <p className="border border-dashed border-white/15 px-4 py-6 text-center text-xs text-white/45">No categories yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex flex-col gap-2 border border-white/10 bg-black/30 p-3 sm:flex-row sm:items-center">
                    {editingCategoryId === category.id ? (
                      <>
                        <Input value={editingCategoryName} onChange={event => setEditingCategoryName(event.target.value)} maxLength={60} className="h-9 border-white/10 bg-white/5 text-sm" autoFocus />
                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" className="h-9 text-xs" disabled={!editingCategoryName.trim() || renameCategoryMutation.isPending} onClick={() => renameCategoryMutation.mutate({ id: category.id, name: editingCategoryName })}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{category.name}</p>
                          <p className="text-[11px] text-white/40">{category.productCount} assigned product{category.productCount === 1 ? "" : "s"}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Rename category" onClick={() => { setEditingCategoryId(category.id); setEditingCategoryName(category.name); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title={category.productCount > 0 ? "Move assigned products before deleting" : "Delete category"}
                            disabled={category.productCount > 0 || deleteCategoryMutation.isPending}
                            onClick={() => { if (confirm(`Delete category "${category.name}"?`)) deleteCategoryMutation.mutate(category.id); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="bg-[#111] border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add Product</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setShowAddForm(false)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit((d) => addMutation.mutate(d))} className="space-y-4">
                <FormField control={addForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input {...field} className="bg-[#111]/5 border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={addForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the product — shown on product detail page..."
                        rows={4}
                        className="bg-[#111]/5 border-white/10 resize-none text-sm"
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={addForm.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-white/40 font-normal">(optional)</span></FormLabel>
                    <Select value={field.value || "__none__"} onValueChange={value => field.onChange(value === "__none__" ? "" : value)}>
                      <FormControl>
                        <SelectTrigger className="border-white/10 bg-white/5 text-sm"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No category</SelectItem>
                        {categories.map(category => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={addForm.control} name="image" render={({ field }) => (
                  <FormItem>
                    <ProductImageField
                      id="add-product-image"
                      value={field.value}
                      uploading={isUploadingAddImage}
                      onFile={event => handleProductImageUpload(event, "add")}
                      onRemove={() => field.onChange("")}
                    />
                  </FormItem>
                )} />
                <Button type="submit" size="sm" className="w-full text-xs" disabled={addMutation.isPending}>
                  {addMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Save Product
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {editingProduct && (
        <Card className="bg-[#111] border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Edit: {editingProduct.name}</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setEditingProduct(null)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit((d) => editMutation.mutate(d))} className="space-y-4">
                <FormField control={editForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input {...field} className="bg-[#111]/5 border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the product — shown on product detail page..."
                        rows={4}
                        className="bg-[#111]/5 border-white/10 resize-none text-sm"
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-white/40 font-normal">(optional)</span></FormLabel>
                    <Select value={field.value || "__none__"} onValueChange={value => field.onChange(value === "__none__" ? "" : value)}>
                      <FormControl>
                        <SelectTrigger className="border-white/10 bg-white/5 text-sm"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No category</SelectItem>
                        {categories.map(category => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="image" render={({ field }) => (
                  <FormItem>
                    <ProductImageField
                      id="edit-product-image"
                      value={field.value}
                      uploading={isUploadingEditImage}
                      onFile={event => handleProductImageUpload(event, "edit")}
                      onRemove={() => field.onChange("")}
                    />
                  </FormItem>
                )} />
                <Button type="submit" size="sm" className="w-full text-xs" disabled={editMutation.isPending}>
                  {editMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Update Product
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {products?.map((product: any) => (
          <div key={product.id} className="overflow-hidden rounded-lg border border-white/10 bg-black">
            <div className="flex items-center justify-between p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-[#080808]">
                  {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain p-1.5" /> : <ImageIcon className="h-5 w-5 text-white/25" />}
                </div>
                <div className="min-w-0">
                  <p className="inline-block max-w-full truncate border border-primary/40 bg-primary/15 px-2 py-1 text-sm font-bold text-primary">{product.name}</p>
                  {product.category && (
                    <span className="mt-1 inline-flex max-w-full truncate rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {product.category}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">{product.variants?.length || 0} variant(s)</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <label className="flex items-center gap-2 border border-white/10 bg-white/5 px-2 py-1.5" title={product.active ? "Visible to customers" : "Hidden from customers"}>
                  <span className="text-[10px] font-bold text-white/50">{product.active ? "LIVE" : "HIDDEN"}</span>
                  <Switch
                    checked={product.active}
                    disabled={activeMutation.isPending}
                    onCheckedChange={active => activeMutation.mutate({ id: product.id, active })}
                    aria-label={`${product.active ? "Hide" : "Show"} ${product.name}`}
                  />
                </label>
                <Button
                  variant="ghost" size="icon"
                  className={`h-8 w-8 ${product.pinned ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                  title={product.pinned ? "Unpin product" : "Pin to top (max 4)"}
                  disabled={pinMutation.isPending || (!product.pinned && (products?.filter((p: any) => p.pinned).length ?? 0) >= 4)}
                  onClick={() => pinMutation.mutate({ id: product.id, pinned: !product.pinned })}
                >
                  <Pin className={`h-4 w-4 ${product.pinned ? "fill-primary" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedProduct === product.id ? "rotate-180" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white/70"
                  onClick={() => startEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => { if (confirm("Delete product?")) deleteMutation.mutate(product.id); }}
                  disabled={deleteMutation.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedProduct === product.id && (
              <div className="border-t border-white/10 p-4 space-y-4">
                <p className="text-xs text-muted-foreground font-bold">Variants</p>

                {product.variants?.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((v: any) => (
                      <div key={v.id}>
                        <div className="flex items-center justify-between bg-[#0d0d0d] rounded-lg px-3 py-2 border border-white/10">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate">{v.name}</span>
                            <span className="text-xs text-muted-foreground">${(v.price / 100).toFixed(2)} · min {v.minQuantity || 1}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.stockCount > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {v.stockCount || 0} in stock
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => {
                                setEditingVariant(editingVariant === v.id ? null : v.id);
                              }}
                              title="Edit variant"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => setManagingStock(managingStock === v.id ? null : v.id)}
                              title="Manage stock"
                            >
                              <Package className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => { if (confirm("Delete variant?")) deleteVariantMutation.mutate(v.id); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {editingVariant === v.id && (
                          <EditVariantForm
                            variant={v}
                            onClose={() => setEditingVariant(null)}
                          />
                        )}
                        {managingStock === v.id && <VariantStockPanel variantId={v.id} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No variants yet</p>
                )}

                <Form {...variantForm}>
                  <form onSubmit={variantForm.handleSubmit((d) => addVariantMutation.mutate({ productId: product.id, data: d }))}
                    className="grid grid-cols-2 gap-2 items-end">
                    <FormField control={variantForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 1 Month" className="bg-[#111]/5 border-white/10 h-8 text-xs" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={variantForm.control} name="minQuantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Min Qty</FormLabel>
                        <FormControl><Input {...field} placeholder="1" type="number" min="1" className="bg-[#111]/5 border-white/10 h-8 text-xs" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={variantForm.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Price ($)</FormLabel>
                        <FormControl><Input {...field} placeholder="9.99" type="number" step="0.01" className="bg-[#111]/5 border-white/10 h-8 text-xs" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="col-span-2">
                      <Button type="submit" size="sm" className="w-full h-8 text-xs gap-1" disabled={addVariantMutation.isPending}>
                        {addVariantMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        Add Variant
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        ))}

        {(!products || products.length === 0) && (
          <div className="text-center py-12 text-muted-foreground text-sm">No products yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}

function EditVariantForm({ variant, onClose }: { variant: any; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const variantSchema = z.object({
    name: z.string().min(1, "Name required"),
    price: z.string().min(1, "Price required"),
    minQuantity: z.string().default("1"),
  });

  const form = useForm<z.infer<typeof variantSchema>>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: variant.name,
      price: (variant.price / 100).toFixed(2),
      minQuantity: String(variant.minQuantity ?? 1),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof variantSchema>) => {
      const res = await apiRequest("PATCH", `/api/admin/variants/${variant.id}`, {
        name: data.name,
        price: Math.round(parseFloat(data.price) * 100),
        minQuantity: parseInt(data.minQuantity) || 1,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Variant updated" });
      onClose();
    },
    onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); },
  });

  return (
    <div className="mt-1 bg-[#111]/5 border border-primary/20 rounded-lg p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="grid grid-cols-2 gap-2 items-end">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Name</FormLabel>
              <FormControl><Input {...field} className="bg-[#111]/5 border-white/10 h-8 text-xs" /></FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
          <FormField control={form.control} name="minQuantity" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Min Qty</FormLabel>
              <FormControl><Input {...field} type="number" min="1" className="bg-[#111]/5 border-white/10 h-8 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Price ($)</FormLabel>
              <FormControl><Input {...field} type="number" step="0.01" className="bg-[#111]/5 border-white/10 h-8 text-xs" /></FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
          <div className="col-span-2 flex gap-2">
            <Button type="submit" size="sm" className="flex-1 h-8 text-xs" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function VariantStockPanel({ variantId }: { variantId: number }) {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/admin/stock", variantId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/stock/${variantId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stock");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!input.trim()) throw new Error("No items to add");
      const res = await apiRequest("POST", "/api/admin/stock/bulk", { variantId, rawContent: input });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to add stock");
      }
      return res.json();
    },
    onSuccess: (data) => {
      const msg = data.skippedCount > 0
        ? `Added ${data.addedCount}, skipped ${data.skippedCount} duplicate${data.skippedCount !== 1 ? "s" : ""}`
        : `Added ${data.addedCount} stock item${data.addedCount !== 1 ? "s" : ""}`;
      toast({ title: msg });
      setInput("");
      qc.invalidateQueries({ queryKey: ["/api/admin/stock", variantId] });
      qc.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/stock/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/stock", variantId] });
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Item removed" });
    },
  });

  // Count one-line items or blank-line-separated multi-line items.
  const hasBlankLines = /\n[ \t]*\n/.test(input);
  const pendingCount = input.trim()
    ? hasBlankLines
      ? input.split(/\n\s*\n/).filter(b => b.trim()).length
      : input.split(/\n/).filter(l => l.trim()).length
    : 0;
  const canSubmit = pendingCount > 0 && input.trim().length > 0;

  return (
    <div className="mt-1 mb-2 bg-[#111]/5 rounded-lg border border-white/10 p-3 space-y-3">

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40">
          {isLoading ? "..." : `${items?.length || 0} in stock`}
        </span>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 bg-primary/20 border border-primary/30 rounded px-2 py-0.5">
            <span className="text-[10px] font-black text-primary">{pendingCount}</span>
            <span className="text-[9px] text-primary/70 font-medium">{pendingCount === 1 ? "item" : "items"} to add</span>
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] leading-relaxed text-white/45">
          Paste one safe product item per line. For multi-line items, separate each item with a blank line. Existing duplicates are skipped automatically.
        </p>
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Paste product stock — one item per line:\nLicense key or redemption code A\nLicense key or redemption code B\n\nUse a blank line when one item spans multiple lines."}
            rows={5}
            className="bg-black/60 border-white/10 text-xs font-mono resize-none placeholder:text-white/30"
            data-testid={`input-bulk-stock-${variantId}`}
          />
        </div>
        <Button
          size="sm"
          className="w-full h-7 text-xs gap-1"
          disabled={!canSubmit || addMutation.isPending}
          onClick={() => addMutation.mutate()}
        >
          {addMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Add {pendingCount || ""} Stock Item{pendingCount === 1 ? "" : "s"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : items?.length > 0 ? (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {items.map((item: any) => (
            <div key={item.id} className="bg-[#0d0d0d] border border-white/10 rounded px-3 py-2 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-white/45 truncate">{(item.content || "").substring(0, 80)}{(item.content || "").length > 80 ? "…" : ""}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[9px] text-white/30">avail</span>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-400/50 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic text-center py-1">No stock items yet</p>
      )}
    </div>
  );
}

function statusLabel(s: string) {
  if (s === "pending") return "Pending";
  if (s === "waiting_payment") return "Unpaid";
  if (s === "delivering") return "Fulfilled";
  if (s === "fulfilled") return "Fulfilled";
  if (s === "refunded") return "Refunded";
  if (s === "replaced") return "Replaced";
  return s;
}

function statusBadgeClass(s: string) {
  if (s === "pending") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (s === "waiting_payment") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (s === "delivering" || s === "fulfilled") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s === "refunded") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (s === "replaced") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return "bg-[#111]/5 text-white/60";
}

function OrdersSection() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState<"all" | "waiting" | "fulfilled" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 8000,
  });

  const cashappFulfillMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/cashapp-fulfill`, {});
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order fulfilled — items sent to user" });
    },
    onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  });

  const markUnpaidMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/mark-unpaid`, {});
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order marked unpaid" });
    },
    onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  });

  const refundMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/refund`, {});
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setSelectedOrder(null);
      toast({ title: "Order refunded — balance returned to user" });
    },
    onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  if (selectedOrder) {
    const current = orders?.find((o: any) => o.id === selectedOrder.id) || selectedOrder;
    const productItems = current.items?.filter((i: any) => !i.itemType || i.itemType === "product") || [];
    const grouped: Record<string, { productName: string; variantName: string; qty: number; unitPrice: number }> = {};
    for (const item of productItems) {
      const key = String(item.variantId || item.id);
      if (!grouped[key]) grouped[key] = { productName: item.productName || "Product", variantName: item.variant?.name || "—", qty: 0, unitPrice: item.price };
      grouped[key].qty += (item.quantity ?? 1);
    }
    const groupedEntries = Object.entries(grouped);

    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>← Back</Button>

        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Order Detail</h2>
            <Badge className={statusBadgeClass(current.status)}>{statusLabel(current.status)}</Badge>
          </div>

          <div className="space-y-3 border-b border-white/10 pb-4">
            <div><p className="text-[10px] text-white/45 mb-0.5">Order ID</p><p className="text-xs font-mono text-white break-all">{current.orderId}</p></div>
            <div><p className="text-[10px] text-white/45 mb-0.5">Date</p><p className="text-xs text-white/70">{new Date(current.createdAt).toLocaleString("en-US")}</p></div>
            <div><p className="text-[10px] text-white/45 mb-0.5">Customer</p><p className="text-xs text-white font-bold">{current.user?.username || current.userId}</p></div>
            <div><p className="text-[10px] text-white/45 mb-0.5">Payment</p><p className="text-xs text-white/70">{current.paymentMethod || "—"}</p></div>
            {current.paymentNote && (
              <div><p className="text-[10px] text-white/45 mb-0.5">Payment Note</p><p className="text-xs font-mono text-[#00D632]">{current.paymentNote}</p></div>
            )}
            <div><p className="text-[10px] text-white/45 mb-0.5">Amount</p><p className="text-xs text-white/70">${(current.total / 100).toFixed(2)}</p></div>
            <div><p className="text-[10px] text-white/45 mb-0.5">Status</p><p className={`text-xs font-bold ${statusTextColor(current.status)}`}>{statusLabel(current.status)}</p></div>
          </div>

          {current.status === "pending" && current.paymentMethod === "CashApp" && (
            <div className="flex gap-3 border-b border-white/10 pb-4">
              <button
                onClick={() => { cashappFulfillMutation.mutate(current.id); }}
                disabled={cashappFulfillMutation.isPending}
                className="flex-1 h-11 rounded-xl bg-[#00D632]/20 border border-[#00D632]/40 text-[#00D632] text-sm font-black hover:bg-[#00D632]/30 transition-colors disabled:opacity-50"
                data-testid={`button-cashapp-paid-detail-${current.id}`}
              >
                {cashappFulfillMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "✓ Paid — Deliver Stock"}
              </button>
              <button
                onClick={() => { markUnpaidMutation.mutate(current.id); }}
                disabled={markUnpaidMutation.isPending}
                className="flex-1 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                data-testid={`button-cashapp-unpaid-detail-${current.id}`}
              >
                ✕ Unpaid
              </button>
            </div>
          )}

          {(current.status === "delivering" || current.status === "fulfilled" || current.status === "replaced") && (
            <div className="flex gap-2 border-b border-white/10 pb-4">
              <button
                onClick={() => refundMutation.mutate(current.id)}
                disabled={refundMutation.isPending || current.status === "refunded"}
                className="w-full h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                data-testid={`button-refund-${current.id}`}
              >
                {refundMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "$ Refund to Balance"}
              </button>
            </div>
          )}

          {groupedEntries.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-white/45">Items Ordered</p>
              {groupedEntries.map(([key, g]) => (
                <div key={key} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0d0d0d] border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white">{g.productName}</p>
                    <p className="text-[10px] text-white/45 mt-0.5">{g.variantName} · qty {g.qty}</p>
                  </div>
                  <p className="text-xs text-white/60">${((g.unitPrice * g.qty) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {groupedEntries.length === 0 && current.deliveryContent && (current.orderId?.startsWith("ACH-") || current.orderId?.startsWith("ROUTING-")) && (
            <div className="space-y-2">
              <p className="text-[10px] text-white/45">{current.orderId?.startsWith("ROUTING-") ? "Bank Delivered" : "ACH Account Delivered"}</p>
              <div className="px-3 py-2.5 rounded-xl bg-[#0d0d0d] border border-white/10">
                <p className="text-xs font-mono text-white/70 whitespace-pre-wrap break-all">{current.deliveryContent}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filteredOrders = (orders || []).filter((o: any) => {
    if (orderFilter === "waiting") { if (!(o.paymentMethod === "CashApp" && o.status === "pending")) return false; }
    else if (orderFilter === "fulfilled") { if (!(o.status === "delivering" || o.status === "fulfilled" || o.status === "replaced")) return false; }
    if (!q) return true;
    return (
      o.orderId?.toLowerCase().includes(q) ||
      o.user?.username?.toLowerCase().includes(q) ||
      o.paymentNote?.toLowerCase().includes(q) ||
      o.paymentMethod?.toLowerCase().includes(q)
    );
  });

  const waitingCount = (orders || []).filter((o: any) => o.paymentMethod === "CashApp" && o.status === "pending").length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by order ID, username, payment note..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-9 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 pr-8 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary/40"
          data-testid="input-order-search"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "waiting", label: `Unconfirmed CashApp${waitingCount > 0 ? ` (${waitingCount})` : ""}` },
          { key: "fulfilled", label: "Delivered" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setOrderFilter(key as any)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              orderFilter === key
                ? key === "waiting"
                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                  : "bg-primary/20 border-primary/40 text-primary"
                : "bg-[#0d0d0d] border-white/10 text-white/45 hover:text-white hover:border-white/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No orders here.</div>
      )}

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] px-3 py-2 border-b border-white/10 gap-2">
          <span className="text-[10px] font-bold text-white/45">$</span>
          <span className="text-[10px] font-bold text-white/45">Note / Method</span>
          <span className="text-[10px] font-bold text-white/45">Status</span>
          <span></span>
        </div>
        {filteredOrders.map((order: any) => (
          <div key={order.id} className="grid grid-cols-[auto_1fr_auto_auto] px-3 py-2.5 border-b border-white/10 last:border-0 items-center gap-2 hover:bg-[#0d0d0d] transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
            <span className="text-xs font-bold text-white">${(order.total / 100).toFixed(2)}</span>
            <div className="min-w-0">
              <p className="text-[11px] text-white/60 truncate font-mono">{order.user?.username ? `@${order.user.username}` : ""} <span className="text-white/45">{order.orderId?.slice(0, 10)}</span></p>
              <p className="text-[10px] text-white/40 truncate">{order.paymentNote || order.paymentMethod || "—"} · {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
            <span className={`text-[11px] font-bold ${statusTextColor(order.status)}`}>{statusLabel(order.status)}</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

function statusTextColor(s: string) {
  if (s === "pending") return "text-yellow-400";
  if (s === "waiting_payment") return "text-red-400";
  if (s === "delivering" || s === "fulfilled") return "text-green-400";
  if (s === "refunded") return "text-orange-400";
  if (s === "replaced") return "text-blue-400";
  return "text-white/45";
}


function TestModeSection({ onGoToOrders }: { onGoToOrders: () => void }) {
  const { toast } = useToast();
  const { data: products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const testOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct || !selectedVariant) throw new Error("Select product and variant");
      const res = await apiRequest("POST", "/api/admin/test-order", {
        productId: selectedProduct,
        variantId: selectedVariant,
        quantity
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: (order) => {
      setLastOrder(order);
      toast({ title: "Test order created!", description: `Order ${order.orderId} created with status 'delivering'` });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const product = products?.find((p: any) => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Test Mode</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a fake order to test the delivery flow — no payment needed.</p>
      </div>

      <Card className="bg-[#111] border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Create Test Order (No Payment)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Product</label>
            <Select value={selectedProduct?.toString()} onValueChange={(v) => { setSelectedProduct(Number(v)); setSelectedVariant(null); }}>
              <SelectTrigger className="bg-[#111]/5 border-white/10">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10">
                {products?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {product && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Variant</label>
              <Select value={selectedVariant?.toString()} onValueChange={(v) => setSelectedVariant(Number(v))}>
                <SelectTrigger className="bg-[#111]/5 border-white/10">
                  <SelectValue placeholder="Select a variant" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {product.variants?.map((v: any) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.name} — ${(v.price / 100).toFixed(2)} (min {v.minQuantity || 1})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Quantity</label>
            <Input
              type="number" min="1" value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-[#111]/5 border-white/10"
            />
          </div>

          <Button
            size="sm"
            onClick={() => testOrderMutation.mutate()}
            disabled={testOrderMutation.isPending || !selectedProduct || !selectedVariant}
            className="w-full text-xs"
          >
            {testOrderMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Create Test Order
          </Button>
        </CardContent>
      </Card>

      {lastOrder && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-bold text-green-400">✓ Test order created!</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Order ID: <span className="font-mono text-white">{lastOrder.orderId}</span></p>
              <p>Status: <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">delivering</Badge></p>
              <p className="text-white/60">Now go to the Orders tab to paste items and fulfill this order.</p>
            </div>
            <Button size="sm" className="w-full" onClick={onGoToOrders}>
              Go to Orders →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


function CopyLoginCode({ code, userId }: { code: string; userId: number }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Login code copied!" });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 font-mono text-xs text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded px-2 py-0.5 transition-colors"
      data-testid={`btn-copy-code-${userId}`}
      title="Copy login code"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : code}
    </button>
  );
}

function UsersSection({ canManageStaff }: { canManageStaff: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const banMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('POST', api.admin.banUser.path.replace(':id', userId.toString()));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User banned' });
      setSelectedUser((u: any) => u ? { ...u, isBanned: true } : null);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('POST', api.admin.unbanUser.path.replace(':id', userId.toString()));
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User unbanned' });
      setSelectedUser((u: any) => u ? { ...u, isBanned: false } : null);
    },
  });

  const setBalanceMutation = useMutation({
    mutationFn: async ({ userId, balance }: { userId: number; balance: string }) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/set-balance`, { balance: parseFloat(balance) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser((u: any) => u ? { ...u, balance: data.balance } : null);
      setBalanceInput("");
      toast({ title: `Balance set to $${(data.balance / 100).toFixed(2)}` });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const setRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/set-role`, { role });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser((u: any) => u ? { ...u, role: data.role } : null);
      toast({ title: `Role set to ${data.role}` });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const setWorkerMutation = useMutation({
    mutationFn: async ({ userId, isWorker }: { userId: number; isWorker: boolean }) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/set-worker`, { isWorker });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser((u: any) => u ? { ...u, isWorker: data.isWorker } : null);
      toast({ title: data.isWorker ? 'Worker access granted' : 'Worker access removed' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  const filtered = (users ?? []).filter((u: any) =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedUser) {
    return (
      <div className="space-y-3">
        <button onClick={() => setSelectedUser(null)} className="text-xs text-white/45 hover:text-white transition-colors">← Back to Users</button>

        <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-white">{selectedUser.username}</p>
              <p className="text-[10px] text-white/40 font-mono">{selectedUser.email}</p>
            </div>
            <div className="flex gap-2 items-center">
              {selectedUser.isBanned && <Badge className="bg-red-500/20 text-red-400 text-[9px]">BANNED</Badge>}
              <Badge className={selectedUser.role === "admin" ? "bg-primary/20 text-primary border-primary/30" : "bg-[#0d0d0d] text-white/45 border-white/10"}>
                {selectedUser.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-[#0d0d0d] rounded-lg p-2">
              <p className="text-[9px] text-white/40">Balance</p>
              <p className="text-sm font-mono font-bold text-white">${(selectedUser.balance / 100).toFixed(2)}</p>
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-2">
              <p className="text-[9px] text-white/40">Login Code</p>
              {selectedUser.loginCode
                ? <CopyLoginCode code={selectedUser.loginCode} userId={selectedUser.id} />
                : <p className="text-xs text-white/40">—</p>}
            </div>
          </div>

          {/* Set Balance */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <p className="text-[9px] text-white/40 uppercase tracking-widest">Set Balance ($)</p>
            <div className="flex gap-2">
              <input
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
                placeholder="e.g. 50.00"
                type="number"
                step="0.01"
                min="0"
                className="flex-1 h-8 bg-[#111]/5 border border-white/10 rounded px-2 text-xs text-white font-mono outline-none focus:border-primary/40"
                data-testid={`input-balance-${selectedUser.id}`}
              />
              <button
                onClick={() => setBalanceMutation.mutate({ userId: selectedUser.id, balance: balanceInput })}
                disabled={setBalanceMutation.isPending || !balanceInput}
                className="h-8 px-3 bg-primary/80 hover:bg-primary text-white text-xs font-bold rounded transition-colors disabled:opacity-40 flex items-center gap-1"
                data-testid={`btn-set-balance-${selectedUser.id}`}
              >
                {setBalanceMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set"}
              </button>
            </div>
          </div>

          {/* Role + Actions */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
            {canManageStaff && (
              <>
            {selectedUser.role !== "admin" ? (
              <button
                onClick={() => { if (confirm("Make this user admin?")) setRoleMutation.mutate({ userId: selectedUser.id, role: "admin" }); }}
                disabled={setRoleMutation.isPending}
                className="h-7 px-3 bg-yellow-600/80 hover:bg-yellow-600 text-white text-xs font-bold rounded transition-colors disabled:opacity-40"
                data-testid={`btn-make-admin-${selectedUser.id}`}
              >
                Make Admin
              </button>
            ) : (
              <button
                onClick={() => { if (confirm("Remove admin from this user?")) setRoleMutation.mutate({ userId: selectedUser.id, role: "user" }); }}
                disabled={setRoleMutation.isPending}
                className="h-7 px-3 border border-yellow-700/40 text-yellow-500 text-xs font-bold rounded hover:bg-yellow-900/20 transition-colors disabled:opacity-40"
                data-testid={`btn-remove-admin-${selectedUser.id}`}
              >
                Remove Admin
              </button>
            )}
            {selectedUser.isWorker ? (
              <button
                onClick={() => setWorkerMutation.mutate({ userId: selectedUser.id, isWorker: false })}
                disabled={setWorkerMutation.isPending}
                className="h-7 px-3 border border-blue-700/40 text-blue-400 text-xs font-bold rounded hover:bg-blue-900/20 transition-colors disabled:opacity-40"
                data-testid={`btn-remove-worker-${selectedUser.id}`}
              >
                Remove Worker
              </button>
            ) : (
              <button
                onClick={() => setWorkerMutation.mutate({ userId: selectedUser.id, isWorker: true })}
                disabled={setWorkerMutation.isPending}
                className="h-7 px-3 bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-40"
                data-testid={`btn-make-worker-${selectedUser.id}`}
              >
                Make Worker
              </button>
            )}
              </>
            )}
            {selectedUser.isBanned ? (
              <button
                onClick={() => unbanMutation.mutate(selectedUser.id)}
                disabled={unbanMutation.isPending}
                className="h-7 px-3 bg-green-700/80 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-40"
                data-testid={`btn-unban-${selectedUser.id}`}
              >
                Unban
              </button>
            ) : (
              <button
                onClick={() => { if (confirm("Ban this user?")) banMutation.mutate(selectedUser.id); }}
                disabled={banMutation.isPending}
                className="h-7 px-3 border border-red-800/40 text-red-400 text-xs font-bold rounded hover:bg-red-900/20 transition-colors disabled:opacity-40"
                data-testid={`btn-ban-${selectedUser.id}`}
              >
                Ban
              </button>
            )}
          </div>
          {!canManageStaff && (
            <p className="text-[10px] text-white/40 border-t border-white/10 pt-2">
              Only the owner can manage admin and worker access.
            </p>
          )}

          <div className="text-[9px] text-white/30 font-mono pt-1 border-t border-white/10 space-y-0.5">
            <p>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Users <span className="text-white/40 font-normal">({(users ?? []).length})</span></h2>
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by username or email..."
        className="w-full h-8 bg-[#0d0d0d] border border-white/10 rounded px-3 text-xs text-white placeholder:text-white/40 outline-none"
        data-testid="input-users-search"
      />
      <div className="space-y-1.5">
        {filtered.map((user: any) => (
          <button
            key={user.id}
            onClick={() => { setSelectedUser(user); setBalanceInput(""); }}
            className="w-full text-left bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 hover:border-white/10 transition-colors"
            data-testid={`btn-user-${user.id}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-white truncate">{user.username}</p>
                  {user.role === "admin" && <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px]">admin</Badge>}
                  {user.isOwner && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[9px]">owner</Badge>}
                  {user.isBanned && <Badge className="bg-red-500/20 text-red-400 text-[9px]">banned</Badge>}
                </div>
                <p className="text-[10px] text-white/40 font-mono">${(user.balance / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user.loginCode && <CopyLoginCode code={user.loginCode} userId={user.id} />}
                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CodesSection() {
  const { toast } = useToast();

  const [redeemForm, setRedeemForm] = useState({ amount: "", count: "1" });
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [allCodesCopied, setAllCodesCopied] = useState(false);

  const generateRedeemMutation = useMutation({
    mutationFn: async () => {
      const amount = Number.parseFloat(redeemForm.amount);
      const count = Number.parseInt(redeemForm.count, 10);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a reward amount greater than $0.");
      if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("Generate between 1 and 100 codes.");
      const response = await apiRequest("POST", api.admin.generateCodes.path, {
        amount: Math.round(amount * 100),
        count,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Unable to generate redeem codes");
      }
      return api.admin.generateCodes.responses[200].parse(await response.json());
    },
    onSuccess: data => {
      setGeneratedCodes(data.codes);
      setAllCodesCopied(false);
      toast({ title: "Redeem codes generated", description: `${data.codes.length} reward code${data.codes.length === 1 ? "" : "s"} created.` });
    },
    onError: (error: Error) => toast({ title: "Unable to generate codes", description: error.message, variant: "destructive" }),
  });

  // Discount codes state
  const [dForm, setDForm] = useState({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "" });
  const { data: discountList = [] } = useQuery<any[]>({ queryKey: ["/api/admin/discount-codes"] });

  const createDiscountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/discount-codes", dForm);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Unable to create discount code");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Discount code created" });
      setDForm({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleDiscountMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/discount-codes/${id}`, { isActive });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Unable to update discount code");
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] }),
    onError: (e: Error) => toast({ title: "Unable to update code", description: e.message, variant: "destructive" }),
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/discount-codes/${id}`, {});
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Unable to delete discount code");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Code deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
    },
    onError: (e: Error) => toast({ title: "Unable to delete code", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Codes</h1>

      <Card className="bg-[#111] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Redeem Codes</CardTitle>
          <p className="text-xs text-white/45">Reward codes add wallet credit when a customer redeems them. They are not deposits.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-white/45">Reward per code ($)</p>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="10.00"
                value={redeemForm.amount}
                onChange={event => setRedeemForm(form => ({ ...form, amount: event.target.value }))}
                className="h-9 border-white/10 bg-[#111]/5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/45">Number of codes</p>
              <Input
                type="number"
                min="1"
                max="100"
                step="1"
                value={redeemForm.count}
                onChange={event => setRedeemForm(form => ({ ...form, count: event.target.value }))}
                className="h-9 border-white/10 bg-[#111]/5 text-sm"
              />
            </div>
          </div>
          <Button className="w-full gap-2" onClick={() => generateRedeemMutation.mutate()} disabled={generateRedeemMutation.isPending}>
            {generateRedeemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            Generate Redeem Codes
          </Button>
          {generatedCodes.length > 0 && (
            <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
               <div className="flex items-center justify-between gap-3">
                 <p className="text-xs font-semibold text-green-300">Copy these codes now</p>
                 <Button
                   type="button"
                   size="sm"
                   variant="outline"
                   className="h-7 gap-1.5 border-green-500/30 text-[10px] text-green-200 hover:bg-green-500/10"
                   onClick={async () => {
                     try {
                       await navigator.clipboard.writeText(generatedCodes.join("\n"));
                       setAllCodesCopied(true);
                       toast({ title: "All codes copied", description: `${generatedCodes.length} codes copied to your clipboard.` });
                       window.setTimeout(() => setAllCodesCopied(false), 2000);
                     } catch {
                       toast({ title: "Copy failed", description: "Select the codes and copy them manually.", variant: "destructive" });
                     }
                   }}
                   data-testid="button-copy-all-redeem-codes"
                 >
                   {allCodesCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                   {allCodesCopied ? "Copied" : "Copy all"}
                 </Button>
               </div>
              {generatedCodes.map(code => (
                <div key={code} className="flex items-center gap-2 rounded bg-black/20 px-2 py-1.5">
                  <span className="flex-1 font-mono text-xs text-white">{code}</span>
                  <button
                    type="button"
                    className="text-white/50 transition-colors hover:text-white"
                    onClick={() => navigator.clipboard?.writeText(code)}
                    aria-label={`Copy ${code}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#111] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Create Discount Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-white/45">Code</p>
                  <Input
                    placeholder="SAVE20"
                    value={dForm.code}
                    onChange={e => setDForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="bg-[#111]/5 border-white/10 h-9 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/45">Type</p>
                  <select
                    value={dForm.type}
                    onChange={e => setDForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full h-9 rounded-md bg-[#111]/5 border border-white/10 text-sm text-white px-2 focus:outline-none"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/45">{dForm.type === "percent" ? "Discount %" : "Discount $ Amount"}</p>
                  <Input
                    type="number" min="0" step={dForm.type === "percent" ? "1" : "0.01"} placeholder={dForm.type === "percent" ? "20" : "5.00"}
                    value={dForm.value}
                    onChange={e => setDForm(f => ({ ...f, value: e.target.value }))}
                    className="bg-[#111]/5 border-white/10 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/45">Min. Order $ (optional)</p>
                  <Input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={dForm.minOrder}
                    onChange={e => setDForm(f => ({ ...f, minOrder: e.target.value }))}
                    className="bg-[#111]/5 border-white/10 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/45">Max Uses (optional)</p>
                  <Input
                    type="number" min="1" placeholder="Unlimited"
                    value={dForm.maxUses}
                    onChange={e => setDForm(f => ({ ...f, maxUses: e.target.value }))}
                    className="bg-[#111]/5 border-white/10 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/45">Expires At (optional)</p>
                  <Input
                    type="datetime-local"
                    value={dForm.expiresAt}
                    onChange={e => setDForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="bg-[#111]/5 border-white/10 h-9 text-sm"
                  />
                </div>
              </div>
              <Button className="w-full gap-2" onClick={() => createDiscountMutation.mutate()} disabled={createDiscountMutation.isPending}>
                {createDiscountMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Code
              </Button>
            </CardContent>
      </Card>

      <Card className="bg-[#111] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Discount Codes ({discountList.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {discountList.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-6">No codes yet</p>
              ) : (
                <div className="space-y-2">
                  {discountList.map((dc: any) => (
                    <div key={dc.id} className="flex items-center gap-3 bg-[#111]/5 border border-white/10 rounded-lg px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white font-mono">{dc.code}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${dc.isActive ? "bg-primary/20 text-primary" : "bg-[#111]/5 text-white/45"}`}>
                            {dc.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/45">
                          {dc.type === "percent" ? `${dc.value}% off` : `$${(dc.value / 100).toFixed(2)} off`}
                          {dc.minOrder > 0 && ` · min $${(dc.minOrder / 100).toFixed(2)}`}
                          {` · ${dc.usedCount}/${dc.maxUses ?? "∞"} uses`}
                          {dc.expiresAt && ` · expires ${new Date(dc.expiresAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => toggleDiscountMutation.mutate({ id: dc.id, isActive: !dc.isActive })}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${dc.isActive ? "border-gray-300 text-white/60 hover:bg-[#0d0d0d]" : "border-primary/30 text-primary hover:bg-primary/10"}`}
                        >
                          {dc.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => deleteDiscountMutation.mutate(dc.id)}
                          className="px-2 py-1 rounded text-[11px] font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
      </Card>
    </div>
  );
}

function MinDepositCard({ method, label, color }: { method: string; label: string; color: string }) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const { data } = useQuery<Record<string, number>>({
    queryKey: ["/api/admin/settings/min-deposits"],
  });
  useEffect(() => {
    if (data && data[method] !== undefined) setInput(data[method] === 0 ? "" : String(data[method]));
  }, [data, method]);
  const saveMutation = useMutation({
    mutationFn: async (val: number) => {
      const res = await apiRequest("POST", "/api/admin/settings/min-deposits", { method, min: val });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/min-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/min-deposits"] });
      toast({ title: `${label} min deposit saved` });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  return (
    <Card className="bg-[#111] border-white/10">
      <CardContent className="p-4 space-y-2">
        <p className="font-bold text-sm mb-0.5" style={{ color }}>Minimum Deposit — {label}</p>
        <p className="text-xs text-muted-foreground">Set to 0 for no minimum.</p>
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-[#0d0d0d] border-white/10 text-white font-mono"
            data-testid={`input-min-deposit-${method}`}
          />
          <Button size="sm" onClick={() => saveMutation.mutate(parseFloat(input) || 0)} disabled={saveMutation.isPending}
            data-testid={`button-save-min-deposit-${method}`}>
            {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HandleSettingCard({ label, description, settingKey, placeholder, color }: {
  label: string; description: string; settingKey: string; placeholder: string; color: string;
}) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const { data } = useQuery<{ handle?: string; tag?: string }>({
    queryKey: [`/api/admin/settings/${settingKey}`],
  });
  useEffect(() => {
    const val = data?.handle ?? data?.tag ?? "";
    if (val !== undefined) setInput(val);
  }, [data]);
  const saveMutation = useMutation({
    mutationFn: async (val: string) => {
      const body = settingKey === "cashapp-tag" ? { tag: val } : { handle: val };
      const res = await apiRequest("POST", `/api/admin/settings/${settingKey}`, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/settings/${settingKey}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/manual-payments"] });
      toast({ title: `${label} saved` });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  return (
    <Card className="bg-[#111] border-white/10">
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="font-bold text-sm mb-0.5" style={{ color }}>{label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-[#0d0d0d] border-white/10 text-white font-mono"
              data-testid={`input-${settingKey}`}
            />
            <Button size="sm" onClick={() => saveMutation.mutate(input)} disabled={saveMutation.isPending}
              data-testid={`button-save-${settingKey}`}>
              {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentDescriptionSettingCard({ method, label, color }: { method: "cashapp" | "chime" | "venmo" | "zelle"; label: string; color: string }) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const { data } = useQuery<{ description: string }>({
    queryKey: [`/api/admin/settings/${method}-description`],
  });
  useEffect(() => {
    if (data !== undefined) setInput(data.description ?? "");
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/settings/${method}-description`, { description: input });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to save description");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/settings/${method}-description`] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/manual-payments"] });
      toast({ title: `${label} description saved` });
    },
    onError: (error: Error) => toast({ title: "Unable to save description", description: error.message, variant: "destructive" }),
  });

  return (
    <Card className="bg-[#111] border-white/10">
      <CardContent className="p-4 space-y-2">
        <p className="font-bold text-sm" style={{ color }}>{label} customer description</p>
        <p className="text-xs text-muted-foreground">Shown below this payment method on the top-up page.</p>
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={160}
          rows={2}
          placeholder={`Instructions for customers paying with ${label}`}
          className="resize-none bg-[#0d0d0d] border-white/10 text-white text-xs"
          data-testid={`input-${method}-description`}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] text-white/40">{input.length}/160</span>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid={`button-save-${method}-description`}>
            {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save description"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeeSettingCard({ method, label, color }: { method: string; label: string; color: string }) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const { data } = useQuery<{ fee: number }>({
    queryKey: [`/api/admin/settings/${method}-fee`],
  });
  useEffect(() => {
    if (data !== undefined) setInput(String(data.fee ?? 0));
  }, [data]);
  const saveMutation = useMutation({
    mutationFn: async (val: string) => {
      const res = await apiRequest("POST", `/api/admin/settings/${method}-fee`, { fee: parseFloat(val) || 0 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/settings/${method}-fee`] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/manual-payments"] });
      toast({ title: `${label} fee saved` });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  return (
    <Card className="bg-[#111] border-white/10">
      <CardContent className="p-4 space-y-2">
        <p className="font-bold text-sm mb-0.5" style={{ color }}>Fee % — {label}</p>
        <p className="text-xs text-muted-foreground">Percentage deducted from deposit before crediting. Set 0 for no fee.</p>
        <div className="flex gap-2">
          <Input
            type="number" min="0" max="100" step="1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="0"
            className="flex-1 bg-[#0d0d0d] border-white/10 text-white font-mono"
            data-testid={`input-fee-${method}`}
          />
          <span className="flex items-center text-sm text-white/40 pr-1">%</span>
          <Button size="sm" onClick={() => saveMutation.mutate(input)} disabled={saveMutation.isPending}
            data-testid={`button-save-fee-${method}`}>
            {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CryptoCurrencySettingsRow({ currency }: { currency: CryptoCurrencyOption }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState({
    name: currency.name,
    ticker: currency.ticker,
    color: currency.color,
    sortOrder: String(currency.sortOrder),
  });

  useEffect(() => {
    setDraft({
      name: currency.name,
      ticker: currency.ticker,
      color: currency.color,
      sortOrder: String(currency.sortOrder),
    });
  }, [currency]);

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const res = await apiRequest("PATCH", `/api/admin/crypto-currencies/${currency.id}`, updates);
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to update crypto currency");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-readiness"] });
    },
    onError: (error: Error) => toast({ title: "Unable to save currency", description: error.message, variant: "destructive" }),
  });

  return (
    <Card className="overflow-hidden border-white/10 bg-[#192337]" data-testid={`card-crypto-currency-${currency.code}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#101827]">
            <CryptoCoinIcon ticker={currency.ticker} color={currency.color} className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-white">{currency.name}</p>
                <p className="font-mono text-[11px] text-[#8fa9eb]">{currency.code} · {currency.enabled ? "Visible to customers" : "Hidden from customers"}</p>
              </div>
              <Switch
                checked={currency.enabled}
                disabled={saveMutation.isPending}
                onCheckedChange={(enabled) => saveMutation.mutate({ enabled })}
                data-testid={`switch-crypto-currency-${currency.code}`}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Display name"
                className="h-9 border-white/10 bg-[#101827] text-xs text-white"
                aria-label={`${currency.code} display name`}
              />
              <Input
                value={draft.ticker}
                onChange={(event) => setDraft({ ...draft, ticker: event.target.value.toUpperCase() })}
                placeholder="Ticker"
                className="h-9 border-white/10 bg-[#101827] text-xs text-white"
                aria-label={`${currency.code} ticker`}
              />
              <Input
                value={draft.color}
                onChange={(event) => setDraft({ ...draft, color: event.target.value })}
                placeholder="#F7931A"
                className="h-9 border-white/10 bg-[#101827] font-mono text-xs text-white"
                aria-label={`${currency.code} color`}
              />
              <Input
                type="number"
                min="0"
                value={draft.sortOrder}
                onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })}
                placeholder="Order"
                className="h-9 border-white/10 bg-[#101827] text-xs text-white"
                aria-label={`${currency.code} display order`}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate({
                  name: draft.name,
                  ticker: draft.ticker,
                  color: draft.color,
                  sortOrder: Number(draft.sortOrder),
                })}
                data-testid={`button-save-crypto-currency-${currency.code}`}
              >
                {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationsSection() {
  const { toast } = useToast();
  const [newCurrencyCode, setNewCurrencyCode] = useState("");

  const { data: paymentMethods, isLoading: methodsLoading } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/admin/payment-methods"],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ method, enabled }: { method: string; enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/payment-methods/${method}`, { enabled });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to update payment method");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/manual-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-readiness"] });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const { data: cryptoCurrencies = [], isLoading: currenciesLoading } = useQuery<CryptoCurrencyOption[]>({
    queryKey: ["/api/admin/crypto-currencies"],
  });
  const { data: supportedCurrencies = [] } = useQuery<Array<Pick<CryptoCurrencyOption, "code" | "name" | "ticker" | "color">>>({
    queryKey: ["/api/admin/crypto-currencies/supported"],
  });
  const addCurrencyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/crypto-currencies", { code: newCurrencyCode });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to add crypto currency");
      }
      return res.json();
    },
    onSuccess: () => {
      setNewCurrencyCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-readiness"] });
      toast({ title: "Crypto currency added" });
    },
    onError: (error: Error) => toast({ title: "Unable to add currency", description: error.message, variant: "destructive" }),
  });
  const availableToAdd = supportedCurrencies.filter((currency) => !cryptoCurrencies.some((saved) => saved.code === currency.code));
  const { data: cryptoReadiness } = useQuery<{
    enabled: boolean;
    configured: boolean;
    enabledCurrencyCount: number;
    available: boolean;
  }>({ queryKey: ["/api/crypto-readiness"] });
  const cryptoStatus = !cryptoReadiness?.enabled
    ? "Crypto is switched off"
    : !cryptoReadiness.configured
      ? "Add a Plisio key and trusted HTTPS Public App URL"
      : cryptoReadiness.enabledCurrencyCount === 0
        ? "Enable at least one coin"
        : "Ready for customers";

  const METHODS = [
    { id: "wallet", label: "Wallet / Balance", icon: <Wallet className="h-4 w-4 text-white" />, bg: "bg-primary" },
    { id: "cashapp", label: "CashApp", icon: <SiCashapp className="h-4 w-4 text-white" />, bg: "bg-[#00D632]" },
    { id: "venmo", label: "Venmo", icon: <span className="text-white font-black text-sm">V</span>, bg: "bg-[#3D95CE]" },
    { id: "zelle", label: "Zelle", icon: <span className="text-white font-black text-sm">Z</span>, bg: "bg-[#6D1ED4]" },
    { id: "chime", label: "Chime", icon: <span className="text-white font-black text-sm">C</span>, bg: "bg-[#7BC67E]" },
    { id: "crypto", label: "Crypto", icon: <SiBitcoin className="h-4 w-4 text-white" />, bg: "bg-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" /> Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Enable or disable payment methods and manage handles.</p>
        <p className={`mt-2 text-xs ${cryptoReadiness?.available ? "text-green-400" : "text-amber-300"}`}>
          Crypto status: {cryptoStatus}
        </p>
      </div>

      {/* Payment Method Toggles */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Payment Methods (Deposits)</p>
        <div className="space-y-2">
          {methodsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : METHODS.map((m) => {
            const enabled = m.id === "chime" || m.id === "zelle"
              ? paymentMethods?.[m.id] === true
              : paymentMethods?.[m.id] !== false;
            return (
              <Card key={m.id} className="bg-[#111] border-white/10" data-testid={`card-payment-toggle-${m.id}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${m.bg} flex items-center justify-center flex-shrink-0`}>
                      {m.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{enabled ? "Visible to customers" : "Hidden from customers"}</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={toggleMutation.isPending}
                    onCheckedChange={(val) => toggleMutation.mutate({ method: m.id, enabled: val })}
                    data-testid={`switch-payment-${m.id}`}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Manual Payment Handles — CashApp */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">CashApp Settings</p>
        <div className="space-y-3">
          <HandleSettingCard
            label="CashApp $Cashtag"
            description="Customers send CashApp to this tag with a generated note."
            settingKey="cashapp-tag"
            placeholder="$YourCashTag"
            color="#00D632"
          />
          <PaymentDescriptionSettingCard method="cashapp" label="CashApp" color="#00D632" />
          <MinDepositCard method="cashapp" label="CashApp" color="#00D632" />
          <FeeSettingCard method="cashapp" label="CashApp" color="#00D632" />
        </div>
      </div>

      {/* Manual Payment Handles — Venmo / Zelle / Chime */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Alternative Payment Handles</p>
        <div className="space-y-3">
          <HandleSettingCard
            label="Venmo Handle"
            description="Username or phone number customers send Venmo payments to."
            settingKey="venmo-handle"
            placeholder="@YourVenmo"
            color="#3D95CE"
          />
          <PaymentDescriptionSettingCard method="venmo" label="Venmo" color="#3D95CE" />
          <MinDepositCard method="venmo" label="Venmo" color="#3D95CE" />
          <HandleSettingCard
            label="Zelle Handle"
            description="Phone number or email customers send Zelle payments to."
            settingKey="zelle-handle"
            placeholder="+1 (555) 000-0000 or email"
            color="#9B59E8"
          />
          <PaymentDescriptionSettingCard method="zelle" label="Zelle" color="#9B59E8" />
          <MinDepositCard method="zelle" label="Zelle" color="#9B59E8" />
          <FeeSettingCard method="zelle" label="Zelle" color="#9B59E8" />
          <HandleSettingCard
            label="Chime Handle"
            description="Phone number or email customers send Chime payments to."
            settingKey="chime-handle"
            placeholder="+1 (555) 000-0000"
            color="#7BC67E"
          />
          <PaymentDescriptionSettingCard method="chime" label="Chime" color="#7BC67E" />
          <MinDepositCard method="chime" label="Chime" color="#7BC67E" />
          <FeeSettingCard method="chime" label="Chime" color="#7BC67E" />
        </div>
      </div>

      {/* Crypto min deposit */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Crypto Settings</p>
        <div className="space-y-3">
          <MinDepositCard method="crypto" label="Crypto" color="#F7931A" />
          <Card className="border-white/10 bg-[#111827]">
            <CardContent className="p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-white">Crypto coin catalog</p>
                  <p className="mt-1 text-xs text-muted-foreground">Choose which Plisio-supported coins customers can use. Turning a coin off does not change existing payments.</p>
                </div>
                <span className="rounded bg-[#20345f] px-2 py-1 font-mono text-[10px] text-[#9ab8ff]">{cryptoCurrencies.filter((currency) => currency.enabled).length} on</span>
              </div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <Select value={newCurrencyCode} onValueChange={setNewCurrencyCode}>
                  <SelectTrigger className="border-white/10 bg-[#101827] text-white">
                    <SelectValue placeholder={availableToAdd.length ? "Add a supported coin" : "All supported coins added"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>{currency.name} ({currency.ticker})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!newCurrencyCode || addCurrencyMutation.isPending}
                  onClick={() => addCurrencyMutation.mutate()}
                  data-testid="button-add-crypto-currency"
                >
                  {addCurrencyMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
                  Add coin
                </Button>
              </div>
              <div className="space-y-2">
                {currenciesLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : cryptoCurrencies.length ? (
                  cryptoCurrencies.map((currency) => <CryptoCurrencySettingsRow key={currency.id} currency={currency} />)
                ) : (
                  <p className="border border-dashed border-white/10 px-3 py-4 text-center text-xs text-muted-foreground">No crypto currencies are configured yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ApiSecretsSettings />

      <ProductStockSafetyCard />

      {/* Feature Visibility Toggles */}
      <FeatureTogglesCard />
    </div>
  );
}

type ApiSetting = {
  key: string;
  label: string;
  description: string;
  kind: "url" | "secret" | "text";
  required: boolean;
  configured: boolean;
  enabled: boolean;
  source: "database" | "environment" | "default" | "none";
  value?: string;
  maskedValue?: string;
};

function ApiSecretsSettings() {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ settings: ApiSetting[]; encryptionConfigured: boolean }>({
    queryKey: ["/api/admin/api-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/api-settings");
      if (!response.ok) throw new Error("Unable to load API settings");
      return response.json();
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/admin/api-settings"] });

  const saveMutation = useMutation({
    mutationFn: async ({ setting, value }: { setting: ApiSetting; value: string }) => {
      if (setting.kind === "secret" && !value.trim()) {
        throw new Error("Enter a new secret value, or use Clear to remove the saved override.");
      }
      const response = await apiRequest("PUT", `/api/admin/api-settings/${setting.key}`, {
        value,
        kind: setting.kind,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to save setting");
      }
      return response.json();
    },
    onSuccess: (_, { setting }) => {
      setDrafts((current) => ({ ...current, [setting.key]: "" }));
      refresh();
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-readiness"] });
      toast({ title: `${setting.label} saved` });
    },
    onError: (error: Error) => toast({ title: "Unable to save setting", description: error.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ setting, enabled }: { setting: ApiSetting; enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/api-settings/${setting.key}`, { enabled });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to update setting");
      }
      return response.json();
    },
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-readiness"] });
    },
    onError: (error: Error) => toast({ title: "Unable to update setting", description: error.message, variant: "destructive" }),
  });

  const clearMutation = useMutation({
    mutationFn: async (setting: ApiSetting) => {
      const response = await apiRequest("DELETE", `/api/admin/api-settings/${setting.key}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to clear setting");
      }
      return response.json();
    },
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-readiness"] });
      toast({ title: "Saved override cleared" });
    },
    onError: (error: Error) => toast({ title: "Unable to clear setting", description: error.message, variant: "destructive" }),
  });

  const settings = data?.settings ?? [];

  const renderSetting = (setting: ApiSetting) => {
    const draft = drafts[setting.key] ?? "";
    const value = setting.kind === "secret" ? draft : (drafts[setting.key] ?? setting.value ?? "");
    const sourceLabel = setting.source === "environment"
      ? "Host fallback"
      : setting.source === "database"
        ? "Saved here"
        : setting.source === "default"
          ? "Default"
          : "Not configured";

    return (
      <Card key={setting.key} className="bg-[#111] border-white/10" data-testid={`card-api-setting-${setting.key}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-sm text-white">{setting.label}</p>
                <Badge className={setting.configured && setting.enabled
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                  {setting.configured && setting.enabled ? "Configured" : setting.enabled ? "Not set" : "Disabled"}
                </Badge>
                <span className="text-[10px] text-white/35 font-mono">{sourceLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{setting.description}</p>
            </div>
            <Switch
              checked={setting.enabled}
              disabled={toggleMutation.isPending}
              onCheckedChange={(enabled) => toggleMutation.mutate({ setting, enabled })}
              data-testid={`switch-api-setting-${setting.key}`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type={setting.kind === "secret" ? "password" : "text"}
              value={value}
              onChange={(event) => setDrafts((current) => ({ ...current, [setting.key]: event.target.value }))}
              placeholder={setting.kind === "secret"
                ? setting.configured ? "Saved securely — enter a replacement" : "Enter secret"
                : setting.kind === "url" ? "https://api.example.com/v1" : "Enter value"}
              className="flex-1 bg-[#0d0d0d] border-white/10 text-white font-mono"
              data-testid={`input-api-setting-${setting.key}`}
            />
            <Button
              size="sm"
              onClick={() => saveMutation.mutate({ setting, value })}
              disabled={saveMutation.isPending || !setting.enabled}
              data-testid={`button-save-api-setting-${setting.key}`}
            >
              {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
            {setting.source === "database" && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-white/65 hover:text-white"
                onClick={() => clearMutation.mutate(setting)}
                disabled={clearMutation.isPending}
                data-testid={`button-clear-api-setting-${setting.key}`}
              >
                Clear
              </Button>
            )}
          </div>
          {setting.kind === "secret" && setting.maskedValue && (
            <p className="text-[10px] text-white/35 font-mono">Stored value: {setting.maskedValue}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-primary" /> Plisio API</p>
        <p className="text-xs text-white/45 mt-1">Secrets are encrypted on the server and never sent back to this page.</p>
      </div>

      {!data?.encryptionConfigured && (
        <Card className="bg-red-950/20 border-red-500/30">
          <CardContent className="p-4 text-xs text-red-200">
            Secret storage is locked until the server has a <span className="font-mono">SETTINGS_ENCRYPTION_KEY</span> or <span className="font-mono">SESSION_SECRET</span>. Add one to the host before saving secrets.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">{settings.map(renderSetting)}</div>
      )}
    </section>
  );
}

function ProductStockSafetyCard() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<{ allowPaymentCardProductStock: boolean }>({
    queryKey: ["/api/admin/settings/stock-safety"],
  });
  const toggleMutation = useMutation({
    mutationFn: async (allowPaymentCardProductStock: boolean) => {
      const res = await apiRequest("POST", "/api/admin/settings/stock-safety", { allowPaymentCardProductStock });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Unable to update stock safety");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/stock-safety"] });
      toast({ title: "Product stock safety updated" });
    },
    onError: (error: Error) => toast({ title: "Unable to update stock safety", description: error.message, variant: "destructive" }),
  });

  const protectionEnabled = data?.allowPaymentCardProductStock !== true;

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-3">Product Stock Safety</p>
      <Card className="bg-[#111] border-amber-500/25" data-testid="card-product-stock-safety">
        <CardContent className="p-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-sm text-white">Protect payment-card credentials in product stock</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {protectionEnabled
                ? "Protection is enabled. Card-number-like content is rejected from generic product stock."
                : "Protection is disabled. Card-number-like content can be imported into generic product stock."}
            </p>
            <p className="text-[10px] text-amber-300/80 mt-2">
              Dedicated card inventory always tracks the BIN separately. Only disable this if you intentionally sell card-like content as generic stock.
            </p>
          </div>
          <Switch
            checked={protectionEnabled}
            disabled={isLoading || toggleMutation.isPending}
            onCheckedChange={(enabled) => {
              if (!enabled && !window.confirm("Disable payment-card stock protection? This allows card-number-like content in generic product stock.")) return;
              toggleMutation.mutate(!enabled);
            }}
            data-testid="switch-protect-payment-card-product-stock"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureTogglesCard() {
  const { toast } = useToast();
  const { data: features, isLoading: featuresLoading } = useQuery<{ ranks: boolean; logs: boolean; cards: boolean }>({
    queryKey: ["/api/settings/features"],
  });

  const toggleFeature = useMutation({
    mutationFn: async (body: { ranks?: boolean; logs?: boolean; cards?: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/settings/features", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/features"] });
      toast({ title: "Feature updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const FEATURES = [
    { key: "ranks" as const, label: "Ranks", desc: "Show/hide the Ranks page and nav link" },
    { key: "cards" as const, label: "Cards", desc: "Show/hide the Cards page and nav link" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-3">Feature Visibility</p>
      <div className="space-y-2">
        {featuresLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
        ) : FEATURES.map((f) => {
          const enabled = features?.[f.key] !== false;
          return (
            <Card key={f.key} className="bg-[#111] border-white/10" data-testid={`card-feature-${f.key}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-white">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{enabled ? "Visible to users" : "Hidden — nobody can see it"}</p>
                </div>
                <Switch
                  checked={enabled}
                  disabled={toggleFeature.isPending}
                  onCheckedChange={(val) => toggleFeature.mutate({ [f.key]: val })}
                  data-testid={`switch-feature-${f.key}`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function methodMeta(method: string) {
  if (method === "Chime") return { color: "#7BC67E", label: "Chime", icon: "C" };
  if (method === "Venmo") return { color: "#3D95CE", label: "Venmo", icon: "V" };
  if (method === "Zelle") return { color: "#9B59E8", label: "Zelle", icon: "Z" };
  return { color: "#00D632", label: "CashApp", icon: "$" };
}

function CashAppSection() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<"all" | "CashApp" | "Chime" | "Venmo" | "Zelle">("all");

  const { data: allOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 6000,
  });
  const { data: manualDeposits, isLoading: depositsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/deposits"],
    queryFn: async () => {
      const res = await fetch("/api/admin/deposits");
      if (!res.ok) throw new Error("Failed to fetch manual deposits");
      return res.json();
    },
    refetchInterval: 6000,
  });

  const productManualOrders = (allOrders || []).filter((o: any) =>
    ["CashApp", "Chime", "Venmo", "Zelle"].includes(o.paymentMethod)
  );
  const depositOrders = (manualDeposits || [])
    .filter((deposit: any) => deposit.type !== "crypto" && typeof deposit.orderId === "number")
    .map((deposit: any) => ({
      id: deposit.orderId,
      orderId: deposit.publicOrderId || deposit.id,
      userId: deposit.userId,
      user: { username: deposit.username },
      total: deposit.amount,
      status: deposit.status,
      paymentNote: deposit.paymentNote,
      paymentMethod: deposit.paymentMethod || (
        deposit.type === "cashapp" ? "CashApp" :
        deposit.type === "chime" ? "Chime" :
        deposit.type === "venmo" ? "Venmo" : "Zelle"
      ),
      createdAt: deposit.createdAt,
      items: [],
    }));
  const manualOrders = [...depositOrders, ...productManualOrders];
  const pendingOrders = manualOrders.filter((o: any) => o.status === "pending");
  const cq = searchQuery.trim().toLowerCase();
  const typeFiltered = (showHistory ? manualOrders : pendingOrders).filter((o: any) =>
    paymentTypeFilter === "all" || o.paymentMethod === paymentTypeFilter
  );
  const displayedOrders = typeFiltered.filter((o: any) =>
    !cq ||
    o.orderId?.toLowerCase().includes(cq) ||
    o.user?.username?.toLowerCase().includes(cq) ||
    o.paymentNote?.toLowerCase().includes(cq)
  );

  const cashappCount = pendingOrders.filter((o: any) => o.paymentMethod === "CashApp").length;
  const chimeCount = pendingOrders.filter((o: any) => o.paymentMethod === "Chime").length;
  const venmoCount = pendingOrders.filter((o: any) => o.paymentMethod === "Venmo").length;
  const zelleCount = pendingOrders.filter((o: any) => o.paymentMethod === "Zelle").length;

  const fulfillMutation = useMutation({
    mutationFn: async ({ orderId, isDepositOnly }: { orderId: number; isDepositOnly: boolean }) => {
      const endpoint = isDepositOnly
        ? `/api/admin/orders/${orderId}/manual-deposit-approve`
        : `/api/admin/orders/${orderId}/cashapp-fulfill`;
      const res = await apiRequest("POST", endpoint, {});
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      setSelectedOrder(null);
      toast({ title: variables.isDepositOnly ? "Deposit confirmed — balance credited" : "Payment confirmed — stock delivered" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const markUnpaidMutation = useMutation({
    mutationFn: async ({ orderId, isDepositOnly }: { orderId: number; isDepositOnly: boolean }) => {
      const endpoint = isDepositOnly
        ? `/api/admin/orders/${orderId}/manual-deposit-unpaid`
        : `/api/admin/orders/${orderId}/mark-unpaid`;
      const res = await apiRequest("POST", endpoint, {});
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      setSelectedOrder(null);
      toast({ title: "Marked unpaid" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (ordersLoading || depositsLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  if (selectedOrder) {
    const current = manualOrders?.find((o: any) => o.id === selectedOrder.id) || selectedOrder;
    const meta = methodMeta(current.paymentMethod);
    const productItems = current.items?.filter((i: any) => !i.itemType || i.itemType === "product") || [];
    const grouped: Record<string, { productName: string; variantName: string; qty: number; unitPrice: number }> = {};
    for (const item of productItems) {
      const key = String(item.variantId || item.id);
      if (!grouped[key]) grouped[key] = { productName: item.productName || "Product", variantName: item.variant?.name || "—", qty: 0, unitPrice: item.price };
      grouped[key].qty += (item.quantity ?? 1);
    }
    const groupedEntries = Object.entries(grouped);
    const isPending = current.status === "pending";
    const isDepositOnly = !Array.isArray(current.items) || current.items.length === 0;

    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>← Back</Button>
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: meta.color }}>
                {meta.icon}
              </div>
              <h2 className="text-lg font-black text-white">{meta.label} {isDepositOnly ? "Deposit" : "Payment"}</h2>
            </div>
            <Badge className={statusBadgeClass(current.status)}>{statusLabel(current.status)}</Badge>
          </div>

          <div className="space-y-3 border-b border-white/10 pb-4">
            <div><p className="text-[10px] text-white/45 mb-0.5">Customer</p><p className="text-xs text-white font-bold">{current.user?.username || current.userId}</p></div>
            <div><p className="text-[10px] text-white/45 mb-0.5">Date</p><p className="text-xs text-white/70">{new Date(current.createdAt).toLocaleString("en-US")}</p></div>
            {current.paymentNote && (
              <div>
                <p className="text-[10px] text-white/45 mb-0.5">Payment Note</p>
                <p className="text-xs font-mono font-bold" style={{ color: meta.color }}>{current.paymentNote}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-white/45 mb-0.5">{isDepositOnly ? "Amount to receive" : "Amount due"}</p>
              <p className="text-2xl font-black text-white">${(current.total / 100).toFixed(2)}</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">{isDepositOnly ? "user specified this amount — confirm only if received exactly this" : "confirm only after the customer payment is received"}</p>
            </div>
          </div>

          {isPending && (
            <div className="flex gap-3">
              <button
                onClick={() => fulfillMutation.mutate({ orderId: current.id, isDepositOnly })}
                disabled={fulfillMutation.isPending}
                className="flex-1 h-11 rounded-xl text-white text-sm font-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: `${meta.color}30`, border: `1px solid ${meta.color}60` }}
                data-testid={`button-cashapp-paid-${current.id}`}
              >
                {fulfillMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>✓ Confirm Received</>}
              </button>
              <button
                onClick={() => markUnpaidMutation.mutate({ orderId: current.id, isDepositOnly })}
                disabled={markUnpaidMutation.isPending}
                className="flex-1 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-black hover:bg-red-500/20 transition-colors disabled:opacity-50"
                data-testid={`button-cashapp-unpaid-${current.id}`}
              >
                ✕ Reject
              </button>
            </div>
          )}

          {groupedEntries.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-white/45">Items Ordered</p>
              {groupedEntries.map(([key, g]) => (
                <div key={key} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0d0d0d] border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white">{g.productName}</p>
                    <p className="text-[10px] text-white/45 mt-0.5">{g.variantName} · qty {g.qty}</p>
                  </div>
                  <p className="text-xs text-white/60">${((g.unitPrice * g.qty) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{showHistory ? "Payment History" : "Pending Payments"}</h1>
          {pendingOrders.length > 0 && (
            <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">{pendingOrders.length} pending</Badge>
          )}
        </div>
        <button
          onClick={() => setShowHistory(h => !h)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${showHistory ? "bg-primary text-white" : "bg-[#0d0d0d] text-white/45 hover:bg-white/5"}`}
        >
          {showHistory ? "← Pending" : "History"}
        </button>
      </div>

      {/* Payment type filter */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { key: "all", label: "All", count: pendingOrders.length, color: "text-white/70" },
          { key: "CashApp", label: "CashApp", count: cashappCount, color: "text-[#00D632]" },
          { key: "Chime", label: "Chime", count: chimeCount, color: "text-[#7BC67E]" },
          { key: "Venmo", label: "Venmo", count: venmoCount, color: "text-[#3D95CE]" },
          { key: "Zelle", label: "Zelle", count: zelleCount, color: "text-[#9B59E8]" },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            onClick={() => setPaymentTypeFilter(key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              paymentTypeFilter === key
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/8 text-white/40 hover:border-white/15 hover:text-white/60"
            }`}
          >
            <span>{label}</span>
            {!showHistory && count > 0 && (
              <span className={`text-[10px] font-mono ${paymentTypeFilter === key ? "text-white/70" : color}`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by order ID, username, payment note..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-9 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 pr-8 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
          data-testid="input-cashapp-order-search"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {displayedOrders.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm">
          {showHistory ? "No manual payment history" : "No pending deposits"}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedOrders.map((order: any) => {
            const meta = methodMeta(order.paymentMethod);
            return (
              <div
                key={order.id}
                className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#111]/[0.03] transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: `${meta.color}30`, border: `1px solid ${meta.color}50`, color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                      <Badge className={statusBadgeClass(order.status)}>{statusLabel(order.status)}</Badge>
                    </div>
                    <p className="text-sm font-black text-white">${(order.total / 100).toFixed(2)}</p>
                    {order.paymentNote && <p className="text-[10px] font-mono mt-0.5" style={{ color: `${meta.color}80` }}>{order.paymentNote}</p>}
                    <p className="text-[10px] text-white/40">{order.user?.username || order.userId} · {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
                {order.status === "pending" && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      fulfillMutation.mutate({
                        orderId: order.id,
                        isDepositOnly: !Array.isArray(order.items) || order.items.length === 0,
                      });
                    }}
                    disabled={fulfillMutation.isPending}
                    className="h-8 rounded-lg px-3 text-[10px] font-bold text-white disabled:opacity-50"
                    style={{ background: meta.color }}
                    data-testid={`button-accept-payment-${order.id}`}
                  >
                    {fulfillMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function findCardNumberPreview(line: string): string {
  if (!line) return "";
  const tokens = line.split(/[|\t:;,\s]+/).map(t => t.trim()).filter(Boolean);
  for (const token of tokens) {
    const digits = token.replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && /^[3456]/.test(digits)) return digits;
  }
  const noGaps = line.replace(/[\s\-]/g, "");
  const m = noGaps.match(/[3456]\d{12,18}/);
  if (m) return m[0];
  return "";
}

function extractPostalPreview(line: string): string {
  if (!line) return "";
  const labeled = line.match(/\b(?:zip|postal(?:\s+code)?|postcode|post\s+code|pin(?:\s+code)?)\s*[:=]\s*([^|,;\n]+)/i)?.[1]?.trim();
  if (labeled) return labeled;
  const fields = line
    .split(/[|\t,;\n]+/)
    .map(value => value.trim());
  if (fields.length <= 3) return "";
  return fields
    .slice(3)
    .reverse()
    .find(value => value.length >= 3
      && value.length <= 12
      && /^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(value)
      && /\d/.test(value)
      && !/^\d{13,19}$/.test(value)
      && !/\//.test(value)) || "";
}

const CARD_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
  "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
]);
const CARD_STATE_NAMES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD", massachusetts: "MA",
  michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT",
  nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX",
  utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

function normalizeCardState(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (CARD_STATES.has(normalized.toUpperCase())) return normalized.toUpperCase();
  return CARD_STATE_NAMES[normalized] || "";
}

function extractStatePreview(line: string): string {
  if (!line) return "";
  const labeled = line.match(/\b(?:state|region|province|territory|prefecture)\s*[:=]\s*([^|,;\n]+)/i)?.[1]?.trim();
  if (labeled) return labeled;
  return line
    .split(/[|\t,;\n]+/)
    .map(normalizeCardState)
    .find(Boolean) || "";
}

function AdminBasesTab() {
  const { toast } = useToast();
  const qc = queryClient;
  const [newBaseName, setNewBaseName] = useState("");
  const [expandedBase, setExpandedBase] = useState<number | null>(null);
  const [editingBaseId, setEditingBaseId] = useState<number | null>(null);
  const [editingBaseName, setEditingBaseName] = useState("");

  const { data: bases, isLoading } = useQuery<any[]>({ queryKey: ["/api/card-bases"], refetchInterval: 5000 });
  const { data: baseCards } = useQuery<any[]>({
    queryKey: ["/api/admin/card-bases", expandedBase, "cards"],
    queryFn: async () => {
      if (!expandedBase) return [];
      const res = await fetch(`/api/admin/card-bases/${expandedBase}/cards`, { credentials: "include" });
      return res.json();
    },
    enabled: !!expandedBase,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newBaseName.trim()) throw new Error("Name required");
      const res = await apiRequest("POST", "/api/admin/card-bases", { name: newBaseName.trim() });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/card-bases"] }); setNewBaseName(""); toast({ title: "Base created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/card-bases/${id}`, { name });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/card-bases"] });
      qc.invalidateQueries({ queryKey: ["/api/cards"] });
      setEditingBaseId(null);
      setEditingBaseName("");
      toast({ title: "Base renamed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/card-bases/${id}`);
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/card-bases"] }); if (expandedBase) setExpandedBase(null); toast({ title: "Base deleted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => { await apiRequest("DELETE", `/api/admin/cards/${cardId}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/cards"] });
      qc.invalidateQueries({ queryKey: ["/api/card-bases"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/card-bases", expandedBase, "cards"] });
      toast({ title: "Card removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      {/* Create base */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-white/45 uppercase tracking-widest">Create Base</p>
        <div className="flex gap-2">
          <Input
            value={newBaseName}
            onChange={e => setNewBaseName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newBaseName.trim()) createMutation.mutate(); }}
            placeholder="Base name (e.g. OG CLOVER)"
            className="bg-[#111]/5 border-white/10 text-sm flex-1"
            data-testid="input-base-name"
          />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newBaseName.trim()} size="sm" className="h-9" data-testid="btn-create-base">
            {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
          </Button>
        </div>
      </div>

      {/* Bases list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (bases ?? []).length === 0 ? (
          <p className="text-xs text-white/40 text-center py-6">No bases yet</p>
        ) : (
          (bases ?? []).map((b: any) => (
            <div key={b.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingBaseId === b.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingBaseName}
                        onChange={e => setEditingBaseName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && editingBaseName.trim()) renameMutation.mutate({ id: b.id, name: editingBaseName });
                          if (e.key === "Escape") { setEditingBaseId(null); setEditingBaseName(""); }
                        }}
                        className="bg-[#111]/5 border-white/10 h-7 text-xs font-mono flex-1"
                        autoFocus
                        data-testid={`input-rename-base-${b.id}`}
                      />
                      <button
                        onClick={() => { if (editingBaseName.trim()) renameMutation.mutate({ id: b.id, name: editingBaseName }); }}
                        disabled={renameMutation.isPending || !editingBaseName.trim()}
                        className="text-[10px] font-mono px-2 py-1 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                        data-testid={`btn-save-rename-base-${b.id}`}
                      >
                        {renameMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "save"}
                      </button>
                      <button
                        onClick={() => { setEditingBaseId(null); setEditingBaseName(""); }}
                        className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-white/45 hover:text-white transition-all"
                      >
                        cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedBase(expandedBase === b.id ? null : b.id)}
                      className="text-left w-full"
                      data-testid={`btn-expand-base-${b.id}`}
                    >
                      <p className="text-sm font-bold text-white font-mono">{b.name}</p>
                      <p className="text-[10px] text-white/40">{b.count} card{b.count !== 1 ? "s" : ""} in stock</p>
                    </button>
                  )}
                </div>
                {editingBaseId !== b.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setEditingBaseId(b.id); setEditingBaseName(b.name); setExpandedBase(null); }}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-white/45 hover:border-white/25 hover:text-white transition-all"
                      data-testid={`btn-rename-base-${b.id}`}
                    >
                      rename
                    </button>
                    <button
                      onClick={() => setExpandedBase(expandedBase === b.id ? null : b.id)}
                      className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${expandedBase === b.id ? "border-primary/40 text-primary" : "border-white/10 text-white/45 hover:border-white/20"}`}
                      data-testid={`btn-view-base-${b.id}`}
                    >
                      {expandedBase === b.id ? "close" : "view"}
                    </button>
                    <button
                      onClick={() => { if (b.count > 0) { toast({ title: "Cannot delete", description: "Remove all cards first", variant: "destructive" }); return; } deleteMutation.mutate(b.id); }}
                      disabled={deleteMutation.isPending}
                      className="text-white/30 hover:text-destructive transition-colors"
                      data-testid={`btn-delete-base-${b.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {expandedBase === b.id && (
                <div className="border-t border-white/10 px-4 py-3 space-y-2">
                  {!baseCards || baseCards.length === 0 ? (
                    <p className="text-xs text-white/40 text-center py-3">No cards in this base</p>
                  ) : (
                    baseCards.map((card: any) => {
                      const bin = (card.cardNumber || "").replace(/\D/g, "").substring(0, 6);
                      const metadata = card.metadata ?? {};
                      return (
                        <div key={card.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono bg-[#111]/5 border border-white/10 px-1.5 py-0.5 rounded text-white/45">{metadata.bin || bin}</span>
                              {metadata.type && <span className="text-[10px] text-white/40 font-mono">{metadata.type}</span>}
                              {metadata.state && <span className="text-[10px] text-white/40 font-mono">{metadata.state}</span>}
                              {metadata.zip && <span className="text-[10px] text-white/40 font-mono">{metadata.zip}</span>}
                              <span className="text-[10px] text-white/40">{card.hrPercent ?? 80}% HR</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="font-mono text-xs text-white/60">${(card.price / 100).toFixed(2)}</span>
                            <button
                              onClick={() => deleteCardMutation.mutate(card.id)}
                              disabled={deleteCardMutation.isPending}
                              className="text-white/30 hover:text-destructive transition-colors"
                              data-testid={`btn-delete-base-card-${card.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminCardsSection() {
  const { toast } = useToast();
  const qc = queryClient;
  const [tab, setTab] = useState<"stock" | "bases">("stock");
  const [fullItem, setFullItem] = useState("");
  const [price, setPrice] = useState("");
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [refreshProgress, setRefreshProgress] = useState(0);

  const { data: cards, isLoading } = useQuery<any[]>({
    queryKey: ["/api/cards", "admin"],
    queryFn: async () => {
      const res = await fetch("/api/cards", { credentials: "include" });
      if (!res.ok) throw new Error("Unable to load cards");
      return res.json();
    },
  });
  const { data: bases } = useQuery<any[]>({ queryKey: ["/api/card-bases"] });

  const refreshMutation = useMutation({
    mutationFn: () => refreshCardBins(setRefreshProgress),
    onMutate: () => setRefreshProgress(0),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/cards"] });
      qc.invalidateQueries({ queryKey: ["/api/card-bases"] });
      toast({
        title: "Cards refreshed",
        description: `${data?.cardsUpdated ?? 0} cards re-tracked · ${data?.duplicatesRemoved ?? 0} duplicates removed · ${data?.nonCardsFlagged ?? 0} flagged NON.`,
      });
    },
    onError: (error: Error) => toast({ title: "Refresh failed", description: error.message, variant: "destructive" }),
  });

  const orderedCards = cards ?? [];

  // Auto-extract BIN + ZIP preview from the first detected card in the stock block
  const cardEntries = splitCardEntries(fullItem);
  const detectedCardCount = cardEntries.filter(entry => findCardNumberPreview(entry).length >= 13).length;
  const malformedEntryCount = Math.max(0, cardEntries.length - detectedCardCount);
  const previewBin = findCardNumberPreview(cardEntries[0] || "").substring(0, 6);
  const previewState = extractStatePreview(cardEntries[0] || "");
  const previewPostal = extractPostalPreview(cardEntries[0] || "");

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!fullItem.trim()) throw new Error("Full item is required");
      if (!price || parseFloat(price) <= 0) throw new Error("Valid price is required");
      if (!selectedBaseId) throw new Error("Name is required");
      const body: any = { extras: fullItem.trim(), price: parseFloat(price), baseId: Number(selectedBaseId) };
      const res = await apiRequest("POST", "/api/cards", body);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed to add card"); }
      return res.json();
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/cards"] });
      qc.invalidateQueries({ queryKey: ["/api/card-bases"] });
      setFullItem(""); setPrice(""); setSelectedBaseId("");
      const count = data?.count ?? 1;
       const skippedItems = Array.isArray(data?.skipped) ? data.skipped : [];
       const skipped = skippedItems.length;
      const duplicateCount = Number(data?.duplicateCount ?? 0);
      const nonCardsFlagged = Number(data?.nonCardsFlagged ?? 0);
      const invalidCount = Math.max(0, skipped - duplicateCount);
       const reasonCounts = new Map<string, number>();
       for (const item of skippedItems) {
         const reason = /already sold/i.test(item.reason)
           ? "card already sold"
           : /already in stock/i.test(item.reason)
             ? "card already in stock"
             : item.reason;
         reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
       }
       const skippedDetails = Array.from(reasonCounts.entries())
         .slice(0, 3)
         .map(([reason, amount]) => `(${amount}) ${reason}`)
         .join(" · ");
       const details = [
         skippedDetails,
         reasonCounts.size > 3 ? `(${skipped - Array.from(reasonCounts.values()).slice(0, 3).reduce((sum, amount) => sum + amount, 0)}) other cards skipped` : "",
         nonCardsFlagged > 0 ? `(${nonCardsFlagged}) cards flagged NON` : "",
       ].filter(Boolean).join(" · ");
      toast({
        title: count > 1 ? `${count} cards added` : "Card added",
        description: details || undefined,
      });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/cards/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cards"] }); qc.invalidateQueries({ queryKey: ["/api/card-bases"] }); toast({ title: "Card deleted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">Cards</h2>
        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="flex items-center gap-2 rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-2 text-[10px] font-bold text-green-300 transition-colors hover:bg-green-500/20 disabled:opacity-50"
          title="Re-track every BIN and remove safe duplicates"
          data-testid="btn-admin-refresh-cards"
        >
          {refreshMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {refreshMutation.isPending ? `${refreshProgress}%` : "REFRESH"}
        </button>
      </div>
      {refreshMutation.isPending && (
        <div className="relative h-6 overflow-hidden rounded border border-green-400/30 bg-green-950/30" aria-label={`Card refresh ${refreshProgress}% complete`}>
          <div className="h-full bg-green-500/30 transition-[width] duration-300" style={{ width: `${refreshProgress}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green-200">
            {refreshProgress}% · CHECKING BIN DATA AND DUPLICATES
          </span>
        </div>
      )}

      {/* Add Card form */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-white/45 uppercase tracking-widest">Add Card</p>

        <div className="space-y-1">
          <label className="text-[10px] text-white/45 uppercase tracking-widest">Full Delivery Item</label>
          <textarea
            value={fullItem}
            onChange={e => setFullItem(e.target.value)}
             placeholder={"4111111111111111|12/25|123|John Doe|123 Main St|City|CA|12345\n4222222222222222|12/26|456|Jane Doe|456 Oak Ave|City|NY|54321"}
            rows={8}
            className="w-full bg-[#111]/5 border border-white/10 rounded text-xs text-white font-mono p-2 outline-none focus:border-gray-300 resize-none placeholder:text-white/30"
            data-testid="input-full-item"
          />
            <p className="text-[10px] text-white/30">Paste the full stock block at once. Each card starts at its card number; the importer finds each card boundary and keeps count. International regions and postal-code formats are accepted when provided.</p>
           <div className="flex flex-wrap gap-3">
             <p className="text-[10px] text-white/50 font-mono">
               {detectedCardCount} card{detectedCardCount === 1 ? "" : "s"} detected
             </p>
             {malformedEntryCount > 0 && (
               <p className="text-[10px] text-red-400/80 font-mono">
                 {malformedEntryCount} entr{malformedEntryCount === 1 ? "y" : "ies"} need review
               </p>
            )}
            {previewBin.length === 6 && (
              <p className="text-[10px] text-primary/60 font-mono">BIN: {previewBin}</p>
            )}
              <p className="text-[10px] font-mono text-white/50">
                REGION: {previewState || "—"}
             </p>
              <p className="text-[10px] font-mono text-white/50">
                POSTAL: {previewPostal || "—"}
             </p>
          </div>
        </div>

        {/* Named base selector — required */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/45 uppercase tracking-widest">Name <span className="text-red-400/70">*</span></label>
          <select
            value={selectedBaseId}
            onChange={e => setSelectedBaseId(e.target.value)}
            className="w-full bg-[#111]/5 border border-white/10 rounded text-xs text-white py-2 px-2 outline-none focus:border-gray-300"
            data-testid="select-card-base"
          >
            <option value="">— Select name —</option>
            {(bases ?? []).map((b: any) => (
              <option key={b.id} value={String(b.id)}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-white/45 uppercase tracking-widest">Price ($)</label>
          <Input
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="5.00"
            type="number"
            step="0.01"
            className="bg-[#111]/5 border-white/10"
            data-testid="input-card-price"
          />
        </div>

        <Button
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || !fullItem.trim() || !price || !selectedBaseId}
          size="sm"
          className="w-full h-8 text-xs"
          data-testid="btn-add-card"
        >
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : detectedCardCount > 1 ? `Add ${detectedCardCount} Cards` : "Add Card"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(["stock", "bases"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono transition-all capitalize ${tab === t ? "text-primary border-b border-primary -mb-px" : "text-white/40 hover:text-white/70"}`}
            data-testid={`tab-cards-${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "stock" && (
        <div className="space-y-2">
          <p className="text-xs text-white/40">{(cards ?? []).length} cards in stock</p>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            orderedCards.map((card: any) => {
              const cBin = (card.cardNumber || "").replace(/\D/g, "").substring(0, 6);
                       const metadata = card.metadata ?? {};
                       const zip = metadata.zip || extractPostalPreview(card.extras ?? "");
                       const state = metadata.state || extractStatePreview(card.extras ?? "");
                      const country = String(card.country ?? "").trim();
                       const issuer = String(card.binData?.bank ?? card.binData?.Issuer ?? "").trim();
                       const type = String(card.binData?.type ?? card.binData?.Type ?? "").trim().toUpperCase();
              return (
                <div key={card.id} className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {card.baseName && <span className="text-[10px] font-mono font-bold text-primary/70">{card.baseName}</span>}
                       {card.binData?.lookupStatus === "non" && (
                         <span className="text-[10px] font-mono font-bold text-red-400">NON</span>
                       )}
                       <span className="text-[10px] font-mono bg-[#111]/5 border border-white/10 px-1.5 py-0.5 rounded text-white/45">{metadata.bin || cBin}</span>
                       {type && <span className="text-[10px] text-white/50 font-mono">{type}</span>}
                       {issuer && <span className="text-[10px] text-white/50 truncate max-w-48">{issuer}</span>}
                       {state && <span className="text-[10px] text-white/40 font-mono">STATE {state}</span>}
                      {zip && <span className="text-[10px] text-white/40 font-mono">ZIP {zip}</span>}
                      {country && <span className="text-[10px] text-white/40 font-mono">{country}</span>}
                    </div>
                    <p className="text-[10px] text-white/40 font-mono">{card.hrPercent ?? 80}% HR</p>
                    {card.extras && <p className="text-[9px] text-white/30 truncate font-mono">{card.extras.substring(0, 55)}...</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="font-mono text-sm text-white">${(card.price / 100).toFixed(2)}</span>
                    <button
                      onClick={() => deleteMutation.mutate(card.id)}
                      disabled={deleteMutation.isPending}
                      className="text-white/30 hover:text-destructive transition-colors"
                      data-testid={`btn-delete-card-${card.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "bases" && <AdminBasesTab />}
    </div>
  );
}

function AdminRoutingSection() {
  const { toast } = useToast();
  const [fullItem, setFullItem] = useState("");
  const [price, setPrice] = useState("");
  const { data: routings = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/routings"] });
  const bankEntries = fullItem.trim() ? (() => {
    const trimmed = fullItem.trim();
    if (/\r?\n\s*\r?\n/.test(trimmed)) {
      return trimmed.split(/\r?\n\s*\r?\n/).map(entry => entry.trim()).filter(Boolean);
    }
    const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const hasLabeledFields = lines.some(line => /^(?:bank(?:\s+name)?|routing(?:\s+number)?|state|zip|postal(?:\s+code)?|bin|issuer|price)\s*[:=]/i.test(line));
    return hasLabeledFields || lines.length === 1 ? [trimmed] : lines;
  })() : [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/routings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/routings"] });
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/routings/bulk", { rawContent: fullItem, price });
      if (!response.ok) throw new Error((await response.json()).message || "Unable to add bank records");
      return response.json() as Promise<{ addedCount: number }>;
    },
    onSuccess: (result) => {
      setFullItem("");
      setPrice("");
      refresh();
      toast({ title: `${result.addedCount} bank${result.addedCount === 1 ? "" : "s"} added` });
    },
    onError: (error: Error) => toast({ title: "Unable to add banks", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/routings/${id}`);
      if (!response.ok) throw new Error((await response.json()).message || "Unable to remove routing record");
    },
    onSuccess: () => {
      refresh();
      toast({ title: "Routing record removed" });
    },
    onError: (error: Error) => toast({ title: "Unable to remove record", description: error.message, variant: "destructive" }),
  });

  const available = routings.filter((item: any) => !item.isSold);
  const sold = routings.length - available.length;
  const availableValue = available.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

  return (
    <div className="pixel-page space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Banks</h1>
        <p className="mt-1 text-sm text-white/45">Add public bank metadata only: bank, routing number, state, ZIP, BIN, and issuer. Account-and-routing records or full card details are flagged and blocked.</p>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-white/45">Add Bank</p>
        <textarea
          value={fullItem}
          onChange={event => setFullItem(event.target.value)}
          placeholder={"Chase|021000021|NY|10001|123456|JPMorgan Chase|5.00\n\nWells Fargo|121000248|CA|94105|654321|Wells Fargo Bank|5.00"}
          rows={6}
          className="w-full bg-[#0d0d0d] border border-white/10 rounded text-xs text-white font-mono p-2 outline-none focus:border-gray-300 resize-none placeholder:text-white/30"
          data-testid="input-bank-full-item"
        />
        <p className="text-[10px] text-white/30">Enter: Bank | 9-digit routing number | State | ZIP | 6–8 digit BIN | Issuer | optional price. You can also paste labeled lines (Bank:, Routing:, State:, ZIP:, BIN:, Issuer:, Price:). Leave one blank line between banks.</p>
        {bankEntries.length > 0 && (
          <span className="inline-flex w-fit items-center rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-mono text-primary" data-testid="text-bank-entry-count">
            {bankEntries.length} bank{bankEntries.length === 1 ? "" : "s"} entered
          </span>
        )}
        <Input value={price} onChange={event => setPrice(event.target.value)} placeholder="Price per bank (5.00)" type="number" min="0.01" step="0.01" className="bg-[#0d0d0d] border-white/10" data-testid="input-bank-price" />
        <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !fullItem.trim() || !price}
          className="w-full" data-testid="button-add-bank">
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : bankEntries.length > 1 ? `Add ${bankEntries.length} Banks` : "Add Bank"}
        </Button>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <h2 className="font-semibold text-white">Inventory</h2>
            <p className="text-xs text-white/40">{available.length} available · ${(availableValue / 100).toFixed(2)} stock value · {sold} sold</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : routings.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">No routing records yet.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {routings.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <Landmark className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{item.bankName}</p>
                  <p className="font-mono text-xs text-white/45">{item.routingNumber} · {item.state} · {item.zip} · BIN {item.bin || "—"} · {item.issuer || "Issuer not provided"} · ${(item.price / 100).toFixed(2)}</p>
                </div>
                {item.isSold ? (
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-mono text-white/45">sold</span>
                ) : (
                  <button onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} className="text-white/35 hover:text-red-400" aria-label={`Remove ${item.bankName}`} data-testid={`button-delete-routing-${item.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


function SellersSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<any | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const { data: sellers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/seller-applications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/seller-applications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/seller-applications/${id}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Seller approved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/seller-applications"] });
      setSelected(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      const res = await apiRequest("POST", `/api/admin/seller-applications/${id}/reject`, { note });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Application rejected" });
      qc.invalidateQueries({ queryKey: ["/api/admin/seller-applications"] });
      setSelected(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = (sellers || []).filter((s: any) => filter === "all" || s.status === filter);
  const pendingCount = (sellers || []).filter((s: any) => s.status === "pending").length;

  function statusBadge(status: string) {
    if (status === "approved") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-mono">approved</span>;
    if (status === "pending") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-mono">pending</span>;
    if (status === "rejected") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-mono">rejected</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0d0d0d] text-white/45 font-mono">{status}</span>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sellers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage seller applications</p>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full font-mono">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="flex gap-1 flex-wrap">
        {(["pending", "all", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-[#0d0d0d] text-white/45 hover:bg-[#111]/5 hover:text-white/70"}`}
          >
            {f}{f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No {filter === "all" ? "" : filter} applications</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((seller: any) => (
            <div
              key={seller.id}
              onClick={() => { setSelected(seller); setNoteInput(""); }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#111]/3 border border-white/10 hover:bg-[#0d0d0d] hover:border-white/10 cursor-pointer transition-colors"
              data-testid={`row-seller-${seller.id}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{(seller.username || "?")[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{seller.username ?? "Unknown"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{seller.note ? seller.note.slice(0, 60) : "No note"}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {statusBadge(seller.status)}
                <span className="text-[10px] text-white/40">{new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-base font-bold">Seller Application</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[#0d0d0d] text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-white/45 mb-0.5">Username</p>
                  <p className="text-sm text-white font-mono">{selected.username ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/45 mb-0.5">Status</p>
                  {statusBadge(selected.status)}
                </div>
                {selected.sellerCode && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-white/45 mb-0.5">Seller Code</p>
                    <p className="text-sm text-primary font-mono font-bold">{selected.sellerCode}</p>
                  </div>
                )}
                {selected.note && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-white/45 mb-0.5">Applicant Note</p>
                    <p className="text-xs text-white/60 leading-relaxed">{selected.note}</p>
                  </div>
                )}
              </div>

              {selected.status === "pending" && (
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <p className="text-[10px] text-white/45 uppercase tracking-widest">Approve or Reject</p>
                  <Input
                    placeholder="Rejection reason (optional)"
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    className="bg-[#111]/5 border-white/10 text-xs h-8"
                    data-testid="input-seller-note"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => approveMutation.mutate(selected.id)}
                      disabled={approveMutation.isPending}
                      data-testid="btn-seller-approve"
                    >
                      {approveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 h-8 text-xs"
                      onClick={() => rejectMutation.mutate({ id: selected.id, note: noteInput })}
                      disabled={rejectMutation.isPending}
                      data-testid="btn-seller-reject"
                    >
                      {rejectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
                    </Button>
                  </div>
                </div>
              )}

              {selected.status === "approved" && (
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full h-8 text-xs opacity-80"
                    onClick={() => rejectMutation.mutate({ id: selected.id, note: "Access revoked by admin" })}
                    disabled={rejectMutation.isPending}
                    data-testid="btn-seller-revoke"
                  >
                    {rejectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Revoke Seller Access"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUPPORT SECTION
══════════════════════════════════════════════ */
function SupportSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [actionTicketId, setActionTicketId] = useState<number | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showExactPurchaseTime, setShowExactPurchaseTime] = useState<number | null>(null);

  const { data: tickets, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/support"],
    staleTime: 10000,
    refetchInterval: 15000,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/support/${id}`, { action, message: adminMessage });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/support"] });
      setActionTicketId(null);
      setAdminMessage("");
      toast({ title: "Ticket updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const statusCls = (s: string) => {
    if (s === "open")     return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    if (s === "refunded") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    if (s === "replaced") return "bg-sky-500/15 text-sky-400 border-sky-500/25";
    return "bg-white/8 text-white/35 border-white/10";
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const open   = (tickets ?? []).filter((t: any) => t.status === "open");
  const closed = (tickets ?? []).filter((t: any) => t.status !== "open");
  const displayed = showHistory ? closed : open;

  const formatTicketDelay = (purchaseAt: string | null | undefined, ticketAt: string | null | undefined) => {
    if (!purchaseAt) return "Purchase time unavailable";
    if (!ticketAt) return "Ticket time unavailable";
    const elapsed = Math.max(0, new Date(ticketAt).getTime() - new Date(purchaseAt).getTime());
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "Ticket made under 1m after purchase";
    if (minutes < 60) return `Ticket made ${minutes}m after purchase`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Ticket made ${hours}h ${minutes % 60}m after purchase`;
    const days = Math.floor(hours / 24);
    return `Ticket made ${days}d ${hours % 24}h after purchase`;
  };

  return (
    <div className="pixel-page space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">Support Tickets</p>
          <p className="text-xs text-white/40 mt-0.5">
            {open.length} open · {closed.length} resolved
          </p>
        </div>
        <button
          onClick={() => { setShowHistory(h => !h); setActionTicketId(null); setAdminMessage(""); }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            showHistory
              ? "bg-primary/15 border-primary/30 text-primary"
              : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
          }`}
        >
          {showHistory ? "← Active" : `History (${closed.length})`}
        </button>
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-white/30 text-sm">
            {showHistory ? "No resolved tickets yet" : "No open tickets — all clear ✓"}
          </p>
        </div>
      )}

      {displayed.map((ticket: any) => (
        <Card key={ticket.id} className="bg-[#111] border-white/10">
          <CardContent className="p-4 space-y-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                   <span className={`inline-flex min-h-7 items-center border-[3px] border-black px-2 py-1 pixel-text text-[8px] shadow-[2px_2px_0_#050505] ${statusCls(ticket.status)}`}>
                    {ticket.status.toUpperCase()}
                  </span>
                   <span className="border-[2px] border-black bg-[#17337d] px-2 py-1 pixel-text text-[8px] text-[#ffe177] shadow-[2px_2px_0_#050505]">
                     {ticket.subject}
                   </span>
                  <span className="text-[10px] text-white/35 font-mono">#{ticket.id}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] text-white/40 font-mono">Order: {ticket.orderId}</p>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-[#17337d] px-2 py-1 text-[10px] font-mono text-[#ffe177] transition-colors hover:bg-[#2555c5]"
                    title={ticket.purchaseAt
                      ? `Purchased ${new Date(ticket.purchaseAt).toLocaleString("en-US")} · Ticket made ${new Date(ticket.createdAt).toLocaleString("en-US")}`
                      : "Purchase time unavailable"}
                    onClick={() => setShowExactPurchaseTime(current => current === ticket.id ? null : ticket.id)}
                  >
                    {showExactPurchaseTime === ticket.id && ticket.purchaseAt
                      ? `${new Date(ticket.purchaseAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} → ${new Date(ticket.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                      : formatTicketDelay(ticket.purchaseAt, ticket.createdAt)}
                  </button>
                </div>
                {ticket.user?.username && (
                  <p className="text-[11px] text-white/35">User: <span className="text-white/60">{ticket.user.username}</span></p>
                )}
              </div>
              <p className="text-[10px] text-white/25 shrink-0 whitespace-nowrap">
                {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>

            {/* Body */}
            <div className="bg-white/[0.03] rounded-lg p-3 space-y-1.5 border border-white/5">
              <p className="text-xs text-white/60 leading-relaxed">{ticket.description}</p>
              {ticket.imageUrl && (
                <a href={ticket.imageUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline block">View attached image →</a>
              )}
            </div>

            {ticket.purchasedStock?.length ? (
              <div className="border-[3px] border-black bg-[#0b1644] p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#ffe177]">Purchased stock</p>
                {ticket.purchasedStock.map((stock: any, index: number) => (
                  <div key={`${stock.itemType}-${index}`} className="space-y-1">
                    <p className="text-[10px] font-mono text-white/45">{stock.label}</p>
                    <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed text-white">{stock.content}</pre>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Existing admin message */}
            {ticket.adminMessage && (
              <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                <p className="text-[10px] text-primary/60 uppercase tracking-widest mb-0.5">Your response</p>
                <p className="text-xs text-white/70">{ticket.adminMessage}</p>
              </div>
            )}

            {/* Action panel — only for open tickets */}
            {ticket.status === "open" && (
              <div className="space-y-2 pt-1 border-t border-white/5">
                {actionTicketId === ticket.id ? (
                  <div className="space-y-2 pt-2">
                    <Textarea
                      placeholder="Message to user (optional)..."
                      value={adminMessage}
                      onChange={e => setAdminMessage(e.target.value)}
                      className="h-20 text-xs bg-[#0d0d0d] border-white/10 resize-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                       {(["refund", "resolved"] as const).map(action => (
                        <Button
                          key={action}
                          size="sm"
                          disabled={actionMutation.isPending}
                           className={`h-9 rounded-none border-[3px] border-black text-[9px] font-semibold shadow-[2px_2px_0_#050505] ${
                            action === "refund"
                               ? "bg-[#43b94e] hover:bg-[#31973a] text-white"
                              : "bg-[#a7a4aa] hover:bg-[#858287] text-[#17110a]"
                          }`}
                          onClick={() => actionMutation.mutate({ id: ticket.id, action })}
                        >
                          {actionMutation.isPending && actionTicketId === ticket.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : action.charAt(0).toUpperCase() + action.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <button
                      onClick={() => { setActionTicketId(null); setAdminMessage(""); }}
                      className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                     className="mt-2 h-9 rounded-none border-[3px] border-black bg-[#ffe177] text-[9px] font-semibold text-[#17110a] shadow-[2px_2px_0_#050505] hover:bg-[#fff0c5]"
                    onClick={() => { setActionTicketId(ticket.id); setAdminMessage(ticket.adminMessage || ""); }}
                  >
                    Take Action
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
