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

  if (!showSkeleton && !isError && products.length === 0) {
    return null;
  }

  return (
    <section id="bestsellers" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 overflow-hidden">
      {/* Outer wrapper matches the Collections section container exactly */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
          Our Best Sellers
        </h2>

        {showSkeleton ? (
          <div className="flex gap-3 sm:gap-4 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[47vw] sm:w-56 lg:w-64">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-montserrat text-sm">
            Unable to load best sellers right now.
          </div>
        ) : (
          <>
            {/*
              Scroll container mirrors CollectionSlider exactly:
              - px-4 on the scroll div itself (same as CollectionSlider)
              - overflow-hidden on the section clips the bleed
              - snap-x snap-mandatory + snap-center on each item
              - cursor-grab matches CollectionSlider
              - On lg+: switch to a standard grid
            */}
            <div
              className="
                flex gap-4 sm:gap-6
                overflow-x-auto hide-scrollbar
                pb-6 pt-4 px-4
                scroll-smooth snap-x snap-mandatory
                cursor-grab active:cursor-grabbing
                lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none
                lg:gap-6 lg:pb-0 lg:pt-0 lg:px-0 lg:cursor-auto
              "
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 snap-center w-[200px] sm:w-[240px] lg:w-auto lg:flex-shrink lg:snap-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-4">
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

