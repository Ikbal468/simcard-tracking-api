# 🔐 Permission System Implementation Summary

## ✅ What Was Implemented

### 1. **Role-Based Permission System**

- Created `Role` and `Permission` entities with many-to-many relationship
- Updated `User` entity to use role relationship instead of simple string
- Implemented fine-grained permissions for all resources

### 2. **Authentication & Authorization**

- **AuthGuard**: Validates JWT tokens and attaches user to request
- **PermissionsGuard**: Checks if user has required permission for the endpoint
- **Decorators**: `@RequirePermission(resource, action)` and `@CurrentUser()`

### 3. **Admin-Only User Creation**

- Only users with admin role can create new users
- Password is securely hashed using bcryptjs
- Passwords are never returned in API responses

### 4. **Protected Endpoints**

All endpoints now require:

1. Valid JWT token (via AuthGuard)
2. Appropriate permission (via PermissionsGuard)

---

## 📊 Permission Matrix

| Resource         | Admin                      | Operator                   |
| ---------------- | -------------------------- | -------------------------- |
| **Customers**    | View, Create, Edit, Delete | View only                  |
| **Sim Cards**    | View, Create, Edit, Delete | View, Create, Edit, Delete |
| **Sim Types**    | View, Create, Edit, Delete | View only                  |
| **Transactions** | View, Create, Edit, Delete | View, Create, Edit, Delete |
| **Dashboard**    | View                       | View                       |
| **Users**        | View, Create               | None                       |

---

## 🎯 Key Endpoints for Testing

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "permissions": [...]
  }
}
```

---

### Create User (Admin Only)

```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "newoperator",
  "password": "securePassword123",
  "roleId": 2
}
```

**Response (Success):**

```json
{
  "id": 3,
  "username": "newoperator",
  "roleId": 2,
  "role": {
    "id": 2,
    "name": "operator",
    "permissions": [...]
  }
}
```

**Response (Non-Admin):**

```json
{
  "statusCode": 400,
  "message": "Only admin can create users"
}
```

---

### Get All Users

```http
GET /api/users
Authorization: Bearer <admin_token>
```

**Response:**

```json
[
  {
    "id": 1,
    "username": "admin",
    "roleId": 1,
    "role": {
      "id": 1,
      "name": "admin"
    }
  },
  {
    "id": 2,
    "username": "operator1",
    "roleId": 2,
    "role": {
      "id": 2,
      "name": "operator"
    }
  }
]
```

---

### Get Available Roles

```http
GET /api/users/roles
Authorization: Bearer <any_valid_token>
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "admin",
    "permissions": [
      { "id": 1, "resource": "customers", "action": "view" },
      { "id": 2, "resource": "customers", "action": "create" },
      ...
    ]
  },
  {
    "id": 2,
    "name": "operator",
    "permissions": [
      { "id": 1, "resource": "customers", "action": "view" },
      { "id": 5, "resource": "simcards", "action": "view" },
      { "id": 6, "resource": "simcards", "action": "create" },
      ...
    ]
  }
]
```

---

## 🧪 Testing

### Option 1: Using the Test Script

```bash
node scripts/test-permissions.js
```

This will run automated tests for:

- Admin login
- Admin creating users
- Admin accessing resources
- Operator login
- Operator permissions (allowed and denied)

### Option 2: Using Postman

1. Import `postman-collection.json` into Postman
2. Run "Login as Admin" request
3. Token is automatically saved to collection variables
4. Test other endpoints

### Option 3: Using cURL

**Admin Login:**

```bash
curl -X POST http://localhost:3300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Create User (Admin):**

```bash
curl -X POST http://localhost:3300/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "roleId": 2
  }'
```

**Create Customer (Operator - Should Fail):**

```bash
curl -X POST http://localhost:3300/api/customers \
  -H "Authorization: Bearer YOUR_OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "address": "123 Street"
  }'
```

---

## 📁 Files Created/Modified

### New Files:

- `src/entities/role.entity.ts` - Role entity
- `src/entities/permission.entity.ts` - Permission entity
- `src/auth/guards/auth.guard.ts` - JWT authentication guard
- `src/auth/guards/permissions.guard.ts` - Permission check guard
- `src/auth/decorators/permissions.decorator.ts` - Permission decorator
- `src/auth/decorators/current-user.decorator.ts` - Current user decorator
- `scripts/seed-permissions.js` - Database seeding script
- `scripts/test-permissions.js` - Automated testing script
- `postman-collection.json` - Postman collection
- `API-TESTING.md` - Detailed testing guide

### Modified Files:

- `src/entities/user.entity.ts` - Added role relationship
- `src/auth/auth.service.ts` - Updated to return role info
- `src/auth/auth.module.ts` - Export guards
- `src/users/users.service.ts` - Added role queries
- `src/users/users.module.ts` - Import role/permission entities
- `src/users/users.controller.ts` - Admin-only user creation
- `src/users/dto/create-user.dto.ts` - Updated to use roleId
- `src/customers/customer.controller.ts` - Added permission guards
- `src/sim-cards/sim-card.controller.ts` - Added permission guards
- `src/sim-types/sim-type.controller.ts` - Added permission guards
- `src/transactions/sim-transaction.controller.ts` - Added permission guards
- `src/dashboard/dashboard.controller.ts` - Added permission guards

---

## 🚀 Quick Start

1. **Seed the permissions:**

   ```bash
   node scripts/seed-permissions.js
   ```

2. **Start the server:**

   ```bash
   npm run start:dev
   ```

3. **Run automated tests:**

   ```bash
   node scripts/test-permissions.js
   ```

4. **Or use Postman:**
   - Import `postman-collection.json`
   - Run "Login as Admin" first
   - Try other endpoints

---

## 🔒 Security Features

1. **JWT Token Authentication** - All endpoints require valid token
2. **Password Hashing** - bcryptjs with 10 salt rounds
3. **Password Exclusion** - Passwords never returned in responses
4. **Role-Based Access Control** - Fine-grained permissions
5. **Admin Privilege Escalation Prevention** - Only admins can create users

---

## 📝 Notes

- **Role IDs**: 1 = Admin, 2 = Operator
- **Admin** has all permissions automatically (shortcut in PermissionsGuard)
- **Operator** has limited permissions defined in seed script
- Permissions are checked on every request via guards
- Unauthorized access returns 401, Forbidden access returns 403

---

## 🎨 Example Permission Flows

### ✅ Allowed: Admin Creating User

```
Request → AuthGuard → Valid token → User attached to request
       → User is admin → PermissionsGuard skipped (admin has all)
       → Controller checks admin role → Create user ✅
```

### ❌ Denied: Operator Creating Customer

```
Request → AuthGuard → Valid token → User attached to request
       → PermissionsGuard → Check "customers:create" permission
       → Operator role doesn't have this permission
       → 403 Forbidden ❌
```

### ✅ Allowed: Operator Viewing Dashboard

```
Request → AuthGuard → Valid token → User attached to request
       → PermissionsGuard → Check "dashboard:view" permission
       → Operator has "dashboard:view" permission
       → Access granted ✅
```

---

## 📚 Further Reading

- See `API-TESTING.md` for detailed testing instructions
- Import `postman-collection.json` for ready-to-use API requests
- Run `scripts/test-permissions.js` for automated verification
