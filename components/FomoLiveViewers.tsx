export default function FomoLiveViewers() {
  return (
    <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="font-medium text-gray-600">
        ✓ In stock — order soon
      </span>
    </div>
  );
}
