# NexChair — Technical Documentation

This documentation set covers the complete technical internals of the NexChair website: a Next.js 16.3.8 App Router application with a Neon PostgreSQL database, Cloudinary image storage, Nodemailer (Gmail SMTP) email delivery, and a Google Sheets lead-capture integration. The documents were written as a structured handover for engineers taking over or contributing to the codebase.

---

## Master Handover

**[06-complete-developer-handover.md](06-complete-developer-handover.md)**

This is the primary handover document. It is a consolidated, 20-chapter reference that synthesises all material from documents 00–05, adds cross-document consistency findings, and includes verified facts drawn directly from the source code. Start here for all onboarding and deep-dive reference work.

---

## Documentation Index

| # | File | Description | Approx. lines | Status |
|---|------|-------------|---------------|--------|
| 00 | [00-project-inventory.md](00-project-inventory.md) | Initial technical inventory: technology stack, routes, components, DB models, integrations, file structure | ~838 | Source document |
| 01 | [01-public-website-and-frontend.md](01-public-website-and-frontend.md) | Deep reference for all public pages, components, design system, assets, fonts, animations, legacy code | ~1 658 | Source document |
| 02 | [02-database-schema-reference.md](02-database-schema-reference.md) | Full field-level documentation for all 7 Prisma models, relationships, enums, and migration history | ~600 | Source document |
| 03 | [03-enquiry-workflow-end-to-end.md](03-enquiry-workflow-end-to-end.md) | Complete enquiry lifecycle: forms, Server Actions, rate limiting, email, Google Sheets integration | ~1 000 | Source document |
| 04 | [04-admin-portal-and-operations.md](04-admin-portal-and-operations.md) | Admin portal: authentication flow, all 8 admin routes, 25 Server Actions, security observations | ~1 505 | Source document |
| 05 | [05-environment-deployment-and-maintenance.md](05-environment-deployment-and-maintenance.md) | Environment variable reference, local dev setup, Vercel deployment, troubleshooting, maintenance | ~1 200 | Source document |
| 06 | [06-complete-developer-handover.md](06-complete-developer-handover.md) | Consolidated 20-chapter master handover with Mermaid diagrams, consistency audit (Appendix A), and new-developer checklist | 2 090 | Master handover |

---

## Recommended Reading Order

1. **New to the project?** Read `06-complete-developer-handover.md` Chapters 1–3 (Overview, Architecture, Repository Structure) for a fast orientation, then follow the new-developer checklist in Chapter 20.

2. **Setting up a local environment?** Go directly to `06-complete-developer-handover.md` Chapter 14 (Local Environment Setup) or its source, `05-environment-deployment-and-maintenance.md`.

3. **Debugging a specific subsystem?** Use the master handover (document 06) as your entry point — each chapter cross-references the relevant source document for deeper detail.

4. **Reviewing the database schema in full?** `02-database-schema-reference.md` has the most complete field-level reference; `06-complete-developer-handover.md` Chapter 8 provides a summary with an ER diagram.

---

## Intended Audience

Software developers, technical leads, and DevOps engineers taking over or working on the NexChair website.

---

## Last Update

2026-11-24
