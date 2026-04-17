# 🔍 Authentication 401 Unauthorized - Troubleshooting Guide

## ❌ Symptoms
- Getting `401 Unauthorized` error on logout
- Error message: "POST /api/auth/logout HTTP/1.1" 401
- Frontend shows authorization header not being sent

## 🎯 Root Cause Analysis

The 401 error means the `authRequired` middleware is not finding a valid token. This happens when:

1. ✗ Token is not in the Authorization header
2. ✗ Token is expired or invalid  
3. ✗ Token is stored but not being retrieved
4. ✗ CORS is not allowing headers to be sent

---

## 🛠️ Fixes Applied

I've already made the following improvements:

### 1. **Enhanced Auth Store** (`authStore.js`)
```javascript
// Added:
- isAuthenticated flag
- getToken() method for safer token access
- Better null handling
```

### 2. **Improved API Interceptor** (`api.js`)
```javascript
// Fixed:
- Ensures headers object exists before setting Authorization
- Always retrieves fresh token from store
- Better error handling
```

### 3. **Robust Logout Handler** (`UserMenu.jsx`)
```javascript
// Improved:
- Checks if token exists before attempting logout
- Falls back to local logout if server logout fails
- Better error logging for debugging
```

---

## ✅ Testing the Fix

### Step 1: Clear Browser Storage
```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Test Fresh Login
1. Go to http://localhost:5173/login
2. Login with valid credentials
3. Check browser console for errors

### Step 3: Verify Token is Stored
```javascript
// In browser console:
console.log(localStorage.getItem('amazon_like_auth'));
// Should show: {"token":"eyJ...","refreshToken":"eyJ...","user":{...}}
```

### Step 4: Test Logout
1. Click the user menu (top-right)
2. Click "Logout"
3. Check browser console for errors
4. Should redirect to /login

---

## 🔧 Advanced Debugging

### Check Token in Network Tab
1. Open DevTools → Network tab
2. Click logout
3. Find `POST /api/auth/logout` request
4. Click on it
5. Check "Request Headers" section
6. Should see: `Authorization: Bearer eyJ...`

### If Authorization Header is Missing

**Problem:** Token not being sent at all

**Solution:** Run this in browser console:
```javascript
// Check if token is stored
const stored = localStorage.getItem('amazon_like_auth');
console.log('Stored auth:', stored);

// Check if store has token
import { useAuthStore } from './context/authStore';
const { token } = useAuthStore.getState();
console.log('Current token:', token);
```

### If 401 Still Occurs

**Problem:** Token is sent but backend rejects it

**Solution:** Check backend console for specific error:
```
Look for error logs showing:
- "Invalid or expired token"
- "JWT verification failed"  
- "Token signature mismatch"
```

---

## 📝 What to Check

### Frontend (Browser Console)
- [ ] Token exists in localStorage
- [ ] useAuthStore has token in state
- [ ] API interceptor is adding Authorization header
- [ ] No JavaScript errors in console

### Backend (Terminal)
- [ ] JWT_ACCESS_SECRET is set in .env
- [ ] JWT_ACCESS_EXPIRES_IN is reasonable (e.g., "15m")
- [ ] Auth middleware can parse token correctly
- [ ] No server errors in logs

### Network (DevTools)
- [ ] Authorization header present in request
- [ ] Header format is correct: `Bearer TOKEN`
- [ ] CORS headers are being sent
- [ ] Response status is 401 (not 403 or 500)

---

## 🚀 If All Else Fails

### Full Reset Procedure
```bash
# 1. Clear database sessions
# Login to MongoDB and run:
db.sessions.deleteMany({})

# 2. Restart backend
# Ctrl+C to stop backend, then:
cd backend
npm start

# 3. Clear browser storage
# Open console and run:
localStorage.clear()
sessionStorage.clear()

# 4. Hard refresh frontend
# Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# 5. Login again fresh
```

---

## 📊 Expected Flow

```
1. User enters credentials → POST /api/auth/login
   ↓
   Response includes: { token, refreshToken, user }
   ↓
2. Frontend stores in localStorage
   ↓
   useAuthStore updates with token
   ↓
3. User clicks logout → Axios interceptor adds Authorization header
   ↓
   POST /api/auth/logout { Authorization: "Bearer TOKEN" }
   ↓
4. Backend authRequired middleware:
   - Extracts token from header
   - Verifies JWT signature
   - Attaches user to req.user
   ↓
5. Logout handler processes request
   ↓
6. Frontend receives 200 OK → clears storage → redirects to /login
```

---

## 🔐 Security Checklist

- [ ] JWT secrets are set in .env (not default)
- [ ] Access token expiration is reasonable (15m is good)
- [ ] Refresh token has longer expiration (7d is good)
- [ ] CORS credentials are enabled
- [ ] Token is sent in Authorization header (not in body)
- [ ] Token format includes "Bearer " prefix

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" on every request | Token never stored | Clear storage, login fresh |
| Token works for 15m then fails | Token expired | Auto-refresh with interceptor |
| Token works in Postman but not app | Headers not sent by app | Check API interceptor config |
| 401 on logout but other endpoints work | Logout route needs auth | Verify route has authRequired middleware |
| Headers in request but still 401 | JWT secret mismatch | Check .env JWT_ACCESS_SECRET |

---

## 📞 Quick Checklist

Before asking for help, verify:

- [ ] .env file has JWT_ACCESS_SECRET set
- [ ] Backend is running (port 5000)
- [ ] Frontend is running (port 5173)  
- [ ] Browser has no JavaScript errors
- [ ] Network tab shows Authorization header
- [ ] localStorage contains auth token
- [ ] CORS_ORIGINS includes http://localhost:5173

---

## 🎯 Next Steps

1. **Run the fixes:** Already applied in code
2. **Clear storage:** `localStorage.clear()`
3. **Restart backend:** Kill and restart npm start
4. **Hard refresh frontend:** Ctrl+Shift+R
5. **Test login/logout flow:** Try again

If still having issues, provide:
- Browser console errors (screenshot)
- Network tab request/response (screenshot)
- Backend terminal logs (paste relevant lines)
- .env file settings (mask secrets)

---

**Last Updated:** April 17, 2026
**Status:** Diagnostic guide created
