"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertIcon,
  BellIcon,
  ChefHatIcon,
  DatabaseIcon,
  DownloadIcon,
  HelpIcon,
  RefreshIcon,
  SettingsIcon,
  SparklesIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "../_components/icons";
import { useSettings } from "../_lib/hooks";
import {
  APP_VERSION,
  AiProviderPreference,
  AppMode,
  CURRENCIES,
  CurrencyCode,
  Settings,
  StorageBreakdown,
  clearAllData,
  exportAllData,
  formatBytes,
  importAllData,
  readStorageBreakdown,
  resetSeedData,
} from "../_lib/store";

type Banner =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function SettingsPage() {
  const [settings, setSettings, hydrated] = useSettings();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [breakdown, setBreakdown] = useState<StorageBreakdown[]>([]);
  const [breakdownStamp, setBreakdownStamp] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBreakdown(readStorageBreakdown());
  }, [breakdownStamp]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(t);
  }, [banner]);

  const totalBytes = useMemo(
    () => breakdown.reduce((sum, b) => sum + b.bytes, 0),
    [breakdown],
  );

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleExport = () => {
    try {
      const payload = exportAllData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `grocerylist-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBanner({ kind: "success", message: "Backup downloaded." });
    } catch (err) {
      setBanner({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Could not export data.",
      });
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = importAllData(parsed);
      if (!result.ok) {
        setBanner({
          kind: "error",
          message: result.error ?? "Import failed.",
        });
        return;
      }
      setBanner({
        kind: "success",
        message: `Imported ${result.imported} collection${result.imported === 1 ? "" : "s"}. Reload any open tabs to see changes.`,
      });
      setBreakdownStamp((n) => n + 1);
    } catch (err) {
      setBanner({
        kind: "error",
        message:
          err instanceof Error
            ? `Couldn't read file: ${err.message}`
            : "Couldn't read file.",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Reset to seed data?\n\nThis replaces your ingredients, menu items, and inventory with the original demo content. Orders, clients, and grocery lists are kept.",
      )
    ) {
      return;
    }
    resetSeedData();
    setBanner({ kind: "success", message: "Seed data restored." });
    setBreakdownStamp((n) => n + 1);
  };

  const handleReplayOnboarding = () => {
    setSettings({ ...settings, onboarded: false });
  };

  const handleClear = () => {
    if (
      !window.confirm(
        "Clear ALL data?\n\nThis wipes every ingredient, menu item, order, client, grocery list, and inventory record. This cannot be undone.",
      )
    ) {
      return;
    }
    if (
      !window.confirm(
        "Are you absolutely sure? Type cancel-friendly: this is your last warning.",
      )
    ) {
      return;
    }
    clearAllData();
    setBanner({ kind: "success", message: "All data cleared." });
    setBreakdownStamp((n) => n + 1);
  };

  return (
    <>
      <TopBar />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {banner ? (
            <div
              role="status"
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                banner.kind === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {banner.kind === "success" ? (
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
                    <path
                      d="m5 12 4.5 4.5L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <AlertIcon className="mt-0.5 h-4 w-4" />
              )}
              <p className="flex-1">{banner.message}</p>
              <button
                type="button"
                onClick={() => setBanner(null)}
                aria-label="Dismiss"
                className="text-xs opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ) : null}

          <ProfileSection
            settings={settings}
            onChange={update}
            disabled={!hydrated}
          />

          <PreferencesSection
            settings={settings}
            onChange={update}
            disabled={!hydrated}
          />

          <AiSection
            settings={settings}
            onChange={update}
            disabled={!hydrated}
          />

          <DataSection
            breakdown={breakdown}
            totalBytes={totalBytes}
            onExport={handleExport}
            onImport={() => fileInputRef.current?.click()}
            onReset={handleReset}
            onClear={handleClear}
          />

          <AboutSection onReplayOnboarding={handleReplayOnboarding} />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
            }}
          />
        </div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">Settings</h1>
        <p className="text-xs text-zinc-500">
          Customize your profile, AI preferences, and data.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
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

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-start gap-3 border-b border-zinc-100 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function ProfileSection({
  settings,
  onChange,
  disabled,
}: {
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  disabled: boolean;
}) {
  const initials = settings.profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Card
      icon={<UserIcon className="h-4 w-4" />}
      title="Profile"
      description="How your account appears in the sidebar and on receipts."
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-base font-semibold text-green-700">
          {initials || "?"}
        </span>
        <div className="text-xs text-zinc-500">
          Initials are auto-generated from your name.
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Display name">
          <input
            type="text"
            value={settings.profileName}
            disabled={disabled}
            onChange={(e) => onChange("profileName", e.target.value)}
            placeholder="e.g. Aakrati Sharma"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </Field>
        <Field label="Catering business">
          <input
            type="text"
            value={settings.businessName}
            disabled={disabled}
            onChange={(e) => onChange("businessName", e.target.value)}
            placeholder="Shows in catering mode"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </Field>
        <Field label="Household label">
          <input
            type="text"
            value={settings.householdName}
            disabled={disabled}
            onChange={(e) => onChange("householdName", e.target.value)}
            placeholder="Shows in household mode"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </Field>
        <Field label="Email" className="sm:col-span-2">
          <input
            type="email"
            value={settings.email}
            disabled={disabled}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@example.com — optional, never shared"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </Field>
      </div>
    </Card>
  );
}

function PreferencesSection({
  settings,
  onChange,
  disabled,
}: {
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  disabled: boolean;
}) {
  return (
    <Card
      icon={<SettingsIcon className="h-4 w-4" />}
      title="Preferences"
      description="Defaults applied across the app."
    >
      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-zinc-600">Default mode</p>
          <p className="text-[11px] text-zinc-500">
            Used when the sidebar opens on a neutral page.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["catering", "household"] as AppMode[]).map((mode) => {
              const active = settings.defaultMode === mode;
              const isCatering = mode === "catering";
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange("defaultMode", mode)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? isCatering
                        ? "border-green-300 bg-green-50"
                        : "border-violet-300 bg-violet-50"
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isCatering
                        ? "bg-green-100 text-green-700"
                        : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    <ChefHatIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 capitalize">
                      {mode}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {isCatering
                        ? "For catering professionals"
                        : "For personal households"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default guest count">
            <input
              type="number"
              min={1}
              max={1000}
              value={settings.defaultGuestCount}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  "defaultGuestCount",
                  Math.max(1, Math.min(1000, Number(e.target.value) || 1)),
                )
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Pre-filled when starting a new catering order.
            </p>
          </Field>

          <Field label="Currency">
            <select
              value={settings.currency}
              disabled={disabled}
              onChange={(e) =>
                onChange("currency", e.target.value as CurrencyCode)
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.label} ({c.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-zinc-500">
              For analytics and any future pricing.
            </p>
          </Field>
        </div>

        <Toggle
          label="Show low-stock banner"
          description="Surface a warning on the inventory page when items dip below threshold."
          checked={settings.showLowStockBanner}
          disabled={disabled}
          onChange={(value) => onChange("showLowStockBanner", value)}
        />
      </div>
    </Card>
  );
}

function AiSection({
  settings,
  onChange,
  disabled,
}: {
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  disabled: boolean;
}) {
  const options: {
    id: AiProviderPreference;
    label: string;
    desc: string;
  }[] = [
    {
      id: "auto",
      label: "Auto-detect",
      desc: "Use whichever key is configured (OpenAI > Gemini).",
    },
    {
      id: "openai",
      label: "OpenAI",
      desc: "Requires OPENAI_API_KEY in .env.local.",
    },
    {
      id: "gemini",
      label: "Google Gemini",
      desc: "Free tier available — set GOOGLE_API_KEY.",
    },
  ];

  return (
    <Card
      icon={<SparklesIcon className="h-4 w-4" />}
      title="AI suggestions"
      description="Pick which provider powers ingredient suggestions when AI is invoked."
    >
      <div className="space-y-2">
        {options.map((opt) => {
          const active = settings.aiProvider === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange("aiProvider", opt.id)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-violet-300 bg-violet-50"
                  : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  active
                    ? "border-violet-500 bg-violet-500"
                    : "border-zinc-300"
                }`}
              >
                {active ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ) : null}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">{opt.label}</p>
                <p className="text-[11px] text-zinc-500">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2.5 text-[11px] text-violet-800">
        Your selection is sent with each AI request. If the chosen provider
        isn&apos;t configured, the server falls back to whichever one has a key.
      </div>
    </Card>
  );
}

function DataSection({
  breakdown,
  totalBytes,
  onExport,
  onImport,
  onReset,
  onClear,
}: {
  breakdown: StorageBreakdown[];
  totalBytes: number;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  onClear: () => void;
}) {
  return (
    <Card
      icon={<DatabaseIcon className="h-4 w-4" />}
      title="Data"
      description="Backup, restore, or wipe everything. Data lives in your browser only."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionButton
          icon={<DownloadIcon className="h-4 w-4" />}
          label="Export all data"
          description="Download a JSON backup of everything."
          tone="primary"
          onClick={onExport}
        />
        <ActionButton
          icon={<UploadIcon className="h-4 w-4" />}
          label="Import backup"
          description="Restore from a previous export."
          tone="default"
          onClick={onImport}
        />
        <ActionButton
          icon={<RefreshIcon className="h-4 w-4" />}
          label="Reset to seed"
          description="Restore demo ingredients and menus."
          tone="default"
          onClick={onReset}
        />
        <ActionButton
          icon={<TrashIcon className="h-4 w-4" />}
          label="Clear everything"
          description="Delete every record. Cannot be undone."
          tone="danger"
          onClick={onClear}
        />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Storage usage
          </p>
          <p className="text-xs text-zinc-500">
            {formatBytes(totalBytes)} total
          </p>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {breakdown.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2 text-zinc-700">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    row.bytes === 0 ? "bg-zinc-300" : "bg-green-500"
                  }`}
                  aria-hidden
                />
                {row.label}
                {row.count > 0 ? (
                  <span className="text-[11px] text-zinc-400">
                    · {row.count} record{row.count === 1 ? "" : "s"}
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {formatBytes(row.bytes)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function AboutSection({
  onReplayOnboarding,
}: {
  onReplayOnboarding: () => void;
}) {
  return (
    <Card
      icon={<HelpIcon className="h-4 w-4" />}
      title="About"
      description="Version info and helpful links."
    >
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            App version
          </dt>
          <dd className="mt-1 text-zinc-900">{APP_VERSION}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Storage backend
          </dt>
          <dd className="mt-1 text-zinc-900">Browser localStorage</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Documentation
          </dt>
          <dd className="mt-1 text-xs text-zinc-500">
            See the README in the project repo for setup, AI configuration,
            and architecture notes.
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">
            Replay welcome flow
          </p>
          <p className="text-[11px] text-zinc-500">
            Walk through the onboarding wizard again to update your profile.
          </p>
        </div>
        <button
          type="button"
          onClick={onReplayOnboarding}
          className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
        >
          Replay
        </button>
      </div>
    </Card>
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
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50 disabled:opacity-60"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        <p className="text-[11px] text-zinc-500">{description}</p>
      </div>
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-green-600" : "bg-zinc-300"
        }`}
        aria-hidden
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  tone: "primary" | "default" | "danger";
}) {
  const toneClass = {
    primary:
      "border-green-200 bg-green-50 text-green-800 hover:border-green-300 hover:bg-green-100",
    default:
      "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
    danger:
      "border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${toneClass}`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] opacity-80">{description}</p>
      </div>
    </button>
  );
}
