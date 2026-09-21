import React from 'react';
import { TextField } from '@mui/material';

interface TextareaInputFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  rows?: number;
  error?: string;
  className?: string;
  readOnly?: boolean; // Optional readOnly prop
}

const TextareaInputField: React.FC<TextareaInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  required = false,
  rows = 4,
  error = '',
  className = '',
  readOnly = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <div className={`form__group ${className}`}>
      <TextField
        fullWidth
        multiline
        rows={rows}
        label={label}
        name={name}
        value={value}
        required={required}
        error={!!error}
        helperText={error}
        onChange={handleChange}
        className="form__input"
        variant="outlined"
        disabled={!!readOnly}
      />
    </div>
  );
};

export default TextareaInputField;
