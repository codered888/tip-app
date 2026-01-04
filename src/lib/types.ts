export interface Location {
  id: string;
  name: string;
  slug: string;
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
