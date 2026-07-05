import Link from "next/link";

export const metadata = { title: "Privacy Policy — LoyalLocal" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Template — review with a legal professional before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1 font-semibold">What we collect</h2>
          <p className="text-muted-foreground">
            When you join a business&apos;s loyalty program we collect your first
            name and, if you provide them, your email and phone number. We record
            your stamps, rewards, and visit history so the business can run its
            reward program.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">How we use it</h2>
          <p className="text-muted-foreground">
            Your information is used to operate the loyalty card, show your reward
            progress, and — only if you consented — send occasional offers and
            reminders as wallet card updates. We do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Wallet passes</h2>
          <p className="text-muted-foreground">
            Your card is stored in Apple Wallet or Google Wallet on your device.
            You can remove it at any time; removing it stops future updates.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Your choices</h2>
          <p className="text-muted-foreground">
            You can opt out of marketing messages, and you can ask the business to
            remove or anonymize your information. Contact the business directly to
            make a request.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
      </p>
    </main>
  );
}
