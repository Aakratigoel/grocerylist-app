"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertIcon,
  AnalyticsIcon,
  BellIcon,
  BoxIcon,
  CalendarIcon,
  ClientsIcon,
  HelpIcon,
  MenuItemsIcon,
  OrdersIcon,
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
} from "../_components/icons";
import {
  useClients,
  useGroceryLists,
  useIngredients,
  useInventory,
  useMenuItems,
  useOrders,
} from "../_lib/hooks";
import {
  Ingredient,
  MenuItem,
  Order,
  formatQuantity,
  getInventoryStatus,
} from "../_lib/store";

type WeeklyBucket = {
  weekStart: Date;
  label: string;
  orders: number;
  guests: number;
};

export default function AnalyticsPage() {
  const [orders, , ordersHydrated] = useOrders();
  const [groceryLists] = useGroceryLists();
  const [clients] = useClients();
  const [menuItems] = useMenuItems();
  const [ingredients] = useIngredients();
  const [inventory] = useInventory();

  const groceryLookup = useMemo(
    () => new Map(groceryLists.map((g) => [g.id, g])),
    [groceryLists],
  );
  const menuLookup = useMemo(
    () => new Map(menuItems.map((m) => [m.id, m])),
    [menuItems],
  );
  const ingredientLookup = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );

  const totalGuests = useMemo(
    () => orders.reduce((sum, o) => sum + (o.guestCount ?? 0), 0),
    [orders],
  );

  const activeClients = useMemo(() => {
    const ids = new Set(orders.map((o) => o.clientId));
    return ids.size;
  }, [orders]);

  const ordersThisMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter((o) => {
      const d = new Date(o.eventDate || o.createdAt);
      return !Number.isNaN(d.getTime()) && d >= start;
    }).length;
  }, [orders]);

  const weekly: WeeklyBucket[] = useMemo(() => {
    const buckets: WeeklyBucket[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - day);

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(startOfThisWeek);
      weekStart.setDate(startOfThisWeek.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      let orderCount = 0;
      let guests = 0;
      for (const order of orders) {
        const d = new Date(order.eventDate || order.createdAt);
        if (Number.isNaN(d.getTime())) continue;
        if (d >= weekStart && d < weekEnd) {
          orderCount++;
          guests += order.guestCount ?? 0;
        }
      }
      buckets.push({
        weekStart,
        label: weekStart.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        orders: orderCount,
        guests,
      });
    }
    return buckets;
  }, [orders]);

  const maxWeekly = Math.max(1, ...weekly.map((b) => b.orders));

  const topDishes = useMemo(() => {
    const counts = new Map<string, { menuItem: MenuItem; uses: number; pax: number }>();
    for (const order of orders) {
      const list = groceryLookup.get(order.groceryListId);
      if (!list) continue;
      for (const menuItemId of list.order.selectedMenuItemIds) {
        const menuItem = menuLookup.get(menuItemId);
        if (!menuItem) continue;
        const existing = counts.get(menuItemId);
        if (existing) {
          existing.uses += 1;
          existing.pax += order.guestCount ?? 0;
        } else {
          counts.set(menuItemId, {
            menuItem,
            uses: 1,
            pax: order.guestCount ?? 0,
          });
        }
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.uses - a.uses || b.pax - a.pax)
      .slice(0, 6);
  }, [orders, groceryLookup, menuLookup]);

  const topIngredients = useMemo(() => {
    type Agg = { ingredient: Ingredient; total: number; orders: number };
    const totals = new Map<string, Agg>();
    for (const order of orders) {
      const list = groceryLookup.get(order.groceryListId);
      if (!list) continue;
      const seenInThisOrder = new Set<string>();
      for (const line of list.lines) {
        const ing =
          ingredientLookup.get(line.ingredientId) ??
          ({
            id: line.ingredientId,
            name: line.ingredientName,
            unit: line.unit,
            category: line.category,
          } as Ingredient);
        const existing = totals.get(line.ingredientId);
        if (existing) {
          existing.total += line.totalQuantity;
          if (!seenInThisOrder.has(line.ingredientId)) {
            existing.orders += 1;
            seenInThisOrder.add(line.ingredientId);
          }
        } else {
          totals.set(line.ingredientId, {
            ingredient: ing,
            total: line.totalQuantity,
            orders: 1,
          });
          seenInThisOrder.add(line.ingredientId);
        }
      }
    }
    return Array.from(totals.values())
      .sort((a, b) => b.orders - a.orders || b.total - a.total)
      .slice(0, 6);
  }, [orders, groceryLookup, ingredientLookup]);

  const inventoryHealth = useMemo(() => {
    const buckets = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    for (const rec of inventory) {
      buckets[getInventoryStatus(rec)]++;
    }
    return buckets;
  }, [inventory]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const aDate = a.eventDate || a.createdAt;
        const bDate = b.eventDate || b.createdAt;
        return bDate.localeCompare(aDate);
      })
      .slice(0, 5);
  }, [orders]);

  const showEmpty = ordersHydrated && orders.length === 0;

  return (
    <>
      <TopBar />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {showEmpty ? (
            <EmptyState />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  label="Total orders"
                  value={orders.length}
                  hint={`${ordersThisMonth} this month`}
                  icon={<OrdersIcon className="h-4 w-4" />}
                  accent="green"
                />
                <KpiCard
                  label="Guests served"
                  value={totalGuests}
                  hint={
                    orders.length > 0
                      ? `${Math.round(totalGuests / orders.length)} avg / event`
                      : "no orders yet"
                  }
                  icon={<UsersIcon className="h-4 w-4" />}
                  accent="violet"
                />
                <KpiCard
                  label="Active clients"
                  value={activeClients}
                  hint={`${clients.length} total in directory`}
                  icon={<ClientsIcon className="h-4 w-4" />}
                  accent="blue"
                />
                <KpiCard
                  label="Menu items"
                  value={menuItems.length}
                  hint={`${ingredients.length} ingredients`}
                  icon={<MenuItemsIcon className="h-4 w-4" />}
                  accent="amber"
                />
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <header className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      Orders trend
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Last 8 weeks &mdash; orders and pax served per week.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <TrendingUpIcon className="h-3.5 w-3.5" />
                    {weekly[weekly.length - 1].orders} this week
                  </span>
                </header>
                <div className="mt-6 grid grid-cols-8 gap-3">
                  {weekly.map((bucket) => {
                    const heightPct =
                      bucket.orders === 0
                        ? 4
                        : Math.max(
                            8,
                            Math.round((bucket.orders / maxWeekly) * 100),
                          );
                    return (
                      <div
                        key={bucket.weekStart.toISOString()}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="flex h-32 w-full items-end">
                          <div
                            className={`w-full rounded-t-md transition-all ${
                              bucket.orders === 0
                                ? "bg-zinc-100"
                                : "bg-green-500"
                            }`}
                            style={{ height: `${heightPct}%` }}
                            title={`${bucket.orders} order${bucket.orders === 1 ? "" : "s"}, ${bucket.guests} pax`}
                          />
                        </div>
                        <p className="text-[10px] font-medium text-zinc-700">
                          {bucket.orders}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {bucket.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TopDishesCard items={topDishes} />
                <TopIngredientsCard items={topIngredients} />
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <InventoryHealthCard
                  buckets={inventoryHealth}
                  total={inventory.length}
                />
                <RecentOrdersCard orders={recentOrders} />
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Analytics</h1>
        <p className="text-xs text-zinc-500">
          A live snapshot of your catering business.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          New order
        </Link>
        <button
          type="button"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <HelpIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="text-zinc-500 hover:text-zinc-900"
        >
          <BellIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent: "green" | "violet" | "blue" | "amber";
}) {
  const palette = {
    green: "bg-green-50 text-green-700",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  }[accent];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${palette}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function TopDishesCard({
  items,
}: {
  items: { menuItem: MenuItem; uses: number; pax: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.uses));
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Top dishes</h2>
          <p className="text-xs text-zinc-500">
            Most-requested items across all orders.
          </p>
        </div>
        <Link
          href="/menu-items"
          className="text-xs font-medium text-green-700 hover:text-green-800"
        >
          View menu
        </Link>
      </header>
      {items.length === 0 ? (
        <p className="mt-6 text-center text-xs text-zinc-400">
          No order history yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((row, idx) => {
            const widthPct = Math.max(8, (row.uses / max) * 100);
            return (
              <li key={row.menuItem.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {row.menuItem.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {row.menuItem.category}
                    </span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    {row.uses} order{row.uses === 1 ? "" : "s"} ·{" "}
                    {row.pax} pax
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TopIngredientsCard({
  items,
}: {
  items: { ingredient: Ingredient; total: number; orders: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.orders));
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Top ingredients
          </h2>
          <p className="text-xs text-zinc-500">
            Most-purchased ingredients by order frequency.
          </p>
        </div>
        <Link
          href="/ingredients"
          className="text-xs font-medium text-green-700 hover:text-green-800"
        >
          View all
        </Link>
      </header>
      {items.length === 0 ? (
        <p className="mt-6 text-center text-xs text-zinc-400">
          No ingredient data yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((row, idx) => {
            const widthPct = Math.max(8, (row.orders / max) * 100);
            return (
              <li key={row.ingredient.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {row.ingredient.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {row.ingredient.category}
                    </span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    {row.orders} order{row.orders === 1 ? "" : "s"} ·{" "}
                    {formatQuantity(row.total, row.ingredient.unit)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function InventoryHealthCard({
  buckets,
  total,
}: {
  buckets: { in_stock: number; low_stock: number; out_of_stock: number };
  total: number;
}) {
  const segments: Array<{
    key: keyof typeof buckets;
    label: string;
    value: number;
    color: string;
    text: string;
  }> = [
    { key: "in_stock", label: "In stock", value: buckets.in_stock, color: "bg-green-500", text: "text-green-700" },
    { key: "low_stock", label: "Low", value: buckets.low_stock, color: "bg-amber-500", text: "text-amber-700" },
    { key: "out_of_stock", label: "Out", value: buckets.out_of_stock, color: "bg-red-500", text: "text-red-700" },
  ];
  const denom = total === 0 ? 1 : total;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Inventory health
          </h2>
          <p className="text-xs text-zinc-500">
            {total} ingredient{total === 1 ? "" : "s"} tracked
          </p>
        </div>
        <Link
          href="/inventory"
          className="text-xs font-medium text-green-700 hover:text-green-800"
        >
          Manage
        </Link>
      </header>

      {total === 0 ? (
        <p className="mt-6 text-center text-xs text-zinc-400">
          Track ingredients in inventory to see health.
        </p>
      ) : (
        <>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-zinc-100">
            {segments.map((seg) =>
              seg.value === 0 ? null : (
                <div
                  key={seg.key}
                  className={seg.color}
                  style={{ width: `${(seg.value / denom) * 100}%` }}
                  title={`${seg.label}: ${seg.value}`}
                />
              ),
            )}
          </div>

          <ul className="mt-5 space-y-2">
            {segments.map((seg) => (
              <li
                key={seg.key}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${seg.color}`}
                    aria-hidden
                  />
                  <span className="text-zinc-700">{seg.label}</span>
                </span>
                <span className={`text-xs font-semibold ${seg.text}`}>
                  {seg.value} ({Math.round((seg.value / denom) * 100)}%)
                </span>
              </li>
            ))}
          </ul>

          {buckets.out_of_stock + buckets.low_stock > 0 ? (
            <Link
              href="/inventory?filter=low"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
            >
              <AlertIcon className="h-3.5 w-3.5" />
              Restock {buckets.out_of_stock + buckets.low_stock} item
              {buckets.out_of_stock + buckets.low_stock === 1 ? "" : "s"}
            </Link>
          ) : (
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">
              <BoxIcon className="h-3.5 w-3.5" />
              Pantry is fully stocked
            </p>
          )}
        </>
      )}
    </div>
  );
}

function RecentOrdersCard({ orders }: { orders: Order[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Recent orders
          </h2>
          <p className="text-xs text-zinc-500">Latest 5 by event date.</p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-medium text-green-700 hover:text-green-800"
        >
          View all
        </Link>
      </header>
      {orders.length === 0 ? (
        <p className="mt-6 text-center text-xs text-zinc-400">
          No orders to display.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-zinc-100">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={
                  order.groceryListId
                    ? `/grocery-lists/${order.groceryListId}`
                    : "/orders"
                }
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-zinc-50/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {order.eventName || "Catering order"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    <ClientsIcon className="h-3 w-3" />
                    {order.clientName || "Unknown client"}
                    <span className="text-zinc-300">·</span>
                    <CalendarIcon className="h-3 w-3" />
                    {formatDate(order.eventDate) || "Date pending"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700">
                  {order.guestCount} pax
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <AnalyticsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No orders to analyze yet
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
        Once you save your first catering order, this dashboard fills up with
        trends, top dishes, and pantry health.
      </p>
      <Link
        href="/orders/new"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        <PlusIcon className="h-4 w-4" />
        Create your first order
      </Link>
    </div>
  );
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
