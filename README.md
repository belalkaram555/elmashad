# M4D CAFE POS

M4D CAFE POS is a desktop point-of-sale, inventory, treasury, and reporting application built with Electron, React, TypeScript, and SQLite. The codebase is structured as an offline-first local desktop system with a React UI, Electron IPC bridge, SQLite persistence, and localStorage fallback for a number of secondary modules.

This README is intentionally conservative. It describes only what is present in the repository files.

## Project Snapshot

- Desktop app runtime: Electron
- Frontend: React 19 + TypeScript + Vite
- Local database: SQLite via `better-sqlite3`
- State management: React Context + Zustand + localStorage fallback
- Localization: Arabic and English, with RTL/LTR support
- Printing: thermal receipt and A4-style document generation
- Packaging: Windows installer and portable builds through Electron Builder

## What Is Actually Implemented

### Fully Implemented Core Features

- Local authentication and role-based routing.
- POS sales flow with cart management, hold/resume orders, table assignment, shift gating, and receipt printing.
- Kitchen display workflow with order status updates.
- Dashboard analytics with recent sales, category summaries, low-stock alerts, and charts.
- Inventory management with CRUD and warehouse transfer support.
- Categories and menu item management.
- Customer management with debt settlement and transaction tracking.
- Supplier management with ledger-style views and payment tracking.
- Purchases entry with stock and treasury effects.
- Treasury transactions, cashflow tracking, and shift closure flow.
- General settings, company profile data, admin credential updates, and backup/restore.
- Print helpers for receipts, purchase invoices, vouchers, tax invoices, and table reports.
- ZATCA QR payload generation for tax invoice receipts.

### Partially Implemented or LocalStorage-Backed Features

- Accounting pages such as chart of accounts, journal entries, balance sheet, trial balance, and financial reports.
- Human resources pages such as payroll, attendance, and employee loans.
- Manufacturing pages such as BOM, manufacturing orders, and stock movement.
- Mobile sales pages such as vehicles, routes, operations, and settlements.
- Customer and supplier submodules such as receipts, price lists, discounts, and account statements.
- Invoice return and invoice reporting pages.
- Basic data setup pages such as banks, agents, and some price-list tools.

### Scaffold-Only or Mock-Oriented Areas

- Super-admin pages such as tenant management, subscriptions, audit logs, global settings, maintenance, branch management, notifications, and admin users.
- These pages are visually present but are not backed by a verified platform backend in the repository.

## Architecture

The application uses a hybrid local architecture:

1. React renders the UI and application routes.
2. Context providers manage authentication, domain data, language, and theme.
3. Electron preload exposes IPC access to the renderer.
4. Electron main process reads and writes local SQLite data and handles backup/restore dialogs.
5. Some secondary modules persist state in localStorage instead of the SQLite domain model.

There is no separate HTTP backend or public API layer in the repository.

## Main Modules

- `App.tsx` wires the application routes and protection logic.
- `context/AuthContext.tsx` handles local login and logout.
- `context/DataContext.tsx` owns the main business state and database synchronization.
- `database/schema.sql` defines the SQLite schema for the core operational data.
- `electron-main.js` registers the IPC handlers and app window.
- `preload.js` exposes the IPC bridge to the renderer.
- `utils/printService.ts` contains print helpers.
- `utils/zatca.ts` generates QR payloads for tax invoice receipts.
- `utils/backup.ts` handles backup export and restore flows.
- `store/cartStore.ts` persists POS cart state.
- `store/toastStore.ts` manages toast notifications.

## Verified Core Screens

- Login
- Dashboard
- POS
- Kitchen
- Tables
- Sales
- Purchases
- Inventory
- Categories
- Menu
- Customers
- Suppliers
- Treasury
- Employees
- Reports
- Settings

## CV-Oriented Summary

M4D CAFE POS is an Electron-based desktop ERP-style system for restaurant and retail operations. It combines POS checkout, kitchen order processing, inventory control, purchase management, customer and supplier ledgers, treasury workflows, reporting, printing, and backup/restore features in a single offline-first application. The implementation uses React 19, TypeScript, Vite, Zustand, Recharts, `better-sqlite3`, and Electron IPC, with bilingual Arabic/English UI support and RTL layout handling.

The repository also includes additional business modules for accounting, human resources, manufacturing, mobile sales, and invoice returns. These screens are present and functional to varying degrees, but several are backed by localStorage or mock data rather than the primary SQLite domain model, so they should be described carefully in any résumé or portfolio entry.

## Suggested Resume Wording

If you need to describe the project on a CV, keep the claim scope aligned with the codebase:

- Built an Electron desktop POS and inventory management system with SQLite persistence, role-based access control, and bilingual Arabic/English UI.
- Implemented sales checkout, kitchen order flow, warehouse transfers, purchase entry, treasury tracking, reporting, and receipt/invoice printing.
- Added backup/restore utilities, ZATCA QR generation, and reusable print workflows for operational documents.

## Tech Stack

- Electron
- React 19
- TypeScript
- Vite
- React Router DOM
- Zustand
- Recharts
- xlsx
- lucide-react
- qrcode.react
- better-sqlite3

## Development

Install dependencies:

```bash
npm install
```

Run the web UI in development mode:

```bash
npm run dev
```

Run Electron with the Vite dev server:

```bash
npm run electron:dev
```

Build the web bundle:

```bash
npm run build
```

Build a Windows installer:

```bash
npm run build:exe
```

Build a Windows portable package:

```bash
npm run build:portable
```

## Notes

- The application is designed as a local desktop system, not a web SaaS platform.
- Some pages look complete in the UI but still rely on localStorage or simplified data structures.
- The core operational system is the most reliable part of the codebase and should be the focus of any external description.
