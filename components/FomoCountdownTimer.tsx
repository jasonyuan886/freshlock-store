import Link from 'next/link';

export default function FomoCountdownTimer({ variant = 'homepage' }: { variant?: 'homepage' | 'pdp' }) {
  if (variant === 'pdp') {
    return (
      <div className="mb-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-bold text-red-600">⚡ Black Friday Deal</span>
          <span className="text-gray-600 ml-1">$10 OFF — Ends Dec 1</span>
        </div>
        <Link href="#purchase" className="text-xs font-semibold text-red-600 hover:underline">
          Order now →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
        <span className="font-bold text-sm md:text-base">⚡ Black Friday — $10 OFF Every Order!</span>
        <span className="text-xs md:text-sm opacity-90">Code BLACKFRIDAY10 · Free shipping over $89 · Ends Dec 1</span>
      </div>
    </div>
  );
}
