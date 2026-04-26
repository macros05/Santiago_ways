import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastState = {
  current: (ToastPayload & { id: string; type: ToastType }) | null;
  show: (payload: ToastPayload) => void;
  dismiss: () => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (payload) =>
    set({
      current: {
        ...payload,
        id: String(++counter),
        type: payload.type ?? 'info',
      },
    }),
  dismiss: () => set({ current: null }),
}));

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().show({ message, type: 'success', duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().show({ message, type: 'error', duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().show({ message, type: 'info', duration }),
};
