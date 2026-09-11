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
    mobile: { type: 'text', visibility: true, label: 'شماره موبایل', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    email: { type: 'text', visibility: true, label: 'ایمیل', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    branch: { type: 'text', visibility: false, label: 'رمز عبور', required: true, defaultValue: '', grid:{xs:12, sm:3} },
    branch_name: { type: 'text', visibility: true, label: 'نام', required: true, defaultValue: '', grid:{xs:12, sm:3} },
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

