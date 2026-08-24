# DCT Marble Sales CRM (UI Demo)

Web demo of a field sales CRM for a marble manufacturing company. Built with **Vite + React + TypeScript**. All data is hardcoded locally — no backend, auth, Maps API, or GPS.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Demo entry

On the login screen:

- **Admin** — dashboards, leaderboard, static map, all architects & visits
- **Salesperson** — pick a persona (e.g. Arjun Mehta / Priya Sharma), then manage architects, check in, and log visits

## Screens

| Role | Screens |
|------|---------|
| Shared | Role select |
| Admin | Dashboard, Leaderboard, Map, Architects, Architect detail, Visits log |
| Sales | My Architects, Add Architect, Check-In, Visit Log, Visit History |

## Stack

- React 19 + Vite 8 + TypeScript
- React Router
- Recharts
- Lucide icons

Mock data lives in `src/data/mockData.ts` (7 salespeople, 25 architects, 58 visits).
