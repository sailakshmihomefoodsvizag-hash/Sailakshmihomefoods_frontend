import PropTypes from 'prop-types';

/**
 * ImageSkeleton Component
 * 
 * Skeleton loader for image placeholders with smooth shimmer effect.
 * Prevents layout shift and provides visual feedback during loading.
 */
const ImageSkeleton = ({ 
  className = '', 
  aspectRatio = 'square',
  variant = 'default' // 'default' | 'card' | 'thumbnail'
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const variantStyles = {
    default: 'rounded-lg',
    card: 'rounded-2xl lg:rounded-3xl',
    thumbnail: 'rounded-md',
  };

  return (
    <div
      className={`
        relative overflow-hidden bg-gray-200
        ${aspectRatioClasses[aspectRatio] || aspectRatio}
        ${variantStyles[variant]}
        ${className}
      `}
      role="status"
      aria-label="Loading image"
    >
      {/* Shimmer overlay effect */}
      <div 
        className="absolute inset-0 shimmer-animation"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
      />
      
      {/* Pulse effect for extra smoothness */}
      <div className="absolute inset-0 animate-pulse bg-gray-100 opacity-50" />
    </div>
  );
};

ImageSkeleton.propTypes = {
  className: PropTypes.string,
  aspectRatio: PropTypes.oneOfType([
    PropTypes.oneOf(['square', 'video', 'portrait', 'landscape']),
    PropTypes.string,
  ]),
  variant: PropTypes.oneOf(['default', 'card', 'thumbnail']),
};

/**
 * ProductCardSkeleton Component
 * 
 * Full skeleton for product cards (image + content)
 */
export const ProductCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-soft ${className}`}>
      {/* Image skeleton */}
      <ImageSkeleton aspectRatio="square" variant="card" className="rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-2.5 sm:p-3 lg:p-4 space-y-2">
        {/* Title skeleton */}
        <div className="h-3.5 sm:h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        
        {/* Price skeleton */}
        <div className="h-3.5 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
};

ProductCardSkeleton.propTypes = {
  className: PropTypes.string,
};

/**
 * ProductGridSkeleton Component
 * 
 * Grid of product card skeletons
 */
export const ProductGridSkeleton = ({ count = 8, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

ProductGridSkeleton.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

/**
 * CategoryCardSkeleton Component
 */
export const CategoryCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`${className}`}>
      {/* Image skeleton */}
      <ImageSkeleton aspectRatio="square" variant="card" />
      
      {/* Title skeleton */}
      <div className="flex items-center justify-center gap-1 mt-4">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
      </div>
    </div>
  );
};

CategoryCardSkeleton.propTypes = {
  className: PropTypes.string,
};

/**
 * HeroImageSkeleton Component
 * 
 * For large hero/banner images
 */
export const HeroImageSkeleton = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
      />
    </div>
  );
};

HeroImageSkeleton.propTypes = {
  className: PropTypes.string,
};

export default ImageSkeleton;
