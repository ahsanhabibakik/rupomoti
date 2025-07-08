"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { optimizeCloudinaryUrl, isCloudinaryUrl } from "@/utils/cloudinary";

interface LogoProps {
  variant?: "default" | "small" | "medium" | "large";
  className?: string;
  priority?: boolean; // Allow priority to be passed
}

type LogoData = {
  id: string;
  url: string;
  name: string;
  alt: string;
  metadata?: any;
};

// Create a singleton pattern for logo data to prevent unnecessary API calls
let cachedLogoData: LogoData | null = null;
let logoFetchPromise: Promise<LogoData | null> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to fetch logo data
const fetchLogoData = async (): Promise<LogoData | null> => {
  // Return cached data if it exists and is not expired
  const now = Date.now();
  if (cachedLogoData && (now - lastFetchTime) < CACHE_TTL) {
    return cachedLogoData;
  }
  
  // If there's already a fetch in progress, return that promise
  if (logoFetchPromise) return logoFetchPromise;
  
  // Create a new fetch promise
  logoFetchPromise = new Promise<LogoData | null>(async (resolve) => {
    try {
      const response = await fetch('/api/public/media/logo', { 
        next: { revalidate: CACHE_TTL / 1000 }
      });
      
      if (response.ok) {
        const data = await response.json();
        cachedLogoData = data;
        lastFetchTime = now;
        resolve(data);
      } else {
        console.warn('Failed to fetch logo data:', response.status);
        resolve(null);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      resolve(null);
    } finally {
      // Clear the promise so future requests can create a new one
      logoFetchPromise = null;
    }
  });
  
  return logoFetchPromise;
};

export function Logo({ variant = "default", className = "", priority = false }: LogoProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Size mapping based on variant
  const sizes = useMemo(() => ({
    small: { width: 80, height: 35 },
    default: { width: 90, height: 40 },
    medium: { width: 110, height: 45 },
    large: { width: 140, height: 60 },
  }), []);

  const { width, height } = sizes[variant] || sizes.default;
  
  // Default logo path as fallback - use absolute URL to avoid empty string issues
  const defaultLogo = "/images/branding/logo.png";
  const fallbackLogo = "/images/placeholder.png";

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const data = await fetchLogoData();
        
        if (data?.url) {
          setLogoData(data);
          
          // Preload the image to check if it's valid
          const img = new window.Image();
          img.onload = () => setImgLoaded(true);
          img.onerror = () => {
            // If we couldn't load the API logo, try the default
            console.warn('Logo image failed to load:', data.url);
            
            // Don't immediately set error - try the default logo first
            if (data.url !== defaultLogo && retryCount === 0) {
              const defaultImg = new window.Image();
              defaultImg.onload = () => {
                setLogoData({
                  ...data,
                  url: defaultLogo
                });
                setImgLoaded(true);
              };
              defaultImg.onerror = () => setHasError(true);
              defaultImg.src = defaultLogo;
              setRetryCount(1);
            } else {
              setHasError(true);
            }
          };
          img.src = data.url;
        } else {
          // No logo from API, try the default
          const img = new window.Image();
          img.onload = () => {
            setLogoData({
              id: 'default',
              url: defaultLogo,
              name: 'Rupomoti Logo',
              alt: 'Rupomoti Jewelry'
            });
            setImgLoaded(true);
          };
          img.onerror = () => setHasError(true);
          img.src = defaultLogo;
        }
      } catch (error) {
        console.error('Error in logo loading:', error);
        setHasError(true);
      }
    };

    // Reset state when variant changes
    setImgLoaded(false);
    setHasError(false);
    setRetryCount(0);
    
    loadLogo();
  }, [variant, retryCount]);

  // If image failed to load, show text fallback
  if (hasError) {
    return (
      <Link href="/" className={`font-bold text-2xl text-primary ${className}`}>
        Rupomoti
      </Link>
    );
  }

  // Get the logo URL (either from API or default)
  const rawLogoUrl = logoData?.url || defaultLogo;
  
  // Optimize Cloudinary URL if applicable
  const logoUrl = isCloudinaryUrl(rawLogoUrl) 
    ? optimizeCloudinaryUrl(rawLogoUrl, width * 2, height * 2, { quality: 'auto', format: 'auto' })
    : rawLogoUrl;
    
  const logoAlt = logoData?.alt || "Rupomoti";

  return (
    <Link href="/" className={className}>
      <div className="relative">
        {/* Show placeholder during loading */}
        {!imgLoaded && (
          <div 
            className="bg-gray-100 animate-pulse rounded-md" 
            style={{ width, height }}
          />
        )}
        <Image
          ref={imgRef}
          src={logoUrl}
          alt={logoAlt}
          width={width}
          height={height}
          className={`object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          priority={priority || variant === "medium" || variant === "large"} // Prioritize larger logos
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            // If the loaded logo fails, try fallbacks in sequence
            const target = e.target as HTMLImageElement;
            
            if (target.src.includes(logoUrl) && logoUrl !== defaultLogo) {
              target.src = defaultLogo;
            } else if (target.src.includes(defaultLogo)) {
              target.src = fallbackLogo;
            } else {
              setHasError(true);
            }
          }}
          unoptimized={false} // Let Next.js optimize the image
        />
      </div>
    </Link>
  );
}
