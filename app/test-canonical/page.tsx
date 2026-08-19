import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.freshlocksealer.com/test-canonical',
  },
};

export default function TestCanonicalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Canonical Test Page</h1>
      <p>This page tests if canonical URL rendering works.</p>
    </div>
  );
}
