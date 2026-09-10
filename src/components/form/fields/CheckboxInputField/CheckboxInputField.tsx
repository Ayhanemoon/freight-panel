import React from 'react';
import { FormControlLabel, Checkbox, FormGroup, FormLabel } from '@mui/material';

interface CheckboxInputFieldProps {
  name: string;
  label: string;
  value: boolean;
  onChange: (name: string, value: boolean) => void;
  className?: string;
}

const CheckboxInputField: React.FC<CheckboxInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.checked);
  };
  return (
    <FormGroup className={`form__group ${className}`}>
      <FormLabel component="legend" className="form__label">
        {label}
      </FormLabel>
      <FormControlLabel
        control={
          <Checkbox
            checked={value}
            onChange={handleChange}
            name={name}
            color="primary"
          />
        }
        label=""
      />
    </FormGroup>
  );
};

export default CheckboxInputField;
