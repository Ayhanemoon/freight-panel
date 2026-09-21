export interface User {
  id: number;
  mobile: string;
  email: string;
  branch: {
    id: number;
    name: string;
  } | null;
  is_active: boolean;
  is_mobile_verified: boolean;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}