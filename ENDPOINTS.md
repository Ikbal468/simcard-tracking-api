# 🎯 API Endpoints - Quick Reference

## Base URL

```
http://localhost:3300/api
```

---

## 🔐 Authentication (No Auth Required)

### Login

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

## 👥 Users Management

### 1. Create User (ADMIN ONLY)

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
    "name": "operator"
  }
}
```

**Error (400 - Non-Admin):**

```json
{
  "statusCode": 400,
  "message": "Only admin can create users"
}
```

---

### 2. Get All Users

```http
GET /api/users
Authorization: Bearer <admin_token>
```

**Permission:** `users:view` (Admin only)

---

### 3. Get Available Roles

```http
GET /api/users/roles
Authorization: Bearer <any_token>
```

**Permission:** Any authenticated user

**Response:**

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
    "permissions": [...]
  }
]
```

---

## 🏢 Customers

### Get All Customers

```http
GET /api/customers
Authorization: Bearer <token>
```

**Permission:** `customers:view` (Admin ✅, Operator ✅)

### Create Customer

```http
POST /api/customers
Authorization: Bearer <token>
```

**Permission:** `customers:create` (Admin ✅, Operator ❌)

### Update Customer

```http
PATCH /api/customers/:id
Authorization: Bearer <token>
```

**Permission:** `customers:edit` (Admin ✅, Operator ❌)

### Delete Customer

```http
DELETE /api/customers/:id
Authorization: Bearer <token>
```

**Permission:** `customers:delete` (Admin ✅, Operator ❌)

---

## 📱 SIM Cards

### Get All SIM Cards

```http
GET /api/simCards
Authorization: Bearer <token>
```

**Permission:** `simcards:view` (Admin ✅, Operator ✅)

### Create SIM Card

```http
POST /api/simCards
Authorization: Bearer <token>
```

**Permission:** `simcards:create` (Admin ✅, Operator ✅)

### Import SIM Cards

```http
POST /api/simCards/import
Authorization: Bearer <token>
```

**Permission:** `simcards:create` (Admin ✅, Operator ✅)

### Update SIM Card

```http
PATCH /api/simCards/:id
Authorization: Bearer <token>
```

**Permission:** `simcards:edit` (Admin ✅, Operator ✅)

### Delete SIM Card

```http
DELETE /api/simCards/:id
Authorization: Bearer <token>
```

**Permission:** `simcards:delete` (Admin ✅, Operator ✅)

---

## 📋 SIM Types

### Get All SIM Types

```http
GET /api/simTypes
Authorization: Bearer <token>
```

**Permission:** `simtypes:view` (Admin ✅, Operator ✅)

### Create SIM Type

```http
POST /api/simTypes
Authorization: Bearer <token>
```

**Permission:** `simtypes:create` (Admin ✅, Operator ❌)

### Update SIM Type

```http
PATCH /api/simTypes/:id
Authorization: Bearer <token>
```

**Permission:** `simtypes:edit` (Admin ✅, Operator ❌)

### Delete SIM Type

```http
DELETE /api/simTypes/:id
Authorization: Bearer <token>
```

**Permission:** `simtypes:delete` (Admin ✅, Operator ❌)

---

## 💳 Transactions

### Get All Transactions

```http
GET /api/transactions
Authorization: Bearer <token>
```

**Permission:** `transactions:view` (Admin ✅, Operator ✅)

### Create Transaction

```http
POST /api/transactions
Authorization: Bearer <token>
```

**Permission:** `transactions:create` (Admin ✅, Operator ✅)

### Update Transaction

```http
PATCH /api/transactions/:id
Authorization: Bearer <token>
```

**Permission:** `transactions:edit` (Admin ✅, Operator ✅)

### Delete Transaction

```http
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

**Permission:** `transactions:delete` (Admin ✅, Operator ✅)

---

## 📊 Dashboard

### Get Dashboard Overview

```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Permission:** `dashboard:view` (Admin ✅, Operator ✅)

---

## 🧪 Testing Commands

### Using cURL

**1. Login as Admin:**

```bash
curl -X POST http://localhost:3300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**2. Create New User (Admin):**

```bash
curl -X POST http://localhost:3300/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"operator2","password":"pass123","roleId":2}'
```

**3. Try to Create Customer as Operator (Should Fail):**

```bash
curl -X POST http://localhost:3300/api/customers \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","address":"123 St"}'
```

**4. View SIM Cards as Operator (Should Succeed):**

```bash
curl -X GET http://localhost:3300/api/simCards \
  -H "Authorization: Bearer OPERATOR_TOKEN"
```

---

## ⚡ Quick Test Script

```bash
# Run automated tests
node scripts/test-permissions.js
```

This will test:

- ✅ Admin login
- ✅ Admin creating users
- ✅ Admin accessing all resources
- ✅ Operator login
- ✅ Operator allowed actions (view, edit SIM cards)
- ✅ Operator denied actions (create customers, create users)

---

## 📦 Import Postman Collection

Import `postman-collection.json` into Postman for ready-to-use requests with automatic token management.

---

## 🔑 Error Codes

- **401 Unauthorized**: No token or invalid token
- **403 Forbidden**: Valid token but insufficient permissions
- **400 Bad Request**: Validation error or business rule violation

---

## 📝 Admin vs Operator Summary

| Feature                 | Admin  | Operator |
| ----------------------- | ------ | -------- |
| **Create Users**        | ✅ Yes | ❌ No    |
| **View Customers**      | ✅ Yes | ✅ Yes   |
| **Create Customers**    | ✅ Yes | ❌ No    |
| **Edit Customers**      | ✅ Yes | ❌ No    |
| **Delete Customers**    | ✅ Yes | ❌ No    |
| **View SIM Cards**      | ✅ Yes | ✅ Yes   |
| **Create SIM Cards**    | ✅ Yes | ✅ Yes   |
| **Edit SIM Cards**      | ✅ Yes | ✅ Yes   |
| **Delete SIM Cards**    | ✅ Yes | ✅ Yes   |
| **View SIM Types**      | ✅ Yes | ✅ Yes   |
| **Manage SIM Types**    | ✅ Yes | ❌ No    |
| **View Transactions**   | ✅ Yes | ✅ Yes   |
| **Create Transactions** | ✅ Yes | ✅ Yes   |
| **Edit Transactions**   | ✅ Yes | ✅ Yes   |
| **Delete Transactions** | ✅ Yes | ✅ Yes   |
| **View Dashboard**      | ✅ Yes | ✅ Yes   |
