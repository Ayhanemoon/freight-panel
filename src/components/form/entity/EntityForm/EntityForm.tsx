import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { Button, Grid, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { validationSchemas } from 'validations/entityValidation';
import { entityFormFields, FieldType, getEntityLabel } from 'utils/EntityForm';
import { useCreateEntityMutation, useUpdateEntityMutation, useGetEntityQuery } from 'features/api/entityApi';

import './EntityForm.scss';

const DateInputField = React.lazy(() => import('components/form/fields/DateInputField/DateInputField'));
const FileInputField = React.lazy(() => import('components/form/fields/FileInputField/FileInputField'));
const TextInputField = React.lazy(() => import('components/form/fields/TextInputField/TextInputField'));
const TextareaInputField = React.lazy(() => import('components/form/fields/TextareaField/TextareaField'));
const RadioInputField = React.lazy(() => import('components/form/fields/RadioInputField/RadioInputField'));
const NumberInputField = React.lazy(() => import('components/form/fields/NumberInputField/NumberInputField'));
const SelectInputField = React.lazy(() => import('components/form/fields/SelectInputField/SelectInputField'));
const SwitchInputField = React.lazy(() => import('components/form/fields/SwitchInputField/SwitchInputField'));
const CheckboxInputField = React.lazy(() => import('components/form/fields/CheckboxInputField/CheckboxInputField'));

interface FieldComponentProps {
  name: string;
  label: string;
  value: any;
  onChange: (name: string, value: any) => void;
  required: boolean;
  checked: boolean; // Optional, but required for switch or checkbox fields
  options: { label: string; value: any }[]; // For select or radio fields
  error: string; // For validation error messages
}

const entityFields: Record<FieldType, React.FC<FieldComponentProps>> = {
  text: TextInputField,
  number: NumberInputField,
  switch: SwitchInputField,
  date: DateInputField,
  select: SelectInputField,
  file: FileInputField,
  radio: RadioInputField,
  textarea: TextareaInputField,
  checkbox: CheckboxInputField,
};



const EntityForm: React.FC<{ entity: string }> = ({ entity }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: existingItem } = useGetEntityQuery({ entity, id }, { skip: !id });
  const [createEntity] = useCreateEntityMutation();
  const [updateEntity] = useUpdateEntityMutation();

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isLoading },
  } = useForm<Record<string, any>>({
    resolver: yupResolver(validationSchemas[entity]), // Use yup schema for validation
    defaultValues: {}, // Default values will be set dynamically
  });

  useEffect(() => {
    if (existingItem) {
      // Populate form fields with existing data in edit mode
      Object.keys(existingItem).forEach((key) => {
        setValue(key, existingItem[key]);
      });
    }
  }, [existingItem, setValue]);

  const onSubmit = async (data: any) => {
    if (id) {
      await updateEntity({ entity, id, data });
    } else {
      await createEntity({ entity, data });
    }
    navigate(-1); // Go back to the previous page
  };

  const handleInputChange = (name: string, value: any) => {
    setValue(name, value);
  };
  

  return (
    <div className="entity-form">
      <Typography variant="h5">{id ? `تغییر ${getEntityLabel(entity, 'singular')}` : `ساخت ${getEntityLabel(entity, 'singular')}`}</Typography>
      <form className='entity-form__form' onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} >
        {Object.keys(entityFormFields[entity] || {}).map    ((key) => {
          const field = entityFormFields[entity][key]; // Use entityFormFields for field configuration
          if (!field) return null; // Skip undefined fields
          const FieldComponent = entityFields[field.type as keyof typeof entityFields];
          if (!FieldComponent) return null;
          return (
            <Controller
              key={key}
              name={key}
              control={control}
              defaultValue={field.defaultValue !== undefined ? field.defaultValue : ''}
              render={({ field: { onChange, value } }) => (
                <Grid size={field.grid}>
                  <FieldComponent
                    name={key}
                    label={field.label}
                    value={value}
                    onChange={(name, value) => handleInputChange(name, value)}
                    required={field.required}
                    checked={field.type === 'switch' ? value : undefined} // For switch or checkbox fields
                    options={field.options || []} // For select or radio fields
                    error={typeof errors[key]?.message === 'string' ? errors[key]?.message : ''} // Pass validation error
                  />
                </Grid>
              )}
            />
          );
        })}
      </Grid>
        <div className="entity-form__buttons">
          <Button loading={isLoading} variant="contained" type="submit">
            ذخیره
          </Button>
          <Button color='error' onClick={() => navigate(-1)}>لغو</Button>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;