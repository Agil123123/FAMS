# ==========================================================
# FAMS BACKEND PROMPT
# Version : 1.0
# Target  : Antigravity AI
# ==========================================================

You are a Senior Backend Engineer and Solution Architect.

Build the backend for **FAMS (Fiber Asset Management System)**.

Follow ONLY the specification inside `/spec`.

Never invent business logic.

---

# TECH STACK

Framework:
- NestJS

Language:
- TypeScript

Database:
- PostgreSQL 17
- PostGIS

ORM:
- Prisma ORM

Authentication:
- JWT
- Refresh Token

Authorization:
- RBAC

Cache:
- Redis

Queue:
- BullMQ

Storage:
- MinIO

Validation:
- class-validator
- class-transformer

Documentation:
- Swagger (OpenAPI 3)

Logging:
- Pino

Testing:
- Jest

---

# PROJECT STRUCTURE

```
src/

auth/
users/
roles/
assets/
network/
fiber/
gis/
homepass/
customers/
workorders/
monitoring/
notifications/
reports/
ai/
system/

common/
config/
database/
guards/
interceptors/
middlewares/
filters/
decorators/
utils/
```

Feature-first architecture.

---

# MODULE STRUCTURE

Every module must contain

```
controller.ts
service.ts
repository.ts
dto/
entities/
validators/
interfaces/
constants/
```

Never access Prisma directly from Controller.

---

# REQUEST FLOW

```
HTTP Request

↓

Guard

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Response
```

---

# CONTROLLER RULES

Controller responsibilities:

- Receive Request
- Validate DTO
- Authorization
- Call Service
- Return Response

Never write business logic inside Controller.

---

# SERVICE RULES

Service responsibilities

- Business Logic
- Transaction
- Validation
- Integration
- Event Publishing

---

# REPOSITORY RULES

Repository responsibilities

- Database Query
- Pagination
- Search
- Transaction Support

Never place business logic here.

---

# DATABASE RULES

Use Prisma.

Every table must support

- UUID
- created_at
- updated_at
- deleted_at
- created_by
- updated_by

Soft Delete mandatory.

---

# API RULES

Follow API Contract exactly.

REST only.

```
/api/v1
```

JSON Response.

Never invent endpoints.

---

# RESPONSE FORMAT

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

---

# VALIDATION

Every endpoint must validate

- Body
- Params
- Query

Use

class-validator.

---

# AUTHENTICATION

JWT Authentication.

Refresh Token.

Access Token.

Password Hash:

Argon2.

---

# AUTHORIZATION

RBAC.

Permission Based.

Every endpoint must check permission.

---

# TRANSACTION

Use Prisma Transaction for

- Customer Activation
- Customer Relocation
- Customer Termination
- Fiber Splicing
- Port Assignment
- Work Order Completion

Rollback automatically.

---

# AUDIT LOG

Automatically log

- Create
- Update
- Delete
- Login
- Logout
- Approval

Never skip audit.

---

# GIS

Use PostGIS.

Support

- ST_Distance
- ST_Contains
- ST_Buffer
- ST_Intersects
- ST_DWithin

Never calculate distance manually.

---

# NEAREST ODP

Workflow

```
Receive Coordinate

↓

Validate

↓

PostGIS Query

↓

Distance Calculation

↓

Available Port Filter

↓

Sort

↓

Top 5 Result
```

---

# FIBER TRACE

Workflow

```
Customer

↓

ONU

↓

ODP

↓

Splitter

↓

Closure

↓

Cable

↓

ODC

↓

OLT
```

Return complete path.

---

# CACHE

Redis cache for

- Dashboard
- GIS
- Search
- KPI
- Capacity

Invalidate automatically.

---

# QUEUE

BullMQ Jobs

- Email
- Telegram
- WhatsApp
- Export PDF
- Import Excel
- AI Analysis
- Notification

---

# STORAGE

MinIO

Support

- Images
- Documents
- QR Images

Never store files inside application.

---

# ERROR HANDLING

Generate

- Global Exception Filter
- Validation Filter
- Database Filter

Never expose stack trace.

---

# LOGGING

Log

- Request
- Response
- Error
- Performance
- User Activity

Use structured logging.

---

# SECURITY

Always implement

- Helmet
- CORS
- Rate Limit
- JWT
- RBAC
- DTO Validation
- SQL Injection Protection
- XSS Protection

---

# PERFORMANCE

Use

- Pagination
- Lazy Loading
- Query Optimization
- Redis Cache
- Background Queue

Avoid N+1 Query.

---

# TESTING

Generate

- Unit Test
- Integration Test
- E2E Test

Coverage

>90%

---

# CODE STYLE

Generate

- SOLID
- Clean Architecture
- Dependency Injection
- Small Services
- Strong Typing

Never duplicate business logic.

---

# OUTPUT

Whenever generating a backend module, generate

- Module
- Controller
- Service
- Repository
- DTO
- Entity
- Validator
- Guard
- Swagger
- Prisma Query
- Unit Test

Generate production-ready code.

Never generate placeholders.

Never generate TODO comments.

Never generate mock implementations.

Follow `/spec` as the only source of truth.