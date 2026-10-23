export type InvoiceChargeType =
  | 'freight'
  | 'insurance'
  | 'crane_loading'
  | 'branch'
  | 'other';

export type InvoicePayer = 'sender' | 'receiver';

export interface InvoiceChargeInput {
  charge_type: InvoiceChargeType;
  payer?: InvoicePayer | null;
  description?: string;
  amount: string;
}

export interface InvoiceParcelInput {
  parcel: number;
  parcel_name?: string;
  parcel_type?: string;
  quantity?: number;
}

export interface Invoice {
  id: number;
  order: number;
  invoice_number: string;
  issued_at: string;
  operator: number;
  customer_name: string;
  customer_mobile: string;
  customer_address: string;
  receiver_name: string;
  receiver_mobile: string;
  receiver_address: string;
  total_cost: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  order: number;
  invoice_number: string;
  issued_at?: string | null;
  charges?: InvoiceChargeInput[];
  parcels: InvoiceParcelInput[];
  notes?: string;
}