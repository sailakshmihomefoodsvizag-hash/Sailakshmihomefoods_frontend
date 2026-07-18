/**
 * Delivery Utilities — Single source of truth for delivery rules.
 *
 * Three delivery methods:
 *  1. in_store     — In-Store Pickup → always ₹0
 *  2. local        — Visakhapatnam / Vizag → FREE on ₹500+, ₹50 below
 *  3. outside      — Outside Visakhapatnam → ₹100 on ₹500+, ₹150 below
 *
 * Threshold: ₹500 (orders of ₹500 and above qualify for the lower rate)
 */

export const DELIVERY_METHODS = {
  in_store: 'in_store',
  local:    'local',
  outside:  'outside',
};

export const DELIVERY_LABELS = {
  in_store: 'In-Store Pickup',
  local:    'Local Delivery (Visakhapatnam)',
  outside:  'Outside Visakhapatnam',
};

export const FREE_DELIVERY_THRESHOLD = 500;

/**
 * Calculate the delivery charge based on method and subtotal.
 * @param {'in_store'|'local'|'outside'} method
 * @param {number} subtotal  — cart subtotal after discount
 * @returns {number}
 */
export const calculateDeliveryCharge = (method, subtotal) => {
  switch (method) {
    case DELIVERY_METHODS.in_store:
      return 0;

    case DELIVERY_METHODS.local:
      return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 50;

    case DELIVERY_METHODS.outside:
      return subtotal >= FREE_DELIVERY_THRESHOLD ? 100 : 150;

    default:
      // Safe fallback — treat unknown methods as local
      return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 50;
  }
};

/**
 * Return a human-readable label for the delivery charge.
 * @param {'in_store'|'local'|'outside'} method
 * @param {number} subtotal
 * @returns {string}  e.g. "FREE", "₹100"
 */
export const formatDeliveryCharge = (method, subtotal) => {
  const charge = calculateDeliveryCharge(method, subtotal);
  return charge === 0 ? 'FREE' : `₹${charge}`;
};

/**
 * Return a short display string combining label + charge.
 * Used in order summaries and admin panels.
 * @param {'in_store'|'local'|'outside'} method
 * @param {number} subtotal
 * @returns {string}  e.g. "In-Store Pickup — FREE"
 */
export const deliverySummaryLine = (method, subtotal) => {
  const label  = DELIVERY_LABELS[method] || method;
  const charge = formatDeliveryCharge(method, subtotal);
  return `${label} — ${charge}`;
};
