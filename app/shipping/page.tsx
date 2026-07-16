import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | FreshLock',
  description: 'FreshLock shipping policy: delivery times, costs, and regions for handheld vacuum sealers and vacuum seal bags.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">Shipping Policy</h1>
        <p className="section-subtitle">
          Everything you need to know about delivery times, costs, and shipping regions.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2>Shipping Regions</h2>
        <p>We currently ship to Australia nationwide (including NSW, VIC, QLD, SA, WA, TAS, ACT, NT). Japanese customers please visit <a href="https://jp.freshlocksealer.com" className="text-accent hover:underline">FreshLock Japan</a>.</p>

        <h2>Processing Time</h2>
        <p>All orders are processed within 1–2 business days (Monday–Friday, excluding public holidays). Orders placed after 2:00 PM AEST/AEDT will be processed the next business day.</p>

        <h2>Shipping Methods & Delivery Times</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 my-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Delivery Time</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Standard Shipping (AU)</td>
                <td className="border border-gray-300 px-4 py-2">5–10 business days</td>
                <td className="border border-gray-300 px-4 py-2">FREE over $79 AUD<br />$7.95 AUD under $79</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Express Shipping (AU)</td>
                <td className="border border-gray-300 px-4 py-2">2–4 business days</td>
                <td className="border border-gray-300 px-4 py-2">$14.95 AUD</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Free Shipping</h2>
        <p>Enjoy <strong>FREE standard shipping</strong> on all orders over <strong>$79 AUD</strong> within Australia. The discount is automatically applied at checkout — no code needed.</p>

        <h2>Order Tracking</h2>
        <p>Once your order ships, you will receive a confirmation email with a tracking number. If you do not receive a tracking email within 3 business days, please contact us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>.</p>

        <h2>Lost or Damaged Packages</h2>
        <p>If your package arrives damaged or appears to be lost in transit, please contact us within 7 days of the estimated delivery date at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>. We will work with the carrier to resolve the issue.</p>

        <h2>Contact Us</h2>
        <p>For any shipping-related questions, please email <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>. Response time: within 24 hours on business days.</p>
      </div>
    </div>
  );
}
