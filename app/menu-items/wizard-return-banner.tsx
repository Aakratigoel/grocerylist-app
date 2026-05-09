"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRightIcon } from "../_components/icons";
import { sanitizeWizardReturnTo } from "../orders/new/_wizard";

function WizardReturnBannerInner() {
  const searchParams = useSearchParams();
  const returnTo = sanitizeWizardReturnTo(
    searchParams.get("returnTo") ?? undefined,
  );
  if (!returnTo) return null;

  return (
    <div className="border-b border-green-200 bg-green-50 px-4 py-3 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-green-900">
          <span className="font-medium">Grocery list in progress.</span> Your
          list details are saved — continue the wizard when you&apos;re done
          here.
        </p>
        <Link
          href={returnTo}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-green-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-green-800 sm:self-auto"
        >
          Continue grocery list
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function WizardReturnBanner() {
  return (
    <Suspense fallback={null}>
      <WizardReturnBannerInner />
    </Suspense>
  );
}
