# Admin Routes & Pages Documentation

## 🔐 Admin Access URL
```
http://localhost:5173/admin/login
```

---

## 📋 All Admin Routes

### **1. Admin Login Page**
- **Route:** `/admin/login`
- **Component:** `AdminLogin.jsx`
- **Path:** `src/pages/AdminLogin.jsx`
- **Purpose:** Admin authentication
- **Features:**
  - Mobile number & password login
  - Uses `adminAPI.login()` service
  - Error handling
  - Redirects to dashboard on success

---

### **2. Admin Dashboard**
- **Route:** `/admin/dashboard`
- **Component:** `AdminDashboard.jsx`
- **Path:** `src/pages/AdminDashboard.jsx`
- **Purpose:** Overview of key metrics
- **Features:**
  - Total Revenue
  - Total Orders
  - This Month Orders
  - Delivered Orders
  - Real-time stats from API
  - Responsive design (desktop & mobile)

---

### **3. Admin Orders Management**
- **Route:** `/admin/orders`
- **Component:** `AdminOrders.jsx`
- **Path:** `src/pages/AdminOrders.jsx`
- **Purpose:** Manage all customer orders
- **Features:**
  - Filter by status (all, pending, processing, out_for_delivery, delivered)
  - View order details in modal/drawer
  - Update order status through strict 3-step progression:
    1. **Processing** → (Package icon)
    2. **Out for Delivery** → (Truck icon)
    3. **Delivered** → (CheckCircle icon)
  - View customer details
  - View items ordered
  - View pricing breakdown (subtotal, coupon discount, delivery, total)
  - Desktop table view + Mobile card view
  - Real-time updates

---

### **4. Admin Products Management**
- **Route:** `/admin/products`
- **Component:** `AdminProducts.jsx`
- **Path:** `src/pages/AdminProducts.jsx`
- **Purpose:** Manage product catalog
- **Features:**
  - View all products
  - Add new products
  - Edit existing products
  - Delete products
  - Manage product categories (Veg Pickles, Podis, Sweets, Snacks)
  - Set pricing and availability
  - Responsive design

---

### **5. Admin Coupons Management**
- **Route:** `/admin/coupons`
- **Component:** `AdminCoupons.jsx`
- **Path:** `src/pages/AdminCoupons.jsx`
- **Purpose:** Create and manage promotional coupons
- **Features:**
  - Create new coupons
  - Edit existing coupons
  - Delete coupons
  - Toggle coupon active/inactive status
  - Coupon types:
    - Percentage (%) discount
    - Flat amount (₹) discount
  - Set minimum order amount
  - Set maximum discount cap
  - Specify applicable products
  - Set expiration date/time
  - View usage count
  - Show expired/active status badges

---

## 🎯 Admin Layout Structure

### **AdminLayout Component**
- **Path:** `src/pages/AdminLayout.jsx`
- **Purpose:** Wrapper for all admin pages
- **Features:**
  - Authentication verification
  - Sidebar navigation (Desktop)
  - Bottom tab bar (Mobile)
  - Top header with admin indicator
  - Logo display
  - Logout button
  - Responsive design (MD breakpoint)

### **Sidebar Navigation Items:**
1. Dashboard (LayoutDashboard icon)
2. Orders (ShoppingCart icon)
3. Products (Package icon)
4. Coupons (Ticket icon)

---

## 🛠️ Admin API Service

### **File:** `src/services/adminAPI.js`

### **Key Methods:**
```javascript
// Authentication
adminAPI.login(mobile, password)
adminAPI.logout()
adminAPI.verify()
adminAPI.isLoggedIn()

// Dashboard
adminAPI.getDashboard()

// Orders
adminAPI.getOrders({ status: filterValue })
adminAPI.getOrder(orderId)
adminAPI.updateOrderStatus(orderId, status)

// Products
adminAPI.getProducts()
adminAPI.createProduct(productData)
adminAPI.updateProduct(productId, productData)
adminAPI.deleteProduct(productId)

// Coupons
adminAPI.getCoupons()
adminAPI.createCoupon(couponData)
adminAPI.updateCoupon(couponId, couponData)
adminAPI.deleteCoupon(couponId)
adminAPI.toggleCoupon(couponId)
```

---

## 🎨 Color Scheme (Admin UI)

| Element | Color |
|---------|-------|
| Primary Brand | `#7B0D1E` (Maroon) |
| Gold Accent | `#FFD700` (Sidebar highlight) |
| Background | `#f9fafb` (Light gray) |
| Dark Sidebar | `#1a1a1a` |
| Borders | `#e5e7eb` |

---

## 📱 Responsive Breakpoints

- **Mobile:** Default (< 768px)
- **Desktop:** `md:` (≥ 768px)

### Mobile Features:
- Bottom tab bar navigation
- Card-based layouts
- Drawer modals
- Full-width buttons
- Optimized touch targets (min 44px height)

### Desktop Features:
- Fixed left sidebar
- Table layouts
- Modal dialogs
- Hover effects

---

## 🔄 Login Flow

1. User navigates to `/admin/login`
2. Enter mobile number & password
3. Click "Login to Dashboard"
4. System calls `adminAPI.login()`
5. Token stored in localStorage
6. Redirects to `/admin/dashboard`
7. AdminLayout verifies authentication
8. On page load, checks token validity with `adminAPI.verify()`

---

## 🚪 Logout Flow

1. Click "Logout" button (sidebar or header)
2. System calls `adminAPI.logout()`
3. Clears token from localStorage
4. Redirects to `/admin/login`

---

## ⚠️ Security & Verification

- All admin routes require authentication
- AdminLayout performs verification on mount
- Invalid/expired tokens redirect to login
- Admin indicator in top right (Desktop)

---

## 📁 File Structure

```
src/
├── pages/
│   ├── AdminLogin.jsx          (Login page)
│   ├── AdminLayout.jsx         (Layout wrapper)
│   ├── AdminDashboard.jsx      (Stats & overview)
│   ├── AdminOrders.jsx         (Order management)
│   ├── AdminProducts.jsx       (Product management)
│   └── AdminCoupons.jsx        (Coupon management)
├── services/
│   └── adminAPI.js             (API calls)
└── data/
    └── orderStatus.js          (Status enums & labels)
```

---

## 🎯 Quick Access Links

- **Admin Login:** http://localhost:5173/admin/login
- **Dashboard:** http://localhost:5173/admin/dashboard
- **Orders:** http://localhost:5173/admin/orders
- **Products:** http://localhost:5173/admin/products
- **Coupons:** http://localhost:5173/admin/coupons

---

## 📝 Notes

- Admin credentials (mobile & password) must be configured on backend
- All data operations sync with backend API
- Real-time updates after each action
- Error handling with user-friendly messages
- Loading states with skeleton/pulse animations
