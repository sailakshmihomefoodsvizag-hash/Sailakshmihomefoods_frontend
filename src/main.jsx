import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './components/CartContext'
import { AuthProvider } from './components/AuthContext'
import { ProductConfigProvider } from './components/ProductConfigContext'
import { CheckoutProvider } from './components/CheckoutContext'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProductConfigProvider>
            <CartProvider>
              <CheckoutProvider>
                <App />
              </CheckoutProvider>
            </CartProvider>
          </ProductConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
