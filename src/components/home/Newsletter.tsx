import React from 'react';

export default function Newsletter() {
  return (
    <section className="py-16 text-center">
      <h2 className="font-display text-3xl mb-4">Newsletter</h2>
      <p className="text-slate">Subscribe to our newsletter for updates and offers.</p>
      <form className="mt-4 flex justify-center gap-2">
        <input type="email" placeholder="Your email" className="border rounded px-4 py-2" />
        <button type="submit" className="btn-primary">Subscribe</button>
      </form>
    </section>
  );
} 