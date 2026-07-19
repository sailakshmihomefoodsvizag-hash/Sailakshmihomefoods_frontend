import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react';
import TopBanner from '../components/TopBanner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import CartDrawer from '../components/CartDrawer';
import TrustBadges from '../components/TrustBadges';
import { useCart } from '../components/CartContext';
import { useProductConfig } from '../components/ProductConfigContext';
import { useCheckout } from '../components/CheckoutContext';
import OptimizedImage from '../components/OptimizedImage';
import SkeletonCard from '../components/SkeletonCard';

const YouMayAlsoLike = lazy(() => import('../components/YouMayAlsoLike'));

const YouMayAlsoLikeFallback = () => (
  <section className="py-12 sm:py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-6 sm:mb-8">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`ymal-fallback-${i}`} />
        ))}
      </div>
    </div>
  </section>
);

const Product = () => {
  const { id } = useParams();
  const {
    getProduct,
    hasLoadedCatalog,
    ensureProductsLoaded,
    error: configError,
  } = useProductConfig();
  const { openCheckout } = useCheckout();
  const imageSliderRef = useRef(null);

  const product = getProduct(parseInt(id));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(product?.weights?.[0] || '250gm');
  const [quantity, setQuantity] = useState(1);

  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity: updateCartQuantity,
    removeItem,
    addToCart,
  } = useCart();

  useEffect(() => {
    if (!hasLoadedCatalog) {
      ensureProductsLoaded().catch(() => {});
    }
  }, [ensureProductsLoaded, hasLoadedCatalog]);

  useEffect(() => {
    if (product?.weights?.[0]) {
      setSelectedWeight(product.weights[0]);
    }
  }, [id, product]);

  if (!hasLoadedCatalog && !configError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasLoadedCatalog && configError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-600 font-montserrat text-sm text-center">
          Unable to load products right now. Please refresh the page.
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-rubik font-bold text-2xl text-primary mb-4">
            Product Not Found
          </h1>
          <Link to="/" className="text-secondary hover:underline font-montserrat">
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = product.weightPrices?.[selectedWeight] || product.price;
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  const decreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);
  const increaseQuantity = () => setQuantity(quantity + 1);

  const handleAddToCart = () => {
    if (product.inStock === false) return;
    addToCart(product, selectedWeight, quantity);
  };

  const handleBuyNow = () => {
    if (product.inStock === false) return;
    addToCart(product, selectedWeight, quantity);
    openCheckout();
  };

  const handleImageScroll = () => {
    if (imageSliderRef.current) {
      const slider = imageSliderRef.current;
      const imageWidth = slider.scrollWidth / images.length;
      setCurrentImageIndex(Math.round(slider.scrollLeft / imageWidth));
    }
  };

  return (
    <div className="min-h-screen">
      <TopBanner />
      <Navbar />

      <div>
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-montserrat"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Product Details */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Slider */}
            <div className="space-y-4">
              <div className="relative">
                <div
                  ref={imageSliderRef}
                  onScroll={handleImageScroll}
                  className="flex overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory rounded-2xl lg:rounded-3xl"
                >
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full aspect-square snap-center"
                    >
                      <div className="w-full h-full bg-white shadow-soft rounded-2xl lg:rounded-3xl overflow-hidden">
                        <OptimizedImage
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          width={600}
                          height={600}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          sizes="(max-width: 1024px) 100vw, 600px"
                          objectFit="cover"
                          priority={index === 0}
                          blur={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (imageSliderRef.current) {
                            const imageWidth =
                              imageSliderRef.current.scrollWidth / images.length;
                            imageSliderRef.current.scrollTo({
                              left: imageWidth * index,
                              behavior: 'smooth',
                            });
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          currentImageIndex === index
                            ? 'bg-primary w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide font-montserrat">
                {product.category}
              </span>

              <h1 className="font-rubik font-bold text-3xl sm:text-4xl text-gray-800">
                {product.name}
              </h1>

              {product.inStock === false && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-montserrat font-medium">Out of Stock</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="font-rubik font-bold text-3xl text-gray-800">
                  ₹{currentPrice}
                </span>
              </div>

              {/* Weight Options */}
              <div className="space-y-3">
                <label className="font-rubik font-semibold text-gray-800">
                  Select Weight
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.weights?.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      disabled={product.inStock === false}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 font-montserrat ${
                        product.inStock === false
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedWeight === weight
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-primary/10 shadow-soft'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <label className="font-rubik font-semibold text-gray-800">Quantity</label>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center bg-white rounded-xl shadow-soft overflow-hidden ${
                      product.inStock === false ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      onClick={decreaseQuantity}
                      disabled={product.inStock === false}
                      className={`p-3 transition-colors ${
                        product.inStock === false ? 'cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="w-14 text-center font-semibold text-gray-800 font-montserrat">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      disabled={product.inStock === false}
                      className={`p-3 transition-colors ${
                        product.inStock === false ? 'cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3">
                <label className="font-rubik font-semibold text-gray-800">Why Choose Us</label>
                <TrustBadges variant="scroll" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock === false}
                  className={`flex-1 px-8 py-4 font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center gap-3 font-montserrat ${
                    product.inStock === false
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.inStock === false}
                  className={`flex-1 px-8 py-4 font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center font-montserrat ${
                    product.inStock === false
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-secondary text-gray-800 hover:bg-secondary-dark'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Like — dynamic, limited to 4 products */}
        <Suspense fallback={<YouMayAlsoLikeFallback />}>
          <YouMayAlsoLike
            currentProductId={product?.productId || product?.id}
            currentCategory={product?.category}
          />
        </Suspense>

        <Footer />
      </div>

      <WhatsAppButton />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        updateQuantity={updateCartQuantity}
        removeItem={removeItem}
      />
    </div>
  );
};

export default Product;
