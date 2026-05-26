"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PAGE_HEADER_CLASS } from "../_lib/page-header-classes";
import { NEW_GROCERY_LIST_START_HREF } from "../orders/new/_wizard";
import {
  BellIcon,
  CalendarIcon,
  ClientsIcon,
  HelpIcon,
  PlusIcon,
} from "../_components/icons";
import { useClients, useOrders } from "../_lib/hooks";
import { Client, Order } from "../_lib/store";

export default function ClientsPage() {
  const [clients, , clientsHydrated] = useClients();
  const [orders] = useOrders();

  const ordersByClient = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      const list = map.get(order.clientId) ?? [];
      list.push(order);
      map.set(order.clientId, list);
    }
    return map;
  }, [orders]);

  const sorted = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  return (
    <>
      <TopBar />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {clientsHydrated && clients.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  orders={ordersByClient.get(client.id) ?? []}
                />
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className={`${PAGE_HEADER_CLASS} items-center`}>
      <div className="min-w-0 flex-1 pr-2 sm:flex-none sm:pr-0">
        <h1 className="text-base font-semibold text-zinc-900">Clients</h1>
        <p className="text-xs text-zinc-500">
          Auto-populated from the orders you create.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        <Link
          href={NEW_GROCERY_LIST_START_HREF}
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

function ClientCard({
  client,
  orders,
}: {
  client: Client;
  orders: Order[];
}) {
  const lastOrder = useMemo(() => {
    if (orders.length === 0) return null;
    return [...orders].sort((a, b) =>
      (b.eventDate || b.createdAt).localeCompare(a.eventDate || a.createdAt),
    )[0];
  }, [orders]);

  const totalGuests = orders.reduce((sum, o) => sum + o.guestCount, 0);
  const initials = client.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <li>
      <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <header className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
            {initials || "?"}
          </span>
          <div className="leading-tight">
            <h3 className="text-base font-semibold text-zinc-900">
              {client.name}
            </h3>
            <p className="text-xs text-zinc-500">
              Added {formatRelativeDate(client.createdAt)}
            </p>
          </div>
        </header>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Orders
            </dt>
            <dd className="text-base font-semibold text-zinc-900">
              {orders.length}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Total guests
            </dt>
            <dd className="text-base font-semibold text-zinc-900">
              {totalGuests}
            </dd>
          </div>
        </dl>

        {lastOrder ? (
          <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Most recent
            </p>
            <Link
              href={`/grocery-lists/${lastOrder.groceryListId}`}
              className="mt-1 block font-medium text-zinc-900 hover:text-green-700"
            >
              {lastOrder.eventName || "Grocery list"}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <CalendarIcon className="h-3.5 w-3.5" />
              {formatDate(lastOrder.eventDate) || "Date pending"}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-zinc-400">No orders yet.</p>
        )}
      </article>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <ClientsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No clients yet
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Clients are added automatically when you save the grocery list for an
        order.
      </p>
      <Link
        href={NEW_GROCERY_LIST_START_HREF}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        <PlusIcon className="h-4 w-4" />
        Create a new order
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

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
