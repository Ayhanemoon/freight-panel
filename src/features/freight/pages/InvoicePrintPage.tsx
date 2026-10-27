
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

import { useGetInvoiceByIdQuery } from 'features/freight/api/invoiceApi';
import { useGetShipmentOrderByIdQuery } from 'features/freight/api/shipmentOrderApi';
import { getApiError } from 'shared/api/apiError';
import { convertToPersianDigits } from 'shared/utils/number';

import './InvoicePrintPage.scss';

const chargeLabels: Record<string, string> = {
  freight: 'کرایه حمل',
  insurance: 'بیمه',
  crane_loading: 'بارگیری / جرثقیل',
  branch: 'هزینه شعبه',
  other: 'سایر هزینه‌ها',
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('fa-IR');
};

const formatMoney = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount)
    ? convertToPersianDigits(
        new Intl.NumberFormat('fa-IR').format(amount)
      )
    : '—';
};

const InvoicePrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading: invoiceLoading,
    isError: invoiceIsError,
    error: invoiceError,
  } = useGetInvoiceByIdQuery(id ?? '', { skip: !id });

  const {
    data: order,
    isLoading: orderLoading,
    isError: orderIsError,
    error: orderError,
  } = useGetShipmentOrderByIdQuery(invoice?.order ?? '', {
    skip: !invoice,
  });

  if (invoiceLoading || orderLoading) {
    return (
      <div className="invoice-print-page" dir="rtl">
        <CircularProgress />
        <Typography>در حال دریافت صورتحساب...</Typography>
      </div>
    );
  }

  if (invoiceIsError || orderIsError || !invoice || !order) {
    const message = invoiceIsError
      ? getApiError(invoiceError).message
      : orderIsError
        ? getApiError(orderError).message
        : 'اطلاعات صورتحساب پیدا نشد.';

    return (
      <div className="invoice-print-page" dir="rtl">
        <Alert severity="error">{message}</Alert>
        <Button onClick={() => navigate(-1)}>بازگشت</Button>
      </div>
    );
  }

  return (
    <div className="invoice-print-page" dir="rtl">
      <Stack
        className="invoice-print-toolbar"
        direction="row"
        spacing={1}
        justifyContent="space-between"
      >
        <Button variant="outlined" onClick={() => navigate(-1)}>
          بازگشت
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          چاپ صورتحساب
        </Button>
      </Stack>

      <Paper className="invoice-document" elevation={0}>
        <header className="invoice-document__header">
          <div>
            <Typography variant="h4" fontWeight={800}>
              اتوبان
            </Typography>
            <Typography variant="h6">
              صورتحساب و بیجک باربری
            </Typography>
          </div>

          <div className="invoice-document__meta">
            <div>
              <strong>شماره صورتحساب:</strong>
              <span>{convertToPersianDigits(invoice.invoice_number)}</span>
            </div>
            <div>
              <strong>تاریخ صدور:</strong>
              <span>{formatDate(invoice.issued_at)}</span>
            </div>
            <div>
              <strong>کد رهگیری:</strong>
              <span>{convertToPersianDigits(order.tracking_code || '—')}</span>
            </div>
            <div>
              <strong>شعبه:</strong>
              <span>{order.branch.name}</span>
            </div>
          </div>
        </header>

        <section className="invoice-document__parties">
          <div className="invoice-document__panel">
            <h3>مشخصات فرستنده</h3>
            <p><strong>نام:</strong> {invoice.customer_name || order.sender_name || '—'}</p>
            <p><strong>موبایل:</strong> {invoice.customer_mobile || order.sender_mobile || '—'}</p>
            <p><strong>آدرس:</strong> {invoice.customer_address || order.sender_address || '—'}</p>
          </div>

          <div className="invoice-document__panel">
            <h3>مشخصات گیرنده</h3>
            <p><strong>نام:</strong> {invoice.receiver_name || '—'}</p>
            <p><strong>موبایل:</strong> {invoice.receiver_mobile || '—'}</p>
            <p><strong>آدرس:</strong> {invoice.receiver_address || '—'}</p>
          </div>
        </section>

        <section className="invoice-document__section">
          <h3>مشخصات محموله</h3>
          <div className="invoice-document__shipment">
            <div>
              <strong>شرح محموله</strong>
              <span>{order.shipment_description || '—'}</span>
            </div>
            <div>
              <strong>تعداد بسته‌های صورتحساب</strong>
              <span>{convertToPersianDigits(invoice.parcels.length)}</span>
            </div>
            <div>
              <strong>شناسه سفارش</strong>
              <span>{convertToPersianDigits(order.id)}</span>
            </div>
            <div>
              <strong>بارکد سفارش</strong>
              <span>{convertToPersianDigits(order.barcode || '—')}</span>
            </div>
          </div>
        </section>

        <section className="invoice-document__section">
          <h3>فهرست بسته‌ها</h3>
          <table>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>شماره بسته</th>
                <th>شرح بسته</th>
                <th>نوع بسته</th>
                <th>تعداد</th>
              </tr>
            </thead>
            <tbody>
              {invoice.parcels.map((parcel, index) => (
                <tr key={parcel.id}>
                  <td>{convertToPersianDigits(index + 1)}</td>
                  <td>{convertToPersianDigits(parcel.parcel_number)}</td>
                  <td>{parcel.parcel_name || '—'}</td>
                  <td>{parcel.parcel_type || '—'}</td>
                  <td>{convertToPersianDigits(parcel.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="invoice-document__section">
          <h3>ریز هزینه‌ها</h3>
          <table>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>عنوان هزینه</th>
                <th>شرح</th>
                <th>پرداخت‌کننده</th>
                <th>مبلغ (ریال)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.charges.map((charge, index) => (
                <tr key={charge.id}>
                  <td>{convertToPersianDigits(index + 1)}</td>
                  <td>{chargeLabels[charge.charge_type] ?? charge.charge_type}</td>
                  <td>{charge.description || '—'}</td>
                  <td>
                    {charge.payer === 'receiver'
                      ? 'گیرنده'
                      : charge.payer === 'sender'
                        ? 'فرستنده'
                        : '—'}
                  </td>
                  <td>{formatMoney(charge.amount)}</td>
                </tr>
              ))}
              {invoice.charges.length === 0 && (
                <tr>
                  <td colSpan={5}>هزینه‌ای ثبت نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="invoice-document__total">
            <strong>مبلغ کل (ریال)</strong>
            <strong>{formatMoney(invoice.total_cost)}</strong>
          </div>
        </section>

        {invoice.notes && (
          <section className="invoice-document__section">
            <h3>توضیحات</h3>
            <p>{invoice.notes}</p>
          </section>
        )}

        <section className="invoice-document__signatures">
          <div>
            <strong>امضا و تأیید فرستنده</strong>
          </div>
          <div>
            <strong>مهر و امضای شعبه</strong>
          </div>
          <div>
            <strong>امضا و تأیید گیرنده</strong>
          </div>
        </section>

        <footer className="invoice-document__footer">
          این سند، صورتحساب و بیجک داخلی حمل‌ونقل است.
        </footer>
      </Paper>
    </div>
  );
};

export default InvoicePrintPage;
