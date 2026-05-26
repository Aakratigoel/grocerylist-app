"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, ChevronRightIcon, HelpIcon } from "../../_components/icons";
import {
  PAGE_HEADER_CLASS,
  WIZARD_PROGRESS_STRIP_CLASS,
} from "../../_lib/page-header-classes";
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

      <div className={WIZARD_PROGRESS_STRIP_CLASS}>
        <div className="mx-auto max-w-6xl min-w-0 pb-px">
          <Stepper currentStep={currentStep} />
        </div>
      </div>

      <main className="flex-1 px-4 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className={`${PAGE_HEADER_CLASS} items-center`}>
      <nav
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/orders"
          className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-900"
        >
          History
        </Link>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-zinc-300" />
        <span className="min-w-0 truncate font-semibold text-zinc-900">
          New list
          <span className="hidden sm:inline"> grocery list</span>
        </span>
      </nav>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
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

const STEP_SHORT_LABELS: Record<string, string> = {
  "/orders/new": "Details",
  "/orders/new/menu-items": "Menu",
  "/orders/new/review": "Review",
  "/orders/new/grocery-list": "List",
};

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol
      aria-label="Wizard progress"
      className="flex min-w-max flex-nowrap items-center gap-4 pb-2 sm:min-w-0 sm:w-full sm:flex-wrap sm:gap-x-4 sm:gap-y-4 sm:pb-3"
    >
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
            aria-current={status === "current" ? "step" : undefined}
            className={`flex items-center gap-4 ${isLast ? "" : "sm:flex-1"}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClass}`}
              >
                {status === "complete" ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </span>
              <span className={`max-w-[8.5rem] text-xs leading-snug sm:max-w-none sm:text-sm ${labelClass}`}>
                <span className="sm:hidden">
                  {STEP_SHORT_LABELS[step.href] ?? step.label}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </span>
            </div>
            {!isLast ? (
              <span aria-hidden className="hidden h-px w-8 bg-zinc-200 sm:block sm:flex-1" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
