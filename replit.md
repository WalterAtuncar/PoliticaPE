# PoliticaPE - Political Analysis Platform

## Overview
Multi-project platform for political analytics in Peru, consisting of three integrated sub-projects:
- **project-react**: Main frontend dashboard (React + Vite + TypeScript + TailwindCSS)
- **project-scrapping**: Batch data scraping and REST API (FastAPI + SQLAlchemy)
- **project-sniffing**: Real-time streaming microservice (FastAPI + WebSocket)

## Current State - FUNCTIONAL
All three projects are now running and integrated:

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| Frontend | 5000 | Running | React dashboard with login/analytics |
| Backend Scrapping | 8000 | Running | REST API + data scraping |
| Backend Sniffing | 8080 | Running | Real-time analysis + WebSocket |

## Demo Credentials
- Email: admin@politica.pe
- Password: password123

## Progress Summary (from PLAN_DE_TRABAJO.md)

| Phase | Total | Done | Omit | Pending |
|-------|-------|------|------|---------|
| Phase 1: Infrastructure | 9 | 9 | 0 | 0 |
| Phase 2: Backend Scrapping | 27 | 18 | 2 | 7 |
| Phase 3: Backend Sniffing | 18 | 18 | 0 | 0 |
| Phase 4: Frontend React | 27 | 11 | 0 | 16 |
| Phase 5: Frontend Sniffing | 12 | 0 | 12 | 0 |
| Phase 6: Testing | 9 | 1 | 0 | 8 |
| Phase 7: Deployment | 13 | 2 | 0 | 11 |
| Phase 8: Parties Research | 5 | 4 | 0 | 1 |
| **TOTAL** | **120** | **63** | **14** | **43** |

**Progress: 52% completed (65% including omitted)**

## Project Structure
```
/
├── PLAN_DE_TRABAJO.md      # Detailed work plan with task tracking
├── project-react/          # Frontend dashboard
│   ├── src/
│   │   ├── components/     # UI components (analytics, campaigns, monitoring, etc.)
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Data hooks (useRealtimeData, useWebSocket, useDashboardData, etc.)
│   │   ├── config/         # API configuration
│   │   └── types/          # TypeScript definitions
│   └── vite.config.ts      # Port 5000, all hosts allowed
├── project-scrapping/      # Batch processing backend
│   ├── app/
│   │   ├── api/endpoints/  # REST endpoints (data, scraping, analysis, auth)
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── services/       # Business logic (sentiment, analysis)
│   └── requirements-replit.txt
├── project-sniffing/       # Real-time streaming backend
│   └── microservice/
│       ├── main.py         # FastAPI app with WebSocket
│       └── requirements-replit.txt
├── db/                     # Database DDL and seed scripts
│   ├── ddl_postgres_final.sql
│   ├── seed_parties.py     # 9 political parties data
│   ├── seed_government.py  # Government data
│   ├── seed_samples.py     # Sample data
│   └── deploy.py           # Database deployment script
└── docs/                   # Technical documentation
```

## Running Workflows
- **Frontend**: `cd project-react && npm run dev`
- **Backend-Scrapping**: `cd project-scrapping && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- **Backend-Sniffing**: `cd project-sniffing/microservice && python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload`

## API Endpoints

### Backend Scrapping (port 8000)
- `GET /health` - Health check
- `POST /api/v1/auth/login` - Authentication with bcrypt
- `GET /api/v1/data/stats` - Data statistics
- `GET /api/v1/data/news` - News articles
- `GET /api/v1/data/social` - Social posts
- `GET /api/v1/data/government` - Government data
- `POST /api/v1/scraping/trigger/news` - Trigger news scraping
- `GET /api/v1/analysis/sentiment` - Sentiment analysis
- `GET /api/v1/analysis/trends` - Trend analysis
- `GET /docs` - API documentation

### Backend Sniffing (port 8080)
- `GET /health` - Health check
- `GET /api/metrics` - Streaming metrics
- `POST /api/analyze` - Analyze text for political sentiment
- `GET /api/recent` - Recent analyzed items
- `GET /api/crisis-alerts` - Crisis indicators
- `WS /ws/stream` - Real-time WebSocket stream
- `GET /docs` - API documentation

## Database
PostgreSQL with 27+ tables across schemas:
- `public`: Core tables (news_articles, raw_social_posts, government_data, political_parties)
- `realtime_data`: Live streaming data (live_streams)
- `identity`: Users and authentication
- `organization`: Tenants and campaigns

## Technologies
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, Leaflet
- **Backend**: FastAPI, SQLAlchemy, Pydantic, uvicorn, bcrypt
- **Database**: PostgreSQL (Neon-backed)
- **Monitoring**: Prometheus metrics

## Recent Changes

### 2025-12-25: Dev Team Commit (a671a9d6)
- Added `PLAN_DE_TRABAJO.md` with detailed task tracking
- Added database seed scripts for political parties (9 parties)
- Added seed scripts for government and sample data
- Updated `useRealtimeData.ts` with real API integration
- Added `update_parties_schema.py` for party data structure

### 2025-12-25: Phase 4 - Frontend Data Integration
**Completed:**
- Task 1-4: Integrated real news, social, sentiment data from backend
- Created `useDashboardData.ts` hook for dashboard metrics
- Connected all monitoring components with real data
- TrendChart and GeographicMap fetch from backend APIs
- Uses nullish coalescing (`??`) for proper zero value handling

**Pending:**
- Task 5: Complete authentication (sessions and tokens)
- Task 6: Configure production build

### 2025-12-11: Complete Replit Integration
- All 3 microservices configured and running
- Simplified dependencies (removed Redis, Celery, heavy ML)
- Database with 27 tables created and seeded
- Real-time sentiment analysis working
- WebSocket streaming configured
- Authentication with bcrypt added

## Key Frontend Hooks

| Hook | Purpose | Data Source |
|------|---------|-------------|
| `useDashboardData` | Main dashboard metrics | `/api/v1/data/stats`, `/api/v1/analysis/sentiment` |
| `useRealtimeData` | Monitoring page data | Multiple APIs + WebSocket |
| `useWebSocket` | Real-time alerts/posts | WebSocket `/ws/stream` |
| `useSocialData` | Social analytics | `/api/v1/data/social` |

## Data Flow Pattern
1. Hooks attempt to fetch real data from backend APIs
2. If backend has data, it's transformed to frontend types
3. If no data or error, falls back to mock data
4. `isUsingMockData` flag indicates data source to UI
5. Nullish coalescing (`??`) used to preserve zero values

## Design Decisions
- **No Redis/Celery**: Replaced by FastAPI BackgroundTasks
- **No Kafka**: Replaced by direct WebSocket broadcasting
- **No heavy ML models**: Rule-based sentiment analysis (keywords)
- **Port 8080 for Sniffing**: Port 8001 not available in Replit
- **bcrypt authentication**: Secure password validation
