export type ParcelVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected';

export interface Parcel {
  id: number;
  order: number;
  parcel_number: number;

  declared_weight_kg: string | null;
  declared_length_cm: string | null;
  declared_width_cm: string | null;
  declared_height_cm: string | null;
  contents_description: string;

  verified_weight_kg: string | null;
  verified_length_cm: string | null;
  verified_width_cm: string | null;
  verified_height_cm: string | null;

  verification_status: ParcelVerificationStatus | string;
  verified_by: number | null;
  verified_at: string | null;

  created_at: string;
  updated_at: string;
}