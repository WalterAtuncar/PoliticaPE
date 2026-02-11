import asyncio
import logging
import uuid
import os
from datetime import datetime
from typing import Optional, List, Dict

logger = logging.getLogger(__name__)

SCRAPING_INTERVAL_HOURS = int(os.getenv("SCRAPING_INTERVAL_HOURS", "6"))

_scheduler_task: Optional[asyncio.Task] = None


def get_active_tokens(db, platform: str) -> List[Dict]:
    from app.models import SocialApiToken
    tokens = db.query(SocialApiToken).filter(
        SocialApiToken.platform == platform,
        SocialApiToken.is_active == True
    ).all()
    return [{"id": t.id, "label": t.label, "credentials": t.credentials or {}} for t in tokens]


def update_token_status(db, token_id: str, success: bool, error_msg: str = None):
    from app.models import SocialApiToken
    token = db.query(SocialApiToken).filter(SocialApiToken.id == token_id).first()
    if token:
        token.last_used_at = datetime.now()
        if success:
            token.status = "active"
            token.last_error = None
        else:
            token.status = "error"
            token.last_error = error_msg
        db.commit()


async def run_twitter_with_token(db, token_info: Dict, sentiment_analyzer) -> int:
    from app.models import RawSocialPost
    from app.services.scrapers.twitterapi_io_scraper import TwitterAPIioScraper

    creds = token_info["credentials"]
    api_key = creds.get("api_key", "")
    if not api_key:
        logger.warning(f"[Scheduler] Twitter token '{token_info['label']}' sin api_key")
        update_token_status(db, token_info["id"], False, "Sin api_key configurada")
        return 0

    scraper = TwitterAPIioScraper(api_key=api_key)
    if not scraper.is_configured():
        update_token_status(db, token_info["id"], False, "API key inválida")
        return 0

    try:
        tweets = await scraper.search_tweets(
            query="Peru politica OR congreso peru OR presidente peru",
            max_results=50
        )

        items_added = 0
        for tweet in tweets:
            transformed = scraper.transform_tweet(tweet)
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "twitter",
                RawSocialPost.post_id == transformed["post_id"]
            ).first()
            if existing:
                continue

            sentiment_score = sentiment_analyzer.analyze(transformed.get("content", ""))
            post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform=transformed["platform"],
                post_id=transformed["post_id"],
                author=transformed["author"],
                content=transformed["content"],
                created_at=transformed["created_at"],
                engagement_metrics=transformed["engagement_metrics"],
                geographic_location=transformed.get("geographic_location"),
                region=transformed.get("region", "Nacional"),
                sentiment_score=sentiment_score,
                processed=True
            )
            db.add(post)
            items_added += 1

        db.commit()
        update_token_status(db, token_info["id"], True)
        logger.info(f"[Scheduler] Twitter '{token_info['label']}': {items_added} tweets nuevos")
        return items_added

    except Exception as e:
        update_token_status(db, token_info["id"], False, str(e)[:200])
        logger.error(f"[Scheduler] Error Twitter '{token_info['label']}': {e}")
        return 0


async def run_youtube_with_token(db, token_info: Dict, sentiment_analyzer) -> int:
    from app.models import RawSocialPost
    from app.services.scrapers.youtube_scraper import YouTubeScraper

    creds = token_info["credentials"]
    api_key = creds.get("api_key", "")
    if not api_key:
        update_token_status(db, token_info["id"], False, "Sin api_key configurada")
        return 0

    try:
        scraper = YouTubeScraper(api_key=api_key)
    except ValueError as e:
        update_token_status(db, token_info["id"], False, str(e))
        return 0

    try:
        videos = await scraper.search_videos(
            query="política Perú congreso gobierno",
            max_results=30
        )

        items_added = 0
        for video in videos:
            post_id = f"yt_{video.get('id', '')}"
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "youtube",
                RawSocialPost.post_id == post_id
            ).first()
            if existing:
                continue

            content = f"{video.get('title', '')} {video.get('description', '')}"
            sentiment_score = sentiment_analyzer.analyze(content)
            post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform="youtube",
                post_id=post_id,
                author=video.get("channel_title", video.get("author", "")),
                content=content[:2000],
                created_at=video.get("published_at"),
                engagement_metrics={
                    "likes": video.get("likes", 0),
                    "shares": 0,
                    "comments": video.get("comments", 0),
                    "views": video.get("views", 0)
                },
                region="Nacional",
                sentiment_score=sentiment_score,
                processed=True
            )
            db.add(post)
            items_added += 1

        db.commit()
        update_token_status(db, token_info["id"], True)
        logger.info(f"[Scheduler] YouTube '{token_info['label']}': {items_added} videos nuevos")
        return items_added

    except Exception as e:
        update_token_status(db, token_info["id"], False, str(e)[:200])
        logger.error(f"[Scheduler] Error YouTube '{token_info['label']}': {e}")
        return 0


async def run_instagram_with_token(db, token_info: Dict, sentiment_analyzer) -> int:
    from app.models import RawSocialPost
    from app.services.scrapers.instagram_scraper import InstagramScraper

    creds = token_info["credentials"]
    access_token = creds.get("access_token", "")
    if not access_token:
        update_token_status(db, token_info["id"], False, "Sin access_token configurado")
        return 0

    scraper = InstagramScraper(access_token=access_token)
    if not scraper.is_configured():
        update_token_status(db, token_info["id"], False, "Token inválido")
        return 0

    test_result = await scraper.test_connection()
    if not test_result.get("success"):
        update_token_status(db, token_info["id"], False, test_result.get("error", "Token expirado"))
        logger.warning(f"[Scheduler] Instagram '{token_info['label']}' token inválido")
        return 0

    accounts = await scraper.get_instagram_accounts()
    if not accounts:
        update_token_status(db, token_info["id"], False, "Sin cuentas Business")
        return 0

    ig_user_id = accounts[0].get("instagram_id")
    if not ig_user_id:
        update_token_status(db, token_info["id"], False, "Sin ID de Instagram")
        return 0

    try:
        posts = await scraper.scrape_political_content(ig_user_id, max_per_hashtag=10)
        items_added = 0

        for post in posts:
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "instagram",
                RawSocialPost.post_id == post["post_id"]
            ).first()
            if existing:
                continue

            sentiment_score = sentiment_analyzer.analyze(post.get("content", ""))
            db_post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform="instagram",
                post_id=post["post_id"],
                author=post.get("author", ""),
                content=post.get("content", ""),
                engagement_metrics={
                    "likes": post.get("likes", 0),
                    "shares": 0,
                    "comments": post.get("comments", 0),
                    "views": 0
                },
                scraped_at=datetime.now(),
                region="Nacional",
                sentiment_score=sentiment_score
            )
            db.add(db_post)
            items_added += 1

        db.commit()
        update_token_status(db, token_info["id"], True)
        logger.info(f"[Scheduler] Instagram '{token_info['label']}': {items_added} posts nuevos")
        return items_added

    except Exception as e:
        update_token_status(db, token_info["id"], False, str(e)[:200])
        logger.error(f"[Scheduler] Error Instagram '{token_info['label']}': {e}")
        return 0


async def run_scheduled_social_scraping(db_url: str, platform: str) -> int:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import ScrapingLog
    from app.services.sentiment_analyzer import SentimentAnalyzer

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    tokens = get_active_tokens(db, platform)

    if platform == "twitter" and not tokens:
        api_key = os.getenv("TWITTERAPI_IO_KEY")
        if api_key:
            tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"api_key": api_key}}]
    elif platform == "youtube" and not tokens:
        api_key = os.getenv("YOUTUBE_API_KEY")
        if api_key:
            tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"api_key": api_key}}]
    elif platform == "instagram" and not tokens:
        access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        if access_token:
            tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"access_token": access_token}}]

    if not tokens:
        logger.info(f"[Scheduler] {platform}: sin tokens configurados")
        db.close()
        return 0

    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source=platform,
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()

    try:
        sentiment_analyzer = SentimentAnalyzer()
        total_added = 0
        token_details = {}

        for token_info in tokens:
            label = token_info["label"]
            try:
                if platform == "twitter":
                    count = await run_twitter_with_token(db, token_info, sentiment_analyzer)
                elif platform == "youtube":
                    count = await run_youtube_with_token(db, token_info, sentiment_analyzer)
                elif platform == "instagram":
                    count = await run_instagram_with_token(db, token_info, sentiment_analyzer)
                else:
                    count = 0
                total_added += count
                token_details[label] = count
            except Exception as e:
                logger.error(f"[Scheduler] Error en {platform} token '{label}': {e}")
                token_details[label] = f"error: {str(e)[:100]}"

        log.status = "completed"
        log.items_scraped = total_added
        log.completed_at = datetime.now()
        log.extra_metadata = {
            "triggered_by": "scheduler",
            "tokens_used": len(tokens),
            "per_token": token_details
        }
        db.commit()

        logger.info(f"[Scheduler] {platform}: {total_added} items nuevos ({len(tokens)} tokens)")
        return total_added

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"[Scheduler] Error {platform}: {e}")
        return 0
    finally:
        db.close()


async def run_scheduled_government_scraping(db_url: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import ScrapingLog

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="government",
        scraping_type="government",
        status="running"
    )
    db.add(log)
    db.commit()

    try:
        from app.scrapers.government_scrapers import ONPEScraper, INEIScraper, MEFScraper

        total_items = 0
        scrapers_info = {
            "ONPE": ONPEScraper,
            "INEI": INEIScraper,
            "MEF": MEFScraper
        }

        details = {}
        for name, scraper_cls in scrapers_info.items():
            try:
                scraper = scraper_cls()
                count = await asyncio.to_thread(scraper.scrape, db)
                total_items += count
                details[name] = count
                logger.info(f"[Scheduler] {name}: {count} items gubernamentales nuevos")
                scraper.close()
            except Exception as e:
                logger.error(f"[Scheduler] Error en {name}: {e}")
                details[name] = f"error: {str(e)[:100]}"

        log.status = "completed"
        log.items_scraped = total_items
        log.completed_at = datetime.now()
        log.extra_metadata = {
            "triggered_by": "scheduler",
            "sources": details
        }
        db.commit()

        logger.info(f"[Scheduler] Datos gubernamentales: {total_items} items nuevos en total")
        return total_items

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"[Scheduler] Error datos gubernamentales: {e}")
        return 0
    finally:
        db.close()


async def run_scheduled_survey_scraping(db_url: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import ScrapingLog

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="surveys",
        scraping_type="surveys",
        status="running"
    )
    db.add(log)
    db.commit()

    try:
        from app.scrapers.survey_scrapers import IEPScraper, IpsosScraper, DatumScraper, CPIScraper

        total_items = 0
        scrapers_info = {
            "IEP": IEPScraper,
            "Ipsos": IpsosScraper,
            "Datum": DatumScraper,
            "CPI": CPIScraper
        }

        details = {}
        for name, scraper_cls in scrapers_info.items():
            try:
                scraper = scraper_cls()
                count = await asyncio.to_thread(scraper.scrape, db)
                total_items += count
                details[name] = count
                logger.info(f"[Scheduler] {name}: {count} encuestas nuevas")
                scraper.close()
            except Exception as e:
                logger.error(f"[Scheduler] Error en {name}: {e}")
                details[name] = f"error: {str(e)[:100]}"

        log.status = "completed"
        log.items_scraped = total_items
        log.completed_at = datetime.now()
        log.extra_metadata = {
            "triggered_by": "scheduler",
            "pollsters": details
        }
        db.commit()

        logger.info(f"[Scheduler] Encuestas: {total_items} items nuevos en total")
        return total_items

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"[Scheduler] Error encuestas: {e}")
        return 0
    finally:
        db.close()


async def run_all_scrapers():
    from app.config import settings
    db_url = settings.DATABASE_URL

    logger.info("[Scheduler] Iniciando ciclo de scraping automático...")

    total = 0
    total += await run_scheduled_social_scraping(db_url, "twitter")
    total += await run_scheduled_social_scraping(db_url, "youtube")
    total += await run_scheduled_social_scraping(db_url, "instagram")
    total += await run_scheduled_government_scraping(db_url)
    total += await run_scheduled_survey_scraping(db_url)

    logger.info(f"[Scheduler] Ciclo completado: {total} items nuevos en total")
    return total


async def scheduler_loop():
    interval_seconds = SCRAPING_INTERVAL_HOURS * 3600
    logger.info(f"[Scheduler] Scraping automático cada {SCRAPING_INTERVAL_HOURS} horas")

    await asyncio.sleep(30)
    
    while True:
        try:
            await run_all_scrapers()
        except Exception as e:
            logger.error(f"[Scheduler] Error en ciclo: {e}")

        logger.info(f"[Scheduler] Próximo ciclo en {SCRAPING_INTERVAL_HOURS} horas")
        await asyncio.sleep(interval_seconds)


def start_scheduler():
    global _scheduler_task
    if _scheduler_task is None or _scheduler_task.done():
        loop = asyncio.get_event_loop()
        _scheduler_task = loop.create_task(scheduler_loop())
        logger.info("[Scheduler] Scheduler iniciado")


def stop_scheduler():
    global _scheduler_task
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("[Scheduler] Scheduler detenido")
