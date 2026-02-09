/**
 * Optimized image URL helper for Unsplash images
 * Converts to WebP format and provides responsive sizes
 */
export const getOptimizedImageUrl = (
  baseUrl: string,
  width?: number,
  quality: number = 80
): string => {
  // Remove existing query params if any
  const cleanUrl = baseUrl.split('?')[0];
  
  // Build optimized URL with WebP format
  const params = new URLSearchParams();
  if (width) {
    params.append('w', width.toString());
  }
  params.append('q', quality.toString());
  params.append('fm', 'webp'); // WebP format
  params.append('auto', 'format'); // Fallback support
  
  return `${cleanUrl}?${params.toString()}`;
};

/**
 * Generate srcset for responsive images
 */
export const getResponsiveSrcSet = (
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600],
  quality: number = 80
): string => {
  return sizes
    .map((width) => `${getOptimizedImageUrl(baseUrl, width, quality)} ${width}w`)
    .join(', ');
};

/**
 * Get sizes attribute for responsive images
 */
export const getSizesAttribute = (breakpoints?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const defaults = {
    mobile: '100vw',
    tablet: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw',
    desktop: '50vw',
  };
  
  const mobile = breakpoints?.mobile || defaults.mobile;
  const tablet = breakpoints?.tablet || defaults.tablet;
  const desktop = breakpoints?.desktop || defaults.desktop;
  
  return `(max-width: 768px) ${mobile}, (max-width: 1200px) ${tablet}, ${desktop}`;
};
