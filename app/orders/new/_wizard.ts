export type WizardStep = {
  number: number;
  label: string;
  href: string;
};

/** Entry from home / history / lists — clears draft so List details starts empty. */
export const NEW_GROCERY_LIST_START_HREF = "/orders/new?reset=1";

/** Query key on `/menu-items` — safe resume link back into the new-list wizard. */
export const MENU_ITEMS_RETURN_TO_QUERY = "returnTo";

const ALLOWED_WIZARD_RETURN_PATHS = new Set<string>([
  "/orders/new",
  "/orders/new/menu-items",
  "/orders/new/review",
  "/orders/new/grocery-list",
  "/orders/new/inventory",
]);

/** `returnTo` must be an exact wizard path (no open redirects). */
export function sanitizeWizardReturnTo(
  raw: string | null | undefined,
): string | null {
  if (raw == null || raw === "") return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  if (decoded.includes("..") || decoded.includes("//")) return null;
  if (decoded.includes("?") || decoded.includes("#")) return null;
  return ALLOWED_WIZARD_RETURN_PATHS.has(decoded) ? decoded : null;
}

/** Open Menu Items catalog from the wizard without losing the in-progress draft. */
export function menuItemsCatalogHrefFromWizard(returnPath: string): string {
  const safe = ALLOWED_WIZARD_RETURN_PATHS.has(returnPath)
    ? returnPath
    : "/orders/new/menu-items";
  const q = new URLSearchParams({ [MENU_ITEMS_RETURN_TO_QUERY]: safe });
  return `/menu-items?${q.toString()}`;
}

export const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: "List details", href: "/orders/new" },
  { number: 2, label: "Select Menu Items", href: "/orders/new/menu-items" },
  { number: 3, label: "Review", href: "/orders/new/review" },
  { number: 4, label: "Grocery List", href: "/orders/new/grocery-list" },
];

export function stepNumberFromPath(pathname: string): number {
  if (pathname === "/orders/new/inventory") return 3;
  const match = WIZARD_STEPS.find((step) => step.href === pathname);
  return match?.number ?? 1;
}
