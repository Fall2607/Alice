// File: app/components/admin/SearchableSelect.tsx
"use client";

// Pastikan library 'react-select' sudah terinstal di proyek Anda
import Select from 'react-select';

interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps<T extends Option = Option> {
    options: T[];
    value: T | null;
    onChange: (selectedOption: T | null) => void;
    placeholder?: string;
    isClearable?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder, isClearable = true }: SearchableSelectProps) {
    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isClearable={isClearable}
            noOptionsMessage={() => "Tidak ada pilihan"}
            styles={{
                control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    boxShadow: 'none',
                    '&:hover': {
                        borderColor: '#0173b6',
                    },
                    padding: '2px',
                    fontSize: '0.875rem'
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#0173b6' : state.isFocused ? '#f2f2f2' : 'white',
                    color: state.isSelected ? 'white' : 'black',
                    '&:active': {
                        backgroundColor: '#05445e',
                    },
                }),
            }}
        />
    );
}

