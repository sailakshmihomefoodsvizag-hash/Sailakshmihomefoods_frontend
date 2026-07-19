import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductSlider from './ProductSlider';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import { productAPI } from '../services/api.js';
import { mergeProductWithImages } from '../data';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const PAGE_SIZE = 4;

const YouMayAlsoLike = ({ currentProductId, currentCategory } = {}) => {
  const sectionRef = useRef(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: '200px 0px',
    threshold: 0.1,
    once: true,
  });

  // When no specific product is provided (home page), randomize results
  const isHomePage = !currentProductId;

  const {
    data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['products', 'you-may-also-like', PAGE_SIZE, currentProductId, currentCategory],
    enabled: isVisible,
    // Short stale time on home page so each visit can show different products
    staleTime: isHomePage ? 0 : 2 * 60 * 1000,
    gcTime: isHomePage ? 30 * 1000 : 10 * 60 * 1000,
    queryFn: async () => {
      const response = await productAPI.getYouMayAlsoLike({
        limit: PAGE_SIZE,
        excludeId: currentProductId,
        category: currentCategory,
        randomize: isHomePage,
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to load recommendations');
      }

      return (response.products || []).map(mergeProductWithImages);
    },
  });

  const products = useMemo(() => data || [], [data]);
  const showSkeleton = !isVisible || (isPending && products.length === 0);

  // Hide section entirely if no products and not loading
  if (!showSkeleton && !isError && products.length === 0) {
    return null;
  }

  return (
    <section id="youmaylike" ref={sectionRef} className="py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
          You May Also Like
        </h2>

        {showSkeleton ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonCard key={`you-may-like-skeleton-${index}`} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-montserrat text-sm">
            Unable to load recommendations right now.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default YouMayAlsoLike;

