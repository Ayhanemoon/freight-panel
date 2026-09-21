import React from 'react';
import { Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';

interface Option {
  label: string;
  value: any;
}

interface SelectInputFieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (name: string, value: any) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  className?: string;
  readOnly?: boolean;
}

const SelectInputField: React.FC<SelectInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  error = '',
  className = '',
  readOnly = false,
}) => {
  return (
    <div className={`form__group ${className}`}>
      <FormControl 
        size='small'
        fullWidth
        required={required}
        error={!!error}
        disabled={!!readOnly}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          label={label}
          className="form__input"
          disabled={!!readOnly}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  );
};

export default SelectInputField;
