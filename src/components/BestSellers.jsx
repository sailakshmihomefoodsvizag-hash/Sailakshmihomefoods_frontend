import { useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import { productAPI } from '../services/api.js';
import { mergeProductWithImages } from '../data';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const PAGE_SIZE = 8;

const BestSellers = () => {
  const sectionRef = useRef(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: '200px 0px',
    threshold: 0.1,
    once: true,
  });

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', 'best-sellers', PAGE_SIZE],
    initialPageParam: 1,
    enabled: isVisible,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async ({ pageParam }) => {
      const response = await productAPI.getBestSellers({ page: pageParam, limit: PAGE_SIZE });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to load best sellers');
      }

      return {
        ...response,
        products: (response.products || []).map(mergeProductWithImages),
      };
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination?.hasNextPage) return undefined;
      return pagination.page + 1;
    },
  });

  const products = useMemo(
    () => (data?.pages || []).flatMap((page) => page.products || []),
    [data]
  );

  const showSkeleton = !isVisible || (isPending && products.length === 0);

  // Hide section if no products and not loading
  if (!showSkeleton && !isError && products.length === 0) {
    return null;
  }

  return (
    <section id="bestsellers" ref={sectionRef} className="py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
          Our Best Sellers
        </h2>

        {showSkeleton ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonCard key={`best-sellers-skeleton-${index}`} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-montserrat text-sm">
            Unable to load best sellers right now.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-montserrat text-sm hover:bg-primary-dark active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BestSellers;

