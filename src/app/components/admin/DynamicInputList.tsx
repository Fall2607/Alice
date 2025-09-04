// File: app/components/admin/DynamicInputList.tsx
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

interface DynamicInputListProps {
  label: string;
  initialValues: string[];
  onChange: (values: string[]) => void;
}

export default function DynamicInputList({
  label,
  initialValues,
  onChange,
}: DynamicInputListProps) {
  const [items, setItems] = useState<string[]>(initialValues);

  useEffect(() => {
    // Sinkronkan state jika prop initialValues berubah
    setItems(initialValues);
  }, [initialValues]);

  const handleAddItem = () => {
    const newItems = [...items, ""];
    setItems(newItems);
    onChange(newItems);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    onChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder={`Poin ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
              title="Hapus poin"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddItem}
        className="mt-2 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <PlusCircle size={18} />
        Tambah Poin
      </button>
    </div>
  );
}
