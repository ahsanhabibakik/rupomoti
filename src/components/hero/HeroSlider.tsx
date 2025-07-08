"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { optimizeCloudinaryUrl, isCloudinaryUrl } from "@/utils/cloudinary";

// Use the placeholder image we know exists
const PLACEHOLDER_IMAGE = "/images/placeholder.png";

const fallbackSlides = [
  {
    id: 1,
    image: "/images/hero/slider1.jpeg",
    mobileImage: "/images/hero/slider1.jpeg",
    title: "Welcome to Rupomoti",
    subtitle: "Elegant Pearl Jewelry Collection",
    link: "/shop/necklaces",
    cta: "Shop Now",
  },
  {
    id: 2,
    image: "/images/hero/slider2.jpeg",
    mobileImage: "/images/hero/slider2.jpeg",
    title: "Discover Beauty",
    subtitle: "Handcrafted Pearl Jewelry",
    link: "/shop",
    cta: "Explore",
  },
  {
    id: 3,
    image: "/images/hero/slider3.jpg",
    mobileImage: "/images/hero/slider3.jpg",
    title: "Timeless Elegance",
    subtitle: "Premium Pearl Collection",
    link: "/shop/rings",
    cta: "Shop Now",
  },
  {
    id: 4,
    image: "/images/hero/slider4.jpg",
    mobileImage: "/images/hero/slider4.jpg",
    title: "Pure Sophistication",
    subtitle: "Luxury Pearl Accessories",
    link: "/shop/rings",
    cta: "Browse",
  },
];

// Validate image URL to prevent empty strings and optimize Cloudinary URLs
const validateImageUrl = (url: string | null | undefined, isMobile = false): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  const trimmedUrl = url.trim();
  
  // For Cloudinary URLs, optimize based on device type
  if (isCloudinaryUrl(trimmedUrl)) {
    if (isMobile) {
      // Mobile: optimize for width 800px, height 1000px (4:5 ratio)
      return optimizeCloudinaryUrl(trimmedUrl, 800, 1000, { 
        crop: 'fill',
        quality: 'auto',
        format: 'auto' 
      });
    } else {
      // Desktop: optimize for width 1920px, height 800px (12:5 ratio)
      return optimizeCloudinaryUrl(trimmedUrl, 1920, 800, {
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    }
  }
  
  return trimmedUrl;
};

export function HeroSlider() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Touch/mouse drag state
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Fetch hero-slider images from media API
    setIsLoading(true);
    fetch("/api/public/media/hero-slider")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const validSlides = data
            .filter((item) => {
              // Ensure item is valid and has a non-empty image
              return item && typeof item === 'object' && 
                     item.image && typeof item.image === 'string' && 
                     item.image.trim() !== "";
            })
            .map((item, idx) => ({
              id: item.id || `api-${idx}`,
              image: validateImageUrl(item.image, false),
              mobileImage: validateImageUrl(item.mobileImage || item.image, true),
              title: item.title || `Slide ${idx + 1}`,
              subtitle: item.subtitle || "",
              link: (item.link && item.link.trim() !== "") ? item.link : "#",
              cta: item.cta || "Shop Now",
            }));
          
          // Only update slides if we have valid data, otherwise keep fallback
          if (validSlides.length > 0) {
            setSlides(validSlides);
          }
        }
      })
      .catch((error) => {
        console.warn("Failed to fetch hero slides, using fallback:", error);
        // Keep using fallback slides on error
      })
      .finally(() => {
        setIsLoading(false);
      });
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
      {/* Loading state */}
      {isLoading && (
        <div className="max-w-screen-xl mx-2 md:mx-auto mt-2 relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
      
      {/* Hero Slider */}
      {!isLoading && slides && slides.length > 0 && (
        <div
          className="max-w-screen-xl mx-2 md:mx-auto mt-2 relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden select-none rounded-2xl"
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
        {slides.map((slide, index) => {
          // Get validated image URLs
          const desktopSrc = validateImageUrl(slide.image);
          const mobileSrc = validateImageUrl(slide.mobileImage);
          
          return (
            <Link
              href={slide.link || "#"}
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 z-0 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0"
              }`}
            >
              {/* Desktop Image */}
              <Image
                src={desktopSrc}
                alt={slide.title || `Slide ${index + 1}`}
                fill
                className="object-cover pointer-events-none hidden md:block"
                priority={index === 0}
                draggable={false}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = PLACEHOLDER_IMAGE;
                }}
              />
              {/* Mobile Image */}
              <Image
                src={mobileSrc}
                alt={slide.title || `Slide ${index + 1}`}
                fill
                className="object-cover pointer-events-none block md:hidden"
                priority={index === 0}
                draggable={false}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = PLACEHOLDER_IMAGE;
                }}
              />
              
              {/* Overlay with content */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    {/* Content can be added here later if needed */}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Navigation Arrows - Desktop Only */}
        <button
          onClick={prevSlide}
          className="hidden md:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-3 rounded-full hover:bg-background transition-all duration-200 z-20 shadow-lg border border-accent/20"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-3 rounded-full hover:bg-background transition-all duration-200 z-20 shadow-lg border border-accent/20"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setIsAutoPlaying(false);
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-8 h-2 bg-background"
                    : "w-2 h-2 bg-background/50 hover:bg-background/70"
                }`}
              />
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
