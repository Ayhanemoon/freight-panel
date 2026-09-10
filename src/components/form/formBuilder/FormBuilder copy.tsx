import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Paper } from '@mui/material';
import TextInputField from '../fields/TextInputField/TextInputField';
import NumberInputField from '../fields/NumberInputField/NumberInputField';
import SwitchInputField from '../fields/SwitchInputField/SwitchInputField';
import DateInputField from '../fields/DateInputField/DateInputField';
import RadioInputField from '../fields/RadioInputField/RadioInputField';

import './FormBuilder.scss';

type FieldType =
  | 'text'
  | 'number'
  | 'switch'
  | 'date'
  | 'select'
  | 'file'
  | 'radio';

interface FieldConfig {
  type: FieldType;
  name: string;
  value?: any; // for custom fields
  label: string;
  required?: boolean;
  className?: string;
  options?: { label: string; value: any }[]; // for radio/select
}

interface FormBuilderProps {
  endpoint: string;
  fields?: React.ReactElement[]; // custom field slots
  schema?: FieldConfig[]; // auto-generated form from JSON schema
  initialValues: Record<string, any>;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ endpoint, fields, schema, initialValues }) => {
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState(initialValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(endpoint);
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch items', error);
      setItems([
        {
          id: 1,
          username: "testuser",
          password: "testpassword",
          name: "Test",
          age: 25,
          email: "test@example.com"
        },
        {
          id: 2,
          username: "testuser",
          password: "testpassword",
          name: "Test",
          age: 20,
          email: "test@example.com"
        }
      ]);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (editingId) {
      await axios.put(`${endpoint}/${editingId}`, formData);
    } else {
      await axios.post(endpoint, formData);
    }
    setFormData(initialValues);
    setEditingId(null);
    setShowForm(false);
    fetchItems();
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${endpoint}/${id}`);
    fetchItems();
  };

  const renderField = (field: FieldConfig) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      value: formData[field.name] || field.value,
      onChange: handleInputChange,
      required: field.required,
      className: field.className,
    };

    switch (field.type) {
      case 'text':
        return <TextInputField key={field.name} {...commonProps} />;
      case 'number':
        return <NumberInputField key={field.name} {...commonProps} />;
      case 'switch':
        return (
          <SwitchInputField
            key={field.name}
            {...commonProps}
            checked={!!formData[field.name]}
            onChange={(name, checked) => handleInputChange(name, checked)}
          />
        );
      case 'date':
        console.log('renderField', { field });
        return <DateInputField key={field.name} {...commonProps} />;
      case 'radio':
        return (
          <RadioInputField
            key={field.name}
            {...commonProps}
            options={field.options || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-builder">
      <Typography variant="h5" className="form-builder__title">مدیریت محتوا</Typography>

      {!showForm && (
        <div className="form-builder__index">
          <Button variant="contained" onClick={() => setShowForm(true)}>ایجاد مورد جدید</Button>
          <Paper className="form-builder__list">
            {items.map((item) => (
              <div key={item.id} className="form-builder__item">
                <Typography>{item.name}</Typography>
                <div className="form-builder__actions">
                  <Button onClick={() => handleEdit(item)}>ویرایش</Button>
                  <Button color="error" onClick={() => handleDelete(item.id)}>حذف</Button>
                </div>
              </div>
            ))}
          </Paper>
        </div>
      )}

      {showForm && (
        <div className="form-builder__form">
          {schema
            ? schema.map(renderField) // auto-generate from schema
            : fields?.map((field) => {
                // Fix: Properly cast field as React element to handle props
                const fieldProps = {
                  value: formData[(field.props as FieldConfig).name],
                  onChange: handleInputChange,
                };

                return React.cloneElement(field, fieldProps);
              })}

          <div className="form-builder__buttons">
            <Button variant="contained" onClick={handleSubmit}>
              ذخیره
            </Button>
            <Button onClick={() => setShowForm(false)}>انصراف</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
