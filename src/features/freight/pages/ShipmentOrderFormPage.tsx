
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import FormRenderer from 'shared/forms/FormRenderer';
import {
  FormConfig,
  FormFieldOptions,
  FormValues,
} from 'shared/forms/types/form';

import { getApiError } from 'shared/api/apiError';
import {
  notifyError,
  notifySuccess,
} from 'shared/feedback/notification';
import { crudMessages } from 'shared/feedback/crudMessages';

import {
  useGetCurrentUserCapabilitiesQuery,
} from 'features/accounts/api/currentUserApi';

import {
  useGetCurrentCustomerActiveMembershipsQuery,
} from 'features/freight/api/customerBranchMembershipApi';

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

const ShipmentOrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const {
    data: capabilities,
    isLoading: isCapabilitiesLoading,
    isError: isCapabilitiesError,
    error: capabilitiesError,
  } = useGetCurrentUserCapabilitiesQuery();

  const roles = capabilities?.roles ?? [];
  const isSuperAdmin = roles.includes('SuperAdmin');
  const isBranchManager = roles.includes('BranchManager');
  const isCustomer = roles.includes('Customer');

  const canManageShipmentOrders =
    isSuperAdmin || isBranchManager || isCustomer;

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useGetShipmentOrderByIdQuery(id ?? '', {
    skip: !isEdit,
  });

  const {
    data: branchesData,
    isLoading: isBranchesLoading,
    isError: isBranchesError,
    error: branchesError,
  } = useGetBranchesQuery();

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    error: customersError,
  } = useGetCustomersQuery({
    page: 1,
    page_size: 100,
  });

  const {
    data: membershipsData,
    isLoading: isMembershipsLoading,
    isError: isMembershipsError,
    error: membershipsError,
  } = useGetCurrentCustomerActiveMembershipsQuery(undefined, {
    skip: !isCustomer,
  });

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
  } = useGetFreightCompaniesQuery({
    page: 1,
    page_size: 100,
  });

  const [createShipmentOrder, { isLoading: isCreating }] =
    useCreateShipmentOrderMutation();

  const [updateShipmentOrder, { isLoading: isUpdating }] =
    useUpdateShipmentOrderMutation();

  const customers = customersData?.results ?? [];

  const activeMemberships = (membershipsData?.results ?? []).filter(
    (membership) => membership.status.toLowerCase() === 'active'
  );

  const customerProfile = customers[0];

  const activeBranches = (branchesData?.results ?? []).filter(
    (branch) => branch.is_active
  );

  const customerBranches = activeMemberships.map(
    (membership) => membership.branch
  );

  // SuperAdmin can choose any active branch.
  // Customers can choose only branches where they have active membership.
  const branchOptions = isSuperAdmin
    ? activeBranches.map((branch) => ({
        label: `${branch.name} (${branch.code})`,
        value: branch.id,
      }))
    : customerBranches.map((branch) => ({
        label: branch.name,
        value: branch.id,
      }));

  const customerOptions = customers.map((customer) => ({
    label: `${customer.display_name} (${customer.mobile})`,
    value: customer.id,
  }));

  const companyOptions = [
    { label: 'بدون انتخاب', value: '' },
    ...(companiesData?.results ?? [])
      .filter((company) => company.is_active)
      .map((company) => ({
        label: company.name,
        value: company.id,
      })),
  ];

  // BranchManager always uses their assigned branch.
  // Customer selects a branch only when creating an order with
  // multiple active memberships. A draft order's branch is preserved.
  const showBranchSelector =
    isSuperAdmin ||
    (isCustomer && !isEdit && activeMemberships.length > 1);

  // Only staff roles that can assign a customer see this field.
  const showCustomerSelector = isSuperAdmin || isBranchManager;

  const formConfig: FormConfig = useMemo(() => {
    const fields: FormConfig['fields'] = {};

    if (showBranchSelector) {
      fields.branch = {
        type: 'select',
        label: 'شعبه',
        required: true,
        grid: { xs: 12, md: 6 },
      };
    }

    if (showCustomerSelector) {
      fields.customer = {
        type: 'select',
        label: 'مشتری',
        required: true,
        grid: { xs: 12, md: 6 },
      };
    }

    fields.preferred_freight_company = {
      type: 'select',
      label: 'شرکت حمل‌ونقل ترجیحی',
      grid: { xs: 12, md: 6 },
      options: companyOptions,
    };

    fields.sender_name = {
      type: 'text',
      label: 'نام فرستنده',
      required: true,
      grid: { xs: 12, md: 6 },
    };

    fields.sender_mobile = {
      type: 'text',
      label: 'موبایل فرستنده',
      inputType: 'tel',
      required: true,
      grid: { xs: 12, md: 6 },
    };

    fields.sender_address = {
      type: 'textarea',
      label: 'آدرس فرستنده',
      required: true,
      grid: { xs: 12 },
    };

    fields.receiver_name = {
      type: 'text',
      label: 'نام گیرنده',
      required: true,
      grid: { xs: 12, md: 6 },
    };

    fields.receiver_mobile = {
      type: 'text',
      label: 'موبایل گیرنده',
      inputType: 'tel',
      required: true,
      grid: { xs: 12, md: 6 },
    };

    fields.receiver_address = {
      type: 'textarea',
      label: 'آدرس گیرنده',
      required: true,
      grid: { xs: 12 },
    };

    fields.shipment_description = {
      type: 'textarea',
      label: 'شرح محموله',
      grid: { xs: 12 },
    };

    return {
      fields,
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
  }, [
    showBranchSelector,
    showCustomerSelector,
    companyOptions,
  ]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(shipmentOrderValidationSchema),
    defaultValues: formConfig.defaultValues,
  });

  // Populate existing order values in edit mode.
  useEffect(() => {
    if (isEdit && order) {
      reset(shipmentOrderToFormValues(order));
    }
  }, [isEdit, order, reset]);

  // Populate role-controlled values for new orders.
  useEffect(() => {
    if (isEdit || !capabilities) {
      return;
    }

    if (isBranchManager && capabilities.branch) {
      setValue('branch', capabilities.branch.id, {
        shouldValidate: true,
      });
    }

    if (isCustomer && customerProfile) {
      setValue('customer', customerProfile.id, {
        shouldValidate: true,
      });
    }

    if (isCustomer && activeMemberships.length === 1) {
      setValue('branch', activeMemberships[0].branch.id, {
        shouldValidate: true,
      });
    }
  }, [
    isEdit,
    capabilities,
    isBranchManager,
    isCustomer,
    customerProfile,
    activeMemberships,
    setValue,
  ]);

  const handleFormSubmit = async (values: FormValues) => {
    try {
      if (!capabilities || !canManageShipmentOrders) {
        notifyError('شما مجوز ایجاد یا ویرایش سفارش را ندارید.');
        return;
      }

      if (isEdit && (!order || order.status !== 'draft')) {
        notifyError('فقط سفارش‌های پیش‌نویس قابل ویرایش هستند.');
        return;
      }

      let branchId: number;
      let customerId: number;

      if (isEdit && order) {
        // The customer and branch are preserved for customer and
        // branch-manager edits. SuperAdmin may choose a new branch.
        branchId = isSuperAdmin
          ? Number(values.branch)
          : order.branch.id;

        customerId = isCustomer
          ? order.customer.id
          : Number(values.customer);
      } else if (isSuperAdmin) {
        branchId = Number(values.branch);
        customerId = Number(values.customer);
      } else if (isBranchManager) {
        if (!capabilities.branch) {
          notifyError('برای حساب مدیر شعبه، شعبه‌ای تعریف نشده است.');
          return;
        }

        branchId = capabilities.branch.id;
        customerId = Number(values.customer);
      } else {
        if (!customerProfile) {
          notifyError(
            'حساب کاربری شما به پروفایل مشتری متصل نیست.'
          );
          return;
        }

        if (activeMemberships.length === 0) {
          notifyError(
            'برای ثبت سفارش، عضویت فعال در حداقل یک شعبه لازم است.'
          );
          return;
        }

        customerId = customerProfile.id;

        branchId =
          activeMemberships.length === 1
            ? activeMemberships[0].branch.id
            : Number(values.branch);

        const validMembership = activeMemberships.some(
          (membership) => membership.branch.id === branchId
        );

        if (!validMembership) {
          notifyError('لطفاً یکی از شعب دارای عضویت فعال را انتخاب کنید.');
          return;
        }
      }

      if (!branchId || !customerId) {
        notifyError('انتخاب شعبه و مشتری الزامی است.');
        return;
      }

      const mappedRequest = shipmentOrderFormToRequest({
        ...values,
        branch: branchId,
        customer: customerId,
      });

      const request = {
        ...mappedRequest,
        branch: branchId,
        customer: customerId,
      };

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

  const isLoading =
    isCapabilitiesLoading ||
    (isEdit && isOrderLoading) ||
    isBranchesLoading ||
    isCustomersLoading ||
    isCompaniesLoading ||
    (isCustomer && isMembershipsLoading);

  if (isLoading) {
    return (
      <Stack
        alignItems="center"
        spacing={2}
        sx={{ p: 4 }}
        dir="rtl"
      >
        <CircularProgress />
        <Typography>در حال دریافت اطلاعات فرم...</Typography>
      </Stack>
    );
  }

  if (isCapabilitiesError) {
    return (
      <Alert severity="error" dir="rtl">
        {getApiError(capabilitiesError).message}
      </Alert>
    );
  }

  if (isEdit && (isOrderError || !order)) {
    return (
      <Alert severity="error" dir="rtl">
        {isOrderError
          ? getApiError(orderError).message
          : 'سفارش پیدا نشد.'}
      </Alert>
    );
  }

  if (isBranchesError) {
    return (
      <Alert severity="error" dir="rtl">
        {getApiError(branchesError).message}
      </Alert>
    );
  }

  if (isCustomersError) {
    return (
      <Alert severity="error" dir="rtl">
        {getApiError(customersError).message}
      </Alert>
    );
  }

  if (isCustomer && isMembershipsError) {
    return (
      <Alert severity="error" dir="rtl">
        {getApiError(membershipsError).message}
      </Alert>
    );
  }

  if (!canManageShipmentOrders) {
    return (
      <Alert severity="error" dir="rtl">
        شما مجوز ایجاد یا ویرایش سفارش ارسال را ندارید.
      </Alert>
    );
  }

  if (isEdit && order && order.status !== 'draft') {
    return (
      <Stack spacing={2} alignItems="flex-start" dir="rtl">
        <Typography variant="h5">ویرایش سفارش ارسال</Typography>
        <Alert severity="warning">
          فقط سفارش‌های پیش‌نویس از این صفحه قابل ویرایش هستند.
        </Alert>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/dashboard/shipment-orders/${id}`)
          }
        >
          بازگشت به جزئیات سفارش
        </Button>
      </Stack>
    );
  }

  if (isBranchManager && !capabilities?.branch) {
    return (
      <Alert severity="error" dir="rtl">
        برای حساب مدیر شعبه، شعبه‌ای تعریف نشده است.
      </Alert>
    );
  }

  if (isCustomer && !customerProfile) {
    return (
      <Alert severity="error" dir="rtl">
        حساب کاربری شما به پروفایل مشتری متصل نیست. لطفاً با پشتیبانی تماس بگیرید.
      </Alert>
    );
  }

  if (isCustomer && activeMemberships.length === 0 && !isEdit) {
    return (
      <Alert severity="warning" dir="rtl">
        عضویت فعال در هیچ شعبه‌ای ندارید؛ تا زمان فعال‌شدن عضویت، امکان ثبت سفارش وجود ندارد.
      </Alert>
    );
  }

  const fieldOptions: FormFieldOptions = {
    branch: branchOptions,
    customer: customerOptions,
    preferred_freight_company: companyOptions,
  };

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

        {isCustomer && !isEdit && activeMemberships.length > 1 && (
          <Alert severity="info">
            شعبه سفارش را از بین شعب دارای عضویت فعال خود انتخاب کنید.
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <FormRenderer
              config={formConfig}
              control={control}
              errors={errors}
              fieldOptions={fieldOptions}
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
