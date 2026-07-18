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
        <p>We ship worldwide — including the US, UK, Canada, Australia, New Zealand, and across Europe. Japanese customers please visit <a href="https://jp.freshlocksealer.com" className="text-accent hover:underline">FreshLock Japan</a> for local pricing in JPY.</p>

        <h2>Shipping Origin</h2>
        <p>FreshLock is a direct-to-consumer brand. Orders ship from our fulfilment partners in Asia via tracked international air mail. Prices on this site are in AUD for the convenience of our Australian and New Zealand customers.</p>

        <h2>Processing Time</h2>
        <p>All orders are processed within 1–2 business days (Monday–Friday). Orders placed after 2:00 PM AEST/AEDT will be processed the next business day.</p>

        <h2>Shipping Methods & Delivery Times</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 my-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Destination</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Delivery Time (after dispatch)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Australia & New Zealand</td>
                <td className="border border-gray-300 px-4 py-2">7–14 business days</td>
                <td className="border border-gray-300 px-4 py-2">FREE over $79 AUD<br />$7.95 AUD under $79</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">United States, Canada & UK</td>
                <td className="border border-gray-300 px-4 py-2">7–14 business days</td>
                <td className="border border-gray-300 px-4 py-2">Calculated at checkout</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Europe & Rest of World</td>
                <td className="border border-gray-300 px-4 py-2">10–18 business days</td>
                <td className="border border-gray-300 px-4 py-2">Calculated at checkout</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 italic">Delivery times are estimates after dispatch. Customs clearance in the destination country may add a few extra days — this is outside our control but we will help resolve any delays.</p>

        <h2>Free Shipping</h2>
        <p>Enjoy <strong>FREE standard shipping</strong> on all orders over <strong>$79 AUD</strong> (Australia & New Zealand). The discount is applied automatically — no code needed. Rates for other regions are calculated at checkout based on destination.</p>

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
