"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertIcon,
  BellIcon,
  ChefHatIcon,
  EditIcon,
  HelpIcon,
  IngredientsIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "../_components/icons";
import { useIngredients, useInventory, useMenuItems } from "../_lib/hooks";
import {
  INGREDIENT_CATEGORIES,
  Ingredient,
  IngredientCategory,
  MenuItem,
  MenuItemCategory,
  UNITS,
  formatQuantity,
  generateId,
  getInventoryStatus,
} from "../_lib/store";
import { parseQuantityAndUnit } from "../_lib/parse-quantity-and-unit";

const MENU_ITEM_CATEGORY_ORDER: MenuItemCategory[] = [
  "Starter",
  "Main",
  "Side",
  "Bread",
  "Dessert",
  "Beverage",
];

function sortMenuItemsForPicker(items: MenuItem[]): MenuItem[] {
  return [...items].sort((a, b) => {
    const ia = MENU_ITEM_CATEGORY_ORDER.indexOf(a.category);
    const ib = MENU_ITEM_CATEGORY_ORDER.indexOf(b.category);
    if (ia !== ib) return ia - ib;
    return a.name.localeCompare(b.name);
  });
}

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; ingredient: Ingredient };

export default function IngredientsPage() {
  const [ingredients, setIngredients, hydrated] = useIngredients();
  const [menuItems, setMenuItems] = useMenuItems();
  const [inventory, setInventory] = useInventory();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    IngredientCategory | "all"
  >("all");
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [attachMenuIngredient, setAttachMenuIngredient] =
    useState<Ingredient | null>(null);

  const sortedMenuItems = useMemo(
    () => sortMenuItemsForPicker(menuItems),
    [menuItems],
  );

  const usageByIngredient = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of menuItems) {
      for (const ing of m.ingredients) {
        map.set(ing.ingredientId, (map.get(ing.ingredientId) ?? 0) + 1);
      }
    }
    return map;
  }, [menuItems]);

  const inventoryByIngredient = useMemo(
    () => new Map(inventory.map((rec) => [rec.ingredientId, rec])),
    [inventory],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ingredients.filter((ing) => {
      const matchesSearch = !term || ing.name.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" || ing.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [ingredients, search, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, Ingredient[]>();
    for (const cat of INGREDIENT_CATEGORIES) map.set(cat, []);
    for (const ing of filtered) {
      const list = map.get(ing.category) ?? [];
      list.push(ing);
      map.set(ing.category, list);
    }
    for (const [cat, list] of map) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      map.set(cat, list);
    }
    return map;
  }, [filtered]);

  const handleSave = (saved: Ingredient) => {
    if (dialog.kind === "edit") {
      setIngredients(
        ingredients.map((i) => (i.id === saved.id ? saved : i)),
      );
    } else {
      const duplicate = ingredients.find(
        (i) => i.name.toLowerCase() === saved.name.toLowerCase(),
      );
      if (duplicate) return;
      setIngredients([saved, ...ingredients]);
    }
    setDialog({ kind: "closed" });
  };

  function handleAddIngredientToMenu(
    menuItemId: string,
    quantityPerServing: number,
    ingredient: Ingredient,
  ) {
    if (!menuItemId) return;
    setMenuItems(
      menuItems.map((m) => {
        if (m.id !== menuItemId) return m;
        const idx = m.ingredients.findIndex(
          (row) => row.ingredientId === ingredient.id,
        );
        if (idx >= 0) {
          const next = [...m.ingredients];
          next[idx] = {
            ...next[idx],
            quantityPerServing,
          };
          return { ...m, ingredients: next };
        }
        return {
          ...m,
          ingredients: [
            ...m.ingredients,
            { ingredientId: ingredient.id, quantityPerServing },
          ],
        };
      }),
    );
    setAttachMenuIngredient(null);
  }

  const handleDelete = (ingredient: Ingredient) => {
    const usage = usageByIngredient.get(ingredient.id) ?? 0;
    const note =
      usage > 0
        ? `\n\nThis will also remove it from ${usage} menu item${usage === 1 ? "" : "s"}.`
        : "";
    if (!window.confirm(`Delete "${ingredient.name}"?${note}`)) return;
    setIngredients(ingredients.filter((i) => i.id !== ingredient.id));
    if (inventoryByIngredient.has(ingredient.id)) {
      setInventory(
        inventory.filter((rec) => rec.ingredientId !== ingredient.id),
      );
    }
  };

  const totalCount = ingredients.length;
  const usedCount = ingredients.filter(
    (i) => (usageByIngredient.get(i.id) ?? 0) > 0,
  ).length;
  const orphanCount = totalCount - usedCount;

  return (
    <>
      <TopBar
        searchValue={search}
        onSearchChange={setSearch}
        onAdd={() => setDialog({ kind: "create" })}
      />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              label="Total ingredients"
              value={totalCount}
              accent="green"
            />
            <StatCard
              label="Used in menu"
              value={usedCount}
              accent="violet"
              hint={`across ${menuItems.length} menu item${menuItems.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Unused"
              value={orphanCount}
              accent="amber"
              hint={orphanCount > 0 ? "consider trimming the catalog" : "every ingredient is in use"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              active={categoryFilter === "all"}
              label={`All · ${ingredients.length}`}
              onClick={() => setCategoryFilter("all")}
            />
            {INGREDIENT_CATEGORIES.map((cat) => {
              const count = ingredients.filter((i) => i.category === cat)
                .length;
              if (count === 0) return null;
              return (
                <FilterChip
                  key={cat}
                  active={categoryFilter === cat}
                  label={`${cat} · ${count}`}
                  onClick={() => setCategoryFilter(cat)}
                />
              );
            })}
          </div>

          {hydrated && ingredients.length === 0 ? (
            <EmptyState onAdd={() => setDialog({ kind: "create" })} />
          ) : filtered.length === 0 ? (
            <NoResults onClear={() => { setSearch(""); setCategoryFilter("all"); }} />
          ) : (
            <div className="space-y-6">
              {INGREDIENT_CATEGORIES.map((category) => {
                const items = grouped.get(category) ?? [];
                if (items.length === 0) return null;
                return (
                  <section
                    key={category}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <header className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60 px-5 py-3">
                      <h2 className="text-sm font-semibold text-zinc-900">
                        {category}
                      </h2>
                      <span className="text-xs text-zinc-500">
                        {items.length} ingredient{items.length === 1 ? "" : "s"}
                      </span>
                    </header>
                    <ul className="divide-y divide-zinc-100">
                      {items.map((ingredient) => (
                        <IngredientRow
                          key={ingredient.id}
                          ingredient={ingredient}
                          usageCount={usageByIngredient.get(ingredient.id) ?? 0}
                          inventoryRecord={inventoryByIngredient.get(
                            ingredient.id,
                          )}
                          onEdit={() =>
                            setDialog({ kind: "edit", ingredient })
                          }
                          onDelete={() => handleDelete(ingredient)}
                          onAddToMenu={() =>
                            setAttachMenuIngredient(ingredient)
                          }
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {dialog.kind !== "closed" ? (
        <IngredientDialog
          ingredients={ingredients}
          initial={dialog.kind === "edit" ? dialog.ingredient : null}
          onClose={() => setDialog({ kind: "closed" })}
          onSubmit={handleSave}
        />
      ) : null}

      {attachMenuIngredient ? (
        <AddIngredientToMenuModal
          key={attachMenuIngredient.id}
          ingredient={attachMenuIngredient}
          menuItems={sortedMenuItems}
          onClose={() => setAttachMenuIngredient(null)}
          onConfirm={(menuItemId, quantityPerServing) =>
            handleAddIngredientToMenu(
              menuItemId,
              quantityPerServing,
              attachMenuIngredient,
            )
          }
        />
      ) : null}
    </>
  );
}

function TopBar({
  searchValue,
  onSearchChange,
  onAdd,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Ingredients</h1>
        <p className="text-xs text-zinc-500">
          Master list of every ingredient your kitchen uses.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ingredients"
            className="w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          Add ingredient
        </button>
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

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent: "green" | "violet" | "amber";
}) {
  const palette = {
    green: "bg-green-50 text-green-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  }[accent];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${palette}`}
      >
        {label}
      </span>
      <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-green-600 bg-green-600 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

function IngredientRow({
  ingredient,
  usageCount,
  inventoryRecord,
  onEdit,
  onDelete,
  onAddToMenu,
}: {
  ingredient: Ingredient;
  usageCount: number;
  inventoryRecord:
    | { quantity: number; threshold: number; ingredientId: string; updatedAt: string }
    | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onAddToMenu: () => void;
}) {
  const status = inventoryRecord
    ? getInventoryStatus({
        ...inventoryRecord,
      })
    : null;
  const statusLabel: Record<NonNullable<typeof status>, string> = {
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out",
  };
  const statusClass: Record<NonNullable<typeof status>, string> = {
    in_stock: "bg-green-100 text-green-700",
    low_stock: "bg-amber-100 text-amber-700",
    out_of_stock: "bg-red-100 text-red-700",
  };

  return (
    <li className="flex items-center gap-4 px-5 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">
          {ingredient.name}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          Unit: <span className="font-medium text-zinc-700">{ingredient.unit}</span>
          {usageCount > 0 ? (
            <>
              {" · "}
              Used in {usageCount} menu item{usageCount === 1 ? "" : "s"}
            </>
          ) : (
            " · Not yet used"
          )}
        </p>
      </div>

      {inventoryRecord ? (
        <div className="hidden text-right text-xs text-zinc-500 sm:block">
          <p className="font-medium text-zinc-800">
            {formatQuantity(inventoryRecord.quantity, ingredient.unit)}
          </p>
          <p className="text-[10px] text-zinc-400">
            min {formatQuantity(inventoryRecord.threshold, ingredient.unit)}
          </p>
        </div>
      ) : (
        <Link
          href="/inventory"
          className="hidden text-[11px] text-zinc-400 hover:text-zinc-600 sm:block"
        >
          No stock data
        </Link>
      )}

      {status ? (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[status]}`}
        >
          {statusLabel[status]}
        </span>
      ) : null}

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onAddToMenu}
          title="Add to a menu item"
          aria-label={`Add ${ingredient.name} to a menu item`}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-violet-50 hover:text-violet-700"
        >
          <ChefHatIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${ingredient.name}`}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <EditIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${ingredient.name}`}
          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function AddIngredientToMenuModal({
  ingredient,
  menuItems,
  onClose,
  onConfirm,
}: {
  ingredient: Ingredient;
  menuItems: MenuItem[];
  onClose: () => void;
  onConfirm: (menuItemId: string, quantityPerServing: number) => void;
}) {
  const [menuItemId, setMenuItemId] = useState(menuItems[0]?.id ?? "");
  const [amountText, setAmountText] = useState("1");

  useEffect(() => {
    if (menuItems.length === 0) return;
    if (!menuItems.some((m) => m.id === menuItemId)) {
      setMenuItemId(menuItems[0]!.id);
    }
  }, [menuItems, menuItemId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemId) return;
    const { qty } = parseQuantityAndUnit(amountText, ingredient.unit);
    onConfirm(menuItemId, qty);
  };

  const groupedForSelect = useMemo(() => {
    const byCat = new Map<MenuItemCategory, MenuItem[]>();
    for (const cat of MENU_ITEM_CATEGORY_ORDER) byCat.set(cat, []);
    for (const m of menuItems) {
      const list = byCat.get(m.category) ?? [];
      list.push(m);
      byCat.set(m.category, list);
    }
    for (const [cat, list] of byCat) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      byCat.set(cat, list);
    }
    return byCat;
  }, [menuItems]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-menu-title"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2
              id="add-to-menu-title"
              className="text-base font-semibold text-zinc-900"
            >
              Add to menu item
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Attach{" "}
              <span className="font-medium text-zinc-800">{ingredient.name}</span>{" "}
              to a dish. Stored quantity is the leading number (per serving, in
              catalog unit <span className="font-medium">{ingredient.unit}</span>
              ).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <span aria-hidden className="block text-lg leading-none">
              ×
            </span>
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          {menuItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-5 text-center text-sm text-zinc-600">
              <p>You do not have any menu items yet.</p>
              <Link
                href="/menu-items"
                className="mt-3 inline-block text-sm font-medium text-violet-700 hover:text-violet-800"
              >
                Create menu items
              </Link>
            </div>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-medium text-zinc-600">
                  Menu item
                </span>
                <select
                  value={menuItemId}
                  onChange={(e) => setMenuItemId(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                >
                  {MENU_ITEM_CATEGORY_ORDER.map((cat) => {
                    const items = groupedForSelect.get(cat) ?? [];
                    if (items.length === 0) return null;
                    return (
                      <optgroup key={cat} label={cat}>
                        {items.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-600">
                  Amount (per serving)
                </span>
                <input
                  type="text"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                  placeholder={`e.g. 15 ${ingredient.unit}, 0.5`}
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  One field: number first, then optional unit (e.g.{" "}
                  <span className="font-medium text-zinc-600">100 g</span>,{" "}
                  <span className="font-medium text-zinc-600">2</span>). Blank
                  defaults to <span className="font-medium text-zinc-600">1</span>.
                  If this ingredient is already on the dish, the stored quantity is
                  updated to the parsed number.
                </p>
              </label>
            </>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={menuItems.length === 0 || !menuItemId}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to dish
          </button>
        </footer>
      </form>
    </div>
  );
}

function IngredientDialog({
  ingredients,
  initial,
  onClose,
  onSubmit,
}: {
  ingredients: Ingredient[];
  initial: Ingredient | null;
  onClose: () => void;
  onSubmit: (ingredient: Ingredient) => void;
}) {
  const unitDatalistId = useId();
  const isEdit = initial !== null;
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "g");
  const [category, setCategory] = useState<IngredientCategory>(
    initial?.category ?? "Other",
  );

  const trimmed = name.trim();
  const duplicate = trimmed
    ? ingredients.find(
        (i) =>
          i.name.toLowerCase() === trimmed.toLowerCase() &&
          (!isEdit || i.id !== initial.id),
      )
    : null;
  const canSave = trimmed.length > 0 && !duplicate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSubmit({
      id: initial?.id ?? generateId("ing"),
      name: trimmed,
      unit: unit.trim() || "g",
      category,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {isEdit ? `Edit ${initial.name}` : "New ingredient"}
            </h2>
            <p className="text-xs text-zinc-500">
              {isEdit
                ? "Renaming or changing units cascades into menu items."
                : "Add a new ingredient to your master catalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <span aria-hidden className="block text-lg leading-none">
              ×
            </span>
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="text-xs font-medium text-zinc-600">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saffron"
              autoFocus
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
            />
            {duplicate ? (
              <p className="mt-1.5 text-[11px] text-red-600">
                An ingredient called &ldquo;{duplicate.name}&rdquo; already
                exists.
              </p>
            ) : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-600">
                Default unit
              </span>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                list={unitDatalistId}
                placeholder="g, pcs, bunch…"
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              />
              <datalist id={unitDatalistId}>
                {UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-600">
                Category
              </span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as IngredientCategory)
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              >
                {INGREDIENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEdit ? "Save changes" : "Add ingredient"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <IngredientsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No ingredients yet
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Build your master ingredient list. Each one becomes a building block for
        menu items and grocery lists.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        <PlusIcon className="h-4 w-4" />
        Add your first ingredient
      </button>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <AlertIcon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-medium text-zinc-900">
        No ingredients match your filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-xs font-medium text-green-700 hover:text-green-800"
      >
        Clear filters
      </button>
    </div>
  );
}
