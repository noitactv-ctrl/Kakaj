import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Coins, Crown, Gamepad2, Menu, ShoppingCart,
  Ticket, CreditCard, ReceiptText, LogOut, ShieldCheck, Landmark,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { CartSidebar } from "@/components/CartSidebar";
import { useFeatureVisibility } from "@/hooks/use-feature-visibility";

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
    label: "SUPPORT",
    items: [{ href: "/support", label: "Tickets", icon: Ticket }],
  },
  {
    label: "FEATURED",
    items: [
      { href: "/cards", label: "Cards", icon: CreditCard },
      { href: "/routings", label: "Banks", icon: Landmark },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { features } = useFeatureVisibility();
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
    location === href || (href === "/deposit" && location === "/");
  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.href === "/ranks") return features.ranks;
        if (item.href === "/cards") return features.cards;
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
  const navContent = (
    <>
      <div className="px-3 pt-3 pb-2 space-y-3 lg:px-2 lg:pt-2 lg:pb-1 lg:space-y-2">
        <Link href={features.cards ? "/cards" : "/deposit"}>
          <div className="pixel-button sidebar-brand-button flex h-[48px] items-center justify-center !text-white lg:h-[38px]">
            <p className="pixel-logo-text">NYCHQ</p>
          </div>
        </Link>
        <div className="flex h-[26px] items-center gap-1.5 border-[3px] border-[#0a1021] bg-[#5f90ef] px-2 text-white shadow-[2px_2px_0_#0a1021] lg:h-[20px] lg:gap-1 lg:px-1.5">
          <Coins className="h-3.5 w-3.5 shrink-0 text-[#ffe14f] lg:h-3 lg:w-3" />
          <span className="pixel-text truncate text-[9px] leading-none lg:text-[7px]">{user?.username ?? "GUEST"}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 lg:px-2 lg:py-1 lg:space-y-3">
        {visibleNavigation.map(group => (
          <section key={group.label}>
            <p className="pixel-text mb-1.5 px-1 text-[8px] leading-none text-[#ffe177] [text-shadow:2px_2px_0_#131e48] lg:mb-1 lg:px-0.5 lg:text-[7px]">{group.label}</p>
            <div className="space-y-2 lg:space-y-1.5">
              {group.items.map(item => {
                const content = (
                  <div
                    className={`pixel-button flex min-h-9 items-center gap-2 px-2.5 py-2 text-[9px] leading-none transition-colors lg:min-h-7 lg:gap-1.5 lg:px-2 lg:py-1.5 lg:text-[8px] ${
                      !item.external && isActive(item.href) ? "!bg-[#ee292b] !text-white" : ""
                    }`}
                  >
                    <item.icon className="h-3 w-3 shrink-0 lg:h-2.5 lg:w-2.5" />
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
            <p className="pixel-text mb-1.5 px-1 text-[8px] leading-none text-[#ffe177] [text-shadow:2px_2px_0_#131e48] lg:mb-1 lg:px-0.5 lg:text-[7px]">ADMIN</p>
            <Link href="/admin">
              <div className={`pixel-button flex min-h-9 items-center gap-2 px-2.5 py-2 text-[9px] leading-none lg:min-h-7 lg:gap-1.5 lg:px-2 lg:py-1.5 lg:text-[8px] ${isActive("/admin") ? "!bg-[#ee292b] !text-white" : ""}`}>
                <ShieldCheck className="h-3 w-3 shrink-0 lg:h-2.5 lg:w-2.5" />
                <span>Admin Panel</span>
              </div>
            </Link>
          </section>
        )}
      </nav>

      <div className="mx-3 border-t-[4px] border-dashed border-[#0a1021] pt-3 pb-3 space-y-2 lg:mx-2 lg:pt-2 lg:pb-2 lg:space-y-1.5">
        <button
          type="button"
          onClick={() => {
            setCartRailOpen(true);
            setNavOpen(false);
          }}
          className="pixel-button flex min-h-9 w-full items-center gap-2 px-2.5 py-2 text-left text-[9px] lg:min-h-7 lg:gap-1.5 lg:px-2 lg:py-1.5 lg:text-[8px]"
        >
            <ShoppingCart className="h-3 w-3 lg:h-2.5 lg:w-2.5" />
            <span>Cart{cartCount ? ` (${cartCount})` : ""}</span>
        </button>
        {user && (
          <>
            <button
              onClick={() => logout()}
              className="pixel-button flex min-h-9 w-full items-center gap-2 px-2.5 py-2 text-[9px] !bg-[#43b94e] !text-white lg:min-h-7 lg:gap-1.5 lg:px-2 lg:py-1.5 lg:text-[8px]"
            >
              <LogOut className="h-3 w-3 lg:h-2.5 lg:w-2.5" />
              <span>Log out</span>
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="pixel-shell min-h-screen bg-[#030303] text-[#fff4dc]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[168px] flex-col bg-[#5f90ef] text-[#16100c] lg:flex">
        {navContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity lg:hidden ${navOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setNavOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[calc(100vw-16px)] max-w-[316px] flex-col bg-[#5f90ef] text-[#16100c] transition-transform lg:hidden ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {navContent}
      </aside>

      <main className="min-h-screen lg:pl-[168px]">
        <header className="pixel-content-gutter sticky top-0 z-30 flex h-14 items-center border-b-[3px] border-[#183c9d] bg-[#070d25]/95 shadow-[0_3px_0_#02040d] backdrop-blur lg:h-10">
          <button className="text-[#ffe177] lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <div className="pixel-content-gutter min-h-[calc(100vh-56px)] py-4 lg:min-h-[calc(100vh-40px)] lg:py-3">
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