export type DispatchBatchStatus =
  | 'draft'
  | 'ready'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type DispatchOrderStatus =
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'rejected'
  | 'returned'
  | 'cancelled';

export type DispatchAssignmentStatus =
  | 'dispatching'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type FreightPayer = 'sender' | 'receiver';

export interface DispatchFreightAssignment {
  id: number;
  dispatch_order: number;
  freight_company: number;
  status: DispatchAssignmentStatus;
  payer: FreightPayer;
  freight_amount: string | null;
  rejection_reason: string;
  freight_invoice_number: string;
  freight_invoice_file: string | null;
  notes: string;
  assigned_at: string;
  approved_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface DispatchOrder {
  id: number;
  batch: number;
  order: number;
  status: DispatchOrderStatus;
  notes: string;
  freight_assignments: DispatchFreightAssignment[];
  created_at: string;
  updated_at: string;
}

export interface DispatchBatch {
  id: number;
  branch: number;
  dispatcher: number | null;
  status: DispatchBatchStatus;
  scheduled_at: string | null;
  dispatched_at: string | null;
  completed_at: string | null;
  notes: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  orders: DispatchOrder[];
}

export interface CreateDispatchBatchRequest {
  branch: number;
  scheduled_at?: string | null;
  notes?: string;
}

export interface AssignFreightRequest {
  freight_company: number;
  payer: FreightPayer;
}

export interface DispatchActionRequest {
  notes?: string;
}

export interface DispatchRejectRequest extends DispatchActionRequest {
  reason: string;
}

export interface DispatchDeliveredRequest extends DispatchActionRequest {
  freight_invoice_number: string;
  freight_invoice_file?: File | null;
}