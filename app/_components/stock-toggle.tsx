"use client";

/** Two-way control: grocery list excludes “In stock”; “To buy” lines appear on the shopping list. */
export function StockToggle({
  inStock,
  onPick,
}: {
  inStock: boolean;
  onPick: (nextInStock: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Stock vs buy"
      className="inline-flex shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5"
    >
      <button
        type="button"
        onClick={() => onPick(false)}
        aria-pressed={!inStock}
        className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:px-2.5 sm:text-[11px] ${
          !inStock
            ? "bg-white text-amber-900 shadow-sm ring-1 ring-zinc-200/80"
            : "text-zinc-500 hover:text-zinc-800"
        }`}
      >
        To buy
      </button>
      <button
        type="button"
        onClick={() => onPick(true)}
        aria-pressed={inStock}
        className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:px-2.5 sm:text-[11px] ${
          inStock
            ? "bg-white text-green-900 shadow-sm ring-1 ring-zinc-200/80"
            : "text-zinc-500 hover:text-zinc-800"
        }`}
      >
        In stock
      </button>
    </div>
  );
}
