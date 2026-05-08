"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AnalyticsIcon,
  BasketIcon,
  ChefHatIcon,
  ChevronDownIcon,
  ClientsIcon,
  GroceryListsIcon,
  HomeIcon,
  IngredientsIcon,
  InventoryIcon,
  MenuItemsIcon,
  OrdersIcon,
  PlusIcon,
  SettingsIcon,
} from "./icons";

type IconComponent = (props: { className?: string }) => React.ReactNode;

type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
};

type Mode = "catering" | "household";

const MODE_STORAGE_KEY = "gl.mode";

const cateringNav: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Orders", href: "/orders", icon: OrdersIcon },
  { label: "Menu Items", href: "/menu-items", icon: MenuItemsIcon },
  { label: "Ingredients", href: "/ingredients", icon: IngredientsIcon },
  { label: "Inventory", href: "/inventory", icon: InventoryIcon },
  { label: "Grocery Lists", href: "/grocery-lists", icon: GroceryListsIcon },
  { label: "Clients", href: "/clients", icon: ClientsIcon },
  { label: "Analytics", href: "/analytics", icon: AnalyticsIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

const householdNav: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "New List", href: "/grocery-lists/new", icon: PlusIcon },
  { label: "My Lists", href: "/grocery-lists", icon: GroceryListsIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

const HOUSEHOLD_PREFIXES = [
  "/grocery-lists/new",
  "/grocery-lists/household",
];

const CATERING_PREFIXES = [
  "/orders",
  "/menu-items",
  "/ingredients",
  "/inventory",
  "/clients",
];

function inferMode(pathname: string): Mode | null {
  if (
    HOUSEHOLD_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return "household";
  }
  if (
    CATERING_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return "catering";
  }
  return null;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ModeStyles = {
  brandIcon: IconComponent;
  brandIconBg: string;
  brandIconText: string;
  activeBg: string;
  activeText: string;
  subtitle: string;
};

const styles: Record<Mode, ModeStyles> = {
  catering: {
    brandIcon: ChefHatIcon,
    brandIconBg: "bg-green-100",
    brandIconText: "text-green-700",
    activeBg: "bg-green-50",
    activeText: "text-green-700",
    subtitle: "Tasty Bites Catering",
  },
  household: {
    brandIcon: BasketIcon,
    brandIconBg: "bg-violet-100",
    brandIconText: "text-violet-600",
    activeBg: "bg-violet-50",
    activeText: "text-violet-700",
    subtitle: "Personal account",
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const [storedMode, setStoredMode] = useState<Mode>("catering");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (saved === "catering" || saved === "household") {
      setStoredMode(saved);
    }
  }, []);

  const inferred = inferMode(pathname);
  const mode: Mode = inferred ?? storedMode;

  useEffect(() => {
    if (!inferred) return;
    if (inferred !== storedMode) {
      setStoredMode(inferred);
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MODE_STORAGE_KEY, inferred);
      } catch {
        // ignore
      }
    }
  }, [inferred, storedMode]);

  const navItems = mode === "household" ? householdNav : cateringNav;
  const otherMode: Mode = mode === "household" ? "catering" : "household";
  const switchHref = otherMode === "household" ? "/grocery-lists/new" : "/orders/new";
  const modeStyles = styles[mode];
  const BrandIcon = modeStyles.brandIcon;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-3 px-6 pb-4 pt-7">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${modeStyles.brandIconBg} ${modeStyles.brandIconText}`}
        >
          <BrandIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight text-zinc-900">
            GroceryList
          </p>
          <p className="text-[11px] text-zinc-400">Smart lists, every time.</p>
        </div>
      </div>

      <ModePill mode={mode} />

      <nav className="mt-3 flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? `${modeStyles.activeBg} font-medium ${modeStyles.activeText}`
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

        <div className="mt-4 border-t border-zinc-100 pt-3">
          <Link
            href={switchHref}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800"
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {otherMode === "household" ? (
                <BasketIcon className="h-4 w-4" />
              ) : (
                <ChefHatIcon className="h-4 w-4" />
              )}
            </span>
            Switch to{" "}
            {otherMode === "household" ? "Household" : "Catering"} Mode
          </Link>
        </div>
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
          AS
        </span>
        <div className="flex-1 leading-tight">
          <p className="text-sm font-medium text-zinc-900">Aakrati Sharma</p>
          <p className="text-xs text-zinc-500">{modeStyles.subtitle}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
      </div>
    </aside>
  );
}

function ModePill({ mode }: { mode: Mode }) {
  const isHousehold = mode === "household";
  return (
    <div className="px-6">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          isHousehold
            ? "bg-violet-50 text-violet-700"
            : "bg-green-50 text-green-700"
        }`}
      >
        {isHousehold ? (
          <BasketIcon className="h-3 w-3" />
        ) : (
          <ChefHatIcon className="h-3 w-3" />
        )}
        {isHousehold ? "Household" : "Catering"} Mode
      </span>
    </div>
  );
}
