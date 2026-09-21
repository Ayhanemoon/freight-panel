import { FormValues } from 'shared/forms/types/form';

export type RecordToFormValues<TRecord> = (
  record: TRecord
) => FormValues;

export type FormValuesToRequest<TRequest> = (
  values: FormValues
) => TRequest;