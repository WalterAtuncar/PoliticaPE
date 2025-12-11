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

## Project Structure
```
/
├── project-react/          # Frontend dashboard
│   ├── src/
│   │   ├── components/     # UI components (analytics, campaigns, monitoring, etc.)
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Data hooks (useRealtimeData, useWebSocket, etc.)
│   │   ├── config/         # API configuration
│   │   └── types/          # TypeScript definitions
│   └── vite.config.ts      # Port 5000, all hosts allowed
├── project-scrapping/      # Batch processing backend
│   ├── app/
│   │   ├── api/endpoints/  # REST endpoints (data, scraping, analysis)
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── services/       # Business logic (sentiment, analysis)
│   └── requirements-replit.txt
├── project-sniffing/       # Real-time streaming backend
│   └── microservice/
│       ├── main.py         # FastAPI app with WebSocket
│       └── requirements-replit.txt
├── db/                     # Database DDL scripts
└── docs/                   # Technical documentation
```

## Running Workflows
- **Frontend**: `cd project-react && npm run dev`
- **Backend-Scrapping**: `cd project-scrapping && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- **Backend-Sniffing**: `cd project-sniffing/microservice && python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload`

## API Endpoints

### Backend Scrapping (port 8000)
- `GET /health` - Health check
- `GET /api/v1/data/stats` - Data statistics
- `GET /api/v1/data/news` - News articles
- `GET /api/v1/data/social` - Social posts
- `POST /api/v1/scraping/trigger/news` - Trigger news scraping
- `GET /api/v1/analysis/sentiment` - Sentiment analysis
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
- `public`: Core tables (news_articles, raw_social_posts, government_data)
- `realtime_data`: Live streaming data (live_streams)
- `identity`: Users and authentication
- `organization`: Tenants and campaigns

## Technologies
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, Leaflet
- **Backend**: FastAPI, SQLAlchemy, Pydantic, uvicorn
- **Database**: PostgreSQL (Neon-backed)
- **Monitoring**: Prometheus metrics

## Recent Changes
- 2025-12-11: Complete Replit integration and frontend-backend connection
  - All 3 microservices configured and running
  - Simplified dependencies (removed Redis, Celery, heavy ML)
  - Database with 27 tables created and seeded
  - Real-time sentiment analysis working
  - WebSocket streaming configured
  - API endpoints fully functional
  - Authentication endpoint added (POST /api/v1/auth/login)
  - Frontend connected to real backend APIs
  - useWebSocket hook integrated with Backend-Sniffing
  - AuthContext updated to use backend authentication
