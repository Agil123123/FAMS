# ==========================================================
# FAMS FRONTEND PROMPT
# Version : 1.0
# Target  : Antigravity AI
# ==========================================================

You are a Senior Frontend Engineer.

Build the frontend of **FAMS (Fiber Asset Management System)** based ONLY on the specification inside `/spec`.

Do not invent requirements.

---

# TECH STACK

Framework:
- Next.js 15 (App Router)
- TypeScript

UI:
- shadcn/ui
- TailwindCSS
- Lucide Icons

State:
- Zustand

Data Fetching:
- TanStack Query

Table:
- TanStack Table

Forms:
- React Hook Form
- Zod

Map:
- MapLibre GL

Chart:
- Recharts

Authentication:
- JWT

---

# PROJECT STRUCTURE

```
src/

app/
components/
features/
hooks/
lib/
services/
store/
types/
utils/
```

Feature-first architecture.

---

# PAGE RULES

Generate pages exactly as defined in:

Page Specification

Each page must include:

- Loading State
- Empty State
- Error State
- Permission Guard
- Breadcrumb
- Page Title

---

# COMPONENT RULES

Only use reusable components.

Never duplicate UI.

Components must be placed inside

```
components/
```

or

```
features/{module}
```

---

# TABLE RULES

Every table must support

- Search
- Filter
- Sorting
- Pagination
- Export
- Column Visibility
- Row Action

Use TanStack Table.

---

# FORM RULES

Every form must include

- React Hook Form
- Zod Validation
- Required Indicator
- Client Validation
- Server Validation
- Loading Submit
- Success Toast
- Error Toast

---

# MAP RULES

Use MapLibre.

Support:

- Marker
- Polyline
- Polygon
- Cluster
- Layer
- Fullscreen
- Coordinate Display
- Asset Popup

Never use Google Maps.

---

# API RULES

Never hardcode data.

Consume REST API defined inside API Contract.

Use TanStack Query.

Create:

```
services/
```

for every API.

---

# STATE MANAGEMENT

Use Zustand only for

- Authentication
- Sidebar
- Theme
- Global Filter
- Selected Asset
- Selected Customer

Do not use Zustand for server data.

---

# DARK MODE

Support Dark Mode.

Use next-themes.

Never hardcode colors.

Use Tailwind variables.

---

# RESPONSIVE

Support

- Desktop
- Tablet
- Mobile

Mobile First.

---

# ACCESSIBILITY

Generate

- aria-label
- keyboard navigation
- focus state
- screen reader support

---

# ICON

Only use

Lucide Icons.

---

# FILE NAMING

Use

PascalCase

Example

```
CustomerTable.tsx
ODPCard.tsx
FiberTraceMap.tsx
```

---

# ROUTING

Use

App Router

Every page inside

```
app/
```

---

# LOADING

Generate

loading.tsx

for every page.

---

# ERROR

Generate

error.tsx

for every page.

---

# NOT FOUND

Generate

not-found.tsx

when applicable.

---

# TYPES

Generate

TypeScript interfaces

from Database Schema.

Never use any.

---

# CODE STYLE

Generate

- Small Components
- Strong Typing
- Clean Code
- Reusable Hooks

Never duplicate code.

---

# OUTPUT

Whenever generating a page, always generate

- Page
- Components
- Hooks
- API Service
- Types
- Validation
- Loading
- Error
- Permission Guard

Generate complete production-ready code.

Never generate placeholders.

Never generate TODO comments.

Never generate mock data unless explicitly requested.