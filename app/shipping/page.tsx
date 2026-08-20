import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy — Rates, Delivery & Free Shipping',
  description: 'FreshLock shipping policy: Free standard shipping on orders $49+. Expedited shipping available. 30-day money back guarantee. Track every order.',
  alternates: {
    canonical: 'https://www.freshlocksealer.com/shipping',
  },
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">Shipping Policy</h1>
        <p className="section-subtitle">
          Transparent rates, real tracking, and fast processing — know exactly when your FreshLock arrives.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2>🚚 Shipping Rates &amp; Delivery Times</h2>

        <h3>Domestic Shipping (United States)</h3>
        <table>
          <thead>
            <tr>
              <th>Shipping Method</th>
              <th>Order Value</th>
              <th>Shipping Cost</th>
              <th>Estimated Delivery</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Standard Shipping</strong></td>
              <td>Under $49</td>
              <td><strong>$4.99</strong></td>
              <td>3–5 business days</td>
            </tr>
            <tr>
              <td><strong>Standard Shipping</strong></td>
              <td>$49 and above</td>
              <td><strong>FREE</strong></td>
              <td>3–5 business days</td>
            </tr>
            <tr>
              <td><strong>Expedited Shipping</strong></td>
              <td>Any</td>
              <td><strong>$9.99</strong></td>
              <td>2–3 business days</td>
            </tr>
          </tbody>
        </table>
        <ul>
          <li>Orders are processed and shipped within <strong>1–2 business days</strong> of purchase.</li>
          <li>Shipping times are estimates and not guaranteed.</li>
          <li>We ship to all 50 U.S. states. Unfortunately, we cannot ship to P.O. Boxes, APO/FPO addresses, or U.S. territories (Puerto Rico, Guam, U.S. Virgin Islands, American Samoa).</li>
        </ul>

        <h3>International Shipping</h3>
        <table>
          <thead>
            <tr>
              <th>Destination</th>
              <th>Shipping Cost</th>
              <th>Estimated Delivery</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Canada</td>
              <td>$14.99</td>
              <td>7–14 business days</td>
            </tr>
            <tr>
              <td>Mexico</td>
              <td>$19.99</td>
              <td>10–20 business days</td>
            </tr>
            <tr>
              <td>Europe (EU &amp; UK)</td>
              <td>$24.99</td>
              <td>10–20 business days</td>
            </tr>
            <tr>
              <td>Australia &amp; New Zealand</td>
              <td>$24.99</td>
              <td>10–20 business days</td>
            </tr>
            <tr>
              <td>Asia (Japan, South Korea, China, etc.)</td>
              <td>$19.99</td>
              <td>10–20 business days</td>
            </tr>
            <tr>
              <td>Rest of World</td>
              <td>$29.99</td>
              <td>14–30 business days</td>
            </tr>
          </tbody>
        </table>
        <p><strong>Please note:</strong></p>
        <ul>
          <li>International shipping costs are calculated at checkout.</li>
          <li>Customers are responsible for any <strong>customs duties, import taxes, or tariffs</strong> imposed by the destination country. These charges are not included in the shipping cost.</li>
          <li>Delivery times are estimates and may vary due to customs processing.</li>
        </ul>

        <h2>📦 Order Tracking</h2>
        <ul>
          <li>Once your order ships, you will receive a <strong>confirmation email with a tracking number</strong>.</li>
          <li>You can track your package in real time via the link provided in the email or through our website&apos;s order tracking page.</li>
          <li>If you have not received your tracking number within 3 business days, please contact us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>.</li>
        </ul>

        <h2>🔄 Returns &amp; Refunds — 30-Day Money Back Guarantee</h2>
        <p>We stand behind every FreshLock product. If you&apos;re not 100% satisfied, you can return your purchase within <strong>30 days</strong> of the delivery date for a full refund.</p>

        <h3>Return Eligibility</h3>
        <ul>
          <li>Product must be in its <strong>original condition</strong> and <strong>original packaging</strong>.</li>
          <li>Product must not show signs of excessive use or damage caused by the customer.</li>
          <li>All accessories and documentation must be included.</li>
          <li>Return shipping is the <strong>customer&apos;s responsibility</strong> unless the product arrived defective or damaged.</li>
        </ul>

        <h3>How to Initiate a Return</h3>
        <ol>
          <li>Email us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a> with your order number and reason for return.</li>
          <li>We will issue a <strong>Return Merchandise Authorization (RMA) number</strong> within 1–2 business days.</li>
          <li>Ship the product back to the address provided in the RMA confirmation.</li>
          <li>Once we receive and inspect the returned item, your refund will be processed to the original payment method within <strong>5–7 business days</strong>.</li>
        </ol>

        <h3>Damaged or Defective Products</h3>
        <ul>
          <li>If your product arrives damaged or is defective, contact us immediately at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a>.</li>
          <li>We will provide a <strong>prepaid return shipping label</strong> and send a replacement or issue a full refund at no additional cost.</li>
        </ul>

        <h2>📞 Need Help?</h2>
        <p>Have questions about shipping, delivery, or returns? We&apos;re here to help.</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a></li>
          <li><strong>Response Time:</strong> We respond to all inquiries within 24 hours (Monday–Friday).</li>
        </ul>

        <p className="text-sm text-gray-500 mt-8">
          <em>FreshLock is committed to delivering your order quickly and safely. Thank you for choosing FreshLock — Keep It Fresh, Lock It In.</em>
        </p>
      </div>
    </div>
  );
}
