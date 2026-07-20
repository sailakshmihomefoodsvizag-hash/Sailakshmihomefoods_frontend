import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useProductConfig } from './ProductConfigContext';
import { API_URL } from '../services/apiConfig.js';
import {
  DELIVERY_METHODS,
  calculateDeliveryCharge,
} from '../utils/deliveryUtils.js';

const CheckoutContext = createContext();

const RAZORPAY_KEY_ID    = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const LOAD_TIMEOUT_MS     = 12000; // 12 s before giving up

// ── Razorpay SDK loader ───────────────────────────────────────────────────────
// Waits up to LOAD_TIMEOUT_MS for window.Razorpay to be available.
// If the async <script> from index.html has already executed this resolves
// immediately. Otherwise it polls until the SDK lands or times out.

let sdkLoadPromise = null; // singleton — only ever load once per page

const loadRazorpaySdk = () => {
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    // Already loaded (e.g. page refreshed with hot-module cache)
    if (typeof window.Razorpay === 'function') {
      return resolve();
    }

    const startedAt = Date.now();

    // If the <script> tag already exists in the DOM (from index.html),
    // just poll for window.Razorpay instead of injecting a second tag.
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );

    const poll = setInterval(() => {
      if (typeof window.Razorpay === 'function') {
        clearInterval(poll);
        return resolve();
      }
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        clearInterval(poll);
        sdkLoadPromise = null; // allow retry on next attempt
        return reject(new Error('Razorpay checkout could not be loaded. Please check your internet connection and try again.'));
      }
    }, 100);

    // If no script tag exists, inject one programmatically
    if (!existingScript) {
      const script = document.createElement('script');
      script.src  = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onerror = () => {
        clearInterval(poll);
        sdkLoadPromise = null;
        reject(new Error('Failed to load payment SDK. Please disable any ad-blocker and try again.'));
      };
      document.head.appendChild(script);
    }
  });

  return sdkLoadPromise;
};

// ─────────────────────────────────────────────────────────────────────────────

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
  const [deliveryMethod,  setDeliveryMethod]  = useState(DELIVERY_METHODS.local);

  // Prevent duplicate order creation: track the in-flight Razorpay order ID
  const activeRzpOrderRef = useRef(null);

  // ── Coupon ────────────────────────────────────────────────────────────────

  const validateCoupon = useCallback(async (code) => {
    if (!code) return { success: false, message: 'No code provided' };
    try {
      const token = await getToken();
      if (!token) throw new Error('Please login to apply a coupon.');

      const response = await fetch(`${API_URL}/orders/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          orderAmount: subtotal,
          productIds:  cartItems.map(i => i.id),
        }),
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
  }, [getToken, subtotal, cartItems]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  }, []);

  // ── Checkout open / close ─────────────────────────────────────────────────

  const openCheckout = useCallback(() => {
    if (!user) { openAuthModal(); return; }
    setIsCheckoutOpen(true);
    setError(null);
  }, [user, openAuthModal]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setError(null);
    // Do NOT clear loading here — verifyPayment still needs it
  }, []);

  // ── Payment ───────────────────────────────────────────────────────────────

  const initiatePayment = useCallback(async (address, { onSuccess } = {}) => {
    // ── Guards (synchronous) ──────────────────────────────────────────────
    if (!user) {
      setError('Please log in to continue.');
      return { success: false, message: 'Not authenticated' };
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return { success: false, message: 'Cart is empty' };
    }

    if (!RAZORPAY_KEY_ID) {
      setError('Payment is not configured. Please contact support.');
      return { success: false, message: 'Razorpay key not configured' };
    }

    const needsDeliveryAddress = deliveryMethod !== DELIVERY_METHODS.in_store;

    if (!address?.name?.trim()) {
      setError('Please enter your full name.');
      return { success: false, message: 'Name required' };
    }
    if (!address?.mobile?.trim()) {
      setError('Please enter your mobile number.');
      return { success: false, message: 'Mobile required' };
    }
    if (needsDeliveryAddress && !address?.address?.trim()) {
      setError('Please enter your delivery address.');
      return { success: false, message: 'Address required' };
    }
    if (needsDeliveryAddress && !address?.pincode?.trim()) {
      setError('Please enter your pincode.');
      return { success: false, message: 'Pincode required' };
    }

    // Prevent double-click / duplicate submissions
    if (loading) return { success: false, message: 'Already processing' };

    setLoading(true);
    setError(null);

    try {
      // ── Step 1: Ensure Razorpay SDK is loaded ──────────────────────────
      try {
        await loadRazorpaySdk();
      } catch (sdkErr) {
        throw new Error(sdkErr.message);
      }

      // ── Step 2: Authenticate ───────────────────────────────────────────
      let token;
      try {
        token = await getToken();
      } catch {
        throw new Error('Authentication failed. Please sign in again.');
      }
      if (!token) throw new Error('Authentication failed. Please sign in again.');

      // ── Step 3: Build validated item list ─────────────────────────────
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

      // ── Step 4: Create order on backend ───────────────────────────────
      let createResponse;
      try {
        createResponse = await fetch(`${API_URL}/payment/create-order`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
          },
          body: JSON.stringify({
            items,
            customer: {
              name:    address.name.trim(),
              email:   user.email,
              mobile:  address.mobile.trim(),
              address: address.address?.trim()  || '',
              state:   address.state?.trim()    || '',
              country: address.country          || 'India',
              pincode: address.pincode?.trim()  || '',
            },
            subtotal:       orderSubtotal,
            discount,
            couponCode:     appliedCoupon?.code || null,
            deliveryMethod,
            deliveryCharge: orderDelivery,
            totalAmount:    orderTotal,
          }),
        });
      } catch {
        throw new Error('Unable to reach the server. Please check your internet connection and try again.');
      }

      let data;
      try {
        data = await createResponse.json();
      } catch {
        throw new Error(`Server returned an unexpected response (HTTP ${createResponse.status}). Please try again.`);
      }

      if (!createResponse.ok || !data.success) {
        throw new Error(data.message || `Order creation failed (HTTP ${createResponse.status}).`);
      }
      if (!data.order?.id) {
        throw new Error('Server returned an invalid order. Please try again.');
      }

      // Track active order to prevent duplicate opens
      activeRzpOrderRef.current = data.order.id;

      // ── Step 5: Open Razorpay checkout ────────────────────────────────
      const options = {
        key:         RAZORPAY_KEY_ID,
        amount:      data.order.amount,
        currency:    data.order.currency || 'INR',
        name:        'Sai Lakshmi Home Foods',
        description: 'Order Payment',
        order_id:    data.order.id,

        handler: async (rzpResponse) => {
          // Success — verify on backend
          const result = await verifyPaymentInternal(rzpResponse, data.order.orderId, token);
          if (result.success && onSuccess) {
            onSuccess();
          }
        },

        prefill: {
          name:    address.name.trim(),
          email:   user.email   || '',
          contact: address.mobile.trim(),
        },
        notes: {
          orderId: data.order.orderId,
        },
        theme: { color: '#7B0D1E' },
        retry: { enabled: true, max_count: 3 },
        remember_customer: false,
        send_sms_hash:     false,

        modal: {
          ondismiss: () => {
            // Payment cancelled — no order was created, cart is safe
            activeRzpOrderRef.current = null;
            setLoading(false);
            // No error shown — user intentionally closed the modal
            // They can simply click Pay Now again
          },
          confirm_close:  true,
          escape:         false,
          animation:      true,
          backdropclose:  false,
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        const reason = response?.error?.description
          || response?.error?.reason
          || 'Payment was not completed';
        activeRzpOrderRef.current = null;
        setError(`${reason}. Please try again with a different payment method.`);
        setLoading(false);
      });

      rzp.open();

      // Keep loading=true while Razorpay modal is open.
      // It is cleared only in: ondismiss, payment.failed, or verifyPaymentInternal.
      return { success: true };

    } catch (err) {
      const message = err.message || 'Something went wrong. Please try again.';
      setError(message);
      setLoading(false);
      activeRzpOrderRef.current = null;
      return { success: false, message };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cartItems, discount, deliveryMethod, appliedCoupon, loading, getToken, getProduct]);

  // Internal — not exposed; called only from the Razorpay success handler
  const verifyPaymentInternal = async (razorpayResponse, orderId, token) => {
    try {
      const response = await fetch(`${API_URL}/payment/verify`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id:   razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature:  razorpayResponse.razorpay_signature,
        }),
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        closeCheckout();
        removeCoupon();
        activeRzpOrderRef.current = null;
        return { success: true, order: data.order };
      }
      throw new Error(data.message || 'Payment verification failed');
    } catch (err) {
      setError(err.message || 'Payment verification failed. Please contact support.');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
      activeRzpOrderRef.current = null;
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
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
