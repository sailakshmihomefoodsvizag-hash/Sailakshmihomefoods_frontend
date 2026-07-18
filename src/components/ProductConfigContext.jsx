import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mergeProductWithImages, calculateWeightPrices } from '../data';
import { productAPI } from '../services/api.js';

const ProductConfigContext = createContext();
const CATALOG_PAGE_LIMIT = 48;

const shouldPreloadCatalogForRoute = (pathname) => {
  if (!pathname || pathname === '/') return false;
  return !pathname.startsWith('/admin');
};

export const useProductConfig = () => {
  const context = useContext(ProductConfigContext);
  if (!context) {
    throw new Error('useProductConfig must be used within a ProductConfigProvider');
  }
  return context;
};

export const ProductConfigProvider = ({ children }) => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);
  const activeFetchRef = useRef(null);

  const fetchProducts = useCallback(async ({ force = false } = {}) => {
    if (!force && hasLoadedCatalog) {
      return products;
    }

    if (activeFetchRef.current) {
      return activeFetchRef.current;
    }

    const fetchPromise = (async () => {
      try {
        setLoading(true);

        let page = 1;
        let hasNextPage = true;
        const mergedProducts = [];

        while (hasNextPage) {
          const response = await productAPI.listProducts({
            page,
            limit: CATALOG_PAGE_LIMIT,
          });

          if (!response?.success) {
            throw new Error(response?.message || 'Failed to fetch products');
          }

          const currentPageProducts = (response.products || []).map((product) =>
            mergeProductWithImages(product)
          );
          mergedProducts.push(...currentPageProducts);

          const pagination = response.pagination || {};
          hasNextPage = Boolean(pagination.hasNextPage);
          page = (pagination.page || page) + 1;

          // Safety guard for malformed pagination data.
          if (page > 100) {
            hasNextPage = false;
          }
        }

        const uniqueProducts = Array.from(
          new Map(
            mergedProducts.map((product) => [product.id || product.productId, product])
          ).values()
        );

        setProducts(uniqueProducts);
        setHasLoadedCatalog(true);
        setLastFetched(new Date());
        setError(null);
        return uniqueProducts;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    })();

    activeFetchRef.current = fetchPromise.finally(() => {
      activeFetchRef.current = null;
    });

    return activeFetchRef.current;
  }, [hasLoadedCatalog, products]);

  useEffect(() => {
    if (!hasLoadedCatalog && shouldPreloadCatalogForRoute(location.pathname)) {
      fetchProducts().catch(() => {
        // Error state is already set in fetchProducts.
      });
    }
  }, [fetchProducts, hasLoadedCatalog, location.pathname]);

  const ensureProductsLoaded = useCallback(() => {
    if (hasLoadedCatalog) {
      return Promise.resolve(products);
    }
    return fetchProducts();
  }, [fetchProducts, hasLoadedCatalog, products]);

  const getProduct = useCallback((productId) => {
    const id = Number.parseInt(productId, 10);
    return products.find((product) => product.id === id || product.productId === id) || null;
  }, [products]);

  const getAllProducts = useCallback(() => {
    return products.filter((product) => product.isActive !== false);
  }, [products]);

  const getProductsByCategory = useCallback((category) => {
    return getAllProducts().filter((product) => {
      const productCategory = product.category.toLowerCase().replace(/\s+/g, '-');
      const searchCategory = category.toLowerCase().replace(/\s+/g, '-');
      return productCategory === searchCategory || product.category === category;
    });
  }, [getAllProducts]);

  const getBestSellers = useCallback(() => {
    // Return products marked as featured (best sellers) from the loaded catalog
    return products.filter((product) => product.isActive !== false && product.featured === true);
  }, [products]);

  const getNewArrivals = useCallback(() => {
    // Return recently added active products sorted by creation date
    return products
      .filter((product) => product.isActive !== false)
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [products]);

  const isInStock = useCallback((productId) => {
    const product = getProduct(productId);
    return product ? product.inStock !== false : false;
  }, [getProduct]);

  const refreshProducts = useCallback(() => {
    return fetchProducts({ force: true });
  }, [fetchProducts]);

  const value = {
    products,
    loading,
    error,
    lastFetched,
    hasLoadedCatalog,
    ensureProductsLoaded,
    getProduct,
    getAllProducts,
    getProductsByCategory,
    getBestSellers,
    getNewArrivals,
    isInStock,
    refreshProducts,
    calculateWeightPrices,
  };

  return (
    <ProductConfigContext.Provider value={value}>
      {children}
    </ProductConfigContext.Provider>
  );
};

export default ProductConfigContext;
