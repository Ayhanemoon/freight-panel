import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import FormRenderer from 'shared/forms/FormRenderer';
import { FormValues, FormConfig } from 'shared/forms/types/form';
import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';
import { crudMessages } from 'shared/feedback/crudMessages';

import {
  useGetShipmentOrderByIdQuery,
  useCreateShipmentOrderMutation,
  useUpdateShipmentOrderMutation,
} from 'features/freight/api/shipmentOrderApi';
import { useGetBranchesQuery } from 'features/freight/api/branchApi';
import { useGetCustomersQuery } from 'features/freight/api/customerApi';
import {
  useGetFreightCompaniesQuery,
} from 'features/freight/api/freightCompanyApi';

import {
  shipmentOrderToFormValues,
  shipmentOrderFormToRequest,
} from 'features/freight/forms/shipmentOrderMapping';
import {
  shipmentOrderValidationSchema,
} from 'features/freight/forms/shipmentOrderValidation';

const shipmentOrderFormConfig: FormConfig = {
  fields: {
    branch: {
      type: 'select',
      label: 'شعبه',
      required: true,
      grid: { xs: 12, md: 6 },
    },
    customer: {
      type: 'select',
      label: 'مشتری',
      required: true,
      grid: { xs: 12, md: 6 },
    },
    preferred_freight_company: {
      type: 'select',
      label: 'شرکت حمل‌ونقل ترجیحی',
      grid: { xs: 12, md: 6 },
      options: [{ label: 'بدون انتخاب', value: '' }],
    },

    sender_name: {
      type: 'text',
      label: 'نام فرستنده',
      required: true,
      grid: { xs: 12, md: 6 },
    },
    sender_mobile: {
      type: 'text',
      label: 'موبایل فرستنده',
      inputType: 'tel',
      required: true,
      grid: { xs: 12, md: 6 },
    },
    sender_address: {
      type: 'textarea',
      label: 'آدرس فرستنده',
      required: true,
      grid: { xs: 12 },
    },

    receiver_name: {
      type: 'text',
      label: 'نام گیرنده',
      required: true,
      grid: { xs: 12, md: 6 },
    },
    receiver_mobile: {
      type: 'text',
      label: 'موبایل گیرنده',
      inputType: 'tel',
      required: true,
      grid: { xs: 12, md: 6 },
    },
    receiver_address: {
      type: 'textarea',
      label: 'آدرس گیرنده',
      required: true,
      grid: { xs: 12 },
    },

    shipment_description: {
      type: 'textarea',
      label: 'شرح محموله',
      grid: { xs: 12 },
    },
  },
  validationSchema: shipmentOrderValidationSchema,
  defaultValues: {
    branch: '',
    customer: '',
    preferred_freight_company: '',
    sender_name: '',
    sender_mobile: '',
    sender_address: '',
    receiver_name: '',
    receiver_mobile: '',
    receiver_address: '',
    shipment_description: '',
  },
};

const ShipmentOrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useGetShipmentOrderByIdQuery(id ?? '', {
    skip: !id,
  });

  const { data: branchesData } = useGetBranchesQuery();
  const { data: customersData } = useGetCustomersQuery({
    page: 1,
    page_size: 100,
  });
  const { data: companiesData } = useGetFreightCompaniesQuery({
    page: 1,
    page_size: 100,
  });

  const [createShipmentOrder, { isLoading: isCreating }] =
    useCreateShipmentOrderMutation();

  const [updateShipmentOrder, { isLoading: isUpdating }] =
    useUpdateShipmentOrderMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(shipmentOrderValidationSchema),
    defaultValues: shipmentOrderFormConfig.defaultValues,
  });

  useEffect(() => {
    if (order && isEdit) {
      reset(shipmentOrderToFormValues(order));
    }
  }, [order, isEdit, reset]);

  const branchOptions =
    branchesData?.results.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })) ?? [];

  const customerOptions =
    customersData?.results.map((customer) => ({
      label: `${customer.display_name} (${customer.mobile})`,
      value: customer.id,
    })) ?? [];

  const companyOptions = [
    { label: 'بدون انتخاب', value: '' },
    ...(companiesData?.results.map((company) => ({
      label: company.name,
      value: company.id,
    })) ?? []),
  ];

  const handleFormSubmit = async (values: FormValues) => {
    const request = shipmentOrderFormToRequest(values);

    try {
      if (isEdit && id) {
        const updated = await updateShipmentOrder({
          id,
          data: request,
        }).unwrap();

        notifySuccess(crudMessages.updated('سفارش ارسال'));
        navigate(`/dashboard/shipment-orders/${updated.id}`);
      } else {
        const created = await createShipmentOrder(request).unwrap();

        notifySuccess(crudMessages.created('سفارش ارسال'));
        navigate(`/dashboard/shipment-orders/${created.id}`);
      }
    } catch (error) {
      const apiError = getApiError(error);

      const fieldMessages = Object.values(apiError.fieldErrors)
        .flat()
        .filter(Boolean);

      notifyError(
        fieldMessages.length > 0
          ? `${apiError.message} ${fieldMessages.join(' ')}`
          : apiError.message
      );
    }
  };

  if (isEdit && isOrderLoading) {
    return (
      <div dir="rtl">
        <Typography>در حال دریافت اطلاعات سفارش...</Typography>
      </div>
    );
  }

  if (isEdit && (isOrderError || !order)) {
    return (
      <div dir="rtl">
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5">ویرایش سفارش ارسال</Typography>
          <Typography color="error">
            {isOrderError
              ? getApiError(orderError).message
              : 'سفارش پیدا نشد.'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard/shipment-orders')}
          >
            بازگشت به سفارش‌ها
          </Button>
        </Stack>
      </div>
    );
  }

  if (isEdit && order && order.status !== 'draft') {
    return (
      <div dir="rtl">
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5">ویرایش سفارش ارسال</Typography>
          <Typography color="error">
            فقط سفارش‌های پیش‌نویس از این صفحه قابل ویرایش هستند.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/dashboard/shipment-orders/${id}`)}
          >
            بازگشت به جزئیات سفارش
          </Button>
        </Stack>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4">
            {isEdit ? 'ویرایش سفارش ارسال' : 'ایجاد سفارش ارسال'}
          </Typography>

          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                isEdit && id
                  ? `/dashboard/shipment-orders/${id}`
                  : '/dashboard/shipment-orders'
              )
            }
          >
            انصراف
          </Button>
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <FormRenderer
              config={shipmentOrderFormConfig}
              control={control}
              errors={errors}
              fieldOptions={{
                branch: branchOptions,
                customer: customerOptions,
                preferred_freight_company: companyOptions,
              }}
            />

            <Stack direction="row" justifyContent="flex-start">
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? 'در حال ذخیره...'
                  : isEdit
                    ? 'ذخیره تغییرات'
                    : 'ایجاد سفارش'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
};

export default ShipmentOrderFormPage;