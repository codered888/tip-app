// ============================================
// Organization & User Types (Multi-tenant)
// ============================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'super_admin' | 'customer_admin';
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin';
  created_at: string;
}

export interface UserWithOrganizations extends User {
  organizations: Organization[];
}

// ============================================
// Location & Employee Types
// ============================================

export interface Location {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  venmo: string | null;
  cashapp: string | null;
  zelle: string | null;
  status: 'pending' | 'approved';
  organization_id: string;
  created_at: string;
}

export interface EmployeeWithLocations extends Employee {
  locations: Location[];
}

export interface EmployeeLocation {
  employee_id: string;
  location_id: string;
}

export interface AdminSettings {
  id: number;
  password_hash: string;
}

export interface SignupFormData {
  name: string;
  bio: string;
  venmo: string;
  cashapp: string;
  zelle: string;
  locationIds: string[];
  photo: File | null;
}
