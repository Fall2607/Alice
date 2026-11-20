// File: app/components/admin/SearchableSelect.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  isDisabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  isClearable = true,
  isDisabled = false,
}: SearchableSelectProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      menuPortalTarget={isMounted ? document.body : undefined}
      noOptionsMessage={() => "Tidak ada pilihan"}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: "38px",
          height: "38px",
          backgroundColor: state.isDisabled
            ? "#f1f5f9"
            : state.isFocused
            ? "#ffffff"
            : "rgba(248, 250, 252, 0.8)",
          borderColor: state.isDisabled
            ? "#e2e8f0"
            : state.isFocused
            ? "#0173b6"
            : "#e2e8f0",
          borderRadius: "0.75rem",
          boxShadow: state.isFocused ? "0 0 0 2px rgba(1, 115, 182, 0.20)" : "none",
          transition: "all 0.15s ease-in-out",
          paddingLeft: "2px",
          paddingRight: "6px",
          cursor: state.isDisabled ? "not-allowed" : "pointer",
          "&:hover": {
            borderColor: state.isDisabled
              ? "#e2e8f0"
              : state.isFocused
              ? "#0173b6"
              : "#cbd5e1",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "0 8px",
          height: "36px",
          display: "flex",
          alignItems: "center",
        }),
        singleValue: (base) => ({
          ...base,
          color: "#1e293b",
          fontSize: "0.75rem",
          fontWeight: 600,
          margin: 0,
        }),
        placeholder: (base) => ({
          ...base,
          color: "#94a3b8",
          fontSize: "0.75rem",
          fontWeight: 600,
          margin: 0,
        }),
        input: (base) => ({
          ...base,
          color: "#1e293b",
          fontSize: "0.75rem",
          fontWeight: 600,
          margin: 0,
          padding: 0,
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? "#0173b6" : "#94a3b8",
          padding: "0 6px",
          cursor: "pointer",
          transition: "color 0.15s ease-in-out",
          "&:hover": {
            color: "#0173b6",
          },
        }),
        clearIndicator: (base) => ({
          ...base,
          color: "#94a3b8",
          padding: "0 4px",
          cursor: "pointer",
          "&:hover": {
            color: "#e11d48",
          },
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: "36px",
          display: "flex",
          alignItems: "center",
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 99999,
        }),
        menu: (base) => ({
          ...base,
          zIndex: 99999,
          borderRadius: "0.75rem",
          overflow: "hidden",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0",
          marginTop: "6px",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#0173b6"
            : state.isFocused
            ? "#f1f5f9"
            : "white",
          color: state.isSelected ? "white" : "#1e293b",
          fontSize: "0.75rem",
          fontWeight: state.isSelected ? 700 : 500,
          padding: "8px 12px",
          cursor: "pointer",
          "&:active": {
            backgroundColor: "#05445e",
            color: "white",
          },
        }),
      }}
    />
  );
}
