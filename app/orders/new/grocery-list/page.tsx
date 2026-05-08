"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AddListItemForm } from "../../../_components/add-list-item-form";
import {
  ChevronLeftIcon,
  DownloadIcon,
  PlusIcon,
  SaveIcon,
  ShareIcon,
  TrashIcon,
} from "../../../_components/icons";
import {
  useClients,
  useDraftOrder,
  useGroceryLists,
  useIngredients,
  useMenuItems,
  useOrders,
} from "../../../_lib/hooks";
import {
  GroceryList,
  GroceryListLine,
  IngredientCategory,
  Order,
  aggregateGroceryLines,
  clearDraftOrder,
  formatQuantity,
  generateId,
  upsertClientByName,
} from "../../../_lib/store";

export default function GroceryListStep() {
  const router = useRouter();
  const [draft, setDraft, draftHydrated] = useDraftOrder();
  const [menuItems] = useMenuItems();
  const [ingredients] = useIngredients();
  const [groceryLists, setGroceryLists] = useGroceryLists();
  const [clients, setClients] = useClients();
  const [orders, setOrders] = useOrders();
  const [toast, setToast] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!draftHydrated) return;
    if (draft.selectedMenuItemIds.length === 0) {
      router.replace("/orders/new/menu-items");
    }
  }, [draftHydrated, draft.selectedMenuItemIds.length, router]);

  const selectedMenuItems = useMemo(
    () => menuItems.filter((m) => draft.selectedMenuItemIds.includes(m.id)),
    [menuItems, draft.selectedMenuItemIds],
  );

  const derivedLines = useMemo(
    () =>
      aggregateGroceryLines(
        selectedMenuItems,
        draft.guestCount,
        ingredients,
        new Set(draft.inStockIngredientIds),
      ),
    [selectedMenuItems, draft.guestCount, ingredients, draft.inStockIngredientIds],
  );

  const lines = useMemo(() => {
    return [...derivedLines, ...draft.extraItems].sort((a, b) => {
      if (a.category === b.category)
        return a.ingredientName.localeCompare(b.ingredientName);
      return a.category.localeCompare(b.category);
    });
  }, [derivedLines, draft.extraItems]);

  const toBuy = useMemo(() => lines.filter((l) => !l.inStock), [lines]);
  const inStock = useMemo(() => lines.filter((l) => l.inStock), [lines]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const handleAddExtra = (line: GroceryListLine) => {
    setDraft({ ...draft, extraItems: [...draft.extraItems, line] });
    setShowAddForm(false);
    showToast(`Added ${line.ingredientName}`);
  };

  const handleRemoveExtra = (ingredientId: string) => {
    setDraft({
      ...draft,
      extraItems: draft.extraItems.filter(
        (l) => l.ingredientId !== ingredientId,
      ),
    });
  };

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, typeof lines>();
    for (const line of toBuy) {
      const list = map.get(line.category) ?? [];
      list.push(line);
      map.set(line.category, list);
    }
    return map;
  }, [toBuy]);

  const buildList = (): GroceryList => ({
    id: generateId("list"),
    createdAt: new Date().toISOString(),
    order: draft,
    lines,
  });

  const handleSave = () => {
    const list = buildList();

    const { clients: nextClients, client } = upsertClientByName(
      clients,
      draft.clientName || "Unknown client",
    );

    const order: Order = {
      id: generateId("order"),
      clientId: client.id,
      clientName: client.name,
      eventName: draft.eventName,
      eventDate: draft.eventDate,
      guestCount: draft.guestCount,
      eventTime: draft.eventTime,
      venue: draft.venue,
      notes: draft.notes,
      status: "completed",
      createdAt: new Date().toISOString(),
      groceryListId: list.id,
    };

    setGroceryLists([list, ...groceryLists]);
    if (nextClients !== clients) setClients(nextClients);
    setOrders([order, ...orders]);
    clearDraftOrder();
    router.push(`/grocery-lists/${list.id}`);
  };

  const handleShare = async () => {
    const list = buildList();
    const text = renderListAsText(list);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Grocery list — ${draft.eventName || "Order"}`,
          text,
        });
        return;
      } catch {
        // user cancelled or share failed; fall through to clipboard
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
    const list = buildList();
    const csv = renderListAsCsv(list);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(draft.eventName || "grocery-list")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Your grocery list
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {toBuy.length} items to buy for{" "}
                <span className="font-medium text-zinc-700">
                  {draft.eventName || "your event"}
                </span>{" "}
                · {draft.guestCount} pax
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
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Generated
              </span>
            </div>
          </div>

          {showAddForm ? (
            <div className="mt-5">
              <AddListItemForm
                ingredients={ingredients}
                onAdd={handleAddExtra}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : null}

          {toBuy.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-green-300 bg-green-50/60 p-8 text-center">
              <p className="text-sm font-semibold text-green-800">
                Nothing to buy — you have everything in stock!
              </p>
              <p className="mt-1 text-xs text-green-700">
                Save this order so you have a record of the inventory used.
              </p>
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
                          <span className="flex h-2 w-2 rounded-full bg-amber-500" />
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
                                handleRemoveExtra(line.ingredientId)
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
                    <span>{formatQuantity(line.totalQuantity, line.unit)}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-semibold text-zinc-900">Actions</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Save this list, share it with your team, or download a copy.
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800"
              >
                <SaveIcon className="h-4 w-4" />
                Save grocery list
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <Link
              href="/orders/new/review"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to review
            </Link>
          </div>
        </aside>
      </div>

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

function renderListAsText(list: GroceryList): string {
  const header = [
    `Grocery list — ${list.order.eventName || "Order"}`,
    `Client: ${list.order.clientName} · ${list.order.guestCount} pax`,
    list.order.eventDate ? `Event date: ${list.order.eventDate}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const items = list.lines
    .filter((line) => !line.inStock)
    .map((line) => `• ${line.ingredientName} — ${formatQuantity(line.totalQuantity, line.unit)}`)
    .join("\n");
  return `${header}\n\nTo buy:\n${items}`;
}

function renderListAsCsv(list: GroceryList): string {
  const escape = (value: string) =>
    `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["Ingredient", "Category", "Quantity", "Unit", "Status"].map(escape).join(","),
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
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "grocery-list";
}
