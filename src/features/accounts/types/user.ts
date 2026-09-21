export interface UserBranch {
  id: number;
  name: string;
}

export interface User {
  id: number;
  mobile: string;
  email: string;
  branch: UserBranch | null;
  is_active: boolean;
  is_mobile_verified: boolean;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  mobile: string;
  email?: string;
  branch: number | null;
  password: string;
  is_active: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  branch?: number | null;
  is_active?: boolean;
}