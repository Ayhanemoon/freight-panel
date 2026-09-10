import React from 'react';
import { FormControl, FormControlLabel, Switch, Typography } from '@mui/material';

import './SwitchInputField.scss';

interface SwitchInputFieldProps {
  name: string;
  label: string;
  checked: boolean; // Required for switch fields
  onChange: (name: string, value: boolean) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

const SwitchInputField: React.FC<SwitchInputFieldProps> = ({
  name,
  label,
  checked,
  onChange,
  required = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.checked);
  };

  return (
    <FormControl component="fieldset" className={`form__group ${className}`}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            name={name}
            color="primary"
          />
        }
        label={
          <Typography component="span" className="form__label">
            {label} {required && '*'}
          </Typography>
        }
        className="form__input--switch"
      />
    </FormControl>
  );
};

export default SwitchInputField;
