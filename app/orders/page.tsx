"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BellIcon,
  CalendarIcon,
  HelpIcon,
  MapPinIcon,
  OrdersIcon,
  PlusIcon,
  UserIcon,
} from "../_components/icons";
import { useOrders } from "../_lib/hooks";
import { Order } from "../_lib/store";

export default function OrdersPage() {
  const [orders, , hydrated] = useOrders();

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aDate = a.eventDate || a.createdAt;
      const bDate = b.eventDate || b.createdAt;
      return bDate.localeCompare(aDate);
    });
  }, [orders]);

  return (
    <>
      <TopBar />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl">
          {hydrated && orders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <table className="min-w-full divide-y divide-zinc-100">
                <thead className="bg-zinc-50/60">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Event date</th>
                    <th className="px-6 py-3">Guests</th>
                    <th className="px-6 py-3">Saved</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {sorted.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
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
        <h1 className="text-base font-semibold text-zinc-900">Orders</h1>
        <p className="text-xs text-zinc-500">
          Every catering order with its event date and grocery list.
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

function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="transition-colors hover:bg-zinc-50/60">
      <td className="px-6 py-4">
        <Link
          href={`/grocery-lists/${order.groceryListId}`}
          className="block"
        >
          <p className="font-medium text-zinc-900 hover:text-green-700">
            {order.eventName || "Untitled event"}
          </p>
          {order.venue ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <MapPinIcon className="h-3.5 w-3.5" />
              {order.venue}
            </p>
          ) : null}
        </Link>
      </td>
      <td className="px-6 py-4">
        <Link
          href={`/clients`}
          className="inline-flex items-center gap-2 text-zinc-700 hover:text-green-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <UserIcon className="h-3.5 w-3.5" />
          </span>
          {order.clientName}
        </Link>
      </td>
      <td className="px-6 py-4 text-zinc-700">
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
          {formatDate(order.eventDate) || "—"}
        </span>
      </td>
      <td className="px-6 py-4 text-zinc-700">{order.guestCount} pax</td>
      <td className="px-6 py-4 text-xs text-zinc-500">
        {formatRelativeDate(order.createdAt)}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            order.status === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          {order.status === "completed" ? "Completed" : "Draft"}
        </span>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <OrdersIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No orders yet
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Orders show up here once you generate and save their grocery list.
      </p>
      <Link
        href="/orders/new"
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
