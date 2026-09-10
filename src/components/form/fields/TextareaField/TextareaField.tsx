import React from 'react';
import { TextField } from '@mui/material';

interface TextareaInputFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  rows?: number;
  className?: string;
}

const TextareaInputField: React.FC<TextareaInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  required = false,
  rows = 4,
  className = '',
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
        onChange={handleChange}
        className="form__input"
        variant="outlined"
      />
    </div>
  );
};

export default TextareaInputField;
