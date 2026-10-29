
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import type {
  InvoiceCharge,
  InvoiceChargeInput,
  InvoiceChargeType,
  InvoicePayer,
} from 'features/freight/types/invoice';

interface InvoiceChargeDialogProps {
  open: boolean;
  charge: InvoiceCharge | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceChargeInput) => void | Promise<void>;
}

const chargeTypes: Array<{
  value: InvoiceChargeType;
  label: string;
}> = [
  { value: 'freight', label: 'کرایه حمل' },
  { value: 'insurance', label: 'بیمه' },
  { value: 'crane_loading', label: 'بارگیری / جرثقیل' },
  { value: 'branch', label: 'هزینه شعبه' },
  { value: 'other', label: 'سایر هزینه‌ها' },
];

const InvoiceChargeDialog = ({
  open,
  charge,
  isSubmitting,
  onClose,
  onSubmit,
}: InvoiceChargeDialogProps) => {
  const [chargeType, setChargeType] =
    useState<InvoiceChargeType>('freight');
  const [payer, setPayer] = useState<InvoicePayer>('sender');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!open) return;

    setChargeType(charge?.charge_type ?? 'freight');
    setPayer(charge?.payer ?? 'sender');
    setDescription(charge?.description ?? '');
    setAmount(charge?.amount ?? '');
    setValidationError('');
  }, [open, charge]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedAmount = amount.trim();
    const numericAmount = Number(normalizedAmount);

    if (
      !normalizedAmount ||
      !Number.isFinite(numericAmount) ||
      numericAmount < 0
    ) {
      setValidationError('مبلغ باید عددی معتبر و غیرمنفی باشد.');
      return;
    }

    setValidationError('');

    await onSubmit({
      charge_type: chargeType,
      payer,
      description: description.trim(),
      amount: normalizedAmount,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
    >
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogTitle>
          {charge ? 'ویرایش ردیف هزینه' : 'افزودن ردیف هزینه'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {validationError && (
              <Alert severity="error">{validationError}</Alert>
            )}

            <FormControl fullWidth>
              <InputLabel id="invoice-charge-type-label">
                نوع هزینه
              </InputLabel>
              <Select
                labelId="invoice-charge-type-label"
                label="نوع هزینه"
                value={chargeType}
                onChange={(event) =>
                  setChargeType(event.target.value as InvoiceChargeType)
                }
                disabled={isSubmitting}
              >
                {chargeTypes.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="invoice-charge-payer-label">
                پرداخت‌کننده
              </InputLabel>
              <Select
                labelId="invoice-charge-payer-label"
                label="پرداخت‌کننده"
                value={payer}
                onChange={(event) =>
                  setPayer(event.target.value as InvoicePayer)
                }
                disabled={isSubmitting}
              >
                <MenuItem value="sender">فرستنده</MenuItem>
                <MenuItem value="receiver">گیرنده</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="مبلغ (ریال)"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ min: 0, step: 1 }}
              required
              fullWidth
              disabled={isSubmitting}
            />

            <TextField
              label="شرح هزینه"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              disabled={isSubmitting}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
          >
            انصراف
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'ذخیره'
            )}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};

export default InvoiceChargeDialog;
