-- Tip Collection App Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    photo_url TEXT,
    bio TEXT,
    venmo TEXT,
    cashapp TEXT,
    zelle TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    signup_token UUID UNIQUE DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for employee-location relationships
CREATE TABLE employee_locations (
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, location_id)
);

-- Admin settings (single row for master password)
CREATE TABLE admin_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    password_hash TEXT NOT NULL
);

-- Insert default locations (5 massage locations)
INSERT INTO locations (name, slug) VALUES
    ('Downtown', 'downtown'),
    ('Westside', 'westside'),
    ('Northgate', 'northgate'),
    ('Lakeside', 'lakeside'),
    ('Eastpoint', 'eastpoint');

-- Insert default admin password (change this after first login!)
-- Default password: 'admin123' - CHANGE THIS IN PRODUCTION
INSERT INTO admin_settings (password_hash) VALUES
    ('$2a$10$rQEY5xN5HXrPJPJz5YiOXePvK5vCJPVhKH0cKKxhPVhjWZoNgRJe.');

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Public read access to locations
CREATE POLICY "Public can view locations" ON locations
    FOR SELECT USING (true);

-- Public can view approved employees only
CREATE POLICY "Public can view approved employees" ON employees
    FOR SELECT USING (status = 'approved');

-- Public can view employee_locations for approved employees
CREATE POLICY "Public can view employee locations" ON employee_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = employee_locations.employee_id
            AND employees.status = 'approved'
        )
    );

-- Service role has full access (for admin operations via API)
-- These policies allow the service role to bypass RLS

-- Create storage bucket for employee photos
-- Note: Run this in Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
