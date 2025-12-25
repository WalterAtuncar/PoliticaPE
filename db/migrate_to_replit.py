#!/usr/bin/env python3
"""
Script to migrate/seed data to Replit PostgreSQL database.
Uses DATABASE_URL environment variable instead of local connection.
"""

import os
import uuid
from datetime import date, datetime, timedelta
import random

try:
    import psycopg2
except ImportError:
    print("Installing psycopg2-binary...")
    os.system("pip install psycopg2-binary")
    import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")

def log(msg):
    print(f"[MIGRATE] {msg}")

def get_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable not set")
    return psycopg2.connect(DATABASE_URL)

def seed_parties(cur, tenant_id):
    """Seed 9 political parties"""
    log("Seeding political parties...")
    
    parties = [
        {
            "name": "Fuerza Popular",
            "short_name": "FP",
            "slug": "fuerza-popular",
            "color": "#FF6600",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Logo_fuerza_popular_2013-2016.png/240px-Logo_fuerza_popular_2013-2016.png",
            "website": "https://fuerzapopular.com.pe",
            "founded_date": date(2010, 3, 9),
            "ideology": "Fujimorismo, Conservadurismo, Neoliberalismo",
            "spectrum": "right"
        },
        {
            "name": "Perú Libre",
            "short_name": "PL",
            "slug": "peru-libre",
            "color": "#C90016",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_of_Peru_Libre.svg/240px-Logo_of_Peru_Libre.svg.png",
            "website": "http://perulibre.pe",
            "founded_date": date(2008, 8, 13),
            "ideology": "Socialismo, Marxismo-Leninismo, Mariateguismo",
            "spectrum": "far-left"
        },
        {
            "name": "Renovación Popular",
            "short_name": "RP",
            "slug": "renovacion-popular",
            "color": "#00AEEF",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Logo_de_Renovaci%C3%B3n_Popular.svg/240px-Logo_de_Renovaci%C3%B3n_Popular.svg.png",
            "website": "https://renovacionpopular.pe",
            "founded_date": date(2004, 12, 7),
            "ideology": "Ultraconservadurismo, Derecha cristiana",
            "spectrum": "far-right"
        },
        {
            "name": "Alianza para el Progreso",
            "short_name": "APP",
            "slug": "alianza-para-el-progreso",
            "color": "#003399",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Alianza_para_el_Progreso_logo.svg/240px-Alianza_para_el_Progreso_logo.svg.png",
            "website": "https://app.pe",
            "founded_date": date(2001, 12, 8),
            "ideology": "Liberalismo económico, Populismo",
            "spectrum": "center-right"
        },
        {
            "name": "Avanza País",
            "short_name": "Avanza",
            "slug": "avanza-pais",
            "color": "#2E3192",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Avanza_Pa%C3%ADs_Peru.svg/240px-Logo_Avanza_Pa%C3%ADs_Peru.svg.png",
            "website": "https://avanzapais.org.pe",
            "founded_date": date(2000, 4, 10),
            "ideology": "Liberalismo clásico, Conservadurismo liberal",
            "spectrum": "right"
        },
        {
            "name": "Acción Popular",
            "short_name": "AP",
            "slug": "accion-popular",
            "color": "#BB0000",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Logo_Acci%C3%B3n_Popular.svg/240px-Logo_Acci%C3%B3n_Popular.svg.png",
            "website": "https://accionpopular.pe",
            "founded_date": date(1956, 7, 7),
            "ideology": "Humanismo, Nacionalismo cívico",
            "spectrum": "center-right"
        },
        {
            "name": "Juntos por el Perú",
            "short_name": "JPP",
            "slug": "juntos-por-el-peru",
            "color": "#008000",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_Juntos_por_el_Per%C3%BA_2021.svg/240px-Logo_Juntos_por_el_Per%C3%BA_2021.svg.png",
            "website": "https://juntosporperu.pe",
            "founded_date": date(2017, 5, 22),
            "ideology": "Socialdemocracia, Progresismo",
            "spectrum": "left"
        },
        {
            "name": "Somos Perú",
            "short_name": "SP",
            "slug": "somos-peru",
            "color": "#FE0000",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_Somos_Per%C3%BA.svg/240px-Logo_Somos_Per%C3%BA.svg.png",
            "website": "https://somosperu.pe",
            "founded_date": date(1997, 10, 22),
            "ideology": "Democracia cristiana, Desarrollismo",
            "spectrum": "center"
        },
        {
            "name": "Partido Morado",
            "short_name": "PM",
            "slug": "partido-morado",
            "color": "#662D91",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Partido_Morado_Logo.svg/240px-Partido_Morado_Logo.svg.png",
            "website": "https://partidomorado.pe",
            "founded_date": date(2017, 11, 18),
            "ideology": "Centrismo, Progresismo, Republicanismo",
            "spectrum": "center"
        }
    ]
    
    inserted = 0
    for p in parties:
        try:
            cur.execute("""
                INSERT INTO organization.parties 
                (tenant_id, name, short_name, slug, color, logo_url, website, founded_date, ideology, spectrum)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (tenant_id, name) DO UPDATE SET
                    short_name = EXCLUDED.short_name,
                    slug = EXCLUDED.slug,
                    color = EXCLUDED.color,
                    logo_url = EXCLUDED.logo_url,
                    website = EXCLUDED.website,
                    founded_date = EXCLUDED.founded_date,
                    ideology = EXCLUDED.ideology,
                    spectrum = EXCLUDED.spectrum
                RETURNING id;
            """, (
                tenant_id, p['name'], p['short_name'], p['slug'], p['color'], 
                p['logo_url'], p['website'], p['founded_date'], p['ideology'], p['spectrum']
            ))
            result = cur.fetchone()
            if result:
                inserted += 1
                log(f"    + {p['name']} ({p['short_name']})")
        except Exception as e:
            log(f"  Error inserting {p['name']}: {e}")
            cur.connection.rollback()
    
    log(f"  Inserted/Updated {inserted} parties")
    return inserted

def seed_news_articles(cur):
    """Seed news articles"""
    log("Seeding news articles...")
    
    sources = ['El Comercio', 'La República', 'RPP', 'Gestión', 'Perú21']
    categories = ['Política', 'Economía', 'Sociedad', 'Congreso', 'Gobierno']
    regions = ['Lima', 'Arequipa', 'Cusco', 'Piura', 'La Libertad', 'Lambayeque']
    
    news_templates = [
        "Congreso aprueba nueva ley sobre {}",
        "Ministro de {} anuncia cambios importantes",
        "Encuesta revela tendencias en {}",
        "Gobierno presenta plan de {}",
        "Debate sobre {} genera controversia",
        "Avances en el sector {}",
        "Crisis en {} preocupa a ciudadanos",
        "Nueva propuesta legislativa sobre {}",
        "Economía peruana muestra signos de {}",
        "Autoridades investigan caso de {}"
    ]
    
    topics = ['educación', 'salud', 'economía', 'transporte', 'seguridad', 
              'inversión', 'reforma tributaria', 'descentralización', 'medio ambiente', 'trabajo']
    
    inserted = 0
    for i in range(25):
        source = random.choice(sources)
        category = random.choice(categories)
        region = random.choice(regions)
        topic = random.choice(topics)
        template = random.choice(news_templates)
        title = template.format(topic)
        content = f"Este es un artículo detallado sobre {topic} publicado por {source}. La noticia aborda temas importantes para la región {region} y el sector {category}. Los analistas señalan que esta situación tendrá un impacto significativo en los próximos meses."
        
        try:
            cur.execute("""
                INSERT INTO public.news_articles (id, source, title, content, published_at, url, category, sentiment_score, processed)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE)
                ON CONFLICT (id) DO NOTHING
            """, (
                str(uuid.uuid4()),
                source,
                title,
                content,
                datetime.now() - timedelta(hours=random.randint(1, 72)),
                f"https://{source.lower().replace(' ', '')}.pe/news/{uuid.uuid4().hex[:8]}",
                category,
                round(random.uniform(-0.8, 0.8), 2)
            ))
            inserted += 1
        except Exception as e:
            log(f"  Error inserting news: {e}")
    
    log(f"  Inserted {inserted} news articles")
    return inserted

def seed_social_posts(cur):
    """Seed social media posts"""
    log("Seeding social posts...")
    
    platforms = ['twitter', 'facebook', 'instagram']
    authors = [
        'Juan Pérez', 'María García', 'Carlos López', 'Ana Rodríguez',
        'PoliticaPeOficial', 'Ciudadano Vigilante', 'PeruAnaliza', 'VozDelPueblo',
        'ReporteroPolitico', 'AnalistaLima', 'ObservadorPeru', 'NoticiasPe'
    ]
    regions = ['Lima', 'Arequipa', 'Cusco', 'Piura', 'La Libertad', 'Lambayeque', 
               'Ica', 'Tacna', 'Puno', 'Loreto']
    
    post_templates = [
        "🇵🇪 La situación política en el Perú requiere atención inmediata. #Peru #Politica",
        "Opinión ciudadana: necesitamos más transparencia en el gobierno. #Congreso",
        "📊 Las encuestas muestran cambios importantes en preferencias electorales.",
        "⚠️ Preocupación por decisiones recientes del Congreso. #Peru",
        "💬 El debate público sobre reformas continúa. ¿Qué opinas?",
        "📢 Nueva propuesta legislativa genera reacciones en redes sociales.",
        "🗳️ La participación ciudadana es clave para la democracia.",
        "📰 Análisis: Los desafíos del gobierno actual. #PeruPolitica",
        "🏛️ El Congreso sesiona hoy sobre temas importantes para el país.",
        "🌍 Perú en el contexto regional: oportunidades y desafíos."
    ]
    
    inserted = 0
    for i in range(40):
        platform = random.choice(platforms)
        author = random.choice(authors)
        region = random.choice(regions)
        content = random.choice(post_templates)
        
        try:
            cur.execute("""
                INSERT INTO public.raw_social_posts (id, platform, post_id, author, content, created_at, sentiment_score, processed, engagement_metrics, region)
                VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                str(uuid.uuid4()),
                platform,
                f"post_{uuid.uuid4().hex[:12]}",
                author,
                content,
                datetime.now() - timedelta(minutes=random.randint(5, 500)),
                round(random.uniform(-1.0, 1.0), 2),
                f'{{"likes": {random.randint(10, 1000)}, "shares": {random.randint(5, 200)}, "comments": {random.randint(2, 100)}}}',
                region
            ))
            inserted += 1
        except Exception as e:
            log(f"  Error inserting post: {e}")
    
    log(f"  Inserted {inserted} social posts")
    return inserted

def seed_government_data(cur):
    """Seed government data"""
    log("Seeding government data...")
    
    departments = ['Lima', 'Cusco', 'Arequipa', 'Piura', 'La Libertad', 'Lambayeque', 
                   'Ica', 'Tacna', 'Puno', 'Loreto', 'Junín', 'Ancash']
    sources = ['INEI', 'MEF', 'ONPE', 'MINSA', 'MINEDU', 'MTC', 'PRODUCE']
    types = ['Reporte', 'Estadística', 'Presupuesto', 'Elecciones', 'Censo', 'Indicador']
    
    titles = [
        "Informe de Gestión Pública Q4 2024",
        "Estadísticas de Empleo Regional",
        "Presupuesto Ejecutado por Sector",
        "Indicadores de Desarrollo Social",
        "Resultados Electorales Preliminares",
        "Censo de Población y Vivienda",
        "Reporte de Inversión Pública",
        "Estadísticas de Salud Pública",
        "Indicadores Económicos Regionales",
        "Informe de Ejecución Presupuestal"
    ]
    
    inserted = 0
    for i in range(20):
        source = random.choice(sources)
        data_type = random.choice(types)
        department = random.choice(departments)
        title = f"{random.choice(titles)} - {department}"
        
        try:
            cur.execute("""
                INSERT INTO public.government_data (id, source, data_type, title, content, published_at, url, department, scraped_at, processed)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)
                ON CONFLICT (id) DO NOTHING
            """, (
                str(uuid.uuid4()),
                source,
                data_type,
                title,
                f'{{"summary": "Datos oficiales de {source}", "value": {random.randint(1000, 100000)}, "department": "{department}"}}',
                datetime.now() - timedelta(days=random.randint(1, 60)),
                f"https://gob.pe/data/{uuid.uuid4().hex[:8]}",
                department,
                datetime.now()
            ))
            inserted += 1
        except Exception as e:
            log(f"  Error inserting gov data: {e}")
    
    log(f"  Inserted {inserted} government data records")
    return inserted

def main():
    log("Starting migration to Replit PostgreSQL...")
    log(f"DATABASE_URL: {'***configured***' if DATABASE_URL else 'NOT SET!'}")
    
    if not DATABASE_URL:
        log("ERROR: DATABASE_URL not found. Make sure you're running in Replit environment.")
        return False
    
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Get tenant ID
        cur.execute("SELECT id FROM identity.tenants LIMIT 1")
        result = cur.fetchone()
        if not result:
            log("ERROR: No tenant found. Please run initial seed first.")
            return False
        
        tenant_id = result[0]
        log(f"Using tenant ID: {tenant_id}")
        
        # Run all seeds
        parties_count = seed_parties(cur, tenant_id)
        news_count = seed_news_articles(cur)
        social_count = seed_social_posts(cur)
        gov_count = seed_government_data(cur)
        
        conn.commit()
        
        log("=" * 50)
        log("MIGRATION COMPLETE!")
        log(f"  Parties: {parties_count}")
        log(f"  News Articles: {news_count}")
        log(f"  Social Posts: {social_count}")
        log(f"  Government Data: {gov_count}")
        log("=" * 50)
        
        return True
        
    except Exception as e:
        log(f"ERROR: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
