#!/usr/bin/env python3
"""
CLI management interface for Political Data Scraper
"""

import click
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal, init_db
from app.models import NewsArticle, RawSocialPost, GovernmentData, ScrapingLog
from app.tasks.scraping import scrape_news_task, scrape_social_task, scrape_government_task
from app.tasks.processing import process_unprocessed_data, deduplicate_data
from app.scrapers.news_scrapers import ElComercioScraper, RPPScraper, GestionScraper
from app.scrapers.social_scrapers import TwitterScraper, FacebookScraper, InstagramScraper, YouTubeScraper
from app.scrapers.government_scrapers import ONPEScraper, INEIScraper, MEFScraper

@click.group()
def cli():
    """Political Data Scraper CLI Management Tool"""
    pass

@cli.group()
def db():
    """Database management commands"""
    pass

@db.command()
def init():
    """Initialize database"""
    click.echo("Initializing database...")
    init_db()
    click.echo("✅ Database initialized successfully")

@db.command()
def stats():
    """Show database statistics"""
    db = SessionLocal()
    
    try:
        news_count = db.query(NewsArticle).count()
        social_count = db.query(RawSocialPost).count()
        gov_count = db.query(GovernmentData).count()
        
        # Recent activity (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_news = db.query(NewsArticle).filter(NewsArticle.scraped_at >= yesterday).count()
        recent_social = db.query(RawSocialPost).filter(RawSocialPost.scraped_at >= yesterday).count()
        recent_gov = db.query(GovernmentData).filter(GovernmentData.scraped_at >= yesterday).count()
        
        click.echo("\n📊 Database Statistics")
        click.echo("=" * 50)
        click.echo(f"News Articles: {news_count:,}")
        click.echo(f"Social Posts: {social_count:,}")
        click.echo(f"Government Data: {gov_count:,}")
        click.echo(f"Total Records: {news_count + social_count + gov_count:,}")
        
        click.echo("\n📈 Recent Activity (24h)")
        click.echo("=" * 50)
        click.echo(f"News Articles: {recent_news:,}")
        click.echo(f"Social Posts: {recent_social:,}")
        click.echo(f"Government Data: {recent_gov:,}")
        
    finally:
        db.close()

@cli.group()
def scrape():
    """Manual scraping commands"""
    pass

@scrape.command()
@click.option('--source', type=click.Choice(['elcomercio', 'rpp', 'gestion', 'all']), default='all')
def news(source):
    """Manually scrape news sources"""
    db = SessionLocal()
    
    try:
        if source == 'all':
            sources = ['elcomercio', 'rpp', 'gestion']
        else:
            sources = [source]
        
        total_scraped = 0
        
        for src in sources:
            click.echo(f"🔍 Scraping {src}...")
            
            if src == 'elcomercio':
                scraper = ElComercioScraper()
            elif src == 'rpp':
                scraper = RPPScraper()
            elif src == 'gestion':
                scraper = GestionScraper()
            
            try:
                count = scraper.scrape(db)
                total_scraped += count
                click.echo(f"✅ Scraped {count} articles from {src}")
            except Exception as e:
                click.echo(f"❌ Error scraping {src}: {e}")
            finally:
                scraper.close()
        
        click.echo(f"\n🎉 Total articles scraped: {total_scraped}")
        
    finally:
        db.close()

@scrape.command()
@click.option('--platform', type=click.Choice(['twitter', 'facebook', 'instagram', 'youtube', 'all']), default='all')
def social(platform):
    """Manually scrape social media platforms"""
    db = SessionLocal()
    
    try:
        if platform == 'all':
            platforms = ['twitter', 'facebook', 'instagram', 'youtube']
        else:
            platforms = [platform]
        
        total_scraped = 0
        
        for plat in platforms:
            click.echo(f"🔍 Scraping {plat}...")
            
            if plat == 'twitter':
                scraper = TwitterScraper()
            elif plat == 'facebook':
                scraper = FacebookScraper()
            elif plat == 'instagram':
                scraper = InstagramScraper()
            elif plat == 'youtube':
                scraper = YouTubeScraper()
            
            try:
                count = scraper.scrape(db)
                total_scraped += count
                click.echo(f"✅ Scraped {count} posts from {plat}")
            except Exception as e:
                click.echo(f"❌ Error scraping {plat}: {e}")
            finally:
                scraper.close()
        
        click.echo(f"\n🎉 Total posts scraped: {total_scraped}")
        
    finally:
        db.close()

@scrape.command()
@click.option('--source', type=click.Choice(['onpe', 'inei', 'mef', 'all']), default='all')
def government(source):
    """Manually scrape government sources"""
    db = SessionLocal()
    
    try:
        if source == 'all':
            sources = ['onpe', 'inei', 'mef']
        else:
            sources = [source]
        
        total_scraped = 0
        
        for src in sources:
            click.echo(f"🔍 Scraping {src}...")
            
            if src == 'onpe':
                scraper = ONPEScraper()
            elif src == 'inei':
                scraper = INEIScraper()
            elif src == 'mef':
                scraper = MEFScraper()
            
            try:
                count = scraper.scrape(db)
                total_scraped += count
                click.echo(f"✅ Scraped {count} items from {src}")
            except Exception as e:
                click.echo(f"❌ Error scraping {src}: {e}")
            finally:
                scraper.close()
        
        click.echo(f"\n🎉 Total items scraped: {total_scraped}")
        
    finally:
        db.close()

@cli.group()
def process():
    """Data processing commands"""
    pass

@process.command()
def unprocessed():
    """Process unprocessed data"""
    click.echo("🔄 Processing unprocessed data...")
    
    try:
        result = process_unprocessed_data()
        processed_count = result.get('processed_count', 0)
        click.echo(f"✅ Processed {processed_count} items")
    except Exception as e:
        click.echo(f"❌ Error processing data: {e}")

@process.command()
def deduplicate():
    """Remove duplicate entries"""
    click.echo("🔄 Removing duplicate entries...")
    
    try:
        result = deduplicate_data()
        total_removed = result.get('total_removed', 0)
        click.echo(f"✅ Removed {total_removed} duplicate entries")
        
        # Show breakdown
        news_removed = result.get('news_duplicates_removed', 0)
        social_removed = result.get('social_duplicates_removed', 0)
        gov_removed = result.get('government_duplicates_removed', 0)
        
        click.echo(f"  - News articles: {news_removed}")
        click.echo(f"  - Social posts: {social_removed}")
        click.echo(f"  - Government data: {gov_removed}")
        
    except Exception as e:
        click.echo(f"❌ Error deduplicating data: {e}")

@cli.group()
def monitor():
    """Monitoring and status commands"""
    pass

@monitor.command()
def status():
    """Show system status"""
    click.echo("🔍 System Status")
    click.echo("=" * 50)
    
    # Check database connection
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        click.echo("✅ Database: Connected")
    except Exception as e:
        click.echo(f"❌ Database: Error - {e}")
    
    # Check configuration
    click.echo(f"📋 Environment: {settings.ENVIRONMENT}")
    click.echo(f"📋 Debug Mode: {settings.DEBUG}")
    
    # API Keys status
    api_keys = {
        'Twitter': bool(settings.TWITTER_BEARER_TOKEN),
        'Facebook': bool(settings.FACEBOOK_ACCESS_TOKEN),
        'Instagram': bool(settings.INSTAGRAM_ACCESS_TOKEN),
        'YouTube': bool(settings.YOUTUBE_API_KEY)
    }
    
    click.echo("\n🔑 API Keys Status")
    click.echo("=" * 50)
    for service, configured in api_keys.items():
        status = "✅ Configured" if configured else "❌ Missing"
        click.echo(f"{service}: {status}")

@monitor.command()
def logs():
    """Show recent scraping logs"""
    db = SessionLocal()
    
    try:
        # Get recent logs (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        logs = db.query(ScrapingLog).filter(
            ScrapingLog.started_at >= yesterday
        ).order_by(ScrapingLog.started_at.desc()).limit(20).all()
        
        if not logs:
            click.echo("No recent scraping logs found")
            return
        
        click.echo("\n📋 Recent Scraping Logs")
        click.echo("=" * 80)
        
        for log in logs:
            status_icon = "✅" if log.status == "completed" else "❌" if log.status == "failed" else "🔄"
            click.echo(f"{status_icon} {log.started_at.strftime('%Y-%m-%d %H:%M')} | {log.source} | {log.scraping_type} | {log.items_scraped} items")
            
            if log.error_message:
                click.echo(f"   Error: {log.error_message}")
        
    finally:
        db.close()

@cli.command()
def config():
    """Show current configuration"""
    click.echo("⚙️  Current Configuration")
    click.echo("=" * 50)
    
    config_items = [
        ("App Name", settings.APP_NAME),
        ("Version", settings.VERSION),
        ("Environment", settings.ENVIRONMENT),
        ("Debug Mode", settings.DEBUG),
        ("Database URL", settings.DATABASE_URL[:50] + "..." if len(settings.DATABASE_URL) > 50 else settings.DATABASE_URL),
        ("Redis URL", settings.REDIS_URL),
        ("Scraping Delay", f"{settings.SCRAPING_DELAY}s"),
        ("Concurrent Requests", settings.CONCURRENT_REQUESTS),
        ("Request Timeout", f"{settings.REQUEST_TIMEOUT}s"),
        ("Log Level", settings.LOG_LEVEL),
        ("Prometheus Enabled", settings.PROMETHEUS_ENABLED),
    ]
    
    for key, value in config_items:
        click.echo(f"{key}: {value}")

if __name__ == '__main__':
    cli()