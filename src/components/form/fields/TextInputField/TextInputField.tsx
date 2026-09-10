import React from 'react';
import TextField from '@mui/material/TextField';

interface TextInputFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  required = false,
  error = '',
  className = '',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(name, newValue);
  }
  return (
    <div className={`form__group ${className}`}>
      <TextField
        fullWidth
        size="small"
        label={label}
        name={name}
        value={value}
        required={required}
        error={!!error}
        helperText={error}
        onChange={handleChange}
        className="form__input"
        variant="outlined"
      />
    </div>
  );
};

export default TextInputField;
