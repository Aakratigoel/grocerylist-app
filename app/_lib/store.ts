/** Built-in units for suggestions and presets; ingredients may use any custom string. */
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

/** Free-text unit on ingredients and lists (e.g. g, pcs, bunch, pinch). */
export type IngredientUnit = string;

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
  unit: IngredientUnit;
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
  unit: IngredientUnit;
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
  unit: IngredientUnit;
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

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventoryRecord = {
  ingredientId: string;
  quantity: number;
  threshold: number;
  updatedAt: string;
};

export type AppMode = "catering" | "household";

export type AiProviderPreference = "auto" | "openai" | "gemini";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "AUD" | "CAD";

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] =
  [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  ];

export type Settings = {
  profileName: string;
  businessName: string;
  householdName: string;
  email: string;
  defaultMode: AppMode;
  defaultGuestCount: number;
  currency: CurrencyCode;
  aiProvider: AiProviderPreference;
  showLowStockBanner: boolean;
  onboarded: boolean;
};

// Empty defaults — the onboarding flow asks new users for these on first launch.
// Existing users keep whatever they previously saved.
export const DEFAULT_SETTINGS: Settings = {
  profileName: "",
  businessName: "",
  householdName: "",
  email: "",
  defaultMode: "catering",
  defaultGuestCount: 20,
  currency: "USD",
  aiProvider: "auto",
  showLowStockBanner: true,
  onboarded: false,
};

// True only when a brand-new user genuinely hasn't gone through the welcome flow.
// Existing users with prior data (orders, household lists, or a saved profile
// name) are treated as already-onboarded so we don't pester them.
export function shouldShowOnboarding(settings: Settings): boolean {
  if (settings.onboarded) return false;
  if (settings.profileName.trim().length > 0) return false;
  if (typeof window === "undefined") return false;
  try {
    const orders = window.localStorage.getItem(STORAGE_KEYS.orders);
    if (orders) {
      const parsed = JSON.parse(orders);
      if (Array.isArray(parsed) && parsed.length > 0) return false;
    }
    const lists = window.localStorage.getItem(STORAGE_KEYS.householdLists);
    if (lists) {
      const parsed = JSON.parse(lists);
      if (Array.isArray(parsed) && parsed.length > 0) return false;
    }
  } catch {
    // ignore parse errors — fall through to showing onboarding
  }
  return true;
}

export const APP_VERSION = "1.0.0";

export const STORAGE_KEYS = {
  ingredients: "gl.ingredients",
  menuItems: "gl.menuItems",
  draftOrder: "gl.draftOrder",
  groceryLists: "gl.groceryLists",
  clients: "gl.clients",
  orders: "gl.orders",
  householdDraft: "gl.householdDraft",
  householdLists: "gl.householdLists",
  inventory: "gl.inventory",
  settings: "gl.settings",
  mode: "gl.mode",
  seeded: "gl.seeded",
} as const;

export const COLLECTION_KEYS = [
  STORAGE_KEYS.ingredients,
  STORAGE_KEYS.menuItems,
  STORAGE_KEYS.draftOrder,
  STORAGE_KEYS.groceryLists,
  STORAGE_KEYS.clients,
  STORAGE_KEYS.orders,
  STORAGE_KEYS.householdDraft,
  STORAGE_KEYS.householdLists,
  STORAGE_KEYS.inventory,
  STORAGE_KEYS.settings,
] as const;

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

export const SEED_INVENTORY: InventoryRecord[] = (() => {
  const now = new Date().toISOString();
  const seeds: Array<[string, number, number]> = [
    ["ing-paneer", 800, 500],
    ["ing-butter", 300, 250],
    ["ing-cream", 200, 250],
    ["ing-yogurt", 1200, 500],
    ["ing-milk", 0, 1000],
    ["ing-khoya", 150, 200],
    ["ing-tomato", 4500, 2000],
    ["ing-onion", 6000, 2000],
    ["ing-ginger", 200, 250],
    ["ing-garlic", 300, 200],
    ["ing-mint", 80, 50],
    ["ing-coriander", 60, 100],
    ["ing-chicken", 2500, 2000],
    ["ing-rice-basmati", 8000, 3000],
    ["ing-flour-aata", 5000, 2000],
    ["ing-flour-maida", 3000, 1500],
    ["ing-dal-urad", 1500, 1000],
    ["ing-rajma", 800, 500],
    ["ing-sugar", 0, 1000],
    ["ing-oil", 4500, 2000],
    ["ing-salt", 2000, 500],
    ["ing-yeast", 80, 100],
    ["ing-cumin", 250, 100],
    ["ing-garam-masala", 180, 100],
    ["ing-turmeric", 350, 150],
    ["ing-chili-red", 220, 150],
    ["ing-saffron", 4, 5],
    ["ing-cardamom", 90, 50],
  ];
  return seeds.map(([ingredientId, quantity, threshold]) => ({
    ingredientId,
    quantity,
    threshold,
    updatedAt: now,
  }));
})();

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
  if (window.localStorage.getItem(STORAGE_KEYS.seeded) !== "1") {
    writeJson(STORAGE_KEYS.ingredients, SEED_INGREDIENTS);
    writeJson(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
    writeJson(STORAGE_KEYS.inventory, SEED_INVENTORY);
    window.localStorage.setItem(STORAGE_KEYS.seeded, "1");
    return;
  }
  // Backfill inventory for users who seeded before inventory existed.
  if (window.localStorage.getItem(STORAGE_KEYS.inventory) === null) {
    writeJson(STORAGE_KEYS.inventory, SEED_INVENTORY);
  }
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

export function readInventory(): InventoryRecord[] {
  return readJson<InventoryRecord[]>(STORAGE_KEYS.inventory, []);
}

export function writeInventory(items: InventoryRecord[]) {
  writeJson(STORAGE_KEYS.inventory, items);
}

export function getInventoryStatus(record: InventoryRecord): InventoryStatus {
  if (record.quantity <= 0) return "out_of_stock";
  if (record.quantity <= record.threshold) return "low_stock";
  return "in_stock";
}

export function readSettings(): Settings {
  const raw = readJson<Partial<Settings>>(STORAGE_KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...raw };
}

export function writeSettings(settings: Settings) {
  writeJson(STORAGE_KEYS.settings, settings);
}

// ---------------------------------------------------------------------------
// Bulk data management (used by Settings → Data section).
// ---------------------------------------------------------------------------

export type ExportPayload = {
  app: "grocerylist";
  version: string;
  exportedAt: string;
  data: Record<string, unknown>;
};

export function exportAllData(): ExportPayload {
  const data: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    for (const key of COLLECTION_KEYS) {
      const raw = window.localStorage.getItem(key);
      if (raw === null) continue;
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return {
    app: "grocerylist",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function importAllData(payload: unknown): {
  ok: boolean;
  imported: number;
  error?: string;
} {
  if (typeof window === "undefined") {
    return { ok: false, imported: 0, error: "Not in a browser" };
  }
  if (!payload || typeof payload !== "object") {
    return { ok: false, imported: 0, error: "Invalid backup file" };
  }
  const candidate = payload as { app?: unknown; data?: unknown };
  if (candidate.app !== "grocerylist") {
    return {
      ok: false,
      imported: 0,
      error: "This file isn't a GroceryList backup",
    };
  }
  if (!candidate.data || typeof candidate.data !== "object") {
    return { ok: false, imported: 0, error: "Backup is missing data" };
  }
  const allowed = new Set<string>(COLLECTION_KEYS);
  let imported = 0;
  for (const [key, value] of Object.entries(
    candidate.data as Record<string, unknown>,
  )) {
    if (!allowed.has(key)) continue;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      imported++;
    } catch {
      // skip individual key failures (e.g. quota exceeded)
    }
  }
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
  return { ok: true, imported };
}

export function resetSeedData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.seeded);
  writeJson(STORAGE_KEYS.ingredients, SEED_INGREDIENTS);
  writeJson(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
  writeJson(STORAGE_KEYS.inventory, SEED_INVENTORY);
  window.localStorage.setItem(STORAGE_KEYS.seeded, "1");
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  for (const key of COLLECTION_KEYS) {
    window.localStorage.removeItem(key);
  }
  window.localStorage.removeItem(STORAGE_KEYS.seeded);
  window.localStorage.removeItem(STORAGE_KEYS.mode);
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
}

export type StorageBreakdown = {
  key: string;
  label: string;
  bytes: number;
  count: number;
};

const STORAGE_LABELS: Record<string, string> = {
  [STORAGE_KEYS.ingredients]: "Ingredients",
  [STORAGE_KEYS.menuItems]: "Menu items",
  [STORAGE_KEYS.draftOrder]: "Draft order",
  [STORAGE_KEYS.groceryLists]: "Catering grocery lists",
  [STORAGE_KEYS.clients]: "Clients",
  [STORAGE_KEYS.orders]: "Orders",
  [STORAGE_KEYS.householdDraft]: "Household draft",
  [STORAGE_KEYS.householdLists]: "Household lists",
  [STORAGE_KEYS.inventory]: "Inventory",
  [STORAGE_KEYS.settings]: "Settings",
};

export function readStorageBreakdown(): StorageBreakdown[] {
  if (typeof window === "undefined") return [];
  const out: StorageBreakdown[] = [];
  for (const key of COLLECTION_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      out.push({
        key,
        label: STORAGE_LABELS[key] ?? key,
        bytes: 0,
        count: 0,
      });
      continue;
    }
    let count = 0;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) count = parsed.length;
      else if (parsed && typeof parsed === "object") count = 1;
    } catch {
      count = 0;
    }
    out.push({
      key,
      label: STORAGE_LABELS[key] ?? key,
      bytes: new Blob([raw]).size,
      count,
    });
  }
  return out;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
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

export function formatQuantity(quantity: number, unit: IngredientUnit): string {
  const u = unit.trim().toLowerCase();
  if (u === "g" && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`;
  }
  if (u === "ml" && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2).replace(/\.?0+$/, "")} l`;
  }
  const rounded = Math.round(quantity * 100) / 100;
  const label = unit.trim() || "—";
  return `${rounded} ${label}`;
}
