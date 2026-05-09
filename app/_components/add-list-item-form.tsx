"use client";

import { useId, useState } from "react";
import { PlusIcon } from "./icons";
import {
  GroceryListLine,
  INGREDIENT_CATEGORIES,
  Ingredient,
  IngredientCategory,
  generateId,
} from "../_lib/store";
import { parseQuantityAndUnit } from "../_lib/parse-quantity-and-unit";

export function AddListItemForm({
  ingredients,
  onAdd,
  onCancel,
}: {
  ingredients: Ingredient[];
  onAdd: (line: GroceryListLine) => void;
  onCancel?: () => void;
}) {
  const datalistId = useId();
  const [name, setName] = useState("");
  const [qtyAndUnit, setQtyAndUnit] = useState("");
  const [category, setCategory] = useState<IngredientCategory>("Other");
  const [matchedExisting, setMatchedExisting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    const match = ingredients.find(
      (i) => i.name.toLowerCase() === value.toLowerCase(),
    );
    if (match) {
      setQtyAndUnit((`1 ${match.unit}`).trim());
      setCategory(match.category);
      setMatchedExisting(true);
    } else {
      setMatchedExisting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const existing = ingredients.find(
      (i) => i.name.toLowerCase() === trimmed.toLowerCase(),
    );

    const fallbackUnit = existing?.unit?.trim() || "g";
    const { qty, unit: unitNorm } = parseQuantityAndUnit(
      qtyAndUnit,
      fallbackUnit,
    );

    onAdd({
      ingredientId: existing?.id ?? generateId("custom"),
      ingredientName: existing?.name ?? trimmed,
      totalQuantity: qty,
      unit: unitNorm,
      category,
      inStock: false,
      custom: true,
    });

    setName("");
    setQtyAndUnit("");
    setCategory("Other");
    setMatchedExisting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-900">Add an item</h4>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_minmax(0,11rem)_140px_auto]">
        <label className="block">
          <span className="block text-[11px] font-medium text-zinc-600">
            Item
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            list={datalistId}
            placeholder="e.g. Saffron"
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
          <datalist id={datalistId}>
            {ingredients.map((i) => (
              <option key={i.id} value={i.name} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="block text-[11px] font-medium text-zinc-600">
            Amount
          </span>
          <input
            type="text"
            value={qtyAndUnit}
            onChange={(e) => setQtyAndUnit(e.target.value)}
            placeholder="e.g. 3 g, 500ml"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] font-medium text-zinc-600">
            Category
          </span>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as IngredientCategory)
            }
            disabled={matchedExisting}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
          >
            {INGREDIENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center gap-1.5 self-end rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          Add
        </button>
      </div>

      <p className="mt-2 text-[11px] text-zinc-500">
        Amount is one field: number first, then unit (examples:{" "}
        <span className="font-medium text-zinc-600">250 g</span>,{" "}
        <span className="font-medium text-zinc-600">500ml</span>,{" "}
        <span className="font-medium text-zinc-600">2 pcs</span>). Leave blank
        for quantity <span className="font-medium text-zinc-600">1</span> and
        your catalog unit (or g).
        {matchedExisting ? (
          <span className="block pt-0.5">
            Matched to your ingredient master list — category is locked; amount
            prefills with the catalog unit and you can edit freely.
          </span>
        ) : null}
      </p>
    </form>
  );
}
