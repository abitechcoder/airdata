# Airtime & Data Tracker

A mobile sales tracker for airtime and data sellers. Add customers, record their purchases, and review sales totals and customer history.

## Run & Operate

- `pnpm --filter @workspace/airtime-sales-tracker run dev` — run the mobile app
- `pnpm --filter @workspace/airtime-sales-tracker run typecheck` — check the mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Customer and sale records are stored on the device with AsyncStorage; no database environment variable is required for this app.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 6
- Mobile app: Expo, React Native, Expo Router
- Local persistence: AsyncStorage
- Shared workspace services include Express, PostgreSQL, and Drizzle; the mobile app does not currently use them.

## Where things live

- `artifacts/airtime-sales-tracker/app/` — overview, customers, sales, and customer detail screens
- `artifacts/airtime-sales-tracker/context/AppDataContext.tsx` — customer and sale records, with local persistence
- `artifacts/airtime-sales-tracker/constants/colors.ts` — light and dark themes

## Architecture decisions

- Records are saved locally on the device; they are not synced to another device.
- The amount saved for each sale is the amount paid by the customer, in whole naira.

## Product

Users can add customers, record airtime or data sales from MTN, Airtel, Glo, and 9mobile, review all transactions, and see a customer's purchase history and total.

## User preferences

This app is for tracking airtime and data sales for the user.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
