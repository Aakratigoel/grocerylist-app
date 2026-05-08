export type Unit = "g" | "kg" | "ml" | "l" | "pcs" | "tsp" | "tbsp" | "cup";

export const UNITS: Unit[] = [
  "g",
  "kg",
  "ml",
  "l",
  "pcs",
  "tsp",
  "tbsp",
  "cup",
];

export type IngredientCategory =
  | "Produce"
  | "Dairy"
  | "Meat & Poultry"
  | "Pantry"
  | "Spices"
  | "Bakery"
  | "Other";

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "Produce",
  "Dairy",
  "Meat & Poultry",
  "Pantry",
  "Spices",
  "Bakery",
  "Other",
];

export type Ingredient = {
  id: string;
  name: string;
  unit: Unit;
  category: IngredientCategory;
};

export type MenuItemIngredient = {
  ingredientId: string;
  quantityPerServing: number;
};

export type MenuItemCategory =
  | "Starter"
  | "Main"
  | "Side"
  | "Bread"
  | "Dessert"
  | "Beverage";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuItemCategory;
  description?: string;
  ingredients: MenuItemIngredient[];
};

export type DraftOrder = {
  clientName: string;
  eventName: string;
  eventDate: string;
  guestCount: number;
  eventTime: string;
  venue: string;
  notes: string;
  selectedMenuItemIds: string[];
  inStockIngredientIds: string[];
  extraItems: GroceryListLine[];
};

export type GroceryListLine = {
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number;
  unit: Unit;
  category: IngredientCategory;
  inStock: boolean;
  custom?: boolean;
};

export type GroceryList = {
  id: string;
  createdAt: string;
  order: DraftOrder;
  lines: GroceryListLine[];
};

export type Client = {
  id: string;
  name: string;
  createdAt: string;
};

export type OrderStatus = "draft" | "completed";

export type Order = {
  id: string;
  clientId: string;
  clientName: string;
  eventName: string;
  eventDate: string;
  guestCount: number;
  eventTime: string;
  venue: string;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  groceryListId: string;
};

export type HouseholdCategory =
  | "Vegetables"
  | "Fruits"
  | "Dairy"
  | "Staples"
  | "Snacks"
  | "Beverages"
  | "Breakfast"
  | "Personal Care"
  | "Others";

export const HOUSEHOLD_CATEGORIES: HouseholdCategory[] = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Staples",
  "Snacks",
  "Beverages",
  "Breakfast",
  "Personal Care",
  "Others",
];

export type HouseholdItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: HouseholdCategory;
  picked: boolean;
};

export type HouseholdGroceryList = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: HouseholdItem[];
};

export const STORAGE_KEYS = {
  ingredients: "gl.ingredients",
  menuItems: "gl.menuItems",
  draftOrder: "gl.draftOrder",
  groceryLists: "gl.groceryLists",
  clients: "gl.clients",
  orders: "gl.orders",
  householdDraft: "gl.householdDraft",
  householdLists: "gl.householdLists",
  seeded: "gl.seeded",
} as const;

type SuggestionTemplate = Omit<HouseholdItem, "id" | "picked">;

export const HOUSEHOLD_SUGGESTIONS: Record<string, SuggestionTemplate[]> = {
  Fruits: [
    { name: "Apples", quantity: 6, unit: "pcs", category: "Fruits" },
    { name: "Bananas", quantity: 1, unit: "kg", category: "Fruits" },
    { name: "Oranges", quantity: 4, unit: "pcs", category: "Fruits" },
  ],
  Snacks: [
    { name: "Chips", quantity: 1, unit: "pcs", category: "Snacks" },
    { name: "Biscuits", quantity: 2, unit: "pcs", category: "Snacks" },
    { name: "Nuts", quantity: 250, unit: "g", category: "Snacks" },
  ],
  Beverages: [
    { name: "Tea", quantity: 250, unit: "g", category: "Beverages" },
    { name: "Coffee", quantity: 200, unit: "g", category: "Beverages" },
    { name: "Juice", quantity: 1, unit: "l", category: "Beverages" },
  ],
  Breakfast: [
    { name: "Bread", quantity: 1, unit: "pcs", category: "Breakfast" },
    { name: "Eggs", quantity: 12, unit: "pcs", category: "Breakfast" },
    { name: "Oats", quantity: 500, unit: "g", category: "Breakfast" },
  ],
  "Personal Care": [
    { name: "Soap", quantity: 2, unit: "pcs", category: "Personal Care" },
    { name: "Shampoo", quantity: 1, unit: "pcs", category: "Personal Care" },
    { name: "Toothpaste", quantity: 1, unit: "pcs", category: "Personal Care" },
  ],
};

export const HOUSEHOLD_FREQUENTLY_TOGETHER: SuggestionTemplate[] = [
  { name: "Tomatoes", quantity: 1, unit: "kg", category: "Vegetables" },
  { name: "Onions", quantity: 1, unit: "kg", category: "Vegetables" },
  { name: "Potatoes", quantity: 2, unit: "kg", category: "Vegetables" },
];

export const STORE_UPDATE_EVENT = "gl:store-update";

export const EMPTY_DRAFT: DraftOrder = {
  clientName: "",
  eventName: "",
  eventDate: "",
  guestCount: 0,
  eventTime: "",
  venue: "",
  notes: "",
  selectedMenuItemIds: [],
  inStockIngredientIds: [],
  extraItems: [],
};

export const SEED_INGREDIENTS: Ingredient[] = [
  { id: "ing-paneer", name: "Paneer", unit: "g", category: "Dairy" },
  { id: "ing-butter", name: "Butter", unit: "g", category: "Dairy" },
  { id: "ing-cream", name: "Cream", unit: "ml", category: "Dairy" },
  { id: "ing-yogurt", name: "Yogurt", unit: "g", category: "Dairy" },
  { id: "ing-milk", name: "Milk", unit: "ml", category: "Dairy" },
  { id: "ing-khoya", name: "Khoya (Mawa)", unit: "g", category: "Dairy" },
  { id: "ing-tomato", name: "Tomato", unit: "g", category: "Produce" },
  { id: "ing-onion", name: "Onion", unit: "g", category: "Produce" },
  { id: "ing-ginger", name: "Ginger", unit: "g", category: "Produce" },
  { id: "ing-garlic", name: "Garlic", unit: "g", category: "Produce" },
  { id: "ing-mint", name: "Mint", unit: "g", category: "Produce" },
  { id: "ing-coriander", name: "Coriander leaves", unit: "g", category: "Produce" },
  { id: "ing-chicken", name: "Chicken", unit: "g", category: "Meat & Poultry" },
  { id: "ing-rice-basmati", name: "Basmati rice", unit: "g", category: "Pantry" },
  { id: "ing-flour-aata", name: "Whole wheat flour", unit: "g", category: "Pantry" },
  { id: "ing-flour-maida", name: "All-purpose flour", unit: "g", category: "Pantry" },
  { id: "ing-dal-urad", name: "Black lentils (Urad dal)", unit: "g", category: "Pantry" },
  { id: "ing-rajma", name: "Kidney beans (Rajma)", unit: "g", category: "Pantry" },
  { id: "ing-sugar", name: "Sugar", unit: "g", category: "Pantry" },
  { id: "ing-oil", name: "Cooking oil", unit: "ml", category: "Pantry" },
  { id: "ing-salt", name: "Salt", unit: "g", category: "Pantry" },
  { id: "ing-yeast", name: "Yeast", unit: "g", category: "Pantry" },
  { id: "ing-cumin", name: "Cumin", unit: "g", category: "Spices" },
  { id: "ing-garam-masala", name: "Garam masala", unit: "g", category: "Spices" },
  { id: "ing-turmeric", name: "Turmeric", unit: "g", category: "Spices" },
  { id: "ing-chili-red", name: "Red chili powder", unit: "g", category: "Spices" },
  { id: "ing-saffron", name: "Saffron", unit: "g", category: "Spices" },
  { id: "ing-cardamom", name: "Cardamom", unit: "g", category: "Spices" },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: "menu-paneer-butter-masala",
    name: "Paneer Butter Masala",
    category: "Main",
    description: "Cubes of paneer in a creamy tomato gravy.",
    ingredients: [
      { ingredientId: "ing-paneer", quantityPerServing: 100 },
      { ingredientId: "ing-butter", quantityPerServing: 15 },
      { ingredientId: "ing-tomato", quantityPerServing: 80 },
      { ingredientId: "ing-onion", quantityPerServing: 60 },
      { ingredientId: "ing-cream", quantityPerServing: 20 },
      { ingredientId: "ing-ginger", quantityPerServing: 3 },
      { ingredientId: "ing-garlic", quantityPerServing: 3 },
      { ingredientId: "ing-garam-masala", quantityPerServing: 2 },
      { ingredientId: "ing-turmeric", quantityPerServing: 1 },
      { ingredientId: "ing-chili-red", quantityPerServing: 1 },
      { ingredientId: "ing-salt", quantityPerServing: 2 },
      { ingredientId: "ing-oil", quantityPerServing: 5 },
    ],
  },
  {
    id: "menu-chicken-biryani",
    name: "Chicken Biryani",
    category: "Main",
    description: "Layered basmati rice with marinated chicken and spices.",
    ingredients: [
      { ingredientId: "ing-rice-basmati", quantityPerServing: 80 },
      { ingredientId: "ing-chicken", quantityPerServing: 150 },
      { ingredientId: "ing-onion", quantityPerServing: 50 },
      { ingredientId: "ing-yogurt", quantityPerServing: 30 },
      { ingredientId: "ing-saffron", quantityPerServing: 0.1 },
      { ingredientId: "ing-mint", quantityPerServing: 5 },
      { ingredientId: "ing-coriander", quantityPerServing: 5 },
      { ingredientId: "ing-ginger", quantityPerServing: 4 },
      { ingredientId: "ing-garlic", quantityPerServing: 4 },
      { ingredientId: "ing-garam-masala", quantityPerServing: 2 },
      { ingredientId: "ing-cumin", quantityPerServing: 1 },
      { ingredientId: "ing-cardamom", quantityPerServing: 1 },
      { ingredientId: "ing-oil", quantityPerServing: 10 },
      { ingredientId: "ing-salt", quantityPerServing: 3 },
    ],
  },
  {
    id: "menu-dal-makhani",
    name: "Dal Makhani",
    category: "Main",
    description: "Slow-cooked black lentils with butter and cream.",
    ingredients: [
      { ingredientId: "ing-dal-urad", quantityPerServing: 50 },
      { ingredientId: "ing-rajma", quantityPerServing: 20 },
      { ingredientId: "ing-butter", quantityPerServing: 15 },
      { ingredientId: "ing-cream", quantityPerServing: 15 },
      { ingredientId: "ing-tomato", quantityPerServing: 40 },
      { ingredientId: "ing-onion", quantityPerServing: 30 },
      { ingredientId: "ing-ginger", quantityPerServing: 3 },
      { ingredientId: "ing-garlic", quantityPerServing: 3 },
      { ingredientId: "ing-garam-masala", quantityPerServing: 1 },
      { ingredientId: "ing-salt", quantityPerServing: 2 },
    ],
  },
  {
    id: "menu-naan",
    name: "Butter Naan",
    category: "Bread",
    description: "Soft leavened flatbread brushed with butter.",
    ingredients: [
      { ingredientId: "ing-flour-maida", quantityPerServing: 80 },
      { ingredientId: "ing-yogurt", quantityPerServing: 15 },
      { ingredientId: "ing-yeast", quantityPerServing: 2 },
      { ingredientId: "ing-butter", quantityPerServing: 10 },
      { ingredientId: "ing-salt", quantityPerServing: 1 },
      { ingredientId: "ing-sugar", quantityPerServing: 2 },
    ],
  },
  {
    id: "menu-gulab-jamun",
    name: "Gulab Jamun",
    category: "Dessert",
    description: "Khoya dumplings soaked in cardamom-saffron sugar syrup.",
    ingredients: [
      { ingredientId: "ing-khoya", quantityPerServing: 30 },
      { ingredientId: "ing-flour-maida", quantityPerServing: 5 },
      { ingredientId: "ing-sugar", quantityPerServing: 50 },
      { ingredientId: "ing-cardamom", quantityPerServing: 1 },
      { ingredientId: "ing-saffron", quantityPerServing: 0.05 },
      { ingredientId: "ing-oil", quantityPerServing: 15 },
    ],
  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(STORAGE_KEYS.seeded) === "1") return;
  writeJson(STORAGE_KEYS.ingredients, SEED_INGREDIENTS);
  writeJson(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
  window.localStorage.setItem(STORAGE_KEYS.seeded, "1");
}

export function readIngredients(): Ingredient[] {
  return readJson<Ingredient[]>(STORAGE_KEYS.ingredients, SEED_INGREDIENTS);
}

export function writeIngredients(items: Ingredient[]) {
  writeJson(STORAGE_KEYS.ingredients, items);
}

export function readMenuItems(): MenuItem[] {
  return readJson<MenuItem[]>(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
}

export function writeMenuItems(items: MenuItem[]) {
  writeJson(STORAGE_KEYS.menuItems, items);
}

export function readDraftOrder(): DraftOrder {
  const raw = readJson<Partial<DraftOrder>>(STORAGE_KEYS.draftOrder, EMPTY_DRAFT);
  return { ...EMPTY_DRAFT, ...raw };
}

export function writeDraftOrder(draft: DraftOrder) {
  writeJson(STORAGE_KEYS.draftOrder, draft);
}

export function clearDraftOrder() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.draftOrder);
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
}

export function readGroceryLists(): GroceryList[] {
  return readJson<GroceryList[]>(STORAGE_KEYS.groceryLists, []);
}

export function writeGroceryLists(items: GroceryList[]) {
  writeJson(STORAGE_KEYS.groceryLists, items);
}

export function readClients(): Client[] {
  return readJson<Client[]>(STORAGE_KEYS.clients, []);
}

export function writeClients(items: Client[]) {
  writeJson(STORAGE_KEYS.clients, items);
}

export function readOrders(): Order[] {
  return readJson<Order[]>(STORAGE_KEYS.orders, []);
}

export function writeOrders(items: Order[]) {
  writeJson(STORAGE_KEYS.orders, items);
}

export function readHouseholdList(): HouseholdItem[] {
  return readJson<HouseholdItem[]>(STORAGE_KEYS.householdDraft, []);
}

export function writeHouseholdList(items: HouseholdItem[]) {
  writeJson(STORAGE_KEYS.householdDraft, items);
}

export function readHouseholdLists(): HouseholdGroceryList[] {
  return readJson<HouseholdGroceryList[]>(STORAGE_KEYS.householdLists, []);
}

export function writeHouseholdLists(items: HouseholdGroceryList[]) {
  writeJson(STORAGE_KEYS.householdLists, items);
}

export function upsertClientByName(
  clients: Client[],
  name: string,
): { clients: Client[]; client: Client } {
  const trimmed = name.trim();
  const existing = clients.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (existing) {
    return { clients, client: existing };
  }
  const created: Client = {
    id: generateId("client"),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  return { clients: [created, ...clients], client: created };
}

export function generateId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function aggregateGroceryLines(
  selectedMenuItems: MenuItem[],
  guestCount: number,
  ingredients: Ingredient[],
  inStockIds: Set<string>,
): GroceryListLine[] {
  const totals = new Map<string, number>();
  for (const menuItem of selectedMenuItems) {
    for (const item of menuItem.ingredients) {
      const current = totals.get(item.ingredientId) ?? 0;
      totals.set(item.ingredientId, current + item.quantityPerServing * guestCount);
    }
  }

  const lines: GroceryListLine[] = [];
  for (const [ingredientId, raw] of totals) {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    if (!ingredient) continue;
    lines.push({
      ingredientId,
      ingredientName: ingredient.name,
      totalQuantity: Math.round(raw * 100) / 100,
      unit: ingredient.unit,
      category: ingredient.category,
      inStock: inStockIds.has(ingredientId),
    });
  }

  return lines.sort((a, b) => {
    if (a.category === b.category) return a.ingredientName.localeCompare(b.ingredientName);
    return a.category.localeCompare(b.category);
  });
}

export function formatQuantity(quantity: number, unit: Unit): string {
  if (unit === "g" && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`;
  }
  if (unit === "ml" && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2).replace(/\.?0+$/, "")} l`;
  }
  const rounded = Math.round(quantity * 100) / 100;
  return `${rounded} ${unit}`;
}
