
import psycopg2
import uuid
from datetime import datetime, timedelta
import random

# Parameters
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "123456"
DB_NAME = "politiscope_db"

def seed_government():
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST)
    cur = conn.cursor()
    
    departments = ['Lima', 'Cusco', 'Arequipa', 'Piura']
    sources = ['INEI', 'MEF', 'ONPE', 'MINSA']
    types = ['Reporte', 'Estadística', 'Presupuesto', 'Elecciones']
    
    print("[SEED-GOV] Inserting government data...")
    for i in range(15):
        cur.execute("""
            INSERT INTO public.government_data (id, source, data_type, title, content, published_at, url, department, scraped_at, processed)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)
        """, (
            str(uuid.uuid4()),
            random.choice(sources),
            random.choice(types),
            f"Informe Oficial #{i+1}",
            '{"summary": "Datos oficiales del gobierno", "value": 12345}',
            datetime.now() - timedelta(days=random.randint(1, 30)),
            f"https://gob.pe/data/{i}",
            random.choice(departments),
            datetime.now()
        ))
        
    conn.commit()
    conn.close()
    print("[SEED-GOV] Done.")

if __name__ == "__main__":
    seed_government()
