export type FreightRole =
  | 'SuperAdmin'
  | 'BranchManager'
  | 'Operator'
  | 'CargoCollector'
  | 'Dispatcher'
  | 'Customer';

export interface CurrentUserCapabilities {
  user: {
    id: number;
    mobile: string;
    is_active: boolean;
    is_mobile_verified: boolean;
  };
  roles: FreightRole[];
  branch: {
    id: number;
    name: string;
  } | null;
  permissions: string[];
}