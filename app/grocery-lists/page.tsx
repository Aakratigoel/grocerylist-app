"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BasketIcon,
  BellIcon,
  ChefHatIcon,
  GroceryListsIcon,
  HelpIcon,
  PlusIcon,
  TrashIcon,
} from "../_components/icons";
import { useGroceryLists, useHouseholdLists } from "../_lib/hooks";
import { GroceryList, HouseholdGroceryList } from "../_lib/store";

type Card =
  | { kind: "catering"; data: GroceryList; sortDate: string }
  | { kind: "household"; data: HouseholdGroceryList; sortDate: string };

export default function GroceryListsPage() {
  const [cateringLists, setCateringLists, cateringHydrated] = useGroceryLists();
  const [householdLists, setHouseholdLists, householdHydrated] =
    useHouseholdLists();

  const hydrated = cateringHydrated && householdHydrated;

  const cards = useMemo<Card[]>(() => {
    const result: Card[] = [
      ...cateringLists.map((data) => ({
        kind: "catering" as const,
        data,
        sortDate: data.createdAt,
      })),
      ...householdLists.map((data) => ({
        kind: "household" as const,
        data,
        sortDate: data.updatedAt || data.createdAt,
      })),
    ];
    result.sort(
      (a, b) =>
        new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
    );
    return result;
  }, [cateringLists, householdLists]);

  const handleDeleteCatering = (id: string) => {
    setCateringLists(cateringLists.filter((l) => l.id !== id));
  };

  const handleDeleteHousehold = (id: string) => {
    setHouseholdLists(householdLists.filter((l) => l.id !== id));
  };

  return (
    <>
      <TopBar />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl">
          {hydrated && cards.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) =>
                card.kind === "catering" ? (
                  <CateringCard
                    key={card.data.id}
                    list={card.data}
                    onDelete={() => handleDeleteCatering(card.data.id)}
                  />
                ) : (
                  <HouseholdCard
                    key={card.data.id}
                    list={card.data}
                    onDelete={() => handleDeleteHousehold(card.data.id)}
                  />
                ),
              )}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function CateringCard({
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
                <ChefHatIcon className="h-3 w-3" />
                Catering
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-base font-semibold text-zinc-900">
              {list.order.eventName || "Catering order"}
            </h3>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {list.order.clientName} · {list.order.guestCount} pax
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

function HouseholdCard({
  list,
  onDelete,
}: {
  list: HouseholdGroceryList;
  onDelete: () => void;
}) {
  const total = list.items.length;
  const picked = list.items.filter((it) => it.picked).length;
  const remaining = total - picked;
  return (
    <li>
      <Link
        href={`/grocery-lists/household/${list.id}`}
        className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                <BasketIcon className="h-3 w-3" />
                Household
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-base font-semibold text-zinc-900">
              {list.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {total} item{total === 1 ? "" : "s"}
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
              Remaining
            </dt>
            <dd className="text-base font-semibold">{remaining}</dd>
          </div>
          <div className="rounded-lg bg-violet-50 px-3 py-2 text-violet-800">
            <dt className="text-[11px] font-medium uppercase tracking-wide">
              Picked
            </dt>
            <dd className="text-base font-semibold">{picked}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-zinc-400">
          Saved {formatRelativeDate(list.updatedAt || list.createdAt)}
        </p>
      </Link>
    </li>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Grocery Lists</h1>
        <p className="text-xs text-zinc-500">
          Saved catering and household lists.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/grocery-lists/new"
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
        >
          <BasketIcon className="h-4 w-4" />
          New household list
        </Link>
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

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-700">
        <GroceryListsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No saved grocery lists yet
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Build a household list or create a catering order, then save a snapshot
        to revisit anytime.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/grocery-lists/new"
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
        >
          <BasketIcon className="h-4 w-4" />
          New household list
        </Link>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          New catering order
        </Link>
      </div>
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
