# M4D CAFE POS

A cafeteria/coffee-shop POS and accounting system (Arabic RTL UI) with gaming session management (PlayStation & Billiard). Full Express + Neon PostgreSQL backend with offline-first IndexedDB sync.

## Run & Operate

- **Two separate workflows must both be running:**
  - `Start application` workflow → `npm run dev` (Vite, port 5000, webview)
  - `Start server` workflow → `npm run server` (Express, port 3001, console)
- `npm run dev:all` — runs both together via concurrently (dev-only convenience)
- `npm run build` — production Vite build
- **Required env var:** `NEON_DATABASE_URL` (set as Replit shared secret) — Neon PostgreSQL connection string
- **Optional:** `SERVER_PORT` (default 3001)

## Stack

- React 19 + TypeScript (zero TS errors)
- Vite 5 (bundler & dev server, port 5000)
- Express.js 5 (API server, port 3001)
- Neon PostgreSQL via `pg` pool (`NEON_DATABASE_URL`)
- IndexedDB via `idb` (offline cache, store key: `elmashad-cafe-offline`)
- React Router DOM 6 (HashRouter)
- Zustand (cart + toast stores)
- Recharts (charts)
- Tailwind CSS (CDN via index.html)

## Where things live

- `server/index.js` — Express entry; mounts all routes; runs schema init + seed on startup
- `server/db.js` — PostgreSQL pool (NEON_DATABASE_URL || DATABASE_URL)
- `server/schema.sql` — 19-table DDL (categories, menu_items, orders, inventory, gaming_devices, gaming_sessions, …)
- `server/seed.js` — idempotent seed with ON CONFLICT DO NOTHING
- `server/routes/` — one file per resource (categories, menu, orders, inventory, warehouses, customers, suppliers, purchases, treasury, employees, attendance, loans, shifts, settings, notifications, gaming, tables, counters, syncRoute)
- `services/api.ts` — full REST client; `isOnline()` helper
- `services/offlineDB.ts` — IndexedDB wrapper: `idbGetAll`, `idbPut`, `idbDelete`, `idbBulkPut`
- `services/syncService.ts` — `initSyncService`, `queueOperation`, `processSyncQueue`
- `context/DataContext.tsx` — API-first load with IndexedDB fallback; exposes `gamingDevices/setGamingDevices`, `gamingSessions/setGamingSessions`; all CRUD goes through `writeAndSync`
- `store/cartStore.ts` — HeldOrder v3 (orderType/customerName/customerId/label)
- `pages/Gaming/PlayStation.tsx` — uses DataContext state + direct API/sync calls
- `pages/Gaming/Billiard.tsx` — uses DataContext state + direct API/sync calls
- `types.ts` — all shared TypeScript types

## Architecture decisions

- HashRouter kept for portability
- API-first: DataContext loads from `/api/*`; falls back to IndexedDB if offline; writes always go to API + IndexedDB + sync queue
- Vite proxy: `/api` → `http://localhost:3001` (vite.config.ts)
- Gaming devices/sessions use DataContext state filtered by type; mutations sync to Neon + IndexedDB
- Dead ERP modules (Kitchen, Tables, Manufacturing, HR, MobileSales, TreasuryBanks, CustomerManagement) remain on disk but are unreachable routes and have `// @ts-nocheck`
- `NEON_DATABASE_URL` used instead of runtime-managed `DATABASE_URL`

## Product

- POS: Takeaway or Customer order type; Cash/InstaPay/Credit payment; held orders panel
- Sales Invoices: 7-column table with items detail, employee, customer, payment badge; view/edit/print
- Dashboard, inventory with stock movement, menu & category management
- Customers & Suppliers management
- PlayStation & Billiard session management: device CRUD, start/end session, auto-billing by hour, customer linking

## User preferences

_Populate as you build_

## Gotchas

- Tailwind CSS loaded via CDN — no PostCSS plugin
- Gaming timers refresh every 30s (not real-time tick)
- Cart store key: `elmashad-cafe-cart-storage-v3`
- Server auto-runs schema init + seed on every start (idempotent via ON CONFLICT DO NOTHING)
- `idb` library needs `as any` casts for store access due to TS strict narrowing

## Pointers

- Vite config: `vite.config.ts`
- DB schema: `server/schema.sql`
- Types: `types.ts`
- Seed: `server/seed.js`
