# Kamla Marble Field Sales CRM

Interactive product preview of a field sales CRM for a marble manufacturer. Built with **Vite + React + TypeScript**. Sample data runs fully in the browser — no backend required.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Enter the workspace

On the login screen:

- **Explore as Admin** — dashboards, leaderboard, interactive territory map, all architects & visits
- **Explore as Field Sales** — pick a salesperson, manage architects, check in on the map, log visits

## Screens

| Role | Screens |
|------|---------|
| Shared | Role select |
| Admin | Dashboard, Leaderboard, Map View, Activity Timeline, Architects (+ referred sites), Architect detail, Visits log |
| Sales | My Architects, My Map, Activity Timeline, Architect detail, Add Architect, Add Site, Check-In (site/office), Visit Log, Visit History |

Architects are contacts/studios. Project **sites** are only those the architect referred for marble — check-ins happen at a site or at the architect office.

## Stack

- React 19 + Vite 8 + TypeScript
- React Router
- Recharts
- Leaflet + React Leaflet (CARTO / OSM tiles)
- Lucide icons

Sample data lives in `src/data/mockData.ts` (7 salespeople, 25 architects, 58 visits). Architects, visits, and check-ins you create are saved in `localStorage` for the session browser.
