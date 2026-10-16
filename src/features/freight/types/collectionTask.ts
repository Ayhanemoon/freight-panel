
export type CollectionTaskType =
  | 'customer_delivery'
  | 'collector_pickup';

export type CollectionTaskStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface CollectionTask {
  id: number;
  order: number;
  task_type: CollectionTaskType;
  status: CollectionTaskStatus;
  collector: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AssignCollectionTaskRequest {
  collector: number;
}

export interface CollectionTaskStatusRequest {
  note?: string;
}

export interface VerifyCollectionTaskParcelRequest {
  parcel: number;
  verified_weight_kg: string;
  verified_length_cm: string;
  verified_width_cm: string;
  verified_height_cm: string;
}

export interface VerifyCollectionTaskParcelResponse {
  detail: string;
  parcel_id: number;
  verification_status: 'verified' | 'difference_found';
  verified_by: number;
  verified_at: string;
}
