import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { ParcelWriteRequest } from 'features/freight/api/parcelApi';
import { PARCEL_PRESETS } from 'features/freight/constants/parcelPresets';
import { Parcel } from 'features/freight/types/parcel';
import { parcelFormConfig, parcelValidationSchema } from 'features/freight/forms/parcelForm';
import SelectInputField from 'components/form/fields/SelectInputField/SelectInputField';
import FormRenderer from 'shared/forms/FormRenderer';
import { FormValues } from 'shared/forms/types/form';

interface ParcelFormDialogProps {
  open: boolean;
  orderId: number | string;
  parcel?: Parcel | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: ParcelWriteRequest) => void | Promise<void>;
}

const toOptionalDecimalString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return String(value);
};

const ParcelFormDialog: React.FC<ParcelFormDialogProps> = ({
  open,
  orderId,
  parcel,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(parcelValidationSchema),
    defaultValues: parcelFormConfig.defaultValues,
  });

  const isEditing = Boolean(parcel);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedPreset('custom');

    reset({
      parcel_number: parcel ? String(parcel.parcel_number) : '',
      contents_description: parcel?.contents_description ?? '',
      declared_weight_kg: parcel?.declared_weight_kg ?? '',
      declared_length_cm: parcel?.declared_length_cm ?? '',
      declared_width_cm: parcel?.declared_width_cm ?? '',
      declared_height_cm: parcel?.declared_height_cm ?? '',
    });
  }, [open, parcel, reset]);

  const handlePresetChange = (_name: string, value: unknown) => {
    const presetId = String(value);
    const preset = PARCEL_PRESETS.find((item) => item.id === presetId);

    setSelectedPreset(presetId);

    if (!preset) {
      return;
    }

    setValue('declared_weight_kg', preset.weightKg, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('declared_length_cm', preset.lengthCm, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('declared_width_cm', preset.widthCm, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('declared_height_cm', preset.heightCm, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const submitForm = (values: FormValues) => {
    const data: ParcelWriteRequest = {
      order: orderId,
      parcel_number: Number(values.parcel_number),
      declared_weight_kg: toOptionalDecimalString(
        values.declared_weight_kg
      ),
      declared_length_cm: toOptionalDecimalString(
        values.declared_length_cm
      ),
      declared_width_cm: toOptionalDecimalString(
        values.declared_width_cm
      ),
      declared_height_cm: toOptionalDecimalString(
        values.declared_height_cm
      ),
      contents_description: String(
        values.contents_description ?? ''
      ).trim(),
    };

    void onSubmit(data);
  };

  const presetOptions = PARCEL_PRESETS.map((preset) => ({
    label: preset.label,
    value: preset.id,
  }));

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <DialogTitle>
          {isEditing ? 'ویرایش بسته' : 'افزودن بسته'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <SelectInputField
              name="parcel_preset"
              label="اندازه بسته"
              value={selectedPreset}
              onChange={handlePresetChange}
              options={presetOptions}
              readOnly={isSubmitting}
            />

            <Typography variant="caption" color="text.secondary">
              با انتخاب اندازه، وزن و ابعاد پیش‌فرض پر می‌شوند.
              می‌توانید مقادیر را متناسب با بسته واقعی تغییر دهید.
            </Typography>

            <FormRenderer
              config={parcelFormConfig}
              control={control}
              errors={errors}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            انصراف
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'در حال ذخیره...'
              : isEditing
                ? 'ذخیره تغییرات'
                : 'ثبت بسته'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ParcelFormDialog;