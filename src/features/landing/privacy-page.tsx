import { Wallet, ArrowLeft } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      {/* Nav */}
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <AppLink to="/" className="flex items-center gap-2.5">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <Wallet className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Budget Manager</span>
        </AppLink>
        <AppLink
          to="/"
          className="text-muted-foreground hover:text-foreground flex min-h-11 items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </AppLink>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-20">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated: April 2026</p>

        <div className="mt-10 space-y-10">
          <Section title="Overview">
            <p>
              Budget Manager (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a personal finance
              management application. We are committed to protecting your privacy and handling your
              data with transparency. This policy explains what data we collect, how we use it, and
              the measures we take to keep it secure.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>We collect only the information necessary to provide the service:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Account information</strong> — your email address and display name, provided
                via Auth0 during sign-up.
              </li>
              <li>
                <strong>Financial data</strong> — wallet names, transaction records, budget
                configurations, and categories you create within the app. This data is
                user-generated and stored solely to power your personal dashboard.
              </li>
              <li>
                <strong>Usage metadata</strong> — basic request logs (timestamps, IP addresses) for
                security monitoring and abuse prevention. We do not use analytics trackers or
                third-party tracking scripts.
              </li>
            </ul>
          </Section>

          <Section title="Data Storage & Infrastructure">
            <p>
              All application data is stored on servers located in the{' '}
              <strong>Indian region</strong> (Mumbai, ap-south-1). This includes application
              databases and backups. Authentication services are hosted in the{' '}
              <strong>United Kingdom</strong> via Auth0.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Data is stored in encrypted databases with encryption at rest enabled.</li>
              <li>
                All communication between your device and our servers uses TLS (HTTPS) encryption in
                transit.
              </li>
              <li>
                <strong>Daily backups</strong> are taken once every 24 hours and retained for
                disaster recovery purposes. Backups are stored in the same region and are encrypted.
              </li>
            </ul>
          </Section>

          <Section title="Personally Identifiable Information (PII)">
            <p>We take the protection of your personally identifiable information seriously:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                PII is <strong>encrypted</strong> in our databases. Your financial data cannot be
                associated with your identity by anyone — including our team — without the
                appropriate decryption keys.
              </li>
              <li>
                We do not sell, rent, or share your personal information with third parties for
                marketing or advertising purposes.
              </li>
              <li>
                Access to production systems is restricted and audited. No team member can view your
                financial details in a way that identifies you personally.
              </li>
            </ul>
          </Section>

          <Section title="Authentication">
            <p>
              We use <strong>Auth0</strong>, an industry-standard identity platform, to handle user
              authentication. We do not store your password. Auth0 manages login credentials,
              password hashing, and session tokens on our behalf with enterprise-grade security
              practices.
            </p>
          </Section>

          <Section title="Data Retention & Deletion">
            <ul className="list-disc space-y-2 pl-5">
              <li>Your data is retained as long as your account is active.</li>
              <li>
                You may request deletion of your account and all associated data by contacting us.
                Upon request, we will permanently delete your data from our systems and backups
                within 30 days.
              </li>
            </ul>
          </Section>

          <Section title="Cookies & Local Storage">
            <p>
              We use <strong>local storage</strong> in your browser to persist your authentication
              session and app preferences (such as theme and selected month). We do not use
              third-party cookies or tracking cookies.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <p>The only third-party service we integrate with is:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Auth0</strong> — for authentication and identity management. Auth0&apos;s
                privacy policy applies to the authentication data they process.
              </li>
            </ul>
            <p className="mt-3">
              We do not integrate with advertising networks, analytics platforms, or data brokers.
            </p>
          </Section>

          <Section title="Safe Harbour">
            <p>
              We operate in good faith to protect your data. While we implement industry-standard
              security measures including encryption at rest, encryption in transit, and access
              controls, no method of electronic storage or transmission is 100% secure. We cannot
              guarantee absolute security but are committed to promptly addressing any security
              incidents.
            </p>
            <p className="mt-3">
              In the event of a data breach that affects your personal information, we will notify
              affected users within 72 hours of becoming aware of the breach, in accordance with
              applicable data protection regulations.
            </p>
          </Section>

          <Section title="Children's Privacy">
            <p>
              Budget Manager is not intended for use by individuals under the age of 18. We do not
              knowingly collect personal information from children.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. Changes will be reflected on this
              page with an updated &quot;last updated&quot; date. Continued use of the application
              after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              If you have questions about this privacy policy or wish to request data deletion,
              please reach out via the contact information provided in your account settings.
            </p>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/50 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-3xl items-center justify-between px-6 py-6 text-sm">
          <span>&copy; {new Date().getFullYear()} Budget Manager</span>
          <AppLink to="/" className="hover:text-foreground transition-colors">
            Home
          </AppLink>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
