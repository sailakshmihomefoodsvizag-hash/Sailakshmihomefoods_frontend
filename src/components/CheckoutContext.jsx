import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useProductConfig } from './ProductConfigContext';
import { API_URL } from '../services/apiConfig.js';

const CheckoutContext = createContext();

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
  const { user, getToken, openAuthModal } = useAuth();
  const { cartItems, clearCart, subtotal } = useCart();
  const { getProduct } = useProductConfig();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Validate coupon
  const validateCoupon = async (code) => {
    if (!code) return;
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Please login to apply coupon');
      }

      const productIds = cartItems.map(item => item.id);
      
      const response = await fetch(`${API_URL}/orders/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          orderAmount: subtotal,
          productIds
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.coupon.discount);
        setCouponCode(code);
        return { success: true, discount: data.coupon.discount };
      } else {
        throw new Error(data.message || 'Invalid coupon');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setDiscount(0);
      return { success: false, message: err.message };
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  // Open checkout
  const openCheckout = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsCheckoutOpen(true);
  };

  // Close checkout
  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setError(null);
  };

  // Initiate payment using new payment routes
  const initiatePayment = async (address) => {
    if (!user) {
      openAuthModal();
      return { success: false, message: 'Please login first' };
    }

    if (cartItems.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    if (!address || !address.name || !address.mobile || !address.address || !address.pincode) {
      return { success: false, message: 'Please fill all address fields' };
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication failed');
      }

      // Prepare cart items with COMPLETE product details for order storage
      const items = cartItems.map(item => {
        // Get full product info from product config
        const product = getProduct ? getProduct(item.id) : null;
        
        return {
          productId: item.id,
          name: item.name,
          category: product?.category || item.category || '',
          image: item.image || product?.images?.[0] || '',
          weight: item.weight,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        };
      });

      // Calculate totals
      const orderSubtotal = items.reduce((sum, item) => sum + item.total, 0);
      const orderDeliveryCharge = orderSubtotal >= 500 ? 0 : 50;
      const orderTotal = orderSubtotal - discount + orderDeliveryCharge;

      // Create payment order on new /api/payment route
      const response = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          customer: {
            name: address.name,
            email: user.email,
            mobile: address.mobile,
            address: address.address,
            state: address.state || '',
            country: address.country || 'India',
            pincode: address.pincode
          },
          subtotal: orderSubtotal,
          discount: discount,
          couponCode: appliedCoupon?.code || null,
          deliveryCharge: orderDeliveryCharge,
          totalAmount: orderTotal
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Validate order data
      if (!data.order?.id) {
        throw new Error('Invalid order response: missing order ID');
      }

      // Validate Razorpay key
      if (!RAZORPAY_KEY_ID) {
        throw new Error('Razorpay key not configured. Check VITE_RAZORPAY_KEY_ID in .env');
      }

      // Validate Razorpay script is loaded
      if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay script not loaded. Please refresh the page.');
      }

      // Open Razorpay checkout with branded theme
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Sai Lakshmi Foods',
        description: `Order #${data.order.orderId}`,
        order_id: data.order.id,
        handler: async function(response) {
          // Verify payment on backend
          await verifyPayment(response, data.order.orderId, token);
        },
        prefill: {
          name: address.name,
          email: user.email,
          contact: address.mobile
        },
        notes: {
          orderId: data.order.orderId
        },
        theme: {
          color: '#800000' // Maroon brand color
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment cancelled');
          },
          confirm_close: true,
          escape: false
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();

      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  // Verify payment using new payment routes
  const verifyPayment = async (razorpayResponse, orderId, token) => {
    try {
      const response = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart and close checkout
        clearCart();
        closeCheckout();
        removeCoupon();
        
        // Redirect to orders page if navigate is available
        if (window.ordersNavigate) {
          setTimeout(() => {
            window.ordersNavigate('/orders');
            window.ordersNavigate = null;
          }, 500);
        }
        
        return { success: true, order: data.order };
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal - discount + deliveryCharge;

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
        deliveryCharge,
        total
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutContext;
