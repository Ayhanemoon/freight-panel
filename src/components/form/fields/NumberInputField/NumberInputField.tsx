import React from 'react';
import TextField from '@mui/material/TextField';

interface NumberInputFieldProps {
  name: string;
  label: string;
  value: number | string;
  onChange: (name: string, value: number) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(name, isNaN(newValue) ? 0 : newValue);
  };

  return (
    <div className={`form__group ${className}`}>
      <TextField
        fullWidth
        size="small"
        label={label}
        name={name}
        type="number"
        value={value}
        required={required}
        onChange={handleChange}
        inputProps={{ min, max, step }}
        className="form__input"
        variant="outlined"
      />
    </div>
  );
};

export default NumberInputField;
