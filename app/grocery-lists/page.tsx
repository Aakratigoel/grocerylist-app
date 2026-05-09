"use client";

import Link from "next/link";
import { useMemo } from "react";
import { NEW_GROCERY_LIST_START_HREF } from "../orders/new/_wizard";
import {
  BellIcon,
  BasketIcon,
  GroceryListsIcon,
  HelpIcon,
  PlusIcon,
  TrashIcon,
} from "../_components/icons";
import { useGroceryLists } from "../_lib/hooks";
import { GroceryList } from "../_lib/store";

export default function GroceryListsPage() {
  const [savedLists, setSavedLists, hydrated] = useGroceryLists();

  const lists = useMemo(
    () =>
      [...savedLists].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [savedLists],
  );

  const handleDelete = (id: string) => {
    setSavedLists(savedLists.filter((l) => l.id !== id));
  };

  return (
    <>
      <TopBar />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {hydrated && lists.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lists.map((list) => (
                <GroceryListCard
                  key={list.id}
                  list={list}
                  onDelete={() => handleDelete(list.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function GroceryListCard({
  list,
  onDelete,
}: {
  list: GroceryList;
  onDelete: () => void;
}) {
  const toBuy = list.lines.filter((l) => !l.inStock).length;
  return (
    <li>
      <Link
        href={`/grocery-lists/${list.id}`}
        className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                <BasketIcon className="h-3 w-3" />
                Saved list
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-base font-semibold text-zinc-900">
              {list.order.eventName || "Grocery list"}
            </h3>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {list.order.clientName} · {list.order.guestCount} servings
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            aria-label="Delete grocery list"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
            <dt className="text-[11px] font-medium uppercase tracking-wide">
              To buy
            </dt>
            <dd className="text-base font-semibold">{toBuy}</dd>
          </div>
          <div className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
            <dt className="text-[11px] font-medium uppercase tracking-wide">
              In stock
            </dt>
            <dd className="text-base font-semibold">
              {list.lines.length - toBuy}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-zinc-400">
          Saved {formatRelativeDate(list.createdAt)}
        </p>
      </Link>
    </li>
  );
}

function TopBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 pl-14 sm:flex-nowrap sm:px-8 sm:py-5 sm:pl-8 lg:px-10">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Grocery Lists</h1>
        <p className="text-xs text-zinc-500">
          Every list you finish and save appears here.
        </p>
      </div>
      <div className="flex items-center gap-3">
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

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <GroceryListsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No saved grocery lists yet
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Start a list from Orders, pick your dishes, then save — it will show
        up here.
      </p>
      <Link
        href={NEW_GROCERY_LIST_START_HREF}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        <PlusIcon className="h-4 w-4" />
        New grocery list
      </Link>
    </div>
  );
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
