"use client";

import { useEffect, useState } from "react";
import { useSettings } from "../_lib/hooks";
import {
  AppMode,
  Settings,
  shouldShowOnboarding,
} from "../_lib/store";
import {
  ArrowRightIcon,
  BasketIcon,
  ChefHatIcon,
  ChevronLeftIcon,
  CheckIcon,
  SparklesIcon,
} from "./icons";

type Step = "welcome" | "mode" | "profile";

export function OnboardingOverlay() {
  const [settings, setSettings, hydrated] = useSettings();

  if (!hydrated) return null;
  if (!shouldShowOnboarding(settings)) return null;

  return (
    <OnboardingFlow settings={settings} setSettings={setSettings} />
  );
}

function OnboardingFlow({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (next: Settings) => void;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<AppMode>(settings.defaultMode);
  const [name, setName] = useState(settings.profileName);
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [householdName, setHouseholdName] = useState(settings.householdName);
  const [email, setEmail] = useState(settings.email);
  const [submitting, setSubmitting] = useState(false);

  // Lock scroll while overlay is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSkip = () => {
    setSubmitting(true);
    setSettings({ ...settings, onboarded: true });
  };

  const canFinish =
    name.trim().length > 0 &&
    (mode === "catering"
      ? businessName.trim().length > 0
      : householdName.trim().length > 0) &&
    (email.trim().length === 0 || /\S+@\S+\.\S+/.test(email.trim()));

  const handleFinish = () => {
    if (!canFinish) return;
    setSubmitting(true);
    setSettings({
      ...settings,
      profileName: name.trim(),
      defaultMode: mode,
      businessName:
        mode === "catering" ? businessName.trim() : settings.businessName,
      householdName:
        mode === "household" ? householdName.trim() : settings.householdName,
      email: email.trim(),
      onboarded: true,
    });
  };

  const stepIndex = step === "welcome" ? 1 : step === "mode" ? 2 : 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-zinc-950/60 px-4 py-8 backdrop-blur-sm"
    >
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <ProgressHeader stepIndex={stepIndex} />

        <div className="flex-1 px-8 pb-2 pt-7">
          {step === "welcome" ? (
            <WelcomeStep
              onContinue={() => setStep("mode")}
              onSkip={handleSkip}
            />
          ) : step === "mode" ? (
            <ModeStep
              mode={mode}
              onChange={setMode}
              onBack={() => setStep("welcome")}
              onContinue={() => setStep("profile")}
            />
          ) : (
            <ProfileStep
              mode={mode}
              name={name}
              setName={setName}
              businessName={businessName}
              setBusinessName={setBusinessName}
              householdName={householdName}
              setHouseholdName={setHouseholdName}
              email={email}
              setEmail={setEmail}
              onBack={() => setStep("mode")}
              onFinish={handleFinish}
              canFinish={canFinish && !submitting}
            />
          )}
        </div>

        {step !== "welcome" ? (
          <footer className="border-t border-zinc-100 px-8 py-3 text-center">
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800 disabled:opacity-50"
            >
              Skip for now
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function ProgressHeader({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 bg-gradient-to-br from-green-50 via-white to-violet-50 px-8 py-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm">
          <BasketIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-zinc-900">GroceryList</p>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Welcome
          </p>
        </div>
      </div>
      <ol className="flex items-center gap-1.5" aria-label="Onboarding progress">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex
                ? "w-8 bg-green-600"
                : i < stepIndex
                  ? "w-4 bg-green-300"
                  : "w-4 bg-zinc-200"
            }`}
            aria-current={i === stepIndex ? "step" : undefined}
          />
        ))}
      </ol>
    </div>
  );
}

function WelcomeStep({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
        <SparklesIcon className="h-6 w-6" />
      </span>
      <h2
        id="onboarding-title"
        className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900"
      >
        Smart grocery lists,
        <br />
        every time.
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-600">
        Plan catering orders, track your pantry, and let AI fill in the
        ingredients. Let&apos;s set up your profile in 30 seconds.
      </p>

      <ul className="mx-auto mt-6 grid max-w-sm grid-cols-1 gap-2 text-left text-sm text-zinc-700">
        <FeatureBullet>Auto-calculated grocery lists from your menu</FeatureBullet>
        <FeatureBullet>AI suggests ingredients for any dish</FeatureBullet>
        <FeatureBullet>Inventory + analytics built in</FeatureBullet>
      </ul>

      <div className="mt-7 flex flex-col items-center gap-2 pb-2">
        <button
          type="button"
          onClick={onContinue}
          autoFocus
          className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-800"
        >
          Get started
          <ArrowRightIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
        >
          Skip — I&apos;ll set this up later
        </button>
      </div>
    </div>
  );
}

function FeatureBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 rounded-lg bg-zinc-50 px-3 py-2">
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckIcon className="h-3 w-3" />
      </span>
      <span className="text-xs leading-relaxed text-zinc-700">{children}</span>
    </li>
  );
}

function ModeStep({
  mode,
  onChange,
  onBack,
  onContinue,
}: {
  mode: AppMode;
  onChange: (next: AppMode) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
        How will you use GroceryList?
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Pick the side that fits you best — you can always switch later.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModeCard
          active={mode === "catering"}
          accent="green"
          icon={<ChefHatIcon className="h-5 w-5" />}
          title="For catering"
          description="Manage menus, clients, orders, and pantry stock at scale."
          onClick={() => onChange("catering")}
        />
        <ModeCard
          active={mode === "household"}
          accent="violet"
          icon={<BasketIcon className="h-5 w-5" />}
          title="For household"
          description="Quick weekly shopping lists organized by aisle."
          onClick={() => onChange("household")}
        />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  accent,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  accent: "green" | "violet";
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  const activeRing =
    accent === "green"
      ? "border-green-300 bg-green-50 ring-2 ring-green-200"
      : "border-violet-300 bg-violet-50 ring-2 ring-violet-200";
  const iconBg =
    accent === "green"
      ? "bg-green-100 text-green-700"
      : "bg-violet-100 text-violet-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
        active
          ? activeRing
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </span>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="text-xs leading-relaxed text-zinc-500">{description}</p>
      {active ? (
        <span
          className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white ${
            accent === "green" ? "bg-green-600" : "bg-violet-600"
          }`}
          aria-hidden
        >
          <CheckIcon className="h-3 w-3" />
        </span>
      ) : null}
    </button>
  );
}

function ProfileStep({
  mode,
  name,
  setName,
  businessName,
  setBusinessName,
  householdName,
  setHouseholdName,
  email,
  setEmail,
  onBack,
  onFinish,
  canFinish,
}: {
  mode: AppMode;
  name: string;
  setName: (value: string) => void;
  businessName: string;
  setBusinessName: (value: string) => void;
  householdName: string;
  setHouseholdName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  onBack: () => void;
  onFinish: () => void;
  canFinish: boolean;
}) {
  const isCatering = mode === "catering";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canFinish) onFinish();
      }}
    >
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
        Tell us about yourself
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        These show up in the sidebar and on lists you share.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Your name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
            autoFocus
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </Field>

        {isCatering ? (
          <Field label="Catering business name" required>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Spice Route Catering"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
            />
          </Field>
        ) : (
          <Field label="Household label" required>
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. The Sharma Household"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
            />
          </Field>
        )}

        <Field
          label="Email"
          hint="Optional — only used if you want to follow up on feedback."
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </Field>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={!canFinish}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Finish setup
          <CheckIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-zinc-600">
        <span>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
        {!required ? (
          <span className="text-[10px] uppercase tracking-wide text-zinc-400">
            optional
          </span>
        ) : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-zinc-500">{hint}</p> : null}
    </label>
  );
}
