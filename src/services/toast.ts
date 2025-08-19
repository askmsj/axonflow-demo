
type ToastType = 'info' | 'success' | 'warning' | 'error';

let showFn: (msg: string, type: ToastType) => void;

export const ToastService = {
  register(fn: typeof showFn) {
    showFn = fn;
  },
  show(message: string, type: ToastType = 'info') {
    if (showFn) showFn(message, type);
    else console.warn('ToastService not registered');
  }
};
