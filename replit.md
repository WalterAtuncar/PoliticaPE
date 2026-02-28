# PoliticaPE - Political Analysis Platform

## Overview
PoliticaPE is a multi-project platform designed for political analytics in Peru. It aims to provide comprehensive insights by integrating data from various sources, including news, social media, and government data. The platform consists of a frontend dashboard for data visualization and user interaction, a batch processing backend for data scraping and API services, and a real-time streaming microservice for live analytics.

The project's vision is to offer a robust tool for monitoring political discourse, analyzing public sentiment, and tracking political trends in Peru, empowering users with data-driven insights.

## User Preferences
I want iterative development.
Ask before making major changes.
Do not make changes to `PLAN_DE_TRABAJO.md`.
Do not make changes to the `/db` folder.
Do not make changes to the `/docs` folder.

## System Architecture

### Core Architecture
The platform is composed of three integrated sub-projects:
-   **project-react**: Frontend dashboard built with React, Vite, TypeScript, and TailwindCSS. It provides a user interface for login, data visualization, and analytics.
-   **project-scrapping**: Backend for batch data scraping and REST API services, implemented with FastAPI and SQLAlchemy. It handles data ingestion, processing, and exposure through various endpoints.
-   **project-sniffing**: Real-time streaming microservice developed with FastAPI, utilizing WebSockets for live data analysis and updates.

### Technical Implementations
-   **Frontend**: Utilizes React 18, Vite, TypeScript, TailwindCSS for styling, Framer Motion for animations, Recharts for charting, and Leaflet for mapping. Key hooks like `useDashboardData`, `useRealtimeData`, `useWebSocket`, and `useSocialData` manage data fetching and state.
-   **Backend (Scrapping)**: Built with FastAPI, SQLAlchemy for ORM, Pydantic for data validation, and uvicorn as the ASGI server. Authentication uses bcrypt.
-   **Backend (Sniffing)**: FastAPI microservice focused on real-time data processing and WebSocket communication.
-   **Database**: PostgreSQL is used as the primary database, featuring a multi-schema design to organize core, real-time, identity, and organization-specific data.
-   **Data Scraping**: Custom scrapers for social media (TwitterAPI.io, YouTube Data API v3) and 12 Peruvian news sources using BeautifulSoup. News sources include: El Comercio, RPP, La República, Perú21, Gestión, Infobae Perú (prensa), Canal N, América TV, Panamericana TV, TV Perú (TV), Exitosa (radio), Andina (agencia oficial). Flexible multi-token configuration for social media APIs.
-   **Sentiment Analysis**: A lightweight rule-based Spanish lexicon is used for sentiment analysis, avoiding heavy ML dependencies.
-   **Deployment**: The `project-scrapping` backend can serve the `project-react` frontend directly in production via a reverse proxy and static file serving capabilities. WebSocket traffic is also proxied.

### Feature Specifications
-   **Authentication**: Secure user authentication with bcrypt.
-   **Data Analytics**: Comprehensive analytics dashboards displaying news, social media trends, government data, and sentiment analysis.
-   **News Monitoring**: Dedicated news monitoring page showing real-time articles scraped from 12 Peruvian media sources (newspapers, TV, radio, agency). Includes filtering by source/category/search, sentiment analysis, auto-refresh, and manual scraping trigger.
-   **Scraping Management**: Tools to trigger and monitor data scraping jobs, along with managing API tokens for various platforms.
-   **Configuration System**: A robust system for managing API tokens for social media platforms, including CRUD operations and connectivity testing.
-   **Regional Engagement Analysis**: Functionality to analyze political engagement based on geographical regions within Peru.
-   **Political Figures Management**: CRUD system for managing political figures with search keywords, social accounts, and monitoring priority. Keywords automatically sync with the scraping engine's search tags.
-   **AI Recommendations (Claude)**: Integration with Anthropic Claude API to generate strategic political recommendations based on real scraped data. The system gathers data from ALL sources (social posts, news articles, surveys, government data) within a 120-day window, classifies each mention by sentiment (positive/negative/neutral), extracts specific incidents/events, computes weekly trends, and sanitizes all data before sending to Claude. The AI generates per-incident recommendations: "remediar" for negative events (crisis management, step-by-step recovery plans) and "potenciar" for positive events (amplification strategies). Recommendations are persisted in the `ai_recommendations` table with status tracking, rating, and ROI metrics. Model: claude-sonnet-4-20250514, max_tokens: 8192.

### Design Choices
-   **Simplified Infrastructure**: Avoids heavy tools like Redis, Celery, or Kafka by leveraging FastAPI's background tasks and direct WebSocket broadcasting for efficiency in a Replit environment.
-   **No Heavy ML Models**: Opts for lightweight, rule-based sentiment analysis to reduce complexity and dependency.
-   **UUID Handling**: Pydantic schemas are configured to correctly serialize UUIDs to strings in API responses.
-   **Data Flow**: Frontend hooks prioritize fetching real data from the backend. If no data or an error occurs, the UI gracefully handles empty states.

## External Dependencies
-   **Database**: PostgreSQL (specifically Neon-backed for cloud deployment).
-   **Social Media APIs**:
    -   TwitterAPI.io (for Twitter data scraping)
    -   YouTube Data API v3 (for YouTube data scraping)
-   **AI**: Anthropic Claude API (for AI-powered political recommendations via ANTHROPIC_API_KEY).
-   **Monitoring**: Prometheus (for metrics exposure).

## Key Database Tables
-   `raw_social_posts`: Scraped social media posts (810+ records across YouTube, Twitter, Instagram)
-   `political_figures`: Political figures with search keywords, social accounts, monitoring config
-   `ai_recommendations`: AI-generated strategy recommendations linked to political figures
-   `search_tags`: Keywords for scraping (auto-synced with political figure keywords)
-   `social_api_tokens`: API credentials for social media platforms
-   `news_articles`: Scraped news articles from 12 Peruvian media sources (430+ records from El Comercio, La República, Gestión, Panamericana TV, Exitosa, TV Perú, Infobae, Perú21, Canal N, América TV, RPP)
-   `scraped_surveys`, `government_data`: Other scraped data sources