export type WizardStep = {
  number: number;
  label: string;
  href: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: "Order Details", href: "/orders/new" },
  { number: 2, label: "Select Menu Items", href: "/orders/new/menu-items" },
  {
    number: 3,
    label: "Ingredients & Inventory",
    href: "/orders/new/inventory",
  },
  { number: 4, label: "Review", href: "/orders/new/review" },
  { number: 5, label: "Grocery List", href: "/orders/new/grocery-list" },
];

export function stepNumberFromPath(pathname: string): number {
  const match = WIZARD_STEPS.find((step) => step.href === pathname);
  return match?.number ?? 1;
}
