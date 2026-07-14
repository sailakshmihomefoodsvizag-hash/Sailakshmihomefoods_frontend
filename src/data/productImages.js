/**
 * Product Images Mapping
 * 
 * Images are handled ONLY in frontend - NOT stored in database.
 * This file maps product IDs to their corresponding images.
 *
 * NEW PRODUCT PHOTOS (placed in /public/ root, served as static assets):
 *   /GonguraPickle.webp   → Gongura Pickle  (ID 2)
 *   /Avakaya.webp         → Mango Avakaya   (ID 1)
 *   /MysorePak.webp       → Mysore Pak      (ID 208)
 *   /sunnundha.webp       → Sunnunda        (ID 212)
 *   /KandiPodi.webp       → Kandi Podi      (ID 7)
 *   /KarvepakuPodi.webp   → Karvepaku Podi  (ID 8)
 *   /Mixture.webp         → Mixture         (ID 101)
 */

// Category Images
import vegPicklesImg from '../assets/images/VegPickles.webp';
import podisImg from '../assets/images/Podis.webp';
import snacksImg from '../assets/images/Snacks.webp';
import sweetsImg from '../assets/images/Sweets.webp';

// ── NEW branded product photos (served from /public/) ────────────────────────
const gonguraNew    = '/GonguraPickle.webp';
const avakayaNew    = '/Avakaya.webp';
const mysorepakNew  = '/MysorePak.webp';
const sunnundaNew   = '/sunnundha.webp';
const kandiPodiNew  = '/KandiPodi.webp';
const karvepakuNew  = '/KarvepakuPodi.webp';
const mixtureNew    = '/Mixture.webp';

// ── Remaining Cloudinary images (unchanged) ──────────────────────────────────
const gingerPickle = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943744/GingerPickle_otnidn.png';
const lemonPickle = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943745/LemonPickle_azfpu9.png';
const redChilliPickle = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943746/RedChilliPickle_oqnlqr.png';
const usirikayaPickle = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943747/UsirikayaPickle_sjfuaq.png';

const kobbariPodi = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775944031/KobbariPodi_md00jo.png';

const murukuluImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775944168/Murukulu_ft78ro.png';
const ribbonPakodiImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775944169/RibbonPakodi_lycdhz.png';

const ariseluImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775942494/Ariselu_utseja.png';
const bandharuLadduImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775942495/BandharuLaddu_l0g92a.png';
const boondhiAchuImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775942494/Boondhiachu_pad4cx.png';
const boondhiLadduImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775942494/BoondhiLaddu_w7icu3.png';
const booreluImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775941659/Boorelu_xx6khm.png';
const cashewAchuImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943147/CashewAchu_l4bzb7.png';
const kajjiKayaluImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775942495/KajjiKayalu_bhntbw.png';
const nuvvundaluImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943147/nuvvundalu_dkytub.png';
const palliUndaluImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775942495/PalliUndalu_w9l3g1.png';
const sannaBoondhiLadduImg = 'https://res.cloudinary.com/ddrul5cxk/image/upload/q_auto,f_auto,w_400,c_fill,g_auto,dpr_auto/v1775943147/SannaBoondhiLaddu_bifirb.png';

/**
 * Product Images Map
 * Maps productId -> { image, images (array for gallery) }
 */
export const productImages = {
  // Veg Pickles
  1: { image: avakayaNew,   images: [avakayaNew] },            // Mango Avakaya
  2: { image: gonguraNew,   images: [gonguraNew] },            // Gongura Pickle
  10: { image: gingerPickle,   images: [gingerPickle] },       // Ginger Pickle
  11: { image: lemonPickle,    images: [lemonPickle] },        // Lemon Pickle
  12: { image: redChilliPickle, images: [redChilliPickle] },   // Red Chilli Pickle
  13: { image: usirikayaPickle, images: [usirikayaPickle] },   // Usirikaya Pickle

  // Podis
  7:  { image: kandiPodiNew,  images: [kandiPodiNew] },        // Kandi Podi
  8:  { image: karvepakuNew,  images: [karvepakuNew] },        // Karvepaku Podi
  9:  { image: kobbariPodi,   images: [kobbariPodi] },         // Kobbari Podi

  // Snacks
  101: { image: mixtureNew,   images: [mixtureNew] },          // Mixture
  102: { image: murukuluImg,  images: [murukuluImg] },         // Murukulu
  103: { image: ribbonPakodiImg, images: [ribbonPakodiImg] },  // Ribbon Pakodi

  // Sweets
  201: { image: ariseluImg,         images: [ariseluImg] },          // Ariselu
  202: { image: bandharuLadduImg,   images: [bandharuLadduImg] },    // Bandharu Laddu
  203: { image: boondhiAchuImg,     images: [boondhiAchuImg] },      // Boondhi Achu
  204: { image: boondhiLadduImg,    images: [boondhiLadduImg] },     // Boondhi Laddu
  205: { image: booreluImg,         images: [booreluImg] },          // Boorelu
  206: { image: cashewAchuImg,      images: [cashewAchuImg] },       // Cashew Achu
  207: { image: kajjiKayaluImg,     images: [kajjiKayaluImg] },      // Kajji Kayalu
  208: { image: mysorepakNew,       images: [mysorepakNew] },        // Mysore Pak
  209: { image: nuvvundaluImg,      images: [nuvvundaluImg] },       // Nuvvundalu
  210: { image: palliUndaluImg,     images: [palliUndaluImg] },      // Palli Undalu
  211: { image: sannaBoondhiLadduImg, images: [sannaBoondhiLadduImg] }, // Sanna Boondhi Laddu
  212: { image: sunnundaNew,        images: [sunnundaNew] },         // Sunnunda
};

/**
 * Category Images Map
 */
export const categoryImages = {
  'Veg Pickles': vegPicklesImg,
  'Podis': podisImg,
  'Snacks': snacksImg,
  'Sweets': sweetsImg,
};

/**
 * Get image for a product
 * @param {number} productId - The product ID
 * @returns {string} The image path or a placeholder
 */
export const getProductImage = (productId) => {
  const productImg = productImages[productId];
  return productImg?.image || vegPicklesImg; // Fallback to a default image
};

/**
 * Get all images for a product (for gallery/slider)
 * @param {number} productId - The product ID
 * @returns {string[]} Array of image paths
 */
export const getProductImages = (productId) => {
  const productImg = productImages[productId];
  return productImg?.images || [getProductImage(productId)];
};

/**
 * Merge product data with images
 * @param {object} product - Product data from API
 * @returns {object} Product with images merged
 */
export const mergeProductWithImages = (product) => {
  const imageData = productImages[product.id] || productImages[product.productId];
  return {
    ...product,
    image: imageData?.image || vegPicklesImg,
    images: imageData?.images || [vegPicklesImg],
  };
};

/**
 * Default placeholder image
 */
export const defaultProductImage = vegPicklesImg;

export default productImages;
