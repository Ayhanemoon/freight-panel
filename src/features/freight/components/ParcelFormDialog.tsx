import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ParcelWriteRequest } from 'features/freight/api/parcelApi';
import { PARCEL_PRESETS } from 'features/freight/constants/parcelPresets';
import { Parcel } from 'features/freight/types/parcel';

interface ParcelFormDialogProps {
  open: boolean;
  orderId: number | string;
  parcel?: Parcel | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: ParcelWriteRequest) => void | Promise<void>;
}

interface ParcelFormValues {
  parcel_number: string;
  declared_weight_kg: string;
  declared_length_cm: string;
  declared_width_cm: string;
  declared_height_cm: string;
  contents_description: string;
}

const emptyValues: ParcelFormValues = {
  parcel_number: '',
  declared_weight_kg: '',
  declared_length_cm: '',
  declared_width_cm: '',
  declared_height_cm: '',
  contents_description: '',
};

const ParcelFormDialog: React.FC<ParcelFormDialogProps> = ({
  open,
  orderId,
  parcel,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] =
    useState<ParcelFormValues>(emptyValues);

  const [selectedPreset, setSelectedPreset] =
    useState('custom');

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const isEditing = Boolean(parcel);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError(null);
    setSelectedPreset('custom');

    if (parcel) {
      setValues({
        parcel_number: String(parcel.parcel_number),
        declared_weight_kg: parcel.declared_weight_kg ?? '',
        declared_length_cm: parcel.declared_length_cm ?? '',
        declared_width_cm: parcel.declared_width_cm ?? '',
        declared_height_cm: parcel.declared_height_cm ?? '',
        contents_description: parcel.contents_description ?? '',
      });
    } else {
      setValues(emptyValues);
    }
  }, [open, parcel]);

  const handleChange =
    (field: keyof ParcelFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));

      setValidationError(null);
    };

  const handlePresetChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const presetId = event.target.value;
    const preset = PARCEL_PRESETS.find(
      (item) => item.id === presetId
    );

    if (!preset) {
      return;
    }

    setSelectedPreset(presetId);

    setValues((current) => ({
      ...current,
      declared_weight_kg: preset.weightKg,
      declared_length_cm: preset.lengthCm,
      declared_width_cm: preset.widthCm,
      declared_height_cm: preset.heightCm,
    }));

    setValidationError(null);
  };

  const parseOptionalDecimal = (
    value: string,
    label: string
  ): string | null => {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const number = Number(normalized);

    if (!Number.isFinite(number) || number < 0) {
      throw new Error(
        `${label} باید عددی معتبر و غیرمنفی باشد.`
      );
    }

    return normalized;
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setValidationError(null);

    const parcelNumber = Number(values.parcel_number);

    if (
      !values.parcel_number.trim() ||
      !Number.isInteger(parcelNumber) ||
      parcelNumber < 1
    ) {
      setValidationError(
        'شماره بسته باید یک عدد صحیح مثبت باشد.'
      );
      return;
    }

    try {
      const data: ParcelWriteRequest = {
        order: orderId,
        parcel_number: parcelNumber,
        declared_weight_kg: parseOptionalDecimal(
          values.declared_weight_kg,
          'وزن'
        ),
        declared_length_cm: parseOptionalDecimal(
          values.declared_length_cm,
          'طول'
        ),
        declared_width_cm: parseOptionalDecimal(
          values.declared_width_cm,
          'عرض'
        ),
        declared_height_cm: parseOptionalDecimal(
          values.declared_height_cm,
          'ارتفاع'
        ),
        contents_description: values.contents_description.trim(),
      };

      void onSubmit(data);
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : 'اطلاعات واردشده معتبر نیست.'
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? 'ویرایش بسته' : 'افزودن بسته'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {validationError && (
              <Typography color="error" variant="body2">
                {validationError}
              </Typography>
            )}

            <TextField
              select
              label="اندازه بسته"
              value={selectedPreset}
              onChange={handlePresetChange}
              fullWidth
            >
              {PARCEL_PRESETS.map((preset) => (
                <MenuItem key={preset.id} value={preset.id}>
                  {preset.label}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="caption" color="text.secondary">
              با انتخاب یک اندازه، وزن و ابعاد پیش‌فرض پر می‌شوند.
              می‌توانید همه مقادیر را تغییر دهید.
            </Typography>

            <TextField
              label="شماره بسته"
              type="number"
              value={values.parcel_number}
              onChange={handleChange('parcel_number')}
              required
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />

            <TextField
              label="شرح محتویات"
              value={values.contents_description}
              onChange={handleChange('contents_description')}
              fullWidth
              multiline
              minRows={2}
            />

            <TextField
              label="وزن (کیلوگرم)"
              type="number"
              value={values.declared_weight_kg}
              onChange={handleChange('declared_weight_kg')}
              fullWidth
              inputProps={{ min: 0, step: 'any' }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
            >
              <TextField
                label="طول (سانتی‌متر)"
                type="number"
                value={values.declared_length_cm}
                onChange={handleChange('declared_length_cm')}
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
              />

              <TextField
                label="عرض (سانتی‌متر)"
                type="number"
                value={values.declared_width_cm}
                onChange={handleChange('declared_width_cm')}
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
              />

              <TextField
                label="ارتفاع (سانتی‌متر)"
                type="number"
                value={values.declared_height_cm}
                onChange={handleChange('declared_height_cm')}
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
          >
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