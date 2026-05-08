"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CartIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  ClockIcon,
  LightbulbIcon,
  MapPinIcon,
  MenuItemsIcon,
  ScaleIcon,
  UserIcon,
} from "../../_components/icons";
import { useDraftOrder } from "../../_lib/hooks";

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
    description: "Ingredients are auto-calculated based on guest count.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Check Inventory",
    description: "Mark what's in stock and what to buy.",
  },
  {
    icon: CartIcon,
    title: "Get Grocery List",
    description: "Review and export your grocery list.",
  },
];

export default function OrderDetailsStep() {
  const router = useRouter();
  const [draft, setDraft] = useDraftOrder();

  const [clientName, setClientName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [eventTime, setEventTime] = useState("19:00");
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setClientName(draft.clientName || "Rohit & Priya");
    setEventName(draft.eventName || "Wedding at Taj Palace");
    setEventDate(draft.eventDate || "2025-05-24");
    setGuestCount(String(draft.guestCount || 100));
    setEventTime(draft.eventTime || "19:00");
    setVenue(draft.venue || "Taj Palace, New Delhi");
    setNotes(draft.notes || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDraft({
      ...draft,
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      eventDate,
      guestCount: Number(guestCount) || 0,
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
          <h2 className="text-lg font-semibold text-zinc-900">Order Details</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add the basic details for your catering order.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            <Field label="Client Name">
              <TextInput
                value={clientName}
                onChange={setClientName}
                placeholder="e.g. Rohit & Priya"
                required
              />
            </Field>

            <Field label="Event Name">
              <TextInput
                value={eventName}
                onChange={setEventName}
                placeholder="e.g. Wedding at Taj Palace"
                required
              />
            </Field>

            <Field label="Event Date">
              <InputWithLeadingIcon
                icon={<CalendarIcon className="h-4 w-4" />}
              >
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
              </InputWithLeadingIcon>
            </Field>

            <Field label="Guest Count">
              <div className="relative flex items-center rounded-lg border border-zinc-200 bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100">
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  min={1}
                  required
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <span className="pr-3.5 text-xs font-medium text-zinc-400">
                  pax
                </span>
              </div>
            </Field>

            <Field label="Delivery / Event Time (Optional)">
              <div className="relative flex items-center rounded-lg border border-zinc-200 bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <select
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
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

            <Field label="Venue">
              <TextInput
                value={venue}
                onChange={setVenue}
                placeholder="e.g. Taj Palace, New Delhi"
              />
            </Field>

            <Field label="Notes (Optional)" className="sm:col-span-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special requests or notes..."
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              />
            </Field>

            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Save &amp; Continue
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
              label="Guest Count"
              value={`${summary.guestCount} pax`}
            />
            <SummaryRow
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Event Date"
              value={summary.eventDate}
            />
            <SummaryRow
              icon={<UserIcon className="h-4 w-4" />}
              label="Client"
              value={summary.clientName}
            />
            <SummaryRow
              icon={<MapPinIcon className="h-4 w-4" />}
              label="Venue"
              value={summary.venue}
            />
          </ul>

          <div className="mt-5 rounded-xl bg-zinc-100 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
              <LightbulbIcon className="h-4 w-4 text-amber-500" />
              Tip
            </div>
            <p className="mt-1.5 text-xs leading-5 text-zinc-500">
              Accurate guest count helps us calculate the right quantities for
              you.
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
