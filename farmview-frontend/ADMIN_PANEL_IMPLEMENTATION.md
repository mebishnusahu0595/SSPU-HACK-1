# 👨‍💼 Admin Panel Implementation

## Overview
Complete admin panel for manually verifying **ONLY pending documents** that were uploaded manually. AI-verified documents **do NOT** appear in admin panel - they are automatically processed!

---

## ✅ What We Built

### 1. **Admin Authentication System**
- **Admin Model**: Username, email, password (bcrypt hashed), role (super-admin/admin/moderator)
- **JWT Authentication**: 24-hour token expiry
- **Role-based Access Control**: Super admin can create new admins
- **Login Tracking**: Last login time, verification count

### 2. **Document Verification System**
- **Manual Verification ONLY**: Admin sees only manually uploaded documents
- **AI-Verified Exclusion**: Documents verified by OCR+AI are automatically excluded
- **Verify/Reject Actions**: Admin can approve or reject with remarks
- **Status Tracking**: Pending → Verified/Rejected

### 3. **Dashboard Statistics**
- Total Users
- Total Documents
- **Pending Documents** (manual only, excludes AI-verified)
- Verified Documents
- Rejected Documents
- AI-Verified Count (info only, not actionable)

### 4. **User Management**
- View all registered users
- User details with document/property counts
- User activity tracking

---

## 📁 Files Created

### Backend

#### **`server/models/Admin.model.js`** (NEW)
Admin user schema with password hashing.

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (bcrypt hashed),
  role: 'super-admin' | 'admin' | 'moderator',
  isActive: Boolean,
  lastLogin: Date,
  verificationsCount: Number
}
```

---

#### **`server/middleware/adminAuth.js`** (NEW)
Admin authentication & authorization middleware.

**Functions:**
- `authAdmin()`: Verify admin token
- `authSuperAdmin()`: Super admin only routes

**Usage:**
```javascript
router.get('/admin-route', authAdmin, handler);
router.post('/create-admin', authAdmin, authSuperAdmin, handler);
```

---

#### **`server/routes/admin.routes.js`** (NEW - 500+ lines)
Complete admin API endpoints.

**Endpoints:**

1. **POST `/api/admin/login`**
   - Admin login with username/email + password
   - Returns JWT token
   - Updates last login time

2. **GET `/api/admin/profile`**
   - Get current admin profile
   - Requires: authAdmin middleware

3. **GET `/api/admin/dashboard/stats`**
   - Dashboard statistics
   - **Key Feature**: Excludes AI-verified documents from pending count
   ```javascript
   const pendingDocuments = await Document.countDocuments({
     status: 'Pending',
     verificationStatus: { $ne: 'auto-verified' },
     verificationMethod: { $ne: 'ocr-ai' }
   });
   ```

4. **GET `/api/admin/documents/pending`**
   - Get pending documents for manual verification
   - **Filters out AI-verified documents**
   - Pagination support

5. **GET `/api/admin/documents`**
   - Get all documents with filters
   - Filter by status & verification type
   - Pagination support

6. **GET `/api/admin/documents/:id`**
   - Get single document details
   - Related property information

7. **PUT `/api/admin/documents/:id/verify`**
   - Verify or reject document
   - **Prevents verifying AI-verified documents**
   - Requires remarks for rejection
   ```javascript
   if (document.verificationStatus === 'auto-verified') {
     return res.status(403).json({
       message: 'Cannot manually verify AI-verified documents'
     });
   }
   ```

8. **GET `/api/admin/users`**
   - Get all users with stats
   - Document & property counts

9. **GET `/api/admin/users/:id`**
   - Get user details
   - User's documents & properties

10. **POST `/api/admin/create-admin`** (Super Admin Only)
    - Create new admin user
    - Requires: authSuperAdmin middleware

---

#### **`server/createAdmin.js`** (NEW)
Script to create default admin user.

**Usage:**
```bash
cd server
node createAdmin.js
```

**Default Credentials:**
- Username: `admin`
- Password: `Admin@123`
- Role: `super-admin`

---

#### **`server/models/Document.model.js`** (UPDATED)
Added `verificationRemarks` field.

```javascript
{
  verificationRemarks: String // Admin remarks for verification
}
```

---

#### **`server/server.js`** (UPDATED)
Added admin routes.

```javascript
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);
```

---

### Frontend

#### **`client/src/pages/AdminLogin.jsx`** (NEW - 150+ lines)
Beautiful admin login page.

**Features:**
- Gradient background (blue/indigo/purple)
- Animated login card
- Username/Email + Password fields
- Default credentials display
- Token storage in localStorage
- Redirect to dashboard on success

**Design:**
- 🔒 Modern gradient UI
- ⚡ Framer Motion animations
- 🎨 Tailwind CSS styling

---

#### **`client/src/pages/AdminDashboard.jsx`** (NEW - 600+ lines)
Complete admin dashboard with document verification.

**Sections:**

1. **Header**
   - Admin username display
   - Logout button

2. **Statistics Cards** (4 cards)
   - Total Users (blue)
   - Total Documents (purple)
   - **Pending (Manual)** (yellow) - Excludes AI-verified
   - Verified (green)

3. **AI-Verified Info Banner**
   - Shows count of AI-verified documents
   - Informs admin these don't need manual verification

4. **Search & Filters**
   - Search by document name or user
   - Filter by status (All/Pending/Verified/Rejected)

5. **Pending Documents Table**
   - **ONLY manual pending documents**
   - Columns: Document, User, Type, Status, Date, Actions
   - View & Download buttons
   - Pagination support

6. **Verification Modal**
   - Document details display
   - User information
   - Admin remarks textarea
   - Verify/Reject buttons
   - Real-time update after verification

**Key Logic:**
```javascript
// ONLY fetch manual pending documents
const query = {
  status: 'Pending',
  verificationStatus: { $ne: 'auto-verified' },
  verificationMethod: { $ne: 'ocr-ai' }
};
```

---

#### **`client/src/App.jsx`** (UPDATED)
Added admin routes.

```javascript
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
```

---

## 🔒 Security Features

### 1. **AI-Verified Protection**
```javascript
// Backend: Prevent admin from manually verifying AI docs
if (document.verificationStatus === 'auto-verified' || 
    document.verificationMethod === 'ocr-ai') {
  return res.status(403).json({
    message: 'Cannot manually verify AI-verified documents'
  });
}
```

### 2. **Token-based Auth**
- JWT tokens with 24-hour expiry
- Token stored in localStorage
- Authorization header on all admin requests

### 3. **Role-based Access**
- `authAdmin`: All admin endpoints
- `authSuperAdmin`: Only super admin can create admins

### 4. **Password Hashing**
- bcrypt with salt rounds = 10
- Pre-save hook in Admin model

---

## 🚀 Usage

### 1. Create Default Admin
```bash
cd server
node createAdmin.js
```

**Output:**
```
✅ Default admin created successfully!
Username: admin
Password: Admin@123
Role: super-admin
```

### 2. Start Server
```bash
cd server
npm start
```

### 3. Start Frontend
```bash
cd client
npm run dev
```

### 4. Login as Admin
```
URL: http://localhost:5173/admin/login
Username: admin
Password: Admin@123
```

### 5. Verify Documents
1. Go to Dashboard
2. See pending documents (**manual only**)
3. Click "View" on any document
4. Review details
5. Add remarks (required for rejection)
6. Click "Verify" or "Reject"
7. Document status updates instantly

---

## 📊 Document Flow

### Manual Upload Flow
```
User uploads document manually
    ↓
Status: "Pending"
verificationMethod: "manual" or null
verificationStatus: "pending"
    ↓
Appears in Admin Dashboard
    ↓
Admin reviews & verifies
    ↓
Status: "Verified" or "Rejected"
verificationMethod: "manual"
verifiedBy: admin._id
```

### AI Verification Flow
```
User uses AI verification modal
    ↓
OCR extracts text
    ↓
AI validates with Gemini
    ↓
Match score ≥ 85%
    ↓
Status: "Verified"
verificationMethod: "ocr-ai"
verificationStatus: "auto-verified"
    ↓
DOES NOT appear in Admin Dashboard
```

---

## 🎯 Key Differences

### Manual Documents (Admin Sees These):
```javascript
{
  status: "Pending",
  verificationMethod: "manual" or null,
  verificationStatus: "pending"
}
```

### AI-Verified Documents (Admin Does NOT See):
```javascript
{
  status: "Verified",
  verificationMethod: "ocr-ai",
  verificationStatus: "auto-verified",
  verificationScore: 92
}
```

---

## 🔧 API Examples

### Admin Login
```bash
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "6729...",
    "username": "admin",
    "email": "admin@farmview.com",
    "role": "super-admin"
  }
}
```

### Get Pending Documents
```bash
GET http://localhost:5000/api/admin/documents/pending
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "6729...",
      "documentName": "Land Ownership Certificate",
      "documentType": "Land Documents",
      "status": "Pending",
      "verificationMethod": "manual",
      "uploadedBy": {
        "name": "Ramesh Kumar",
        "email": "ramesh@example.com"
      },
      "createdAt": "2025-11-02T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### Verify Document
```bash
PUT http://localhost:5000/api/admin/documents/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Verified",
  "remarks": "Document verified successfully. All details match."
}

Response:
{
  "success": true,
  "message": "Document verified successfully",
  "document": {
    "_id": "6729...",
    "status": "Verified",
    "verificationStatus": "verified",
    "verificationMethod": "manual",
    "verifiedBy": "6729...",
    "verifiedAt": "2025-11-02T11:00:00.000Z",
    "verificationRemarks": "Document verified successfully..."
  }
}
```

---

## 🎨 UI Screenshots

### Admin Login
```
┌─────────────────────────────────┐
│    🛡️ Admin Panel                │
│  FarmView Management System     │
│                                 │
│  👤 Username or Email           │
│  [                     ]        │
│                                 │
│  🔒 Password                    │
│  [                     ]        │
│                                 │
│  [ Login to Admin Panel ]       │
│                                 │
│  Default Credentials:           │
│  Username: admin                │
│  Password: Admin@123            │
└─────────────────────────────────┘
```

### Admin Dashboard
```
┌────────────────────────────────────────────┐
│  Admin Dashboard    [Logout]               │
│  Welcome back, admin!                      │
├────────────────────────────────────────────┤
│  [Users]  [Docs]  [Pending]  [Verified]   │
│    125     450       12         380        │
├────────────────────────────────────────────┤
│  ℹ️ 58 documents auto-verified by AI       │
├────────────────────────────────────────────┤
│  🔍 [Search...] [Filter: All ▾]           │
├────────────────────────────────────────────┤
│  Pending Documents (Manual Verification)   │
│  ┌──────────────────────────────────────┐  │
│  │ Land Cert | Ramesh | Pending | View │  │
│  │ 7/12 Doc  | Suresh | Pending | View │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## 📝 Admin Actions

### Create New Admin (Super Admin Only)
```javascript
POST /api/admin/create-admin
Authorization: Bearer <super-admin-token>

{
  "username": "moderator1",
  "email": "mod1@farmview.com",
  "password": "SecurePass123",
  "role": "moderator"
}
```

### View User Details
```javascript
GET /api/admin/users/:userId
Authorization: Bearer <token>

Response includes:
- User profile
- All uploaded documents
- All registered properties
- Document verification stats
```

---

## 🐛 Troubleshooting

### Issue: Admin can't login
**Solution:**
```bash
# Recreate admin
cd server
node createAdmin.js
```

### Issue: Pending count shows 0
**Reason:** All documents are AI-verified!
**Check:** 
```bash
# In admin dashboard, check AI-Verified count
# Those documents don't need manual verification
```

### Issue: "Cannot verify AI-verified documents"
**Reason:** Document was auto-verified by AI
**Solution:** This is expected behavior - AI-verified documents can't be manually changed

---

## ✅ Implementation Summary

**Backend:**
- ✅ Admin Model with password hashing
- ✅ Admin authentication middleware
- ✅ 10 admin API endpoints
- ✅ Document filtering (excludes AI-verified)
- ✅ Verification with remarks
- ✅ Role-based access control
- ✅ Default admin creation script

**Frontend:**
- ✅ Admin login page
- ✅ Admin dashboard with stats
- ✅ Pending documents table
- ✅ Document verification modal
- ✅ Search & filters
- ✅ Real-time updates
- ✅ Beautiful gradient UI

**Security:**
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Token expiry (24h)
- ✅ AI-verified document protection
- ✅ Role-based permissions

---

**Last Updated:** November 2, 2025
**Status:** ✅ Fully Implemented & Tested
**Admin Credentials:** `admin` / `Admin@123`
