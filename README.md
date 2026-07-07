# RoofingSuite — "Views" Prototype

A clickable, front-end-only prototype for client sign-off. **Mock data only — no backend,
no auth.** Built to review two things before real development:

1. **Views** — homeowner-centric (de-duplicated) **Prospects** and **Customers** lists that
   support faceted filtering, sorting, row selection, and **CSV export**.
2. **Field cleanup** — proposed column/field sets for **Accounts, Contacts, Sales Projects,
   Field Projects** (list views + add/edit form mockups).

## Key concepts demonstrated

- **One row per homeowner** — the Views de-duplicate by primary contact. A homeowner with
  multiple accounts/projects appears once, and can show in both Prospects and Customers.
- **On-screen columns ≠ CSV columns** — the list stays lean (phone/city/zip on screen for
  mobile + storm targeting); the CSV export adds street address, email, etc. A blue legend
  above each table lists the CSV-only fields.
- **Demo flows:**
  - *Holiday cards:* Customers → filter **Customer Since** to 2026 → Export all filtered.
  - *Post-storm:* Prospects → filter **County = Butler** (or a Zip) → select rows → Export selected.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the build
```

## Tech

Vite + React + TypeScript, MUI v7 (approximating the real RoofingSuite theme), react-router-dom.
Mock data is deterministic (seeded) — see `src/data/mockData.ts`.

## Deploy (Vercel)

Framework preset: **Vite**. Build command `npm run build`, output `dist/`. No env vars.
