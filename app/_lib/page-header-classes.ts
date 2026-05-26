/**
 * Clears fixed hamburger (~pl-14) and respects notched devices (safe-area).
 */
export const PAGE_HEADER_SHELL =
  "min-w-0 gap-3 border-b border-zinc-200 bg-white px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pl-14 sm:px-8 sm:py-5 sm:pb-5 sm:pl-8 sm:pt-5 lg:px-10";

/** Typical page toolbar — add nothing, or tweak with `justify-*` overrides. */
export const PAGE_HEADER_CLASS = `flex flex-wrap justify-between sm:flex-nowrap ${PAGE_HEADER_SHELL}`;

/** Menu catalog: stacks title vs. controls on narrow screens without overflow. */
export const MENU_ITEMS_HEADER_CLASS = `flex flex-col justify-between sm:flex-row sm:flex-nowrap sm:items-center ${PAGE_HEADER_SHELL}`;

export const WIZARD_PROGRESS_STRIP_CLASS =
  "overflow-x-auto border-b border-zinc-200 bg-white px-4 pb-5 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pl-14 sm:px-8 sm:pb-6 sm:pt-7 sm:pl-8 lg:px-10";
