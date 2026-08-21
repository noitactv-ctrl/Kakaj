import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Coins, Crown, Gamepad2, HeartHandshake, Menu, ShoppingCart,
  Ticket, X, CreditCard, ReceiptText, LogOut, ShieldCheck, UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Coins;
  external?: boolean;
};

const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: "MAIN",
    items: [
      { href: "/deposit", label: "Topup", icon: Coins },
      { href: "/orders", label: "Orders", icon: ReceiptText },
      { href: "/ranks", label: "Loyalty", icon: Crown },
    ],
  },
  {
    label: "GAMES",
    items: [{ href: "/plinko", label: "Plinko", icon: Gamepad2 }],
  },
  {
    label: "CHANNEL",
    items: [{ href: "https://t.me/+9_iBYCRURfgwNGUx", label: "Telegram Channel", icon: HeartHandshake, external: true }],
  },
  {
    label: "SUPPORT",
    items: [{ href: "/support", label: "Tickets", icon: Ticket }],
  },
  {
    label: "FEATURED",
    items: [{ href: "/cards", label: "Cards", icon: CreditCard }],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const cartItems = useCart(s => s.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const balance = user ? (user.balance / 100).toFixed(2) : "0.00";
  const { data: announcements } = useQuery<{ id: number; text: string; active: boolean }[]>({
    queryKey: ["/api/announcements"],
    staleTime: 60000,
  });
  const activeAnnouncement = announcements?.find(item => item.active);

  useEffect(() => setNavOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  if (location === "/auth") return <>{children}</>;

  const isActive = (href: string) => location === href || (href === "/cards" && location === "/");

  const navContent = (
    <>
      <div className="px-3 py-4 border-b-[3px] border-[#0b1538]">
        <Link href="/cards">
          <p className="pixel-text text-[11px] leading-relaxed text-[#ffe177] cursor-pointer">FOODPLUG</p>
        </Link>
        <p className="mt-1 text-[8px] tracking-[0.22em] text-[#dbe7ff]/70 uppercase">Card Market</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
        {navigation.map(group => (
          <section key={group.label}>
            <p className="pixel-text mb-2 px-1 text-[8px] text-[#ffe177]">{group.label}</p>
            <div className="space-y-2">
              {group.items.map(item => {
                const content = (
                  <div
                    className={`pixel-button flex items-center gap-2 px-2.5 py-2 text-[9px] leading-none transition-colors ${
                      !item.external && isActive(item.href) ? "!bg-[#ee292b] !text-white" : ""
                    }`}
                  >
                    <item.icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
                return item.external ? (
                  <a key={item.href} href={item.href} target="_blank" rel="noreferrer">{content}</a>
                ) : (
                  <Link key={item.href} href={item.href}>{content}</Link>
                );
              })}
            </div>
          </section>
        ))}
        {user?.role === "admin" && (
          <section>
            <p className="pixel-text mb-2 px-1 text-[8px] text-[#ffe177]">ADMIN</p>
            <Link href="/admin">
              <div className={`pixel-button flex items-center gap-2 px-2.5 py-2 text-[9px] leading-none ${isActive("/admin") ? "!bg-[#ee292b] !text-white" : ""}`}>
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span>Admin Panel</span>
              </div>
            </Link>
          </section>
        )}
      </nav>

      <div className="p-2.5 border-t-[3px] border-dashed border-[#08122f] space-y-2">
        <Link href="/cart">
          <div className={`pixel-button flex items-center gap-2 px-2.5 py-2 text-[9px] ${isActive("/cart") ? "!bg-[#ee292b] !text-white" : ""}`}>
            <ShoppingCart className="h-3 w-3" />
            <span>Cart{cartCount ? ` (${cartCount})` : ""}</span>
          </div>
        </Link>
        {user && (
          <>
            <Link href="/profile">
              <div className={`pixel-button flex items-center gap-2 px-2.5 py-2 text-[9px] ${isActive("/profile") ? "!bg-[#ee292b] !text-white" : ""}`}>
                <UserRound className="h-3 w-3" />
                <span className="truncate">Profile & Settings</span>
              </div>
            </Link>
            <p className="px-2 font-mono text-[9px] text-[#f6dbac]/80 truncate">{user.username} · ${balance}</p>
            <button
              onClick={() => logout()}
              className="pixel-button flex w-full items-center gap-2 px-2.5 py-2 text-[9px] !bg-[#43b94e] !text-white"
            >
              <LogOut className="h-3 w-3" />
              <span>Log out</span>
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="pixel-shell min-h-screen bg-[#030303] text-[#fff4dc]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[170px] flex-col bg-[#5f90ef] text-[#16100c] lg:flex">
        {navContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity lg:hidden ${navOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setNavOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#5f90ef] text-[#16100c] transition-transform lg:hidden ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute right-2 top-2 z-10 p-2 text-[#111]" onClick={() => setNavOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>

      <main className="min-h-screen lg:pl-[170px]">
        <div className="border-b-[3px] border-[#183c9d] bg-[#245cdb] px-4 py-2 text-center">
          <a href="https://t.me/+9_iBYCRURfgwNGUx" target="_blank" rel="noreferrer" className="pixel-text text-[8px] text-white underline underline-offset-4">
            {activeAnnouncement?.text || "JOIN OUR TELEGRAM"}
          </a>
        </div>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#050505]/95 px-4 backdrop-blur lg:px-8">
          <button className="text-[#ffe177] lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/deposit" className="pixel-button px-2.5 py-2 text-[8px] !bg-[#ffe1aa]">
              ${balance}
            </Link>
            <Link href="/cart" className="relative text-[#ffe177]" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#ee292b] px-1 text-[8px] text-white">{cartCount}</span>}
            </Link>
          </div>
        </header>
        <div className="min-h-[calc(100vh-88px)] px-3 py-5 sm:px-5 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}