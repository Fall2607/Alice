// File: app/components/admin/SearchableSelect.tsx
"use client";

// Pastikan library 'react-select' sudah terinstal di proyek Anda
import Select from "react-select";

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
  isDisabled?: boolean; // Menambahkan prop isDisabled
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  isClearable = true,
  isDisabled = false, // Menambahkan isDisabled ke props
}: SearchableSelectProps) {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled} // Meneruskan prop ke komponen Select
      noOptionsMessage={() => "Tidak ada pilihan"}
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: "#d1d5db",
          backgroundColor: state.isDisabled ? "#f3f4f6" : "white", // Memberi warna latar abu-abu saat disabled
          boxShadow: "none",
          "&:hover": {
            borderColor: state.isDisabled ? "#d1d5db" : "#0173b6",
          },
          padding: "2px",
          fontSize: "0.875rem",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#0173b6"
            : state.isFocused
            ? "#f2f2f2"
            : "white",
          color: state.isSelected ? "white" : "black",
          "&:active": {
            backgroundColor: "#05445e",
          },
        }),
      }}
    />
  );
}
