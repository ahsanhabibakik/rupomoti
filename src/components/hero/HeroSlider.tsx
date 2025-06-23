"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

const fallbackSlides = [
  {
    id: 1,
    image: "/images/hero/slider1.jpeg",
    mobileImage: "/images/hero/slider1.jpeg",
    title: "",
    subtitle: "",
    link: "/shop/necklaces",
    cta: "",
  },
  {
    id: 2,
    image: "/images/hero/slider2.jpeg",
    mobileImage: "/images/hero/slider2.jpeg",
    title: "",
    subtitle: "",
    link: "",
  },
  {
    id: 3,
    image: "/images/hero/slider3.jpg",
    mobileImage: "/images/hero/slider3.jpg",
    title: "",
    subtitle: "",
    link: "/shop/rings",
    cta: "",
  },
  {
    id: 4,
    image: "/images/hero/slider4.jpg",
    mobileImage: "/images/hero/slider4.jpg",
    title: "",
    subtitle: "",
    link: "/shop/rings",
    cta: "",
  },
];

export function HeroSlider() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Touch/mouse drag state
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Fetch hero-slider images from media API
    fetch("/api/public/media/hero-slider")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(
            data.map((item, idx) => ({
              id: item.id || idx,
              image: item.url,
              mobileImage: item.metadata?.mobileUrl || item.url,
              title: item.name || `Slide ${idx + 1}`,
              subtitle: item.alt || "",
              link: item.metadata?.link || "#",
              cta: item.metadata?.cta || "Shop Now",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setStartX('touches' in e ? e.touches[0].clientX : e.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    // Prevent scrolling while dragging
    if ('touches' in e) e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || startX === null) return;
    const endX = 'changedTouches' in e
      ? e.changedTouches[0].clientX
      : e.clientX;
    const diff = endX - startX;
    if (diff > 50) {
      prevSlide();
    } else if (diff < -50) {
      nextSlide();
    }
    setIsDragging(false);
    setStartX(null);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // Prevent unwanted selection
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || startX === null) return;
    const endX = e.clientX;
    const diff = endX - startX;
    if (diff > 50) {
      prevSlide();
    } else if (diff < -50) {
      nextSlide();
    }
    setIsDragging(false);
    setStartX(null);
  };

  return (
    <div className="relative py-4">
      {/* Hero Slider */}
      <div
        className="max-w-screen-xl mx-2 md:mx-auto mt-2 relative h-60 sm:h-72 md:h-80 overflow-hidden select-none rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setStartX(null);
        }}
        style={{ touchAction: "pan-y" }}
      >
        {slides.map((slide, index) => (
          <Link
            href={slide.link}
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 z-0 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              {/* Desktop Image */}
              <div className="relative w-full h-full hidden md:block">
                <Image
                  src={slide.image}
                  alt={`Slide ${slide.id}`}
                  fill
                  className="object-cover pointer-events-none"
                  priority={index === 0}
                  draggable={false}
                />
              </div>
              {/* Mobile Image */}
              <div className="relative w-full h-full block md:hidden">
                <Image
                  src={slide.mobileImage}
                  alt={`Slide ${slide.id}`}
                  fill
                  className="object-cover pointer-events-none"
                  priority={index === 0}
                  draggable={false}
                />
              </div>
            </div>
            
            {/* Overlay with content */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  {/* <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-accent drop-shadow-lg" />
                      <span className="text-accent font-medium drop-shadow-lg">Premium Pearls</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-display text-white drop-shadow-lg mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 drop-shadow-lg mb-8 max-w-lg">
                      {slide.subtitle}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 bg-accent text-primary px-8 py-4 rounded-full font-semibold hover:bg-accent-dark transition-colors duration-200 shadow-accent"
                    >
                      {slide.cta}
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-base-light/90 p-3 rounded-full hover:bg-base-light transition-colors z-20 shadow-premium"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-neutral" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-base-light/90 p-3 rounded-full hover:bg-base-light transition-colors z-20 shadow-premium"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-neutral" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 sm:w-56 h-2 flex items-center z-20">
          <div className="relative w-full h-2 bg-base-light/40 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-500"
              style={{
                width: `${100 / slides.length}%`,
                left: `${(100 / slides.length) * currentSlide}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
