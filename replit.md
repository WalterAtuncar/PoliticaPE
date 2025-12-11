# PoliticaPE - Political Analysis Platform

## Overview
Multi-project platform for political analytics in Peru, consisting of three sub-projects:
- **project-react**: Main frontend dashboard for analytics and monitoring (React + Vite + TypeScript + TailwindCSS)
- **project-scrapping**: FastAPI backend with web scraping, batch analysis, and REST API (Python)
- **project-sniffing**: Real-time streaming microservice with WebSocket support (Python/FastAPI)

## Plan de Trabajo
Ver **PLAN_DE_TRABAJO.md** para el plan detallado de implementación con 112 tareas organizadas en 7 fases.

## Current State
- Frontend (project-react): Configurado y funcionando en puerto 5000
- Backend scrapping: Por configurar
- Backend sniffing: Por configurar
- Base de datos: Por crear

## Project Structure
```
/
├── project-react/        # Main React frontend
│   ├── src/
│   │   ├── components/   # UI components organized by feature
│   │   ├── contexts/     # React contexts (Auth, Theme)
│   │   ├── hooks/        # Custom hooks for data management
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
│   └── vite.config.ts    # Vite configuration (port 5000, all hosts allowed)
├── project-scrapping/    # Backend scraping microservice
├── project-sniffing/     # Real-time streaming microservice
├── db/                   # Database DDL scripts
└── docs/                 # Technical documentation
```

## Running the Project
The frontend runs via the "Frontend" workflow on port 5000.

## Recent Changes
- 2025-12-11: Initial Replit setup
  - Configured Vite for port 5000 with all hosts allowed
  - Removed incompatible dependencies (react-instagram-embed, react-twitter-embed, react-facebook)
  - Set up Frontend workflow and deployment configuration

## Technologies
- Frontend: React 18, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, Leaflet
- Backend (not yet configured): FastAPI, SQLAlchemy, Celery, Redis
