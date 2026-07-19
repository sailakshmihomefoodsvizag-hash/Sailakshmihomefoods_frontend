import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  const isHomePage = !currentProductId;

  const { data, isPending, isError } = useQuery({
    queryKey: ['products', 'you-may-also-like', PAGE_SIZE, currentProductId, currentCategory],
    enabled: isVisible,
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

  if (!showSkeleton && !isError && products.length === 0) {
    return null;
  }

  return (
    <section id="youmaylike" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 overflow-hidden">
      {/* Outer wrapper mirrors Collections section container exactly */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
          You May Also Like
        </h2>

        {showSkeleton ? (
          <div className="flex gap-3 sm:gap-4 overflow-hidden pb-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] sm:w-[240px] lg:w-64">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 text-red-600 px-4 py-3 font-montserrat text-sm">
            Unable to load recommendations right now.
          </div>
        ) : (
          /*
            Scroll container mirrors CollectionSlider exactly:
            - px-4 on the scroll div itself (same as CollectionSlider)
            - overflow-hidden on the section clips the bleed
            - snap-x snap-mandatory + snap-center on each item
            - cursor-grab matches CollectionSlider
            - On lg+: standard 4-column grid
          */
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
        )}
      </div>
    </section>
  );
};

export default YouMayAlsoLike;

