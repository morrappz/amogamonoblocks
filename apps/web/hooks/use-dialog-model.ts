import { create } from "zustand";

interface DialogProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
  openModel(data: any): void;
}

export const useDialog = create<DialogProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: {},
  setData: (data) => set({ data }),
  openModel: (data) => {
    set({ data });
    set({ isOpen: true });
  },
}));
