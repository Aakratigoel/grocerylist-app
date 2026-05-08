"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BasketIcon,
  CheckIcon,
  ChevronRightIcon,
  HelpIcon,
} from "../../_components/icons";
import { WIZARD_STEPS, stepNumberFromPath } from "./_wizard";

export default function NewOrderWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = stepNumberFromPath(pathname);

  return (
    <>
      <TopBar />

      <div className="border-b border-zinc-200 bg-white px-10 pb-6 pt-7">
        <div className="mx-auto max-w-6xl">
          <Stepper currentStep={currentStep} />
        </div>
      </div>

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/orders"
          className="text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Orders
        </Link>
        <ChevronRightIcon className="h-4 w-4 text-zinc-300" />
        <span className="font-semibold text-zinc-900">Create New Order</span>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/grocery-lists/new?mode=household"
          className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
        >
          <BasketIcon className="h-4 w-4" />
          Switch to Household Mode
        </Link>
        <button
          type="button"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <HelpIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex w-full items-center">
      {WIZARD_STEPS.map((step, index) => {
        const isLast = index === WIZARD_STEPS.length - 1;
        const status =
          step.number < currentStep
            ? "complete"
            : step.number === currentStep
              ? "current"
              : "upcoming";

        const badgeClass =
          status === "complete"
            ? "bg-green-700 text-white"
            : status === "current"
              ? "bg-green-700 text-white"
              : "border border-zinc-300 bg-white text-zinc-500";

        const labelClass =
          status === "current" || status === "complete"
            ? "text-green-700 font-medium"
            : "text-zinc-500";

        return (
          <li
            key={step.number}
            className={`flex items-center ${isLast ? "" : "flex-1"}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClass}`}
              >
                {status === "complete" ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </span>
              <span className={`whitespace-nowrap text-sm ${labelClass}`}>
                {step.label}
              </span>
            </div>
            {!isLast ? (
              <span aria-hidden className="mx-4 h-px flex-1 bg-zinc-200" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
