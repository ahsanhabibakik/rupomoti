export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-gold-sparkle rounded-full bg-gradient-to-r from-amber-400 to-yellow-200 opacity-75"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
} 