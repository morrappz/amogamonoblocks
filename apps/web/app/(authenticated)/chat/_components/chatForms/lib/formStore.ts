import { create } from "zustand";

interface FormData {
  [field: string]: string | number;
}

interface FormStore {
  formData: FormData;
  updateFormData: (fieldName: string, value: string | number) => void;
  resetForm: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
  formData: {},
  updateFormData: (fieldName, value) =>
    set((state) => ({
      formData: { ...state.formData, [fieldName]: value },
    })),
  resetForm: () => set({ formData: {} }),
}));
