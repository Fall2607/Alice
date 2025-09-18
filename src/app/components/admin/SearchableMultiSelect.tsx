// File: src/app/components/admin/SearchableMultiSelect.tsx
"use client";

import Select from "react-select";

// Tipe data untuk opsi dropdown
export interface MultiSelectOption {
  value: string;
  label: string;
  type: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"; // Menandakan tipe MBTI dari setiap opsi
}

interface SearchableMultiSelectProps {
  options: MultiSelectOption[];
  value: MultiSelectOption[];
  onChange: (selectedOptions: MultiSelectOption[]) => void;
  placeholder?: string;
}

// Komponen kustom untuk menampilkan ikon di sebelah placeholder
const Placeholder = (props: any) => {
  return (
    <div className="flex items-center text-slate-500">{props.children}</div>
  );
};

export default function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder,
}: SearchableMultiSelectProps) {
  return (
    <Select
      isMulti // Mengaktifkan mode multi-select
      options={options}
      value={value}
      onChange={(selected) => onChange(selected as MultiSelectOption[])}
      placeholder={placeholder}
      noOptionsMessage={() => "Tidak ada pilihan"}
      components={{ Placeholder }}
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#d1d5db",
          boxShadow: "none",
          "&:hover": {
            borderColor: "#0173b6",
          },
          padding: "2px",
          fontSize: "0.875rem",
          minHeight: "100px", // Memberi ruang lebih untuk beberapa pilihan
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#0173b6"
            : state.isFocused
            ? "#f2f2f2"
            : "white",
          color: state.isSelected ? "white" : "black",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#e0f2fe", // Warna badge untuk item yang dipilih
        }),
      }}
    />
  );
}
