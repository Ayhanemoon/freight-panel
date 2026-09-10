export type FieldType =
  | 'text'
  | 'number'
  | 'switch'
  | 'date'
  | 'select'
  | 'file'
  | 'radio'
  | 'textarea'
  | 'checkbox';
  
export type EntityFormFields = {
  [entity: string]: {
    [field: string]: {
      type: FieldType;
      visibility: boolean,
      label: string;
      required: boolean;
      defaultValue: any;
      grid?: any;
      options?: { label: string; value: any }[]; // Optional, for fields like 'select' or 'radio'
    };
  };
};

export const entityFormFields: EntityFormFields = {
  users: {
    username: { type: 'text', visibility: true, label: 'نام کاربری', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    email: { type: 'text', visibility: true, label: 'ایمیل', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    password: { type: 'text', visibility: false, label: 'رمز عبور', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    firstName: { type: 'text', visibility: true, label: 'نام', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    lastName: { type: 'text', visibility: true, label: 'نام خانوادگی', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    role: { type: 'select', visibility: true, label: 'نقش دسترسی', required: true, defaultValue: '', grid:{xs:12, sm:3}, options: [{ label: 'ادمین', value: 'admin' }, { label: 'کاربر عادی', value: 'user' }] },
    birthDate: {type: 'date', visibility: false, label: 'تاریخ تولد', required: true, defaultValue: '', grid:{xs:12, sm:3}},
    phone: { type: 'text', visibility: false, label: 'شماره تماس', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    document: { type: 'file', visibility: true, label: 'مدارک', required: false, defaultValue: '', grid:{xs:12, sm:3} },
    marriage: { type: 'radio', visibility: false, label: 'تاهل', required: false, defaultValue: '', grid:{xs:12, sm:3}, options: [{ label: 'مجرد', value: 'single' }, { label: 'متاهل', value: 'married' }] },
    active: { type: 'switch', visibility: true, label: 'وضعیت', required: false, defaultValue: '', grid:{xs:12, sm:3}, options: [{ label: 'فعال', value: true }, { label: 'غیر فعال', value: false }] },
    address: { type: 'textarea', visibility: false, label: 'آدرس', required: false, defaultValue: '', grid:{xs:12, sm:6} },
  },
};

const entityLabels: { [key: string]: { singular: string; plural: string } } = {
  users: {
    singular: 'کاربر',
    plural: 'کاربران',
  }
};

export const getEntityLabel = (entity: string, type: 'singular' | 'plural') => {
  return  entityLabels[entity]?.[type] || entity;
}

export const getEntityFormFields = (entity: string) => {
  return entityFormFields[entity] || {};
}

