import React from 'react';
import TextField from '@mui/material/TextField';

interface NumberInputFieldProps {
  name: string;
  label: string;
  value: number | string;
  onChange: (name: string, value: number | string) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  className?: string;
  readOnly?: boolean;
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
  error = '',
  className = '',
  readOnly = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    if (rawValue.trim() === '') {
      onChange(name, '');
      return;
    }

    const parsedValue = Number(rawValue);

    onChange(name, Number.isFinite(parsedValue) ? parsedValue : rawValue);
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
        error={!!error}
        helperText={error}
        onChange={handleChange}
        inputProps={{ min, max, step }}
        className="form__input"
        variant="outlined"
        disabled={!!readOnly}
      />
    </div>
  );
};

export default NumberInputField;