
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useGetParcelsQuery } from 'features/freight/api/parcelApi';
import type { Parcel } from 'features/freight/types/parcel';
import type { ShipmentOrderDetail } from 'features/freight/types/shipmentOrder';
import type {
  CreateInvoiceRequest,
  InvoiceChargeInput,
  InvoiceChargeType,
  InvoicePayer,
} from 'features/freight/types/invoice';
import { Form } from 'react-router-dom';

interface InvoiceRegistrationDialogProps {
  open: boolean;
  order: ShipmentOrderDetail;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoiceRequest) => void | Promise<void>;
}

interface ChargeRow {
  id: string;
  charge_type: InvoiceChargeType;
  payer: InvoicePayer;
  description: string;
  amount: string;
}

const CHARGE_TYPES: Array<{
  value: InvoiceChargeType;
  label: string;
}> = [
  { value: 'freight', label: 'کرایه حمل' },
  { value: 'insurance', label: 'بیمه' },
  { value: 'crane_loading', label: 'هزینه بارگیری / تخلیه' },
  { value: 'branch', label: 'هزینه انبارداری / شعبه' },
  { value: 'other', label: 'سایر هزینه‌ها' },
];

const PAYER_OPTIONS: Array<{
  value: InvoicePayer;
  label: string;
}> = [
  { value: 'sender', label: 'فرستنده' },
  { value: 'receiver', label: 'گیرنده' },
];

const createEmptyCharge = (): ChargeRow => ({
  id: `${Date.now()}-${Math.random()}`,
  charge_type: 'freight',
  payer: 'sender',
  description: '',
  amount: '',
});

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('fa-IR').format(value);

const InvoiceRegistrationDialog: React.FC<
  InvoiceRegistrationDialogProps
> = ({
  open,
  order,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [charges, setCharges] = useState<ChargeRow[]>([
    createEmptyCharge(),
  ]);
  const [selectedParcelsById, setSelectedParcelsById] = useState<
    Record<number, Parcel>
  >({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [validationError, setValidationError] = useState('');

  const {
    data: parcelsResponse,
    isLoading: isLoadingParcels,
    isFetching: isFetchingParcels,
    error: parcelsError,
  } = useGetParcelsQuery(
    {
      order: order.id,
      page: page + 1,
      page_size: pageSize,
    },
    { skip: !open || !order?.id },
  );

  const parcels = parcelsResponse?.results ?? [];
  const parcelCount = parcelsResponse?.count ?? 0;

  const selectedParcelIds = Object.keys(selectedParcelsById).map(Number);
  const selectedParcelCount = selectedParcelIds.length;

  const totalAmount = charges.reduce((total, charge) => {
    const amount = Number(charge.amount);
    return total + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);

  useEffect(() => {
    if (!open) return;

    setInvoiceNumber('');
    setNotes('');
    setCharges([createEmptyCharge()]);
    setSelectedParcelsById({});
    setPage(0);
    setPageSize(10);
    setValidationError('');
  }, [open, order.id]);

  const updateCharge = (
    id: string,
    field: keyof Omit<ChargeRow, 'id'>,
    value: string,
  ) => {
    setCharges((current) =>
      current.map((charge) =>
        charge.id === id
          ? { ...charge, [field]: value }
          : charge,
      ),
    );
    setValidationError('');
  };

  const addCharge = () => {
    setCharges((current) => [...current, createEmptyCharge()]);
  };

  const removeCharge = (id: string) => {
    setCharges((current) =>
      current.length > 1
        ? current.filter((charge) => charge.id !== id)
        : current,
    );
    setValidationError('');
  };

  const toggleParcel = (parcel: Parcel) => {
    setSelectedParcelsById((current) => {
      const next = { ...current };

      if (next[parcel.id]) {
        delete next[parcel.id];
      } else {
        next[parcel.id] = parcel;
      }

      return next;
    });

    setValidationError('');
  };

  const handlePageChange = (
    _event: unknown,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const handleSubmit = async () => {
    if (!invoiceNumber.trim()) {
      setValidationError('شماره صورتحساب را وارد کنید.');
      return;
    }

    if (selectedParcelIds.length === 0) {
      setValidationError('حداقل یک بسته را انتخاب کنید.');
      return;
    }

    const invalidCharge = charges.some((charge) => {
      const amount = Number(charge.amount);
      return (
        !charge.amount.trim() ||
        !Number.isFinite(amount) ||
        amount < 0
      );
    });

    if (invalidCharge) {
      setValidationError(
        'مبلغ تمام ردیف‌های هزینه باید عدد معتبر و غیرمنفی باشد.',
      );
      return;
    }

    const chargeInputs: InvoiceChargeInput[] = charges.map(
      ({ charge_type, payer, description, amount }) => ({
        charge_type,
        payer,
        description: description.trim(),
        amount: amount.trim(),
      }),
    );

    const parcelInputs: CreateInvoiceRequest['parcels'] =
      selectedParcelIds.map((parcelId) => {
        const parcel = selectedParcelsById[parcelId];

        return {
          parcel: parcelId,
          parcel_name: parcel.contents_description ?? '',
          parcel_type: '',
          quantity: 1,
        };
      });

    const payload: CreateInvoiceRequest = {
      order: order.id,
      invoice_number: invoiceNumber.trim(),
      charges: chargeInputs,
      parcels: parcelInputs,
      notes: notes.trim(),
    };

    setValidationError('');
    await onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      dir="rtl"
      aria-labelledby="invoice-registration-dialog-title"
    >
      <DialogTitle id="invoice-registration-dialog-title">
        ثبت صورتحساب و بیجک باربری
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {validationError && (
            <Alert severity="error">{validationError}</Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <TextField
              label="شماره صورتحساب"
              value={invoiceNumber}
              onChange={(event) => {
                setInvoiceNumber(event.target.value);
                setValidationError('');
              }}
              required
              fullWidth
              disabled={isSubmitting}
            />

            <TextField
              label="شماره سفارش"
              value={String(order.id)}
              fullWidth
              disabled
            />
          </Box>

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h6">
                هزینه‌های صورتحساب
              </Typography>

              <Button
                variant="outlined"
                onClick={addCharge}
                disabled={isSubmitting}
              >
                افزودن هزینه
              </Button>
            </Stack>

            <Stack spacing={2}>
              {charges.map((charge, index) => (
                <Box
                  key={charge.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2">
                      ردیف هزینه {index + 1}
                    </Typography>

                    <Button
                      color="error"
                      size="small"
                      onClick={() => removeCharge(charge.id)}
                      disabled={
                        isSubmitting || charges.length === 1
                      }
                    >
                      حذف
                    </Button>
                  </Stack>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(4, minmax(0, 1fr))',
                      },
                      gap: 2,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <Typography
                        component="label"
                        variant="body2"
                        sx={{ mb: 0.75 }}
                      >
                        نوع هزینه
                      </Typography>

                      <Select
                        value={charge.charge_type}
                        onChange={(event) =>
                          updateCharge(
                            charge.id,
                            'charge_type',
                            event.target.value,
                          )
                        }
                        disabled={isSubmitting}
                      >
                        {CHARGE_TYPES.map((option) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <Typography
                        component="label"
                        variant="body2"
                        sx={{ mb: 0.75 }}
                      >
                        پرداخت‌کننده
                      </Typography>

                      <Select
                        value={charge.payer}
                        onChange={(event) =>
                          updateCharge(
                            charge.id,
                            'payer',
                            event.target.value,
                          )
                        }
                        disabled={isSubmitting}
                      >
                        {PAYER_OPTIONS.map((option) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <Typography
                        component="label"
                        variant="body2"
                        sx={{ mb: 0.75 }}
                      >
                        مبلغ (ریال)
                      </Typography>
                      
                      <TextField
                        type="number"
                        value={charge.amount}
                        onChange={(event) =>
                          updateCharge(
                            charge.id,
                            'amount',
                            event.target.value,
                          )
                        }
                        inputProps={{ min: 0, step: 1 }}
                        fullWidth
                        size="small"
                        required
                        disabled={isSubmitting}
                      />

                    </FormControl>

                    <FormControl fullWidth size="small">
                      <Typography
                        component="label"
                        variant="body2"
                        sx={{ mb: 0.75 }}
                      >
                        شرح هزینه
                      </Typography>

                      <TextField
                        value={charge.description}
                        onChange={(event) =>
                          updateCharge(
                            charge.id,
                            'description',
                            event.target.value,
                          )
                        }
                        fullWidth
                        size="small"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography fontWeight={600}>
                مجموع هزینه‌های واردشده
              </Typography>

              <Typography fontWeight={700}>
                {formatAmount(totalAmount)} ریال
              </Typography>
            </Box>
          </Box>

          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h6">
                انتخاب بسته‌ها
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {formatAmount(selectedParcelCount)} بسته انتخاب شده
              </Typography>
            </Stack>

            {parcelsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                دریافت فهرست بسته‌ها با خطا مواجه شد. دوباره تلاش کنید.
              </Alert>
            )}

            <TableContainer sx={{ border: 1, borderColor: 'divider' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>شماره بسته</TableCell>
                    <TableCell>شرح محتویات</TableCell>
                    <TableCell>وزن (کیلوگرم)</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isLoadingParcels || isFetchingParcels ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : parcels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        بسته‌ای برای این سفارش ثبت نشده است.
                      </TableCell>
                    </TableRow>
                  ) : (
                    parcels.map((parcel) => (
                      <TableRow
                        key={parcel.id}
                        hover
                        selected={Boolean(
                          selectedParcelsById[parcel.id],
                        )}
                        onClick={() => {
                          if (!isSubmitting) {
                            toggleParcel(parcel);
                          }
                        }}
                        sx={{
                          cursor: isSubmitting
                            ? 'default'
                            : 'pointer',
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={Boolean(
                              selectedParcelsById[parcel.id],
                            )}
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            onChange={() => toggleParcel(parcel)}
                            disabled={isSubmitting}
                          />
                        </TableCell>

                        <TableCell>
                          {parcel.parcel_number}
                        </TableCell>

                        <TableCell>
                          {parcel.contents_description || '—'}
                        </TableCell>

                        <TableCell>
                          {parcel.declared_weight_kg ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={parcelCount}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="تعداد در هر صفحه:"
              labelDisplayedRows={({ from, to, count }) =>
                `${formatAmount(from)} تا ${formatAmount(to)} از ${
                  count === -1 ? 'بیشتر' : formatAmount(count)
                }`
              }
              disabled={isSubmitting || isLoadingParcels}
            />
          </Box>

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

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          color="inherit"
        >
          انصراف
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoadingParcels}
        >
          {isSubmitting ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            'ثبت صورتحساب'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceRegistrationDialog;
