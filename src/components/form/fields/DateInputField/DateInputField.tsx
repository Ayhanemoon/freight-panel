import React from 'react';
import { AdapterFormats, DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { parseISO, isValid } from "date-fns";
import { PickerValue } from '@mui/x-date-pickers/internals';
import { faIR as fa } from 'date-fns-jalali/locale';
import { faIR } from '@mui/x-date-pickers/locales';
import { convertToPersianDigits } from '@/utils/numbers';
import { format, newDate } from 'date-fns-jalali';
interface DateInputFieldProps {
  label: string;
  name: string;
  value: string | null;
  onChange: (name: string, value: string | null) => void;
  required?: boolean;
  className?: string;
  options: { label: string; value: any }[];
  error: string; // For validation error messages
}

import { Locale } from 'date-fns-jalali';

export class CustomAdapterDateFnsJalali extends AdapterDateFnsJalali {
  constructor (...args: any[]) {
    super(...args)
    
    const originalFormat = this.format
    this.format =(date: Date, formatKey: keyof AdapterFormats): string => {
      const formatted = originalFormat(date, formatKey);
      return convertToPersianDigits(formatted);
    }
  }
  

  // Optional: customize weekday names
}


const DateInputField: React.FC<DateInputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  className = '',
  options
}) => {
  // Safe parse
  const safeValue: Date | null =
    value && isValid(parseISO(value)) ? parseISO(value) : null;

  const handleChange = (date: PickerValue | null) => {
    onChange(name, date?.toISOString() || null);
  };

  return (
    <div className={`form__group ${className}`}>
      <LocalizationProvider dateAdapter={CustomAdapterDateFnsJalali} adapterLocale={fa} localeText={faIR.components.MuiLocalizationProvider.defaultProps.localeText}>
        <DatePicker
          label={label}
          value={safeValue}
          onChange={handleChange}
          views={['year', 'month', 'day']}
          slotProps={{
            textField: {
              required,
              fullWidth: true,
              variant: 'outlined',
              size: 'small',
            } as any,
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default DateInputField;
