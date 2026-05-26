"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuIcon } from "./icons";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
      <button
        type="button"
        className="fixed left-3 z-[60] flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-sm max-md:top-[max(0.75rem,env(safe-area-inset-top,0px))] md:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-expanded={mobileNavOpen}
        aria-controls="app-sidebar"
        aria-label="Open navigation menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-zinc-900/40 md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0">
        {children}
      </div>
    </div>
  );
}
