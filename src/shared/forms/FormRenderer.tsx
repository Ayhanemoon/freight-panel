import React, { Suspense } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Grid } from '@mui/material';

import {
  FormConfig,
  FormFieldOptions,
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
  config: FormConfig;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  fieldOptions?: FormFieldOptions;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  control,
  errors,
  fieldOptions,
}) => {
  return (
    <Grid container spacing={3}>
      {Object.entries(config.fields).map(([name, fieldConfig]) => {
        const error = errors[name]?.message;

        return (
          <Controller
            key={name}
            name={name}
            control={control}
            defaultValue={fieldConfig.defaultValue}
            render={({ field }) => (
              <Grid size={fieldConfig.grid}>
                <Suspense fallback={null}>
                  {fieldConfig.type === 'switch' && (
                    <SwitchInputField
                      name={name}
                      label={fieldConfig.label}
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'date' && (
                    <DateInputField
                      name={name}
                      label={fieldConfig.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : null
                      }
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      options={fieldConfig.options || []}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : ''
                      }
                    />
                  )}

                  {fieldConfig.type === 'select' && (
                    <SelectInputField
                      name={name}
                      label={fieldConfig.label}
                      value={field.value}
                      onChange={field.onChange}
                      options={fieldOptions?.[name] || fieldConfig.options || []}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'radio' && (
                    <RadioInputField
                      name={name}
                      label={fieldConfig.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      options={(fieldConfig.options || []).map((option) => ({
                        label: option.label,
                        value: String(option.value),
                      }))}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'text' && (
                    <TextInputField
                      name={name}
                      label={fieldConfig.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'number' && (
                    <NumberInputField
                      name={name}
                      label={fieldConfig.label}
                      value={
                        typeof field.value === 'number' ||
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'textarea' && (
                    <TextareaInputField
                      name={name}
                      label={fieldConfig.label}
                      value={
                        typeof field.value === 'string'
                          ? field.value
                          : ''
                      }
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'file' && (
                    <FileInputField
                      name={name}
                      label={fieldConfig.label}
                      value={
                        field.value instanceof File
                          ? field.value
                          : null
                      }
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
                    />
                  )}

                  {fieldConfig.type === 'checkbox' && (
                    <CheckboxInputField
                      name={name}
                      label={fieldConfig.label}
                      value={Boolean(field.value)}
                      onChange={field.onChange}
                      required={fieldConfig.required}
                      readOnly={fieldConfig.readOnly}
                      error={
                        typeof error === 'string'
                          ? error
                          : undefined
                      }
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