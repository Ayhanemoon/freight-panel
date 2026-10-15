import { Branch } from 'features/freight/types/branch';

export interface CustomerBranchMembership {
  id: number;
  branch: Pick<Branch, 'id' | 'name'>;
  status: string;
  created_at: string;
  approved_at: string | null;
}