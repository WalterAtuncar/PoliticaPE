
import psycopg2
import bcrypt
import os
import sys

# Parameters
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "123456"
DB_NAME = "politiscope_db"

def log(msg):
    print(f"[SEED] {msg}")

def get_hash(password):
    # Hash password with bcrypt
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def seed_data():
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
        cur = conn.cursor()
        
        # 1. Create Tenant
        log("Seeding Tenant 'PoliticaPE'...")
        cur.execute("""
            INSERT INTO identity.tenants (name, slug, status)
            VALUES ('PoliticaPE', 'politica-pe', 'active')
            ON CONFLICT (slug) DO NOTHING
            RETURNING id;
        """)
        tenant_id = cur.fetchone()
        
        if not tenant_id:
            # Fetch existing if not inserted
            cur.execute("SELECT id FROM identity.tenants WHERE slug = 'politica-pe'")
            tenant_id = cur.fetchone()[0]
        else:
            tenant_id = tenant_id[0]
            
        log(f"Tenant ID: {tenant_id}")
        
        # 2. Create Roles
        log("Seeding Roles...")
        roles = ['admin', 'analyst', 'viewer']
        role_ids = {}
        
        for role_name in roles:
            cur.execute("""
                INSERT INTO identity.roles (tenant_id, name, description)
                VALUES (%s, %s, %s)
                ON CONFLICT (tenant_id, name) DO NOTHING
                RETURNING id;
            """, (tenant_id, role_name, f"Role for {role_name}"))
            
            rid = cur.fetchone()
            if not rid:
                cur.execute("SELECT id FROM identity.roles WHERE tenant_id = %s AND name = %s", (tenant_id, role_name))
                rid = cur.fetchone()[0]
            else:
                rid = rid[0]
            role_ids[role_name] = rid

        # 3. Create Admin User
        log("Seeding Admin User...")
        admin_email = "admin@politica.pe"
        admin_pass = "password123"
        pass_hash = get_hash(admin_pass)
        
        cur.execute("""
            INSERT INTO identity.users (tenant_id, email, password_hash, name, is_active)
            VALUES (%s, %s, %s, 'Super Admin', TRUE)
            ON CONFLICT (tenant_id, email) DO NOTHING
            RETURNING id;
        """, (tenant_id, admin_email, pass_hash))
        
        user_id = cur.fetchone()
        if user_id:
            user_id = user_id[0]
            # Assign Admin Role
            cur.execute("""
                INSERT INTO identity.user_roles (tenant_id, user_id, role_id)
                VALUES (%s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (tenant_id, user_id, role_ids['admin']))
            log(f"Admin user created: {admin_email}")
        else:
            log(f"Admin user {admin_email} already exists.")

        # 4. Master Data: Regions
        log("Seeding Regions (Peru)...")
        regions = [
            ('AMA', 'Amazonas'), ('ANC', 'Ancash'), ('APU', 'Apurimac'), ('ARE', 'Arequipa'),
            ('AYA', 'Ayacucho'), ('CAJ', 'Cajamarca'), ('CAL', 'Callao'), ('CUS', 'Cusco'),
            ('HUV', 'Huancavelica'), ('HUC', 'Huanuco'), ('ICA', 'Ica'), ('JUN', 'Junin'),
            ('LAL', 'La Libertad'), ('LAM', 'Lambayeque'), ('LIM', 'Lima'), ('LOR', 'Loreto'),
            ('MDD', 'Madre de Dios'), ('MOQ', 'Moquegua'), ('PAS', 'Pasco'), ('PIU', 'Piura'),
            ('PUN', 'Puno'), ('SAM', 'San Martin'), ('TAC', 'Tacna'), ('TUM', 'Tumbes'),
            ('UCA', 'Ucayali')
        ]
        
        for code, name in regions:
            cur.execute("""
                INSERT INTO organization.regions (code, name)
                VALUES (%s, %s)
                ON CONFLICT (code) DO NOTHING
            """, (code, name))
            
        conn.commit()
        log("Seed data applied successfully!")
        
    except Exception as e:
        log(f"Error seeding data: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_data()
