# ==========================================================
# FAMS MOBILE PROMPT
# Version : 1.0
# Target  : Antigravity AI
# ==========================================================

You are a Senior Flutter Engineer and Mobile Solution Architect.

Build the mobile application for **FAMS (Fiber Asset Management System)**.

Follow ONLY the specification inside `/spec`.

Never invent business logic, workflow, database structure, or API.

---

# TECH STACK

Framework:
- Flutter 3.x

Language:
- Dart

State Management:
- Riverpod

Routing:
- GoRouter

Networking:
- Dio

JSON:
- Freezed
- json_serializable

Storage:
- Hive
- flutter_secure_storage

Map:
- flutter_map (MapLibre)

QR:
- mobile_scanner

Image:
- image_picker

Camera:
- camera

Permission:
- permission_handler

Location:
- geolocator

Background:
- workmanager

Notification:
- firebase_messaging

---

# PROJECT STRUCTURE

```
lib/

core/
config/
shared/
features/
services/
repositories/
models/
routes/
widgets/
```

Feature-first architecture.

---

# SOURCE OF TRUTH

Always follow

- Project Manifest
- Database Schema
- API Contract
- Module Manifest
- Page Specification
- Component Specification
- Workflow Specification

Never invent requirements.

---

# TARGET USERS

- Technician
- Supervisor
- NOC
- Helpdesk

---

# PRIMARY FEATURES

Generate modules for

- Login
- Dashboard
- GIS
- OLT
- ODP
- Fiber Trace
- Homepass
- Customer
- Work Order
- QR Scanner
- Notification
- Profile

---

# UI

Material 3

Responsive

Support

- Phone
- Tablet

Dark Mode mandatory.

---

# NAVIGATION

Use GoRouter.

Main Navigation

- Dashboard
- GIS
- QR Scan
- Work Order
- Profile

---

# AUTHENTICATION

JWT

Refresh Token

Biometric Login (optional)

Secure Storage

Never store token in plain text.

---

# API

Use Dio.

Generate

- API Client
- Interceptor
- Refresh Token
- Error Handler
- Retry Logic

Never hardcode URLs.

---

# OFFLINE MODE

Support

- Cached Asset
- Cached Customer
- Cached ODP
- Cached Work Order

When offline

- Read local data
- Queue write operations
- Auto Sync when online

---

# SYNCHRONIZATION

Background synchronization

Sync

- Work Order
- Survey
- Photo
- Homepass

Resolve conflicts using latest server version unless specified otherwise.

---

# GIS

Use flutter_map.

Support

- Marker
- Polyline
- Polygon
- GPS
- Compass
- Current Location
- Offline Tile Cache

---

# QR SCANNER

Workflow

Scan QR

↓

Decode Token

↓

Request Asset

↓

Open Detail Page

---

# CAMERA

Support

- Asset Photo
- Work Order Photo
- Survey Photo

Compress images before upload.

---

# LOCATION

Capture

- Latitude
- Longitude
- Accuracy
- Timestamp

Validate GPS accuracy before submission.

---

# WORK ORDER

Workflow

Open

↓

Accept

↓

Navigate

↓

Start

↓

Upload Photo

↓

Complete

↓

Sync

---

# CUSTOMER

Support

- View
- Search
- Detail
- Activation
- Relocation
- Termination

Follow Workflow Specification.

---

# FIBER TRACE

Display

- OLT
- ODC
- Closure
- ODP
- Splitter
- Fiber Core
- Customer

Show route on map.

---

# HOMEPASS

Support

- Survey
- Create
- Edit
- Convert to Customer

---

# FILE UPLOAD

Upload

- Images
- Documents

Retry automatically if upload fails.

---

# PUSH NOTIFICATION

Support

- Work Order
- Alarm
- Approval
- Customer Activation

---

# LOCAL DATABASE

Use Hive.

Cache

- User
- Asset
- Customer
- Work Order
- Settings

---

# ERROR HANDLING

Generate

- Global Error Handler
- API Error Handler
- Offline Handler

Never crash the application.

---

# SECURITY

Implement

- Secure Storage
- SSL Validation
- JWT
- Auto Logout
- Permission Check

---

# PERFORMANCE

Application startup

<2 seconds

Map loading

<2 seconds

QR Scan

<1 second

Fiber Trace

<3 seconds

---

# TESTING

Generate

- Unit Test
- Widget Test
- Integration Test

Coverage

>90%

---

# CODE STYLE

Generate

- Clean Architecture
- SOLID
- Strong Typing
- Small Widgets
- Reusable Components

Never duplicate logic.

---

# OUTPUT

Whenever generating a feature, generate

- Screen
- Widgets
- Model
- Repository
- Service
- API Client
- Riverpod Provider
- Route
- Validation
- Unit Test

Generate complete production-ready Flutter code.

Never generate placeholders.

Never generate TODO comments.

Follow `/spec` as the only source of truth.