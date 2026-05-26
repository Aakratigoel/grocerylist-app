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

/** Best-effort category for new catalog ingredients (user can override in the form). */
export function guessIngredientCategory(name: string): IngredientCategory {
  const n = name.trim().toLowerCase();
  if (!n) return "Other";

  const has = (...words: string[]) => words.some((w) => n.includes(w));

  if (
    has(
      "milk",
      "cheese",
      "butter",
      "cream",
      "yogurt",
      "paneer",
      "khoya",
      "mawa",
      "ghee",
      "dairy",
      "whey",
      "curd",
    )
  ) {
    return "Dairy";
  }
  if (
    has(
      "chicken",
      "mutton",
      "lamb",
      "beef",
      "pork",
      "fish",
      "shrimp",
      "prawn",
      "meat",
      "poultry",
      "egg",
    )
  ) {
    return "Meat & Poultry";
  }
  if (
    has(
      "tomato",
      "onion",
      "garlic",
      "ginger",
      "potato",
      "cauliflower",
      "spinach",
      "mint",
      "coriander",
      "cilantro",
      "lemon",
      "lime",
      "chili",
      "chilli",
      "pepper",
      "lettuce",
      "carrot",
      "cucumber",
      "pea",
      "beans",
      "cabbage",
      "produce",
      "herb",
      "basil",
      "parsley",
    )
  ) {
    return "Produce";
  }
  if (
    has(
      "cumin",
      "turmeric",
      "masala",
      "cardamom",
      "saffron",
      "clove",
      "cinnamon",
      "nutmeg",
      "paprika",
      "oregano",
      "thyme",
      "spice",
    )
  ) {
    return "Spices";
  }
  if (
    has(
      "flour",
      "maida",
      "aata",
      "atta",
      "bread",
      "naan",
      "roti",
      "yeast",
      "baking powder",
    )
  ) {
    return "Bakery";
  }
  if (
    has(
      "rice",
      "dal",
      "lentil",
      "rajma",
      "oil",
      "sugar",
      "salt",
      "vinegar",
      "soy",
      "pasta",
      "noodle",
      "flour",
    )
  ) {
    return "Pantry";
  }
  return "Other";
}

export type Ingredient = {
  id: string;
  name: string;
  unit: IngredientUnit;
  category: IngredientCategory;
};

/** Total amount for this dish for `recipeServesCount` people on the menu item. */
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
  /** Headcount the ingredient amounts below were entered for (e.g. 50). */
  recipeServesCount?: number;
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

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventoryRecord = {
  ingredientId: string;
  quantity: number;
  threshold: number;
  updatedAt: string;
};

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
  email: string;
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
  email: "",
  defaultGuestCount: 20,
  currency: "USD",
  aiProvider: "auto",
  showLowStockBanner: true,
  onboarded: false,
};

// True only when a brand-new user genuinely hasn't gone through the welcome flow.
// Existing users with prior data (orders or a saved profile name) skip onboarding.
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
  inventory: "gl.inventory",
  settings: "gl.settings",
  seeded: "gl.seeded",
} as const;

export const COLLECTION_KEYS = [
  STORAGE_KEYS.ingredients,
  STORAGE_KEYS.menuItems,
  STORAGE_KEYS.draftOrder,
  STORAGE_KEYS.groceryLists,
  STORAGE_KEYS.clients,
  STORAGE_KEYS.orders,
  STORAGE_KEYS.inventory,
  STORAGE_KEYS.settings,
] as const;

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
    recipeServesCount: 10,
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
    recipeServesCount: 10,
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
    recipeServesCount: 10,
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
    recipeServesCount: 10,
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
    recipeServesCount: 10,
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
  syncIngredientsToMenuReferences();
}

/** First row wins — fixes duplicate ids from legacy saves / merge bugs. */
export function dedupeIngredientsById(ingredients: Ingredient[]): Ingredient[] {
  const seen = new Set<string>();
  const out: Ingredient[] = [];
  for (const ing of ingredients) {
    if (seen.has(ing.id)) continue;
    seen.add(ing.id);
    out.push(ing);
  }
  return out;
}

/** Every ingredient id used on a menu item must exist in the master catalog. */
export function collectReferencedIngredientIds(menuItems: MenuItem[]): Set<string> {
  const ids = new Set<string>();
  for (const m of menuItems) {
    for (const row of m.ingredients) {
      ids.add(row.ingredientId);
    }
  }
  return ids;
}

function ingredientIdToPlaceholderName(id: string): string {
  const slug = id.startsWith("ing-") ? id.slice(4) : id;
  if (!slug) return id;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function reconcileIngredientsWithMenuItems(
  ingredients: Ingredient[],
  menuItems: MenuItem[],
): Ingredient[] {
  const unique = dedupeIngredientsById(ingredients);
  const byId = new Map(unique.map((i) => [i.id, i]));
  const referenced = collectReferencedIngredientIds(menuItems);
  const additions: Ingredient[] = [];
  for (const id of referenced) {
    if (!byId.has(id)) {
      const created: Ingredient = {
        id,
        name: ingredientIdToPlaceholderName(id),
        unit: "g",
        category: "Other",
      };
      additions.push(created);
      byId.set(id, created);
    }
  }
  if (additions.length === 0) return unique;
  return [...unique, ...additions];
}

function syncIngredientsToMenuReferences() {
  const base = readJson<Ingredient[]>(STORAGE_KEYS.ingredients, SEED_INGREDIENTS);
  const menuItems = readJson<MenuItem[]>(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
  const uniqueBase = dedupeIngredientsById(base);
  const merged = reconcileIngredientsWithMenuItems(uniqueBase, menuItems);
  const hadDuplicates = uniqueBase.length < base.length;
  const hadMissingForMenu = merged.length > uniqueBase.length;
  if (hadDuplicates || hadMissingForMenu) {
    writeJson(STORAGE_KEYS.ingredients, merged);
  }
}

export function readIngredients(): Ingredient[] {
  const base = readJson<Ingredient[]>(STORAGE_KEYS.ingredients, SEED_INGREDIENTS);
  const menuItems = readJson<MenuItem[]>(STORAGE_KEYS.menuItems, SEED_MENU_ITEMS);
  return reconcileIngredientsWithMenuItems(base, menuItems);
}

export function writeIngredients(items: Ingredient[]) {
  writeJson(STORAGE_KEYS.ingredients, dedupeIngredientsById(items));
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
  writeJson(STORAGE_KEYS.draftOrder, EMPTY_DRAFT);
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
  const raw = readJson<Record<string, unknown>>(STORAGE_KEYS.settings, {});
  const guestRaw = raw.defaultGuestCount;
  const guestNum =
    typeof guestRaw === "number" && Number.isFinite(guestRaw)
      ? Math.round(guestRaw)
      : DEFAULT_SETTINGS.defaultGuestCount;

  return {
    profileName:
      typeof raw.profileName === "string"
        ? raw.profileName
        : DEFAULT_SETTINGS.profileName,
    businessName:
      typeof raw.businessName === "string"
        ? raw.businessName
        : DEFAULT_SETTINGS.businessName,
    email:
      typeof raw.email === "string" ? raw.email : DEFAULT_SETTINGS.email,
    defaultGuestCount: Math.max(1, Math.min(1000, guestNum)),
    currency: CURRENCIES.some((c) => c.code === raw.currency)
      ? (raw.currency as CurrencyCode)
      : DEFAULT_SETTINGS.currency,
    aiProvider:
      raw.aiProvider === "openai" ||
      raw.aiProvider === "gemini" ||
      raw.aiProvider === "auto"
        ? (raw.aiProvider as AiProviderPreference)
        : DEFAULT_SETTINGS.aiProvider,
    showLowStockBanner:
      typeof raw.showLowStockBanner === "boolean"
        ? raw.showLowStockBanner
        : DEFAULT_SETTINGS.showLowStockBanner,
    onboarded:
      typeof raw.onboarded === "boolean"
        ? raw.onboarded
        : DEFAULT_SETTINGS.onboarded,
  };
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
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
}

/** Remove every `gl.*` key (full clear for this app on this origin). */
export function purgeGlLocalStorage(): void {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("gl.")) toRemove.push(key);
  }
  for (const key of toRemove) {
    window.localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event(STORE_UPDATE_EVENT));
}

/**
 * Remove all app data and write empty ingredients, menu, inventory, etc.
 * Sets `seeded` so `ensureSeed` does not re-apply built-in demo seed data.
 * Use for a true blank slate (also resets draft, orders, lists, clients, settings).
 */
export function wipeAllAppDataToEmpty() {
  if (typeof window === "undefined") return;
  for (const key of COLLECTION_KEYS) {
    window.localStorage.removeItem(key);
  }
  window.localStorage.removeItem(STORAGE_KEYS.seeded);
  window.localStorage.removeItem("gl.mode");

  writeJson(STORAGE_KEYS.ingredients, [] as Ingredient[]);
  writeJson(STORAGE_KEYS.menuItems, [] as MenuItem[]);
  writeJson(STORAGE_KEYS.inventory, [] as InventoryRecord[]);
  writeJson(STORAGE_KEYS.groceryLists, [] as GroceryList[]);
  writeJson(STORAGE_KEYS.clients, [] as Client[]);
  writeJson(STORAGE_KEYS.orders, [] as Order[]);
  writeJson(STORAGE_KEYS.draftOrder, EMPTY_DRAFT);
  writeJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);

  window.localStorage.setItem(STORAGE_KEYS.seeded, "1");
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
  [STORAGE_KEYS.groceryLists]: "Grocery lists",
  [STORAGE_KEYS.clients]: "Clients",
  [STORAGE_KEYS.orders]: "Orders",
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

/** Same-ish lines (different catalog IDs, etc.) collapse for shopping. */
export function groceryLineDedupKey(line: Pick<GroceryListLine, "ingredientName" | "unit">): string {
  return `${line.ingredientName.trim().toLowerCase()}\0${line.unit.trim().toLowerCase()}`;
}

/** Unmerged derived + extras: every ID that folds into `displayLine` after merge-by-name. */
export function ingredientIdsMatchingGroceryDisplayLine(
  displayLine: Pick<GroceryListLine, "ingredientName" | "unit">,
  sources: readonly GroceryListLine[],
): string[] {
  const key = groceryLineDedupKey(displayLine);
  const ids = new Set<string>();
  for (const l of sources) {
    if (groceryLineDedupKey(l) === key) ids.add(l.ingredientId);
  }
  return Array.from(ids);
}

export function nextInStockIdsAfterSettingDedupLine(
  inStockIngredientIds: readonly string[],
  displayLine: Pick<GroceryListLine, "ingredientName" | "unit">,
  sources: readonly GroceryListLine[],
  nextInStock: boolean,
): string[] {
  const matching = ingredientIdsMatchingGroceryDisplayLine(displayLine, sources);
  const set = new Set(inStockIngredientIds);
  for (const id of matching) {
    if (nextInStock) set.add(id);
    else set.delete(id);
  }
  return Array.from(set);
}

/** Merge quantities for lines that match name + unit (case-insensitive). */
export function mergeGroceryLinesDedup(lines: GroceryListLine[]): GroceryListLine[] {
  const map = new Map<
    string,
    {
      ingredientId: string;
      ingredientName: string;
      totalQuantity: number;
      unit: IngredientUnit;
      category: IngredientCategory;
      inStock: boolean;
      custom: boolean;
    }
  >();

  const prefersCatalogId = (a: string, b: string) =>
    (a.startsWith("custom-") ? 1 : 0) - (b.startsWith("custom-") ? 1 : 0);

  for (const line of lines) {
    const key = groceryLineDedupKey(line);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        ingredientId: line.ingredientId,
        ingredientName: line.ingredientName.trim(),
        totalQuantity: line.totalQuantity,
        unit: line.unit,
        category: line.category,
        inStock: line.inStock,
        custom: Boolean(line.custom),
      });
      continue;
    }

    prev.totalQuantity =
      Math.round((prev.totalQuantity + line.totalQuantity) * 100) / 100;
    prev.inStock = prev.inStock && line.inStock;
    prev.custom = prev.custom || Boolean(line.custom);
    if (prefersCatalogId(prev.ingredientId, line.ingredientId) > 0) {
      prev.ingredientId = line.ingredientId;
      if (!line.ingredientId.startsWith("custom-")) {
        prev.ingredientName = line.ingredientName.trim();
      }
    }
  }

  return Array.from(map.values()).map((row) => {
    const { custom, ...rest } = row;
    const out: GroceryListLine = { ...rest };
    if (custom) out.custom = true;
    return out;
  });
}

export function sortGroceryLines(lines: GroceryListLine[]): GroceryListLine[] {
  return [...lines].sort((a, b) => {
    if (a.category === b.category)
      return a.ingredientName.localeCompare(b.ingredientName);
    return a.category.localeCompare(b.category);
  });
}

export function effectivePartySize(guestCount: number): number {
  const n = Math.floor(Number(guestCount));
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/** Scale a recipe written for `recipeServes` people to this order’s headcount. */
export function recipeScaleFactor(
  recipeServes: number | undefined,
  orderGuestCount: number,
): number {
  const order = effectivePartySize(orderGuestCount);
  const recipe = Math.floor(Number(recipeServes));
  if (!Number.isFinite(recipe) || recipe < 1) {
    return 1;
  }
  return order / recipe;
}

/** Sum scaled menu amounts (same ingredient across dishes is combined). */
export function aggregateGroceryLines(
  selectedMenuItems: MenuItem[],
  orderGuestCount: number,
  ingredients: Ingredient[],
  inStockIds: Set<string>,
): GroceryListLine[] {
  const totals = new Map<string, number>();
  for (const menuItem of selectedMenuItems) {
    const factor = recipeScaleFactor(
      menuItem.recipeServesCount,
      orderGuestCount,
    );
    for (const item of menuItem.ingredients) {
      const current = totals.get(item.ingredientId) ?? 0;
      totals.set(
        item.ingredientId,
        current + item.quantityPerServing * factor,
      );
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

  return sortGroceryLines(mergeGroceryLinesDedup(lines));
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

function formatShareDateLine(eventDate: string, eventTime: string): string | null {
  if (!eventDate?.trim()) return null;
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return `Date: ${eventDate}`;
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!eventTime?.trim()) return datePart;
  const [hStr, mStr] = eventTime.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return datePart;
  const period = h < 12 ? "AM" : "PM";
  const display12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const timePart = `${display12}:${String(m).padStart(2, "0")} ${period}`;
  return `${datePart} · ${timePart}`;
}

/** Plain-text grocery list for Share / clipboard (grouped by category). */
export function formatGroceryListShareText(list: GroceryList): string {
  const order = list.order;
  const title = order.eventName?.trim() || "Grocery list";
  const toBuy = sortGroceryLines(list.lines.filter((l) => !l.inStock));
  const inStock = sortGroceryLines(list.lines.filter((l) => l.inStock));

  const divider = "──────────────────────────────";
  const lines: string[] = [];

  lines.push("GROCERY LIST", divider, title, "");

  const meta: string[] = [];
  if (order.guestCount > 0) {
    meta.push(`Party size: ${order.guestCount} people`);
  }
  const when = formatShareDateLine(order.eventDate, order.eventTime);
  if (when) meta.push(when);
  if (order.clientName?.trim()) {
    meta.push(`For: ${order.clientName.trim()}`);
  }
  if (order.venue?.trim()) {
    meta.push(`Location: ${order.venue.trim()}`);
  }
  if (meta.length > 0) {
    lines.push(...meta, "");
  }

  if (toBuy.length === 0) {
    lines.push("Nothing to buy — everything is marked in stock.", "");
  } else {
    lines.push(`TO BUY (${toBuy.length} item${toBuy.length === 1 ? "" : "s"})`, divider, "");

    const byCategory = new Map<IngredientCategory, GroceryListLine[]>();
    for (const cat of INGREDIENT_CATEGORIES) byCategory.set(cat, []);
    for (const line of toBuy) {
      const bucket = byCategory.get(line.category) ?? [];
      bucket.push(line);
      byCategory.set(line.category, bucket);
    }

    for (const category of INGREDIENT_CATEGORIES) {
      const items = byCategory.get(category) ?? [];
      if (items.length === 0) continue;

      const nameWidth = Math.min(
        28,
        Math.max(...items.map((l) => l.ingredientName.length), 8),
      );

      lines.push(category.toUpperCase());
      for (const line of items) {
        const qty = formatQuantity(line.totalQuantity, line.unit);
        const name = line.ingredientName;
        const pad = " ".repeat(Math.max(1, nameWidth - name.length + 2));
        const custom = line.custom ? " *" : "";
        lines.push(`  • ${name}${pad}${qty}${custom}`);
      }
      lines.push("");
    }
  }

  if (inStock.length > 0) {
    lines.push(divider);
    lines.push(
      `ALREADY IN STOCK (${inStock.length}) — not on shopping list`,
      "",
    );
    const names = inStock.map((l) => l.ingredientName).join(", ");
    const wrapped = wrapShareText(names, 52);
    lines.push(...wrapped, "");
  }

  if (order.notes?.trim()) {
    lines.push(divider, "NOTES", "", ...wrapShareText(order.notes.trim(), 52), "");
  }

  if (toBuy.some((l) => l.custom)) {
    lines.push("* = added manually on this list");
  }

  lines.push(divider, "Shared from GroceryList");

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function wrapShareText(text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxWidth && line) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out.length > 0 ? out : [text];
}

export function formatGroceryListCsv(list: GroceryList): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["Ingredient", "Category", "Quantity", "Unit", "Status"]
      .map(escape)
      .join(","),
    ...sortGroceryLines(list.lines).map((line) =>
      [
        escape(line.ingredientName),
        escape(line.category),
        String(line.totalQuantity),
        escape(line.unit),
        escape(line.inStock ? "In stock" : "To buy"),
      ].join(","),
    ),
  ];
  return rows.join("\n");
}
