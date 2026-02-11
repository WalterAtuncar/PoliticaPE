import asyncio
import logging
import uuid
import os
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

SCRAPING_INTERVAL_HOURS = int(os.getenv("SCRAPING_INTERVAL_HOURS", "6"))

_scheduler_task: Optional[asyncio.Task] = None


async def run_scheduled_twitter_scraping(db_url: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import ScrapingLog, RawSocialPost
    from app.services.sentiment_analyzer import SentimentAnalyzer

    try:
        from app.services.scrapers.twitterapi_io_scraper import TwitterAPIioScraper
        scraper = TwitterAPIioScraper()
    except Exception as e:
        logger.warning(f"[Scheduler] TwitterAPI.io no configurado: {e}")
        return 0

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="twitter",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()

    try:
        tweets = await scraper.search_tweets(
            query="Peru politica OR congreso peru OR presidente peru",
            max_results=50
        )

        sentiment_analyzer = SentimentAnalyzer()
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

        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        log.extra_metadata = {
            "total_fetched": len(tweets),
            "duplicates_skipped": len(tweets) - items_added,
            "source": "twitterapi.io",
            "triggered_by": "scheduler"
        }
        db.commit()

        logger.info(f"[Scheduler] Twitter: {items_added} tweets nuevos agregados")
        return items_added

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"[Scheduler] Error Twitter: {e}")
        return 0
    finally:
        db.close()


async def run_scheduled_youtube_scraping(db_url: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import ScrapingLog, RawSocialPost
    from app.services.sentiment_analyzer import SentimentAnalyzer

    try:
        from app.services.scrapers.youtube_scraper import YouTubeScraper
        scraper = YouTubeScraper()
    except Exception as e:
        logger.warning(f"[Scheduler] YouTube no configurado: {e}")
        return 0

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="youtube",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()

    try:
        videos = await scraper.search_videos(
            query="política Perú congreso gobierno",
            max_results=30
        )

        sentiment_analyzer = SentimentAnalyzer()
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

        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        log.extra_metadata = {
            "total_fetched": len(videos),
            "duplicates_skipped": len(videos) - items_added,
            "triggered_by": "scheduler"
        }
        db.commit()

        logger.info(f"[Scheduler] YouTube: {items_added} videos nuevos agregados")
        return items_added

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"[Scheduler] Error YouTube: {e}")
        return 0
    finally:
        db.close()


async def run_scheduled_instagram_scraping(db_url: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models import ScrapingLog, RawSocialPost
    from app.services.sentiment_analyzer import SentimentAnalyzer

    try:
        from app.services.scrapers.instagram_scraper import InstagramScraper
        scraper = InstagramScraper()
        if not scraper.is_configured():
            logger.warning("[Scheduler] Instagram no configurado - falta INSTAGRAM_ACCESS_TOKEN")
            return 0
    except Exception as e:
        logger.warning(f"[Scheduler] Instagram no configurado: {e}")
        return 0

    test_result = await scraper.test_connection()
    if not test_result.get("success"):
        logger.warning(f"[Scheduler] Instagram token inválido o expirado: {test_result.get('error', 'Unknown')}")
        return 0

    accounts = await scraper.get_instagram_accounts()
    if not accounts:
        logger.warning("[Scheduler] No se encontraron cuentas de Instagram Business")
        return 0

    ig_user_id = accounts[0].get("instagram_id")
    if not ig_user_id:
        logger.warning("[Scheduler] No se pudo obtener el ID de Instagram")
        return 0

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="instagram",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()

    try:
        posts = await scraper.scrape_political_content(ig_user_id, max_per_hashtag=10)

        sentiment_analyzer = SentimentAnalyzer()
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

        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        log.extra_metadata = {"triggered_by": "scheduler"}
        db.commit()

        logger.info(f"[Scheduler] Instagram: {items_added} posts nuevos agregados")
        return items_added

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"[Scheduler] Error Instagram: {e}")
        return 0
    finally:
        db.close()


async def run_all_scrapers():
    from app.config import settings
    db_url = settings.DATABASE_URL

    logger.info("[Scheduler] Iniciando ciclo de scraping automático...")

    total = 0
    total += await run_scheduled_twitter_scraping(db_url)
    total += await run_scheduled_youtube_scraping(db_url)
    total += await run_scheduled_instagram_scraping(db_url)

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
