"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { purgeGlLocalStorage, wipeAllAppDataToEmpty } from "../_lib/store";

export default function WipePage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const reloadHome = () => {
    window.location.assign("/");
  };

  const handlePurge = () => {
    if (
      !window.confirm(
        "Remove all GroceryList data from this browser? The app will reload with fresh demo ingredients and menus.",
      )
    )
      return;
    purgeGlLocalStorage();
    setMessage("Storage cleared. Reloading…");
    reloadHome();
  };

  const handleBlank = () => {
    if (
      !window.confirm(
        "Wipe to a blank slate (empty ingredients, menus, lists, orders)? The app will reload.",
      )
    )
      return;
    wipeAllAppDataToEmpty();
    setMessage("Wiped to empty. Reloading…");
    reloadHome();
  };

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-6 px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pl-14 pt-8 text-center sm:px-6 sm:py-16 sm:pl-6">
      <h1 className="text-lg font-semibold text-zinc-900">Clear browser storage</h1>
      <p className="text-sm text-zinc-600">
        This only affects data stored by this app under the{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs">gl.*</code> keys on
        this site. Other sites or other keys on the same origin are not touched.
      </p>

      {message ? (
        <p className="text-sm font-medium text-green-800" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={handlePurge}
          className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-medium text-white hover:bg-amber-800"
        >
          Clear localStorage and restore demo data
        </button>
        <button
          type="button"
          onClick={handleBlank}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Wipe to completely empty (no demo)
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          Cancel
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-zinc-400">
        Tip: you can also clear site data from your browser settings (Application
        → Local Storage). Remove the <code className="rounded bg-zinc-100 px-1">app/wipe</code>{" "}
        route before production if you do not want this page public.
      </p>

      <Link
        href="/"
        className="text-sm font-medium text-green-700 hover:text-green-800"
      >
        Back to home
      </Link>
    </main>
  );
}
