import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | IndustryDB",
  description: "IndustryDB Privacy Policy - Learn how we collect, use, and protect your personal information. GDPR compliant.",
  robots: "index, follow",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> January 26, 2026
          </p>

          <section className="prose prose-gray max-w-none">
            <h2>1. Introduction</h2>
            <p>
              IndustryDB ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our service at industrydb.io.
            </p>
            <p>
              By using IndustryDB, you agree to the collection and use of information
              in accordance with this policy.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Personal Information</h3>
            <p>When you register for an account, we collect:</p>
            <ul>
              <li><strong>Email address</strong>: Used for account authentication and communication</li>
              <li><strong>Name</strong>: Used for personalization and account identification</li>
              <li><strong>Password</strong>: Stored securely using industry-standard hashing (bcrypt)</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <p>We automatically collect certain information when you use our service:</p>
            <ul>
              <li><strong>API Usage Data</strong>: Search queries, export requests, and feature usage</li>
              <li><strong>Technical Data</strong>: IP address, browser type, device information</li>
              <li><strong>Usage Metrics</strong>: Number of searches performed, subscription tier, usage limits</li>
            </ul>

            <h3>2.3 Payment Information</h3>
            <p>
              Payment processing is handled by Stripe. We do not store your full credit card details.
              We only receive:
            </p>
            <ul>
              <li>Payment status (successful/failed)</li>
              <li>Last 4 digits of card</li>
              <li>Subscription status and tier</li>
            </ul>

            <h2>3. How We Use Your Information</h2>

            <h3>3.1 Service Delivery</h3>
            <ul>
              <li>Provide access to business data and lead information</li>
              <li>Process your searches and export requests</li>
              <li>Manage your subscription and billing</li>
              <li>Enforce usage limits based on your subscription tier</li>
            </ul>

            <h3>3.2 Communication</h3>
            <ul>
              <li>Send transactional emails (password resets, payment confirmations)</li>
              <li>Notify you about service updates or changes</li>
              <li>Respond to your support requests</li>
            </ul>

            <h3>3.3 Service Improvement</h3>
            <ul>
              <li>Analyze usage patterns to improve our service</li>
              <li>Debug technical issues and optimize performance</li>
              <li>Develop new features based on user needs</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p><strong>We do NOT sell your personal information.</strong></p>

            <h3>4.1 Service Providers</h3>
            <p>We use trusted third-party services:</p>
            <ul>
              <li><strong>Stripe</strong>: Payment processing (PCI DSS compliant)</li>
              <li><strong>AWS/Cloud Provider</strong>: Hosting infrastructure</li>
              <li><strong>Redis/PostgreSQL</strong>: Data storage</li>
            </ul>

            <h2>5. Your Rights (GDPR Compliance)</h2>
            <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>

            <h3>5.1 Right to Access</h3>
            <p>You can request a copy of all personal data we hold about you.</p>

            <h3>5.2 Right to Erasure ("Right to be Forgotten")</h3>
            <p>You can request deletion of your personal data through your account settings.</p>

            <h3>5.3 Right to Data Portability</h3>
            <p>You can request your data in a structured, machine-readable format.</p>

            <p className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <strong>To exercise these rights, please contact us at:</strong> privacy@industrydb.io<br/>
              We will respond to your request within 30 days.
            </p>

            <h2>6. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures:</p>
            <ul>
              <li><strong>Encryption</strong>: All data transmitted over HTTPS (TLS 1.3)</li>
              <li><strong>Password Security</strong>: Passwords hashed using bcrypt</li>
              <li><strong>Access Controls</strong>: Role-based access controls</li>
              <li><strong>Rate Limiting</strong>: Protection against brute force attacks</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>

            <h3>7.1 Essential Cookies</h3>
            <p>We use essential cookies required for the service to function:</p>
            <ul>
              <li>Authentication: Session management and login state</li>
              <li>Security: CSRF protection</li>
            </ul>

            <h3>7.2 Analytics Cookies</h3>
            <p>
              We may use analytics cookies to understand how users interact with our service.
              You can opt out through our cookie consent banner.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              IndustryDB is not intended for users under the age of 18. We do not knowingly
              collect personal information from children.
            </p>

            <h2>9. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification for material changes</li>
            </ul>

            <h2>10. Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-6 my-6">
              <p className="mb-2">If you have questions about this Privacy Policy, please contact us:</p>
              <p className="mb-1"><strong>Email:</strong> privacy@industrydb.io</p>
              <p className="mb-1"><strong>Website:</strong> https://industrydb.io</p>
              <p>For GDPR-related requests, please use the subject line "GDPR Request"</p>
            </div>
          </section>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t flex justify-between items-center">
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Terms of Service →
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Home
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2026 IndustryDB. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
