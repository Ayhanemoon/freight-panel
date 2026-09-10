import React from 'react';
import {
  FormControl,
  FormLabel,
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
  className?: string;
  row?: boolean;
}

const RadioInputField: React.FC<RadioInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  className = '',
  row = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <FormControl className={`form__group ${className}`} required={required}>
      <FormLabel className="form__label">{label}</FormLabel>
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
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioInputField;
