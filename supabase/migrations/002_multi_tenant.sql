-- Multi-Tenant SaaS Schema Migration
-- Transforms single-tenant app into multi-tenant platform

-- ============================================
-- 1. CREATE NEW TABLES
-- ============================================

-- Organizations table (each customer business)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,  -- subdomain: {slug}.tip-app.vercel.app
    logo_url TEXT,
    primary_color TEXT DEFAULT '#5A7A60',
    secondary_color TEXT DEFAULT '#F5F3EF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'customer_admin'
        CHECK (role IN ('super_admin', 'customer_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization memberships (users can belong to multiple orgs)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ============================================
-- 2. MODIFY EXISTING TABLES
-- ============================================

-- Add organization_id to locations
ALTER TABLE locations
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to employees
ALTER TABLE employees
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_locations_organization ON locations(organization_id);
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations: Public can view by slug (for subdomain lookup)
CREATE POLICY "Public can view organizations by slug" ON organizations
    FOR SELECT USING (true);

-- Organizations: Members can update their org
CREATE POLICY "Members can update their organization" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Users: Users can view and update themselves
CREATE POLICY "Users can view themselves" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update themselves" ON users
    FOR UPDATE USING (id = auth.uid());

-- Users: Super admins can view all users
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- Organization members: Members can view their org's members
CREATE POLICY "Members can view org members" ON organization_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Update locations policy to include org scoping
DROP POLICY IF EXISTS "Public can view locations" ON locations;

CREATE POLICY "Public can view locations" ON locations
    FOR SELECT USING (true);

CREATE POLICY "Org admins can manage locations" ON locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = locations.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Update employees policy to include org scoping
DROP POLICY IF EXISTS "Public can view approved employees" ON employees;

CREATE POLICY "Public can view approved employees" ON employees
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Org admins can manage employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = employees.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user record when Supabase Auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer_admin')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger should be created via Supabase dashboard
-- as it requires access to auth schema
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Get organization by slug
CREATE OR REPLACE FUNCTION get_org_by_slug(org_slug TEXT)
RETURNS UUID AS $$
    SELECT id FROM organizations WHERE slug = org_slug LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users WHERE id = user_id AND role = 'super_admin'
    );
$$ LANGUAGE SQL STABLE;

-- Check if user has access to organization
CREATE OR REPLACE FUNCTION has_org_access(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.user_id = user_id
        AND organization_members.organization_id = org_id
    ) OR is_super_admin(user_id);
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 7. MIGRATE EXISTING DATA
-- ============================================

-- Create Elements Massage organization (existing customer)
INSERT INTO organizations (name, slug)
VALUES ('Elements Massage', 'elements')
ON CONFLICT (slug) DO NOTHING;

-- Update existing locations to belong to Elements Massage
UPDATE locations
SET organization_id = (SELECT id FROM organizations WHERE slug = 'elements')
WHERE organization_id IS NULL;

-- Update existing employees to belong to Elements Massage
UPDATE employees
SET organization_id = (SELECT id FROM organizations WHERE slug = 'elements')
WHERE organization_id IS NULL;

-- ============================================
-- 8. ADD NOT NULL CONSTRAINTS (after migration)
-- ============================================

-- These should be run after verifying all data is migrated
-- ALTER TABLE locations ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE employees ALTER COLUMN organization_id SET NOT NULL;
