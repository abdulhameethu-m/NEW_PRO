# Admin Product Management - Quick Reference

## 🚀 Quick Start

### Start the App
```bash
# Backend
cd backend && npm start

# Frontend (new terminal)
cd frontend && npm run dev
```

### Access Admin Products
1. Login as admin user
2. Navigate to **Admin → Products**

---

## 📝 Key Files Modified/Created

### New Frontend Pages
```
frontend/src/pages/AdminProductCreate.jsx (NEW)
frontend/src/pages/AdminProductEdit.jsx (NEW)
```

### Enhanced Files
```
frontend/src/pages/AdminProductsPage.jsx (+ delete button)
frontend/src/services/adminApi.js (+ create/update/delete)
frontend/src/services/adminService.js (+ exports)
frontend/src/App.jsx (+ new routes)
backend/src/routes/admin.routes.js (+ route ordering, GET :id)
```

---

## 🎯 Main Features

### 1. List Products
- View all products with status
- Filter by: status, category, search
- Pagination support
- Actions: Review, Edit, Delete, Approve, Reject

### 2. Create Product
- Fill form: name, description, category, price, stock, SKU
- Add images (at least 1)
- Auto-approved instantly
- Visible to customers

### 3. Edit Product
- Update product details
- Manage images
- Save changes

### 4. Delete Product
- Soft delete (data preserved)
- Confirmation required
- Hidden from customers

### 5. Approve/Reject
- Review pending products
- Approve → visible to customers
- Reject → need reason

---

## 🔌 API Endpoints

```
GET    /api/admin/products              # List all
GET    /api/admin/products/:id          # Get single
GET    /api/admin/products/stats        # Statistics
GET    /api/admin/products/pending      # Pending products
POST   /api/admin/products              # Create
PATCH  /api/admin/products/:id          # Update
DELETE /api/admin/products/:id          # Delete
PATCH  /api/admin/products/:id/approve  # Approve
PATCH  /api/admin/products/:id/reject   # Reject (with reason)
```

---

## 📦 API Response Format

### Success
```json
{
  "data": { /* result */ },
  "message": "Success message",
  "statusCode": 200
}
```

### Error
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## 🔐 Required Permissions

| Operation | Permission |
|-----------|------------|
| List/View | `products:read` |
| Create | `products:create` |
| Update | `products:update` |
| Delete | `products:delete` |
| Approve | `products:approve` |
| Reject | `products:reject` |

---

## 📊 Form Fields

### Create/Edit Product
```javascript
{
  name: String,                    // required, 3-255 chars
  description: String,             // required, 10+ chars
  shortDescription: String,        // optional, max 500
  category: String,                // required
  subCategory: String,             // optional
  price: Number,                   // required, > 0
  discountPrice: Number,           // optional
  stock: Number,                   // required, >= 0
  SKU: String,                     // required, unique
  lowStockThreshold: Number,       // optional, default 10
  images: [{
    url: String,                   // required
    altText: String,               // optional
    isPrimary: Boolean             // auto-set
  }],
  tags: [String]                   // optional, comma-separated
}
```

---

## ✅ Validation Rules

| Field | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| name | String | 3 | 255 | ✅ |
| description | String | 10 | 5000 | ✅ |
| shortDescription | String | - | 500 | ❌ |
| category | String | - | - | ✅ |
| price | Number | 0 | ∞ | ✅ |
| stock | Number | 0 | ∞ | ✅ |
| SKU | String | - | - | ✅ |
| images | Array | 1 | 10 | ✅ |
| rejectionReason | String | 10 | 1000 | ✅ (reject only) |

---

## 🎨 UI Components Used

- **StatusBadge** - Shows status with color
- **BackButton** - Navigate back
- **AdminLayout** - Admin page wrapper
- **ProtectedRoute** - Role-based protection
- **RoleGate** - Access control

---

## 🧪 Testing Endpoints with cURL

### Get All Products
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/products
```

### Get Single Product
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/products/PRODUCT_ID
```

### Create Product
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description here",
    "category": "Electronics",
    "price": 999,
    "stock": 10,
    "SKU": "TEST-001",
    "images": [{"url": "http://example.com/img.jpg", "altText": "Test"}]
  }' \
  http://localhost:5000/api/admin/products
```

### Update Product
```bash
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 1099}' \
  http://localhost:5000/api/admin/products/PRODUCT_ID
```

### Delete Product
```bash
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/products/PRODUCT_ID
```

### Approve Product
```bash
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/products/PRODUCT_ID/approve
```

### Reject Product
```bash
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Image quality not acceptable"}' \
  http://localhost:5000/api/admin/products/PRODUCT_ID/reject
```

---

## 🔍 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Unauthorized" | Login first, check auth token |
| "Not Found" | Verify product ID exists |
| "Validation Error" | Check all required fields |
| "Conflict" | SKU already exists, use unique SKU |
| "CORS Error" | Check backend CORS settings |
| "Images not loading" | Verify image URLs are accessible |

---

## 📱 Routes in App

```javascript
// Admin Product Routes
/admin/products              // List & review
/admin/products/create       // Create new
/admin/products/:id/edit     // Edit existing
```

---

## 🎯 Product Status Values

```
PENDING   - Awaiting admin approval
APPROVED  - Visible to customers
REJECTED  - Hidden, admin rejected
```

---

## 💾 Database Fields

```javascript
Product {
  _id,
  name,
  slug,
  description,
  price,
  stock,
  category,
  images: [{url, altText, isPrimary}],
  status,              // PENDING|APPROVED|REJECTED
  isActive,            // true|false (soft delete)
  creatorType,         // ADMIN|SELLER
  createdBy,           // User ID
  sellerId,            // Vendor ID (nullable)
  rejectionReason,     // If rejected
  approvedAt,          // Timestamp
  approvedBy,          // Admin ID
  createdAt,
  updatedAt
}
```

---

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate SKU) |
| 500 | Server error |

---

## 📈 Performance Tips

1. **Image Optimization**
   - Compress images before uploading
   - Use appropriate formats (JPG for photos, PNG for graphics)
   - Keep size under 5MB

2. **List Performance**
   - Use pagination (default: 20 per page)
   - Filter by status to reduce results
   - Use search for specific products

3. **Frontend**
   - Images lazy-load
   - Form validates before submission
   - Loading states prevent double-submit

---

## 🔐 Security Checklist

- [x] Role-based access control
- [x] Permission-based operations
- [x] Input validation (Joi)
- [x] Soft delete (data preservation)
- [x] Protected routes
- [x] Confirmation dialogs
- [x] Error handling
- [x] HTTPS recommended

---

## 📞 Developer Reference

### Frontend Service Functions

```javascript
// From adminService.js
import {
  listProducts,           // GET /api/admin/products
  getProductById,         // GET /api/admin/products/:id (NEW)
  createProduct,          // POST /api/admin/products (NEW)
  updateProduct,          // PATCH /api/admin/products/:id (NEW)
  deleteProduct,          // DELETE /api/admin/products/:id (NEW)
  approveProduct,         // PATCH /api/admin/products/:id/approve
  rejectProduct,          // PATCH /api/admin/products/:id/reject
  getProductStats         // GET /api/admin/products/stats
} from '../services/adminService';
```

### Component Props

**AdminProductsPage**
- No props
- Manages its own state
- Handles list, approve, reject, delete

**AdminProductCreate**
- No props
- Form-based creation
- Auto-redirects to list on success

**AdminProductEdit**
- Uses useParams to get ID
- Loads product on mount
- Updates and redirects

---

## 🎓 Learning Resources

### Key Concepts
- **Soft Delete** - Sets `isActive=false` instead of removing
- **Role-Based Access** - User role determines allowed actions
- **Middleware** - Validates auth/permissions before route handler
- **Joi Validation** - Schema-based input validation
- **JWT Tokens** - Stateless authentication

### Files to Study
1. `backend/src/routes/admin.routes.js` - Route definitions
2. `backend/src/controllers/product.controller.js` - Business logic
3. `frontend/src/pages/AdminProductCreate.jsx` - Form example
4. `frontend/src/services/adminApi.js` - API calls

---

**Last Updated:** April 17, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
