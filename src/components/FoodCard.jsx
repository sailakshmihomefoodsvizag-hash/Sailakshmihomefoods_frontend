import { useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { useCart } from './CartContext';
import { useProductConfig } from './ProductConfigContext';
import OptimizedImage from './OptimizedImage';

const FoodCard = ({ product: baseProduct }) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { getProduct } = useProductConfig();

  // Use the context version (has live price/stock overrides) if available.
  // Do NOT fall back to baseProduct when getProduct returns null — that would
  // render stale or non-authorised products. Return null and render nothing.
  const product = getProduct(baseProduct?.id ?? baseProduct?.productId) ?? baseProduct;

  // Safety guard: if the object is not a real product (missing price or weights),
  // don't render it. This blocks category/banner objects from appearing.
  if (
    !product ||
    typeof product.pricePerKg !== 'number' ||
    product.pricePerKg <= 0 ||
    !Array.isArray(product.weights) ||
    product.weights.length === 0
  ) {
    return null;
  }

  const isOutOfStock = product.inStock === false;

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultWeight = product.weights[0];
    addToCart(product, defaultWeight, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 relative"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
          className={`transition-all duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
          }`}
          objectFit="cover"
          blur={true}
          priority={false}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-red-600 text-white px-2.5 py-1 rounded-md font-bold font-montserrat text-[10px] sm:text-xs shadow-lg">
              OUT OF STOCK
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && !isOutOfStock && (
          <div className="absolute top-0 left-0 px-2 py-1 sm:px-3 sm:py-1.5 bg-secondary text-gray-800 text-[10px] sm:text-xs font-bold rounded-br-xl font-montserrat">
            {discount}% OFF
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-soft active:scale-90 ${
            isOutOfStock
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : isAdded
              ? 'bg-secondary text-gray-800'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {isAdded
            ? <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            : <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          }
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 lg:p-4">
        <h3
          className={`font-rubik font-semibold text-xs sm:text-sm lg:text-base mb-1 sm:mb-1.5 line-clamp-1 transition-colors duration-200 ${
            isOutOfStock ? 'text-gray-500' : 'text-gray-800 group-hover:text-primary'
          }`}
        >
          {product.name}
        </h3>

        {isOutOfStock ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-red-600 font-montserrat">
              Out of Stock
            </span>
            <span className="text-xs text-gray-400 line-through font-montserrat">
              ₹{product.price}
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 font-rubik leading-tight">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-montserrat">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default React.memo(FoodCard);
