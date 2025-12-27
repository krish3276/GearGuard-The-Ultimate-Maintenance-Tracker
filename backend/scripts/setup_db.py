import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'gearguard')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'apple')

def create_database():
    try:
        # Connect to default postgres database to create the new database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

def create_tables():
    commands = [
        # Drop existing tables if they exist (in reverse order of dependencies)
        "DROP TABLE IF EXISTS team_members CASCADE",
        "DROP TABLE IF EXISTS maintenance_requests CASCADE",
        "DROP TABLE IF EXISTS equipment CASCADE",
        "DROP TABLE IF EXISTS work_centers CASCADE",
        "DROP TABLE IF EXISTS equipment_categories CASCADE",
        "DROP TABLE IF EXISTS maintenance_teams CASCADE",
        "DROP TABLE IF EXISTS users CASCADE",
        
        # Create Users table
        """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Create Maintenance Teams table
        """
        CREATE TABLE maintenance_teams (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            color VARCHAR(20) DEFAULT '#3b82f6',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Create Equipment Categories table
        """
        CREATE TABLE equipment_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            responsible_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            company VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Create Work Centers table
        """
        CREATE TABLE work_centers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50),
            tag VARCHAR(100),
            alternative_workcenters VARCHAR(255),
            cost_per_hour DECIMAL(10, 2) DEFAULT 0,
            capacity DECIMAL(10, 2) DEFAULT 100,
            time_efficiency DECIMAL(5, 2) DEFAULT 100,
            oee_target DECIMAL(5, 2) DEFAULT 85,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Create Equipment table
        """
        CREATE TABLE equipment (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            serial_number VARCHAR(255) NOT NULL UNIQUE,
            category_id INTEGER REFERENCES equipment_categories(id) ON DELETE SET NULL,
            company VARCHAR(255),
            department VARCHAR(255),
            employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            purchase_date DATE,
            warranty_end DATE,
            assigned_date DATE,
            scrap_date DATE,
            location VARCHAR(255),
            work_center_id INTEGER REFERENCES work_centers(id) ON DELETE SET NULL,
            department_or_owner VARCHAR(255),
            maintenance_team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE SET NULL,
            description TEXT,
            is_scrapped BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Create Team Members junction table
        """
        CREATE TABLE team_members (
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, team_id)
        )
        """,
        
        # Create Maintenance Requests table
        """
        CREATE TABLE maintenance_requests (
            id SERIAL PRIMARY KEY,
            request_type VARCHAR(20) NOT NULL DEFAULT 'equipment' CHECK (request_type IN ('equipment', 'work_center')),
            type VARCHAR(20) NOT NULL CHECK (type IN ('Corrective', 'Preventive')),
            subject VARCHAR(255) NOT NULL,
            description TEXT,
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
            work_center_id INTEGER REFERENCES work_centers(id) ON DELETE SET NULL,
            category VARCHAR(255),
            company VARCHAR(255),
            maintenance_team_id INTEGER REFERENCES maintenance_teams(id) ON DELETE SET NULL,
            assigned_technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            scheduled_date TIMESTAMP WITH TIME ZONE,
            request_date DATE,
            duration_hours DECIMAL(5, 2) DEFAULT 0,
            notes TEXT,
            instructions TEXT,
            status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Repaired', 'Scrap')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]
    
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
        
        for command in commands:
            cur.execute(command)
            
        cur.close()
        conn.commit()
        print("All tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    create_database()
    create_tables()
