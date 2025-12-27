"""
GearGuard Database Schema Creation Script
Creates the complete PostgreSQL database schema for the Maintenance Management System.
"""

import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'dbname': os.getenv('DB_NAME', 'gearguard'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'apple')
}

SCHEMA_SQL = """
-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS maintenance_teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS request_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician');
CREATE TYPE request_type AS ENUM ('Corrective', 'Preventive');
CREATE TYPE request_status AS ENUM ('New', 'In Progress', 'Repaired', 'Scrap');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'technician',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Teams table
CREATE TABLE maintenance_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Members junction table (Many-to-Many: Users <-> Teams)
CREATE TABLE team_members (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES maintenance_teams(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, team_id)
);

-- Equipment table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    purchase_date DATE,
    warranty_end DATE,
    location VARCHAR(255),
    department_or_owner VARCHAR(255),
    maintenance_team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    is_scrapped BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests table
CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    type request_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    assigned_technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scheduled_date DATE,
    duration_hours DECIMAL(5, 2),
    status request_status NOT NULL DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_equipment_scrapped ON equipment(is_scrapped);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_team ON maintenance_requests(maintenance_team_id);
CREATE INDEX idx_requests_technician ON maintenance_requests(assigned_technician_id);
CREATE INDEX idx_requests_status ON maintenance_requests(status);
CREATE INDEX idx_requests_type ON maintenance_requests(type);
CREATE INDEX idx_requests_scheduled ON maintenance_requests(scheduled_date);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);

-- Add check constraint for preventive requests
ALTER TABLE maintenance_requests 
ADD CONSTRAINT chk_preventive_scheduled 
CHECK (type != 'Preventive' OR scheduled_date IS NOT NULL);

-- Add check constraint for positive duration
ALTER TABLE maintenance_requests 
ADD CONSTRAINT chk_positive_duration 
CHECK (duration_hours IS NULL OR duration_hours >= 0);
"""


def create_database():
    """Create the database if it doesn't exist."""
    conn = psycopg2.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        dbname='postgres'
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_CONFIG['dbname'],))
    exists = cursor.fetchone()
    
    if not exists:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_CONFIG['dbname'])))
        print(f"Database '{DB_CONFIG['dbname']}' created successfully.")
    else:
        print(f"Database '{DB_CONFIG['dbname']}' already exists.")
    
    cursor.close()
    conn.close()


def create_schema():
    """Create the database schema."""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        cursor.execute(SCHEMA_SQL)
        conn.commit()
        print("Schema created successfully!")
        print("\nTables created:")
        print("  - users")
        print("  - maintenance_teams")
        print("  - team_members")
        print("  - equipment")
        print("  - maintenance_requests")
        print("\nIndexes and constraints added.")
    except Exception as e:
        conn.rollback()
        print(f"Error creating schema: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def verify_schema():
    """Verify the schema was created correctly."""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    
    print("\nVerification - Tables in database:")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f"  {table[0]}: {count} rows")
    
    cursor.close()
    conn.close()


if __name__ == "__main__":
    print("=" * 50)
    print("GearGuard Database Schema Setup")
    print("=" * 50)
    print(f"\nConnecting to: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Database: {DB_CONFIG['dbname']}")
    print(f"User: {DB_CONFIG['user']}")
    print()
    
    try:
        create_database()
        create_schema()
        verify_schema()
        print("\n" + "=" * 50)
        print("Schema setup completed successfully!")
        print("=" * 50)
    except Exception as e:
        print(f"\nFailed to setup schema: {e}")
        exit(1)
