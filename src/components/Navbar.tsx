import Image from 'next/image';

export default function Navbar() {
  return (
    <header>
      <nav>
        <div className="logo">
          <Image
            src="/images/branding/logo.png"
            alt="Rupomoti Logo"
            width={200}
            height={60}
            priority
            style={{ height: 'auto' }}
          />
        </div>
        {/* ... rest of the navbar ... */}
      </nav>
    </header>
  );
} 