import React from 'react';

export default function WishlistPage() {
  // Placeholder: In a real app, fetch wishlist items from user data
  const wishlistItems: any[] = [];

  return (
    <main className="min-h-screen">
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">Wishlist</h1>
            <p className="text-lg md:text-xl text-pearl-light">Save your favorite jewelry pieces for later.</p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {wishlistItems.length === 0 ? (
              <div className="card p-8 text-center">
                <h2 className="font-display text-2xl mb-4 text-charcoal">Your wishlist is empty</h2>
                <p className="text-slate mb-6">Browse our collection and add items to your wishlist for easy access later.</p>
                <a href="/shop" className="btn-primary">Shop Now</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Map wishlist items here */}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
} 