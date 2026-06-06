# 3D Print Cost

A single-user PWA for calculating the true cost of 3D prints and managing profit margins. Installable on any device, works fully offline. No login required — all data stays on your device.

**Live app:** [3dprintcost.vercel.app](https://3dprintcost.vercel.app)

---

## Features

- **Real-time cost breakdown** — material, electricity, printer depreciation, labour, and waste buffer update as you type
- **FDM & Resin** support with per-printer profiles
- **Markup / margin pricing modes** — set a target markup % or gross margin %
- **Printer & material library** — save profiles, reuse across jobs
- **Job history** — browse, search, expand, and clone past jobs back to the calculator
- **Draft persistence** — calculator state survives page reloads
- **Offline-first PWA** — installable on desktop and mobile, works without internet
- **Data backup / restore** — export all data as JSON, import on any device

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Dexie.js v4 (IndexedDB) |
| State | Zustand v4 |
| PWA | Manual service worker (`public/sw.js`) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or pnpm / yarn / bun)

### Local development

```bash
git clone https://github.com/KlemenDobrota/3d-print-cost.git
cd 3d-print-cost
npm install
cp .env.example .env.local   # edit if needed (optional for local dev)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | Full URL of the deployed app (e.g. `https://your-app.vercel.app`). Used by the PWA manifest. Falls back to `localhost` in dev. |

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KlemenDobrota/3d-print-cost)

Or manually:

```bash
npm i -g vercel
vercel deploy --prod
```

Set `NEXT_PUBLIC_APP_URL` in **Vercel → Project → Settings → Environment Variables**.

---

## Cost Calculation

### FDM

```
materialCost     = filamentUsedGrams × (pricePerKg / 1000)
electricityCost  = (wattage / 1000) × (printTimeHours) × electricityRate
depreciationCost = (purchasePrice / lifetimeHours) × printTimeHours
labourCost       = (labourTimeMinutes / 60) × labourRate   (0 if labour disabled)
wasteCost        = subtotal × (failureRate / 100)
totalCost        = subtotal + wasteCost
```

### Resin

Same as FDM, except: `materialCost = resinUsedMl × (pricePerLitre / 1000)`

### Pricing

- **Markup mode:** `sellingPrice = totalCost × (1 + markup / 100)`
- **Margin mode:** `sellingPrice = totalCost / (1 − margin / 100)`

---

## License

MIT — see [LICENSE](LICENSE).
