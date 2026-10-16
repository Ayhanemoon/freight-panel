export interface ParcelPreset {
  id: string;
  label: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  weightKg: string;
}

export const PARCEL_PRESETS: ParcelPreset[] = [
  {
    id: 'envelope-a5',
    label: 'پاکت نامه A5',
    lengthCm: '22',
    widthCm: '16',
    heightCm: '1',
    weightKg: '0.1',
  },
  {
    id: 'envelope-a4',
    label: 'پاکت نامه A4',
    lengthCm: '31',
    widthCm: '23',
    heightCm: '1',
    weightKg: '0.15',
  },
  {
    id: 'large-envelope',
    label: 'پاکت پستی ضخیم A4',
    lengthCm: '33',
    widthCm: '23',
    heightCm: '3',
    weightKg: '0.2',
  },
  {
    id: 'box-1',
    label: 'کارتن پستی سایز ۱',
    lengthCm: '15',
    widthCm: '10',
    heightCm: '10',
    weightKg: '0.2',
  },
  {
    id: 'box-2',
    label: 'کارتن پستی سایز ۲',
    lengthCm: '20',
    widthCm: '15',
    heightCm: '10',
    weightKg: '0.3',
  },
  {
    id: 'box-3',
    label: 'کارتن پستی سایز ۳',
    lengthCm: '30.5',
    widthCm: '20.5',
    heightCm: '19',
    weightKg: '0.5',
  },
  {
    id: 'custom',
    label: 'اندازه دلخواه',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    weightKg: '',
  },
];