"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from "../../../_components/icons";
import { StockToggle } from "../../../_components/stock-toggle";
import { useDraftOrder, useIngredients, useMenuItems } from "../../../_lib/hooks";
import {
  aggregateGroceryLines,
  formatQuantity,
  groceryLineDedupKey,
  mergeGroceryLinesDedup,
  nextInStockIdsAfterSettingDedupLine,
  readDraftOrder,
  sortGroceryLines,
  type GroceryListLine,
} from "../../../_lib/store";

export default function ReviewStep() {
  const router = useRouter();
  const [draft, setDraft, hydrated] = useDraftOrder();
  const [menuItems] = useMenuItems();
  const [ingredients] = useIngredients();

  useEffect(() => {
    if (!hydrated) return;
    if (draft.selectedMenuItemIds.length === 0) {
      router.replace("/orders/new/menu-items");
    }
  }, [hydrated, draft.selectedMenuItemIds.length, router]);

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
    [
      selectedMenuItems,
      draft.guestCount,
      ingredients,
      draft.inStockIngredientIds,
    ],
  );

  const stockSources = useMemo(
    () => [...derivedLines, ...draft.extraItems],
    [derivedLines, draft.extraItems],
  );

  const lines = useMemo(
    () => sortGroceryLines(mergeGroceryLinesDedup(stockSources)),
    [stockSources],
  );

  const setIngredientStockFlag = (
    displayLine: GroceryListLine,
    nextInStock: boolean,
  ) => {
    const base = readDraftOrder();
    setDraft({
      ...base,
      inStockIngredientIds: nextInStockIdsAfterSettingDedupLine(
        base.inStockIngredientIds,
        displayLine,
        stockSources,
        nextInStock,
      ),
    });
  };

  const toBuyCount = lines.filter((l) => !l.inStock).length;
  const eventTimeLabel = formatTime(draft.eventTime);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Review your order
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Confirm the details before we generate your grocery list.
            </p>
          </div>
          <Link
            href="/orders/new"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Edit details
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReviewRow
            icon={<UserIcon className="h-4 w-4" />}
            label="For"
            value={draft.clientName || "—"}
          />
          <ReviewRow
            icon={<UserIcon className="h-4 w-4" />}
            label="List name"
            value={draft.eventName || "—"}
          />
          <ReviewRow
            icon={<CalendarIcon className="h-4 w-4" />}
            label="Date"
            value={formatDate(draft.eventDate)}
          />
          <ReviewRow
            icon={<ClockIcon className="h-4 w-4" />}
            label="Time"
            value={eventTimeLabel}
          />
          <ReviewRow
            icon={<UserIcon className="h-4 w-4" />}
            label="Servings / people"
            value={`${draft.guestCount}`}
          />
          <ReviewRow
            icon={<MapPinIcon className="h-4 w-4" />}
            label="Location"
            value={draft.venue || "—"}
          />
        </div>

        {draft.notes ? (
          <div className="mt-4 rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </p>
            <p className="mt-1 text-sm text-zinc-700">{draft.notes}</p>
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">
              Menu ({selectedMenuItems.length})
            </h3>
            <Link
              href="/orders/new/menu-items"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              Edit menu
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selectedMenuItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">
                    {item.category} · {item.ingredients.length} ingredients
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900">
              Ingredients ({lines.length})
            </h3>
            {draft.extraItems.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (
                    !window.confirm(
                      "Remove all ingredients you added with “Add item”? Menu-calculated lines stay.",
                    )
                  )
                    return;
                  setDraft({ ...readDraftOrder(), extraItems: [] });
                }}
                className="text-xs font-medium text-amber-800 underline decoration-amber-300 underline-offset-2 hover:text-amber-950"
              >
                Clear manual additions ({draft.extraItems.length})
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Quantities combine when the same ingredient appears across your
            selected dishes (one row per ingredient). Mark each line{" "}
            <span className="font-medium text-zinc-600">To buy</span> or{" "}
            <span className="font-medium text-zinc-600">In stock</span>; the
            grocery list only lists items to buy (
            <span className="font-medium text-zinc-700">{toBuyCount}</span>{" "}
            now).
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {lines.map((line) => (
              <li
                key={groceryLineDedupKey(line)}
                className="flex flex-col gap-2 rounded-lg border border-zinc-100 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={
                      line.inStock
                        ? "text-zinc-400 line-through"
                        : "text-zinc-900"
                    }
                  >
                    {line.ingredientName}
                  </span>
                  {line.custom ? (
                    <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700">
                      Custom
                    </span>
                  ) : null}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-end">
                  <StockToggle
                    inStock={line.inStock}
                    onPick={(next) =>
                      setIngredientStockFlag(line, next)
                    }
                  />
                  <span
                    className={
                      line.inStock
                        ? "text-zinc-400 line-through tabular-nums"
                        : "font-medium tabular-nums text-zinc-900"
                    }
                  >
                    {formatQuantity(line.totalQuantity, line.unit)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-zinc-900">Ready to go?</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            We&apos;ll create a grocery list with{" "}
            <span className="font-medium text-zinc-700">{toBuyCount} items</span>{" "}
            that you still need to buy.
          </p>

          <button
            type="button"
            onClick={() => router.push("/orders/new/grocery-list")}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Generate grocery list
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5">
          <Link
            href="/orders/new/menu-items"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Link>
        </div>
      </aside>
    </div>
  );
}

function ReviewRow({
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
        <p className="text-sm font-medium text-zinc-900">{value}</p>
      </div>
    </div>
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
