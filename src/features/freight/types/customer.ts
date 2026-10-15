export interface Customer {
  id: number;
  mobile: string;
  customer_type: string;
  first_name: string;
  last_name: string;
  national_id: string | null;
  company_name: string | null;
  company_registration_no: string | null;
  economic_code: string | null;
  display_name: string;
  created_at: string;
}
