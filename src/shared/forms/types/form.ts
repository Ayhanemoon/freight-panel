
import { FormValidationSchema } from 'shared/forms/validation';

export type FieldType =
  | 'text'
  | 'number'
  | 'switch'
  | 'date'
  | 'select'
  | 'file'
  | 'radio'
  | 'textarea'
  | 'checkbox';

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
}

export type FormFieldOptions = Record<string, SelectOption[]>;
export interface FormFieldConfig {
  type: FieldType;
  label: string;
  required?: boolean;
  defaultValue?: unknown;
  readOnly?: boolean;
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  options?: SelectOption[];
}

export type FormFieldsConfig = Record<string, FormFieldConfig>;

export type FormValues = Record<string, unknown>;

export interface FormConfig {
  fields: FormFieldsConfig;
  validationSchema?: FormValidationSchema;
  defaultValues?: FormValues;
}
