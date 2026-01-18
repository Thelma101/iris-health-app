# API Integration Scope Documentation

> **Last Updated:** January 17, 2026  
> **Current Phase:** Phase 1 - Admin Dashboard

---

## 🗄️ Database Information

| Property | Value |
|----------|-------|
| **Database Type** | MongoDB Atlas (Cloud) |
| **Cluster Name** | `medtrack.izytxxn.mongodb.net` |
| **Database Name** | `medtrack` |
| **Connection String** | See `.env` file or contact admin |

### How to Access Your Database

#### Option 1: MongoDB Compass (Desktop App)
1. Download from: https://www.mongodb.com/try/download/compass
2. Install and open MongoDB Compass
3. Click "New Connection"
4. Get connection string from `.env` file (MONGO_URI)
5. Click "Connect"
6. Browse collections: `admins`, `fieldagents`, `communities`, `patients`, `visitations`, `inventories`

#### Option 2: MongoDB Atlas Web UI
1. Go to: https://cloud.mongodb.com
2. Login with your Atlas account
3. Select Cluster: `medtrack`
4. Click "Browse Collections"

### Collections (Tables)

| Collection | Description |
|------------|-------------|
| `admins` | Admin user accounts |
| `fieldagents` | Field agent/officer accounts |
| `communities` | Community records |
| `patients` | Patient records |
| `visitations` | Test/visitation records |
| `inventories` | Inventory items |

---

## 📊 Phase 1: Admin Dashboard APIs

### Authentication (Admin)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/signup` | Register new admin | ❌ Public |
| POST | `/api/admin/login` | Admin login (returns JWT) | ❌ Public |
| GET | `/api/admin/profile` | Get admin profile | ✅ Admin |

### Community Management (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/community/all` | List all communities | ✅ Admin |
| GET | `/api/community/:id` | Get community by ID | ✅ Admin |
| POST | `/api/community/` | Create new community | ✅ Admin |
| PUT | `/api/community/:id` | Update community | ✅ Admin |
| DELETE | `/api/community/:id` | Delete community | ✅ Admin |

### User Management - Field Agents (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fieldAgent/all` | List all field agents | ✅ Admin |
| GET | `/api/fieldAgent/:id` | Get agent by ID | ✅ Admin |
| POST | `/api/fieldAgent/signup` | Create new field agent | ✅ Admin |
| PUT | `/api/fieldAgent/:id` | Update field agent | ✅ Admin |
| DELETE | `/api/fieldAgent/:id` | Delete field agent | ✅ Admin |

### Patients (Admin/Agent)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/patients/` | List all patients | ✅ Admin/Agent |
| GET | `/api/patients/:id` | Get patient by ID | ✅ Admin/Agent |
| PUT | `/api/patients/:id` | Update patient | ✅ Admin/Agent |
| DELETE | `/api/patients/:id` | Delete patient | ✅ Admin/Agent |

### Visitation/Tests (Admin/Agent)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/visitation/` | List all visitations | ✅ Admin/Agent |
| GET | `/api/visitation/:patientId` | Get by patient | ✅ Admin/Agent |
| GET | `/api/visitation/com/:communityId` | Get by community | ✅ Admin/Agent |

### Inventory (Admin/Agent)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/inventory/` | List all inventory | ✅ Admin/Agent |
| GET | `/api/inventory/:id` | Get item by ID | ✅ Admin/Agent |
| PUT | `/api/inventory/:id` | Update item | ✅ Admin/Agent |

### Dashboard Statistics (Computed)

The frontend computes dashboard statistics by aggregating:
- `/api/community/all` - Total communities count
- `/api/fieldAgent/all` - Total field agents count
- `/api/visitation/` - Total tests/visitations count

---

## 🚫 Phase 2: Field Agent Dashboard APIs (NOT YET IMPLEMENTED)

These endpoints exist in the backend but should **NOT** be used by the admin dashboard:

| Method | Endpoint | Purpose | Phase |
|--------|----------|---------|-------|
| POST | `/api/fieldAgent/login` | Field agent authentication | Phase 2 |
| GET | `/api/fieldAgent/profile` | Field agent's own profile | Phase 2 |
| POST | `/api/patients/` | Create patient (field work) | Phase 2 |
| POST | `/api/visitation/` | Create visitation (field work) | Phase 2 |
| POST | `/api/inventory/` | Add inventory item | Phase 2 |
| DELETE | `/api/visitation/:id` | Delete visitation | Phase 2 |
| DELETE | `/api/inventory/:id` | Delete inventory | Phase 2 |

---

## 🔒 Authentication Flow

### Admin Authentication
```
1. Admin logs in via POST /api/admin/login
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include: Authorization: Bearer <token>
5. Backend middleware verifies token and admin role
```

### Protected Route Middleware Stack
```typescript
// Admin-only routes
protect → adminOnly → controller

// Admin or Agent routes  
protect → agentOrAdmin → controller
```

---

## 📁 Frontend Pages → API Mapping

| Page | Route | APIs Used |
|------|-------|-----------|
| Login | `/login` | `POST /api/admin/login` |
| Dashboard | `/dashboard` | Aggregates from community, fieldAgent, visitation |
| Community | `/dashboard/community` | `/api/community/*` |
| User Management | `/dashboard/user-management` | `/api/fieldAgent/*` |
| View Patients | `/dashboard/view-patients` | `/api/patients/*` |
| Inventory | `/dashboard/inventory` | `/api/inventory/*` |
| Reports | `/dashboard/report` | `/api/visitation/*` |

---

## ✅ Phase 1 Checklist

- [x] Admin authentication (login/signup)
- [x] Community CRUD operations
- [x] Field Agent management (User Management page)
- [x] Patient list/view/update
- [x] Visitation/test list/view
- [x] Inventory list/view/update
- [x] Dashboard statistics aggregation
- [x] Proper route protection (adminOnly middleware)

---

## 📝 Notes

1. **Database name**: `medtrack` - explicitly set in connection string
2. **All admin routes require JWT token** in Authorization header
3. **Field agent dashboard** (Phase 2) will use separate login flow
4. **No data creation from admin dashboard** for patients/visitations (that's field work)
