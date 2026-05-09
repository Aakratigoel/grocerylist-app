"use client";

import { useId, useMemo, useState } from "react";
import {
  BellIcon,
  EditIcon,
  HelpIcon,
  MenuItemsIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
} from "../_components/icons";
import { useIngredients, useMenuItems, useSettings } from "../_lib/hooks";
import { parseQuantityAndUnit } from "../_lib/parse-quantity-and-unit";
import {
  Ingredient,
  MenuItem,
  MenuItemCategory,
  MenuItemIngredient,
  UNITS,
  generateId,
} from "../_lib/store";

const MENU_CATEGORIES: MenuItemCategory[] = [
  "Starter",
  "Main",
  "Side",
  "Bread",
  "Dessert",
  "Beverage",
];

type DietaryPreferenceId =
  | "vegan"
  | "vegetarian"
  | "dairy-free"
  | "gluten-free"
  | "nut-free"
  | "high-protein"
  | "no-sugar"
  | "low-carb";

type DietaryPreference = {
  id: DietaryPreferenceId;
  label: string;
  hint: string;
};

const DIETARY_PREFERENCES: DietaryPreference[] = [
  { id: "vegan", label: "Vegan", hint: "No animal products" },
  { id: "vegetarian", label: "Vegetarian", hint: "No meat, fish or seafood" },
  { id: "dairy-free", label: "Dairy-Free", hint: "Plant-based substitutes" },
  { id: "gluten-free", label: "Gluten-Free", hint: "No wheat, barley, rye" },
  { id: "nut-free", label: "Nut-Free", hint: "No tree nuts or peanuts" },
  {
    id: "high-protein",
    label: "High Protein",
    hint: "Boost protein-rich items",
  },
  { id: "no-sugar", label: "No Sugar", hint: "No added sugar" },
  { id: "low-carb", label: "Low Carb / Keto", hint: "Cut grains & sugar" },
];

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; item: MenuItem };

export default function MenuItemsPage() {
  const [menuItems, setMenuItems, hydrated] = useMenuItems();
  const [ingredients, setIngredients] = useIngredients();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });

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

  const handleSave = ({
    menuItem,
    newIngredients,
    ingredientUnitPatches = [],
  }: {
    menuItem: MenuItem;
    newIngredients: Ingredient[];
    ingredientUnitPatches?: { ingredientId: string; unit: string }[];
  }) => {
    if (ingredientUnitPatches.length > 0 || newIngredients.length > 0) {
      let nextIngredients = ingredients.map((i) => {
        const p = ingredientUnitPatches.find((x) => x.ingredientId === i.id);
        return p ? { ...i, unit: p.unit } : i;
      });
      if (newIngredients.length > 0) {
        nextIngredients = [...nextIngredients, ...newIngredients];
      }
      setIngredients(nextIngredients);
    }
    if (dialog.kind === "edit") {
      setMenuItems(
        menuItems.map((m) => (m.id === menuItem.id ? menuItem : m)),
      );
    } else {
      setMenuItems([menuItem, ...menuItems]);
    }
    setDialog({ kind: "closed" });
  };

  const handleDelete = (id: string) => {
    setMenuItems(menuItems.filter((m) => m.id !== id));
  };

  return (
    <>
      <TopBar
        onAdd={() => setDialog({ kind: "create" })}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl">
          {hydrated && menuItems.length === 0 ? (
            <EmptyState onAdd={() => setDialog({ kind: "create" })} />
          ) : (
            <div className="space-y-8">
              {MENU_CATEGORIES.map((category) => {
                const items = grouped.get(category) ?? [];
                if (items.length === 0) return null;
                return (
                  <section key={category}>
                    <h2 className="mb-3 text-sm font-semibold text-zinc-500">
                      {category}
                      <span className="ml-2 text-xs font-normal text-zinc-400">
                        {items.length}
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          ingredientLookup={ingredientLookup}
                          onEdit={() => setDialog({ kind: "edit", item })}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {dialog.kind !== "closed" ? (
        <MenuItemDialog
          ingredients={ingredients}
          initial={dialog.kind === "edit" ? dialog.item : null}
          onClose={() => setDialog({ kind: "closed" })}
          onSubmit={handleSave}
        />
      ) : null}
    </>
  );
}

function TopBar({
  onAdd,
  searchValue,
  onSearchChange,
}: {
  onAdd: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Menu Items</h1>
        <p className="text-xs text-zinc-500">
          Build your menu once. We&apos;ll auto-load ingredients on every order.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search menu items"
            className="w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          Add menu item
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <MenuItemsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        No menu items yet
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Save your dishes once with their ingredient list. We&apos;ll do the math
        on every order.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        <PlusIcon className="h-4 w-4" />
        Add your first menu item
      </button>
    </div>
  );
}

function MenuItemCard({
  item,
  ingredientLookup,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  ingredientLookup: Map<string, Ingredient>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{item.name}</h3>
          <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
            {item.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${item.name}`}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${item.name}`}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      {item.description ? (
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {item.description}
        </p>
      ) : null}

      <div className="mt-4 rounded-xl bg-zinc-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Ingredients per serving · {item.ingredients.length}
        </p>
        <ul className="mt-2 space-y-1 text-xs text-zinc-600">
          {item.ingredients.slice(0, 4).map((ing) => {
            const ingredient = ingredientLookup.get(ing.ingredientId);
            if (!ingredient) return null;
            return (
              <li key={ing.ingredientId} className="flex justify-between">
                <span>{ingredient.name}</span>
                <span className="font-medium text-zinc-900">
                  {ing.quantityPerServing > 0
                    ? `${ing.quantityPerServing} ${ingredient.unit}`
                    : "as needed"}
                </span>
              </li>
            );
          })}
          {item.ingredients.length > 4 ? (
            <li className="text-[11px] text-zinc-400">
              +{item.ingredients.length - 4} more
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}

type IngredientRow = {
  name: string;
  /** Single editable field, e.g. "250 g", "2 pcs", "500ml". */
  amount: string;
};

function normalizeUnitInput(unit: string): string {
  const t = unit.trim();
  return t.length > 0 ? t : "g";
}

function formatAmountField(quantityPerServing: number, unit: string): string {
  const u = unit.trim() || "g";
  return `${quantityPerServing} ${u}`.trim();
}

function MenuItemDialog({
  ingredients,
  initial,
  onClose,
  onSubmit,
}: {
  ingredients: Ingredient[];
  initial: MenuItem | null;
  onClose: () => void;
  onSubmit: (payload: {
    menuItem: MenuItem;
    newIngredients: Ingredient[];
    ingredientUnitPatches: { ingredientId: string; unit: string }[];
  }) => void;
}) {
  const [settings] = useSettings();
  const datalistId = useId();
  const unitDatalistId = useId();
  const isEdit = initial !== null;

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<MenuItemCategory>(
    initial?.category ?? "Main",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [rows, setRows] = useState<IngredientRow[]>(() => {
    if (!initial) return [{ name: "", amount: "" }];
    return initial.ingredients.map((ing) => {
      const masterIngredient = ingredients.find(
        (m) => m.id === ing.ingredientId,
      );
      const u = masterIngredient?.unit ?? "g";
      return {
        name: masterIngredient?.name ?? "",
        amount: formatAmountField(ing.quantityPerServing, u),
      };
    });
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInfo, setAiInfo] = useState<string | null>(null);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Set<DietaryPreferenceId>>(
    new Set(),
  );

  const togglePreference = (id: DietaryPreferenceId) => {
    setPreferences((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (id === "vegan") {
          next.delete("dairy-free");
          next.delete("vegetarian");
        }
        if (id === "dairy-free" || id === "vegetarian") {
          next.delete("vegan");
        }
      }
      return next;
    });
  };

  const handleSuggest = async () => {
    setAiError(null);
    setAiInfo(null);
    setAiWarnings([]);
    const trimmed = name.trim();
    if (!trimmed) {
      setAiError("Enter a dish name first.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/suggest-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          category,
          preferences: Array.from(preferences),
          provider: settings.aiProvider,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ingredients?: { name: string; quantity: number; unit: string }[];
        error?: string;
        detail?: string;
        provider?: string;
        model?: string;
        preferences?: string[];
        warnings?: string[];
      };
      if (!response.ok) {
        const message = payload.error ?? `Request failed (HTTP ${response.status})`;
        setAiError(
          payload.detail && payload.detail !== payload.error
            ? `${message}\n\nOpenAI said: ${payload.detail}`
            : message,
        );
        return;
      }
      const suggested = (payload.ingredients ?? []).map((ing) => {
        const u = String(ing.unit ?? "g").trim() || "g";
        return {
          name: ing.name,
          amount: `${ing.quantity} ${u}`.trim(),
        };
      });
      if (suggested.length === 0) {
        setAiError("AI returned no ingredients. Try a more specific name.");
        return;
      }
      setRows((current) => {
        const meaningful = current.filter((row) => row.name.trim());
        const existingKeys = new Set(
          meaningful.map((row) => row.name.trim().toLowerCase()),
        );
        const additions = suggested.filter(
          (row) => !existingKeys.has(row.name.toLowerCase()),
        );
        if (meaningful.length === 0) return suggested;
        return [...meaningful, ...additions];
      });
      const providerLabel =
        payload.provider === "gemini"
          ? "Gemini"
          : payload.provider === "openai"
            ? "OpenAI"
            : "AI";
      const appliedPreferences = (payload.preferences ?? []).filter(
        (id): id is DietaryPreferenceId =>
          DIETARY_PREFERENCES.some((p) => p.id === id),
      );
      const prefsSentence =
        appliedPreferences.length > 0
          ? ` Applied: ${appliedPreferences
              .map(
                (id) => DIETARY_PREFERENCES.find((p) => p.id === id)?.label ?? id,
              )
              .join(", ")}.`
          : "";
      setAiInfo(
        `${providerLabel} suggested ${suggested.length} ingredient${suggested.length === 1 ? "" : "s"}.${prefsSentence} Review and edit before saving.`,
      );
      setAiWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Could not reach the AI service. Check your connection.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const updateRow = (index: number, patch: Partial<IngredientRow>) => {
    setRows((current) =>
      current.map((row, i) => (i !== index ? row : { ...row, ...patch })),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validRows = rows.filter((r) => r.name.trim());
    if (validRows.length === 0) return;

    const newIngredients: Ingredient[] = [];
    const menuIngredients: MenuItemIngredient[] = [];
    const newlyCreated = new Map<string, Ingredient>();
    const unitPatchById = new Map<string, string>();

    for (const row of validRows) {
      const trimmed = row.name.trim();
      const key = trimmed.toLowerCase();

      const existing =
        ingredients.find((ing) => ing.name.toLowerCase() === key) ??
        newlyCreated.get(key);

      const fallbackUnit = (existing?.unit ?? "g").trim() || "g";
      const { qty, unit: parsedUnit } = parseQuantityAndUnit(
        row.amount,
        fallbackUnit,
      );
      const unitNorm = normalizeUnitInput(parsedUnit);

      let ingredientId: string;
      if (existing) {
        ingredientId = existing.id;
        if (!newlyCreated.has(key)) {
          unitPatchById.set(existing.id, unitNorm);
        }
      } else {
        const prev = newlyCreated.get(key);
        if (prev) {
          prev.unit = unitNorm;
          ingredientId = prev.id;
        } else {
          const created: Ingredient = {
            id: generateId("ing"),
            name: trimmed,
            unit: unitNorm,
            category: "Other",
          };
          newlyCreated.set(key, created);
          newIngredients.push(created);
          ingredientId = created.id;
        }
      }

      menuIngredients.push({
        ingredientId,
        quantityPerServing: qty,
      });
    }

    const ingredientUnitPatches = Array.from(unitPatchById.entries())
      .filter(([id, unit]) => {
        const ing = ingredients.find((i) => i.id === id);
        return ing && ing.unit !== unit;
      })
      .map(([ingredientId, unit]) => ({ ingredientId, unit }));

    onSubmit({
      menuItem: {
        id: initial?.id ?? generateId("menu"),
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        ingredients: menuIngredients,
      },
      newIngredients,
      ingredientUnitPatches,
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
        className="flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {isEdit ? `Edit ${initial.name}` : "New menu item"}
            </h2>
            <p className="text-xs text-zinc-500">
              {isEdit
                ? "Update the recipe — changes apply to future orders only."
                : "Quantities per serving are optional (blank defaults to 1); we scale by guest count."}
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-zinc-600">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala"
                required
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-600">Category</span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MenuItemCategory)
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              >
                {MENU_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-zinc-600">
                Description (optional)
              </span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short note that appears on the menu card"
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              />
            </label>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                Ingredients per serving
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={aiLoading || !name.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiLoading ? (
                    <>
                      <SpinnerIcon />
                      Thinking…
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-3.5 w-3.5" />
                      Suggest with AI
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRows([...rows, { name: "", amount: "" }])
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add ingredient
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                  Dietary preferences
                </p>
                {preferences.size > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPreferences(new Set())}
                    className="text-[11px] font-medium text-violet-700 hover:text-violet-900"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] text-violet-700/70">
                Pick any that apply — AI will substitute and adjust quantities.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DIETARY_PREFERENCES.map((pref) => {
                  const active = preferences.has(pref.id);
                  return (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => togglePreference(pref.id)}
                      title={pref.hint}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? "border-violet-300 bg-violet-600 text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-200 hover:bg-violet-50"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-violet-400"}`}
                      />
                      {pref.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {aiError ? (
              <p className="mt-3 whitespace-pre-line rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                {aiError}
              </p>
            ) : null}
            {aiInfo ? (
              <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-700">
                {aiInfo}
              </p>
            ) : null}
            {aiWarnings.length > 0 ? (
              <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] leading-relaxed text-emerald-800">
                <p className="font-semibold">
                  Auto-substituted {aiWarnings.length} ingredient
                  {aiWarnings.length === 1 ? "" : "s"} to match your preferences:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {aiWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <datalist id={datalistId}>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.name} />
              ))}
            </datalist>
            <datalist id={unitDatalistId}>
              {UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>

            <div className="mt-3 space-y-2">
              {rows.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_minmax(0,10rem)_auto] items-center gap-2 sm:grid-cols-[1fr_minmax(0,12rem)_auto]"
                  >
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) =>
                        updateRow(index, { name: e.target.value })
                      }
                      list={datalistId}
                      placeholder="e.g. Saffron"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                    />
                    <input
                      type="text"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(index, { amount: e.target.value })
                      }
                      list={unitDatalistId}
                      placeholder="e.g. 15 g, 2 pcs"
                      aria-label="Amount per serving (number and unit)"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRows(rows.filter((_, i) => i !== index))
                      }
                      disabled={rows.length === 1}
                      aria-label="Remove ingredient row"
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>

            <p className="mt-3 text-[11px] text-zinc-500">
              Type any ingredient name. Amount is one field: number first, then
              unit (e.g. <span className="font-medium text-zinc-700">100 g</span>,{" "}
              <span className="font-medium text-zinc-700">500ml</span>). Leave
              amount blank for{" "}
              <span className="font-medium text-zinc-700">1</span> in your
              catalog unit (or g). Suggestions list common units. Saving updates
              the master ingredient&apos;s unit when the name matches your
              catalog.
            </p>
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            {isEdit ? "Save changes" : "Save menu item"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
