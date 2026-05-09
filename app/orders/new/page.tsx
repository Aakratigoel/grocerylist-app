"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CartIcon,
  ChevronDownIcon,
  ClockIcon,
  LightbulbIcon,
  MapPinIcon,
  MenuItemsIcon,
  ScaleIcon,
  UserIcon,
} from "../../_components/icons";
import { useDraftOrder } from "../../_lib/hooks";
import { clearDraftOrder, readDraftOrder } from "../../_lib/store";

function defaultShopDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const timeOptions = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const period = hour < 12 ? "AM" : "PM";
      const display12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const label = `${display12}:${String(minute).padStart(2, "0")} ${period}`;
      slots.push({ value, label });
    }
  }
  return slots;
})();

const howItWorks = [
  {
    icon: MenuItemsIcon,
    title: "Select Menu Items",
    description: "Choose dishes from your saved menu.",
  },
  {
    icon: ScaleIcon,
    title: "We Calculate Ingredients",
    description:
      "Ingredients scale by how many people or servings you enter.",
  },
  {
    icon: CartIcon,
    title: "Get Grocery List",
    description: "Review totals and export your grocery list.",
  },
];

export default function OrderDetailsStep() {
  const router = useRouter();
  const [draft, setDraft, hydrated] = useDraftOrder();

  const [clientName, setClientName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [eventTime, setEventTime] = useState("19:00");
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");
  const [formReady, setFormReady] = useState(false);

  /** "Start a new grocery list" links use ?reset=1 — clear draft before syncing the form. */
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return;
    clearDraftOrder();
    router.replace("/orders/new", { scroll: false });
  }, [hydrated, router]);

  /** Keep form in sync with persisted draft (e.g. after a list is saved and cleared). */
  useEffect(() => {
    if (!hydrated) return;
    const d = readDraftOrder();
    setClientName(d.clientName ?? "");
    setEventName(d.eventName ?? "");
    setEventDate(d.eventDate || defaultShopDate());
    setGuestCount(d.guestCount > 0 ? String(d.guestCount) : "");
    setEventTime(d.eventTime || "19:00");
    setVenue(d.venue ?? "");
    setNotes(d.notes ?? "");
    setFormReady(true);
  }, [hydrated, draft]);

  useEffect(() => {
    if (!hydrated || !formReady) return;
    setDraft({
      ...readDraftOrder(),
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      eventDate,
      guestCount: Math.max(0, Number(guestCount) || 0),
      eventTime,
      venue: venue.trim(),
      notes: notes.trim(),
    });
  }, [
    hydrated,
    formReady,
    clientName,
    eventName,
    eventDate,
    guestCount,
    eventTime,
    venue,
    notes,
    setDraft,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDraft({
      ...readDraftOrder(),
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      eventDate,
      guestCount: Math.max(1, Number(guestCount) || 1),
      eventTime,
      venue: venue.trim(),
      notes: notes.trim(),
    });
    router.push("/orders/new/menu-items");
  };

  const summary = {
    guestCount: Number(guestCount) || 0,
    eventDate: eventDate || "—",
    clientName: clientName || "—",
    venue: venue || "—",
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900">List details</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Name this shop and who it&apos;s for — fields are flexible for home
            or work. Your progress saves automatically.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            <Field label="For (household, client, or team)">
              <TextInput
                value={clientName}
                onChange={setClientName}
                placeholder="Enter name or label (optional)"
              />
            </Field>

            <Field label="List name">
              <TextInput
                value={eventName}
                onChange={setEventName}
                placeholder="Enter a name for this list"
                required
              />
            </Field>

            <Field label="Date">
              <InputWithLeadingIcon
                icon={<CalendarIcon className="h-4 w-4" />}
              >
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  title="Pick a shop or event date"
                  aria-label="Date — pick shop or event date"
                  className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
              </InputWithLeadingIcon>
              <span className="mt-1 block text-[11px] text-zinc-400">
                Native date picker — choose your shop or event date
              </span>
            </Field>

            <Field label="Servings or headcount">
              <div className="relative flex items-center rounded-lg border border-zinc-200 bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100">
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  min={1}
                  required
                  placeholder="Enter guests or servings"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <span className="pr-3.5 text-xs font-medium text-zinc-400">
                  people
                </span>
              </div>
            </Field>

            <Field label="Time (optional)">
              <div className="relative flex items-center rounded-lg border border-zinc-200 bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <select
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  aria-label="Time (optional) — pick a time or leave as default"
                  title="Pick a time (optional)"
                  className="w-full appearance-none bg-transparent pl-9 pr-9 py-2.5 text-sm text-zinc-900 focus:outline-none"
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </Field>

            <Field label="Location (optional)">
              <TextInput
                value={venue}
                onChange={setVenue}
                placeholder="Enter location (optional)"
              />
            </Field>

            <Field label="Notes (Optional)" className="sm:col-span-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Enter notes (optional)"
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              />
            </Field>

            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Continue to menu
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-zinc-900">Order Summary</h3>

          <ul className="mt-5 divide-y divide-zinc-100">
            <SummaryRow
              icon={<UserIcon className="h-4 w-4" />}
              label="Servings / people"
              value={`${summary.guestCount}`}
            />
            <SummaryRow
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Date"
              value={summary.eventDate}
            />
            <SummaryRow
              icon={<UserIcon className="h-4 w-4" />}
              label="For"
              value={summary.clientName}
            />
            <SummaryRow
              icon={<MapPinIcon className="h-4 w-4" />}
              label="Location"
              value={summary.venue}
            />
          </ul>

          <div className="mt-5 rounded-xl bg-zinc-100 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
              <LightbulbIcon className="h-4 w-4 text-amber-500" />
              Tip
            </div>
            <p className="mt-1.5 text-xs leading-5 text-zinc-500">
              This number scales every dish on your list — use servings for
              meal prep or headcount for a crowd.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-zinc-900">How it works</h3>

        <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-start lg:gap-3">
          {howItWorks.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === howItWorks.length - 1;
            return (
              <li key={step.title} className="contents">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="leading-snug">
                    <p className="text-sm font-medium text-zinc-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                {!isLast ? (
                  <ArrowRightIcon className="hidden h-4 w-4 self-center text-zinc-300 lg:block" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        {icon}
      </span>
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="ml-auto text-sm font-medium text-zinc-900">{value}</span>
    </li>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-xs font-medium text-zinc-600">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
    />
  );
}

function InputWithLeadingIcon({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center rounded-lg border border-zinc-200 bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
        {icon}
      </span>
      {children}
    </div>
  );
}
