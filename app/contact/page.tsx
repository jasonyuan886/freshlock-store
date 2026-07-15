'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">
          Got a question? We would love to hear from you. Our team responds within 24 hours.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Form */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-primary mb-2">Message Sent!</h2>
              <p className="text-gray-500">Thank you for reaching out. We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option>General Enquiry</option>
                  <option>Order Support</option>
                  <option>Returns & Refunds</option>
                  <option>Product Question</option>
                  <option>Wholesale / Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-primary mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">support@freshlock.com.au</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">1300 FRESHLOCK (1300 373 745)</p>
                  <p className="text-sm text-gray-400">Mon–Fri 9am–5pm AEST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">
                    FreshLock Pty Ltd<br />
                    Level 4, 123 Collins Street<br />
                    Melbourne VIC 3000<br />
                    Australia
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-primary mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/faq" className="text-accent hover:underline">Frequently Asked Questions</a></li>
              <li><a href="/returns" className="text-accent hover:underline">Returns & Refund Policy</a></li>
              <li><a href="/contact" className="text-accent hover:underline">Shipping Information</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
