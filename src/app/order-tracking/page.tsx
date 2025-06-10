"use client";

import { useState } from "react";

export default function OrderTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(`Tracking info for: ${trackingNumber} (API integration coming soon)`);
  }

  return (
    <main className="min-h-screen">
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">Order Tracking</h1>
            <p className="text-lg md:text-xl text-pearl-light">Enter your tracking number below to see your order&apos;s status.</p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="card p-6 mb-8">
              <h2 className="font-display text-2xl mb-4 text-charcoal">Track Your Order</h2>
              <input
                type="text"
                placeholder="Enter your tracking number"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="w-full border rounded px-4 py-2 mb-4"
              />
              <button type="submit" className="btn-primary w-full">Track</button>
            </form>
            {result && (
              <div className="card p-6 bg-pearl-light">
                <h3 className="font-display text-xl mb-2 text-charcoal">Tracking Info (Demo)</h3>
                <p>{result}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-pearl">
        <div className="container text-center">
          <h2 className="font-display text-4xl mb-6 text-charcoal">Need Help?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate">If you have any questions or issues regarding your order, please contact our customer service.</p>
          <a href="/contact" className="btn-primary">Contact Us</a>
        </div>
      </section>
    </main>
  );
} 