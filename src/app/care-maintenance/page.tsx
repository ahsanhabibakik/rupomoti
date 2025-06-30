import React from 'react';

const careTips = [
  {
    title: 'Store Jewelry Properly',
    description: 'Keep your jewelry in a soft pouch or lined box to prevent scratches and tangling. Store pieces separately.'
  },
  {
    title: 'Avoid Chemicals',
    description: 'Remove jewelry before swimming, bathing, or using household cleaners. Chemicals can damage metals and gemstones.'
  },
  {
    title: 'Clean Gently',
    description: 'Use a soft cloth to gently wipe your jewelry after wearing. For a deeper clean, use mild soap and water.'
  },
  {
    title: 'Wear with Care',
    description: 'Put on jewelry after applying makeup, perfume, and hairspray to avoid residue buildup.'
  },
  {
    title: 'Regular Inspections',
    description: 'Check clasps, prongs, and settings regularly to ensure your jewelry is secure.'
  },
];

export default function CareMaintenancePage() {
  return (
    <main className="min-h-screen">
      <section className="relative h-[20vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="mx-auto max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">Care & Maintenance</h1>
            <p className="text-lg md:text-xl text-pearl-light">Keep your jewelry shining with these expert care tips.</p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            {careTips.map((tip, idx) => (
              <div key={idx} className="card p-6">
                <h2 className="font-display text-2xl mb-2 text-charcoal">{tip.title}</h2>
                <p className="text-slate">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 