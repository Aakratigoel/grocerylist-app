"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BasketIcon,
  ClientsIcon,
  GroceryListsIcon,
  HomeIcon,
  MenuItemsIcon,
  OrdersIcon,
} from "./icons";

type IconComponent = (props: { className?: string }) => React.ReactNode;

type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "History", href: "/orders", icon: OrdersIcon },
  { label: "Menu Items", href: "/menu-items", icon: MenuItemsIcon },
  { label: "Grocery Lists", href: "/grocery-lists", icon: GroceryListsIcon },
  { label: "Clients", href: "/clients", icon: ClientsIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
} = {}) {
  const pathname = usePathname();

  return (
    <aside
      id="app-sidebar"
      className={`flex w-[min(100vw,16rem)] shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-out md:relative md:z-auto md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 md:static`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] md:hidden">
        <span className="text-sm font-semibold text-zinc-900">Menu</span>
        <button
          type="button"
          onClick={onMobileClose}
          className="min-h-11 min-w-11 rounded-lg px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200"
          aria-label="Close menu"
        >
          Close
        </button>
      </div>
      <div className="flex items-center gap-3 px-6 pb-4 pt-5 md:pt-7">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700">
          <BasketIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight text-zinc-900">
            GroceryList
          </p>
          <p className="text-[11px] text-zinc-400">Smart lists, every time.</p>
        </div>
      </div>

      <div className="px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
          <BasketIcon className="h-3 w-3" />
          For everyone
        </span>
      </div>

      <nav className="mt-3 flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => onMobileClose?.()}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-green-50 font-medium text-green-700"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs text-zinc-500">
        Home cooks, meal prep, parties, or professional kitchens
      </div>
    </aside>
  );
}
