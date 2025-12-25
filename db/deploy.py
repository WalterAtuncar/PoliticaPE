
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
import sys

# Parameters
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "123456"
DB_NAME = "politiscope_db"
DDL_FILE = "db/ddl_postgres_final.sql"

def log(msg):
    print(f"[DEPLOY] {msg}")

def create_database():
    try:
        # Connect to 'postgres' to create the new database
        con = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if exists
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cur.fetchone()
        
        if not exists:
            log(f"Creating database '{DB_NAME}'...")
            cur.execute(f"CREATE DATABASE {DB_NAME}")
            log("Database created.")
        else:
            log(f"Database '{DB_NAME}' already exists.")
            
        cur.close()
        con.close()
        return True
    except Exception as e:
        log(f"Error creating database: {e}")
        return False

def apply_schema():
    try:
        if not os.path.exists(DDL_FILE):
            log(f"DDL file not found: {DDL_FILE}")
            return False
            
        with open(DDL_FILE, 'r', encoding='utf-8') as f:
            sql_script = f.read()
            
        # Connect to the target database
        con = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        log(f"Applying schema from {DDL_FILE}...")
        cur.execute(sql_script)
        log("Schema applied successfully! Tables created/verified.")
        
        cur.close()
        con.close()
        return True
    except Exception as e:
        log(f"Error applying schema: {e}")
        return False

if __name__ == "__main__":
    if create_database():
        apply_schema()
