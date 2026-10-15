export type ShipmentOrderStatus =
  | 'draft'
  | 'submitted'
  | 'operator_review'
  | 'approved_for_collection'
  | 'collected'
  | 'received_at_branch'
  | 'invoice_registered'
  | 'ready_for_dispatch'
  | 'dispatched_to_freight'
  | 'handover_pending_approval'
  | 'handover_approved'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface ShipmentOrder {
  id: number;
  public_id: string;
  tracking_code: string;
  barcode: string;

  branch: number;
  customer: number;
  preferred_freight_company: number | null;

  sender_name: string;
  sender_mobile: string;
  sender_address: string;

  receiver_name: string;
  receiver_mobile: string;
  receiver_address: string;

  shipment_description: string;

  status: ShipmentOrderStatus;
  submitted_at: string | null;

  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentOrderBranch {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface ShipmentOrderCustomer {
  id: number;
  mobile: string;
  customer_type: string;
  first_name: string;
  last_name: string;
  national_id: string | null;
  company_name: string;
  company_registration_no: string;
  economic_code: string;
  display_name: string;
  created_at: string;
}

export interface ShipmentOrderFreightCompany {
  id: number;
  name: string;
  code: string;
  contact_phone: string;
  website: string;
  is_active: boolean;
  created_at: string;
}

export interface ShipmentOrderDetail
  extends Omit<
    ShipmentOrder,
    'branch' | 'customer' | 'preferred_freight_company'
  > {
  branch: ShipmentOrderBranch;
  customer: ShipmentOrderCustomer;
  preferred_freight_company: ShipmentOrderFreightCompany | null;
}