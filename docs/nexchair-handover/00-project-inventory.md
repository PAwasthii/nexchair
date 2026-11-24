# NexChair — Stage 1 Project Inventory

**Document type:** Technical inventory and developer handover reference  
**Stage:** 1 of N — Repository discovery and audit  
**Date:** 2026-11-24  
**Source of truth:** Repository at `C:\Users\Pragya Awasthi\OneDrive\Desktop\IG1\nexchair`  
**Status labels used:** IMPLEMENTED · PARTIALLY IMPLEMENTED · UNVERIFIED · UNUSED/LEGACY · PENDING

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Actual Technology Stack](#2-actual-technology-stack)
3. [Repository Folder Structure](#3-repository-folder-structure)
4. [Public Route Inventory](#4-public-route-inventory)
5. [Admin Route Inventory](#5-admin-route-inventory)
6. [API and Server-Action Inventory](#6-api-and-server-action-inventory)
7. [Component Architecture](#7-component-architecture)
8. [Database Overview](#8-database-overview)
9. [Asset and Image Inventory](#9-asset-and-image-inventory)
10. [Third-Party Integration Inventory](#10-third-party-integration-inventory)
11. [Test and Build Configuration](#11-test-and-build-configuration)
12. [Existing Documentation Inventory](#12-existing-documentation-inventory)
13. [Implementation Status Observations](#13-implementation-status-observations)
14. [Unverified Items and Information Gaps](#14-unverified-items-and-information-gaps)
15. [Proposed Documentation Roadmap](#15-proposed-documentation-roadmap)

---

## 1. Project Overview

NexChair is a B2B/B2C ergonomic office chair brand based in Pune, India. The website serves as the primary product catalogue and lead-capture channel. It is built as a Next.js application with a full-stack architecture: a public-facing website, a private admin portal, a PostgreSQL database managed via Prisma ORM, and several third-party integrations for image hosting, email, analytics, and lead capture.

The production domain is `https://www.nexchair.in` (confirmed in `app/sitemap.ts`).

**Primary business functions:**
- Display the product catalogue (categories, individual products, specifications).
- Capture enquiries — contact, quote request, and product order — via web forms.
- Notify the sales team by email and log leads to Google Sheets.
- Provide an admin portal for managing products, categories, catalogues, and enquiries.

**Current maturity:** The website is live and functional. Product data is seeded from a database import (40 products, 31 images per memory notes). Certain features are placeholder or pending (admin settings page, some spec/dimension data for products).

---

## 2. Actual Technology Stack

### 2.1 Frontend

| Concern | Technology | Version | Source |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.3.8 | `package.json` |
| UI library | React | 19.2.8 | `package.json` |
| Language | TypeScript | ^5 | `package.json` |
| CSS framework | Tailwind CSS | ^4 | `package.json` |
| PostCSS integration | @tailwindcss/postcss | ^4 | `package.json` |
| Fonts | Plus Jakarta Sans, Cormorant Garamond (Google Fonts via `next/font`) | — | `app/layout.tsx` |
| Analytics | Google Tag Manager (ID: GTM-TB368V3C) | — | `app/layout.tsx` |
| Routing | App Router (`app/` directory) | — | Confirmed |
| Form handling | Uncontrolled HTML forms + Server Actions | — | `app/actions/` |
| State management | None (server components + minimal client state) | — | Confirmed |
| Client-side validation | Minimal — primarily server-side | — | `app/actions/enquiries.ts` |
| Image optimisation | `next/image` with Cloudinary remote patterns | — | `next.config.ts` |
| Video | HTML `<video>` with local MP4 files | — | `public/` |

**Node.js requirement:** `>=22.12.0` (`package.json` `engines` field).

### 2.2 Backend

| Concern | Technology | Notes |
|---|---|---|
| Server architecture | Next.js App Router (Server Components + Server Actions) | No separate API layer |
| API routes | None implemented | `app/api/` directory exists but is empty |
| Server Actions | Yes — `"use server"` files in `app/actions/` | Main backend entrypoints |
| Database client | Prisma ORM (`@prisma/client`) | v7.10.0 |
| Database adapter | `@prisma/adapter-pg` (pg pool) | Configured in `lib/prisma.ts` |
| Authentication | Custom JWT (jose library) stored in httpOnly cookie | `lib/auth/admin.ts` |
| Password hashing | bcryptjs | Admin login only |
| Rate limiting | @upstash/ratelimit + @upstash/redis | `lib/ratelimit.ts` |
| Email | Nodemailer (SMTP) | `lib/email.ts` |
| File storage — images | Cloudinary v2 | `lib/storage.ts` |
| File storage — PDFs | Vercel Blob | `lib/storage.ts` |
| Lead capture | Google Sheets API (service account JWT) | `lib/sheets.ts` |
| Validation | Manual regex + length checks in server actions | No schema library (e.g., Zod) |

### 2.3 Database

| Concern | Detail |
|---|---|
| Provider | PostgreSQL |
| ORM | Prisma 7.10.0 |
| Adapter package | `@prisma/adapter-pg` with `pg` pool |
| Generated client output | `generated/prisma/` |
| Schema file | `prisma/schema.prisma` |

### 2.4 Hosting and External Services

| Service | Purpose | Status |
|---|---|---|
| Vercel | Hosting and deployment | UNVERIFIED (inferred from `@vercel/blob`, `eslint-config-next`, `next start` script) |
| Cloudinary | Product and category image CDN | IMPLEMENTED |
| Vercel Blob | PDF file storage (spec sheets, catalogues) | IMPLEMENTED |
| Upstash Redis | Rate limiting backing store | IMPLEMENTED |
| Google Sheets | Enquiry lead capture | IMPLEMENTED |
| Google Tag Manager | Analytics event collection | IMPLEMENTED |
| SMTP provider | Transactional email | PARTIALLY IMPLEMENTED (provider unverified — env vars only) |
| GitHub | Source control | UNVERIFIED (no remote confirmed from repo) |

---

## 3. Repository Folder Structure

```
nexchair/
├── app/                          # Next.js App Router — pages, layouts, actions
│   ├── actions/                  # Server Actions ("use server")
│   │   ├── __tests__/            # Vitest test files for actions
│   │   ├── admin-auth.ts
│   │   ├── admin-catalogues.ts
│   │   ├── admin-categories.ts
│   │   ├── admin-enquiries.ts
│   │   ├── admin-products.ts
│   │   └── enquiries.ts
│   ├── admin/
│   │   ├── (protected)/          # Route group: session-guarded admin pages
│   │   │   ├── layout.tsx        # Applies AdminShell + session check
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── catalogues/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── enquiries/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── login/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── product-range/page.tsx
│   ├── products/[slug]/
│   │   ├── page.tsx
│   │   └── order/page.tsx
│   ├── specifications/page.tsx
│   ├── globals.css
│   ├── icon.png
│   ├── layout.tsx                # Root layout (fonts, GTM, global nav)
│   ├── page.tsx                  # Homepage
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/                   # Reusable React components
│   ├── admin/                    # Admin-only components
│   ├── contact/
│   ├── home/
│   ├── order/
│   ├── product-detail/
│   ├── product-range/
│   ├── specifications/
│   ├── AnnouncementBar.tsx
│   ├── CompanyStats.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ProductCard.tsx
│
├── lib/                          # Backend utilities (server-only)
│   ├── __tests__/
│   ├── auth/admin.ts
│   ├── cloudinary.ts
│   ├── email.ts
│   ├── prisma.ts
│   ├── ratelimit.ts
│   ├── sheets.ts
│   ├── site.ts
│   └── storage.ts
│
├── types/
│   └── product.ts                # Legacy Product type (pre-database)
│
├── data/
│   └── products.ts               # Legacy static product data (pre-database)
│
├── prisma/
│   └── schema.prisma
│
├── generated/
│   └── prisma/                   # Prisma generated client output
│
├── scripts/                      # One-off admin/maintenance scripts (tsx)
│   ├── create-admin.ts
│   ├── fix-sheet-headers.ts
│   ├── import-archive.ts
│   ├── merge-excel-specs.ts
│   └── update-images.ts
│
├── public/                       # Static assets served at /
│   ├── images/
│   │   ├── principle/
│   │   └── site/
│   ├── home-page-vid.mp4
│   ├── home-page-vid2.mp4
│   └── *.svg
│
├── info/                         # Design screenshots (not served)
│
├── docs/                         # Documentation (this file)
│
├── next.config.ts
├── package.json
├── prisma.config.ts
├── postcss.config.mjs
├── tailwind.config (via postcss)
├── tsconfig.json
├── vitest.config.mts
├── eslint.config.mjs
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── chair specifications.xlsx     # Source data (not served)
├── Nex chair images.xlsx         # Source data (not served)
└── NexChair_Product_Archive.zip  # Archive used for initial import (not served)
```

---

## 4. Public Route Inventory

| Route | File | Type | Key Components | Auth Required | Data Source |
|---|---|---|---|---|---|
| `/` | `app/page.tsx` | Server Component, `force-dynamic` | Hero, CategorySection, SpecificationFilter, IKEAFeature, HomeBottomCTA | No | Prisma (via child components) |
| `/product-range` | `app/product-range/page.tsx` | Server Component, `force-dynamic` | ProductFilters, ProductGrid, ProductRangeHeader, ProductRangeCTA | No | Prisma |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | Server Component (dynamic) | ProductGallery, ProductComparison | No | Prisma — `product.findUnique({ slug, isActive: true })` + similar products |
| `/products/[slug]/order` | `app/products/[slug]/order/page.tsx` | Server Component (dynamic) | OrderEnquiryForm | No | Prisma (product data) |
| `/about` | `app/about/page.tsx` | Server Component | (inline — no major shared components) | No | Static |
| `/contact` | `app/contact/page.tsx` | Server Component | ContactQuoteForm | No | Static + `lib/site.ts` |
| `/specifications` | `app/specifications/page.tsx` | Server Component | SpecGallery | No | Prisma (spec sheets) |
| `/sitemap.xml` | `app/sitemap.ts` | Next.js sitemap handler | — | No | Prisma — active products |
| `/robots.txt` | `app/robots.ts` | Next.js robots handler | — | No | Static |

**Root layout components** (applied to all public routes via `app/layout.tsx`):
- `AnnouncementBar` — top banner
- `Navbar` — sticky navigation header
- `Footer` — multi-column footer

**Note on `force-dynamic`:** Both `/` and `/product-range` are marked `export const dynamic = "force-dynamic"`. This disables static generation and ISR for these pages — every request hits the database. This was likely set to prevent stale product data, but has performance implications at scale.

---

## 5. Admin Route Inventory

All admin routes under `app/admin/(protected)/` are wrapped by `app/admin/(protected)/layout.tsx`, which calls `requireAdminSession()`. An unauthenticated request is redirected to `/admin/login`.

| Route | File | Type | Key Components | Auth Required | Data Source |
|---|---|---|---|---|---|
| `/admin/login` | `app/admin/login/page.tsx` | Client Component | (inline form) | No | — |
| `/admin` (dashboard) | `app/admin/(protected)/page.tsx` | Server Component | StatCard (inline) | Yes | Prisma — counts for products, categories, new enquiries |
| `/admin/products` | `app/admin/(protected)/products/page.tsx` | Server Component | ProductManager | Yes | Prisma |
| `/admin/categories` | `app/admin/(protected)/categories/page.tsx` | Server Component | CategoryManager | Yes | Prisma |
| `/admin/enquiries` | `app/admin/(protected)/enquiries/page.tsx` | Server Component | EnquiryList | Yes | Prisma |
| `/admin/enquiries/[id]` | `app/admin/(protected)/enquiries/[id]/page.tsx` | Server Component | EnquiryStatusForm, EnquiryNotesForm | Yes | Prisma — single enquiry + items |
| `/admin/catalogues` | `app/admin/(protected)/catalogues/page.tsx` | Server Component | CatalogueManager | Yes | Prisma + Vercel Blob |
| `/admin/settings` | `app/admin/(protected)/settings/page.tsx` | Server Component | (placeholder) | Yes | — |

**Admin session mechanism:** Custom JWT (`jose`, HS256) stored in an httpOnly cookie named `nexchair_admin_session`. Cookie lifetime is 7 days. Signing secret is `ADMIN_SESSION_SECRET`.

**Admin settings page:** Currently renders a "Settings coming soon" placeholder. No functional content.

---

## 6. API and Server-Action Inventory

### 6.1 API Routes

There are **no implemented API route handlers**. The `app/api/` directory exists but contains no `route.ts` files.

### 6.2 Server Actions

All server actions are in `app/actions/`. Each file has `"use server"` at the top.

#### `app/actions/enquiries.ts`

| Function | Purpose | Called From |
|---|---|---|
| `createEnquiry(input: CreateEnquiryInput)` | Validates, persists enquiry + items, fires email and Google Sheets | Contact form, Quote form, Order form |

**Flow:**
1. `checkEnquiryRateLimit()` — 5 per 10 min per IP, **fail-open**
2. Input validation (type, name, email/phone, message length ≤ 2000, items ≤ 50, quantities ≥ 1)
3. Product ID verification (active products only)
4. `prisma.enquiry.create(...)` with nested `EnquiryItem` creation
5. `Promise.allSettled([ sendEnquiryEmails(...), appendEnquiryToSheet(...) ])` — both fire-and-forget; failures are logged but do not affect the user response
6. Returns `{ success, message, enquiryId? }`

**Type:** `CreateEnquiryInput` — all fields except `type`, `name`, and one of `email`/`phone` are optional.

#### `app/actions/admin-auth.ts`

| Function | Purpose |
|---|---|
| `signInAdmin(formData)` | Looks up admin by email, verifies bcrypt password, creates JWT session cookie |
| `signOutAdmin()` | Clears session cookie, redirects to `/admin/login` |

**Rate limit:** `checkLoginRateLimit(email)` — 5 per 15 min per IP+email, **fail-closed** (blocks if Upstash is not configured in production).

#### `app/actions/admin-products.ts`

Manages product CRUD. Functions include create, update, delete product records, and image management via `lib/storage.ts`. File is large (~1500 lines estimated by exploration agent). Exports: `ProductRow`, `ProductImageRow`, `ProductActionState`.

#### `app/actions/admin-categories.ts`

Category CRUD. Upload/delete category images via Cloudinary through `lib/storage.ts`.

#### `app/actions/admin-enquiries.ts`

| Function | Purpose |
|---|---|
| `getEnquiries(opts)` | Paginated list (20/page) with optional status/type/search filter |
| `updateEnquiryStatus(id, status)` | Change `EnquiryStatus` on an Enquiry |
| `updateEnquiryNotes(id, notes)` | Update `adminNotes` field |

**Types:** `EnquiryListItem`, `EnquiryDetail`

#### `app/actions/admin-catalogues.ts`

Catalogue PDF upload and management via Vercel Blob through `lib/storage.ts`.

---

## 7. Component Architecture

### 7.1 Global / Layout Components

| Component | File | Type | Shared Across |
|---|---|---|---|
| `AnnouncementBar` | `components/AnnouncementBar.tsx` | Server | All public pages (root layout) |
| `Navbar` | `components/Navbar.tsx` | Client | All public pages (root layout) |
| `Footer` | `components/Footer.tsx` | Server | All public pages (root layout) |
| `ProductCard` | `components/ProductCard.tsx` | Server | Product range, category sections |
| `CompanyStats` | `components/CompanyStats.tsx` | — | Usage not confirmed in page files read |

### 7.2 Homepage Components (`components/home/`)

| Component | File | Purpose |
|---|---|---|
| `Hero` | `home/Hero.tsx` | Full-width hero with video background |
| `CategorySection` | `home/CategorySection.tsx` | Product category showcase grid |
| `SpecificationFilter` | `home/SpecificationFilter.tsx` | Spec-based product discovery filter |
| `IKEAFeature` | `home/IKEAFeature.tsx` | Brand story / IKEA-style feature section |
| `HomeBottomCTA` | `home/HomeBottomCTA.tsx` | Bottom call-to-action section |
| `Bestsellers` | `home/Bestsellers.tsx` | Best-selling products (not used in current `app/page.tsx`) |
| `ProductShowcase` | `home/ProductShowcase.tsx` | Featured products (not used in current `app/page.tsx`) |
| `QuoteForm` | `home/QuoteForm.tsx` | Quote form (not used in current `app/page.tsx`) |
| `QuoteSection` | `home/QuoteSection.tsx` | Quote section wrapper (not used in current `app/page.tsx`) |
| `WhyNexChair` | `home/WhyNexChair.tsx` | Value proposition (not used in current `app/page.tsx`) |
| `SpecsHighlights` | `home/SpecsHighlights.tsx` | Specs section — **commented out in `app/page.tsx`** |

**Note:** `Bestsellers`, `ProductShowcase`, `QuoteForm`, `QuoteSection`, `WhyNexChair`, and `SpecsHighlights` exist in the `components/home/` directory but are not currently imported or rendered on the homepage. Their current status (unused, in development, or intentionally removed) is not evident from the code alone.

### 7.3 Product Detail Components (`components/product-detail/`)

| Component | File | Purpose |
|---|---|---|
| `ProductGallery` | `product-detail/ProductGallery.tsx` | Image gallery with thumbnail navigation |
| `ProductComparison` | `product-detail/ProductComparison.tsx` | Side-by-side comparison with similar products |

### 7.4 Product Range Components (`components/product-range/`)

| Component | File | Purpose |
|---|---|---|
| `ProductFilters` | `product-range/ProductFilters.tsx` | Client-side category and spec filtering |
| `ProductGrid` | `product-range/ProductGrid.tsx` | Responsive product card grid |
| `ProductRangeHeader` | `product-range/ProductRangeHeader.tsx` | Page title and description |
| `ProductRangeCTA` | `product-range/ProductRangeCTA.tsx` | Call-to-action section |

### 7.5 Contact Components (`components/contact/`)

| Component | File | Purpose |
|---|---|---|
| `ContactQuoteForm` | `contact/ContactQuoteForm.tsx` | Contact/quote enquiry form (used on `/contact`) |
| `ContactEnquiryForm` | `contact/ContactEnquiryForm.tsx` | Alternative contact form variant |

**Note:** Both `ContactQuoteForm` and `ContactEnquiryForm` exist. Only `ContactQuoteForm` is confirmed as used in `app/contact/page.tsx`. The purpose and usage of `ContactEnquiryForm` requires further investigation.

### 7.6 Order Components (`components/order/`)

| Component | File | Purpose |
|---|---|---|
| `OrderEnquiryForm` | `order/OrderEnquiryForm.tsx` | Order/enquiry form on `/products/[slug]/order` |

### 7.7 Specifications Components (`components/specifications/`)

| Component | File | Purpose |
|---|---|---|
| `SpecGallery` | `specifications/SpecGallery.tsx` | Spec sheet gallery/viewer |

### 7.8 Admin Components (`components/admin/`)

| Component | File | Purpose |
|---|---|---|
| `AdminShell` | `admin/AdminShell.tsx` | Admin layout wrapper — sidebar navigation + main content area |
| `ProductManager` | `admin/ProductManager.tsx` | Product list, search, and CRUD actions |
| `ProductForm` | `admin/ProductForm.tsx` | Create/edit product form |
| `ProductImageManager` | `admin/ProductImageManager.tsx` | Image upload, reorder, and delete for a product |
| `CategoryManager` | `admin/CategoryManager.tsx` | Category list and CRUD |
| `CategoryForm` | `admin/CategoryForm.tsx` | Create/edit category form |
| `CatalogueManager` | `admin/CatalogueManager.tsx` | PDF catalogue upload and management |
| `EnquiryList` | `admin/EnquiryList.tsx` | Paginated enquiry table with status/type filter |
| `EnquiryStatusForm` | `admin/EnquiryStatusForm.tsx` | Inline status change form on enquiry detail |
| `EnquiryNotesForm` | `admin/EnquiryNotesForm.tsx` | Admin notes textarea on enquiry detail |
| `LogoutButton` | `admin/LogoutButton.tsx` | Calls `signOutAdmin()` server action |

---

## 8. Database Overview

### 8.1 Connection

- **Provider:** PostgreSQL
- **Connection:** `DATABASE_URL` environment variable
- **Client:** Prisma v7.10.0 with `@prisma/adapter-pg` and `pg` pool
- **SSL:** `rejectUnauthorized: true` (configured in `lib/prisma.ts`)
- **Generated client output:** `generated/prisma/`
- **Prisma config:** `prisma.config.ts` at root

### 8.2 Models

#### `AdminUser`
Stores admin portal users. Passwords are hashed with bcryptjs.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | |
| `email` | String | Unique |
| `password` | String | bcrypt hash |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | Auto-updated |

#### `Category`
Product categories shown on the website.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Display name |
| `slug` | String | Unique; used in URLs |
| `description` | String? | Optional |
| `imageKey` | String? | Cloudinary URL |
| `imagePublicId` | String? | Cloudinary public_id for deletion |
| `sortOrder` | Int | Default 0 |
| `isActive` | Boolean | Default true |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

#### `Product`
Core product record.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | |
| `slug` | String | Unique; used in URLs |
| `code` | String | Unique; model code (e.g. NX-T1) |
| `description` | String? | Optional |
| `price` | String | Stored as string (e.g. "₹ 12,500" or "Price on request") |
| `categoryId` | String | FK → Category |
| `colour` | String? | |
| `seatWeight` | String? | |
| `maxUserWeight` | String? | |
| `armrests` | String? | |
| `warranty` | String? | |
| `specs` | Json? | Arbitrary JSON (lumbar, armrests, back, etc.) |
| `dimensions` | Json? | Arbitrary JSON (seat, base, gasLift, tiltMechanism, etc.) |
| `specSheetKey` | String? | Vercel Blob URL to PDF |
| `isBestseller` | Boolean | Default false |
| `isActive` | Boolean | Default true |
| `features` | Json? | Array of feature strings |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** `categoryId`, `isActive`, `isBestseller`

**Note on `price` field:** Price is stored as a string. The page-level `normalisedProductPrice()` function in `app/products/[slug]/page.tsx` treats values containing `[` or the string `"Price on request"` as placeholder/unset prices and displays "Price on request" instead.

**Note on `specs` and `dimensions`:** These are freeform JSON columns. The product detail page reads specific keys: `specs` → `lumbar`, `armrests`, `back`; `dimensions` → `seat`, `base`, `casters`, `gasLift`, `tiltMechanism`, `reclineRange`, `tiltLock`, `seatSlider`, `headrest`, `warrantyFrame`, `warrantyUpholstery`, `warrantyService`. Missing keys render as `"-"` and are filtered out of the UI.

#### `ProductImage`
Images associated with a product, stored in Cloudinary.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `productId` | String | FK → Product (cascade delete) |
| `storageKey` | String | Cloudinary URL |
| `publicId` | String? | Cloudinary public_id for deletion |
| `altText` | String? | |
| `sortOrder` | Int | Default 0 |
| `isPrimary` | Boolean | Default false |
| `createdAt` | DateTime | |

**Index:** `productId`

#### `Catalogue`
PDF catalogues uploaded via the admin portal.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Display name |
| `storageKey` | String | Vercel Blob URL |
| `version` | String? | Optional version label |
| `isActive` | Boolean | Default true |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

#### `Enquiry`
Customer enquiry records (contact, quote, order).

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `type` | EnquiryType | CONTACT / QUOTE / ORDER |
| `status` | EnquiryStatus | NEW / CONTACTED / CLOSED (default: NEW) |
| `name` | String | Required |
| `email` | String? | At least one of email/phone required (enforced in action) |
| `phone` | String? | |
| `whatsapp` | String? | |
| `company` | String? | |
| `gstin` | String? | Business GST number |
| `city` | String? | |
| `pincode` | String? | |
| `orderType` | String? | Bulk / individual etc. |
| `preferredContact` | String? | Phone / WhatsApp / Email |
| `neededBy` | String? | Delivery timeframe |
| `message` | String? | Free-text message (max 2000 chars) |
| `adminNotes` | String? | Internal admin notes |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Indexes:** `type`, `status`, `createdAt`

#### `EnquiryItem`
Individual product lines within an enquiry.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `enquiryId` | String | FK → Enquiry (cascade delete) |
| `productId` | String | FK → Product (no cascade — product must remain) |
| `colour` | String? | |
| `quantity` | Int | Default 1 |
| `createdAt` | DateTime | |

**Indexes:** `enquiryId`, `productId`

### 8.3 Enums

| Enum | Values |
|---|---|
| `EnquiryType` | `CONTACT`, `QUOTE`, `ORDER` |
| `EnquiryStatus` | `NEW`, `CONTACTED`, `CLOSED` |

### 8.4 Key Relationships

```
Category (1) ──< Product (many)
Product  (1) ──< ProductImage (many, cascade delete)
Product  (1) ──< EnquiryItem (many)
Enquiry  (1) ──< EnquiryItem (many, cascade delete)
```

---

## 9. Asset and Image Inventory

### 9.1 Local Static Assets (`public/`)

| Asset | Path | Used By |
|---|---|---|
| Logo | `public/images/site/nexchair-logo.png` | Navbar, Footer |
| Favicon | `public/images/site/favicon.png` | Site metadata |
| App icon | `app/icon.png` | Next.js metadata |
| Hero video (small) | `public/home-page-vid.mp4` | Hero component |
| Hero video (main) | `public/home-page-vid2.mp4` | Hero component |
| About concept image | `public/images/aboutUsConcept.png` | About page |
| Contact concept image | `public/images/contactconcept.png` | Contact page |
| Factory image | `public/images/factory-image.png` | About or brand section |
| Hero image | `public/images/hero-image.png` | Hero section |
| Home concept images | `public/images/HomeConcept.png`, `homesection.png` | Homepage sections |
| IKEA feature image | `public/images/IKEA-artifact.jpeg` | IKEAFeature component |
| Product range concept | `public/images/prconcept.png` | Product range page |
| Specs concept | `public/images/specsconcept.png` | Specifications page |
| UI concept | `public/images/UI-concept.png` | Unknown — possibly design reference |
| About principles (×4) | `public/images/principle/principle-fit.png`, `principle-specs.png`, `principle-support.png`, `principle-teams.png` | About page principle cards |
| Default SVGs | `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Next.js scaffold defaults — likely unused |

### 9.2 Cloudinary-Hosted Assets

Product images and category images are uploaded to Cloudinary during admin product/category management.

| Asset type | Cloudinary folder | DB column | Deletion tracked via |
|---|---|---|---|
| Product images | `nexchair/products/` | `ProductImage.storageKey` (URL) | `ProductImage.publicId` |
| Category images | `nexchair/categories/` | `Category.imageKey` (URL) | `Category.imagePublicId` |

Images are served via `res.cloudinary.com` (whitelisted in `next.config.ts` for `next/image`).

### 9.3 Vercel Blob-Hosted Assets

PDFs are uploaded to Vercel Blob.

| Asset type | Blob path prefix | DB column |
|---|---|---|
| Product spec sheets | `products/spec-sheets/` | `Product.specSheetKey` |
| Catalogues | `catalogues/` | `Catalogue.storageKey` |

PDFs are served from `*.public.blob.vercel-storage.com`. URLs are stored directly (no publicId separation needed — deletion uses the URL directly via `lib/storage.ts:deleteFile()`).

### 9.4 Source Data Files (not served)

| File | Purpose |
|---|---|
| `chair specifications.xlsx` | Source spec data for products |
| `Nex chair images.xlsx` | Source image mapping data |
| `NexChair_Product_Archive.zip` | Archive used by `scripts/import-archive.ts` for initial product import |

---

## 10. Third-Party Integration Inventory

### 10.1 Cloudinary

- **Purpose:** Image hosting and CDN for product and category images.
- **SDK:** `cloudinary` v2.11.0 (`lib/cloudinary.ts`)
- **Configuration:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Usage:** Upload via stream (`upload_stream`) in `lib/storage.ts`. Deletion via `cloudinary.uploader.destroy` with CDN invalidation. Throws hard error if credentials are missing at startup.
- **Status:** IMPLEMENTED

### 10.2 Vercel Blob

- **Purpose:** PDF file storage for spec sheets and catalogues.
- **SDK:** `@vercel/blob` v2.8.2 (`lib/storage.ts`)
- **Configuration:** `BLOB_READ_WRITE_TOKEN` (standard Vercel Blob env var — not explicitly referenced in code read but required by the SDK)
- **Usage:** `put(pathname, file, { access: 'public' })` and `del(url)`.
- **Status:** IMPLEMENTED

### 10.3 Upstash Redis (Rate Limiting)

- **Purpose:** Sliding-window rate limiting for the admin login and public enquiry forms.
- **SDK:** `@upstash/ratelimit` v2.2.0, `@upstash/redis` v1.39.0 (`lib/ratelimit.ts`)
- **Configuration:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Limits:**
  - Admin login: 5 attempts / 15 min per IP+email — **fail-closed** in production
  - Enquiry form: 5 submissions / 10 min per IP — **fail-open** (allows traffic if Upstash is unavailable)
- **Key prefix:** `nexchair:rl`
- **Status:** IMPLEMENTED

### 10.4 Nodemailer (SMTP Email)

- **Purpose:** Sends two emails on each enquiry submission: an internal sales notification and a customer acknowledgement.
- **SDK:** `nodemailer` v10.2.1 (`lib/email.ts`)
- **Configuration:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `EMAIL_FROM`, `SALES_NOTIFICATION_EMAIL` (falls back to `ADMIN_EMAIL`)
- **Email types:** HTML templates built in `lib/email.ts` via `buildInternalHtml()` and `buildCustomerHtml()`
- **Email content:** Internal email includes enquiry type, contact details, product items, admin panel link. Customer email is an acknowledgement.
- **Config check:** `isEmailConfigured()` function — behaviour when unconfigured is handled inside `sendEnquiryEmails()` (logs and skips, does not throw)
- **SMTP provider:** Not identifiable from repository — depends on environment variables
- **Status:** IMPLEMENTED (provider UNVERIFIED)

### 10.5 Google Sheets

- **Purpose:** Appends a row to a Google Sheet on each enquiry submission. Functions as a lightweight CRM backup / sales lead log.
- **Implementation:** Manual Google Sheets API v4 via service account JWT (`lib/sheets.ts`)
- **Configuration:** `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_SHEET_NAME`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
- **Sheet columns (11):** Date, Lead ID, Type, Name, Company, Phone, Email, Model, Seats, Requirements, Lead Source
- **Duplicate guard:** Checks column B (Lead ID) before appending
- **Config check:** `isSheetsConfigured()` — skips silently if not configured
- **Status:** IMPLEMENTED

### 10.6 Google Tag Manager

- **Purpose:** Analytics and event tracking.
- **Container ID:** `GTM-TB368V3C`
- **Implementation:** Inline `<Script>` in `app/layout.tsx` + `<noscript>` iframe fallback
- **Status:** IMPLEMENTED (what tags/triggers are configured in GTM requires dashboard access — UNVERIFIED)

### 10.7 Prisma ORM

- **Purpose:** Database access layer for all application data.
- **SDK:** `@prisma/client` v7.10.0 with `@prisma/adapter-pg`
- **Singleton pattern:** Global `prisma` instance in `lib/prisma.ts` to prevent connection exhaustion in development hot-reload
- **Status:** IMPLEMENTED

---

## 11. Test and Build Configuration

### 11.1 Test Framework

| Item | Detail |
|---|---|
| Test runner | Vitest v5.0.5 |
| Config file | `vitest.config.mts` |
| Environment | `node` |
| Mock clearing | `clearMocks: true` |
| Path alias | `@` → repo root |

### 11.2 Test Files

| File | Covers |
|---|---|
| `app/actions/__tests__/admin-auth.test.ts` | Admin authentication server action |
| `app/actions/__tests__/enquiries.test.ts` | Enquiry creation server action |
| `lib/__tests__/email.test.ts` | Email HTML builder and send logic |
| `lib/__tests__/ratelimit.test.ts` | Rate limit logic |
| `lib/__tests__/sheets.test.ts` | Google Sheets append logic |

**Coverage note:** Tests exist for the core backend logic. No component tests or end-to-end tests are present. The existence of test files does not confirm passing status — no test run output is available from repository inspection alone.

### 11.3 Build and Lint Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Local development server |
| `build` | `prisma generate && next build` | Production build (generates Prisma client first) |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | ESLint check |
| `test` | `vitest run` | Run test suite once |
| `create-admin` | `tsx scripts/create-admin.ts` | Create initial admin user |
| `import-archive` | `tsx scripts/import-archive.ts` | Import products from archive ZIP |
| `update-images` | `tsx scripts/update-images.ts` | Bulk update product images via Cloudinary |
| `postinstall` | `prisma skills sync \|\| exit 0` | Sync Prisma skills (non-blocking) |

### 11.4 TypeScript Configuration

- Strict mode: enabled
- Path alias: `@/*` → `./` (repo root)
- Build info: `tsconfig.tsbuildinfo` (generated)

### 11.5 ESLint Configuration

- Config file: `eslint.config.mjs`
- Extends: `eslint-config-next` v16.3.8

---

## 12. Existing Documentation Inventory

| File | Content | Assessment |
|---|---|---|
| `README.md` | Default Next.js `create-next-app` scaffold README | OUTDATED / UNUSED — does not describe this project |
| `AGENTS.md` | Instruction to AI agents: read Next.js docs before writing code | IMPLEMENTED (project-specific, current) |
| `CLAUDE.md` | References `@AGENTS.md` | IMPLEMENTED |
| `info/` (6 PNG screenshots) | UI design screenshots dated 2026-10-03 | Reference material — not served |
| `docs/nexchair-handover/` | This documentation (created in this stage) | NEW |

**Assessment:** There is no existing developer documentation. The only documentation present is the auto-generated Next.js README (which does not describe the project) and AI-agent instruction files. The `info/` screenshots are design references, not technical documentation.

---

## 13. Implementation Status Observations

| Feature / Area | Status | Notes |
|---|---|---|
| Public website | IMPLEMENTED | All routes render, database-backed |
| Product catalogue (listing + detail) | IMPLEMENTED | Prisma-backed, images from Cloudinary |
| Enquiry submission (contact, quote, order) | IMPLEMENTED | Server action, DB write, email, Sheets |
| Admin login | IMPLEMENTED | bcrypt + JWT cookie |
| Admin dashboard | IMPLEMENTED | Live DB counts |
| Admin product management | IMPLEMENTED | CRUD + image upload/reorder |
| Admin category management | IMPLEMENTED | CRUD + image upload |
| Admin enquiry management | IMPLEMENTED | List, filter, status update, notes |
| Admin catalogue management | IMPLEMENTED | PDF upload via Vercel Blob |
| Admin settings | PENDING | Placeholder ("Settings coming soon") |
| Email notifications | IMPLEMENTED | Nodemailer SMTP, HTML templates |
| Google Sheets lead capture | IMPLEMENTED | Service account JWT, duplicate guard |
| Rate limiting — login | IMPLEMENTED | Fail-closed, Upstash |
| Rate limiting — enquiry | IMPLEMENTED | Fail-open, Upstash |
| XML sitemap | IMPLEMENTED | Dynamic, includes active products |
| Robots.txt | IMPLEMENTED | |
| `ContactEnquiryForm` component | PARTIALLY IMPLEMENTED | File exists; usage on pages not confirmed from files read |
| `Bestsellers`, `ProductShowcase`, `QuoteForm`, `QuoteSection`, `WhyNexChair` | UNUSED / LEGACY | Files exist in `components/home/` but not imported in `app/page.tsx` |
| `SpecsHighlights` component | UNUSED / LEGACY | Commented out in `app/page.tsx` |
| `data/products.ts` and `types/product.ts` | UNUSED / LEGACY | Static product array — superseded by Prisma database |
| Vercel Blob `BLOB_READ_WRITE_TOKEN` | UNVERIFIED | Required by SDK but not explicitly referenced in read source files |
| GTM tag/trigger configuration | UNVERIFIED | Requires GTM dashboard access |
| SMTP provider identity | UNVERIFIED | Configured via env vars — not determinable from repository |
| Production database provider | UNVERIFIED | PostgreSQL confirmed; hosting provider (e.g., Neon, Supabase, Railway) requires dashboard/env var |
| Vercel project configuration | UNVERIFIED | Assumed from tooling but not confirmed from repository |
| `@prisma/adapter-neon` package | UNUSED (in dependency list) | Installed but `lib/prisma.ts` uses `@prisma/adapter-pg` only |
| `CompanyStats` component | UNVERIFIED | File exists; not found in confirmed page imports during this audit |

---

## 14. Unverified Items and Information Gaps

The following items require access to external systems or further inspection:

| Item | Why Unverified | How to Verify |
|---|---|---|
| Production database host / provider | Not in source code | Check `DATABASE_URL` in Vercel environment variables |
| SMTP provider | Not in source code | Check `SMTP_HOST` in environment |
| Vercel project name and team | Not in repository | Vercel dashboard |
| Vercel Blob store configuration | `BLOB_READ_WRITE_TOKEN` not found in source | Vercel dashboard → Storage |
| Upstash Redis instance details | Env vars only | Upstash dashboard |
| Cloudinary cloud name | Env var only | Cloudinary dashboard (or confirm from `CLOUDINARY_CLOUD_NAME`) |
| GTM container configuration | Container ID known (GTM-TB368V3C), not content | Google Tag Manager dashboard |
| Google Sheets spreadsheet | Spreadsheet ID in env var only | Google Sheets |
| Google service account permissions | Not verifiable from code | Google Cloud Console / Drive sharing |
| Test suite pass/fail state | No CI output in repository | Run `npm test` |
| `ContactEnquiryForm` usage | Not found in confirmed page imports | Read all page files |
| `CompanyStats` usage | Not found in confirmed page imports | Grep codebase |
| `home-page-vid.mp4` vs `home-page-vid2.mp4` — which is active | Requires reading `Hero.tsx` | Read `components/home/Hero.tsx` |
| `.env.local` / `.env` contents | Must not be read | Available to operators with server access |
| `@prisma/adapter-neon` inclusion | Present in `package.json` but unused in source | Confirm removal is safe; possibly kept for future Neon migration |

---

## 15. Proposed Documentation Roadmap

The following stages are recommended for the remaining documentation work:

| Stage | Title | Scope |
|---|---|---|
| **Stage 2** | Environment Setup and Local Development | Environment variable reference (names, descriptions, required/optional), local dev prerequisites, database setup, seed scripts, first-run checklist |
| **Stage 3** | Public Website — Pages and Components | Detailed walkthrough of each public page: layout, components, data sources, rendering strategy, SEO metadata, known limitations |
| **Stage 4** | Enquiry Workflow — End-to-End | Complete flow from form submission through validation, DB write, email send, and Google Sheets append. Error handling, rate limit behaviour, what happens when each integration is unavailable |
| **Stage 5** | Admin Portal — Features and Operations | Admin login, session management, all admin screens, CRUD workflows, image and PDF upload flows, enquiry management workflow |
| **Stage 6** | Database — Schema Reference and Data Patterns | Full field-by-field reference, `specs`/`dimensions` JSON key catalogue, common queries, data integrity notes, migration approach |
| **Stage 7** | Storage — Images and Files | Cloudinary setup and folder structure, Vercel Blob setup, upload/delete flows, storage routing logic, naming conventions, CDN cache invalidation |
| **Stage 8** | Third-Party Integrations — Configuration and Troubleshooting | Per-integration: setup steps, required credentials, how to test, known failure modes, fallback behaviour |
| **Stage 9** | Deployment and Infrastructure | Vercel project setup, environment variable checklist, build process, deploy hooks, production checklist, rollback procedure |
| **Stage 10** | Maintenance, Monitoring, and Runbooks | Adding products, managing enquiries, rotating credentials, handling rate-limit incidents, email delivery failures, Sheets sync failures, database backup considerations |

---

*End of Stage 1 — Project Inventory*  
*Source: direct repository inspection, 2026-11-24*  
*Next step: Stage 2 — Environment Setup and Local Development*
