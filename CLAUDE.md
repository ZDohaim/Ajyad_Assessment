# TenderTrack — Project Guide

## What We're Building

A lightweight SaaS platform for SMEs to discover public procurement tenders, analyze competition, and make better bidding decisions. Based on FRD.md.

**Evaluated on:** ship speed, data structuring, AI usage, product judgment — NOT perfect code or UI.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Database | Supabase (hosted PostgreSQL + Auth) |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| PDF | @react-pdf/renderer (client-side) |
| AI | OpenRouter.ai via `openai` npm package |
| Deployment | Vercel (GitHub Pages cannot host Next.js API routes) |

---

## UI Design Language

Match the aesthetic of **jyad.sa** — a professional Saudi B2B services company. The design should feel like a premium procurement intelligence tool, not a generic dashboard template.

### Color Palette
```css
/* Brand colors — dark professional theme */
--background: #0a0f1e;          /* deep navy background */
--surface: #0f1629;             /* card/panel surface */
--surface-elevated: #141d35;    /* elevated elements */
--border: #1e2d4a;              /* subtle borders */
--border-strong: #2a3f6b;       /* visible borders */

/* Accent — teal/cyan (matches jyad.sa energy) */
--accent: #00c4b4;              /* primary action color */
--accent-hover: #00a89a;
--accent-muted: rgba(0, 196, 180, 0.1);

/* Text */
--text-primary: #f0f4ff;        /* near-white */
--text-secondary: #8899bb;      /* muted labels */
--text-tertiary: #4d6080;       /* disabled/placeholder */

/* Status colors */
--status-active: #22d3a0;       /* green — active tenders */
--status-awarded: #3b82f6;      /* blue — awarded */
--status-expired: #4d6080;      /* muted grey — expired */
--status-winner: #22d3a0;       /* winning proposal */
--status-loss: #4d6080;

/* Data/chart palette */
--chart-1: #00c4b4;
--chart-2: #3b82f6;
--chart-3: #8b5cf6;
--chart-4: #f59e0b;
--chart-5: #ef4444;
```

### Typography
- **Font**: Inter (via `next/font/google`) — clean, professional, renders well in both LTR and RTL
- **Headings**: `font-semibold`, tracking slightly tight
- **Body**: `text-sm` for tables/data, `text-base` for content
- **Mono**: For bid amounts use `font-mono tabular-nums` so numbers align in tables

### Layout
- **Sidebar navigation** — fixed left sidebar (240px), content area takes remaining width
- Sidebar: dark surface (`--surface`), logo at top, nav links with icon + label, active link gets accent left border + accent text
- Top of content area: page title + optional action button (right-aligned)
- **No rounded corners on cards that touch the edge** — only inner content cards get `rounded-xl`

### Component Styles

**Cards:**
```
bg: --surface, border: 1px solid --border, rounded-xl, p-6
Hover state: border-color transitions to --border-strong
```

**Tables:**
```
Header row: bg --surface-elevated, text --text-secondary, text-xs uppercase tracking-wide
Body rows: border-b --border, hover bg --surface-elevated/50
Winning row: bg accent-muted, left border 2px solid --status-winner
```

**Badges:**
```
Active:   bg green-500/10  text green-400   border green-500/20
Awarded:  bg blue-500/10   text blue-400    border blue-500/20
Expired:  bg slate-500/10  text slate-400   border slate-500/20
Winner:   bg teal-500/10   text teal-300    border teal-500/20
```

**Buttons:**
```
Primary:  bg --accent, text white, hover bg --accent-hover, rounded-lg
Ghost:    transparent, text --text-secondary, hover bg --surface-elevated
Outline:  border --border, text --text-primary, hover border --border-strong
```

**KPI/Stat Cards:**
- Large number in `text-3xl font-bold text-white`
- Label below in `text-xs text-secondary uppercase tracking-widest`
- Optional icon top-right in accent color
- Thin accent border-top: `border-t-2 border-accent`

### Charts (Recharts)
- Background: transparent (inherits card background)
- Grid lines: `#1e2d4a` (match --border)
- Tooltip: dark surface with border, `rounded-lg shadow-xl`
- Bar fill: `--accent` for normal, `--status-winner` for winning, `--status-expired` for neutral
- Axis text: `--text-secondary`, `text-xs`

### Sidebar Navigation Structure
```
[Logo: TenderTrack]
---
Tenders        (grid icon)
Companies      (building icon)
Analytics      (bar chart icon)
Insights       (sparkle/AI icon)
---
Account        (user icon)  ← bottom of sidebar
```

### Bilingual Note
The app is English-only for now. Do NOT add RTL support — it adds complexity. If Arabic is needed later, it can be layered on.

---

## Data Model (Supabase PostgreSQL)

```sql
-- Run in Supabase SQL editor
create table tender (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  agency text not null,
  sector text not null,
  region text not null,
  status text not null check (status in ('active', 'awarded', 'expired')),
  published_at timestamptz,
  deadline timestamptz,
  awarded_at timestamptz,
  description text,
  estimated_value numeric,
  created_at timestamptz default now()
);

create table company (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  region text,
  created_at timestamptz default now()
);

create table proposal (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tender(id) on delete cascade,
  company_id uuid references company(id) on delete cascade,
  bid_amount numeric not null,
  is_winner boolean default false,
  rank int,
  submitted_at timestamptz default now()
);

-- Profile extends Supabase Auth user
create table profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  updated_at timestamptz default now()
);

-- RLS
alter table tender enable row level security;
alter table company enable row level security;
alter table proposal enable row level security;
alter table profile enable row level security;

-- Public read for tender/company/proposal
create policy "Public read tenders" on tender for select using (true);
create policy "Public read companies" on company for select using (true);
create policy "Public read proposals" on proposal for select using (true);

-- Service role can write everything (for import script)
-- Profile: owner only
create policy "Users manage own profile" on profile
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...     # get via: curl -X POST "https://automation.jyad.sa/webhook/request-task-key?email=ziadaldohaim@gmail.com"
                            # NOTE: if that URL returns 404, request the key directly from the assessment team
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## File Structure

```
/
├── supabase/
│   └── migrations/001_init.sql
├── scripts/
│   ├── import.ts           ← maps provided dataset → DB
│   └── seed-mock.ts        ← Faker.js fallback (faker.seed(42))
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              ← sidebar + auth guard
│   │   │   ├── tenders/page.tsx        ← feed with filters
│   │   │   ├── tenders/[id]/page.tsx   ← detail + PDF export
│   │   │   ├── companies/page.tsx
│   │   │   ├── companies/[id]/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── insights/page.tsx
│   │   │   └── account/page.tsx
│   │   └── api/
│   │       ├── tenders/route.ts
│   │       ├── tenders/[id]/route.ts
│   │       ├── companies/route.ts
│   │       ├── companies/[id]/route.ts
│   │       ├── analytics/route.ts
│   │       ├── insights/route.ts       ← streaming AI
│   │       └── account/route.ts
│   ├── components/
│   │   ├── ui/                         ← shadcn
│   │   ├── layout/
│   │   │   └── Sidebar.tsx
│   │   ├── tenders/
│   │   │   ├── TenderFilters.tsx
│   │   │   ├── TenderTable.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── companies/
│   │   │   ├── StatsBar.tsx
│   │   │   └── BidHistoryChart.tsx
│   │   ├── analytics/
│   │   │   ├── TopCompaniesChart.tsx
│   │   │   ├── DensityChart.tsx
│   │   │   └── PricingTable.tsx
│   │   ├── insights/
│   │   │   └── InsightCard.tsx         ← AI streaming display
│   │   └── pdf/
│   │       └── TenderPDF.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts               ← browser client
│       │   └── server.ts               ← server-side client (cookies)
│       ├── openrouter.ts
│       └── utils.ts                    ← cn(), formatCurrency(), formatDate()
└── CLAUDE.md (this file)
```

---

## Feature Specs

### Tenders Feed (`/tenders`)
- Server component reads `searchParams`: `sector`, `agency`, `region`, `status`
- Columns: Title, Agency, Sector, Region, Status badge, Deadline, # Bidders, Winning bid
- `TenderFilters.tsx` is a client component: 4 shadcn `<Select>` dropdowns, updates URL with `router.push()`
- Empty state: "No tenders match your filters" with a reset button

### Opportunity Detail (`/tenders/[id]`)
- Tender metadata in a top card
- Proposals table: Company (→ company page), Bid amount (`font-mono`), Rank, Winner row highlighted, `+12.4%` column (distance from winning bid)
- PDF Export: client-side `@react-pdf/renderer`, button triggers in-browser generation + download

### Company Intelligence (`/companies/[id]`)
- 5 KPI cards: Participations, Wins, Win Rate %, Avg Bid, Avg Rank
- Bar chart (Recharts): bid amounts across recent tenders, green bar = win, muted = loss
- Recent activity table: last 10 proposals

### Market Analytics (`/analytics`)
Three sections:
1. **Top Companies** — horizontal BarChart, filterable by sector/agency
2. **Competitive Density** — BarChart of tenders by bidder count, color-coded (red >8, yellow 4-8, green <4)
3. **Pricing Analysis** — table sortable by spread %, columns: Min/Max/Winning bid, Spread

### Market Insights (`/insights`)
Pre-computed on page load, three panels:
1. Companies with >5 bids and <20% win rate
2. Tenders where winner was NOT lowest bidder (`is_winner=true AND rank > 1`)
3. Agencies ranked by avg price spread %

Each panel has **"Generate AI Insight"** button → streams narrative from OpenRouter.

### PDF Export
`TenderPDF.tsx` — react-pdf document: header, tender metadata block, proposals table. No server call needed.

---

## AI Integration

```ts
// src/lib/openrouter.ts
import OpenAI from 'openai'
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'TenderTrack',
  },
})
```

**Model**: `mistralai/mistral-7b-instruct` (free tier, fast)

`POST /api/insights` accepts `{ type, data }`, streams OpenRouter response as `ReadableStream`.
`InsightCard` reads stream via `response.body` reader, appends chars to state for typing effect.

---

## Dataset Import

**When dataset is provided:**
- `scripts/import.ts` — reads CSV or JSON, maps columns to schema, upserts via Supabase service role client
- Edit the `columnMap` constant at top of file to match the actual dataset columns

**Fallback (no dataset yet):**
- `scripts/seed-mock.ts` — Faker.js, `faker.seed(42)`, generates 150 tenders / 40 companies / ~700 proposals
- Winner logic: 70% lowest bidder wins, 20% second-lowest, 10% random (seeds non-lowest-winner insight)

---

## Build Order

1. `npx create-next-app` + all deps + shadcn init
2. Supabase project + `001_init.sql`
3. Supabase client/server lib files
4. Auth (login/register pages + middleware)
5. Dataset import / mock seed → verify data in Supabase
6. Tenders feed + detail (highest value, build first)
7. PDF export
8. Company pages
9. Analytics dashboard
10. Insights + AI
11. Account page
12. Polish: sidebar, badges, empty states
13. Vercel deploy + smoke test

---

## Deployment

**Vercel** (not GitHub Pages — GitHub Pages is static only, no API routes):
1. Push to GitHub
2. Import at vercel.com → auto-detects Next.js
3. Add env vars in Vercel dashboard
4. Deploy → public URL (e.g. `tendertrack.vercel.app`)

---

## Dependencies

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install @supabase/supabase-js @supabase/ssr
npm install openai
npm install recharts
npm install @react-pdf/renderer
npm install react-hook-form zod @hookform/resolvers
npm install @faker-js/faker --save-dev
npx shadcn@latest init
npx shadcn@latest add button input card table badge dialog select form dropdown-menu separator skeleton avatar
```
