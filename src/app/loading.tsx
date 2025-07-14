export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-gold-sparkle rounded-full bg-gradient-to-r from-warm-oyster-gold to-champagne-sheen opacity-75"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-warm-oyster-gold border-t-transparent"></div>
          </div>
        </div>
        <p className="text-sm text-cocoa-brown animate-pulse">Loading...</p>
      </div>
    </div>
  );
} 