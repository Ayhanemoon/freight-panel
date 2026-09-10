import React, { useRef } from 'react';
import { Button, Typography } from '@mui/material';

import './FileInputField.scss';

interface FileInputFieldProps {
  name: string;
  label: string;
  value: File | null;
  onChange: (name: string, file: File | null) => void;
  accept?: string;
  required?: boolean;
  className?: string;
}

const FileInputField: React.FC<FileInputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  accept = '',
  required = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(name, file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`form__group ${className}`}>
      <Typography variant="subtitle1" component="label" className="form__label">
        {label} {required && '*'}
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="form__input--file"
        style={{ display: 'none' }}
      />
      <Button variant="outlined" onClick={handleButtonClick} className="form__input">
        {value ? 'تغییر فایل' : 'انتخاب فایل'}
      </Button>
      {value && (
        <Typography variant="body2" className="form__filename">
          {value.name}
        </Typography>
      )}
    </div>
  );
};

export default FileInputField;
