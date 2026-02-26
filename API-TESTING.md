# API Testing Guide - User Permissions & User Creation

## Overview

The API now has role-based permission system with two roles:

- **Admin**: Full access to all resources
- **Operator**: Limited access (view all, create/edit/delete only simcards and transactions)

## Authentication

All endpoints (except `/api/auth/login`) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Login Endpoint

### POST `/api/auth/login`

Login to get JWT token and user information with permissions.

**Request:**

```json
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
    "permissions": [
      { "id": 1, "resource": "customers", "action": "view" },
      { "id": 2, "resource": "customers", "action": "create" },
      ...
    ]
  }
}
```

---

## 2. User Creation (Admin Only)

### POST `/api/users`

Create a new user. **Only admins can create users.**

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "newoperator",
  "password": "securePassword123",
  "roleId": 2
}
```

**Role IDs:**

- `1` = Admin (full access)
- `2` = Operator (limited access)

**Success Response (201):**

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

**Error Response (400) - Non-admin user:**

```json
{
  "statusCode": 400,
  "message": "Only admin can create users"
}
```

**Error Response (401) - No token:**

```json
{
  "statusCode": 401,
  "message": "No token provided"
}
```

---

## 3. Get All Users

### GET `/api/users`

List all users (requires "users:view" permission - admin only by default).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

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

## 4. Get Available Roles

### GET `/api/users/roles`

Get list of available roles and their permissions (available to all authenticated users).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

```json
[
  {
    "id": 1,
    "name": "admin",
    "permissions": [...]
  },
  {
    "id": 2,
    "name": "operator",
    "permissions": [
      { "id": 1, "resource": "customers", "action": "view" },
      { "id": 5, "resource": "simcards", "action": "view" },
      { "id": 6, "resource": "simcards", "action": "create" },
      { "id": 7, "resource": "simcards", "action": "edit" },
      { "id": 8, "resource": "simcards", "action": "delete" },
      ...
    ]
  }
]
```

---

## 5. Permission-Protected Endpoints

All resource endpoints now require specific permissions:

### Customers (`/api/customers`)

- **GET /api/customers** - Requires: `customers:view`
- **POST /api/customers** - Requires: `customers:create`
- **PATCH /api/customers/:id** - Requires: `customers:edit`
- **DELETE /api/customers/:id** - Requires: `customers:delete`

### SIM Cards (`/api/simCards`)

- **GET /api/simCards** - Requires: `simcards:view`
- **POST /api/simCards** - Requires: `simcards:create`
- **POST /api/simCards/import** - Requires: `simcards:create`
- **PATCH /api/simCards/:id** - Requires: `simcards:edit`
- **DELETE /api/simCards/:id** - Requires: `simcards:delete`

### SIM Types (`/api/simTypes`)

- **GET /api/simTypes** - Requires: `simtypes:view`
- **POST /api/simTypes** - Requires: `simtypes:create`
- **PATCH /api/simTypes/:id** - Requires: `simtypes:edit`
- **DELETE /api/simTypes/:id** - Requires: `simtypes:delete`

### Transactions (`/api/transactions`)

- **GET /api/transactions** - Requires: `transactions:view`
- **POST /api/transactions** - Requires: `transactions:create`
- **PATCH /api/transactions/:id** - Requires: `transactions:edit`
- **DELETE /api/transactions/:id** - Requires: `transactions:delete`

### Dashboard (`/api/dashboard`)

- **GET /api/dashboard** - Requires: `dashboard:view`

---

## Testing Permission System

### Example 1: Admin Creating a New User

```bash
# 1. Login as admin
curl -X POST http://localhost:3300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Save the access_token from response

# 2. Create a new operator user
curl -X POST http://localhost:3300/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator2",
    "password": "password123",
    "roleId": 2
  }'
```

### Example 2: Operator Trying to Create Customer (Forbidden)

```bash
# 1. Login as operator
curl -X POST http://localhost:3300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"operator123"}'

# 2. Try to create customer (should fail with 403)
curl -X POST http://localhost:3300/api/customers \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "address": "123 Street"
  }'

# Expected response:
# {
#   "statusCode": 403,
#   "message": "You do not have permission to create customers"
# }
```

### Example 3: Operator Viewing and Editing SIM Cards (Allowed)

```bash
# Login as operator first
curl -X POST http://localhost:3300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"operator123"}'

# View SIM cards (allowed)
curl -X GET http://localhost:3300/api/simCards \
  -H "Authorization: Bearer OPERATOR_TOKEN"

# Edit a SIM card (allowed)
curl -X PATCH http://localhost:3300/api/simCards/1 \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### Example 4: Operator Trying to Create Users (Forbidden)

```bash
# Login as operator
curl -X POST http://localhost:3300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"operator123"}'

# Try to create user (should fail)
curl -X POST http://localhost:3300/api/users \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "roleId": 2
  }'

# Expected response:
# {
#   "statusCode": 400,
#   "message": "Only admin can create users"
# }
```

---

## Operator Permissions Summary

Operators can:

- ✅ **View** all resources (customers, simcards, simtypes, transactions, dashboard)
- ✅ **Create** simcards and transactions
- ✅ **Edit** simcards and transactions
- ✅ **Delete** simcards and transactions

Operators cannot:

- ❌ Create, edit, or delete customers
- ❌ Create, edit, or delete simtypes
- ❌ Create, edit, or delete users
- ❌ View or manage users

## Admin Permissions Summary

Admins have **full access** to all resources and all actions.

---

## Error Responses

### 401 Unauthorized (No token or invalid token)

```json
{
  "statusCode": 401,
  "message": "No token provided"
}
```

### 403 Forbidden (Insufficient permissions)

```json
{
  "statusCode": 403,
  "message": "You do not have permission to create customers"
}
```

### 400 Bad Request (Validation error)

```json
{
  "statusCode": 400,
  "message": "Only admin can create users"
}
```

---

## Quick Start Testing

1. **Start the server:**

   ```bash
   npm run start:dev
   ```

2. **Run the permission seed script (if not done):**

   ```bash
   node scripts/seed-permissions.js
   ```

3. **Test admin login and user creation:**
   - Login as admin
   - Create a new operator user
   - Verify the new user can login
   - Test operator permissions

4. **API Documentation:**
   Visit `http://localhost:3300/api/docs` for Swagger documentation
