import Link from "next/link";

export const metadata = { title: "Terms of Service — LoyalLocal" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Template — review with a legal professional before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1 font-semibold">The service</h2>
          <p className="text-muted-foreground">
            LoyalLocal provides digital loyalty cards for local businesses.
            Businesses set their own reward rules; rewards are provided by the
            business, not by LoyalLocal.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Using your card</h2>
          <p className="text-muted-foreground">
            Stamps and rewards have no cash value and can&apos;t be transferred or
            sold. A business may change or end its program; we&apos;ll show your
            current status on the card.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Fair use</h2>
          <p className="text-muted-foreground">
            Please don&apos;t attempt to abuse the program (for example, faking
            visits). Businesses can remove cards that violate their program rules.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Reviews</h2>
          <p className="text-muted-foreground">
            We never require or reward you for leaving an online review. Any review
            request is optional and not tied to a stamp, discount, or prize.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}
