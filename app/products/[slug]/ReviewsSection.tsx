'use client';

import { useState } from 'react';
import type { Review } from '@/lib/types';

interface ReviewsSectionProps {
  reviews?: Review[];
  productName?: string;
}

// Star rendering component
function Stars({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${size}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.049 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.299-3.957z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews = [], productName }: ReviewsSectionProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const total = reviews.length;
  const average = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  // Rating distribution 5..1
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = total > 0 ? (count / total) * 100 : 0;
    return { star, count, pct };
  });

  const handleWriteReview = (e: React.MouseEvent) => {
    e.preventDefault();
    setToastMsg('Reviews coming soon after launch — thank you for your interest!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <section
      className="mt-12 sm:mt-16 border-t pt-10"
      aria-labelledby="reviews-heading"
      itemScope
      itemType="https://schema.org/InteractionCounter"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 id="reviews-heading" className="text-2xl sm:text-3xl font-bold text-primary">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3 mt-2">
            {total > 0 ? (
              <>
                <Stars rating={average} size="text-lg" />
                <span className="text-base font-semibold text-gray-800">
                  {average.toFixed(1)} out of 5
                </span>
                <span className="text-sm text-gray-500">
                  ({total} {total === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <>
                <Stars rating={0} size="text-lg" />
                <span className="text-base text-gray-500">No reviews yet</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleWriteReview}
          className="min-h-[44px] px-5 py-2.5 bg-accent hover:bg-accent-500 text-white font-semibold rounded-lg text-base transition-colors shadow-sm"
          aria-label="Write a customer review"
        >
          Write a Review
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Rating distribution */}
        <div className="md:col-span-1 bg-gray-50 rounded-xl p-5 h-fit">
          <h3 className="font-semibold text-primary text-base mb-4">Rating breakdown</h3>
          <div className="space-y-2">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-gray-600 text-right">{star}★</span>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                    aria-label={`${star} star: ${count} reviews (${pct.toFixed(0)}%)`}
                  />
                </div>
                <span className="w-10 text-right text-gray-500 text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review list */}
        <div className="md:col-span-2">
          {total > 0 ? (
            <ul className="space-y-6">
              {reviews.slice(0, 10).map((r, idx) => (
                <li key={idx} className="border-b border-gray-100 pb-6 last:border-0" itemScope itemType="https://schema.org/Review">
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base" itemProp="author" itemScope itemType="https://schema.org/Person">
                          <span itemProp="name">{r.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.date).toLocaleDateString('en-AU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                      <meta itemProp="ratingValue" content={String(r.rating)} />
                      <meta itemProp="bestRating" content="5" />
                      <Stars rating={r.rating} />
                    </div>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed" itemProp="reviewBody">{r.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-4xl mb-3" aria-hidden="true">💬</div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Be the first to review{productName ? ` "${productName}"` : ''}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mb-5 leading-relaxed">
                We're a brand-new store and real customer reviews will appear here after launch
                as orders are delivered. We never post fake reviews — every rating you see will
                come from a verified purchase.
              </p>
              <button
                onClick={handleWriteReview}
                className="min-h-[44px] px-5 py-2.5 bg-accent hover:bg-accent-500 text-white font-semibold rounded-lg text-base transition-colors shadow-sm"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm max-w-sm text-center"
        >
          {toastMsg}
        </div>
      )}
    </section>
  );
}
