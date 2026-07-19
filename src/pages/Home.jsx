import { lazy, Suspense } from 'react';
import TopBanner from '../components/TopBanner';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CollectionSlider from '../components/CollectionSlider';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import CartDrawer from '../components/CartDrawer';
import TrustBadges from '../components/TrustBadges';
import SkeletonCard from '../components/SkeletonCard';
import { useCart } from '../components/CartContext';
import { categories } from '../data';

const BestSellers = lazy(() => import('../components/BestSellers'));
const YouMayAlsoLike = lazy(() => import('../components/YouMayAlsoLike'));

const SectionFallback = ({ title, count }) => (
  <section className="py-10 sm:py-14 lg:py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={`${title}-fallback-${index}`} />
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen">
      {/* Top Banner */}
      <TopBanner />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Content sections */}
      <div>
        {/* Collections Section */}
        <section id="collections" className="py-10 sm:py-14 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
              Collections
            </h2>

            {/* Categories - Horizontal Scroll with Center Focus */}
            <CollectionSlider categories={categories} />
          </div>
        </section>

        <Suspense fallback={<SectionFallback title="Our Best Sellers" count={8} />}>
          <BestSellers />
        </Suspense>

        <Suspense fallback={<SectionFallback title="You May Also Like" count={6} />}>
          <YouMayAlsoLike />
        </Suspense>

        {/* Trust Badges Section - Before Footer */}
        <TrustBadges variant="full" />

        {/* Footer */}
        <Footer />
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />
    </div>
  );
};

export default Home;
