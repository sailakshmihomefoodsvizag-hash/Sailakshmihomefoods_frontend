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
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-1/2 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-rubik font-bold text-xl sm:text-2xl text-gray-800">YOUR CART</h2>
              <span className="text-gray-500 font-montserrat">({totalItems})</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 font-montserrat">Homemade & Authentic Foods</p>
        </div>

        {/* Free Local Delivery Progress */}
        <div className={`px-4 sm:px-6 py-3.5 ${amountForFreeShipping === 0 ? 'bg-emerald-50' : 'bg-gray-50'} transition-colors duration-300`}>
          {amountForFreeShipping > 0 ? (
            <p className="text-sm text-gray-600 font-montserrat text-center">
              Add <span className="font-semibold text-[#7B0D1E]">₹{amountForFreeShipping}</span> more for free local delivery
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm text-emerald-700 font-montserrat font-semibold">Free Local Delivery Applied</span>
            </div>
          )}
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${amountForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-[#7B0D1E]'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {amountForFreeShipping === 0 && (
            <p className="text-[11px] text-emerald-600 font-montserrat text-center mt-1.5">
              Applies to Visakhapatnam deliveries
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-montserrat">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl"
              >
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-rubik font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-montserrat">{item.weight}</p>
                  <p className="font-semibold text-gray-800 font-rubik mt-1">₹{item.price}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600 font-montserrat">Quantity:</span>
                    <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.weight)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Trust Badge */}
        {cartItems.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-yellow-100 text-center flex items-center justify-center">
            <p className="text-sm text-gray-800 font-montserrat font-medium">✨ Trusted By 10k+ Customers</p>
          </div>
        )}

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-gray-600">Estimated total</span>
              <span className="font-rubik font-bold text-xl text-gray-800">₹{subtotal}</span>
            </div>
            <button 
              onClick={handleBuyNow}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors duration-300 font-montserrat"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
