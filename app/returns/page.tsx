export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="section-title mb-8">Returns & Refunds Policy</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
          <section>
            <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
              <p className="text-gray-900 font-semibold">
                🎉 30-Day Satisfaction Guarantee — If you are not completely happy, we will make it right.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Return Window</h2>
            <p className="text-gray-600 leading-relaxed">
              You may return most unused, unopened items within 30 days of delivery for a full refund or exchange. Items must be in their original packaging and in resalable condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Eligibility</h2>
            <p className="text-gray-600 leading-relaxed mb-3">To be eligible for a return:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Items must be unused and in original condition</li>
              <li>Original packaging must be intact</li>
              <li>Proof of purchase (order number) is required</li>
              <li>Return request must be initiated within 30 days of delivery</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              <strong>Non-returnable items:</strong> Used vacuum seal bags, personalised or custom items, and items marked as final sale.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-600">
              <li>
                <strong>Contact us:</strong> Email <a href="mailto:returns@freshlock.com.au" className="text-accent hover:underline">returns@freshlock.com.au</a> with your order number and reason for return.
              </li>
              <li>
                <strong>Receive approval:</strong> We will review your request and provide a Return Merchandise Authorisation (RMA) number within 1–2 business days.
              </li>
              <li>
                <strong>Ship the item:</strong> Package the item securely and ship to the address provided. You are responsible for return shipping costs unless the item is defective or we made an error.
              </li>
              <li>
                <strong>Inspection & refund:</strong> Once we receive and inspect the item, we will process your refund within 5–7 business days.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Refunds</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Refunds will be issued to your original payment method. Please allow:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Credit/Debit Cards:</strong> 5–10 business days after processing</li>
              <li><strong>PayPal:</strong> 3–5 business days after processing</li>
              <li><strong>Afterpay:</strong> Adjustments will be reflected in your Afterpay account</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Original shipping costs are non-refundable unless the return is due to our error.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">5. Exchanges</h2>
            <p className="text-gray-600 leading-relaxed">
              If you would like to exchange an item for a different product or variant, please contact us. Exchanges are subject to availability. If the new item is more expensive, you will pay the difference; if less expensive, we will refund the difference.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">6. Defective or Damaged Items</h2>
            <p className="text-gray-600 leading-relaxed">
              If you receive a defective or damaged item, contact us immediately with photos of the damage. We will arrange a replacement or full refund at no cost to you, including return shipping.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">7. Warranty Claims</h2>
            <p className="text-gray-600 leading-relaxed">
              FreshLock products are covered by a manufacturer warranty (1–2 years depending on the product). Warranty claims for defects in materials or workmanship are handled separately from returns. Contact us for warranty support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">8. Consumer Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              Our returns policy does not exclude, restrict, or modify any rights or remedies you may have under the Australian Consumer Law (ACL). Nothing in this policy limits your statutory rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">9. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For return enquiries, contact us at:
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              <strong>Email:</strong> returns@freshlock.com.au<br />
              <strong>Phone:</strong> 1300 FRESHLOCK (1300 373 745)<br />
              <strong>Hours:</strong> Mon–Fri 9am–5pm AEST
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
