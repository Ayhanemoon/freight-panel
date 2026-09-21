import {
  RecordToFormValues,
  FormValuesToRequest,
} from 'shared/forms/types/mapping';

import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from 'features/accounts/types/user';

export const userToFormValues: RecordToFormValues<User> = (user) => ({
  id: user.id,
  mobile: user.mobile,
  email: user.email,
  branch: user.branch?.id ?? null,
  is_active: user.is_active,
  is_mobile_verified: user.is_mobile_verified,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

export const userFormToCreateRequest: FormValuesToRequest<CreateUserRequest> = (
  values
) => ({
  mobile: String(values.mobile ?? ''),
  email: String(values.email ?? ''),
  branch: values.branch as number | null,
  password: String(values.password ?? ''),
  is_active: Boolean(values.is_active),
});

export const userFormToUpdateRequest: FormValuesToRequest<UpdateUserRequest> = (
  values
) => ({
  email: String(values.email ?? ''),
  branch: values.branch as number | null,
  is_active: Boolean(values.is_active),
});