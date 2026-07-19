import { useState, useEffect } from 'react';
import { X, Loader2, MapPin, User, Phone, Building, Hash, Check, Store, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from './CheckoutContext';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { userAPI } from '../services/api';
import {
  DELIVERY_METHODS,
  DELIVERY_LABELS,
  calculateDeliveryCharge,
  formatDeliveryCharge,
  FREE_DELIVERY_THRESHOLD,
} from '../utils/deliveryUtils.js';

// ── Delivery Option Configuration ────────────────────────────────────────────

const DELIVERY_OPTIONS = [
  {
    value: DELIVERY_METHODS.in_store,
    label: 'In-Store Pickup',
    icon: Store,
    description: 'Pick up your order directly from our store.',
    timeEstimate: 'Ready in 30–60 minutes',
  },
  {
    value: DELIVERY_METHODS.local,
    label: 'Local Delivery',
    sublabel: 'Visakhapatnam',
    icon: Truck,
    description: 'Doorstep delivery within Visakhapatnam.',
    freeNote: `Free for eligible orders above ₹${FREE_DELIVERY_THRESHOLD}.`,
    timeEstimate: '45–90 minutes',
  },
  {
    value: DELIVERY_METHODS.outside,
    label: 'Outside Visakhapatnam',
    icon: Package,
    description: 'Delivery available outside city limits.',
    freeNote: 'Charges calculated per our shipping policy.',
    timeEstimate: '1–3 business days',
  },
];

// ── Free Delivery Notice ─────────────────────────────────────────────────────

const FreeDeliveryNotice = ({ method, discountedSubtotal }) => {
  if (method !== DELIVERY_METHODS.local) return null;
  if (discountedSubtotal < FREE_DELIVERY_THRESHOLD) return null;

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50/80 border border-emerald-100 rounded-lg animate-fade-in">
      <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-emerald-800 font-montserrat leading-tight">
          Free local delivery applied
        </p>
        <p className="text-[11px] text-emerald-600/80 font-montserrat mt-0.5">
          Complimentary for Visakhapatnam orders of ₹{FREE_DELIVERY_THRESHOLD}+
        </p>
      </div>
    </div>
  );
};

// ── Delivery Method Selector ─────────────────────────────────────────────────

const DeliverySelector = ({ selected, onChange, discountedSubtotal }) => {
  return (
    <div className="space-y-2">
      {DELIVERY_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        const charge = calculateDeliveryCharge(option.value, discountedSubtotal);
        const chargeLabel = charge === 0 ? 'Free' : `+₹${charge}`;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`
              group w-full text-left rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5
              transition-all duration-200 ease-out outline-none
              focus-visible:ring-2 focus-visible:ring-[#7B0D1E]/30 focus-visible:ring-offset-1
              ${isSelected
                ? 'border-[#7B0D1E] bg-white shadow-[0_0_0_1px_rgba(123,13,30,0.08),0_2px_8px_rgba(123,13,30,0.06)]'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }
            `}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Radio indicator */}
              <div className={`
                flex-shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px]
                flex items-center justify-center transition-all duration-200
                ${isSelected
                  ? 'border-[#7B0D1E]'
                  : 'border-gray-300 group-hover:border-gray-400'
                }
              `}>
                <div className={`
                  w-[10px] h-[10px] rounded-full transition-all duration-200
                  ${isSelected ? 'bg-[#7B0D1E] scale-100' : 'bg-transparent scale-0'}
                `} />
              </div>

              {/* Icon */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                transition-colors duration-200
                ${isSelected ? 'bg-[#7B0D1E]/[0.07]' : 'bg-gray-50 group-hover:bg-gray-100'}
              `}>
                <Icon className={`w-4 h-4 transition-colors duration-200 ${
                  isSelected ? 'text-[#7B0D1E]' : 'text-gray-500'
                }`} strokeWidth={1.75} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className={`block text-[13px] font-semibold font-montserrat leading-tight transition-colors duration-200 ${
                      isSelected ? 'text-gray-900' : 'text-gray-800'
                    }`}>
                      {option.label}
                      {option.sublabel && (
                        <span className="font-normal text-gray-400 ml-1 text-[12px]">({option.sublabel})</span>
                      )}
                    </span>
                    <span className="block text-[11px] text-gray-500 font-montserrat mt-0.5 leading-relaxed">
                      {option.timeEstimate}
                    </span>
                  </div>
                  {/* Charge badge — flex-shrink-0 prevents overflow */}
                  <span className={`
                    flex-shrink-0 text-[11px] font-bold font-montserrat px-2 py-0.5 rounded-full whitespace-nowrap
                    ${charge === 0
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                      : 'text-gray-700 bg-gray-100 border border-gray-200'
                    }
                  `}>
                    {chargeLabel}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ── Main Checkout Modal ──────────────────────────────────────────────────────

const CheckoutModal = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { cartItems, subtotal } = useCart();
  const {
    isCheckoutOpen,
    closeCheckout,
    loading,
    error,
    initiatePayment,
    validateCoupon,
    removeCoupon,
    couponCode,
    setCouponCode,
    appliedCoupon,
    discount,
    deliveryMethod,
    setDeliveryMethod,
    deliveryCharge,
    total,
  } = useCheckout();

  const [address, setAddress] = useState({
    name: '', mobile: '', address: '', state: '', country: 'India', pincode: '',
  });
  const [couponInput,   setCouponInput]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState('');

  // Load saved profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !isCheckoutOpen) return;
      try {
        const token = await getToken();
        if (!token) return;
        const response = await userAPI.getProfile(token);
        if (response.success && response.user) {
          setAddress({
            name:    response.user.name          || '',
            mobile:  response.user.mobileNumber  || '',
            address: response.user.address       || '',
            state:   response.user.state         || '',
            country: response.user.country       || 'India',
            pincode: response.user.pincode       || '',
          });
        }
      } catch (_) {}
    };
    loadProfile();
  }, [isCheckoutOpen, user, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const result = await validateCoupon(couponInput.trim());
    if (!result.success) setCouponError(result.message);
    else setCouponInput('');
    setCouponLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await initiatePayment(address, {
      onSuccess: () => {
        navigate('/orders');
      },
    });
  };

  if (!isCheckoutOpen) return null;

  const discountedSubtotal = subtotal - discount;
  const deliveryChargeLabel = formatDeliveryCharge(deliveryMethod, discountedSubtotal);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeCheckout}
      />

      {/* Modal — slides up on mobile, zooms in on desktop */}
      <div className="relative w-full sm:max-w-2xl sm:mx-4 max-h-[92vh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 sm:slide-in-from-bottom-0 slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <h2 className="font-rubik font-bold text-lg sm:text-xl text-gray-800">Checkout</h2>
          <button
            onClick={closeCheckout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 sm:space-y-6">

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-montserrat">
                {error}
              </div>
            )}

            {/* Order Summary */}
            <div>
              <h3 className="font-rubik font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.weight}`} className="flex justify-between items-start gap-3 text-sm font-montserrat">
                    <span className="text-gray-600 leading-snug min-w-0 flex-1">
                      {item.name} <span className="text-gray-400">({item.weight})</span> × {item.quantity}
                    </span>
                    <span className="text-gray-800 font-medium flex-shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Delivery Method ─────────────────────────────────────────── */}
            <div>
              <h3 className="font-rubik font-semibold text-gray-800 mb-3">Delivery Method</h3>
              <DeliverySelector
                selected={deliveryMethod}
                onChange={setDeliveryMethod}
                discountedSubtotal={discountedSubtotal}
              />
              {/* Free delivery notice */}
              <div className="mt-2.5">
                <FreeDeliveryNotice method={deliveryMethod} discountedSubtotal={discountedSubtotal} />
              </div>
            </div>

            {/* Coupon */}
            <div>
              <h3 className="font-rubik font-semibold text-gray-800 mb-3">Coupon Code</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                  <div>
                    <span className="text-green-700 font-medium font-montserrat">{appliedCoupon.code}</span>
                    <span className="text-green-600 text-sm font-montserrat ml-2">- ₹{discount} off</span>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm font-montserrat">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-montserrat text-sm font-medium disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1.5 font-montserrat">{couponError}</p>}
            </div>

            {/* Delivery Address — hidden for in-store pickup */}
            {deliveryMethod !== DELIVERY_METHODS.in_store && (
              <div>
                <h3 className="font-rubik font-semibold text-gray-800 mb-3">Delivery Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="name" value={address.name} onChange={handleChange}
                      placeholder="Full Name *" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" name="mobile" value={address.mobile} onChange={handleChange}
                      placeholder="Mobile Number *" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm" />
                  </div>
                  <div className="relative sm:col-span-2">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea name="address" value={address.address} onChange={handleChange}
                      placeholder="Full Address *" required rows={2}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm resize-none" />
                  </div>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="state" value={address.state} onChange={handleChange}
                      placeholder="State *" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm" />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="pincode" value={address.pincode} onChange={handleChange}
                      placeholder="Pincode *" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* In-store contact fields */}
            {deliveryMethod === DELIVERY_METHODS.in_store && (
              <div>
                <h3 className="font-rubik font-semibold text-gray-800 mb-3">Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="name" value={address.name} onChange={handleChange}
                      placeholder="Full Name *" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" name="mobile" value={address.mobile} onChange={handleChange}
                      placeholder="Mobile Number *" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B0D1E] focus:ring-1 focus:ring-[#7B0D1E]/20 font-montserrat text-sm" />
                  </div>
                </div>
                <div className="mt-3 px-3.5 py-3 bg-amber-50/70 border border-amber-100 rounded-lg">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-xs font-medium text-amber-800 font-montserrat">Store Pickup Location</p>
                      <p className="text-[12px] text-amber-700/80 font-montserrat mt-0.5 leading-relaxed">
                        50-27-14, Gurudwara Up Road, Opp. Electrical Substation, Akkayapalem, Balayya Sastri Layout, Seethammadara, Visakhapatnam 530013
                      </p>
                      <p className="text-[11px] text-amber-600/70 font-montserrat mt-1">
                        You will be notified when your order is ready for pickup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm font-montserrat">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-600">Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-emerald-600 font-medium' : 'text-gray-800'}>
                  {deliveryChargeLabel}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between font-rubik">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-xl text-[#7B0D1E]">₹{total}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full py-4 bg-[#7B0D1E] text-white font-semibold rounded-xl hover:bg-[#5a0010] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-montserrat shadow-lg shadow-[#7B0D1E]/20"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                `Pay ₹${total}`
              )}
            </button>

            <p className="text-center text-xs text-gray-400 font-montserrat pb-2">
              Secure payment powered by Razorpay
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
