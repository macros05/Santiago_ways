import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SantiagoWays',
  description: 'The terms that govern your use of SantiagoWays.',
};

const UPDATED = '2 June 2026';

export default function TermsPage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p style={{ color: '#78716c' }}>Last updated: {UPDATED}</p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the SantiagoWays
        application and services (the &ldquo;Service&rdquo;) provided by{' '}
        <strong>[COMPANY NAME]</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an
        account or using the Service you agree to these Terms. If you do not agree, do not use
        the Service.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 16 years old (or the age of digital consent in your country) to
        use the Service.
      </p>

      <h2>2. Your account</h2>
      <p>
        You are responsible for keeping your credentials secure and for activity under your
        account. Provide accurate information and notify us of any unauthorised use.
      </p>

      <h2>3. Subscriptions and billing</h2>
      <p>
        SantiagoWays offers optional paid subscriptions. Purchases are processed by the Apple
        App Store or Google Play and managed via RevenueCat. Subscriptions{' '}
        <strong>auto-renew</strong> unless cancelled at least 24 hours before the end of the
        current period; manage or cancel them in your App Store / Google Play account settings.
        Any free trial converts to a paid subscription unless cancelled before it ends. Refunds
        are handled according to the policies of the relevant app store.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>break the law or infringe others&rsquo; rights;</li>
        <li>post abusive, illegal, infringing or misleading content;</li>
        <li>harass other pilgrims or misuse location/community features;</li>
        <li>attempt to disrupt, reverse-engineer, scrape or overload the Service.</li>
      </ul>

      <h2>5. Your content</h2>
      <p>
        You retain ownership of the content you create (diary entries, posts, photos). By
        posting public content you grant us a worldwide, non-exclusive, royalty-free licence to
        host, store and display it solely to operate the Service. You are responsible for the
        content you publish and confirm you have the rights to share it.
      </p>

      <h2 style={{ color: '#b91c1c' }}>6. Safety disclaimer — important</h2>
      <p>
        SantiagoWays is an informational and companion tool. It is{' '}
        <strong>not a navigation, safety or emergency device</strong>. GPS, maps, elevation,
        weather, albergue and route information may be inaccurate, incomplete or unavailable
        (including offline or in areas with no signal). <strong>Do not rely solely on the app
        for navigation or safety.</strong> Always carry appropriate equipment, use your own
        judgement, and in an emergency contact local emergency services (112 in the EU). You
        walk the Camino at your own risk.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
        warranties of any kind to the maximum extent permitted by law.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any indirect, incidental
        or consequential damages, or for loss arising from your use of (or inability to use) the
        Service. Nothing in these Terms excludes liability that cannot be excluded by law.
      </p>

      <h2>9. Termination</h2>
      <p>
        We may suspend or terminate your access if you breach these Terms. You may stop using
        the Service and delete your account at any time.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of [JURISDICTION], and disputes are subject to the
        courts of [JURISDICTION], without prejudice to mandatory consumer protections in your
        country of residence.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms. We will revise the &ldquo;Last updated&rdquo; date and, for
        material changes, notify you in-app. Continued use after changes means you accept them.
      </p>

      <h2>12. Contact</h2>
      <p>
        [COMPANY NAME], [ADDRESS] — <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>.
      </p>
    </article>
  );
}
