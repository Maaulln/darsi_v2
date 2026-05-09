# 📚 DARSI Superadmin API Documentation

## Base URL
```
http://localhost:8000/api/superadmin
```

---

## 🔐 Authentication Endpoints

### POST /login
**Login superadmin user**

**Request:**
```json
{
  "email": "admin@darsi.local",
  "password": "Admin@12345"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "user": {
    "id": "users:xxx",
    "email": "admin@darsi.local",
    "role": "superadmin"
  }
}
```

**Response (Error):**
```json
{
  "detail": "Email atau password salah"
}
```

---

## ⚙️ Configuration Management

### GET /config
**Retrieve all API configurations**

**Response:**
```json
{
  "status": "success",
  "data": {
    "api_title": "DARSI SIMRS",
    "api_version": "2.0",
    "maintenance_mode": false,
    "enable_auth": true,
    "log_level": "INFO"
  }
}
```

---

### GET /config/{key}
**Retrieve specific configuration**

**Path Parameters:**
- `key` (string) - Configuration key name

**Example:**
```
GET /config/api_title
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "api_config:api_title",
    "key": "api_title",
    "value": "DARSI SIMRS",
    "updated_by": "admin@darsi.local",
    "updated_at": "2026-05-06T10:30:00Z"
  }
}
```

---

### POST /config
**Create new configuration**

**Request Body:**
```json
{
  "key": "enable_notifications",
  "value": true
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Konfigurasi baru berhasil dibuat",
  "data": {
    "id": "api_config:enable_notifications",
    "key": "enable_notifications",
    "value": true,
    "updated_by": "admin@darsi.local",
    "updated_at": "2026-05-06T10:31:00Z"
  }
}
```

---

### PUT /config/{key}
**Update existing configuration**

**Path Parameters:**
- `key` (string) - Configuration key name

**Request Body:**
```json
{
  "value": "DARSI SIMRS v2.1"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Konfigurasi 'api_title' berhasil diupdate",
  "data": {
    "id": "api_config:api_title",
    "key": "api_title",
    "value": "DARSI SIMRS v2.1",
    "updated_by": "admin@darsi.local",
    "updated_at": "2026-05-06T10:32:00Z"
  }
}
```

---

### DELETE /config/{key}
**Delete configuration**

**Path Parameters:**
- `key` (string) - Configuration key name

**Response:**
```json
{
  "status": "success",
  "message": "Konfigurasi 'enable_notifications' berhasil dihapus"
}
```

---

## 👥 Users Management

### GET /users
**Retrieve all users**

**Query Parameters:**
- None

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "users:xxx1",
      "email": "admin@darsi.local",
      "role": "superadmin",
      "is_active": true,
      "created_at": "2026-05-06T08:00:00Z"
    },
    {
      "id": "users:xxx2",
      "email": "doctor@darsi.local",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-05-06T09:00:00Z"
    }
  ]
}
```

---

### POST /users
**Create new user**

**Request Body:**
```json
{
  "email": "newuser@darsi.local",
  "password": "SecurePassword123",
  "role": "admin"
}
```

**Valid Roles:**
- `user` - Regular user
- `admin` - Administrator
- `superadmin` - Super administrator

**Response:**
```json
{
  "status": "success",
  "message": "Pengguna baru berhasil dibuat",
  "data": {
    "id": "users:xxx3",
    "email": "newuser@darsi.local",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-05-06T10:35:00Z"
  }
}
```

**Error Response:**
```json
{
  "detail": "Email sudah terdaftar"
}
```

---

### PUT /users/{user_id}
**Update user information**

**Path Parameters:**
- `user_id` (string) - User ID

**Request Body:**
```json
{
  "email": "updated@darsi.local",
  "role": "superadmin",
  "is_active": false
}
```

**Allowed Fields:**
- `email` - User email
- `role` - User role
- `is_active` - Active status

**Response:**
```json
{
  "status": "success",
  "message": "Pengguna berhasil diupdate",
  "data": {
    "id": "users:xxx3",
    "email": "updated@darsi.local",
    "role": "superadmin",
    "is_active": false,
    "created_at": "2026-05-06T10:35:00Z"
  }
}
```

---

### DELETE /users/{user_id}
**Delete user**

**Path Parameters:**
- `user_id` (string) - User ID

**Response:**
```json
{
  "status": "success",
  "message": "Pengguna berhasil dihapus"
}
```

---

## 📝 Audit Logs

### GET /audit-logs
**Retrieve audit logs**

**Query Parameters:**
- `limit` (integer, optional) - Number of logs to retrieve (default: 100)

**Example:**
```
GET /audit-logs?limit=50
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "audit_logs:xxx1",
      "user_id": "superadmin",
      "action": "CREATE_USER",
      "resource": "users:newuser@darsi.local",
      "details": {
        "email": "newuser@darsi.local",
        "role": "admin"
      },
      "created_at": "2026-05-06T10:35:00Z"
    },
    {
      "id": "audit_logs:xxx2",
      "user_id": "superadmin",
      "action": "UPDATE_CONFIG",
      "resource": "api_config:api_title",
      "details": {
        "old_value": "DARSI SIMRS",
        "new_value": "DARSI SIMRS v2.1"
      },
      "created_at": "2026-05-06T10:32:00Z"
    }
  ],
  "total": 2
}
```

**Available Actions:**
- `LOGIN` - User login
- `CREATE_USER` - User creation
- `UPDATE_USER` - User update
- `DELETE_USER` - User deletion
- `CREATE_CONFIG` - Configuration creation
- `UPDATE_CONFIG` - Configuration update
- `DELETE_CONFIG` - Configuration deletion

---

## 📊 Dashboard Statistics

### GET /dashboard-stats
**Retrieve dashboard statistics**

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_users": 5,
    "total_patients": 234,
    "total_configs": 8,
    "total_logs": 142,
    "recent_logs": [
      {
        "id": "audit_logs:xxx1",
        "user_id": "superadmin",
        "action": "LOGIN",
        "resource": "auth",
        "details": {
          "email": "admin@darsi.local"
        },
        "created_at": "2026-05-06T10:40:00Z"
      }
    ]
  }
}
```

---

## 🏥 Health Check

### GET /health
**Check superadmin API health**

**Response:**
```json
{
  "status": "ok",
  "module": "superadmin",
  "version": "2.0"
}
```

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Authentication failed |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error |

---

## Error Handling

All errors return a standard format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## cURL Examples

### Login
```bash
curl -X POST http://localhost:8000/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@darsi.local",
    "password": "Admin@12345"
  }'
```

### Get All Configurations
```bash
curl http://localhost:8000/api/superadmin/config
```

### Create New Configuration
```bash
curl -X POST http://localhost:8000/api/superadmin/config \
  -H "Content-Type: application/json" \
  -d '{
    "key": "max_patients",
    "value": 1000
  }'
```

### Get All Users
```bash
curl http://localhost:8000/api/superadmin/users
```

### Create New User
```bash
curl -X POST http://localhost:8000/api/superadmin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "SecurePass123",
    "role": "admin"
  }'
```

### Get Audit Logs (last 50)
```bash
curl "http://localhost:8000/api/superadmin/audit-logs?limit=50"
```

### Get Dashboard Stats
```bash
curl http://localhost:8000/api/superadmin/dashboard-stats
```

---

## Postman Collection

Import this as Postman collection:

```json
{
  "info": {
    "name": "DARSI Superadmin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/superadmin/login",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "raw": "{\"email\": \"admin@darsi.local\", \"password\": \"Admin@12345\"}"
        }
      }
    },
    {
      "name": "Get All Configs",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/superadmin/config"
      }
    },
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/superadmin/users"
      }
    }
  ]
}
```

---

## Rate Limiting
Currently, no rate limiting is implemented. In production, consider implementing:
- API key authentication
- Rate limiting per user
- IP-based throttling

---

## Security Notes
⚠️ **Important for Production:**
- Change default superadmin password immediately
- Use strong, unique passwords
- Implement JWT token-based authentication
- Use HTTPS instead of HTTP
- Add request validation
- Implement CORS restrictions
- Add audit log retention policies
- Enable database backups
- Use environment variables for secrets

---

**Last Updated:** May 6, 2026
**API Version:** 2.0.0
**Database:** SurrealDB
