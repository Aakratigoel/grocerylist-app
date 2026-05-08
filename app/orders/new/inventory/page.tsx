"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AddListItemForm } from "../../../_components/add-list-item-form";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  PlusIcon,
  TrashIcon,
} from "../../../_components/icons";
import { useDraftOrder, useIngredients, useMenuItems } from "../../../_lib/hooks";
import {
  GroceryListLine,
  IngredientCategory,
  aggregateGroceryLines,
  formatQuantity,
} from "../../../_lib/store";

export default function InventoryStep() {
  const router = useRouter();
  const [draft, setDraft, hydrated] = useDraftOrder();
  const [menuItems] = useMenuItems();
  const [ingredients] = useIngredients();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (draft.selectedMenuItemIds.length === 0) {
      router.replace("/orders/new/menu-items");
    }
  }, [hydrated, draft.selectedMenuItemIds.length, router]);

  const inStockIds = useMemo(
    () => new Set(draft.inStockIngredientIds),
    [draft.inStockIngredientIds],
  );

  const derivedLines = useMemo(() => {
    const selectedMenuItems = menuItems.filter((m) =>
      draft.selectedMenuItemIds.includes(m.id),
    );
    return aggregateGroceryLines(
      selectedMenuItems,
      draft.guestCount,
      ingredients,
      inStockIds,
    );
  }, [
    menuItems,
    ingredients,
    draft.selectedMenuItemIds,
    draft.guestCount,
    inStockIds,
  ]);

  const lines = useMemo(() => {
    return [...derivedLines, ...draft.extraItems].sort((a, b) => {
      if (a.category === b.category)
        return a.ingredientName.localeCompare(b.ingredientName);
      return a.category.localeCompare(b.category);
    });
  }, [derivedLines, draft.extraItems]);

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, GroceryListLine[]>();
    for (const line of lines) {
      const list = map.get(line.category) ?? [];
      list.push(line);
      map.set(line.category, list);
    }
    return map;
  }, [lines]);

  const toggle = (line: GroceryListLine) => {
    if (line.custom) {
      setDraft({
        ...draft,
        extraItems: draft.extraItems.map((extra) =>
          extra.ingredientId === line.ingredientId
            ? { ...extra, inStock: !extra.inStock }
            : extra,
        ),
      });
    } else {
      const next = new Set(inStockIds);
      if (next.has(line.ingredientId)) next.delete(line.ingredientId);
      else next.add(line.ingredientId);
      setDraft({ ...draft, inStockIngredientIds: Array.from(next) });
    }
  };

  const markAll = (inStock: boolean) => {
    setDraft({
      ...draft,
      inStockIngredientIds: inStock
        ? derivedLines.map((l) => l.ingredientId)
        : [],
      extraItems: draft.extraItems.map((extra) => ({ ...extra, inStock })),
    });
  };

  const handleAddExtra = (line: GroceryListLine) => {
    setDraft({ ...draft, extraItems: [...draft.extraItems, line] });
    setShowAddForm(false);
  };

  const handleRemoveExtra = (ingredientId: string) => {
    setDraft({
      ...draft,
      extraItems: draft.extraItems.filter(
        (l) => l.ingredientId !== ingredientId,
      ),
    });
  };

  const inStockCount = lines.filter((l) => l.inStock).length;
  const toBuyCount = lines.length - inStockCount;
  const customCount = draft.extraItems.length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Ingredients &amp; Inventory
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              We&apos;ve auto-calculated quantities for{" "}
              <span className="font-medium text-zinc-700">
                {draft.guestCount} pax
              </span>
              . Missing something? Add it manually below.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add ingredient
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => markAll(false)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => markAll(true)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              All in stock
            </button>
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

        <div className="mt-6 space-y-6">
          {Array.from(grouped.entries()).map(([category, rows]) => (
            <div key={category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {category}
              </h3>
              <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                {rows.map((line) => (
                  <li
                    key={line.ingredientId}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <input
                      id={`stock-${line.ingredientId}`}
                      type="checkbox"
                      checked={line.inStock}
                      onChange={() => toggle(line)}
                      className="h-4 w-4 rounded border-zinc-300 text-green-700 focus:ring-green-700"
                    />
                    <label
                      htmlFor={`stock-${line.ingredientId}`}
                      className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-zinc-900"
                    >
                      {line.ingredientName}
                      {line.custom ? (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700">
                          Custom
                        </span>
                      ) : null}
                    </label>
                    <span className="text-sm text-zinc-700">
                      {formatQuantity(line.totalQuantity, line.unit)}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        line.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {line.inStock ? "In stock" : "To buy"}
                    </span>
                    {line.custom ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveExtra(line.ingredientId)}
                        aria-label={`Remove ${line.ingredientName}`}
                        className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-zinc-900">Inventory check</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Toggle items you already have in your kitchen.
          </p>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
              <dt className="flex items-center gap-2 text-green-800">
                <ClipboardCheckIcon className="h-4 w-4" />
                In stock
              </dt>
              <dd className="font-semibold text-green-800">{inStockCount}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
              <dt className="flex items-center gap-2 text-amber-800">
                <ClipboardCheckIcon className="h-4 w-4" />
                To buy
              </dt>
              <dd className="font-semibold text-amber-800">{toBuyCount}</dd>
            </div>
            {customCount > 0 ? (
              <div className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3">
                <dt className="text-violet-800">Custom additions</dt>
                <dd className="font-semibold text-violet-800">{customCount}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Link
            href="/orders/new/menu-items"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => router.push("/orders/new/review")}
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Continue
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}
