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

### 2026-01-09: Social Media Scrapers Integration
**Twitter via TwitterAPI.io (alternative API):**
- Created `TwitterAPIioScraper` class with X-API-Key authentication
- Endpoints: `/api/v1/scraping/trigger/twitterapi-io`, `/api/v1/scraping/test/twitterapi-io`
- Searches for political keywords: "Peru politica OR congreso peru OR presidente peru"
- **Optimized for engagement**: Uses `queryType: "Top"` and `min_faves:10` filter
- Status: **62 tweets imported** with 21,284 likes, 5,166 retweets, 824,354 views
- Cost: ~$0.15 per 1,000 tweets (much cheaper than official Twitter API)

**Frontend Scraping Panel:**
- New "Importar Datos" tab in Settings page
- Platform cards for Twitter and YouTube with import buttons
- Scraping history table with status, items imported, and dates
- Hook `useScrapingControl.ts` for API integration

**YouTube Data API v3:**
- Created `YouTubeScraper` class with API key authentication
- Endpoints: `/api/v1/scraping/trigger/youtube`, `/api/v1/scraping/test/youtube`
- Searches for political content with engagement metrics (likes, views, comments)
- Status: **42 real videos imported** with 17,119 likes and 599,347 views

**Regional Engagement (Departamentos de Perú):**
- Scraper extracts `author.location` from Twitter user profiles
- `parse_peru_region()` function identifies 25 departamentos de Perú
- Regional mapping: Lima, Arequipa, Cusco, Piura, La Libertad, Lambayeque, etc.
- Categories: Specific region (Lima, Cusco), Nacional (Peru sin especificar), Internacional
- Endpoint: `/api/v1/analysis/regional-engagement` returns engagement by region

**Sentiment Analyzer Rewrite:**
- Replaced transformers ML model with lightweight rule-based Spanish lexicon
- Keywords: positive/negative words, intensifiers, negators
- No external ML dependencies required

**Scraping Infrastructure:**
- Background task processing with ScrapingLog tracking
- Duplicate detection via post_id
- Auto sentiment scoring on import
- Rate limiting: Twitter 450 req/15min, YouTube 10k quota/day

### 2026-01-09: Complete Mock Data Elimination
**Backend Analysis Endpoints:**
- Added 7 new analysis endpoints: `/analysis/time-series`, `/analysis/platform-breakdown`, `/analysis/share-of-voice`, `/analysis/top-posts`, `/analysis/trending-topics`, `/analysis/regional-engagement`, `/analysis/engagement`
- All endpoints extract real data from `NewsArticle` and `RawSocialPost` tables
- Share of voice uses keyword matching for parties/political figures

**Frontend Hooks Architecture:**
- Created `useAdvancedAnalytics.ts` with 7 specialized hooks for analytics data
- Cleaned all data hooks removing mock fallbacks: `useNewsData`, `useDashboardData`, `useSocialData`, `useAnalyticsData`, `useGovernmentData`
- All hooks handle loading/error/empty states properly

**Analytics Components Updated:**
- `TrendAnalysis`, `EngagementMetrics`, `ShareOfVoice`, `DemographicInsights` consume real data
- Components display "no data available" messages when backend returns empty arrays
- `GeographicMap` and `Header` updated to fetch real data from APIs

**Mock Data Infrastructure Removed:**
- Deleted `mockData.ts` file completely
- Removed all imports and references to mock data
- Platform now uses ONLY real database data

**Data Policy:** NO mock data under any circumstances - empty states shown when no data available

### 2026-01-09: Production Deployment Configuration
**Reverse Proxy Gateway:**
- Added httpx-based proxy routes in scrapping backend for sniffing service endpoints
- Proxy endpoints: `/api/metrics`, `/api/analyze`, `/api/recent`, `/api/crisis-alerts`
- All proxies preserve upstream HTTP status codes using JSONResponse
- Graceful fallbacks for connection/timeout errors (return empty data with 200)
- Other errors return 502 Bad Gateway

**WebSocket Proxy:**
- Added WebSocket proxy at `/ws/stream` using websockets library
- Bidirectional forwarding between client and sniffing service

**Static File Serving:**
- Root "/" serves SPA index.html when SERVE_FRONTEND=true
- Catch-all route serves SPA for all non-API routes in production
- Static assets mounted from `/assets` directory

**Environment Variables:**
- `SERVE_FRONTEND`: Set to "true" to serve frontend from FastAPI
- `SNIFFING_URL`: HTTP URL for sniffing service (default: http://localhost:8080)
- `SNIFFING_WS_URL`: WebSocket URL for sniffing service (default: ws://localhost:8080)

**Deployment Configuration:**
- Build: `npm run build` in project-react
- Run: Both sniffing service (port 8080) and scrapping service (port 5000) with SERVE_FRONTEND=true

### 2026-01-09: Frontend-Backend API Integration Fix
**Backend fixes:**
- Fixed Pydantic schemas: Added `BaseResponseModel` with UUID-to-string field validator
- Updated all response schemas (News, Social, Government, Campaign, etc.) to properly serialize UUIDs
- All data APIs now return 200 OK: `/api/v1/data/news`, `/api/v1/data/social`, `/api/v1/data/government`
- Sentiment API requires `source_type` parameter: `/api/v1/analysis/sentiment?source_type=news`

**Frontend fixes:**
- `useNewsData.ts`: Updated to handle array API response (not wrapped in `{articles: []}`)
- `useSocialData.ts`: Fixed mapping for `engagement_metrics` object from backend
- `useDashboardData.ts`: Added `source_type=news` parameter to sentiment API call
- All hooks include `isUsingMockData` flag and graceful fallback to mock data

**Progress:** 55% completed (68 of 123 tasks)

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
