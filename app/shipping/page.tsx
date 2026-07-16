export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="section-title mb-8">Shipping &amp; Delivery Policy</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
          <section>
            <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
              <p className="text-gray-900 font-semibold">
                🚚 Free standard shipping on all Australian orders over <span className="text-accent">$79 AUD</span>. Fast dispatch within 1–2 business days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Shipping Destinations</h2>
            <p className="text-gray-600 leading-relaxed">
              FreshLock currently ships to all addresses within <strong>Australia</strong>, including metropolitan and regional areas, as well as PO boxes and parcel lockers where supported by our carriers. At this time we do not ship internationally from this storefront (our Japanese store ships to Japan).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Processing Time</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Orders are processed and dispatched within <strong>1–2 business days</strong> (Monday–Friday, excluding Australian public holidays).</li>
              <li>Orders placed after 12 PM AEST on a business day, or on weekends/holidays, will be dispatched the next business day.</li>
              <li>You will receive a shipping confirmation email with a tracking number as soon as your order leaves our warehouse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Delivery Times (Estimated)</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              After dispatch, typical delivery timeframes within Australia are:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-left text-gray-600 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 font-semibold">Destination</th>
                    <th className="border px-4 py-2 font-semibold">Standard Shipping</th>
                    <th className="border px-4 py-2 font-semibold">Express Shipping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Metro (Sydney, Melbourne, Brisbane, Adelaide, Perth, Canberra)</td>
                    <td className="border px-4 py-2">3–6 business days</td>
                    <td className="border px-4 py-2">1–3 business days</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Regional Australia</td>
                    <td className="border px-4 py-2">5–10 business days</td>
                    <td className="border px-4 py-2">2–5 business days</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Remote / WA / NT / TAS</td>
                    <td className="border px-4 py-2">7–12 business days</td>
                    <td className="border px-4 py-2">3–7 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-3">
              Total time from order to delivery is generally <strong>5–12 business days</strong> for standard shipping, depending on your location. Delivery times are estimates only and may be affected by public holidays, carrier delays, extreme weather, or other events outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Shipping Costs</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-left text-gray-600 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 font-semibold">Service</th>
                    <th className="border px-4 py-2 font-semibold">Order Value</th>
                    <th className="border px-4 py-2 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Standard Shipping</td>
                    <td className="border px-4 py-2">Under $79 AUD</td>
                    <td className="border px-4 py-2">$9.95 AUD flat rate</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Standard Shipping</td>
                    <td className="border px-4 py-2">$79 AUD and over</td>
                    <td className="border px-4 py-2"><strong className="text-accent">FREE</strong></td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Express Shipping</td>
                    <td className="border px-4 py-2">Any order value</td>
                    <td className="border px-4 py-2">$14.95 AUD flat rate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-3">
              Any applicable shipping cost is calculated and displayed at checkout before you complete payment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">5. Order Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              Once your order is dispatched, you will receive a shipping confirmation email containing your tracking number and a link to track your parcel on the carrier&rsquo;s website (typically Australia Post or one of our partner couriers). If you have not received your tracking email within 2 business days of ordering, please check your spam folder or contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">6. Carriers We Use</h2>
            <p className="text-gray-600 leading-relaxed">
              We use reputable national and regional carriers including Australia Post, Sendle, and selected courier partners. Carriers are chosen automatically based on destination, parcel size, and service level selected at checkout. We are unable to accept customer requests for a specific carrier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">7. PO Boxes, Parcel Lockers &amp; Authority to Leave</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>We ship to PO Boxes and Parcel Lockers via Australia Post where the service is available.</li>
              <li>By default, most carriers will leave your parcel in a safe place if you are not home. If you prefer the parcel not be left unattended, please add a note at checkout.</li>
              <li>Once a parcel is marked as &ldquo;delivered&rdquo; by the carrier, responsibility for the parcel passes to you. If a parcel appears to be missing or stolen after a &ldquo;delivered&rdquo; scan, please contact us and the carrier immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">8. Delayed, Lost or Damaged Parcels</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              If your order has not arrived within the estimated timeframe, or if it arrives damaged, please contact us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a> and we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Lodge a tracking investigation with the carrier on your behalf.</li>
              <li>Arrange a replacement or full refund if the parcel is confirmed lost or arrives damaged.</li>
              <li>Ask you to provide photos of damaged packaging/products if applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">9. Customs, Duties &amp; Taxes</h2>
            <p className="text-gray-600 leading-relaxed">
              All orders shipped within Australia are dispatched from our Australian warehouse and include GST in the displayed price. No additional customs or import duties apply to domestic Australian orders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">10. Shipping Questions?</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about shipping, delivery times, or a specific order, please email us at <a href="mailto:support@freshlocksealer.com" className="text-accent hover:underline">support@freshlocksealer.com</a> with your order number and we will respond within 24 hours on business days.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-6 border-t">
            Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
