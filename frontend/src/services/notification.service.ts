import toast from 'react-hot-toast';

interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

class NotificationService {
  success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
    });
  }

  error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    });
  }

  info(message: string, options?: NotificationOptions) {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
    });
  }

  warning(message: string, options?: NotificationOptions) {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  }

  loading(message: string) {
    return toast.loading(message);
  }

  dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: NotificationOptions
  ) {
    return toast.promise(promise, messages, {
      position: options?.position || 'top-right',
    });
  }
}

export const notificationService = new NotificationService(); 