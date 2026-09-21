import React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

import './RadioInputField.scss';

interface Option {
  label: string;
  value: string;
}

interface RadioInputFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  className?: string;
  row?: boolean;
  readOnly?: boolean;
}

const RadioInputField: React.FC<RadioInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  error = '',
  className = '',
  row = false,
  readOnly = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <FormControl className={`form__group ${className}`} required={required} error={!!error}>
      <FormLabel className="form__label" disabled={!!readOnly}>
        {label}
      </FormLabel>
      <RadioGroup
        name={name}
        value={value}
        onChange={handleChange}
        row={row}
        className="form__input--radio-group"
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            className="form__input--radio-item"
            disabled={!!readOnly}
          />
        ))}
      </RadioGroup>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default RadioInputField;
