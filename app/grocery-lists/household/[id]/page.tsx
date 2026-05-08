"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BasketIcon,
  BellIcon,
  CartIcon,
  ChevronRightIcon,
  DownloadIcon,
  EditIcon,
  HelpIcon,
  PrinterIcon,
  ShareIcon,
  TrashIcon,
} from "../../../_components/icons";
import { useHouseholdList, useHouseholdLists } from "../../../_lib/hooks";
import {
  HOUSEHOLD_CATEGORIES,
  HouseholdCategory,
  HouseholdGroceryList,
  HouseholdItem,
} from "../../../_lib/store";

const CATEGORY_STYLES: Record<HouseholdCategory, { headerBg: string; headerText: string; iconBg: string; dot: string }> = {
  Vegetables: { headerBg: "bg-green-50", headerText: "text-green-700", iconBg: "bg-green-100", dot: "bg-green-500" },
  Fruits: { headerBg: "bg-rose-50", headerText: "text-rose-700", iconBg: "bg-rose-100", dot: "bg-rose-500" },
  Dairy: { headerBg: "bg-sky-50", headerText: "text-sky-700", iconBg: "bg-sky-100", dot: "bg-sky-500" },
  Staples: { headerBg: "bg-amber-50", headerText: "text-amber-700", iconBg: "bg-amber-100", dot: "bg-amber-500" },
  Snacks: { headerBg: "bg-orange-50", headerText: "text-orange-700", iconBg: "bg-orange-100", dot: "bg-orange-500" },
  Beverages: { headerBg: "bg-cyan-50", headerText: "text-cyan-700", iconBg: "bg-cyan-100", dot: "bg-cyan-500" },
  Breakfast: { headerBg: "bg-yellow-50", headerText: "text-yellow-800", iconBg: "bg-yellow-100", dot: "bg-yellow-500" },
  "Personal Care": { headerBg: "bg-zinc-50", headerText: "text-zinc-700", iconBg: "bg-zinc-100", dot: "bg-zinc-400" },
  Others: { headerBg: "bg-fuchsia-50", headerText: "text-fuchsia-700", iconBg: "bg-fuchsia-100", dot: "bg-fuchsia-500" },
};

const CATEGORY_EMOJIS: Record<HouseholdCategory, string> = {
  Vegetables: "🥬",
  Fruits: "🍎",
  Dairy: "🥛",
  Staples: "🌾",
  Snacks: "🍪",
  Breakfast: "🍳",
  Beverages: "🥤",
  "Personal Care": "🧴",
  Others: "🛒",
};

export default function HouseholdListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [savedLists, setSavedLists, hydrated] = useHouseholdLists();
  const [, setDraft] = useHouseholdList();
  const [toast, setToast] = useState<string | null>(null);

  const list = useMemo(
    () => savedLists.find((l) => l.id === params.id) ?? null,
    [savedLists, params.id],
  );

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function persist(next: HouseholdGroceryList) {
    setSavedLists(
      savedLists.map((l) =>
        l.id === next.id ? { ...next, updatedAt: new Date().toISOString() } : l,
      ),
    );
  }

  function togglePicked(itemId: string, picked: boolean) {
    if (!list) return;
    persist({
      ...list,
      items: list.items.map((it) =>
        it.id === itemId ? { ...it, picked } : it,
      ),
    });
  }

  function removeItem(itemId: string) {
    if (!list) return;
    persist({
      ...list,
      items: list.items.filter((it) => it.id !== itemId),
    });
  }

  function deleteList() {
    if (!list) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Delete "${list.name}"?`);
      if (!ok) return;
    }
    setSavedLists(savedLists.filter((l) => l.id !== list.id));
    router.push("/grocery-lists");
  }

  function editList() {
    if (!list) return;
    setDraft(list.items.map((it) => ({ ...it })));
    router.push("/grocery-lists/new");
  }

  function buildPlainText(target: HouseholdGroceryList) {
    const lines = [target.name, ""];
    for (const cat of HOUSEHOLD_CATEGORIES) {
      const inCat = target.items.filter((it) => it.category === cat);
      if (inCat.length === 0) continue;
      lines.push(cat);
      for (const it of inCat) {
        const checkbox = it.picked ? "[x]" : "[ ]";
        lines.push(`  ${checkbox} ${it.name} — ${it.quantity} ${it.unit}`);
      }
      lines.push("");
    }
    return lines.join("\n").trim();
  }

  async function handleShare() {
    if (!list) return;
    const text = buildPlainText(list);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: list.name, text });
        return;
      } catch {
        // fall through
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      flashToast("List copied to clipboard");
    }
  }

  function handleDownload() {
    if (!list) return;
    const rows = ["Item,Category,Quantity,Unit,Picked"];
    for (const it of list.items) {
      const safeName = `"${it.name.replace(/"/g, '""')}"`;
      rows.push(
        `${safeName},${it.category},${it.quantity},${it.unit},${it.picked ? "yes" : "no"}`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(list.name)}.csv`;
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

  if (!hydrated) {
    return (
      <>
        <TopBar title="Loading…" />
        <main className="flex-1 px-10 pb-16 pt-8">
          <div className="mx-auto max-w-5xl text-sm text-zinc-500">Loading…</div>
        </main>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <TopBar title="List not found" />
        <main className="flex-1 px-10 pb-16 pt-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-zinc-900">
              Grocery list not found
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              It may have been deleted, or this link is for a different device.
            </p>
            <Link
              href="/grocery-lists"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Back to grocery lists
            </Link>
          </div>
        </main>
      </>
    );
  }

  const grouped = groupByCategory(list.items);
  const total = list.items.length;
  const picked = list.items.filter((it) => it.picked).length;
  const remaining = total - picked;
  const progressPct = total === 0 ? 0 : Math.round((picked / total) * 100);

  return (
    <>
      <TopBar title={list.name} />

      <main className="flex-1 px-10 pb-16 pt-6 print:px-0 print:pt-0">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] print:grid-cols-1">
          <section className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] print:border-none print:shadow-none">
            <div className="flex items-start justify-between gap-4 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {list.name}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Saved {formatRelativeDate(list.createdAt)} ·{" "}
                  {remaining} of {total} left
                </p>
              </div>
              <div className="flex items-center gap-1 print:hidden">
                <button
                  type="button"
                  onClick={editList}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={deleteList}
                  aria-label="Delete list"
                  className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Progress</span>
                <span className="font-medium text-zinc-700">
                  {picked} / {total} picked
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {total === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-violet-50 text-violet-600">
                  <CartIcon className="h-6 w-6" />
                </span>
                <p className="mt-1 text-sm font-medium text-zinc-800">
                  No items left in this list
                </p>
                <p className="text-xs text-zinc-500">
                  All items were removed. You can edit to add more.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 border-t border-zinc-100">
                {grouped.map(({ category, items }) => {
                  const style = CATEGORY_STYLES[category];
                  return (
                    <div key={category}>
                      <div
                        className={`flex items-center justify-between px-6 py-2.5 ${style.headerBg}`}
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
                          {category}
                          <span className="text-xs font-normal opacity-80">
                            ({items.length})
                          </span>
                        </span>
                      </div>
                      <ul className="divide-y divide-zinc-50">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 px-6 py-3"
                          >
                            <input
                              type="checkbox"
                              checked={item.picked}
                              onChange={(event) =>
                                togglePicked(item.id, event.target.checked)
                              }
                              aria-label={`Mark ${item.name} as picked`}
                              className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className={`truncate text-sm font-medium ${item.picked ? "text-zinc-400 line-through" : "text-zinc-900"}`}
                              >
                                {item.name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {formatQty(item.quantity)} {item.unit}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 print:hidden"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-5 print:hidden">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-violet-600">
                  <BasketIcon className="h-4 w-4" />
                </span>
                Summary
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                  <dt className="text-[11px] font-medium uppercase tracking-wide">
                    Remaining
                  </dt>
                  <dd className="text-base font-semibold">{remaining}</dd>
                </div>
                <div className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
                  <dt className="text-[11px] font-medium uppercase tracking-wide">
                    Picked
                  </dt>
                  <dd className="text-base font-semibold">{picked}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="text-sm font-semibold text-zinc-900">Actions</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-600">
                <ActionButton
                  onClick={handleShare}
                  icon={<ShareIcon className="h-4 w-4" />}
                  label="Share"
                />
                <ActionButton
                  onClick={handleDownload}
                  icon={<DownloadIcon className="h-4 w-4" />}
                  label="Download"
                />
                <ActionButton
                  onClick={handlePrint}
                  icon={<PrinterIcon className="h-4 w-4" />}
                  label="Print"
                />
              </div>
              <Link
                href="/grocery-lists/new"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Start a new list
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-lg print:hidden">
          {toast}
        </div>
      ) : null}
    </>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5 print:hidden">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/grocery-lists"
          className="text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Grocery Lists
        </Link>
        <ChevronRightIcon className="h-4 w-4 text-zinc-300" />
        <span className="font-semibold text-zinc-900">{title}</span>
      </nav>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Help"
          className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <HelpIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="text-zinc-500 hover:text-zinc-900"
        >
          <BellIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-transparent px-2 py-2.5 text-[11px] font-medium text-zinc-600 transition-colors hover:border-violet-100 hover:bg-violet-50 hover:text-violet-700"
    >
      {icon}
      {label}
    </button>
  );
}

function groupByCategory(items: HouseholdItem[]) {
  const map = new Map<HouseholdCategory, HouseholdItem[]>();
  for (const cat of HOUSEHOLD_CATEGORIES) map.set(cat, []);
  for (const item of items) {
    map.get(item.category)?.push(item);
  }
  const result: Array<{ category: HouseholdCategory; items: HouseholdItem[] }> =
    [];
  for (const cat of HOUSEHOLD_CATEGORIES) {
    const list = map.get(cat) ?? [];
    if (list.length === 0) continue;
    result.push({ category: cat, items: list });
  }
  return result;
}

function formatQty(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "grocery-list"
  );
}
