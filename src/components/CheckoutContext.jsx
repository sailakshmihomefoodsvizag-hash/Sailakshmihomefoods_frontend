import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useProductConfig } from './ProductConfigContext';
import { API_URL } from '../services/apiConfig.js';
import {
  DELIVERY_METHODS,
  calculateDeliveryCharge,
} from '../utils/deliveryUtils.js';

const CheckoutContext = createContext();

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within a CheckoutProvider');
  return context;
};

export const CheckoutProvider = ({ children }) => {
  const { user, getToken, openAuthModal } = useAuth();
  const { cartItems, clearCart, subtotal } = useCart();
  const { getProduct } = useProductConfig();

  const [isCheckoutOpen,  setIsCheckoutOpen]  = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [couponCode,      setCouponCode]      = useState('');
  const [appliedCoupon,   setAppliedCoupon]   = useState(null);
  const [discount,        setDiscount]        = useState(0);
  // Delivery method — default to local delivery
  const [deliveryMethod,  setDeliveryMethod]  = useState(DELIVERY_METHODS.local);

  // ── Coupon ────────────────────────────────────────────────────────────────

  const validateCoupon = async (code) => {
    if (!code) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Please login to apply coupon');

      const response = await fetch(`${API_URL}/orders/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, orderAmount: subtotal, productIds: cartItems.map(i => i.id) }),
      });

      const data = await response.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.coupon.discount);
        setCouponCode(code);
        return { success: true, discount: data.coupon.discount };
      }
      throw new Error(data.message || 'Invalid coupon');
    } catch (err) {
      setAppliedCoupon(null);
      setDiscount(0);
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  // ── Checkout open / close ─────────────────────────────────────────────────

  const openCheckout = () => {
    if (!user) { openAuthModal(); return; }
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setError(null);
  };

  // ── Payment ───────────────────────────────────────────────────────────────

  const initiatePayment = async (address, { onSuccess } = {}) => {
    if (!user)                return { success: false, message: 'Please login first' };
    if (cartItems.length === 0) return { success: false, message: 'Cart is empty' };
    if (!address?.name || !address?.mobile || !address?.address || !address?.pincode) {
      return { success: false, message: 'Please fill all address fields' };
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed');

      const items = cartItems.map(item => {
        const product = getProduct ? getProduct(item.id) : null;
        return {
          productId: item.id,
          name:      item.name,
          category:  product?.category || item.category || '',
          image:     item.image || product?.images?.[0] || '',
          weight:    item.weight,
          quantity:  item.quantity,
          price:     item.price,
          total:     item.price * item.quantity,
        };
      });

      const orderSubtotal      = items.reduce((s, i) => s + i.total, 0);
      const discountedSubtotal = orderSubtotal - discount;
      const orderDelivery      = calculateDeliveryCharge(deliveryMethod, discountedSubtotal);
      const orderTotal         = discountedSubtotal + orderDelivery;

      const response = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          customer: {
            name:    address.name,
            email:   user.email,
            mobile:  address.mobile,
            address: address.address,
            state:   address.state   || '',
            country: address.country || 'India',
            pincode: address.pincode,
          },
          subtotal:       orderSubtotal,
          discount,
          couponCode:     appliedCoupon?.code || null,
          deliveryMethod,
          deliveryCharge: orderDelivery,
          totalAmount:    orderTotal,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to create order');
      if (!data.order?.id) throw new Error('Invalid order response: missing order ID');

      if (!RAZORPAY_KEY_ID) throw new Error('Razorpay key not configured. Check VITE_RAZORPAY_KEY_ID in .env');
      if (typeof window.Razorpay !== 'function') throw new Error('Razorpay script not loaded. Please refresh the page.');

      const options = {
        key:       RAZORPAY_KEY_ID,
        amount:    data.order.amount,
        currency:  data.order.currency,
        name:      'Sai Lakshmi Foods',
        description: `Order #${data.order.orderId}`,
        order_id:  data.order.id,
        handler: async (response) => {
          const result = await verifyPayment(response, data.order.orderId, token);
          if (result.success && onSuccess) {
            onSuccess();
          }
        },
        prefill: { name: address.name, email: user.email, contact: address.mobile },
        notes: { orderId: data.order.orderId },
        theme: { color: '#800000' },
        modal: {
          ondismiss: () => { setLoading(false); setError('Payment cancelled'); },
          confirm_close: true,
          escape: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        setError(`Payment failed: ${r.error.description}`);
        setLoading(false);
      });
      rzp.open();

      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  const verifyPayment = async (razorpayResponse, orderId, token) => {
    try {
      const response = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          razorpay_order_id:  razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        }),
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        closeCheckout();
        removeCoupon();
        return { success: true, order: data.order };
      }
      throw new Error(data.message || 'Payment verification failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  // Calculate on discounted subtotal so free-delivery threshold is honest
  const discountedSubtotal = subtotal - discount;
  const deliveryCharge     = calculateDeliveryCharge(deliveryMethod, discountedSubtotal);
  const total              = discountedSubtotal + deliveryCharge;

  return (
    <CheckoutContext.Provider
      value={{
        isCheckoutOpen,
        openCheckout,
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
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutContext;
