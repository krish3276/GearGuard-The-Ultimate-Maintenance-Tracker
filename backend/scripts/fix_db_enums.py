import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'gearguard')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'apple')

def fix_enums():
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        cur = conn.cursor()
        
        print(f"Connected to database '{DB_NAME}' to fix enums...")

        # Commands to convert VARCHAR to ENUM correctly
        commands = [
            # 1. Fix users.role
            "ALTER TABLE users ALTER COLUMN role DROP DEFAULT",
            "DO $$ BEGIN CREATE TYPE enum_users_role AS ENUM('admin', 'manager', 'technician'); EXCEPTION WHEN duplicate_object THEN null; END $$",
            "ALTER TABLE users ALTER COLUMN role TYPE enum_users_role USING (role::enum_users_role)",
            "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'technician'",

            # 2. Fix maintenance_requests.request_type
            "ALTER TABLE maintenance_requests ALTER COLUMN request_type DROP DEFAULT",
            "DO $$ BEGIN CREATE TYPE enum_maintenance_requests_request_type AS ENUM('equipment', 'work_center'); EXCEPTION WHEN duplicate_object THEN null; END $$",
            "ALTER TABLE maintenance_requests ALTER COLUMN request_type TYPE enum_maintenance_requests_request_type USING (request_type::enum_maintenance_requests_request_type)",
            "ALTER TABLE maintenance_requests ALTER COLUMN request_type SET DEFAULT 'equipment'",

            # 3. Fix maintenance_requests.type
            "DO $$ BEGIN CREATE TYPE enum_maintenance_requests_type AS ENUM('Corrective', 'Preventive'); EXCEPTION WHEN duplicate_object THEN null; END $$",
            "ALTER TABLE maintenance_requests ALTER COLUMN type TYPE enum_maintenance_requests_type USING (type::enum_maintenance_requests_type)",

            # 4. Fix maintenance_requests.priority
            "ALTER TABLE maintenance_requests ALTER COLUMN priority DROP DEFAULT",
            "DO $$ BEGIN CREATE TYPE enum_maintenance_requests_priority AS ENUM('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN null; END $$",
            "ALTER TABLE maintenance_requests ALTER COLUMN priority TYPE enum_maintenance_requests_priority USING (priority::enum_maintenance_requests_priority)",
            "ALTER TABLE maintenance_requests ALTER COLUMN priority SET DEFAULT 'medium'",

            # 5. Fix maintenance_requests.status
            "ALTER TABLE maintenance_requests ALTER COLUMN status DROP DEFAULT",
            "DO $$ BEGIN CREATE TYPE enum_maintenance_requests_status AS ENUM('New', 'In Progress', 'Repaired', 'Scrap'); EXCEPTION WHEN duplicate_object THEN null; END $$",
            "ALTER TABLE maintenance_requests ALTER COLUMN status TYPE enum_maintenance_requests_status USING (status::enum_maintenance_requests_status)",
            "ALTER TABLE maintenance_requests ALTER COLUMN status SET DEFAULT 'New'"
        ]

        for cmd in commands:
            try:
                cur.execute(cmd)
                conn.commit()
                print(f"Executed successfully: {cmd[:60]}...")
            except Exception as e:
                conn.rollback()
                print(f"Skipped/Failed: {cmd[:60]}... Error: {str(e).strip()}")

        cur.close()
        print("\nDatabase enums fixed! Try running 'node index.js' now.")
    except Exception as e:
        print(f"Main Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    fix_enums()
