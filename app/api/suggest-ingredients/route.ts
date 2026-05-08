import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const ALLOWED_UNITS = ["g", "kg", "ml", "l", "pcs", "tsp", "tbsp", "cup"] as const;
type AllowedUnit = (typeof ALLOWED_UNITS)[number];

type AiIngredient = {
  name: string;
  quantity: number;
  unit: AllowedUnit;
  note?: string;
};

type Provider = "openai" | "gemini";

export const DIETARY_PREFERENCE_IDS = [
  "vegan",
  "vegetarian",
  "dairy-free",
  "gluten-free",
  "nut-free",
  "high-protein",
  "no-sugar",
  "low-carb",
] as const;
type DietaryPreferenceId = (typeof DIETARY_PREFERENCE_IDS)[number];

const PREFERENCE_INSTRUCTIONS: Record<DietaryPreferenceId, string> = {
  vegan: `STRICTLY vegan — ZERO animal products. This is a HARD requirement; non-compliance makes the response unusable.
NEVER include: butter, ghee, clarified butter, cream (any kind), milk, buttermilk, condensed/evaporated milk, milk powder, yogurt/curd/dahi, paneer, cottage cheese, ANY cheese, honey, eggs (whole/white/yolk), mayonnaise, gelatin, whey, fish sauce, OR any meat/poultry/fish/seafood.
Required substitutions (use these exact names):
  • butter / ghee → "vegan butter"
  • cream / heavy cream / sour cream → "coconut cream"
  • milk → "almond milk" (or oat/soy)
  • buttermilk → "vegan buttermilk"
  • condensed milk → "coconut condensed milk"
  • paneer / cottage cheese → "firm tofu"
  • yogurt / curd / dahi → "coconut yogurt"
  • cheese → "vegan cheese"
  • cream cheese → "vegan cream cheese"
  • honey → "maple syrup"
  • eggs → "flax egg" (or aquafaba)
  • mayo / mayonnaise → "vegan mayo"
  • gelatin → "agar-agar"
  • chicken → "tofu"; beef/pork/lamb/mutton → "tempeh"; fish → "tofu"; shrimp → "king oyster mushroom"
This applies EVEN when the dish traditionally contains dairy or meat (e.g. dal makhani, butter chicken, paneer tikka, mutton rogan josh). The dish name is just a flavor reference — the ingredients you return MUST be 100% plant-based. For any ingredient you substituted, set the "note" field to "replaces <original>" (e.g. "replaces butter").`,
  vegetarian: `Vegetarian — NO meat, poultry, fish, or seafood of any kind. Dairy and eggs are allowed.
NEVER include: chicken, beef, pork, lamb, mutton, veal, bacon, ham, sausage, chorizo, fish, salmon, tuna, shrimp, prawns, crab, lobster.
Replace with: paneer, tofu, soya chunks, mushrooms, lentils, chickpeas, or rajma depending on dish style. Set "note": "replaces <original>" on any swap.`,
  "dairy-free": `NO dairy of any kind. This includes: butter, ghee, clarified butter, cream (any kind), milk, buttermilk, condensed/evaporated milk, milk powder, yogurt/curd/dahi, paneer, cottage cheese, ANY cheese, cream cheese, whey.
Required substitutions (use these exact names):
  • butter / ghee → "vegan butter" (or coconut oil)
  • cream → "coconut cream" (or cashew cream)
  • milk → "almond milk" (or oat/soy)
  • buttermilk → "vegan buttermilk"
  • paneer → "firm tofu"
  • yogurt / curd / dahi → "coconut yogurt"
  • cheese → "vegan cheese"
  • cream cheese → "vegan cream cheese"
This applies EVEN to dishes that traditionally contain dairy (dal makhani, butter chicken, paneer tikka, lassi, etc.). For any swap, set "note": "replaces <original>".`,
  "gluten-free":
    "No wheat, barley, rye, semolina, maida, all-purpose flour, regular soy sauce, pasta, or any gluten-containing ingredient. Use gluten-free alternatives: rice flour, almond flour, chickpea flour (besan), gluten-free tamari, or certified GF oats. Set \"note\": \"replaces <original>\" on any swap.",
  "nut-free":
    "No tree nuts or peanuts in any form (no almond, cashew, walnut, peanut, pistachio, hazelnut, pecan, brazil nut, macadamia, etc.). Use seeds (sunflower, pumpkin) or coconut where a similar texture is needed. Set \"note\": \"replaces <original>\" on any swap.",
  "high-protein":
    "Maximize protein per serving. Increase quantities of inherently protein-rich ingredients (paneer, tofu, lentils, chickpeas, eggs, lean meat, Greek yogurt) and add at least one explicit protein source if the dish allows. Reduce non-protein fillers like white rice or sugar.",
  "no-sugar":
    "No added sugar of any kind (no white sugar, brown sugar, jaggery, honey, syrup, condensed milk). Rely on natural sweetness from fruit or use a sugar substitute like stevia or monk fruit only if essential. Mark such substitutes in the note field.",
  "low-carb":
    "Low carb / keto-friendly. Avoid grains, starchy vegetables, legumes, and sugar. Replace rice or potato with cauliflower rice, zucchini, or extra vegetables. Boost healthy fats and proteins.",
};

function isDietaryPreferenceId(value: unknown): value is DietaryPreferenceId {
  return (
    typeof value === "string" &&
    (DIETARY_PREFERENCE_IDS as readonly string[]).includes(value)
  );
}

function normalizePreferences(raw: unknown): DietaryPreferenceId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<DietaryPreferenceId>();
  for (const entry of raw) {
    if (isDietaryPreferenceId(entry)) seen.add(entry);
  }
  // Resolve obvious overlaps (vegan implies dairy-free + vegetarian)
  if (seen.has("vegan")) {
    seen.delete("vegetarian");
    seen.delete("dairy-free");
  }
  return Array.from(seen);
}

const SYSTEM_PROMPT =
  "You are a culinary assistant helping caterers estimate per-serving ingredient quantities for dishes from any cuisine. Always respond with valid JSON only.";

function buildUserPrompt(
  name: string,
  category: string,
  preferences: DietaryPreferenceId[],
) {
  const dietaryBlock =
    preferences.length === 0
      ? ""
      : `\n\nDietary requirements (you MUST follow ALL of these — substitute ingredients as needed and adjust quantities to keep the dish balanced):\n${preferences
          .map((p) => `- [${p}] ${PREFERENCE_INSTRUCTIONS[p]}`)
          .join("\n")}\nWhen you substitute an ingredient, briefly mention the role it plays in the "note" field (e.g. "coconut milk — replaces cream").`;

  return `The dish is "${name}" (category: ${category}).${dietaryBlock}
Return JSON with this structure:
{ "ingredients": [{ "name": string, "quantity": number, "unit": "g"|"kg"|"ml"|"l"|"pcs"|"tsp"|"tbsp"|"cup", "note"?: string }] }

Rules:
- Realistic per-serving quantities for one adult portion.
- Use only the listed units. Prefer g for solids, ml for liquids, pcs for whole items.
- Provide between 6 and 14 ingredients covering everything a cook would actually buy (proteins, vegetables, dairy, spices, oils, garnishes).
- Use simple, lowercase ingredient names (e.g. "tomato", "paneer", "garam masala").
- "note" is optional and short (e.g. "finely chopped"). Do not include it unless useful.
- Do NOT include water unless it's a key ingredient like in a stock or curry base.
- Return JSON only, no commentary.`;
}

function isAllowedUnit(value: unknown): value is AllowedUnit {
  return (
    typeof value === "string" &&
    (ALLOWED_UNITS as readonly string[]).includes(value)
  );
}

function sanitize(raw: unknown): AiIngredient[] {
  if (!raw || typeof raw !== "object") return [];
  const ingredients = (raw as { ingredients?: unknown }).ingredients;
  if (!Array.isArray(ingredients)) return [];
  const cleaned: AiIngredient[] = [];
  for (const entry of ingredients) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const name =
      typeof item.name === "string" ? item.name.trim().toLowerCase() : "";
    const quantity = typeof item.quantity === "number" ? item.quantity : NaN;
    const unit = item.unit;
    const note = typeof item.note === "string" ? item.note.trim() : undefined;
    if (!name) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    if (!isAllowedUnit(unit)) continue;
    cleaned.push({
      name,
      quantity: Math.round(quantity * 100) / 100,
      unit,
      note: note && note.length > 0 ? note : undefined,
    });
    if (cleaned.length >= 20) break;
  }
  return cleaned;
}

// ---------------------------------------------------------------------------
// Dietary preference enforcement (safety net for when the model ignores
// the prompt — e.g. returns "butter" for a vegan dal makhani).
// ---------------------------------------------------------------------------

type ForbiddenRule = {
  pattern: RegExp;
  substitute: string;
  reason: string;
};

// Ingredient names that contain a "forbidden-looking" word but are themselves
// already plant-based / preference-compliant. We must NOT auto-substitute these.
const SAFE_NAMES: ReadonlySet<string> = new Set([
  // alt milks
  "almond milk",
  "soy milk",
  "oat milk",
  "coconut milk",
  "rice milk",
  "cashew milk",
  "hemp milk",
  // vegan butters & nut butters
  "vegan butter",
  "peanut butter",
  "almond butter",
  "cashew butter",
  "coconut butter",
  "sunflower butter",
  "sun butter",
  "nut butter",
  // legumes / vegetables that share names
  "butter beans",
  "butter bean",
  "butter lettuce",
  "butternut squash",
  "butternut",
  // alt creams
  "coconut cream",
  "cashew cream",
  "oat cream",
  "soy cream",
  // alt yogurts
  "coconut yogurt",
  "cashew yogurt",
  "almond yogurt",
  "soy yogurt",
  "vegan yogurt",
  // alt cheeses
  "vegan cheese",
  "vegan parmesan",
  "vegan mozzarella",
  "vegan feta",
  "vegan cream cheese",
  "nutritional yeast",
  // alt mayo / eggs
  "vegan mayo",
  "vegan mayonnaise",
  "flax egg",
  "chia egg",
  "aquafaba",
  // proteins
  "tofu",
  "firm tofu",
  "silken tofu",
  "extra firm tofu",
  "tempeh",
  "seitan",
  // sweeteners / setters
  "maple syrup",
  "agar-agar",
  "agar agar",
  // dairy-free specials
  "vegan buttermilk",
  "coconut condensed milk",
  "coconut milk powder",
]);

const DAIRY_RULES: ForbiddenRule[] = [
  { pattern: /\b(ghee|clarified\s+butter)\b/i, substitute: "vegan butter", reason: "ghee is dairy" },
  { pattern: /\bbuttermilk\b/i, substitute: "vegan buttermilk", reason: "buttermilk is dairy" },
  { pattern: /\bbutter\b/i, substitute: "vegan butter", reason: "butter is dairy" },
  { pattern: /\bcream\s+cheese\b/i, substitute: "vegan cream cheese", reason: "cream cheese is dairy" },
  { pattern: /\b(heavy|whipping|double|sour|fresh)?\s*cream\b/i, substitute: "coconut cream", reason: "cream is dairy" },
  { pattern: /\bcondensed\s+milk\b/i, substitute: "coconut condensed milk", reason: "condensed milk is dairy" },
  { pattern: /\bevaporated\s+milk\b/i, substitute: "coconut milk", reason: "evaporated milk is dairy" },
  { pattern: /\bmilk\s*powder\b/i, substitute: "coconut milk powder", reason: "milk powder is dairy" },
  { pattern: /\b(whole|skim|skimmed|low[\s-]?fat|full[\s-]?fat|2%)?\s*milk\b/i, substitute: "almond milk", reason: "milk is dairy" },
  { pattern: /\b(hung\s+curd|curd|dahi|yogurt|yoghurt|greek\s+yogurt)\b/i, substitute: "coconut yogurt", reason: "yogurt is dairy" },
  { pattern: /\b(paneer|cottage\s+cheese)\b/i, substitute: "firm tofu", reason: "paneer is dairy" },
  { pattern: /\b(mozzarella|cheddar|parmesan|feta|ricotta|gouda|brie|cheese)\b/i, substitute: "vegan cheese", reason: "cheese is dairy" },
  { pattern: /\bwhey\b/i, substitute: "pea protein", reason: "whey is dairy" },
];

const EGG_RULES: ForbiddenRule[] = [
  { pattern: /\begg\s+(white|whites|yolk|yolks)\b/i, substitute: "aquafaba", reason: "eggs are animal" },
  { pattern: /\beggs?\b/i, substitute: "flax egg", reason: "eggs are animal" },
  { pattern: /\b(mayonnaise|mayo)\b/i, substitute: "vegan mayo", reason: "mayonnaise contains eggs" },
];

const MEAT_RULES: ForbiddenRule[] = [
  { pattern: /\b(boneless\s+)?chicken\b/i, substitute: "tofu", reason: "chicken is meat" },
  { pattern: /\b(beef|pork|veal|lamb|mutton)\b/i, substitute: "tempeh", reason: "meat is animal" },
  { pattern: /\b(bacon|ham|sausage|chorizo|salami|pepperoni)\b/i, substitute: "tempeh", reason: "cured meat" },
  { pattern: /\b(fish|salmon|tuna|cod|tilapia|anchovy|anchovies)\b/i, substitute: "tofu", reason: "fish is animal" },
  { pattern: /\b(shrimp|prawns?|crab|lobster|squid|octopus)\b/i, substitute: "king oyster mushroom", reason: "shellfish is animal" },
];

const HONEY_RULES: ForbiddenRule[] = [
  { pattern: /\bhoney\b/i, substitute: "maple syrup", reason: "honey is animal-derived" },
];

const GELATIN_RULES: ForbiddenRule[] = [
  { pattern: /\bgelatin(e)?\b/i, substitute: "agar-agar", reason: "gelatin is animal-derived" },
];

function rulesForPreferences(prefs: DietaryPreferenceId[]): ForbiddenRule[] {
  const rules: ForbiddenRule[] = [];
  if (prefs.includes("vegan")) {
    rules.push(
      ...DAIRY_RULES,
      ...EGG_RULES,
      ...MEAT_RULES,
      ...HONEY_RULES,
      ...GELATIN_RULES,
    );
  } else {
    if (prefs.includes("dairy-free")) rules.push(...DAIRY_RULES);
    if (prefs.includes("vegetarian")) rules.push(...MEAT_RULES);
  }
  return rules;
}

function enforcePreferences(
  ingredients: AiIngredient[],
  preferences: DietaryPreferenceId[],
): { ingredients: AiIngredient[]; warnings: string[] } {
  const rules = rulesForPreferences(preferences);
  if (rules.length === 0) return { ingredients, warnings: [] };

  const warnings: string[] = [];
  const out: AiIngredient[] = [];
  const seen = new Set<string>();

  const push = (ing: AiIngredient) => {
    const key = ing.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(ing);
  };

  for (const ing of ingredients) {
    const lower = ing.name.toLowerCase();

    if (SAFE_NAMES.has(lower)) {
      push(ing);
      continue;
    }

    let matched: ForbiddenRule | null = null;
    for (const rule of rules) {
      if (rule.pattern.test(lower)) {
        matched = rule;
        break;
      }
    }

    if (matched) {
      const original = ing.name;
      const note = ing.note
        ? `${ing.note} (replaces ${original})`
        : `replaces ${original}`;
      push({ ...ing, name: matched.substitute, note });
      warnings.push(
        `Replaced "${original}" with "${matched.substitute}" — ${matched.reason}.`,
      );
    } else {
      push(ing);
    }
  }

  return { ingredients: out, warnings };
}

function selectProvider(): Provider | null {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "openai" || explicit === "gemini") return explicit;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GOOGLE_API_KEY) return "gemini";
  return null;
}

type ProviderError = {
  status: number;
  userMessage: string;
  detail: string;
  code?: string;
};

type ProviderResult =
  | { ok: true; ingredients: AiIngredient[]; model: string }
  | { ok: false; error: ProviderError };

async function callOpenAI(
  name: string,
  category: string,
  preferences: DietaryPreferenceId[],
): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: {
        status: 503,
        userMessage:
          "OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server, or set GOOGLE_API_KEY to use Gemini's free tier.",
        detail: "missing_openai_key",
      },
    };
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt(name, category, preferences),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Could not reach OpenAI. Check your network connection.",
        detail: err instanceof Error ? err.message : String(err),
      },
    };
  }

  if (!upstream.ok) {
    const rawBody = await upstream.text().catch(() => "");
    let parsed:
      | { error?: { message?: string; type?: string; code?: string } }
      | null = null;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      // not JSON
    }
    const openaiMessage = parsed?.error?.message ?? rawBody.slice(0, 500);
    const openaiCode = parsed?.error?.code ?? parsed?.error?.type;

    let userMessage = `OpenAI request failed (HTTP ${upstream.status})`;
    if (upstream.status === 429) {
      if (openaiCode === "insufficient_quota") {
        userMessage =
          "Your OpenAI account has no available credits. Add a small prepaid balance at https://platform.openai.com/settings/organization/billing — or set GOOGLE_API_KEY in .env.local to use Gemini's free tier instead.";
      } else if (openaiCode === "rate_limit_exceeded") {
        userMessage =
          "Hit OpenAI's rate limit for this minute. Wait a few seconds and try again.";
      } else {
        userMessage =
          "OpenAI returned 429 (quota or rate limit). If your account is new, you likely need billing credit — or switch to Gemini's free tier by setting GOOGLE_API_KEY.";
      }
    } else if (upstream.status === 401) {
      userMessage =
        "OpenAI rejected the API key (401). Double-check OPENAI_API_KEY in .env.local — make sure you copied the full sk-... string and the key isn't revoked.";
    } else if (upstream.status === 404) {
      userMessage =
        "OpenAI model not found (404). Set OPENAI_MODEL in .env.local to a model your account can access (e.g. gpt-4o-mini).";
    }

    return {
      ok: false,
      error: {
        status: upstream.status,
        userMessage,
        detail: openaiMessage,
        code: openaiCode,
      },
    };
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Invalid response from OpenAI.",
        detail: "non_json_body",
      },
    };
  }

  const content =
    (payload as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
      ?.message?.content ?? "{}";
  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(content);
  } catch {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Could not parse the AI response as JSON.",
        detail: "non_json_content",
      },
    };
  }

  const ingredients = sanitize(parsedContent);
  return { ok: true, ingredients, model };
}

async function callGemini(
  name: string,
  category: string,
  preferences: DietaryPreferenceId[],
): Promise<ProviderResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: {
        status: 503,
        userMessage:
          "GOOGLE_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey and add it to .env.local.",
        detail: "missing_gemini_key",
      },
    };
  }
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(name, category, preferences)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Could not reach Google Gemini. Check your network connection.",
        detail: err instanceof Error ? err.message : String(err),
      },
    };
  }

  if (!upstream.ok) {
    const rawBody = await upstream.text().catch(() => "");
    let parsed:
      | { error?: { message?: string; status?: string; code?: number } }
      | null = null;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      // not JSON
    }
    const geminiMessage = parsed?.error?.message ?? rawBody.slice(0, 500);
    const geminiStatus = parsed?.error?.status;

    let userMessage = `Gemini request failed (HTTP ${upstream.status})`;
    if (upstream.status === 401 || upstream.status === 403) {
      userMessage =
        "Google rejected the API key. Double-check GOOGLE_API_KEY in .env.local — get a fresh one at https://aistudio.google.com/app/apikey.";
    } else if (upstream.status === 429) {
      userMessage =
        "Hit Gemini's free-tier rate limit. Wait a minute and try again.";
    } else if (upstream.status === 404) {
      userMessage =
        "Gemini model not found. Set GEMINI_MODEL in .env.local to a current model (e.g. gemini-2.0-flash).";
    }

    return {
      ok: false,
      error: {
        status: upstream.status,
        userMessage,
        detail: geminiMessage,
        code: geminiStatus,
      },
    };
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Invalid response from Gemini.",
        detail: "non_json_body",
      },
    };
  }

  const text =
    (
      payload as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      }
    )?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (!text) {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Gemini returned an empty response.",
        detail: "empty_text",
      },
    };
  }

  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: {
        status: 502,
        userMessage: "Could not parse the AI response as JSON.",
        detail: text.slice(0, 500),
      },
    };
  }

  const ingredients = sanitize(parsedContent);
  return { ok: true, ingredients, model };
}

export async function POST(request: NextRequest) {
  const provider = selectProvider();
  if (!provider) {
    return Response.json(
      {
        error:
          "AI suggestions need an API key. Set OPENAI_API_KEY (paid) or GOOGLE_API_KEY (free tier at https://aistudio.google.com/app/apikey) in .env.local, then restart the dev server.",
      },
      { status: 503 },
    );
  }

  let body: { name?: unknown; category?: unknown; preferences?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Missing dish name" }, { status: 400 });
  }
  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim()
      : "Main";
  const preferences = normalizePreferences(body.preferences);

  const result =
    provider === "openai"
      ? await callOpenAI(name, category, preferences)
      : await callGemini(name, category, preferences);

  if (!result.ok) {
    console.error(`[suggest-ingredients] ${provider} error`, {
      status: result.error.status,
      code: result.error.code,
      detail: result.error.detail,
    });
    return Response.json(
      {
        error: result.error.userMessage,
        detail: result.error.detail,
        code: result.error.code,
        provider,
      },
      { status: result.error.status },
    );
  }

  if (result.ingredients.length === 0) {
    return Response.json(
      {
        error: "AI returned no usable ingredients. Try a more specific dish name.",
        provider,
        model: result.model,
      },
      { status: 422 },
    );
  }

  const { ingredients: enforced, warnings } = enforcePreferences(
    result.ingredients,
    preferences,
  );

  if (warnings.length > 0) {
    console.info(`[suggest-ingredients] enforced ${warnings.length} substitution(s) for ${preferences.join(",")}:`, warnings);
  }

  return Response.json({
    name,
    category,
    provider,
    model: result.model,
    preferences,
    ingredients: enforced,
    warnings,
  });
}
