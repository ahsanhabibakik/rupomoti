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
        next: { revalidate: CACHE_TTL / 1000 },
        cache: 'no-cache', // Ensure fresh data
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate the URL before caching
        if (data && data.url) {
          // Check if it's a local path that should be using Cloudinary
          if (data.url.startsWith('/uploads/') && !data.url.includes('res.cloudinary.com')) {
            // Extract folder and filename
            const pathParts = data.url.split('/').filter(Boolean);
            const folder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
            const filename = pathParts[pathParts.length - 1];
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dotinshdj';
            
            // Update URL to use Cloudinary directly
            data.url = `https://res.cloudinary.com/${cloudName}/image/upload/${folder ? folder + '/' : ''}${filename}`;
            console.log('Client-side conversion of logo URL:', data.url);
          }
          
          cachedLogoData = data;
          lastFetchTime = now;
          resolve(data);
        } else {
          console.warn('Logo data from API is invalid:', data);
          resolve(null);
        }
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

  // Convert local upload path to Cloudinary URL if needed
  let assetUrl = rawLogoUrl;
  if (!isCloudinaryUrl(rawLogoUrl) && rawLogoUrl.startsWith('/uploads/')) {
    // Extract folder and filename from the path
    const pathParts = rawLogoUrl.split('/').filter(Boolean);
    const folder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
    const filename = pathParts[pathParts.length - 1];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dotinshdj';
    
    // Construct proper Cloudinary URL including the folder
    assetUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${folder ? folder + '/' : ''}${filename}`;
    
    console.log('Converted local path to Cloudinary URL:', rawLogoUrl, '->', assetUrl);
  }

  // Optimize Cloudinary URL if applicable
  const logoUrl = isCloudinaryUrl(assetUrl)
    ? optimizeCloudinaryUrl(assetUrl, width * 2, height * 2, { quality: 'auto', format: 'auto' })
    : assetUrl;

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
            console.warn('Logo failed to load:', (e.target as HTMLImageElement).src);
            const target = e.target as HTMLImageElement;
            
            if (target.src.includes(logoUrl) && logoUrl !== defaultLogo) {
              console.log('Trying default logo:', defaultLogo);
              target.src = defaultLogo;
            } else if (target.src.includes(defaultLogo)) {
              console.log('Trying fallback logo:', fallbackLogo);
              target.src = fallbackLogo;
            } else {
              console.warn('All logo attempts failed, showing text fallback');
              setHasError(true);
            }
          }}
          unoptimized={false} // Let Next.js optimize the image
        />
      </div>
    </Link>
  );
}
