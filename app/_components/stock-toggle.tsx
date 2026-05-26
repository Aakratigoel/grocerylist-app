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
      className="inline-flex w-44 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 p-1 sm:w-auto"
    >
      <button
        type="button"
        onClick={() => onPick(false)}
        aria-pressed={!inStock}
        className={`min-h-10 flex-1 touch-manipulation rounded-md px-2 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:min-h-9 sm:flex-none sm:px-3 sm:text-[11px] ${
          !inStock
            ? "bg-white text-amber-900 shadow-sm ring-1 ring-zinc-200/80"
            : "text-zinc-500 active:bg-zinc-200/60 hover:text-zinc-800"
        }`}
      >
        To buy
      </button>
      <button
        type="button"
        onClick={() => onPick(true)}
        aria-pressed={inStock}
        className={`min-h-10 flex-1 touch-manipulation rounded-md px-2 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:min-h-9 sm:flex-none sm:px-3 sm:text-[11px] ${
          inStock
            ? "bg-white text-green-900 shadow-sm ring-1 ring-zinc-200/80"
            : "text-zinc-500 active:bg-zinc-200/60 hover:text-zinc-800"
        }`}
      >
        In stock
      </button>
    </div>
  );
}
