import { AppLink } from '@/components/ui/app-link';
import { LegalPageLayout, LegalSection } from './legal-page-layout';

const FOOTER_LINKS = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/', label: 'Home' },
];

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="April 2026" footerLinks={FOOTER_LINKS}>
      <LegalSection title="Acceptance of Terms">
        <p>
          By accessing or using Budget Manager (&quot;the Service&quot;), you agree to be bound by
          these Terms of Service. If you do not agree to these terms, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="Description of Service">
        <p>
          Budget Manager is a personal finance <strong>tracking tool</strong> that allows you to
          record expenses, manage wallets, and set budgets. The Service is provided for informational
          and organizational purposes only.
        </p>
      </LegalSection>

      <LegalSection title="Not Financial Advice">
        <p>
          <strong>
            Budget Manager does not provide financial, investment, tax, or legal advice.
          </strong>{' '}
          The Service is a record-keeping tool only. Any financial data displayed — including
          balances, spending summaries, and budget progress — is based entirely on information you
          enter and should not be relied upon for financial decision-making.
        </p>
        <p className="mt-3">
          You are solely responsible for the accuracy of the data you enter and for any financial
          decisions you make. We strongly recommend consulting a qualified financial advisor for any
          financial planning or investment decisions.
        </p>
      </LegalSection>

      <LegalSection title="User Accounts">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate information when creating an account.</li>
          <li>You are responsible for maintaining the security of your account credentials.</li>
          <li>You must be at least 18 years of age to use the Service.</li>
          <li>One person or entity may not maintain more than one account.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
          <li>
            Attempt to gain unauthorized access to the Service, other accounts, or our systems.
          </li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          <li>
            Use automated systems (bots, scrapers) to access the Service without prior written
            permission.
          </li>
          <li>
            Reverse engineer, decompile, or attempt to extract the source code of the Service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="User Data">
        <p>
          You retain ownership of all data you enter into the Service. We do not claim any
          intellectual property rights over your financial data. Our use of your data is governed by
          our{' '}
          <AppLink to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </AppLink>
          .
        </p>
        <p className="mt-3">
          You are responsible for maintaining your own backups of any data you consider important.
          While we perform daily backups for disaster recovery, these are not intended as a
          user-facing backup service.
        </p>
      </LegalSection>

      <LegalSection title="Service Availability">
        <p>
          We strive to keep the Service available at all times but do not guarantee uninterrupted
          access. The Service may be temporarily unavailable due to maintenance, updates, or
          circumstances beyond our control.
        </p>
        <p className="mt-3">
          We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at
          any time, with or without notice. We will make reasonable efforts to notify users of
          significant changes in advance.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer of Warranties">
        <p>
          The Service is provided on an <strong>&quot;as is&quot;</strong> and{' '}
          <strong>&quot;as available&quot;</strong> basis, without warranties of any kind, either
          express or implied, including but not limited to implied warranties of merchantability,
          fitness for a particular purpose, or non-infringement.
        </p>
        <p className="mt-3">
          We do not warrant that the Service will be error-free, secure, or available at any
          particular time. We do not warrant the accuracy of any calculations, summaries, or reports
          generated by the Service based on user-entered data.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, Budget Manager and its operators shall
          not be liable for any indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits, data, or goodwill, arising out of or in connection with your use of
          the Service.
        </p>
        <p className="mt-3">
          In no event shall our total liability exceed the amount you have paid us in the twelve (12)
          months preceding the claim, or INR 1,000, whichever is greater.
        </p>
      </LegalSection>

      <LegalSection title="Indemnification">
        <p>
          You agree to indemnify and hold harmless Budget Manager and its operators from any claims,
          damages, losses, or expenses (including reasonable legal fees) arising from your use of the
          Service, your violation of these Terms, or your violation of any rights of a third party.
        </p>
      </LegalSection>

      <LegalSection title="Account Termination">
        <ul className="list-disc space-y-2 pl-5">
          <li>You may delete your account at any time by contacting us.</li>
          <li>
            We may suspend or terminate your account if we reasonably believe you have violated these
            Terms or are using the Service in a manner that could harm other users or our systems.
          </li>
          <li>
            Upon termination, your right to use the Service ceases immediately. We will delete your
            data in accordance with our Privacy Policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Intellectual Property">
        <p>
          The Service, including its design, code, graphics, and branding, is the intellectual
          property of Budget Manager and its operators. You may not copy, modify, distribute, or
          create derivative works based on the Service without prior written permission.
        </p>
      </LegalSection>

      <LegalSection title="Governing Law & Jurisdiction">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of{' '}
          <strong>India</strong>. Any disputes arising out of or relating to these Terms or the
          Service shall be subject to the exclusive jurisdiction of the courts in{' '}
          <strong>Bengaluru, Karnataka, India</strong>.
        </p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>
          We may update these Terms from time to time. Changes will be reflected on this page with an
          updated &quot;last updated&quot; date. Continued use of the Service after changes
          constitutes acceptance of the updated Terms. For material changes, we will make reasonable
          efforts to notify users via the Service.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          If you have questions about these Terms of Service, please reach out via the contact
          information provided in your account settings.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
