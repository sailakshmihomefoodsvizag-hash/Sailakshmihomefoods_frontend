/**
 * Product Images — Dynamic catalog
 *
 * Priority order for product images:
 *   1. product.imageUrl from Supabase DB (R2 upload by admin) — always preferred
 *   2. Category placeholder image — used when no imageUrl exists
 *
 * The hardcoded per-product static file map has been removed.
 * All product images must be uploaded through the Admin Panel.
 */

import vegPicklesImg from '../assets/images/VegPickles.webp';
import podisImg      from '../assets/images/Podis.webp';
import snacksImg     from '../assets/images/Snacks.webp';
import sweetsImg     from '../assets/images/Sweets.webp';

export const categoryImages = {
  'Veg Pickles': vegPicklesImg,
  'Podis':       podisImg,
  'Snacks':      snacksImg,
  'Sweets':      sweetsImg,
};

export const getProductImage = (productId, category) => {
  return categoryImages[category] || vegPicklesImg;
};

export const getProductImages = (productId, category) => {
  return [getProductImage(productId, category)];
};

/**
 * Merge API product with image data.
 * R2 imageUrl (from DB) is always used when present.
 * Falls back to a category placeholder — never to a hardcoded static file.
 */
export const mergeProductWithImages = (product) => {
  if (product.imageUrl) {
    return { ...product, image: product.imageUrl, images: [product.imageUrl] };
  }

  const fallback = categoryImages[product.category] || vegPicklesImg;

  return {
    ...product,
    image:  fallback,
    images: [fallback],
  };
};

// Empty map — kept for API compatibility only.
// Images are now served from R2 (imageUrl) or category placeholders.
export const productImages = {};

export const defaultProductImage = vegPicklesImg;
export default productImages;
