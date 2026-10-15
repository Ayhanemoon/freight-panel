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