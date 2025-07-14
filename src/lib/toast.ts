import { ExternalToast, toast as sonnerToast } from 'sonner';
import { errorParser } from './error-parser';

type titleT = (() => React.ReactNode) | React.ReactNode;

export const toast = {
  success: (message: titleT | React.ReactNode, data?: ExternalToast) =>
    sonnerToast.success(message, {
      duration: 1000,
      ...data, // Spread any additional data props
    }),
  error: (message: titleT | React.ReactNode | Error | any, data?: ExternalToast) =>
    sonnerToast.error(errorParser(message), {
      duration: 2000, // 2 seconds
      ...data, // Spread any additional data props
    }),
};
