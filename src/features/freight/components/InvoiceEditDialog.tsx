
import { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import type {
  Invoice,
  UpdateInvoiceRequest,
} from 'features/freight/types/invoice';

interface InvoiceEditDialogProps {
  open: boolean;
  invoice: Invoice;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateInvoiceRequest) => void | Promise<void>;
}

const InvoiceEditDialog = ({
  open,
  invoice,
  isSubmitting,
  onClose,
  onSubmit,
}: InvoiceEditDialogProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice.invoice_number,
  );
  const [notes, setNotes] = useState(invoice.notes ?? '');

  useEffect(() => {
    if (!open) return;

    setInvoiceNumber(invoice.invoice_number);
    setNotes(invoice.notes ?? '');
  }, [open, invoice.id, invoice.invoice_number, invoice.notes]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedNumber = invoiceNumber.trim();

    if (!normalizedNumber) return;

    await onSubmit({
      invoice_number: normalizedNumber,
      notes: notes.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      fullWidth
      maxWidth="sm"
      dir="rtl"
    >
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogTitle>ویرایش صورتحساب</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="شماره صورتحساب"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              required
              fullWidth
              inputProps={{ maxLength: 50 }}
              disabled={isSubmitting}
            />

            <TextField
              label="توضیحات"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              fullWidth
              multiline
              minRows={3}
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
            disabled={isSubmitting || !invoiceNumber.trim()}
          >
            {isSubmitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'ذخیره تغییرات'
            )}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};

export default InvoiceEditDialog;
