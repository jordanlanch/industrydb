import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | IndustryDB",
  description: "IndustryDB Terms of Service - Read our terms, acceptable use policy, and subscription details.",
  robots: "index, follow",
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> January 26, 2026
          </p>

          <section className="prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to IndustryDB. By accessing or using our service at industrydb.io
              ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, you may not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>IndustryDB provides verified business data and lead information organized by industry. Our Service includes:</p>
            <ul>
              <li>Searchable database of businesses by industry, location, and other criteria</li>
              <li>Lead export functionality (CSV, Excel formats)</li>
              <li>API access for programmatic data retrieval (Business tier and above)</li>
              <li>Subscription-based pricing with different usage limits</li>
            </ul>

            <h2>3. Eligibility</h2>
            <p>
              <strong>You must be at least 18 years old to use this Service.</strong> By using IndustryDB, you represent and warrant that:
            </p>
            <ul>
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will use the Service in compliance with all applicable laws</li>
            </ul>

            <h2>4. Account Registration</h2>

            <h3>4.1 Account Security</h3>
            <p>You agree to:</p>
            <ul>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
              <li>Not share your account credentials with others</li>
            </ul>

            <h2>5. Subscription Plans and Pricing</h2>

            <div className="bg-blue-50 rounded-lg p-6 my-6">
              <h3 className="text-xl font-bold mb-4">Subscription Tiers</h3>

              <div className="space-y-4">
                <div className="bg-white rounded p-4">
                  <h4 className="font-bold">Free Tier</h4>
                  <ul className="text-sm mt-2">
                    <li>• 50 leads per month</li>
                    <li>• Basic data (name, address, phone)</li>
                  </ul>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-bold">Starter - $49/month</h4>
                  <ul className="text-sm mt-2">
                    <li>• 500 leads per month</li>
                    <li>• Enhanced data (email, social media)</li>
                    <li>• Priority support</li>
                  </ul>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-bold">Pro - $149/month</h4>
                  <ul className="text-sm mt-2">
                    <li>• 2,000 leads per month</li>
                    <li>• Full data access</li>
                    <li>• Advanced filters</li>
                  </ul>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-bold">Business - $349/month</h4>
                  <ul className="text-sm mt-2">
                    <li>• 10,000 leads per month</li>
                    <li>• API access</li>
                    <li>• Dedicated support</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3>5.2 Billing</h3>
            <ul>
              <li>All subscriptions are billed monthly in advance</li>
              <li>Prices are in USD and subject to change with 30 days notice</li>
              <li>Payment processing is handled securely by Stripe</li>
              <li>Failed payments may result in service suspension</li>
            </ul>

            <h3>5.3 Usage Limits</h3>
            <p>
              Each subscription tier has a monthly usage limit. If you exceed your limit,
              you will be unable to access additional data until the next billing cycle.
              You may upgrade to a higher tier to increase your limit.
            </p>

            <h3>5.4 Refund Policy</h3>
            <ul>
              <li>Free tier: No refunds (free service)</li>
              <li>Paid tiers: No refunds for partial months</li>
              <li>You may cancel at any time; service continues until end of billing period</li>
            </ul>

            <h2>6. Acceptable Use Policy</h2>
            <p className="text-red-600 font-semibold">You agree NOT to:</p>

            <h3>6.1 Prohibited Activities</h3>
            <ul>
              <li>Use the Service for illegal purposes</li>
              <li>Scrape, spider, or use automated tools beyond API limits</li>
              <li>Resell, redistribute, or sublicense data obtained from IndustryDB</li>
              <li>Reverse engineer or decompile any part of the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Use the Service to send spam or unsolicited communications</li>
            </ul>

            <h3>6.2 Data Usage Restrictions</h3>
            <p>Data obtained from IndustryDB may only be used for:</p>
            <ul>
              <li>Lead generation and business development</li>
              <li>Market research and analysis</li>
              <li>Your own internal business purposes</li>
            </ul>

            <p className="text-red-600 font-semibold">You may NOT:</p>
            <ul>
              <li>Create a competing service or database</li>
              <li>Sell or license the data to third parties</li>
              <li>Use the data for illegal telemarketing or spam</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              IndustryDB owns all rights, title, and interest in the Service, including
              all software, designs, technology, our logo, trademarks, and the structure
              and organization of data.
            </p>

            <h3>7.1 License Grant</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to
              access and use the Service for your internal business purposes within your
              subscription limits.
            </p>

            <h2>8. Data Accuracy and Disclaimers</h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
              <h3 className="text-lg font-bold mb-2">⚠️ Important Notice</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
                We strive to provide accurate data, but we do not guarantee 100% accuracy.
                Business information may change without our knowledge.
              </p>
              <p className="mt-2">
                <strong>You are responsible for:</strong>
              </p>
              <ul className="mt-2">
                <li>• Verifying the accuracy of data before use</li>
                <li>• Complying with anti-spam and telemarketing laws</li>
                <li>• Obtaining necessary consents for contacting businesses</li>
              </ul>
            </div>

            <h2>9. Limitation of Liability</h2>
            <p className="text-red-600 font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <p>
              WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA, OR COST OF
              SUBSTITUTE SERVICES.
            </p>
            <p>
              <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE PAST 12 MONTHS,
              OR $100, WHICHEVER IS GREATER.</strong>
            </p>

            <h2>10. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>,
              which is incorporated into these Terms by reference.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes
              by email and posting the updated Terms on our website. Your continued use
              after changes become effective constitutes acceptance of the new Terms.
            </p>

            <h2>12. Termination</h2>
            <p>
              You may cancel your subscription at any time through your account settings.
              We may suspend or terminate your account immediately if you violate these Terms.
            </p>

            <h2>13. Contact Information</h2>
            <div className="bg-gray-50 rounded-lg p-6 my-6">
              <p className="mb-2">For questions about these Terms, please contact us:</p>
              <p className="mb-1"><strong>Email:</strong> legal@industrydb.io</p>
              <p className="mb-1"><strong>Support:</strong> support@industrydb.io</p>
              <p><strong>Website:</strong> https://industrydb.io</p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
              <p className="font-semibold">IMPORTANT NOTICE:</p>
              <p className="mt-2">
                These Terms of Service are a legal contract. By using IndustryDB,
                you acknowledge that you have read, understood, and agree to be
                bound by these Terms.
              </p>
            </div>
          </section>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t flex justify-between items-center">
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Privacy Policy
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
