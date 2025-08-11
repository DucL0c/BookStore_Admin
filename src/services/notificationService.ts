import { toast } from "react-hot-toast";

export const ToastService = {
  success(message: string) {
    return toast.success(message);
  },
  error(message: string) {
    return toast.error(message);
  },
  loading(message: string) {
    return toast.loading(message);
  },
  dismiss() {
    return toast.dismiss();
  },
};

export default ToastService;
