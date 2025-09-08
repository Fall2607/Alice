// File: app/components/admin/DatePickerField.tsx
"use client";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { id } from 'date-fns/locale/id'; // Impor lokalisasi bahasa Indonesia
registerLocale('id', id); // Daftarkan lokalisasi

interface DatePickerFieldProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
}

export default function DatePickerField({ selected, onChange, placeholderText }: DatePickerFieldProps) {
    return (
        <DatePicker
            selected={selected}
            onChange={onChange}
            locale="id"
            dateFormat="dd MMMM yyyy"
            placeholderText={placeholderText}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-50 text-sm p-2.5"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={30}
        />
    );
}

