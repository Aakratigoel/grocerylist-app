import Link from "next/link";
import {
  ArrowRightIcon,
  BasketIcon,
  BellIcon,
  CheckIcon,
  ChefHatIcon,
  HelpIcon,
} from "./_components/icons";

const cateringFeatures = [
  "Select from saved menu items",
  "Auto-calculate ingredients",
  "Check inventory & mark what to buy",
  "Share, save or download lists",
];

const householdFeatures = [
  "Add items manually",
  "Group by categories",
  "Set quantities",
  "Share, save or download lists",
];

export default function Home() {
  return (
    <>
      <TopBar />

      <main className="flex-1 px-10 pb-16 pt-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[26px]">
              How would you like to create your grocery list today?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Choose the mode that best fits your needs.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModeCard
              accent="green"
              icon={<ChefHatIcon className="h-7 w-7 text-green-700" />}
              title="For Caterers"
              badge="Recommended"
              description="Create grocery lists for orders by selecting menu items. Ingredients are auto-calculated and organized."
              features={cateringFeatures}
              ctaLabel="Create for Catering"
              ctaHref="/orders/new"
              footer="Perfect for events, parties, and large orders"
            />

            <ModeCard
              accent="purple"
              icon={<BasketIcon className="h-7 w-7 text-violet-600" />}
              title="For Household"
              description="Create a simple grocery list for your home. Add items manually and organize by categories."
              features={householdFeatures}
              ctaLabel="Create for Household"
              ctaHref="/grocery-lists/new"
              footer="Perfect for daily or weekly shopping"
            />
          </div>
        </div>
      </main>
    </>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-10 py-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900">
          Welcome, Aakrati <span aria-hidden>👋</span>
        </h1>
        <p className="text-xs text-zinc-500">Let&apos;s get started</p>
      </div>
      <div className="flex items-center gap-5 text-sm text-zinc-500">
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-zinc-900"
        >
          <HelpIcon className="h-4 w-4" />
          Help
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

type ModeCardProps = {
  accent: "green" | "purple";
  icon: React.ReactNode;
  title: string;
  badge?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  footer: string;
};

function ModeCard({
  accent,
  icon,
  title,
  badge,
  description,
  features,
  ctaLabel,
  ctaHref,
  footer,
}: ModeCardProps) {
  const styles =
    accent === "green"
      ? {
          iconBg: "bg-green-50",
          badgeBg: "bg-green-100 text-green-700",
          check: "text-green-600",
          button:
            "bg-green-700 hover:bg-green-800 focus-visible:outline-green-700",
        }
      : {
          iconBg: "bg-violet-50",
          badgeBg: "bg-violet-100 text-violet-700",
          check: "text-violet-600",
          button:
            "bg-violet-600 hover:bg-violet-700 focus-visible:outline-violet-600",
        };

  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col items-center text-center">
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg}`}
        >
          {icon}
        </span>
        <div className="mt-4 flex items-center gap-2">
          <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
          {badge ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles.badgeBg}`}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      <ul className="mt-6 space-y-2.5 rounded-xl bg-zinc-50 p-5 text-sm text-zinc-700">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <CheckIcon className={`h-4 w-4 ${styles.check}`} />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.button}`}
      >
        {ctaLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>

      <p className="mt-3 text-center text-xs text-zinc-500">{footer}</p>
    </article>
  );
}
