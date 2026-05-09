"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { NEW_GROCERY_LIST_START_HREF } from "../../orders/new/_wizard";
import { useEffect, useMemo, useState } from "react";
import { AddListItemForm } from "../../_components/add-list-item-form";
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  HelpIcon,
  MapPinIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from "../../_components/icons";
import { useGroceryLists, useIngredients } from "../../_lib/hooks";
import {
  GroceryList,
  GroceryListLine,
  IngredientCategory,
  formatQuantity,
  mergeGroceryLinesDedup,
  sortGroceryLines,
} from "../../_lib/store";

export default function GroceryListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lists, setLists, hydrated] = useGroceryLists();
  const [ingredients] = useIngredients();
  const [toast, setToast] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const list = useMemo(
    () => lists.find((l) => l.id === params.id) ?? null,
    [lists, params.id],
  );

  const blockedIngredientIds = useMemo(() => {
    if (!list) return new Set<string>();
    return new Set(list.lines.map((l) => l.ingredientId));
  }, [list]);

  const blockedNamesLower = useMemo(() => {
    if (!list) return new Set<string>();
    return new Set(
      list.lines
        .map((l) => l.ingredientName.trim().toLowerCase())
        .filter(Boolean),
    );
  }, [list]);

  const grouped = useMemo(() => {
    if (!list) return new Map<IngredientCategory, GroceryList["lines"]>();
    const map = new Map<IngredientCategory, GroceryList["lines"]>();
    for (const line of list.lines.filter((l) => !l.inStock)) {
      const existing = map.get(line.category) ?? [];
      existing.push(line);
      map.set(line.category, existing);
    }
    return map;
  }, [list]);

  useEffect(() => {
    const current = lists.find((l) => l.id === params.id);
    if (!current) return;
    const normalized = sortGroceryLines(mergeGroceryLinesDedup(current.lines));
    const fingerprint = (xs: GroceryListLine[]) =>
      JSON.stringify(
        xs.map((l) => ({
          id: l.ingredientId,
          q: l.totalQuantity,
          n: l.ingredientName.trim().toLowerCase(),
          u: String(l.unit).trim().toLowerCase(),
        })),
      );
    if (fingerprint(normalized) === fingerprint(current.lines)) return;
    setLists(
      lists.map((l) =>
        l.id === current.id ? { ...l, lines: normalized } : l,
      ),
    );
  }, [lists, params.id, setLists]);

  useEffect(() => {
    if (!hydrated) return;
    const id = params.id;
    if (!id || !lists.some((l) => l.id === id)) return;
    try {
      if (sessionStorage.getItem("gl-just-saved-list") !== id) return;
      sessionStorage.removeItem("gl-just-saved-list");
      setToast("List saved. Share or download from this screen anytime.");
      const hide = window.setTimeout(() => setToast(null), 3400);
      return () => window.clearTimeout(hide);
    } catch {
      /* private mode etc. */
    }
  }, [hydrated, params.id, lists]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  if (!hydrated) {
    return (
      <>
        <TopBar title="Grocery list" />
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
          <div className="mx-auto max-w-6xl text-sm text-zinc-500">
            Loading…
          </div>
        </main>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <TopBar title="Grocery list" />
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center sm:p-12">
            <h2 className="text-lg font-semibold text-zinc-900">
              Grocery list not found
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              It may have been deleted, or this link is for a different device.
            </p>
            <Link
              href="/grocery-lists"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Back to grocery lists
            </Link>
          </div>
        </main>
      </>
    );
  }

  const toBuy = list.lines.filter((l) => !l.inStock);
  const inStock = list.lines.filter((l) => l.inStock);

  const handleShare = async () => {
    const text = renderListAsText(list);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Grocery list — ${list.order.eventName}`,
          text,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
        return;
      } catch {
        // user cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Grocery list copied to clipboard");
    } catch {
      showToast("Could not share. Try downloading instead.");
    }
  };

  const handleDownload = () => {
    const csv = renderListAsCsv(list);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(list.order.eventName || "grocery-list")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
  };

  const handleDelete = () => {
    setLists(lists.filter((l) => l.id !== list.id));
    router.push("/grocery-lists");
  };

  const updateList = (next: GroceryList) => {
    setLists(lists.map((l) => (l.id === next.id ? next : l)));
  };

  const handleAddItem = (line: GroceryListLine) => {
    const sorted = sortGroceryLines(
      mergeGroceryLinesDedup([...list.lines, line]),
    );
    updateList({ ...list, lines: sorted });
    setShowAddForm(false);
    showToast(`Added ${line.ingredientName}`);
  };

  const handleRemoveLine = (ingredientId: string) => {
    updateList({
      ...list,
      lines: list.lines.filter((l) => l.ingredientId !== ingredientId),
    });
  };

  return (
    <>
      <TopBar title={list.order.eventName || "Grocery list"} />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7 lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {list.order.eventName || "Grocery list"}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {toBuy.length} items to buy ·{" "}
                    {list.order.guestCount} servings · saved{" "}
                    {formatRelativeDate(list.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!showAddForm ? (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add item
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleDelete}
                    aria-label="Delete grocery list"
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {showAddForm ? (
                <div className="mt-5">
                  <AddListItemForm
                    ingredients={ingredients}
                    blockedIngredientIds={blockedIngredientIds}
                    blockedNamesLower={blockedNamesLower}
                    onAdd={handleAddItem}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  icon={<UserIcon className="h-4 w-4" />}
                  label="For"
                  value={list.order.clientName}
                />
                <DetailRow
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Event date"
                  value={formatDate(list.order.eventDate)}
                />
                <DetailRow
                  icon={<ClockIcon className="h-4 w-4" />}
                  label="Time"
                  value={formatTime(list.order.eventTime)}
                />
                <DetailRow
                  icon={<MapPinIcon className="h-4 w-4" />}
                  label="Location"
                  value={list.order.venue || "—"}
                />
              </div>

              {toBuy.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-green-300 bg-green-50/60 p-6 text-center text-sm text-green-800">
                  Everything was already in stock for this order.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {Array.from(grouped.entries()).map(([category, rows]) => (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {category}
                        </h3>
                        <span className="text-xs text-zinc-400">
                          {rows.length} items
                        </span>
                      </div>
                      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                        {rows.map((line) => (
                          <li
                            key={line.ingredientId}
                            className="flex items-center justify-between px-4 py-3 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-zinc-900">
                                {line.ingredientName}
                              </span>
                              {line.custom ? (
                                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700">
                                  Custom
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-900">
                                {formatQuantity(line.totalQuantity, line.unit)}
                              </span>
                              {line.custom ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveLine(line.ingredientId)
                                  }
                                  aria-label={`Remove ${line.ingredientName}`}
                                  className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {inStock.length > 0 ? (
                <details className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-700">
                    {inStock.length} items already in stock
                  </summary>
                  <ul className="divide-y divide-zinc-100 px-4 pb-3 text-sm text-zinc-500">
                    {inStock.map((line) => (
                      <li
                        key={line.ingredientId}
                        className="flex justify-between py-2"
                      >
                        <span>{line.ingredientName}</span>
                        <span>
                          {formatQuantity(line.totalQuantity, line.unit)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>

            <aside className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold text-zinc-900">
                Share this list
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Send to your team or download a copy for shopping.
              </p>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800"
                >
                  <ShareIcon className="h-4 w-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download CSV
                </button>
                <Link
                  href={NEW_GROCERY_LIST_START_HREF}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
                >
                  <PlusIcon className="h-4 w-4" />
                  New grocery list
                </Link>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Your draft is cleared after save. Lists stay here under{" "}
                  <Link
                    href="/grocery-lists"
                    className="font-medium text-green-700 hover:text-green-800"
                  >
                    Grocery Lists
                  </Link>
                  ; use Home when you&apos;re finished.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 pl-14 sm:flex-nowrap sm:px-8 sm:py-5 sm:pl-8 lg:px-10">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/grocery-lists"
          className="text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Grocery Lists
        </Link>
        <ChevronRightIcon className="h-4 w-4 text-zinc-300" />
        <span className="font-semibold text-zinc-900">{title}</span>
      </nav>
      <div className="flex items-center gap-3">
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-500">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <p className="text-sm font-medium text-zinc-900">{value || "—"}</p>
      </div>
    </div>
  );
}

function renderListAsText(list: GroceryList): string {
  const header = [
    `Grocery list — ${list.order.eventName || "Order"}`,
    `For: ${list.order.clientName} · ${list.order.guestCount} servings`,
    list.order.eventDate ? `Date: ${list.order.eventDate}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const items = list.lines
    .filter((line) => !line.inStock)
    .map(
      (line) =>
        `• ${line.ingredientName} — ${formatQuantity(line.totalQuantity, line.unit)}`,
    )
    .join("\n");
  return `${header}\n\nTo buy:\n${items}`;
}

function renderListAsCsv(list: GroceryList): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["Ingredient", "Category", "Quantity", "Unit", "Status"]
      .map(escape)
      .join(","),
    ...list.lines.map((line) =>
      [
        escape(line.ingredientName),
        escape(line.category),
        String(line.totalQuantity),
        escape(line.unit),
        escape(line.inStock ? "In stock" : "To buy"),
      ].join(","),
    ),
  ];
  return rows.join("\n");
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "grocery-list"
  );
}

function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  if (!value) return "—";
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
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
