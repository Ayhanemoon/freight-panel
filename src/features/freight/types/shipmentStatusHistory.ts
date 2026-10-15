export interface ShipmentStatusHistory {
  id: number;
  shipment: number;
  from_status: string | null;
  to_status: string;
  changed_by: number | null;
  note: string;
  created_at: string;
}