"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertIcon,
  BellIcon,
  BoxIcon,
  HelpIcon,
  InventoryIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
} from "../_components/icons";
import { useIngredients, useInventory } from "../_lib/hooks";
import {
  INGREDIENT_CATEGORIES,
  Ingredient,
  IngredientCategory,
  InventoryRecord,
  InventoryStatus,
  formatQuantity,
  getInventoryStatus,
} from "../_lib/store";

type StatusFilter = "all" | InventoryStatus;

type Row = {
  ingredient: Ingredient;
  record: InventoryRecord;
  status: InventoryStatus;
};

export default function InventoryPage() {
  const [ingredients, , ingredientsHydrated] = useIngredients();
  const [inventory, setInventory, inventoryHydrated] = useInventory();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const ingredientLookup = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );

  const inventoryLookup = useMemo(
    () => new Map(inventory.map((rec) => [rec.ingredientId, rec])),
    [inventory],
  );

  const trackedRows: Row[] = useMemo(() => {
    const rows: Row[] = [];
    for (const record of inventory) {
      const ingredient = ingredientLookup.get(record.ingredientId);
      if (!ingredient) continue;
      rows.push({ ingredient, record, status: getInventoryStatus(record) });
    }
    return rows;
  }, [inventory, ingredientLookup]);

  const untrackedIngredients = useMemo(() => {
    return ingredients.filter((ing) => !inventoryLookup.has(ing.id));
  }, [ingredients, inventoryLookup]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return trackedRows.filter((row) => {
      const matchesSearch =
        !term ||
        row.ingredient.name.toLowerCase().includes(term) ||
        row.ingredient.category.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trackedRows, search, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, Row[]>();
    for (const cat of INGREDIENT_CATEGORIES) map.set(cat, []);
    for (const row of filteredRows) {
      const list = map.get(row.ingredient.category) ?? [];
      list.push(row);
      map.set(row.ingredient.category, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name));
    }
    return map;
  }, [filteredRows]);

  const counts = useMemo(() => {
    const c = { total: trackedRows.length, in_stock: 0, low_stock: 0, out_of_stock: 0 };
    for (const row of trackedRows) c[row.status]++;
    return c;
  }, [trackedRows]);

  const updateRecord = (ingredientId: string, patch: Partial<InventoryRecord>) => {
    const now = new Date().toISOString();
    setInventory(
      inventory.map((rec) =>
        rec.ingredientId === ingredientId
          ? { ...rec, ...patch, updatedAt: now }
          : rec,
      ),
    );
  };

  const adjustQuantity = (ingredientId: string, delta: number) => {
    const record = inventoryLookup.get(ingredientId);
    if (!record) return;
    const next = Math.max(0, +(record.quantity + delta).toFixed(2));
    updateRecord(ingredientId, { quantity: next });
  };

  const restockToHealthy = (ingredientId: string) => {
    const record = inventoryLookup.get(ingredientId);
    if (!record) return;
    const target = Math.max(record.threshold * 2, record.threshold + 1);
    updateRecord(ingredientId, { quantity: target });
  };

  const trackIngredient = (ingredient: Ingredient) => {
    const now = new Date().toISOString();
    const newRecord: InventoryRecord = {
      ingredientId: ingredient.id,
      quantity: 0,
      threshold: 0,
      updatedAt: now,
    };
    setInventory([newRecord, ...inventory]);
  };

  const trackAllUntracked = () => {
    if (untrackedIngredients.length === 0) return;
    const now = new Date().toISOString();
    const additions: InventoryRecord[] = untrackedIngredients.map((ing) => ({
      ingredientId: ing.id,
      quantity: 0,
      threshold: 0,
      updatedAt: now,
    }));
    setInventory([...additions, ...inventory]);
  };

  const stopTracking = (ingredientId: string) => {
    setInventory(inventory.filter((rec) => rec.ingredientId !== ingredientId));
  };

  const lowOrOut = trackedRows
    .filter((r) => r.status !== "in_stock")
    .sort((a, b) => {
      if (a.status === b.status)
        return a.ingredient.name.localeCompare(b.ingredient.name);
      return a.status === "out_of_stock" ? -1 : 1;
    });

  const hydrated = ingredientsHydrated && inventoryHydrated;

  return (
    <>
      <TopBar
        searchValue={search}
        onSearchChange={setSearch}
        untrackedCount={untrackedIngredients.length}
        onTrackAll={trackAllUntracked}
      />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SummaryCard
              label="Tracked"
              value={counts.total}
              accent="zinc"
              icon={<BoxIcon className="h-4 w-4" />}
            />
            <SummaryCard
              label="In stock"
              value={counts.in_stock}
              accent="green"
              icon={<BoxIcon className="h-4 w-4" />}
            />
            <SummaryCard
              label="Low stock"
              value={counts.low_stock}
              accent="amber"
              icon={<AlertIcon className="h-4 w-4" />}
            />
            <SummaryCard
              label="Out of stock"
              value={counts.out_of_stock}
              accent="red"
              icon={<AlertIcon className="h-4 w-4" />}
            />
          </div>

          {lowOrOut.length > 0 ? <LowStockAlert rows={lowOrOut} /> : null}

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              active={statusFilter === "all"}
              label={`All · ${counts.total}`}
              onClick={() => setStatusFilter("all")}
            />
            <FilterChip
              active={statusFilter === "in_stock"}
              tone="green"
              label={`In stock · ${counts.in_stock}`}
              onClick={() => setStatusFilter("in_stock")}
            />
            <FilterChip
              active={statusFilter === "low_stock"}
              tone="amber"
              label={`Low · ${counts.low_stock}`}
              onClick={() => setStatusFilter("low_stock")}
            />
            <FilterChip
              active={statusFilter === "out_of_stock"}
              tone="red"
              label={`Out · ${counts.out_of_stock}`}
              onClick={() => setStatusFilter("out_of_stock")}
            />
          </div>

          {hydrated && trackedRows.length === 0 ? (
            <EmptyState
              hasIngredients={ingredients.length > 0}
              onTrackAll={trackAllUntracked}
            />
          ) : filteredRows.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            />
          ) : (
            <div className="space-y-6">
              {INGREDIENT_CATEGORIES.map((category) => {
                const rows = grouped.get(category) ?? [];
                if (rows.length === 0) return null;
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
                        {rows.length} ingredient{rows.length === 1 ? "" : "s"}
                      </span>
                    </header>
                    <ul className="divide-y divide-zinc-100">
                      {rows.map((row) => (
                        <InventoryRow
                          key={row.record.ingredientId}
                          row={row}
                          onAdjust={(delta) =>
                            adjustQuantity(row.record.ingredientId, delta)
                          }
                          onSetQuantity={(quantity) =>
                            updateRecord(row.record.ingredientId, { quantity })
                          }
                          onSetThreshold={(threshold) =>
                            updateRecord(row.record.ingredientId, {
                              threshold,
                            })
                          }
                          onRestock={() =>
                            restockToHealthy(row.record.ingredientId)
                          }
                          onStopTracking={() =>
                            stopTracking(row.record.ingredientId)
                          }
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}

          {untrackedIngredients.length > 0 ? (
            <UntrackedSection
              ingredients={untrackedIngredients}
              onTrack={trackIngredient}
              onTrackAll={trackAllUntracked}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}

function TopBar({
  searchValue,
  onSearchChange,
  untrackedCount,
  onTrackAll,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  untrackedCount: number;
  onTrackAll: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Inventory</h1>
        <p className="text-xs text-zinc-500">
          What&apos;s in your kitchen right now &mdash; updates flow into
          grocery lists automatically.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search inventory"
            className="w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </div>
        {untrackedCount > 0 ? (
          <button
            type="button"
            onClick={onTrackAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            <PlusIcon className="h-4 w-4" />
            Track {untrackedCount} new
          </button>
        ) : null}
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

function SummaryCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: "zinc" | "green" | "amber" | "red";
  icon: React.ReactNode;
}) {
  const palette = {
    zinc: "bg-zinc-50 text-zinc-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  }[accent];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${palette}`}
        >
          {icon}
        </span>
        <p className="text-xs font-medium text-zinc-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function LowStockAlert({ rows }: { rows: Row[] }) {
  const visible = rows.slice(0, 6);
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertIcon className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">
            {rows.length} item{rows.length === 1 ? "" : "s"} need attention
          </p>
          <p className="text-xs text-amber-800/80">
            Restock these before your next big order.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {visible.map((row) => (
              <li
                key={row.record.ingredientId}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  row.status === "out_of_stock"
                    ? "bg-red-100 text-red-800"
                    : "bg-white text-amber-800 ring-1 ring-amber-200"
                }`}
              >
                {row.ingredient.name}
                <span className="opacity-70">
                  {row.status === "out_of_stock"
                    ? "out"
                    : formatQuantity(row.record.quantity, row.ingredient.unit)}
                </span>
              </li>
            ))}
            {rows.length > visible.length ? (
              <li className="text-[11px] text-amber-700">
                +{rows.length - visible.length} more
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  tone = "green",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: "green" | "amber" | "red";
}) {
  const activeClass = {
    green: "border-green-600 bg-green-600 text-white",
    amber: "border-amber-500 bg-amber-500 text-white",
    red: "border-red-600 bg-red-600 text-white",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? activeClass
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

function InventoryRow({
  row,
  onAdjust,
  onSetQuantity,
  onSetThreshold,
  onRestock,
  onStopTracking,
}: {
  row: Row;
  onAdjust: (delta: number) => void;
  onSetQuantity: (quantity: number) => void;
  onSetThreshold: (threshold: number) => void;
  onRestock: () => void;
  onStopTracking: () => void;
}) {
  const { ingredient, record, status } = row;
  const step = stepFor(ingredient.unit);
  const statusBadge: Record<InventoryStatus, string> = {
    in_stock: "bg-green-100 text-green-700",
    low_stock: "bg-amber-100 text-amber-700",
    out_of_stock: "bg-red-100 text-red-700",
  };
  const statusLabel: Record<InventoryStatus, string> = {
    in_stock: "In stock",
    low_stock: "Low",
    out_of_stock: "Out",
  };

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900">
            {ingredient.name}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[status]}`}
          >
            {statusLabel[status]}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          Updated {formatRelative(record.updatedAt)}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAdjust(-step)}
          aria-label="Decrease quantity"
          disabled={record.quantity <= 0}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        <NumericInput
          value={record.quantity}
          onChange={(v) => onSetQuantity(Math.max(0, v))}
          unit={ingredient.unit}
        />
        <button
          type="button"
          onClick={() => onAdjust(step)}
          aria-label="Increase quantity"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <span>min</span>
        <NumericInput
          value={record.threshold}
          onChange={(v) => onSetThreshold(Math.max(0, v))}
          unit={ingredient.unit}
          tone="muted"
        />
      </div>

      <div className="flex items-center gap-1">
        {status !== "in_stock" ? (
          <button
            type="button"
            onClick={onRestock}
            className="rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700 hover:bg-green-100"
          >
            Restock
          </button>
        ) : null}
        <button
          type="button"
          onClick={onStopTracking}
          aria-label={`Stop tracking ${ingredient.name}`}
          className="rounded-md p-1.5 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          title="Stop tracking"
        >
          <span aria-hidden className="block text-base leading-none">×</span>
        </button>
      </div>
    </li>
  );
}

function NumericInput({
  value,
  onChange,
  unit,
  tone = "default",
}: {
  value: number;
  onChange: (next: number) => void;
  unit: string;
  tone?: "default" | "muted";
}) {
  const [draft, setDraft] = useState<string>(String(value));
  const [editing, setEditing] = useState(false);

  // Keep input synced with prop unless user is actively editing.
  if (!editing && draft !== String(value)) {
    setDraft(String(value));
  }

  const commit = () => {
    setEditing(false);
    const parsed = Number(draft);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChange(parsed);
    } else {
      setDraft(String(value));
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs ${
        tone === "muted"
          ? "border-zinc-100 bg-zinc-50 text-zinc-600"
          : "border-zinc-200 bg-white text-zinc-900"
      }`}
    >
      <input
        type="number"
        min={0}
        step="any"
        value={draft}
        onFocus={() => setEditing(true)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-16 bg-transparent text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="ml-1 text-[10px] text-zinc-500">{unit}</span>
    </div>
  );
}

function UntrackedSection({
  ingredients,
  onTrack,
  onTrackAll,
}: {
  ingredients: Ingredient[];
  onTrack: (ingredient: Ingredient) => void;
  onTrackAll: () => void;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Untracked ingredients
          </h2>
          <p className="text-xs text-zinc-500">
            {ingredients.length} ingredient
            {ingredients.length === 1 ? "" : "s"} from your master list aren&apos;t
            tracked yet.
          </p>
        </div>
        <button
          type="button"
          onClick={onTrackAll}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Track all
        </button>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {ingredients.map((ing) => (
          <li key={ing.id}>
            <button
              type="button"
              onClick={() => onTrack(ing)}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
            >
              <PlusIcon className="h-3 w-3" />
              {ing.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState({
  hasIngredients,
  onTrackAll,
}: {
  hasIngredients: boolean;
  onTrackAll: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <InventoryIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">
        Inventory is empty
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        {hasIngredients
          ? "Start tracking what you have on hand to get smarter grocery lists."
          : "Add some ingredients first, then come back to track stock levels."}
      </p>
      {hasIngredients ? (
        <button
          type="button"
          onClick={onTrackAll}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          Track every ingredient
        </button>
      ) : (
        <Link
          href="/ingredients"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <PlusIcon className="h-4 w-4" />
          Add ingredients
        </Link>
      )}
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
        No items match your filters.
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

function stepFor(unit: string): number {
  switch (unit) {
    case "kg":
    case "l":
      return 0.5;
    case "tsp":
    case "tbsp":
    case "cup":
    case "pcs":
      return 1;
    default:
      return 50;
  }
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}
