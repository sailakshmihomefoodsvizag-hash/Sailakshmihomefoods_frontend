/**
 * Static Data Exports
 * 
 * Products are now fetched from the backend API.
 * This file contains only static configuration data:
 * - Categories
 * - Navigation links
 * - Footer data
 */

// Import category images
import vegPicklesImg from '../assets/images/VegPickles.webp';
import podisImg from '../assets/images/Podis.webp';
import snacksImg from '../assets/images/Snacks.webp';
import sweetsImg from '../assets/images/Sweets.webp';

// Re-export product images utility
export { 
  default as productImages,
  categoryImages, 
  getProductImage, 
  getProductImages,
  mergeProductWithImages 
} from './productImages';

// ============================================
// PRICING UTILITY FUNCTIONS
// ============================================

// Calculate weight prices from 1kg base price
export const calculateWeightPrices = (pricePerKg) => ({
  '250gm': Math.floor(pricePerKg * 0.25),
  '500gm': Math.floor(pricePerKg * 0.5),
  '1kg': pricePerKg,
  '2kg': pricePerKg * 2,
});

// Standard weights for products
export const STANDARD_WEIGHTS = ['250gm', '500gm', '1kg', '2kg'];

// ============================================
// CATEGORIES DATA
// ============================================

export const categories = [
  {
    id: 1,
    name: 'Veg Pickles',
    slug: 'veg-pickles',
    image: vegPicklesImg,
  },
  {
    id: 3,
    name: 'Podis',
    slug: 'podis',
    image: podisImg,
  },
  {
    id: 4,
    name: 'Sweets',
    slug: 'sweets',
    image: sweetsImg,
  },
  {
    id: 5,
    name: 'Snacks',
    slug: 'snacks',
    image: snacksImg,
  },
];

// ============================================
// NAVIGATION LINKS
// ============================================

export const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Veg Pickles', href: '/veg-pickles' },
  { name: 'Podis', href: '/podis' },
  { name: 'Sweets', href: '/sweets' },
  { name: 'Snacks', href: '/snacks' },
];

// ============================================
// FOOTER DATA
// ============================================

export const footerLinks = {
  quickLinks: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Return Policy', href: '/returns' },
  ],
  categories: [
    { name: 'Veg Pickles', href: '/veg-pickles' },
    { name: 'Podis', href: '/podis' },
    { name: 'Sweets', href: '/sweets' },
    { name: 'Snacks', href: '/snacks' },
  ],
  contact: {
    phone: '+91 99665 39144',
    email: 'sailakshmihomefoods@gmail.com',
    address: '50-27-14, Gurudwara Up Road, Near Eenadu Junction, Akkayapalem, Visakhapatnam, Andhra Pradesh 530013',
  },
  social: [
    { name: 'Facebook', href: 'https://facebook.com' },
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'Twitter', href: 'https://twitter.com' },
    { name: 'YouTube', href: 'https://youtube.com' },
  ],
};

// ============================================
// BEST SELLER & NEW ARRIVAL PRODUCT IDS
// (Used for featuring specific products on homepage)
// ============================================

export const bestSellerIds = [1, 2, 7, 8, 101, 208, 212];
export const newArrivalIds = [208, 212, 101, 1, 2, 7, 8];

// Note: Actual product data is fetched from API via ProductConfigContext
