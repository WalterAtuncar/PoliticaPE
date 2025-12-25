
import psycopg2
import uuid
from datetime import date

# Parameters
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "123456"
DB_NAME = "politiscope_db"

def log(msg):
    print(f"[SEED-PARTIES] {msg}")

def seed_parties():
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
        cur = conn.cursor()
        
        # 1. Get Tenant ID (PoliticaPE)
        cur.execute("SELECT id FROM identity.tenants WHERE slug = 'politica-pe'")
        res = cur.fetchone()
        if not res:
            log("Tenant 'PoliticaPE' not found. Please run seed_data.py first.")
            return
        tenant_id = res[0]
        
        # 2. Define Parties Data (Real Data)
        parties = [
            {
                "name": "Fuerza Popular",
                "short_name": "FP",
                "slug": "fuerza-popular",
                "color": "#FF6600", # Orange
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
                "color": "#C90016", # Red (Pencil)
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
                "color": "#00AEEF", # Light Blue
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
                "color": "#003399", # Blue and Red A
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
                "color": "#2E3192", # Blue train
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
                "color": "#BB0000", # Red shovel
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
                "color": "#008000", # Green J
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
                "color": "#FE0000", # Heart
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_Somos_Per%C3%BA.svg/240px-Logo_Somos_Per%C3%BA.svg.png",
                "website": "https://somosperu.pe",
                "founded_date": date(1997, 10, 22),
                "ideology": "Democracia cristiana, Desenvolupismo",
                "spectrum": "center"
            },
            {
                "name": "Partido Morado",
                "short_name": "PM",
                "slug": "partido-morado",
                "color": "#662Dg1", # Purple
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Partido_Morado_Logo.svg/240px-Partido_Morado_Logo.svg.png",
                "website": "https://partidomorado.pe",
                "founded_date": date(2017, 11, 18),
                "ideology": "Centrismo, Progresismo, Republicanismo",
                "spectrum": "center"
            }
        ]
        
        log(f"Prepared {len(parties)} parties for seeding.")
        
        inserted_count = 0
        for p in parties:
            cur.execute("""
                INSERT INTO organization.parties 
                (tenant_id, name, short_name, slug, color, logo_url, website, founded_date, ideology, spectrum)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (tenant_id, slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    color = EXCLUDED.color,
                    logo_url = EXCLUDED.logo_url
                RETURNING id;
            """, (
                tenant_id, p['name'], p['short_name'], p['slug'], p['color'], 
                p['logo_url'], p['website'], p['founded_date'], p['ideology'], p['spectrum']
            ))
            if cur.fetchone():
                inserted_count += 1
                
        conn.commit()
        log(f"Successfully seeded {inserted_count} parties.")
        
    except Exception as e:
        log(f"Error seeding parties: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_parties()
