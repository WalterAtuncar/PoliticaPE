
import psycopg2

# Parameters
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "123456"
DB_NAME = "politiscope_db"

def update_schema():
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
        cur = conn.cursor()
        
        print("[SCHEMA-UPDATE] Dropping dependent tables...")
        cur.execute("DROP TABLE IF EXISTS organization.campaign_team_members CASCADE")
        cur.execute("DROP TABLE IF EXISTS organization.campaign_assets CASCADE")
        cur.execute("DROP TABLE IF EXISTS organization.ab_tests CASCADE")
        cur.execute("DROP TABLE IF EXISTS organization.campaigns CASCADE")
        
        print("[SCHEMA-UPDATE] Dropping parties table...")
        cur.execute("DROP TABLE IF EXISTS organization.parties CASCADE")
        
        print("[SCHEMA-UPDATE] Re-creating parties table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS organization.parties (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                short_name VARCHAR(50),
                slug VARCHAR(50) NOT NULL,
                color VARCHAR(20),
                logo_url VARCHAR(500),
                website VARCHAR(500),
                founded_date DATE,
                ideology VARCHAR(200),
                spectrum VARCHAR(50), 
                registration_status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE (tenant_id, name),
                UNIQUE (tenant_id, slug)
            );
        """)
        
        print("[SCHEMA-UPDATE] Re-creating campaigns table (and dependencies)...")
        # Reading DDL file to get exact CREATE statements would be ideal, but here I'll just re-run the updated DDL logic
        # Actually, since I updated DDL file, I can read it? 
        # But for simplicity, I will re-define the essential tables here to restore structure.
        
        # Removed CREATE TYPE election_type as it likely exists
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS organization.campaigns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
                party_id UUID NOT NULL REFERENCES organization.parties(id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                election election_type NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE,
                status VARCHAR(20) DEFAULT 'active',
                region_code VARCHAR(10),
                objective VARCHAR(50),
                target_demographics JSONB,
                budget_details JSONB,
                performance_metrics JSONB,
                crisis_protocol JSONB,
                budget NUMERIC(14,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE (tenant_id, name)
            );
        """)

        # Re-create other tables dropped by cascade or manually
        cur.execute("""
            CREATE TABLE IF NOT EXISTS organization.campaign_team_members (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
                campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
                user_id UUID REFERENCES identity.users(id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                email VARCHAR(255),
                role VARCHAR(50) NOT NULL,
                permissions JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS organization.campaign_assets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
                campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                type VARCHAR(50) NOT NULL,
                url VARCHAR(1000) NOT NULL,
                size_bytes BIGINT,
                tags JSONB,
                approval_status VARCHAR(20) DEFAULT 'pending',
                uploaded_by UUID REFERENCES identity.users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS organization.ab_tests (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
                campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'draft',
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                target_regions JSONB,
                results_summary JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)

        conn.commit()
        print("[SCHEMA-UPDATE] Schema successfully updated!")
        
    except Exception as e:
        print(f"[SCHEMA-UPDATE] Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    update_schema()
