export default function FomoStockIndicator({ initialStock = 15 }: { initialStock?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-sm text-green-700">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
      <span className="font-semibold">
        ✓ In stock — ready to ship
      </span>
    </div>
  );
}
