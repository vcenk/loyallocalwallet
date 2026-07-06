import Link from "next/link";
import {
  QrCode,
  Smartphone,
  Sparkles,
  ArrowRight,
  Check,
  Megaphone,
  ScanLine,
  LineChart,
  Wallet,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HeroCard } from "@/components/hero-card";
import { CardStack } from "@/components/card-stack";

const NICHES = [
  "Cafés",
  "Barbers",
  "Nail salons",
  "Bubble tea",
  "Bakeries",
  "Pet groomers",
  "Food trucks",
  "Dessert shops",
  "Coffee roasters",
];

const PLANS = [
  {
    name: "Starter",
    price: "19",
    blurb: "For a single local shop finding its regulars.",
    features: ["1 location", "1 loyalty card", "3 staff", "QR enrollment", "Basic analytics"],
    featured: false,
  },
  {
    name: "Growth",
    price: "39",
    blurb: "Bring customers back with win-back campaigns.",
    features: ["Up to 3 cards", "10 staff", "Win-back campaigns", "Inactive customer lists", "Data export"],
    featured: true,
  },
  {
    name: "Pro",
    price: "79",
    blurb: "For busy or multi-location shops.",
    features: ["3 locations", "10 cards", "30 staff", "Location analytics", "Priority support"],
    featured: false,
  },
];

const FAQS = [
  {
    q: "Do my customers need to download an app?",
    a: "No. They scan a QR code, enter their name, and save the card to Apple Wallet or Google Wallet — the wallet they already have on their phone.",
  },
  {
    q: "Does it work on iPhone and Android?",
    a: "Yes. LoyalLocal generates a real Apple Wallet pass and a Google Wallet pass, and both update automatically after each stamp.",
  },
  {
    q: "Can my staff use their own phones?",
    a: "Yes. The staff scanner runs on any phone — they scan the customer's wallet card and tap to add a stamp or redeem a reward in seconds.",
  },
  {
    q: "How is this different from a paper stamp card?",
    a: "It never gets lost, it updates instantly, and it tells you which customers are fading away — plus what to send them to bring them back.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel whenever you like. Start with a 14-day free trial, no credit card required.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="grain relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Warm ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]"
        style={{
          background:
            "radial-gradient(60% 60% at 78% 12%, rgba(255,107,74,0.28), transparent 60%), radial-gradient(50% 50% at 12% 8%, rgba(174,49,21,0.14), transparent 60%)",
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-xl font-extrabold tracking-tight text-primary"
          >
            LoyalLocal
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <span
            className="fade-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-3 py-1 text-xs font-semibold text-primary"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            No app required
          </span>
          <h1
            className="fade-up mt-5 font-display text-5xl font-extrabold leading-[1.03] tracking-tight text-foreground md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Turn one-time visitors into{" "}
            <span className="relative whitespace-nowrap text-primary">
              regulars
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8C50 3 150 3 198 8"
                  stroke="#ff6b4a"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p
            className="fade-up mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            LoyalLocal gives cafés, barbers and salons an Apple &amp; Google
            Wallet loyalty card. Customers scan a QR, save the card, and come
            back — and you see who&apos;s fading, with a one-tap win-back.
          </p>
          <div
            className="fade-up mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
            >
              See how it works
            </a>
          </div>
          <p
            className="fade-up mt-4 text-sm text-muted-foreground"
            style={{ animationDelay: "320ms" }}
          >
            14-day free trial · No credit card required
          </p>
        </div>

        {/* Hero wallet mockup — animated */}
        <div
          className="fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <HeroCard />
        </div>
      </section>

      {/* Niche marquee */}
      <section className="border-y border-border/60 bg-white/40 py-5">
        <div className="relative flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-8 whitespace-nowrap pr-8">
            {[...NICHES, ...NICHES].map((n, i) => (
              <span
                key={i}
                className="flex items-center gap-8 text-lg font-semibold text-muted-foreground/70"
              >
                {n}
                <span className="text-primary/40">✳</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
          Scan. Save. Come back.
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: <QrCode className="h-6 w-6" />,
              t: "Scan the QR",
              d: "Print your enrollment QR and place it at the counter. Customers scan it with their phone camera.",
            },
            {
              n: "02",
              icon: <Smartphone className="h-6 w-6" />,
              t: "Save to Wallet",
              d: "They enter their name and tap Add to Apple Wallet or Google Wallet. Done in under a minute.",
            },
            {
              n: "03",
              icon: <Star className="h-6 w-6" />,
              t: "Earn & come back",
              d: "Staff scan the card to add stamps. The pass updates instantly — and rewards keep them returning.",
            },
          ].map((s) => (
            <div key={s.n} className="relative">
              <span className="font-display text-6xl font-extrabold text-primary/15">
                {s.n}
              </span>
              <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {s.icon}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Card showcase — isometric stack + feature checklist */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <CardStack />
          </div>
          <div className="order-1 md:order-2">
            <span className="inline-block border-b-2 border-accent pb-1 text-sm font-bold uppercase tracking-widest text-primary">
              The wallet card
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              One card, in the wallet they already carry.
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Your logo, your colors — a real Apple &amp; Google Wallet pass that
              updates itself after every visit. No plastic, no paper, nothing to
              download.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Real Apple & Google Wallet passes",
                "Updates instantly after every stamp",
                "Your logo, colors & reward",
                "No app for your customers",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[#261815]">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="text-base font-medium text-foreground">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-8">
        <SectionEyebrow>Everything you need</SectionEyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
          More than a stamp counter.
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-6">
          <FeatureCard
            className="md:col-span-4"
            icon={<Wallet className="h-5 w-5" />}
            title="Real Apple & Google Wallet passes"
            body="Not a screenshot — genuine wallet cards that live next to boarding passes and payment cards, and update after every stamp."
            big
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<ScanLine className="h-5 w-5" />}
            title="Fast staff scanner"
            body="Scan, stamp, redeem in under 5 seconds — on any phone."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<LineChart className="h-5 w-5" />}
            title="Know who's fading"
            body="See inactive customers grouped by how long they've been away."
          />
          <FeatureCard
            className="md:col-span-4"
            icon={<Megaphone className="h-5 w-5" />}
            title="One-tap win-back campaigns"
            body="LoyalLocal spots the regulars slipping away and drafts a “we miss you” offer — you review and send it as a wallet update."
            big
          />
        </div>
      </section>

      {/* Differentiator */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#261815] to-[#3c2320] px-8 py-16 text-white md:px-16">
          <Sparkles className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-white/5" />
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ff6b4a]">
            The difference
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight md:text-4xl">
            Most loyalty tools count stamps. LoyalLocal tells you{" "}
            <span className="text-[#ff8a6e]">who&apos;s about to disappear</span>{" "}
            — and what to send them.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Your dashboard answers the questions that actually grow a local
            business: who came back, who vanished, and who&apos;s one visit from
            a reward.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-8">
        <SectionEyebrow>Simple pricing</SectionEyebrow>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Priced for local shops.
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Start with a 14-day free trial. Cancel anytime.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                plan.featured
                  ? "border-primary bg-white shadow-xl shadow-primary/10"
                  : "border-border bg-white/60"
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Best for most shops
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <p className="mt-5 font-display text-4xl font-extrabold">
                ${plan.price}
                <span className="text-base font-medium text-muted-foreground">
                  {" "}
                  CAD/mo
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[color:var(--success)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition-all active:scale-95 ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : "border border-border bg-white text-foreground hover:bg-muted"
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <SectionEyebrow>Questions</SectionEyebrow>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Good to know.
        </h2>
        <div className="mt-10 divide-y divide-border rounded-3xl border border-border bg-white/60">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-semibold text-foreground">
                {f.q}
                <span className="ml-4 text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#ff6b4a] to-[#ae3115] px-8 py-16 text-center text-white md:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Ready to bring customers back?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/85">
            Set up your first wallet loyalty card in minutes. No app for your
            customers, no complicated POS.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary transition-transform hover:scale-105 active:scale-95"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
          <div>
            <span className="font-display text-lg font-extrabold text-primary">
              LoyalLocal
            </span>
            <p className="mt-1">No-app loyalty for local shops.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-bold uppercase tracking-widest text-primary">
      {children}
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  className = "",
  big = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
  big?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-border bg-white/70 p-7 transition-colors hover:border-primary/40 ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3
        className={`mt-4 font-display font-bold ${big ? "text-2xl" : "text-lg"}`}
      >
        {title}
      </h3>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </div>
  );
}
