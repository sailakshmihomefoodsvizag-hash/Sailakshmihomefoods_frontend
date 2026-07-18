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
// Only categories that contain authorised products.
// NOTE: These are UI navigation items, NOT products.
//       Do not use numeric IDs here — use string slugs to avoid
//       any accidental collision with product IDs.
// ============================================

export const categories = [
  {
    id: 'sweets',
    name: 'Sweets',
    slug: 'sweets',
    image: sweetsImg,
  },
  {
    id: 'snacks',
    name: 'Snacks',
    slug: 'snacks',
    image: snacksImg,
  },
  {
    id: 'veg-pickles',
    name: 'Veg Pickles',
    slug: 'veg-pickles',
    image: vegPicklesImg,
  },
  {
    id: 'podis',
    name: 'Podis',
    slug: 'podis',
    image: podisImg,
  },
];

// ============================================
// NAVIGATION LINKS
// ============================================

export const navLinks = [
  { name: 'Home',        href: '/' },
  { name: 'Sweets',      href: '/sweets' },
  { name: 'Snacks',      href: '/snacks' },
  { name: 'Veg Pickles', href: '/veg-pickles' },
  { name: 'Podis',       href: '/podis' },
];

// ============================================
// FOOTER DATA
// ============================================

export const footerLinks = {
  quickLinks: [
    { name: 'About Us',        href: '/about' },
    { name: 'Contact',         href: '/contact' },
    { name: 'FAQ',             href: '/faq' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Return Policy',   href: '/returns' },
  ],
  categories: [
    { name: 'Sweets',      href: '/sweets' },
    { name: 'Snacks',      href: '/snacks' },
    { name: 'Veg Pickles', href: '/veg-pickles' },
    { name: 'Podis',       href: '/podis' },
  ],
  contact: {
    phone:   '+91 99665 39144',
    email:   'sailakshmihomefoods.vskp@gmail.com',
    address: '50-27-14, Gurudwara Up Road, Opp. Electrical Substation, Akkayapalem, Balayya Sastri Layout, Seethammadara, Visakhapatnam, Andhra Pradesh 530013',
  },
  social: [
    { name: 'Facebook',  href: 'https://facebook.com' },
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'Twitter',   href: 'https://twitter.com' },
    { name: 'YouTube',   href: 'https://youtube.com' },
  ],
};

// ============================================
// HOMEPAGE PRODUCT SECTIONS
// Products are loaded dynamically from the database.
// Use the Admin Panel to manage best sellers and featured products.
// ============================================
