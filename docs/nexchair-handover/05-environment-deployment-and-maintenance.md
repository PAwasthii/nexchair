# NexChair — Environment, Deployment and Maintenance Guide

**Stage 6 of the NexChair Technical Documentation Series**

| Attribute | Value |
|---|---|
| Document | `05-environment-deployment-and-maintenance.md` |
| Covers | Complete developer setup, environment variables, deployment, integrations, maintenance, troubleshooting |
| Prerequisite reading | `00-project-inventory.md` through `04-admin-portal-and-operations.md` |
| Source verified | All commands and configurations verified against actual repository |
| Goal | A new developer can clone, configure, and run NexChair locally using this document alone |

---

## Table of Contents

1. [Development Environment Requirements](#1-development-environment-requirements)
2. [Repository Cloning and Installation](#2-repository-cloning-and-installation)
3. [Environment Variable Reference](#3-environment-variable-reference)
4. [Database and Prisma Setup](#4-database-and-prisma-setup)
5. [Local Development Workflow](#5-local-development-workflow)
6. [External Integration Setup](#6-external-integration-setup)
7. [Vercel Deployment](#7-vercel-deployment)
8. [Domain and DNS](#8-domain-and-dns)
9. [GitHub Release Workflow](#9-github-release-workflow)
10. [Production Maintenance](#10-production-maintenance)
11. [Backup and Recovery](#11-backup-and-recovery)
12. [Troubleshooting Reference](#12-troubleshooting-reference)
13. [Security and Environment Safety](#13-security-and-environment-safety)
14. [Developer Command Reference](#14-developer-command-reference)
15. [Outstanding Operational Risks](#15-outstanding-operational-risks)

---

## 1. Development Environment Requirements

### Requirements table

All versions verified from `package.json`, `package-lock.json`, and actual development environment.

| Tool | Required version | Purpose | How to verify |
|---|---|---|---|
| **Node.js** | >= 22.12.0 | JavaScript runtime; enforced by `engines` in `package.json` | `node --version` |
| **npm** | >= 10 (11.x recommended) | Package manager; `package-lock.json` present | `npm --version` |
| **Git** | Any recent version | Version control | `git --version` |
| **TypeScript** | 5.x (devDependency `^5`) | Type checking; invoked via `tsc` | `npx tsc --version` |
| **Next.js** | 16.3.8 (exact, in `dependencies`) | Application framework | n/a — installed by npm |
| **Prisma CLI** | 7.10.0 (exact, in `dependencies`) | Database ORM and migration tool | `npx prisma --version` |
| **React** | 19.2.8 (exact) | UI library | n/a — installed by npm |
| **tsx** | 4.x (devDependency `^4.23.15`) | TypeScript script runner for utility scripts | n/a — installed by npm |

### Operating system compatibility

| OS | Status | Notes |
|---|---|---|
| macOS | IMPLEMENTED | Primary development environment |
| Linux | IMPLEMENTED | Compatible; standard bash commands |
| Windows 11 (current machine) | IMPLEMENTED | Developed on Windows 11 with bash shell available |

No OS-specific build steps or platform dependencies identified. All commands use standard npm/Node.js tooling.

### Additional requirements

- **A PostgreSQL database** for local development (see Section 4 for options)
- **Cloudinary account** (free tier works) — required for the application to start (startup-time throw if credentials are missing)
- **Vercel Blob token** — required for PDF uploads; enquiry submission works without it, but admin spec-sheet and catalogue uploads will fail
- **Internet access** — required for Neon connections (no local PostgreSQL option unless you self-host)

### IDE recommendation

No IDE is mandated by the repository. VS Code with the Prisma extension and the TypeScript + Next.js extensions provides type-checking hints for `app/` files and schema syntax highlighting.

---

## 2. Repository Cloning and Installation

### Repository

The project is a private Git repository. Obtain access from the repository owner before cloning.

**Main branch:** `main`

**Current remote URL format:**

```
https://github.com/<org-or-user>/nexchair.git
```

Verify the actual remote URL after cloning:

```bash
git remote -v
```

### Clone

```bash
git clone https://github.com/<org-or-user>/nexchair.git
cd nexchair
```

Verify the branch:

```bash
git branch
# Should show: * main
```

Pull the latest changes at any time:

```bash
git pull origin main
```

### Install dependencies

```bash
npm install
```

What this does:
- Installs all production and dev dependencies listed in `package.json`
- Automatically runs the `postinstall` script after installation: `prisma skills sync || exit 0`
  - This attempts to sync Prisma AI Skills (generates `.agents/AGENTS.md` files for AI assistants). The `|| exit 0` ensures that installation succeeds even if Prisma Skills is unavailable or fails. This is harmless.
- Does **not** run `prisma generate` — you must do that separately (see Section 4)

Successful output ends with something like:

```
added 324 packages, and audited 325 packages in 45s
```

### Verify installation

```bash
node --version    # Must be >= 22.12.0
npm --version     # Informational
npx prisma --version
# Should show: prisma 7.10.0
```

---

## 3. Environment Variable Reference

### Critical: two environment files

NexChair uses **two separate `.env` files**. Both are gitignored. This is a deliberate architectural choice:

| File | DATABASE_URL | Purpose |
|---|---|---|
| `.env` | **Direct** (non-pooled) Neon connection | Used by Prisma CLI migrations and utility scripts |
| `.env.local` | **Pooled** Neon connection | Used by the Next.js application at runtime |

**Why two files?** Prisma's migration engine (`prisma migrate dev`) requires a direct database connection — it cannot work through a PgBouncer connection pool. Next.js applications under serverless/edge deployments benefit from pooled connections. Next.js loads `.env.local` automatically and it overrides `.env` for the application, while Prisma CLI only reads `.env` by default.

Both files must be created from scratch when setting up a new development environment. There is no `.env.example` file in the repository.

---

### Section A — Database

#### `.env` (direct connection — for Prisma CLI)

| Variable | Required | Purpose | Used by | Missing behaviour |
|---|---|---|---|---|
| `DATABASE_URL` | **YES** | Direct PostgreSQL connection string | `lib/prisma.ts`, Prisma CLI | Application crash on startup |

Format:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&channel_binding=require"
```

The direct URL for Neon uses the hostname **without** the `-pooler` suffix. It includes `channel_binding=require` for PostgreSQL channel binding security.

#### `.env.local` (pooled connection — for the application)

| Variable | Required | Purpose | Used by | Missing behaviour |
|---|---|---|---|---|
| `DATABASE_URL` | **YES** | Pooled PostgreSQL connection string | `lib/prisma.ts` | Application crash on startup |

Format:
```
DATABASE_URL="postgresql://USER:PASSWORD@POOLER-HOST/DATABASE?sslmode=require"
```

The pooled URL for Neon uses the hostname **with** the `-pooler` suffix. It uses `sslmode=require` only (no `channel_binding=require`).

**How `lib/prisma.ts` handles SSL:** The Prisma client initialization in `lib/prisma.ts` removes the `sslmode` parameter from the connection string and sets `ssl: { rejectUnauthorized: true }` on the `pg.Pool` directly. This is because the `@prisma/adapter-pg` driver handles SSL differently from the `neon` driver.

---

### Section B — Authentication

| Variable | Required | File | Purpose | Validation | Missing behaviour |
|---|---|---|---|---|---|
| `ADMIN_SESSION_SECRET` | **YES** | `.env.local` | HS256 JWT signing secret for admin sessions | Throws at module load (`lib/auth/admin.ts:3`) | Application crash on startup |
| `ADMIN_EMAIL` | Script-only | `.env` and/or `.env.local` | Email address for admin user; fallback email notification recipient | None at startup | `create-admin` script fails |
| `ADMIN_PASSWORD` | Script-only | `.env` and/or `.env.local` | Plaintext password used only by `create-admin` script | None at startup | `create-admin` script fails |

**`ADMIN_SESSION_SECRET`** generation:

Generate a secure random 64-character hex string. Example command:

```bash
# macOS / Linux / Git Bash on Windows
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The secret must remain stable. Changing it invalidates all existing admin sessions — anyone logged in will be redirected to the login page.

**`ADMIN_EMAIL` and `ADMIN_PASSWORD`** are only used by `npm run create-admin`. They are not read during application runtime beyond being available as a fallback notification email address.

---

### Section C — Cloudinary (image storage)

All three variables must be set. Missing any one causes an application startup crash in `lib/cloudinary.ts`.

| Variable | Required | File | Purpose | Validation | Missing behaviour |
|---|---|---|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | **YES** | `.env.local` | Cloudinary account cloud name | Throws at module load | Application crash on startup |
| `CLOUDINARY_API_KEY` | **YES** | `.env.local` | Cloudinary API key | Throws at module load | Application crash on startup |
| `CLOUDINARY_API_SECRET` | **YES** | `.env.local` | Cloudinary API secret | Throws at module load | Application crash on startup |

Where to find these values: Cloudinary Dashboard → Settings → API Keys.

---

### Section D — Vercel Blob (PDF storage)

| Variable | Required | File | Purpose | Validation | Missing behaviour |
|---|---|---|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | **YES** (for uploads) | `.env.local` | Vercel Blob read/write token | None at startup | `put()` and `del()` calls throw at request time |

The `@vercel/blob` SDK reads `BLOB_READ_WRITE_TOKEN` automatically. The application starts without it, but any attempt to upload a spec sheet or catalogue PDF will fail.

Where to find: Vercel Dashboard → Storage → Blob → your store → `.env.local` tab.

---

### Section E — SMTP email

| Variable | Required | File | Purpose | Used by | Missing behaviour |
|---|---|---|---|---|---|
| `SMTP_HOST` | YES (for email) | `.env.local` | SMTP server hostname | `lib/email.ts` | Email silently disabled (enquiries still saved to DB) |
| `SMTP_PORT` | NO | `.env.local` | SMTP port number | `lib/email.ts` | Defaults to Nodemailer's default (usually 587) |
| `SMTP_SECURE` | NO | `.env.local` | `"true"` = TLS on port 465; `"false"` = STARTTLS | `lib/email.ts` | Nodemailer default |
| `SMTP_USER` | YES (for email) | `.env.local` | SMTP authentication username | `lib/email.ts` | Email silently disabled |
| `SMTP_PASSWORD` | YES (for email) | `.env.local` | SMTP authentication password | `lib/email.ts` | Email silently disabled |
| `EMAIL_FROM` | YES (for email) | `.env.local` | Sender display name and address | `lib/email.ts` | Email silently disabled |
| `SALES_NOTIFICATION_EMAIL` | NO | `.env.local` | Recipient for sales notifications | `lib/email.ts` | Falls back to `ADMIN_EMAIL` |
| `ADMIN_EMAIL` | NO | `.env.local` and `.env` | Fallback notification recipient | `lib/email.ts` | Email silently disabled if neither `SALES_NOTIFICATION_EMAIL` nor `ADMIN_EMAIL` is set |

**Current SMTP setup:** Gmail SMTP with an App Password. Configuration:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false` (uses STARTTLS, not TLS on 465)
- `SMTP_USER` = the Gmail address used for sending
- `SMTP_PASSWORD` = Gmail App Password (16-character code, not the account password)

**How to generate a Gmail App Password:** Google Account → Security → 2-Step Verification → App passwords. Create a password for "Mail" / "Other".

**`isEmailConfigured()`** in `lib/email.ts` checks all required variables at request time. If any are missing, `sendEnquiryEmails()` logs a warning and returns without sending. Enquiries are still saved to the database.

---

### Section F — Google Sheets

| Variable | Required | File | Purpose | Used by | Missing behaviour |
|---|---|---|---|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | NO | `.env.local` | Spreadsheet document ID | `lib/sheets.ts` | Sheets silently disabled |
| `GOOGLE_SHEETS_SHEET_NAME` | NO | `.env.local` | Worksheet/tab name within the spreadsheet | `lib/sheets.ts` | Sheets silently disabled |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | NO | `.env.local` | Service account email for JWT auth | `lib/sheets.ts` | Sheets silently disabled |
| `GOOGLE_PRIVATE_KEY` | NO | `.env.local` | RSA private key (PEM format) for service account | `lib/sheets.ts` | Sheets silently disabled |

`isSheetsConfigured()` in `lib/sheets.ts` checks all four variables. If any are missing, `appendEnquiryToSheet()` returns `false` immediately without attempting a network request.

**Private key format:** The `GOOGLE_PRIVATE_KEY` must be the full PEM-encoded RSA private key. In the `.env.local` file, newlines within the key must be represented as `\n` escape sequences, and the entire value must be wrapped in double quotes:

```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBg...(key content)...\n-----END PRIVATE KEY-----\n"
```

When pasting from a service account JSON file, the `private_key` field already uses `\n` sequences — that value can be copied directly into the `.env.local` file wrapped in double quotes.

**Spreadsheet ID:** Found in the spreadsheet URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.

---

### Section G — Upstash Redis (rate limiting)

| Variable | Required | File | Purpose | Used by | Missing behaviour |
|---|---|---|---|---|---|
| `UPSTASH_REDIS_REST_URL` | NO | `.env.local` | Upstash Redis REST endpoint URL | `lib/ratelimit.ts` | Rate limiting disabled |
| `UPSTASH_REDIS_REST_TOKEN` | NO | `.env.local` | Upstash Redis REST token | `lib/ratelimit.ts` | Rate limiting disabled |

**Behaviour when missing:**
- In development (`NODE_ENV !== "production"`): logs a warning, allows all requests (no rate limiting)
- In production with enquiry rate limit (`onMisconfigured: "open"`): logs a CRITICAL error, allows the request
- In production with login rate limit (`onMisconfigured: "closed"`): logs a CRITICAL error, **blocks the request**

The login rate limiter is fail-CLOSED in production. Missing Upstash env vars in production will block admin logins entirely. Configure these before going live.

Where to find: Upstash Console → your database → REST API tab.

---

### Section H — Application

| Variable | Required | File | Purpose | Used by | Missing behaviour |
|---|---|---|---|---|---|
| `APP_URL` | NO | `.env.local` | Base URL for email links (admin panel link) | `lib/email.ts` | Email omits the admin-panel link; uses enquiry ID text instead |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | NO | `.env.local` | WhatsApp contact number | `lib/site.ts` | Defaults to `917798203669` (India country code + number) |

`APP_URL` should be set to `https://www.nexchair.in` in production. In development, set to `http://localhost:3000` to get working links in test emails.

---

### Section I — Google Tag Manager

| Item | Type | Location | Notes |
|---|---|---|---|
| GTM Container ID | Hardcoded constant | `app/layout.tsx` lines 39 and 53 | `GTM-TB368V3C` — not an env var |

GTM is configured directly in the layout file, not through an environment variable. To change the container ID, edit `app/layout.tsx` and update both the noscript `iframe` src and the inline script string.

---

### Full environment variable checklist

Variables marked REQUIRED will cause application startup failures if absent. Variables marked RECOMMENDED will silently disable features.

| Variable | File | Criticality | Causes startup crash |
|---|---|---|---|
| `DATABASE_URL` | `.env` (direct URL) | REQUIRED | Yes |
| `DATABASE_URL` | `.env.local` (pooled URL) | REQUIRED | Yes |
| `ADMIN_SESSION_SECRET` | `.env.local` | REQUIRED | Yes |
| `CLOUDINARY_CLOUD_NAME` | `.env.local` | REQUIRED | Yes |
| `CLOUDINARY_API_KEY` | `.env.local` | REQUIRED | Yes |
| `CLOUDINARY_API_SECRET` | `.env.local` | REQUIRED | Yes |
| `BLOB_READ_WRITE_TOKEN` | `.env.local` | REQUIRED for uploads | No — fails at request time |
| `SMTP_HOST` | `.env.local` | RECOMMENDED | No — email disabled |
| `SMTP_PORT` | `.env.local` | RECOMMENDED | No |
| `SMTP_SECURE` | `.env.local` | RECOMMENDED | No |
| `SMTP_USER` | `.env.local` | RECOMMENDED | No |
| `SMTP_PASSWORD` | `.env.local` | RECOMMENDED | No |
| `EMAIL_FROM` | `.env.local` | RECOMMENDED | No |
| `SALES_NOTIFICATION_EMAIL` | `.env.local` | RECOMMENDED | No |
| `ADMIN_EMAIL` | `.env.local` / `.env` | RECOMMENDED | No |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `.env.local` | RECOMMENDED | No |
| `GOOGLE_SHEETS_SHEET_NAME` | `.env.local` | RECOMMENDED | No |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `.env.local` | RECOMMENDED | No |
| `GOOGLE_PRIVATE_KEY` | `.env.local` | RECOMMENDED | No |
| `UPSTASH_REDIS_REST_URL` | `.env.local` | REQUIRED in production | No — rate limiting disabled |
| `UPSTASH_REDIS_REST_TOKEN` | `.env.local` | REQUIRED in production | No — rate limiting disabled |
| `APP_URL` | `.env.local` | OPTIONAL | No |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `.env.local` | OPTIONAL | No — uses default |
| `ADMIN_EMAIL` (script) | `.env` | Script-only | No |
| `ADMIN_PASSWORD` (script) | `.env` | Script-only | No |

---

## 4. Database and Prisma Setup

### Prisma version and configuration

NexChair uses **Prisma 7.10.0**, which has breaking changes from Prisma 5/6. Key differences:
- Generator provider is `prisma-client` (not `prisma-client-js`)
- Client is generated to a custom output directory: `generated/prisma/`
- The generated directory is gitignored — it must be regenerated after every clone or schema change
- The `build` script already includes generation: `prisma generate && next build`

**Schema location:** `prisma/schema.prisma`

**Generated client location:** `generated/prisma/` (gitignored)

**Migration files:** `prisma/migrations/` (committed to git)

**Migration history:**

| Migration | Date | Change |
|---|---|---|
| `20261005163606_init` | 2026-10-05 | Initial schema — all 6 tables, enums, indexes |
| `20261006061354_add_product_features` | 2026-10-06 | Added `features` JSON column to `Product` |
| `20261015065134_add_cloudinary_public_ids` | 2026-10-15 | Added `imagePublicId` to `Category`, `publicId` to `ProductImage` |
| `20261023000000_add_enquiry_admin_notes` | 2026-10-23 | Added `adminNotes` text column to `Enquiry` |

### Database adapter

`lib/prisma.ts` uses `@prisma/adapter-pg` with `pg.Pool` — **not** `@prisma/adapter-neon`, despite that package also being installed. The adapter explicitly configures SSL:

```typescript
// sslmode is stripped from the connection string
// and replaced with explicit ssl: { rejectUnauthorized: true }
```

This handles the case where Neon's pooler URL includes `sslmode=require` as a query parameter, which some pg drivers interpret differently.

### Local development database options

**Option A — Use the existing Neon database (simplest)**

The project is already connected to a Neon serverless PostgreSQL database in the `ap-southeast-1` (Singapore) region. For most development work, the same database is used for both local development and production. This is acceptable if:
- You are careful not to run destructive schema changes
- You coordinate with other developers to avoid conflicting migrations
- You understand that test data will appear in the production database

Set both `.env` and `.env.local` with the Neon connection strings (obtain from the Neon dashboard or the previous developer).

**Option B — Create a separate Neon branch (recommended for schema changes)**

Neon supports database branching — a branch is a full copy of the database at a point in time. This is the safest approach for migrations:

1. Log in to the Neon console
2. Select the `nexchair_db` project
3. Click "Branches" → "New Branch"
4. Create a branch from `main`
5. Obtain the direct and pooled connection strings for the new branch
6. Use these strings in your local `.env` and `.env.local`

No staging environment is currently configured — only the production Neon database exists.

**Option C — Run a local PostgreSQL instance**

If you have PostgreSQL installed locally (or via Docker), you can point `DATABASE_URL` at it. The schema is PostgreSQL-specific (uses `JSONB` columns). Migrations will work the same way. You will need to run `prisma migrate deploy` to apply the full schema history.

```bash
# Example for a local PostgreSQL instance
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexchair_dev?sslmode=disable"
```

Note: `lib/prisma.ts` sets `ssl: { rejectUnauthorized: true }`. For a local database without SSL, you may need to modify the pool configuration or use a different `.env.local` DATABASE_URL that the app can connect to without SSL.

### Prisma commands reference

All Prisma commands run from the project root directory.

#### Generate Prisma client

```bash
npx prisma generate
```

Must be run:
- After cloning the repository (the `generated/` directory is not committed)
- After any schema change
- Before running `next dev` or `next build` if the client is not generated

The `build` script (`npm run build`) includes `prisma generate` automatically.

#### Apply existing migrations to a fresh database

```bash
npx prisma migrate deploy
```

This applies all migration files from `prisma/migrations/` to the connected database in order. Use this for:
- Setting up a fresh local database
- Applying new migrations to the production database on Vercel (run this in the Vercel build command or as a pre-deploy step)

This command **does not** create new migrations. It only applies existing ones.

#### Create a new migration (development only)

```bash
npx prisma migrate dev --name <descriptive-name>
```

This:
1. Compares the current schema against the database
2. Generates a new migration SQL file in `prisma/migrations/`
3. Applies the migration to your development database
4. Regenerates the Prisma client

**Important:** Always run this against your local or Neon branch database, never directly against production. After creating a migration, commit the new migration file and deploy.

#### Inspect the current schema

```bash
npx prisma studio
```

Opens Prisma Studio in your browser at `http://localhost:5555` — a GUI for browsing and editing database records. Useful for inspecting live data.

#### Check migration status

```bash
npx prisma migrate status
```

Shows which migrations have been applied to the connected database and which are pending.

#### Format the schema file

```bash
npx prisma format
```

Formats `prisma/schema.prisma`. Run before committing schema changes.

### Create the admin user

There is no UI for creating admin users. Use the `create-admin` script:

```bash
# ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env or .env.local
npm run create-admin
```

This runs `scripts/create-admin.ts` via `tsx`. It:
1. Loads `.env.local` then `.env` via dotenv (`.env.local` takes precedence)
2. Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Hashes the password with bcrypt (12 rounds)
4. `upsert`s the `AdminUser` record — creates if not found, updates the hash if found

Minimum password length: 8 characters.

After running, verify login at `/admin/login`.

### Seed data

**The seed script (`prisma/seed.ts`) is LEGACY and NOT recommended for use.** It seeds from `data/products.ts`, which contains placeholder data (`[PRICE]`, `[—]`) with 9 test products. The actual live product catalogue was imported via `scripts/import-archive.ts` from a client-supplied archive.

There is no `"prisma": { "seed": "..." }` entry in `package.json`, so `prisma db seed` will fail. The seed file exists for historical context only.

---

## 5. Local Development Workflow

### Prerequisites checklist

Before starting the development server, verify:

- [ ] Node.js >= 22.12.0 installed (`node --version`)
- [ ] `npm install` completed
- [ ] `.env` created with direct database `DATABASE_URL`
- [ ] `.env.local` created with pooled `DATABASE_URL` and all integration credentials
- [ ] `npx prisma generate` run (or use `npm run build` once to generate)
- [ ] Database is accessible (try `npx prisma migrate status`)

### Starting the development server

```bash
npm run dev
```

This runs `next dev`. The application starts at:

```
http://localhost:3000
```

The terminal shows route compilation on first access. Next.js App Router compiles routes lazily.

### Key local URLs

| URL | Purpose |
|---|---|
| `http://localhost:3000/` | Homepage |
| `http://localhost:3000/product-range` | Product range listing |
| `http://localhost:3000/specifications` | Specifications browser |
| `http://localhost:3000/about` | About page |
| `http://localhost:3000/contact` | Contact / quote form |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:3000/admin` | Admin dashboard (requires login) |

### Verifying database connectivity

After starting the server, navigate to any page that queries the database (`/product-range`, `/`). If it loads categories and products, the database connection is working. If you see an error or empty page, check:

```bash
npx prisma migrate status
```

### Local development behaviour differences

| Feature | Local behaviour | Production behaviour |
|---|---|---|
| Rate limiting | DISABLED (logs warning if Upstash vars set; allows all if not set) | ENABLED via Upstash |
| Email notifications | Disabled if SMTP vars absent; sends real emails if configured | Sends real emails |
| Google Sheets | Disabled if any Sheet var absent | Logs enquiries to sheet |
| Admin session | Same JWT behaviour; session persists across hot reloads via global singleton | Same |
| Server Actions | Available; body size limit 12MB (from `next.config.ts`) | Same |
| Hot reload | Yes (`next dev`) | No |
| Error details | Full stack traces in browser | Sanitised 500 errors |

### Stopping the server

`Ctrl + C` in the terminal running `npm run dev`.

### Running tests

```bash
npm run test
```

This runs `vitest run` — executes all test files matching `**/*.test.ts` once and exits. No watch mode.

Test files:
- `app/actions/__tests__/enquiries.test.ts`
- `app/actions/__tests__/admin-auth.test.ts`
- `lib/__tests__/email.test.ts`
- `lib/__tests__/ratelimit.test.ts`
- `lib/__tests__/sheets.test.ts`

Tests use Vitest with mocked dependencies — no real database or external services are called.

### Running TypeScript type checks

```bash
npx tsc --noEmit
```

Runs the TypeScript compiler without producing output files. Checks all `.ts` and `.tsx` files.

### Running the production build locally

```bash
npm run build
```

This runs `prisma generate && next build`. Requires all REQUIRED env vars to be set in `.env.local`. Verifies the production bundle compiles without errors.

---

## 6. External Integration Setup

### A. Neon PostgreSQL

**Status:** IMPLEMENTED

**Project details:**
- Provider: Neon serverless PostgreSQL
- Region: `ap-southeast-1` (AWS Singapore)
- Database name: `nexchair_db`

**Connection types:**

Neon provides two connection endpoints:

| Type | Hostname pattern | Usage |
|---|---|---|
| Direct | `ep-<id>.c-4.ap-southeast-1.aws.neon.tech` | Prisma CLI migrations; scripts |
| Pooled (PgBouncer) | `ep-<id>-pooler.c-4.ap-southeast-1.aws.neon.tech` | Application runtime (serverless) |

**Where to find connection strings:** Neon Console → your project → "Connection string" dropdown → select "Direct" or "Pooled" → copy PostgreSQL URL.

**Monitoring:** Neon Console shows query metrics, connection counts, and storage usage. Access: console.neon.tech.

**Backups:** Neon's free and paid tiers include automatic point-in-time restore (PITR). The retention window depends on the Neon plan. Verify the current plan in Neon Console → Billing. See Section 11 for backup details.

**Common connection issues:**

| Issue | Cause | Resolution |
|---|---|---|
| `SSL connection required` | Missing `sslmode=require` | Add to connection string |
| `Connection timeout` | IP not whitelisted | Neon allows connections from anywhere by default; check if IP allowlisting was enabled |
| `Too many connections` | Using direct URL in serverless context | Use pooled URL for application; direct URL for scripts only |
| `channel_binding` error | Pooler doesn't support `channel_binding=require` | Only add `channel_binding=require` to the direct URL |

---

### B. Cloudinary

**Status:** IMPLEMENTED

**Usage:** Product images and category images.

- Product images: Cloudinary folder `nexchair/products`
- Category images: Cloudinary folder `nexchair/categories`
- Storage key stored in DB: full `secure_url` (CDN URL starting with `https://res.cloudinary.com/...`)
- Deletion requires `publicId` stored in `ProductImage.publicId` or `Category.imagePublicId`

**Environment variables required:**
- `CLOUDINARY_CLOUD_NAME` — your Cloudinary cloud name (shown in Cloudinary Dashboard header)
- `CLOUDINARY_API_KEY` — from Cloudinary Dashboard → Settings → API Keys
- `CLOUDINARY_API_SECRET` — from Cloudinary Dashboard → Settings → API Keys

**Setup for a new Cloudinary account:**

1. Create account at cloudinary.com
2. The free tier includes generous upload quotas
3. No pre-configuration of folders needed — folders are created on first upload
4. `next.config.ts` already whitelists `res.cloudinary.com` for `next/image`

**Images are uploaded via admin portal only** — not via direct Cloudinary upload. Never upload files directly to Cloudinary and then try to link them; use Admin → Products → manage images.

**Deletion:** `lib/storage.ts` calls `cloudinary.uploader.destroy(publicId, { invalidate: true })`. The `invalidate: true` parameter busts the Cloudinary CDN cache. Deletion is fire-and-forget (async `.catch()`) — the response is returned before cleanup completes.

**Troubleshooting:**

| Issue | Cause | Resolution |
|---|---|---|
| Application crashes on startup | Any Cloudinary env var missing | Set all three vars in `.env.local` |
| Upload fails with 401 | Wrong API key or secret | Verify credentials in Cloudinary dashboard |
| Image 404 after upload | CDN propagation delay | Wait a few seconds; check `publicId` in DB matches |
| Deletion returns "not found" | Already deleted or wrong publicId | `lib/storage.ts` treats "not found" as success (idempotent) |

---

### C. Vercel Blob

**Status:** IMPLEMENTED

**Usage:** Spec sheet PDFs (`products/spec-sheets/`) and catalogue PDFs (`catalogues/`).

- PDFs are publicly accessible via their Vercel Blob URL
- URLs follow the pattern: `https://<store-id>.public.blob.vercel-storage.com/<path>`

**Environment variable:** `BLOB_READ_WRITE_TOKEN`

**Obtaining the token:** Vercel Dashboard → Storage → Blob → your store → `.env.local` tab. Copy the `BLOB_READ_WRITE_TOKEN` value.

If no Blob store exists yet, create one: Vercel Dashboard → Storage → Create Database → Blob.

**File limits (enforced in `lib/storage.ts`):**
- Spec sheets: PDF only, max 10 MB
- Catalogues: PDF only, max 25 MB

**Server Actions body size limit:** `next.config.ts` sets `serverActions.bodySizeLimit: "12mb"`. This applies to spec sheet uploads. Catalogue uploads can exceed this limit — this is a **known configuration gap**: the body size limit is 12 MB but the catalogue upload limit is 25 MB. Large catalogue uploads may fail with a "413 Request Entity Too Large" error from Next.js before `lib/storage.ts` even validates the file.

**Troubleshooting:**

| Issue | Cause | Resolution |
|---|---|---|
| Upload fails with "BLOB_READ_WRITE_TOKEN not found" | Token not set | Set `BLOB_READ_WRITE_TOKEN` in `.env.local` |
| Catalogue upload fails at 12 MB | Server Actions body size limit | See known gap above; `next.config.ts` limit would need to be increased |
| PDF URL invalid after delete | Blob delete succeeded but old URL cached | Direct Blob URLs do not use CDN caching — URL should 404 immediately |

---

### D. SMTP / Nodemailer

**Status:** IMPLEMENTED

**Provider:** Gmail SMTP with App Password

**Configuration:**
- Host: `smtp.gmail.com`
- Port: `587`
- Secure: `false` (STARTTLS)
- Authentication: username + App Password (not OAuth2)

**Workflow:** `lib/email.ts`
1. `sendEnquiryEmails()` sends two emails concurrently via `Promise.allSettled`:
   - Internal sales notification to `SALES_NOTIFICATION_EMAIL` (or `ADMIN_EMAIL`)
   - Customer acknowledgement to the submitter (if email was provided and type is `CONTACT`)
2. Neither email failure blocks the enquiry submission response
3. `trySend()` wraps each `sendMail` in try/catch — never throws

**Setup steps for a new Gmail sender:**

1. Enable 2-Step Verification on the Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Create an App Password for "Mail"
4. Copy the 16-character password
5. Set `SMTP_USER` to the Gmail address, `SMTP_PASSWORD` to the App Password

**Important:** Standard Gmail passwords do NOT work with SMTP. Only App Passwords work after 2FA is enabled.

**Troubleshooting:**

| Issue | Cause | Resolution |
|---|---|---|
| Emails not sending (no error) | Missing SMTP vars | Check `isEmailConfigured()` vars; check server logs for "Email is not configured" warning |
| Auth failure 535 | Wrong SMTP password / 2FA not enabled | Generate new App Password; ensure 2FA is active |
| `Connection refused` | Wrong SMTP host or port | Verify `smtp.gmail.com:587` |
| `Less secure app access` error | Google deprecated this — use App Password | Enable 2FA and use App Password |
| Customer email not sent | Enquiry type is `ORDER` (not `CONTACT`) | Customer acks are only sent for CONTACT type |

---

### E. Google Sheets

**Status:** IMPLEMENTED

**Purpose:** Append each enquiry submission as a row in a Google Sheets spreadsheet, providing the sales team a live log alongside the admin portal.

**Current spreadsheet:** Configured via `GOOGLE_SHEETS_SPREADSHEET_ID`. The worksheet tab is named per `GOOGLE_SHEETS_SHEET_NAME` (currently `Website Enquiries`).

**Authentication:** Service account JWT (RS256). No OAuth browser flow required.

**Setup steps for a new Google Cloud project:**

1. Create a project at console.cloud.google.com
2. Enable the **Google Sheets API** (APIs & Services → Library → "Google Sheets API")
3. Create a service account: IAM & Admin → Service Accounts → Create
4. Generate a JSON key for the service account: Keys → Add Key → Create new key → JSON
5. Copy `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
6. Copy `private_key` → `GOOGLE_PRIVATE_KEY` (see format requirements in Section 3-F)
7. Share the target spreadsheet with the service account email (Editor permission)
8. Copy the spreadsheet ID from the URL → `GOOGLE_SHEETS_SPREADSHEET_ID`
9. Set the tab name → `GOOGLE_SHEETS_SHEET_NAME`

**Sheet columns (11 columns):** Timestamp, Enquiry ID, Type, Name, Email, Phone/WhatsApp, Company, Model of Interest, Number of Seats, Products (formatted), Notes.

**Duplicate guard:** Before each append, `lib/sheets.ts` checks column B (Enquiry ID) to prevent duplicate rows. This check fails open — if the lookup fails, the row is appended anyway.

**Troubleshooting:**

| Issue | Cause | Resolution |
|---|---|---|
| Sheets not updating | Any env var missing | Check `isSheetsConfigured()` — all 4 vars required |
| 403 Permission denied | Service account not shared on spreadsheet | Share spreadsheet with service account email (Editor) |
| `invalid_grant` JWT error | Clock skew or wrong private key | Verify server time; re-download service account JSON |
| Wrong tab | `GOOGLE_SHEETS_SHEET_NAME` mismatch | Must exactly match the tab name (case-sensitive) |
| Private key format error | Key has literal newlines instead of `\n` | Ensure key is single-line with `\n` escape sequences in `.env.local` |

---

### F. Upstash Redis

**Status:** IMPLEMENTED

**Purpose:** Rate limiting for enquiry form submission and admin login.

**Configuration:** REST API access — no Redis protocol/TCP connection. The `@upstash/redis` SDK communicates via HTTPS.

**Setup:**
1. Create account at upstash.com
2. Create a new Redis database (serverless tier is sufficient)
3. From the database dashboard, copy the REST URL and REST token
4. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`

**Rate limit windows:**

| Limiter | Key pattern | Limit | Window | Fail mode |
|---|---|---|---|---|
| Enquiry form | `nexchair:rl:enquiry:{ip}` | 5 | 10 minutes | Fail-OPEN |
| Admin login | `nexchair:rl:login:{ip}:{email}` | 5 | 15 minutes | Fail-CLOSED |

**Local development:** Rate limiting is disabled in development when env vars are absent. The app logs a warning and allows all requests.

**Production with missing vars:**
- Enquiry rate limit: request is ALLOWED (fail-open), CRITICAL error logged
- Login rate limit: request is BLOCKED (fail-closed), CRITICAL error logged

**Troubleshooting:**

| Issue | Cause | Resolution |
|---|---|---|
| Login blocked in production | Upstash vars missing | Set both vars in Vercel environment variables |
| `Too many submissions` on every form submit | Upstash REST call failing silently | Check Upstash dashboard for quota or connectivity issues |
| Rate limit not resetting | Expected — sliding window; resets 10/15 min after first request | Wait for window to expire, or flush key in Upstash dashboard |

---

### G. Google Tag Manager

**Status:** IMPLEMENTED (container script present; event tracking unverified)

**Container ID:** `GTM-TB368V3C` (hardcoded in `app/layout.tsx`)

**Implementation:** Standard GTM snippet with inline `<Script strategy="afterInteractive">` and noscript `<iframe>` fallback. The container fires on every page load.

**What is currently configured:** The GTM container script is present and loads the GTM library. What **events, tags, triggers, and variables** are configured inside the GTM container is determined by the GTM dashboard — not the codebase.

**How to verify container loading:** Open the live site → DevTools → Network → filter for `gtm.js`. You should see a 200 response from `googletagmanager.com`.

**Data layer:** No explicit `dataLayer.push()` calls are made in the application code. All tracking is configured within GTM itself via tag triggers.

**To add analytics events:** Configure tags in the GTM container dashboard. No code changes are required unless custom data layer variables are needed.

---

## 7. Vercel Deployment

**Status:** IMPLEMENTED — project is live on Vercel

**Note:** No `vercel.json` exists in the repository. All Vercel configuration is managed in the Vercel dashboard and is not version-controlled. Settings below are marked UNVERIFIED where dashboard inspection is required to confirm.

### Build configuration

| Setting | Value | Source |
|---|---|---|
| Framework | Next.js | Auto-detected |
| Build command | `npm run build` (which runs `prisma generate && next build`) | `package.json` |
| Install command | `npm install` | Default |
| Output directory | `.next` | Next.js default |
| Node.js version | >= 22 (from `package.json` `engines`) | UNVERIFIED — confirm in Vercel dashboard |

**Important:** The build command includes `prisma generate`. If the generated Prisma client is not regenerated during the build, the deployment will fail. This is handled by the `build` script.

### Deployment process

Vercel deploys automatically when changes are pushed to the connected GitHub repository. The expected configuration:

| Event | Expected behaviour |
|---|---|
| Push to `main` | Production deployment triggered automatically |
| Pull request opened | Preview deployment created (URL: `nexchair-*.vercel.app`) |
| PR merged to `main` | Production deployment triggered |
| Push to any other branch | Preview deployment if PR is open |

**UNVERIFIED:** Confirm in Vercel dashboard whether automatic deployments are enabled for `main` and whether preview deployments are configured.

### Environment variables on Vercel

All environment variables from `.env.local` must be configured in Vercel:

Vercel Dashboard → Project → Settings → Environment Variables

Variables can be scoped to:
- **Production** — applies to `main` branch deployments
- **Preview** — applies to PR/branch deployments
- **Development** — provides defaults for `vercel env pull` (not used here)

**Critical:** The `DATABASE_URL` on Vercel should use the **pooled** Neon connection string. Never use the direct URL in production serverless deployments.

After adding or changing environment variables, a redeployment is required. Vercel does not automatically redeploy when env vars change.

### Rolling back a deployment

In the Vercel dashboard:
1. Go to Deployments
2. Find the last known-good deployment
3. Click the deployment's "..." menu → "Promote to Production"

This does not revert code changes in git — it only switches which deployment serves production traffic.

### Deployment failure

If a deployment fails:
1. Vercel keeps the previous deployment live (the failed build does not replace the live site)
2. Check Vercel → Deployments → the failed deployment → Build Logs
3. Common causes:
   - TypeScript error in the build
   - Missing environment variable causing startup throw
   - `prisma generate` failure
   - `next build` error (route compilation failure)

---

## 8. Domain and DNS

**Production domain:** `nexchair.in` and `www.nexchair.in`

**Sitemap base URL:** `https://www.nexchair.in` (hardcoded in `app/sitemap.ts`)

**Status:** IMPLEMENTED — the domain is live

**DNS and domain configuration:** UNVERIFIED from the repository. DNS settings are managed in the domain registrar dashboard and Vercel dashboard. To verify:

1. Vercel Dashboard → Project → Settings → Domains — confirm domain assignment and certificate status
2. Domain registrar — confirm DNS records point to Vercel's nameservers or A/CNAME records

**Expected Vercel domain setup:**
- Both `nexchair.in` and `www.nexchair.in` should be assigned to the Vercel project
- Vercel handles HTTPS automatically via Let's Encrypt
- Redirection between www and non-www (or vice versa) is configured in Vercel's domain settings as a "redirect" — UNVERIFIED which is canonical

**Do not modify DNS settings without understanding the current setup.** DNS changes can make the site inaccessible for up to 48 hours during propagation.

---

## 9. GitHub Release Workflow

### Branch strategy

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production-ready code | Production (Vercel) |
| Feature branches | In-progress work | Preview (if PR opened) |

No branch protection rules are configured — UNVERIFIED. Push access to `main` should be restricted to prevent accidental direct commits to production.

### No CI/CD pipeline

There is **no `.github/` directory** and no GitHub Actions workflows. No automated:
- Test runs on push
- Type checks on PR
- Lint checks on push
- Deployment gates

All validation must be performed manually before merging.

### Recommended release workflow

```bash
# 1. Pull latest main
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-change-description

# 3. Implement changes

# 4. Run tests
npm run test

# 5. Run TypeScript check
npx tsc --noEmit

# 6. Run production build
npm run build

# 7. If all checks pass, stage and commit
git add <specific-files>
git commit -m "feat: describe the change"

# 8. Push branch
git push origin feature/your-change-description

# 9. Open pull request on GitHub
# Review the diff before merging

# 10. After PR review and approval, merge to main
# Vercel deploys automatically

# 11. Verify deployment in Vercel dashboard
# Check the live site manually
```

### Safe practices

**Reverting a change:**

```bash
# Option A: Revert a specific commit (creates a new commit)
git revert <commit-sha>
git push origin main

# Option B: Use Vercel rollback (faster — does not change git history)
# Vercel Dashboard → Deployments → previous deployment → Promote to Production
```

**Handling merge conflicts:**

```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
# Resolve conflicts in editor
git add <resolved-files>
git commit -m "chore: resolve merge conflicts"
```

**Managing environment variables:**

Never commit `.env` or `.env.local` to git. The `.gitignore` excludes `.env*`. If you accidentally commit credentials, treat the credentials as compromised and rotate them immediately.

**Avoiding accidental production deployment:**

Always work on a feature branch. Never commit directly to `main` unless it is a documented hotfix with verified tests.

---

## 10. Production Maintenance

### Operational checks (daily / as needed)

| Check | Method | Expected result |
|---|---|---|
| Homepage loads | Open `https://www.nexchair.in/` | Hero video plays, categories load |
| Product range loads | Open `https://www.nexchair.in/product-range` | Products listed with images |
| Contact form submission | Submit a test enquiry | Success message; check admin for new enquiry |
| Admin portal access | Log in at `https://www.nexchair.in/admin/login` | Dashboard loads with stats |
| New enquiry count | Admin dashboard | "New Enquiries" reflects recent submissions |
| Email notification | Submit test enquiry (use real email) | Sales notification received |
| Google Sheets log | Open the enquiries spreadsheet | New row appears after submission |
| Images loading | Product pages | Product images display from Cloudinary |

### Periodic maintenance tasks

| Task | Recommended frequency | Currently automated |
|---|---|---|
| **Dependency security audit** | Monthly | No — run `npm audit` manually |
| **Dependency updates** | Monthly | No — run `npm outdated` to check |
| **Database backup verification** | Monthly | No — verify via Neon console |
| **Cloudinary storage usage** | Monthly | No — check Cloudinary dashboard |
| **Vercel Blob storage usage** | Monthly | No — check Vercel dashboard |
| **Upstash usage** | Monthly | No — check Upstash dashboard |
| **Google Search Console** | Weekly | No — manual check |
| **Upstash rate-limit key review** | As needed | No |
| **Admin password rotation** | Quarterly | No — run `npm run create-admin` with new password |
| **SMTP password rotation** | Annually or on compromise | No |
| **Neon plan review** | Quarterly | No |

### Dependency updates

```bash
# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# Update a specific package
npm install <package>@latest
```

After any dependency update:
1. Run `npm run test`
2. Run `npx tsc --noEmit`
3. Run `npm run build`
4. Deploy and verify

---

## 11. Backup and Recovery

### Database backup status

**Provider:** Neon serverless PostgreSQL

**What Neon provides:** Neon includes automatic backups with point-in-time recovery (PITR). The retention window depends on the Neon plan tier.

**UNVERIFIED:** The current Neon plan tier and actual retention window must be confirmed in the Neon Console → Billing. Do not assume any specific retention window without verifying.

**No application-level backup scripts exist** in the repository. No `pg_dump` scheduled jobs, no Prisma-based export scripts.

### Storage asset backup status

| Asset type | Location | Backup |
|---|---|---|
| Product images | Cloudinary `nexchair/products/` | No independent backup — Cloudinary does not automatically export assets |
| Category images | Cloudinary `nexchair/categories/` | No independent backup |
| Spec sheet PDFs | Vercel Blob `products/spec-sheets/` | No independent backup |
| Catalogue PDFs | Vercel Blob `catalogues/` | No independent backup |

**Risk:** If the Cloudinary account is deleted or inaccessible, all product images are lost. If the Vercel Blob store is deleted, all PDFs are lost. Neither has an independent backup.

### Recovery procedure

**Before any restore, verify:**
1. What data was lost and when (use Neon PITR to identify the last clean point)
2. Whether the application schema is compatible with the restore target
   - If the restore point predates a migration, the restored DB will not have the newer columns/tables
   - Running `prisma migrate deploy` after restore would re-apply any missing migrations
3. Whether the restore will overwrite more recent data (e.g., new enquiries submitted after the incident point)

**Neon PITR restore approach:**
1. Log in to Neon Console
2. Find the branch to restore
3. Use the "Restore" or "Branch from time" feature to create a branch at the restore point
4. Verify the restored branch contains the expected data
5. If correct, switch the application `DATABASE_URL` to point to the restored branch
6. This avoids overwriting live data until the restore is verified

**Do not execute restore operations without reading the Neon documentation for your plan tier.**

---

## 12. Troubleshooting Reference

### Build failures

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| `Error: ADMIN_SESSION_SECRET is not set` | Missing env var | Build logs, `lib/auth/admin.ts:3` | Check `ADMIN_SESSION_SECRET` in Vercel env | Add env var, redeploy |
| `Cloudinary configuration error: missing environment variable(s)` | Missing Cloudinary vars | Build logs, `lib/cloudinary.ts` | Check which of 3 vars is missing | Add missing var(s), redeploy |
| `DATABASE_URL is not defined` | Missing DATABASE_URL | Build logs, `lib/prisma.ts` | Check Vercel env for `DATABASE_URL` | Add pooled connection string, redeploy |
| `Cannot find module '../generated/prisma/client'` | Prisma client not generated | Build logs | Build command must be `prisma generate && next build` | Verify `npm run build` script in `package.json` |
| TypeScript error in build | Type mismatch in source | Build logs, `tsc --noEmit` | Run `npx tsc --noEmit` locally | Fix the TypeScript error, push fix |
| `Module not found: Can't resolve 'server-only'` | Missing `server-only` package | Build logs | Run `npm install` | Add to dependencies if somehow missing |

### Database connection errors

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| `SSL connection required` | Missing `sslmode=require` | App error logs | Check DATABASE_URL | Add `?sslmode=require` to connection string |
| `Too many connections` | Using direct URL in serverless | Neon console | Check if `DATABASE_URL` is pooled URL | Switch to pooled URL in Vercel env |
| `P1001: Can't reach database server` | Wrong host/port or firewall | App error logs, Neon console | Verify host in Neon console; check connectivity | Correct hostname |
| `P1017: Server has closed the connection` | Connection pool exhausted or timeout | App error logs | Check Neon connection count | Use pooled URL; check for connection leaks |

### Authentication errors

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| Admin redirected to login after correct password | Invalid JWT cookie | Browser DevTools → Application → Cookies | Check `nexchair_admin_session` cookie is set; check `ADMIN_SESSION_SECRET` is correct | Verify env var is set correctly |
| Login blocked in production: "Too many attempts" | Upstash vars missing (fail-closed) | Server logs: "CRITICAL: Upstash credentials missing" | Check Vercel env for Upstash vars | Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` |
| "Invalid email or password" with correct credentials | Admin user not created | Admin portal | Run `npm run create-admin` | Run the create-admin script against production DB |
| Application crashes on startup | `ADMIN_SESSION_SECRET` missing | Build/runtime logs | Check Vercel env | Add `ADMIN_SESSION_SECRET` |

### Upload failures

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| Image upload fails: `Cloudinary configuration error` | Missing Cloudinary vars | Server logs | Check Vercel env for all 3 Cloudinary vars | Add missing vars |
| Image upload fails: validation error | Wrong MIME type or > 5 MB | Server response (StorageValidationError) | Check file type (JPEG/PNG/WebP) and size | Compress image; use correct format |
| PDF upload fails: 413 | Server Actions body size limit (12 MB) | Vercel logs | File exceeds 12 MB limit set in `next.config.ts` | Compress PDF; note known gap for catalogues > 12 MB |
| PDF upload fails: `BLOB_READ_WRITE_TOKEN not found` | Missing token | Server logs | Check Vercel env for `BLOB_READ_WRITE_TOKEN` | Add token from Vercel Blob dashboard |

### Email errors

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| Enquiries saved but no email sent | SMTP vars missing | Server logs: "Email is not configured" warning | Check all 5 SMTP vars in Vercel env | Configure SMTP vars |
| Auth error 535 | Wrong App Password | Nodemailer error log | Regenerate Gmail App Password | Update `SMTP_PASSWORD` in Vercel env |
| No customer acknowledgement | ORDER type submission | Expected behaviour | ORDER type does not trigger customer ack | No action needed |

### Google Sheets errors

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| Rows not appearing | Any Sheets var missing | Server logs | Check all 4 Sheets vars in Vercel env | Configure all 4 vars |
| 403 on append | Service account not shared | Server logs: "403 Forbidden" | Share spreadsheet with service account email | Add Editor access in Google Sheets share settings |
| Private key error | Key format issue | Server logs: JWT signing error | Check key has `\n` not literal newlines; check quotes | Re-paste key from service account JSON |

### Production-only issues

| Problem | Possible cause | File/Log | Investigation | Safe remedy |
|---|---|---|---|---|
| Works locally, fails in production | Missing env var on Vercel | Vercel build/function logs | Compare local `.env.local` with Vercel env variables | Add missing vars in Vercel dashboard |
| `force-dynamic` pages slow | Each request hits DB | Expected for `force-dynamic` pages | Check Neon query times | No change needed; this is by design |
| Images broken on production only | Cloudinary domain not whitelisted | Browser console: blocked image URL | Check `next.config.ts` `images.remotePatterns` | Already configured for `res.cloudinary.com` |
| Homepage video not loading | Video file missing from public/ | Browser DevTools | Check `/home-page-vid2.mp4` in `public/` | Verify file is committed; not gitignored |

---

## 13. Security and Environment Safety

### Environment variable handling

**Public vs server-only variables:**

| Prefix | Available | Used in |
|---|---|---|
| `NEXT_PUBLIC_` | Client-side + server-side | Only `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| (none) | Server-side only | All other variables |

Server-side only variables are **never sent to the browser**. The `lib/cloudinary.ts`, `lib/sheets.ts`, `lib/email.ts`, and `lib/ratelimit.ts` files all import `"server-only"`, which causes a build error if these modules are accidentally imported in client components.

### Secret storage

| Secret | Storage | Notes |
|---|---|---|
| `.env` / `.env.local` | Local filesystem only | Gitignored; never commit |
| Vercel env vars | Vercel dashboard | Encrypted at rest; never logged |
| `GOOGLE_PRIVATE_KEY` | `.env.local` / Vercel | Multi-line PEM key; redacted from error logs in `lib/sheets.ts` |

### Startup-time throws

Three modules throw synchronously at startup if credentials are missing:

| Module | Variable | Consequence |
|---|---|---|
| `lib/prisma.ts` | `DATABASE_URL` | Application crash |
| `lib/auth/admin.ts` | `ADMIN_SESSION_SECRET` | Application crash |
| `lib/cloudinary.ts` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Application crash |

This is intentional — these secrets are non-negotiable for secure operation.

### Database access security

- Neon connections require SSL (`sslmode=require` or explicit `rejectUnauthorized: true`)
- Pooled URL is used for the application — connection count is limited by the pool
- Direct URL is for Prisma CLI and scripts only
- No raw SQL queries — all database access goes through Prisma ORM

### Admin authentication security

- Passwords hashed with bcrypt, 12 rounds
- Sessions use HS256 JWT, 7-day expiry, httpOnly cookie (no JavaScript access)
- Login rate limited (5 attempts / 15 minutes, fail-closed in production)
- `ADMIN_SESSION_SECRET` rotation invalidates all sessions

### Upload security

- Uploaded file types and sizes are validated server-side in `lib/storage.ts` before reaching Cloudinary or Vercel Blob
- Server-generated IDs (not user filenames) used in storage paths — prevents path traversal
- All upload operations require a valid admin session (`requireAdminSession()`)

### Production and preview environment separation

**UNVERIFIED:** Whether Vercel preview deployments use different env vars from production. Recommended: scope sensitive vars (database, SMTP, Cloudinary) to **Production** only in Vercel. Preview deployments can use test credentials or leave integrations disabled.

---

## 14. Developer Command Reference

All commands run from the project root directory. All commands verified against `package.json`.

| Command | Purpose | Notes |
|---|---|---|
| `npm install` | Install all dependencies | Runs `postinstall: prisma skills sync` automatically |
| `npm run dev` | Start development server at `http://localhost:3000` | Hot reload enabled |
| `npm run build` | Production build — `prisma generate && next build` | Requires all REQUIRED env vars |
| `npm run start` | Start production server (requires `npm run build` first) | Runs `next start` |
| `npm run lint` | Run ESLint | Runs `eslint` |
| `npm run test` | Run all tests once and exit | Runs `vitest run`; no watch mode |
| `npx tsc --noEmit` | TypeScript type checking without output | Use before committing |
| `npx prisma generate` | Generate Prisma client into `generated/prisma/` | Required after clone or schema change |
| `npx prisma migrate deploy` | Apply all pending migrations to DB | Use for new DB setup or production deploy |
| `npx prisma migrate dev --name <name>` | Create new migration (dev only) | Do NOT run against production |
| `npx prisma migrate status` | Show which migrations are applied | Informational; safe on any DB |
| `npx prisma studio` | Open GUI at `http://localhost:5555` to browse DB | Safe for reads; be careful with edits |
| `npx prisma format` | Format `prisma/schema.prisma` | Run before committing schema changes |
| `npm run create-admin` | Create or update admin user | Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env |

### Scripts available but not part of regular workflow

| Command | Purpose | Notes |
|---|---|---|
| `npm run import-archive` | Import product archive from ZIP | One-time data import; already completed |
| `npm run update-images` | Update image URLs in DB | One-time script; already completed |

### Available but NOT a package script

| Command | Status | Notes |
|---|---|---|
| `prisma db seed` | WILL FAIL | No `"prisma": { "seed": "..." }` in `package.json`; seed file is legacy |

---

## 15. Outstanding Operational Risks

| Risk | Severity | Status | Details |
|---|---|---|---|
| **No CI/CD pipeline** | Medium | PENDING | Tests, type checks, and builds are not run automatically on push. Developer must run all checks manually. |
| **No staging environment** | Medium | PENDING | No separate staging database or Vercel preview environment with separate credentials. All development uses the production database (or a Neon branch manually created). |
| **No `.env.example` file** | Low | PENDING | A new developer has no reference for required variable names. Credentials must be obtained from the previous developer or from each external service dashboard individually. |
| **Catalogue PDF size vs Server Actions limit** | Medium | KNOWN GAP | `lib/storage.ts` accepts up to 25 MB PDFs, but `next.config.ts` sets `serverActions.bodySizeLimit: "12mb"`. Catalogue uploads between 12 MB and 25 MB will fail with a 413 error from Next.js before reaching the validation code. |
| **No asset backups** | High | PENDING | Cloudinary images and Vercel Blob PDFs have no independent backups. Loss of either service would result in permanent loss of all product images and documents. |
| **Database backup not verified** | High | UNVERIFIED | Neon PITR is advertised on paid plans but the current plan tier and retention window have not been confirmed. |
| **Fire-and-forget storage deletion** | Low | KNOWN | Storage asset deletions (Cloudinary, Vercel Blob) are performed with `.catch()` after DB deletion. Failed cleanup calls are logged but silently dropped — orphaned assets accumulate. |
| **`updateProduct()` overwrites full specs JSON** | Medium | KNOWN | Saving a product via the admin portal replaces the entire `specs` JSON with only `{ lumbar, back }`. Any other spec data stored directly in the JSON column is lost. |
| **Category slug regeneration** | Low | KNOWN | Renaming a category regenerates its slug, silently breaking all bookmarked `?category=SLUG` URLs without creating redirects. |
| **No audit log** | Low | PENDING | Admin mutations are not logged. No way to determine which admin performed which action after the fact. |
| **Admin user management** | Medium | PENDING | No UI for creating or deleting admin users. Requires direct database access or the `create-admin` script. |
| **Upstash env vars required in production** | High | PENDING (if not set) | Missing Upstash vars block admin login entirely in production (fail-closed). Verify these are set in Vercel before going live. |
| **GTM event tracking** | Low | UNVERIFIED | The GTM container script is present. What events, goals, and conversion tags are configured inside the GTM container is not documented or verified in the codebase. |
| **No `.env.example`** | Low | PENDING | No template file exists for environment variables. Document `05-environment-deployment-and-maintenance.md` (this file) serves as the reference. |
