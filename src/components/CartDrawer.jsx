import { useState } from 'react';
import { X, Minus, Plus, Trash2, Check } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { FREE_DELIVERY_THRESHOLD } from '../utils/deliveryUtils.js';

const CartDrawer = ({ isOpen, onClose, cartItems, updateQuantity, removeItem }) => {
  const { openCheckout } = useCheckout();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeLocalThreshold = FREE_DELIVERY_THRESHOLD;
  const amountForFreeShipping = Math.max(0, freeLocalThreshold - subtotal);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const progressPercent = Math.min(100, (subtotal / freeLocalThreshold) * 100);

  const handleBuyNow = () => {
    onClose();
    openCheckout();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[88%] sm:w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="font-rubik font-bold text-lg sm:text-xl text-gray-800">YOUR CART</h2>
              <span className="text-gray-400 font-montserrat text-sm">({totalItems})</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-400 font-montserrat">Homemade &amp; Authentic Foods</p>
        </div>

        {/* Free Local Delivery Progress */}
        <div className={`px-4 sm:px-5 py-3 flex-shrink-0 ${amountForFreeShipping === 0 ? 'bg-emerald-50' : 'bg-gray-50/80'} transition-colors duration-300`}>
          {amountForFreeShipping > 0 ? (
            <p className="text-xs sm:text-sm text-gray-600 font-montserrat text-center leading-snug">
              Add <span className="font-semibold text-[#7B0D1E]">₹{amountForFreeShipping}</span> more for free local delivery
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-xs sm:text-sm text-emerald-700 font-montserrat font-semibold">Free Local Delivery Applied</span>
            </div>
          )}
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${amountForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-[#7B0D1E]'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {amountForFreeShipping === 0 && (
            <p className="text-[10px] text-emerald-600 font-montserrat text-center mt-1">
              Applies to Visakhapatnam deliveries
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-3 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 6H3m4 7a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <p className="text-gray-500 font-montserrat text-sm">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className="flex gap-3 p-3 bg-gray-50/80 rounded-xl"
              >
                {/* Product Image */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-rubik font-semibold text-sm text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-montserrat">{item.weight}</p>
                  <p className="font-semibold text-sm text-gray-800 font-rubik mt-0.5">₹{item.price}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center bg-white rounded-lg shadow-soft overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-gray-800 font-montserrat">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.weight)}
                      aria-label="Remove item"
                      className="p-1.5 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white">
            {/* Trust line */}
            <div className="px-4 sm:px-5 py-2 bg-amber-50/80 text-center">
              <p className="text-xs text-amber-800 font-montserrat font-medium">Trusted by 10,000+ customers</p>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-montserrat text-sm text-gray-500">Subtotal</span>
                <span className="font-rubik font-bold text-lg text-gray-800">₹{subtotal}</span>
              </div>
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 font-montserrat text-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
