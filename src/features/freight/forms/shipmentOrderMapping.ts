import { FormValues } from 'shared/forms/types/form';
import {
  ShipmentOrderDetail,
} from 'features/freight/types/shipmentOrder';
import {
  ShipmentOrderWriteRequest,
} from 'features/freight/api/shipmentOrderApi';

export const shipmentOrderToFormValues = (
  order: ShipmentOrderDetail
): FormValues => ({
  branch: order.branch.id,
  customer: order.customer.id,
  preferred_freight_company: order.preferred_freight_company?.id ?? '',
  sender_name: order.sender_name,
  sender_mobile: order.sender_mobile,
  sender_address: order.sender_address,
  receiver_name: order.receiver_name,
  receiver_mobile: order.receiver_mobile,
  receiver_address: order.receiver_address,
  shipment_description: order.shipment_description ?? '',
});

export const shipmentOrderFormToRequest = (
  values: FormValues
): ShipmentOrderWriteRequest => {
  const preferredCompany = values.preferred_freight_company;

  return {
    branch: Number(values.branch),
    customer: Number(values.customer),
    preferred_freight_company:
      preferredCompany === '' ||
      preferredCompany === null ||
      preferredCompany === undefined
        ? null
        : Number(preferredCompany),
    sender_name: String(values.sender_name ?? '').trim(),
    sender_mobile: String(values.sender_mobile ?? '').trim(),
    sender_address: String(values.sender_address ?? '').trim(),
    receiver_name: String(values.receiver_name ?? '').trim(),
    receiver_mobile: String(values.receiver_mobile ?? '').trim(),
    receiver_address: String(values.receiver_address ?? '').trim(),
    shipment_description: String(values.shipment_description ?? '').trim(),
  };
};