'use client';

import { useEffect } from 'react';
import { faqs } from '@/lib/data';
import { generateFAQSchema } from '@/lib/schema';

export default function FaqPage() {
  // 添加FAQ结构化数据（GEO优化）
  useEffect(() => {
    const schema = generateFAQSchema(faqs);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">Frequently Asked Questions</h1>
        <p className="section-subtitle">
          Everything you need to know about FreshLock products, shipping, and more.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f) => (
          <details key={f.question} className="bg-white rounded-xl p-6 shadow-sm group">
            <summary className="font-semibold text-primary cursor-pointer list-none flex justify-between items-center">
              {f.question}
              <span className="ml-4 text-accent group-open:rotate-180 transition-transform text-xl">
                ▾
              </span>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 bg-primary text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
        <p className="text-gray-300 mb-6">
          Our friendly team is here to help. Get in touch and we will get back to you within 24 hours.
        </p>
        <a href="/contact" className="btn-primary">
          Contact Us
        </a>
      </div>
    </div>
  );
}
