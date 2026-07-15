export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="section-title mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              FreshLock Pty Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth) and the General Data Protection Regulation (GDPR) for EU customers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We may collect:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, billing address</li>
              <li><strong>Payment Information:</strong> Credit card details or PayPal account (processed securely by our payment providers)</li>
              <li><strong>Order Information:</strong> Purchase history, order details, preferences</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device information, cookies</li>
              <li><strong>Communication Data:</strong> Emails, chat messages, or other correspondence with us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Process and fulfil your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-3">
              <li><strong>Service Providers:</strong> Payment processors (Stripe, PayPal), shipping carriers, and IT service providers who assist in our operations</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">5. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information only for as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required by law. Order records are kept for 7 years for tax and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">7. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website uses cookies to enhance your browsing experience, analyse site traffic, and personalise content. You can control cookies through your browser settings, but disabling them may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">8. Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organisational measures to protect your data, including encryption, secure servers, and regular security audits. However, no internet transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">9. International Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data may be transferred to and processed in countries outside Australia. We ensure appropriate safeguards are in place, including standard contractual clauses where required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related enquiries or to exercise your rights, contact us at:
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              <strong>Email:</strong> privacy@freshlock.com.au<br />
              <strong>Phone:</strong> 1300 FRESHLOCK (1300 373 745)<br />
              <strong>Address:</strong> FreshLock Pty Ltd, Level 4, 123 Collins Street, Melbourne VIC 3000
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-6 border-t">
            Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
