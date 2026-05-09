"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  PlusIcon,
  SearchIcon,
} from "../../../_components/icons";
import { useDraftOrder, useIngredients, useMenuItems } from "../../../_lib/hooks";
import {
  Ingredient,
  MenuItem,
  MenuItemCategory,
  readDraftOrder,
} from "../../../_lib/store";
import { menuItemsCatalogHrefFromWizard } from "../_wizard";

const MENU_CATEGORIES: MenuItemCategory[] = [
  "Starter",
  "Main",
  "Side",
  "Bread",
  "Dessert",
  "Beverage",
];

export default function SelectMenuItemsStep() {
  const router = useRouter();
  const [draft, setDraft, hydrated] = useDraftOrder();
  const [menuItems] = useMenuItems();
  const [ingredients] = useIngredients();
  const [search, setSearch] = useState("");

  const ingredientLookup = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return menuItems;
    const term = search.toLowerCase();
    return menuItems.filter((item) => item.name.toLowerCase().includes(term));
  }, [menuItems, search]);

  const grouped = useMemo(() => {
    const map = new Map<MenuItemCategory, MenuItem[]>();
    for (const cat of MENU_CATEGORIES) map.set(cat, []);
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  const selectedIds = useMemo(
    () => new Set(draft.selectedMenuItemIds),
    [draft.selectedMenuItemIds],
  );

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDraft({
      ...readDraftOrder(),
      selectedMenuItemIds: Array.from(next),
    });
  };

  const handleContinue = () => {
    if (selectedIds.size === 0) return;
    router.push("/orders/new/review");
  };

  const totalIngredients = useMemo(() => {
    const ids = new Set<string>();
    for (const id of selectedIds) {
      const item = menuItems.find((m) => m.id === id);
      if (!item) continue;
      for (const ing of item.ingredients) ids.add(ing.ingredientId);
    }
    return ids.size;
  }, [selectedIds, menuItems]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Select Menu Items
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Pick the dishes for this order. Ingredients will be auto-loaded
              and scaled to your guest count.
            </p>
          </div>
          <Link
            href={menuItemsCatalogHrefFromWizard("/orders/new/menu-items")}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:inline-flex"
          >
            <PlusIcon className="h-4 w-4" />
            Manage menu
          </Link>
        </div>

        <div className="relative mt-5">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </div>

        <div className="mt-6 space-y-6">
          {hydrated && menuItems.length === 0 ? (
            <EmptyMenu />
          ) : (
            MENU_CATEGORIES.map((category) => {
              const items = grouped.get(category) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        item={item}
                        selected={selectedIds.has(item.id)}
                        ingredientLookup={ingredientLookup}
                        onToggle={() => toggle(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <aside className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-semibold text-zinc-900">Selection</h3>
        <p className="mt-1 text-xs text-zinc-500">
          For{" "}
          <span className="font-medium text-zinc-700">
            {draft.guestCount || 0} servings
          </span>{" "}
          at{" "}
          <span className="font-medium text-zinc-700">
            {draft.eventName || "your list"}
          </span>
          .
        </p>

        <dl className="mt-5 space-y-3 rounded-xl bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Menu items</dt>
            <dd className="font-semibold text-zinc-900">{selectedIds.size}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Unique ingredients</dt>
            <dd className="font-semibold text-zinc-900">{totalIngredients}</dd>
          </div>
        </dl>

        {selectedIds.size > 0 ? (
          <ul className="mt-5 space-y-2 text-sm">
            {Array.from(selectedIds).map((id) => {
              const item = menuItems.find((m) => m.id === id);
              if (!item) return null;
              return (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2"
                >
                  <span className="truncate text-zinc-700">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="text-xs font-medium text-zinc-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 text-xs text-zinc-400">No menu items selected.</p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Link>
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedIds.size === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            Continue
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function MenuItemRow({
  item,
  selected,
  ingredientLookup,
  onToggle,
}: {
  item: MenuItem;
  selected: boolean;
  ingredientLookup: Map<string, Ingredient>;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-green-600 bg-green-50/50 ring-1 ring-green-600"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
          {item.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
              {item.description}
            </p>
          ) : null}
        </div>
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            selected
              ? "border-green-600 bg-green-600 text-white"
              : "border-zinc-300 bg-white"
          }`}
        >
          {selected ? <CheckIcon className="h-3 w-3" /> : null}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        {item.ingredients.length} ingredients ·{" "}
        {item.ingredients
          .slice(0, 3)
          .map((ing) => ingredientLookup.get(ing.ingredientId)?.name)
          .filter(Boolean)
          .join(", ")}
        {item.ingredients.length > 3 ? "…" : ""}
      </p>
    </button>
  );
}

function EmptyMenu() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <p className="text-sm font-medium text-zinc-900">
        Your menu is empty
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Save dishes with their ingredients first, then come back to start an
        order.
      </p>
      <Link
        href={menuItemsCatalogHrefFromWizard("/orders/new/menu-items")}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        <PlusIcon className="h-4 w-4" />
        Add menu items
      </Link>
    </div>
  );
}
