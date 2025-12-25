
import psycopg2
import uuid
from datetime import datetime, timedelta
import random

# Parameters
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "123456"
DB_NAME = "politiscope_db"

def log(msg):
    print(f"[SAMPLE-SEED] {msg}")

def seed_samples():
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
        cur = conn.cursor()
        
        # 1. Seed News Articles
        log("Seeding News Articles...")
        sources = ['El Comercio', 'La República', 'RPP', 'Gestión', 'Perú21']
        categories = ['Política', 'Economía', 'Sociedad', 'Congreso']
        
        for i in range(20):
            source = random.choice(sources)
            category = random.choice(categories)
            title = f"Noticia de prueba {i+1}: Avances en el sector {category}"
            content = f"Este es el contenido detallado de la noticia {i+1}. Reporte desde {source} sobre la situación actual."
            
            cur.execute("""
                INSERT INTO public.news_articles (id, source, title, content, published_at, url, category, sentiment_score, processed)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE)
            """, (
                str(uuid.uuid4()),
                source,
                title,
                content,
                datetime.now() - timedelta(hours=random.randint(1, 48)),
                f"https://example.com/news/{i}",
                category,
                random.uniform(-0.8, 0.8)
            ))

        # 2. Seed Social Posts
        log("Seeding Social Posts...")
        platforms = ['twitter', 'facebook', 'instagram']
        authors = ['Juan Perez', 'Maria Garcia', 'PoliticaPeOficial', 'Ciudadano Vigilante']
        
        for i in range(30):
            platform = random.choice(platforms)
            author = random.choice(authors)
            content = f"Comentario sobre política #{i+1}. Opinión ciudadana importante. #Peru #Politica"
            
            cur.execute("""
                INSERT INTO public.raw_social_posts (id, platform, post_id, author, content, created_at, sentiment_score, processed, engagement_metrics)
                VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, %s)
            """, (
                str(uuid.uuid4()),
                platform,
                f"post_{i}",
                author,
                content,
                datetime.now() - timedelta(minutes=random.randint(10, 300)),
                random.uniform(-1.0, 1.0),
                '{"likes": 10, "shares": 5, "comments": 2}'
            ))
            
        conn.commit()
        log("Sample data inserted successfully!")
        
    except Exception as e:
        log(f"Error seeding samples: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_samples()
