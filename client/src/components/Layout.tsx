import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Coins, Crown, Gamepad2, HeartHandshake, Menu, ShoppingCart,
  Ticket, CreditCard, ReceiptText, LogOut, ShieldCheck,
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
      { href: "/ranks", label: "Rank", icon: Crown },
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
  const bulkBundle = useCart(s => s.bulkBundle);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0) + (bulkBundle?.cardIds.length ?? 0);
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
      <div className="px-3 pt-3 pb-2 space-y-3">
        <Link href="/cards">
          <div className="pixel-button sidebar-brand-button flex h-[48px] items-center justify-center !text-white">
            <p className="pixel-logo-text">NYCHQ</p>
          </div>
        </Link>
        <Link href="/profile">
          <div className="flex h-[26px] items-center gap-1.5 border-[3px] border-[#0a1021] bg-[#5f90ef] px-2 text-white shadow-[2px_2px_0_#0a1021]">
            <Coins className="h-3.5 w-3.5 shrink-0 text-[#ffe14f]" />
            <span className="pixel-text truncate text-[9px] leading-none">{user?.username ?? "GUEST"}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navigation.map(group => (
          <section key={group.label}>
            <p className="pixel-text mb-1.5 px-1 text-[8px] leading-none text-[#ffe177] [text-shadow:2px_2px_0_#131e48]">{group.label}</p>
            <div className="space-y-2">
              {group.items.map(item => {
                const content = (
                  <div
                    className={`pixel-button flex min-h-9 items-center gap-2 px-2.5 py-2 text-[9px] leading-none transition-colors ${
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
            <p className="pixel-text mb-1.5 px-1 text-[8px] leading-none text-[#ffe177] [text-shadow:2px_2px_0_#131e48]">ADMIN</p>
            <Link href="/admin">
              <div className={`pixel-button flex min-h-9 items-center gap-2 px-2.5 py-2 text-[9px] leading-none ${isActive("/admin") ? "!bg-[#ee292b] !text-white" : ""}`}>
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span>Admin Panel</span>
              </div>
            </Link>
          </section>
        )}
      </nav>

      <div className="mx-3 border-t-[4px] border-dashed border-[#0a1021] pt-3 pb-3 space-y-2">
        <Link href="/cart">
          <div className={`pixel-button flex min-h-9 items-center gap-2 px-2.5 py-2 text-[9px] ${isActive("/cart") ? "!bg-[#ee292b] !text-white" : ""}`}>
            <ShoppingCart className="h-3 w-3" />
            <span>Cart{cartCount ? ` (${cartCount})` : ""}</span>
          </div>
        </Link>
        {user && (
          <>
            <button
              onClick={() => logout()}
              className="pixel-button flex min-h-9 w-full items-center gap-2 px-2.5 py-2 text-[9px] !bg-[#43b94e] !text-white"
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
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] flex-col bg-[#5f90ef] text-[#16100c] lg:flex">
        {navContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity lg:hidden ${navOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setNavOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[calc(100vw-16px)] max-w-[316px] flex-col bg-[#5f90ef] text-[#16100c] transition-transform lg:hidden ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {navContent}
      </aside>

      <main className="min-h-screen lg:pl-[260px]">
        <div className="border-b-[3px] border-[#183c9d] bg-[#245cdb] px-4 py-2 text-center">
          <a href="https://t.me/+9_iBYCRURfgwNGUx" target="_blank" rel="noreferrer" className="pixel-text text-[8px] text-white underline underline-offset-4">
            {activeAnnouncement?.text || "JOIN OUR TELEGRAM"}
          </a>
        </div>
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-white/10 bg-[#050505]/95 px-4 backdrop-blur lg:px-6">
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
        <div className="min-h-[calc(100vh-84px)] px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}