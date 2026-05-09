"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent } from "react";
import {
  BasketIcon,
  BellIcon,
  CartIcon,
  ChefHatIcon,
  ChevronDownIcon,
  DownloadIcon,
  HelpIcon,
  LightbulbIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  SaveIcon,
  ShareIcon,
  SortIcon,
  SparklesIcon,
  TrashIcon,
} from "../../_components/icons";
import { useHouseholdList, useHouseholdLists } from "../../_lib/hooks";
import {
  HOUSEHOLD_CATEGORIES,
  HOUSEHOLD_FREQUENTLY_TOGETHER,
  HOUSEHOLD_SUGGESTIONS,
  HouseholdCategory,
  HouseholdGroceryList,
  HouseholdItem,
  UNITS,
  generateId,
} from "../../_lib/store";

type Tab = "all" | "by-category";

type CategoryStyle = {
  headerBg: string;
  headerText: string;
  iconBg: string;
  iconText: string;
  dot: string;
};

const CATEGORY_STYLES: Record<HouseholdCategory, CategoryStyle> = {
  Vegetables: {
    headerBg: "bg-green-50",
    headerText: "text-green-700",
    iconBg: "bg-green-100",
    iconText: "text-green-700",
    dot: "bg-green-500",
  },
  Fruits: {
    headerBg: "bg-rose-50",
    headerText: "text-rose-700",
    iconBg: "bg-rose-100",
    iconText: "text-rose-700",
    dot: "bg-rose-500",
  },
  Dairy: {
    headerBg: "bg-sky-50",
    headerText: "text-sky-700",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    dot: "bg-sky-500",
  },
  Staples: {
    headerBg: "bg-amber-50",
    headerText: "text-amber-700",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    dot: "bg-amber-500",
  },
  Snacks: {
    headerBg: "bg-orange-50",
    headerText: "text-orange-700",
    iconBg: "bg-orange-100",
    iconText: "text-orange-700",
    dot: "bg-orange-500",
  },
  Beverages: {
    headerBg: "bg-cyan-50",
    headerText: "text-cyan-700",
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-700",
    dot: "bg-cyan-500",
  },
  Breakfast: {
    headerBg: "bg-yellow-50",
    headerText: "text-yellow-800",
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  "Personal Care": {
    headerBg: "bg-zinc-50",
    headerText: "text-zinc-700",
    iconBg: "bg-zinc-100",
    iconText: "text-zinc-600",
    dot: "bg-zinc-400",
  },
  Others: {
    headerBg: "bg-fuchsia-50",
    headerText: "text-fuchsia-700",
    iconBg: "bg-fuchsia-100",
    iconText: "text-fuchsia-700",
    dot: "bg-fuchsia-500",
  },
};

const CATEGORY_EMOJIS: Record<HouseholdCategory, string> = {
  Vegetables: "🥬",
  Fruits: "🍎",
  Dairy: "🥛",
  Staples: "🌾",
  Snacks: "🍪",
  Beverages: "🥤",
  Breakfast: "🍳",
  "Personal Care": "🧴",
  Others: "🛒",
};

const SUGGESTION_CATEGORIES: HouseholdCategory[] = [
  "Fruits",
  "Snacks",
  "Beverages",
  "Breakfast",
  "Personal Care",
];

/** Blank or invalid quantity defaults to 1 when adding a household item. */
function householdQuantityFromInput(raw: string): number {
  const t = raw.trim();
  if (t === "") return 1;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return 1;
  return n;
}

/** Blank unit defaults to pcs when adding a household item. */
function householdUnitFromInput(raw: string): string {
  const t = raw.trim();
  return t === "" ? "pcs" : t;
}

export default function HouseholdListPage() {
  const router = useRouter();
  const householdUnitListId = useId();
  const [items, setItems, ready] = useHouseholdList();
  const [savedLists, setSavedLists] = useHouseholdLists();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<HouseholdCategory | "">("");
  const [quantityInput, setQuantityInput] = useState("");
  const [unit, setUnit] = useState("pcs");

  const [tab, setTab] = useState<Tab>("all");
  const [collapsedCats, setCollapsedCats] = useState<Set<HouseholdCategory>>(
    new Set(),
  );
  const [filterCat, setFilterCat] = useState<HouseholdCategory | null>(null);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saveModal, setSaveModal] = useState(false);
  const [listName, setListName] = useState("");

  const totalQty = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const itemCount = items.length;

  const grouped = useMemo(() => groupByCategory(items, sortAlpha), [
    items,
    sortAlpha,
  ]);

  const flat = useMemo(() => {
    const sorted = [...items];
    if (sortAlpha) {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [items, sortAlpha]);

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!category) return;
    const next: HouseholdItem = {
      id: generateId("hh"),
      name: trimmed,
      category,
      quantity: householdQuantityFromInput(quantityInput),
      unit: householdUnitFromInput(unit),
      picked: false,
    };
    setItems([...items, next]);
    setName("");
    setQuantityInput("");
  }

  function updateItem(id: string, patch: Partial<HouseholdItem>) {
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems(items.filter((it) => it.id !== id));
  }

  function clearAll() {
    if (items.length === 0) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm("Clear all items from your list?");
      if (!ok) return;
    }
    setItems([]);
    flashToast("List cleared");
  }

  function toggleCategoryCollapsed(cat: HouseholdCategory) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function quickAddCategory(cat: HouseholdCategory) {
    const presets = HOUSEHOLD_SUGGESTIONS[cat];
    if (!presets) return;
    const additions: HouseholdItem[] = [];
    const existingNames = new Set(items.map((it) => it.name.toLowerCase()));
    for (const preset of presets) {
      if (existingNames.has(preset.name.toLowerCase())) continue;
      additions.push({
        id: generateId("hh"),
        name: preset.name,
        quantity: preset.quantity,
        unit: preset.unit,
        category: preset.category,
        picked: false,
      });
    }
    if (additions.length === 0) {
      flashToast(`${cat} suggestions already added`);
      return;
    }
    setItems([...items, ...additions]);
    flashToast(`Added ${additions.length} ${cat.toLowerCase()} item${additions.length === 1 ? "" : "s"}`);
  }

  function addFrequentlyTogether() {
    const additions: HouseholdItem[] = [];
    const existingNames = new Set(items.map((it) => it.name.toLowerCase()));
    for (const preset of HOUSEHOLD_FREQUENTLY_TOGETHER) {
      if (existingNames.has(preset.name.toLowerCase())) continue;
      additions.push({
        id: generateId("hh"),
        name: preset.name,
        quantity: preset.quantity,
        unit: preset.unit,
        category: preset.category,
        picked: false,
      });
    }
    if (additions.length === 0) {
      flashToast("All suggested items are already in your list");
      return;
    }
    setItems([...items, ...additions]);
    flashToast("Added Tomatoes, Onions, Potatoes");
  }

  function buildPlainText() {
    const lines = ["Grocery list", ""];
    for (const cat of HOUSEHOLD_CATEGORIES) {
      const inCat = items.filter((it) => it.category === cat);
      if (inCat.length === 0) continue;
      lines.push(`${cat}`);
      for (const it of inCat) {
        const checkbox = it.picked ? "[x]" : "[ ]";
        lines.push(`  ${checkbox} ${it.name} — ${it.quantity} ${it.unit}`);
      }
      lines.push("");
    }
    return lines.join("\n").trim();
  }

  async function handleShare() {
    const text = buildPlainText();
    if (!text) {
      flashToast("Add items before sharing");
      return;
    }
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Grocery list", text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      flashToast("List copied to clipboard");
    }
  }

  function handleDownload() {
    if (items.length === 0) {
      flashToast("Add items before downloading");
      return;
    }
    const rows = ["Item,Category,Quantity,Unit,Picked"];
    for (const it of items) {
      const safeName = `"${it.name.replace(/"/g, '""')}"`;
      rows.push(
        `${safeName},${it.category},${it.quantity},${it.unit},${it.picked ? "yes" : "no"}`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function openSaveModal() {
    if (items.length === 0) {
      flashToast("Add items before saving");
      return;
    }
    setListName(defaultListName());
    setSaveModal(true);
  }

  function handleSaveSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = listName.trim() || defaultListName();
    const now = new Date().toISOString();
    const snapshot: HouseholdGroceryList = {
      id: generateId("hlist"),
      name: trimmed,
      createdAt: now,
      updatedAt: now,
      items: items.map((it) => ({ ...it })),
    };
    setSavedLists([snapshot, ...savedLists]);
    setSaveModal(false);
    router.push(`/grocery-lists/household/${snapshot.id}`);
  }

  return (
    <>
      <datalist id={householdUnitListId}>
        {UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <TopBar />

      <main className="flex-1 px-10 pb-16 pt-6 print:px-0 print:pt-0">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] print:grid-cols-1">
          <section className="space-y-5">
            <AddItemBar
              name={name}
              setName={setName}
              category={category}
              setCategory={setCategory}
              quantityInput={quantityInput}
              setQuantityInput={setQuantityInput}
              unit={unit}
              setUnit={setUnit}
              unitListId={householdUnitListId}
              onSubmit={handleAddItem}
            />
            <p className="text-[11px] text-zinc-500">
              Quantity is optional — leave blank to add with a quantity of{" "}
              <span className="font-medium text-zinc-700">1</span>. Unit is free
              text (suggestions from common units); blank defaults to{" "}
              <span className="font-medium text-zinc-700">pcs</span>.
            </p>

            <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] print:border-none print:shadow-none">
              <Tabs
                tab={tab}
                setTab={setTab}
                count={itemCount}
                onClearAll={clearAll}
                onToggleSort={() => setSortAlpha((s) => !s)}
                sortAlpha={sortAlpha}
              />

              {!ready ? (
                <ListSkeleton />
              ) : items.length === 0 ? (
                <EmptyState />
              ) : tab === "all" ? (
                <GroupedList
                  grouped={grouped}
                  collapsedCats={collapsedCats}
                  onToggleCollapsed={toggleCategoryCollapsed}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  unitListId={householdUnitListId}
                />
              ) : (
                <FlatByCategoryList
                  items={flat}
                  filterCat={filterCat}
                  setFilterCat={setFilterCat}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  unitListId={householdUnitListId}
                />
              )}
            </div>
          </section>

          <aside className="space-y-5 print:hidden">
            <SummaryCard
              count={itemCount}
              totalQty={totalQty}
              onSave={openSaveModal}
            />
            <QuickAddCard
              onQuickAdd={quickAddCategory}
              moreOpen={moreOpen}
              setMoreOpen={setMoreOpen}
            />
            <SmartTipCard onAddAll={addFrequentlyTogether} />
            <ActionsCard
              onShare={handleShare}
              onDownload={handleDownload}
              onPrint={handlePrint}
              onClear={clearAll}
            />
          </aside>
        </div>
      </main>

      {saveModal ? (
        <SaveModal
          listName={listName}
          setListName={setListName}
          onCancel={() => setSaveModal(false)}
          onSubmit={handleSaveSnapshot}
          itemCount={itemCount}
        />
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-lg print:hidden">
          {toast}
        </div>
      ) : null}
    </>
  );
}

function defaultListName() {
  const now = new Date();
  return `Shopping list — ${now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`;
}

type SaveModalProps = {
  listName: string;
  setListName: (val: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  itemCount: number;
};

function SaveModal({
  listName,
  setListName,
  onCancel,
  onSubmit,
  itemCount,
}: SaveModalProps) {
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-900/40 px-4 print:hidden"
      onClick={onCancel}
    >
      <form
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-violet-50 text-violet-600">
            <SaveIcon className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-zinc-900">
            Save this list
          </h2>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Saving creates a snapshot you can revisit and tick off as you shop.
          {itemCount > 0 ? ` ${itemCount} items will be saved.` : ""}
        </p>
        <label className="mt-5 block">
          <span className="text-xs font-medium text-zinc-700">List name</span>
          <input
            type="text"
            autoFocus
            value={listName}
            onChange={(event) => setListName(event.target.value)}
            placeholder="e.g. Weekly groceries"
            className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <SaveIcon className="h-4 w-4" />
            Save list
          </button>
        </div>
      </form>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-white px-10 py-5 print:hidden">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Create New Grocery List{" "}
          <span className="font-medium text-zinc-500">(Household)</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add items manually or use smart suggestions to build your list.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100"
        >
          <ChefHatIcon className="h-4 w-4" />
          Switch to Catering Mode
        </Link>
        <button
          type="button"
          aria-label="Help"
          className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          <HelpIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          <BellIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type AddItemBarProps = {
  name: string;
  setName: (val: string) => void;
  category: HouseholdCategory | "";
  setCategory: (val: HouseholdCategory | "") => void;
  quantityInput: string;
  setQuantityInput: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  unitListId: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function AddItemBar({
  name,
  setName,
  category,
  setCategory,
  quantityInput,
  setQuantityInput,
  unit,
  setUnit,
  unitListId,
  onSubmit,
}: AddItemBarProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-[1.6fr_1.2fr_0.6fr_0.8fr_auto]"
    >
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Add an item..."
        aria-label="Item name"
        className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      <SelectInput
        value={category}
        onChange={(value) => setCategory(value as HouseholdCategory | "")}
        options={[
          { value: "", label: "Select Category" },
          ...HOUSEHOLD_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
        ]}
      />
      <input
        type="number"
        min={0}
        step="any"
        value={quantityInput}
        onChange={(event) => setQuantityInput(event.target.value)}
        placeholder="optional"
        aria-label="Quantity (optional, defaults to 1)"
        className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      <input
        type="text"
        value={unit}
        onChange={(event) => setUnit(event.target.value)}
        list={unitListId}
        placeholder="pcs, g…"
        aria-label="Unit (optional suggestions)"
        className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      <button
        type="submit"
        disabled={!name.trim() || !category}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
      >
        <PlusIcon className="h-4 w-4" />
        Add Item
      </button>
    </form>
  );
}

type SelectOption = { value: string; label: string };

function SelectInput({
  value,
  onChange,
  options,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  compact?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 ${compact ? "pl-3 pr-7" : "pl-3 pr-9"} text-sm text-zinc-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 ${compact ? "right-2" : "right-3"}`}
      />
    </div>
  );
}

type TabsProps = {
  tab: Tab;
  setTab: (tab: Tab) => void;
  count: number;
  onClearAll: () => void;
  onToggleSort: () => void;
  sortAlpha: boolean;
};

function Tabs({
  tab,
  setTab,
  count,
  onClearAll,
  onToggleSort,
  sortAlpha,
}: TabsProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 px-4">
      <div className="flex items-center gap-6">
        <TabButton
          active={tab === "all"}
          onClick={() => setTab("all")}
          label={`All Items (${count})`}
        />
        <TabButton
          active={tab === "by-category"}
          onClick={() => setTab("by-category")}
          label="By Category"
        />
      </div>
      <div className="flex items-center gap-4 py-2 text-xs text-zinc-500">
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-rose-600"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Clear All
        </button>
        <button
          type="button"
          onClick={onToggleSort}
          className={`inline-flex items-center gap-1.5 transition-colors hover:text-violet-600 ${sortAlpha ? "text-violet-600" : ""}`}
        >
          <SortIcon className="h-3.5 w-3.5" />
          Sort
        </button>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative py-3 text-sm font-medium transition-colors ${active ? "text-violet-700" : "text-zinc-500 hover:text-zinc-800"}`}
    >
      {label}
      {active ? (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet-600" />
      ) : null}
    </button>
  );
}

type GroupedListProps = {
  grouped: Array<{ category: HouseholdCategory; items: HouseholdItem[] }>;
  collapsedCats: Set<HouseholdCategory>;
  onToggleCollapsed: (cat: HouseholdCategory) => void;
  onUpdate: (id: string, patch: Partial<HouseholdItem>) => void;
  onRemove: (id: string) => void;
  unitListId: string;
};

function GroupedList({
  grouped,
  collapsedCats,
  onToggleCollapsed,
  onUpdate,
  onRemove,
  unitListId,
}: GroupedListProps) {
  return (
    <div className="divide-y divide-zinc-100">
      {grouped.map(({ category, items }) => {
        const style = CATEGORY_STYLES[category];
        const collapsed = collapsedCats.has(category);
        return (
          <div key={category}>
            <button
              type="button"
              onClick={() => onToggleCollapsed(category)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors ${style.headerBg}`}
            >
              <span
                className={`flex items-center gap-2 text-sm font-semibold ${style.headerText}`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md ${style.iconBg} text-base leading-none`}
                  aria-hidden
                >
                  {CATEGORY_EMOJIS[category]}
                </span>
                {category}{" "}
                <span className="text-xs font-normal opacity-80">
                  ({items.length})
                </span>
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 ${style.headerText} transition-transform ${collapsed ? "-rotate-90" : ""}`}
              />
            </button>
            {!collapsed ? (
              <div className="divide-y divide-zinc-50">
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    unitListId={unitListId}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type FlatByCategoryListProps = {
  items: HouseholdItem[];
  filterCat: HouseholdCategory | null;
  setFilterCat: (cat: HouseholdCategory | null) => void;
  onUpdate: (id: string, patch: Partial<HouseholdItem>) => void;
  onRemove: (id: string) => void;
  unitListId: string;
};

function FlatByCategoryList({
  items,
  filterCat,
  setFilterCat,
  onUpdate,
  onRemove,
  unitListId,
}: FlatByCategoryListProps) {
  const presentCats = HOUSEHOLD_CATEGORIES.filter((cat) =>
    items.some((it) => it.category === cat),
  );
  const filtered = filterCat
    ? items.filter((it) => it.category === filterCat)
    : items;
  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 px-4 py-3">
        <FilterChip
          active={filterCat === null}
          onClick={() => setFilterCat(null)}
          label={`All (${items.length})`}
        />
        {presentCats.map((cat) => (
          <FilterChip
            key={cat}
            active={filterCat === cat}
            onClick={() => setFilterCat(cat)}
            label={`${cat} (${items.filter((it) => it.category === cat).length})`}
            dot={CATEGORY_STYLES[cat].dot}
          />
        ))}
      </div>
      <div className="divide-y divide-zinc-50">
        {filtered.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onRemove={onRemove}
            showCategory
            unitListId={unitListId}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-violet-200 bg-violet-50 text-violet-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
    >
      {dot ? <span className={`h-2 w-2 rounded-full ${dot}`} /> : null}
      {label}
    </button>
  );
}

type ItemRowProps = {
  item: HouseholdItem;
  onUpdate: (id: string, patch: Partial<HouseholdItem>) => void;
  onRemove: (id: string) => void;
  showCategory?: boolean;
  unitListId: string;
};

function ItemRow({
  item,
  onUpdate,
  onRemove,
  showCategory,
  unitListId,
}: ItemRowProps) {
  const style = CATEGORY_STYLES[item.category];
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={item.picked}
        onChange={(event) => onUpdate(item.id, { picked: event.target.checked })}
        aria-label={`Mark ${item.name} as picked`}
        className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
      />
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-sm font-medium ${item.picked ? "text-zinc-400 line-through" : "text-zinc-900"}`}
        >
          {item.name}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
          <span>
            {formatQty(item.quantity)} {item.unit}
          </span>
          {showCategory ? (
            <>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {item.category}
              </span>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white">
        <button
          type="button"
          onClick={() =>
            onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })
          }
          aria-label={`Decrease ${item.name}`}
          className="grid h-8 w-8 place-items-center text-zinc-500 transition-colors hover:bg-zinc-50"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[2ch] text-center text-sm font-medium tabular-nums text-zinc-800">
          {formatQty(item.quantity)}
        </span>
        <button
          type="button"
          onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
          aria-label={`Increase ${item.name}`}
          className="grid h-8 w-8 place-items-center text-zinc-500 transition-colors hover:bg-zinc-50"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        value={item.unit}
        onChange={(event) =>
          onUpdate(item.id, { unit: event.target.value })
        }
        list={unitListId}
        aria-label={`Unit for ${item.name}`}
        className="h-8 w-[4.5rem] rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 px-4 py-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-violet-50 text-violet-600">
        <CartIcon className="h-6 w-6" />
      </span>
      <p className="mt-1 text-sm font-medium text-zinc-800">
        Your list is empty
      </p>
      <p className="text-xs text-zinc-500">
        Add an item above or pick a quick suggestion to get started.
      </p>
    </div>
  );
}

function SummaryCard({
  count,
  totalQty,
  onSave,
}: {
  count: number;
  totalQty: number;
  onSave: () => void;
}) {
  const disabled = count === 0;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-violet-600">
          <BasketIcon className="h-4 w-4" />
        </span>
        List Summary
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-violet-100 text-violet-600">
          <BasketIcon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-2xl font-semibold text-zinc-900">
            {count} <span className="text-sm font-medium text-zinc-500">items</span>
          </div>
          <div className="text-xs text-zinc-500">
            Total Quantity: {formatQty(totalQty)} units
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
      >
        View / Manage List
        <ArrowIcon />
      </button>
      <p className="mt-2 text-center text-[11px] text-zinc-500">
        Saves a snapshot you can revisit anytime
      </p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

type QuickAddCardProps = {
  onQuickAdd: (cat: HouseholdCategory) => void;
  moreOpen: boolean;
  setMoreOpen: (open: boolean) => void;
};

function QuickAddCard({
  onQuickAdd,
  moreOpen,
  setMoreOpen,
}: QuickAddCardProps) {
  const remaining = HOUSEHOLD_CATEGORIES.filter(
    (cat) => !SUGGESTION_CATEGORIES.includes(cat),
  );
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-violet-600">
          <SparklesIcon className="h-4 w-4" />
        </span>
        Quick Add from Suggestions
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {SUGGESTION_CATEGORIES.map((cat) => (
          <SuggestionChip
            key={cat}
            label={cat}
            color={CATEGORY_STYLES[cat].iconText}
            bg={CATEGORY_STYLES[cat].iconBg}
            emoji={CATEGORY_EMOJIS[cat]}
            onClick={() => onQuickAdd(cat)}
          />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 bg-white px-2 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          More
        </button>
      </div>
      {moreOpen ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
          {remaining.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onQuickAdd(cat)}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <span>{CATEGORY_EMOJIS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SuggestionChip({
  label,
  emoji,
  bg,
  color,
  onClick,
}: {
  label: string;
  emoji: string;
  bg: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-100 bg-white px-2 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-200 hover:bg-zinc-50"
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-md ${bg} ${color} text-sm leading-none`}
      >
        {emoji}
      </span>
      {label}
    </button>
  );
}

function SmartTipCard({ onAddAll }: { onAddAll: () => void }) {
  const names = HOUSEHOLD_FREQUENTLY_TOGETHER.map((it) => it.name).join(", ");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-violet-600">
          <LightbulbIcon className="h-4 w-4" />
        </span>
        Smart Tip
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
        <PlusIcon className="h-3.5 w-3.5 text-violet-500" />
        Add items frequently bought together
      </p>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
        <span className="truncate text-xs text-zinc-700">{names}</span>
        <button
          type="button"
          onClick={onAddAll}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-50"
        >
          <PlusIcon className="h-3 w-3" /> Add All
        </button>
      </div>
    </div>
  );
}

type ActionsCardProps = {
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onClear: () => void;
};

function ActionsCard({
  onShare,
  onDownload,
  onPrint,
  onClear,
}: ActionsCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="text-sm font-semibold text-zinc-900">Actions</div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-zinc-600">
        <ActionButton onClick={onShare} icon={<ShareIcon className="h-4 w-4" />} label="Share List" />
        <ActionButton onClick={onDownload} icon={<DownloadIcon className="h-4 w-4" />} label="Download" />
        <ActionButton onClick={onPrint} icon={<PrinterIcon className="h-4 w-4" />} label="Print" />
        <ActionButton
          onClick={onClear}
          icon={<TrashIcon className="h-4 w-4" />}
          label="Clear List"
          danger
        />
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border border-transparent px-2 py-2.5 text-[11px] font-medium transition-colors ${danger ? "text-zinc-600 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600" : "text-zinc-600 hover:border-violet-100 hover:bg-violet-50 hover:text-violet-700"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function groupByCategory(items: HouseholdItem[], sortAlpha: boolean) {
  const map = new Map<HouseholdCategory, HouseholdItem[]>();
  for (const cat of HOUSEHOLD_CATEGORIES) {
    map.set(cat, []);
  }
  for (const item of items) {
    map.get(item.category)?.push(item);
  }
  const result: Array<{ category: HouseholdCategory; items: HouseholdItem[] }> = [];
  for (const cat of HOUSEHOLD_CATEGORIES) {
    const list = map.get(cat) ?? [];
    if (list.length === 0) continue;
    const ordered = sortAlpha
      ? [...list].sort((a, b) => a.name.localeCompare(b.name))
      : list;
    result.push({ category: cat, items: ordered });
  }
  return result;
}

function formatQty(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}
