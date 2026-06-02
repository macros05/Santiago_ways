import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SantiagoWays',
  description: 'How SantiagoWays collects, uses and protects your data.',
};

const UPDATED = '2 June 2026';

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p style={{ color: '#78716c' }}>Last updated: {UPDATED}</p>

      <p>
        This Privacy Policy explains how <strong>[COMPANY NAME]</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses and protects your personal data when you use the
        SantiagoWays mobile application and related services (the &ldquo;Service&rdquo;). We
        are the data controller. For any privacy question, contact{' '}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> email, name, username, hashed password, and
          optionally nationality, bio and avatar.
        </li>
        <li>
          <strong>Location data:</strong> your device location, including{' '}
          <strong>background location</strong> while you are recording a stage, used to show
          your position on the route, record your GPS track, validate credential stamps
          (proximity ≤ 200 m), detect when you go off-route, and — only if you opt in — show
          nearby pilgrims.
        </li>
        <li>
          <strong>GPS tracks:</strong> the route points you record while walking.
        </li>
        <li>
          <strong>Photos &amp; camera:</strong> images you choose to attach to community
          posts or diary entries.
        </li>
        <li>
          <strong>Diary entries:</strong> the text, mood and photos you write; private by
          default, public only if you generate a share link.
        </li>
        <li>
          <strong>Health &amp; fitness data:</strong> if you enable it, we read fitness
          metrics (e.g. steps, walking distance) from Apple Health / Android Health Connect to
          show your activity. This data is used <strong>only</strong> to provide in-app
          features. It is <strong>never</strong> used for advertising or sold, and is not
          shared with third parties.
        </li>
        <li>
          <strong>Usage &amp; device data:</strong> in-app analytics events (e.g. screens
          viewed, stages completed), app version and device type, used to improve the Service.
        </li>
        <li>
          <strong>Subscription data:</strong> purchase and entitlement status, processed
          through the app stores and RevenueCat. We never receive your full card details.
        </li>
      </ul>

      <h2>2. How we use your data</h2>
      <ul>
        <li>To provide and operate the Service (routes, tracking, credential, diary, community).</li>
        <li>To authenticate you and keep your account secure.</li>
        <li>To process subscriptions and prevent abuse (rate limiting).</li>
        <li>To improve the Service through aggregated analytics.</li>
        <li>To send you notifications you have enabled.</li>
      </ul>
      <p>
        Legal bases (GDPR): performance of our contract with you (core features), your consent
        (location, health, notifications, marketing), and our legitimate interests (security,
        analytics, product improvement). You can withdraw consent at any time in the device
        and in-app settings.
      </p>

      <h2>3. Third-party processors</h2>
      <p>We share the minimum data necessary with service providers that process it on our behalf:</p>
      <ul>
        <li><strong>Cloudinary</strong> — image storage and delivery.</li>
        <li><strong>RevenueCat</strong> + Apple App Store / Google Play — subscriptions.</li>
        <li><strong>Pusher</strong> — real-time chat and live map.</li>
        <li><strong>Google / Apple</strong> — Sign-in (if you choose it).</li>
        <li><strong>Resend</strong> — transactional email (e.g. password reset).</li>
        <li><strong>Open-Meteo</strong> — weather (coordinates only, no identity).</li>
        <li><strong>Booking.com (via RapidAPI)</strong> — albergue availability.</li>
        <li><strong>Google Gemini</strong> — AI guide; relevant route/diary context may be sent to generate recommendations.</li>
        <li><strong>Upstash</strong> — rate-limiting counters.</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2>4. Data retention</h2>
      <p>
        We keep account data while your account is active. GPS track points are retained for a
        limited period and then pruned automatically. You can delete your diary entries,
        revoke public share links, and request full account deletion at any time (see §6).
      </p>

      <h2>5. International transfers</h2>
      <p>
        Some processors are located outside your country. Where data leaves the EEA/UK, we rely
        on appropriate safeguards such as Standard Contractual Clauses.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Subject to applicable law (including GDPR/UK GDPR and the CCPA), you have the right to
        access, correct, delete, restrict or object to processing, and to data portability. To
        exercise these rights — including deleting your account and associated data — email{' '}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>. You may also lodge a complaint with
        your local data protection authority.
      </p>

      <h2>7. Security</h2>
      <p>
        Passwords are hashed with Argon2, traffic is encrypted with HTTPS, authentication uses
        short-lived tokens with rotation, and access is rate-limited. No system is perfectly
        secure, but we take reasonable measures to protect your data.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not directed to children under 16. We do not knowingly collect data from
        children under 16. If you believe a child has provided us data, contact us and we will
        delete it.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy. We will revise the &ldquo;Last updated&rdquo; date and, for
        material changes, notify you in-app.
      </p>

      <h2>10. Contact</h2>
      <p>
        [COMPANY NAME], [ADDRESS] — <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>.
      </p>
    </article>
  );
}
