import React, { Suspense } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Grid } from '@mui/material';

import {
  FormFieldsConfig,
  FormValues,
} from 'shared/forms/types/form';

const DateInputField = React.lazy(
  () => import('components/form/fields/DateInputField/DateInputField')
);

const FileInputField = React.lazy(
  () => import('components/form/fields/FileInputField/FileInputField')
);

const TextInputField = React.lazy(
  () => import('components/form/fields/TextInputField/TextInputField')
);

const TextareaInputField = React.lazy(
  () => import('components/form/fields/TextareaField/TextareaField')
);

const RadioInputField = React.lazy(
  () => import('components/form/fields/RadioInputField/RadioInputField')
);

const NumberInputField = React.lazy(
  () => import('components/form/fields/NumberInputField/NumberInputField')
);

const SelectInputField = React.lazy(
  () => import('components/form/fields/SelectInputField/SelectInputField')
);

const SwitchInputField = React.lazy(
  () => import('components/form/fields/SwitchInputField/SwitchInputField')
);

const CheckboxInputField = React.lazy(
  () => import('components/form/fields/CheckboxInputField/CheckboxInputField')
);

interface FormRendererProps {
  fields: FormFieldsConfig;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  control,
  errors,
}) => {
  return (
    <Grid container spacing={3}>
      {Object.entries(fields).map(([name, config]) => {
        const error = errors[name]?.message;

        return (
          <Controller
            key={name}
            name={name}
            control={control}
            defaultValue={config.defaultValue}
            render={({ field }) => (
              <Grid size={config.grid}>
                <Suspense fallback={null}>
                  {config.type === 'switch' && (
                    <SwitchInputField
                      name={name}
                      label={config.label}
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      required={config.required}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {config.type === 'date' && (
                    <DateInputField
                      name={name}
                      label={config.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : null
                      }
                      onChange={field.onChange}
                      required={config.required}
                      options={config.options || []}
                      error={
                        typeof error === 'string'
                          ? error
                          : ''
                      }
                    />
                  )}

                  {config.type === 'select' && (
                    <SelectInputField
                      name={name}
                      label={config.label}
                      value={field.value}
                      onChange={field.onChange}
                      options={config.options || []}
                      required={config.required}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {config.type === 'radio' && (
                    <RadioInputField
                      name={name}
                      label={config.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      options={(config.options || []).map((option) => ({
                        label: option.label,
                        value: String(option.value),
                      }))}
                      required={config.required}
                    />
                  )}

                  {config.type === 'text' && (
                    <TextInputField
                      name={name}
                      label={config.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      required={config.required}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {config.type === 'number' && (
                    <NumberInputField
                      name={name}
                      label={config.label}
                      value={
                        typeof field.value === 'number' ||
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      required={config.required}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {config.type === 'textarea' && (
                    <TextareaInputField
                      name={name}
                      label={config.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      required={config.required}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {config.type === 'file' && (
                    <FileInputField
                      name={name}
                      label={config.label}
                      value={
                        field.value instanceof File
                          ? field.value
                          : null
                      }
                      onChange={field.onChange}
                      required={config.required}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {config.type === 'checkbox' && (
                    <CheckboxInputField
                      name={name}
                      label={config.label}
                      value={Boolean(field.value)}
                      onChange={field.onChange}
                    />
                  )}
                </Suspense>
              </Grid>
            )}
          />
        );
      })}
    </Grid>
  );
};

export default FormRenderer;