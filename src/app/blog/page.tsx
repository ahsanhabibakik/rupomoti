import React from 'react';

export default function BlogPage() {
  // Placeholder: In a real app, fetch blog posts from a CMS or API
  const blogPosts: any[] = [];

  return (
    <main className="min-h-screen">
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">Blog</h1>
            <p className="text-lg md:text-xl text-pearl-light">Jewelry inspiration, news, and stories from Rupomoti.</p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {blogPosts.length === 0 ? (
              <div className="card p-8 text-center">
                <h2 className="font-display text-2xl mb-4 text-charcoal">No blog posts yet</h2>
                <p className="text-slate mb-6">Check back soon for the latest updates and stories from our team.</p>
                <a href="/" className="btn-primary">Back to Home</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Map blog posts here */}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
} 