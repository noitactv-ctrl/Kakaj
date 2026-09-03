import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Coins, Crown, Gamepad2, Menu, ShoppingCart,
  Ticket, CreditCard, ReceiptText, LogOut, ShieldCheck, Package, Gift,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { CartSidebar } from "@/components/CartSidebar";
import { useFeatureVisibility } from "@/hooks/use-feature-visibility";
import { useQuery } from "@tanstack/react-query";

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
      { href: "/redeem", label: "Redeem", icon: Gift },
      { href: "/orders", label: "Orders", icon: ReceiptText },
      { href: "/ranks", label: "Rank", icon: Crown },
    ],
  },
  {
    label: "GAMES",
    items: [{ href: "/plinko", label: "Plinko", icon: Gamepad2 }],
  },
  {
    label: "SUPPORT",
    items: [{ href: "/support", label: "Tickets", icon: Ticket }],
  },
  {
    label: "SHOPPING",
    items: [
      { href: "/cards", label: "Buy Cards", icon: CreditCard },
      { href: "/logs", label: "Buy Logs", icon: Package },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { features } = useFeatureVisibility();
  const { data: creditBotStatus } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/telegram/status"],
    staleTime: 15000,
  });
  const [location] = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [cartRailOpen, setCartRailOpen] = useState(false);
  const cartItems = useCart(s => s.items);
  const cardItems = useCart(s => s.cardItems);
  const bulkBundle = useCart(s => s.bulkBundle);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0) + cardItems.length + (bulkBundle?.cardIds.length ?? 0);
  useEffect(() => setNavOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  if (location === "/auth") return <>{children}</>;

  const isActive = (href: string) =>
    location === href ||
    (href === "/deposit" && location === "/") ||
    (href === "/logs" && location.startsWith("/product/"));
  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.href === "/ranks") return features.ranks;
        if (item.href === "/cards") return features.cards;
         if (item.href === "/logs") return features.logs;
        if (item.href === "/link") return creditBotStatus?.enabled !== false;
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
  const navContent = (
    <>
      <div className="px-3 pt-3 pb-2 space-y-3">
        <Link href={features.cards ? "/cards" : "/deposit"}>
          <div className="pixel-button sidebar-brand-button flex h-[48px] items-center justify-center !text-white">
            <p className="pixel-logo-text">BEASTCC</p>
          </div>
        </Link>
        <div className="flex h-[26px] items-center gap-1.5 border-[3px] border-[#0a1021] bg-[#5f90ef] px-2 text-white shadow-[2px_2px_0_#0a1021]">
          <Coins className="h-3.5 w-3.5 shrink-0 text-[#ffe14f]" />
          <span className="pixel-text truncate text-[9px] leading-none">{user?.username ?? "GUEST"}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {visibleNavigation.map(group => (
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
              <div className={`pixel-button flex min-h-9 items-center gap-2 px-2.5 py-2 text-[9px] leading-none ${
                isActive("/admin") ? "!bg-[#ee292b] !text-white" : ""
              }`}>
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span className="truncate">Admin Panel</span>
              </div>
            </Link>
          </section>
        )}
      </nav>

      <div className="mx-3 border-t-[4px] border-dashed border-[#0a1021] pt-3 pb-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            setCartRailOpen(true);
            setNavOpen(false);
          }}
          className="pixel-button flex min-h-9 w-full items-center gap-2 px-2.5 py-2 text-left text-[9px]"
        >
            <ShoppingCart className="h-3 w-3" />
            <span>Cart{cartCount ? ` (${cartCount})` : ""}</span>
        </button>
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
        <header className="pixel-content-gutter sticky top-0 z-30 flex h-14 items-center border-b-[3px] border-[#183c9d] bg-[#070d25]/95 shadow-[0_3px_0_#02040d] backdrop-blur">
          <button className="text-[#ffe177] lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          {user && (
            <div className="ml-auto">
              <Link href="/deposit">
                <div
                  className="pixel-button flex min-h-9 items-center gap-2 border-[3px] border-black !bg-[#ffe1aa] px-2.5 py-2 text-[9px] !text-[#17110a] shadow-[2px_2px_0_#050505] transition-colors hover:!bg-[#fff0c5]"
                  data-testid="button-header-balance"
                >
                  <span>{user.balance === 0 ? "$0" : `$${(user.balance / 100).toFixed(2)}`}</span>
                </div>
              </Link>
            </div>
          )}
        </header>
        <div className="pixel-content-gutter min-h-[calc(100vh-56px)] py-4 lg:py-5">
          {children}
        </div>
      </main>
      <CartSidebar
        open={cartRailOpen}
        onClose={() => setCartRailOpen(false)}
      />
    </div>
  );
}