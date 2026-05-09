"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, ChevronRightIcon, HelpIcon } from "../../_components/icons";
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

      <div className="overflow-x-auto border-b border-zinc-200 bg-white px-4 pb-5 pt-6 pl-14 sm:px-8 sm:pb-6 sm:pt-7 sm:pl-8 lg:px-10">
        <div className="mx-auto max-w-6xl min-w-[min(100%,42rem)]">
          <Stepper currentStep={currentStep} />
        </div>
      </div>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 pl-14 sm:px-8 sm:py-5 sm:pl-8 lg:px-10">
      <nav className="flex min-w-0 flex-1 items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/orders"
          className="text-zinc-500 transition-colors hover:text-zinc-900"
        >
          History
        </Link>
        <ChevronRightIcon className="h-4 w-4 text-zinc-300" />
        <span className="font-semibold text-zinc-900">New grocery list</span>
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

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex w-full min-w-0 flex-wrap items-center gap-y-2 sm:flex-nowrap">
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
              <span
                aria-hidden
                className="mx-2 hidden h-px flex-1 bg-zinc-200 sm:mx-4 sm:block"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
