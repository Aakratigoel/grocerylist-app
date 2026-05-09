"use client";

import Link from "next/link";
import { NEW_GROCERY_LIST_START_HREF } from "./orders/new/_wizard";
import {
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  BasketIcon,
  HelpIcon,
} from "./_components/icons";

const heroFeatures = [
  "Save dishes once as menu items",
  "Scale ingredients by servings or headcount",
  "Mark what you already have vs. need to buy",
  "Share, save, or download your list",
];

export default function Home() {
  return (
    <>
      <TopBar />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-lg">
          <header className="mb-8 text-center sm:mb-10">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl sm:text-[26px]">
              Grocery lists from the meals you already plan
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Pick recipes, set how many you&apos;re feeding, and get one
              combined shopping list — whether it&apos;s Tuesday dinner or a
              big event.
            </p>
          </header>

          <HeroCard />
        </div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 pl-14 sm:flex-nowrap sm:px-8 sm:py-5 sm:pl-8 lg:px-10">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-zinc-900">
          Welcome <span aria-hidden>👋</span>
        </h1>
        <p className="text-xs text-zinc-500">Let&apos;s get started</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm text-zinc-500 sm:gap-5">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 hover:text-zinc-900"
        >
          <HelpIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="hover:text-zinc-900"
        >
          <BellIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function HeroCard() {
  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <BasketIcon className="h-7 w-7 text-green-700" />
        </span>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <h3 className="text-xl font-semibold text-zinc-900">
            One flow for any kitchen
          </h3>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
            Home &amp; pros
          </span>
        </div>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Same tools for weekly shopping, meal prep, potlucks, or client jobs —
          no separate &quot;catering mode&quot; required.
        </p>
      </div>

      <ul className="mt-6 space-y-2.5 rounded-xl bg-zinc-50 p-5 text-sm text-zinc-700">
        {heroFeatures.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <CheckIcon className="h-4 w-4 text-green-600" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={NEW_GROCERY_LIST_START_HREF}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
      >
        Start a grocery list
        <ArrowRightIcon className="h-4 w-4" />
      </Link>

      <p className="mt-3 text-center text-xs text-zinc-500">
        Optional fields like date or venue help you stay organized — skip
        anything you don&apos;t need.
      </p>
    </article>
  );
}
