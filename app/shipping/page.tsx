import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | FreshLock Australia',
  description: 'FreshLock Australia shipping: FREE standard delivery on orders over A$99. Express shipping available. Ships from China via tracked air to AU & NZ.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">Shipping Policy</h1>
        <p className="section-subtitle">
          Transparent delivery times, costs, and regions for your FreshLock order.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2>Shipping Regions</h2>
        <p>
          This site (freshlocksealer.com) ships to <strong>Australia & New Zealand</strong> with pricing in AUD.
          Japanese customers please visit <a href="https://jp.freshlocksealer.com" className="text-accent hover:underline">FreshLock Japan</a> for local pricing in JPY.
          For other regions, please contact us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a> for a custom shipping quote.
        </p>

        <h2>Shipping Origin</h2>
        <p>
          FreshLock is a direct-to-consumer brand. Orders ship from our warehouse in <strong>Shenzhen, China</strong> via tracked international air mail with battery-compliant carriers (our handheld sealers contain rechargeable lithium batteries). All prices are in AUD.
        </p>

        <h2>Processing Time</h2>
        <p>
          All orders are processed within <strong>1–2 business days</strong> (Monday–Friday). Orders placed after 2:00 PM AEST/AEDT will be dispatched the next business day.
        </p>

        <h2>Shipping Methods & Delivery Times (Australia & NZ)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 my-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Delivery Time (after dispatch)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><strong>Standard (Air Parcel)</strong></td>
                <td className="border border-gray-300 px-4 py-2">7–12 business days</td>
                <td className="border border-gray-300 px-4 py-2">
                  <strong>FREE</strong> on orders over <strong>A$99</strong><br />
                  A$12.95 on orders under A$99
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><strong>Express (DHL/FedEx)</strong></td>
                <td className="border border-gray-300 px-4 py-2">3–5 business days</td>
                <td className="border border-gray-300 px-4 py-2">
                  A$22.95 on orders under A$99<br />
                  A$9.95 on orders over A$99
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg my-6">
          <p className="text-sm text-gray-700 m-0">
            <strong>💡 Tip:</strong> Add a pack of vacuum seal bags to your Pro sealer order — total easily exceeds A$99 and ships FREE. The Starter Kit (sealer + 30 bags) always qualifies for free standard shipping.
          </p>
        </div>

        <h3>Remote Area Surcharge</h3>
        <p>
          Express shipping to some remote postcodes in Western Australia, Northern Territory, and regional New Zealand may incur an additional surcharge. If applicable, our team will contact you within 1 business day to confirm before dispatch.
        </p>

        <h2>Free Shipping Threshold</h2>
        <p>
          Enjoy <strong>FREE standard shipping</strong> automatically applied to all Australian and New Zealand orders over <strong>A$99</strong> — no code needed. The free-shipping threshold is calculated on your merchandise subtotal (before any promotional discounts).
        </p>

        <h2>Battery & Carrier Compliance</h2>
        <p>
          Our FreshLock Pro handheld vacuum sealer contains a built-in rechargeable lithium-ion battery. We use only carriers authorized to transport lithium-ion battery products internationally (no sea mail, no surface post). This means slightly longer transit times than regular parcels but guaranteed safe, compliant delivery.
        </p>

        <h2>Order Tracking</h2>
        <p>
          Once your order ships, you will receive a confirmation email with a tracking number and carrier link. Most orders receive tracking within 2–3 business days of placing the order. If you do not receive a tracking email within 3 business days, please contact us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>.
        </p>

        <h2>Customs & Import Duties</h2>
        <p>
          For Australian orders under A$1,000, no GST or import duty applies on entry (GST is already charged at checkout). New Zealand orders under NZ$1,000 are similarly duty-free. Any customs processing delays are outside our control but we will assist with documentation if needed.
        </p>

        <h2>Lost or Damaged Packages</h2>
        <p>
          If your package arrives damaged or appears to be lost in transit, please contact us within 7 days of the estimated delivery date at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>. We will work with the carrier to resolve the issue — including reshipment or full refund where applicable.
        </p>

        <h2>Contact Us</h2>
        <p>
          For any shipping-related questions, please email <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>. Response time: within 24 hours on business days.
        </p>
      </div>
    </div>
  );
}
