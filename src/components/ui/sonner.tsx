'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

// Add styles for custom toast types
const toastStyles = `
  .success-toast {
    background: #22c55e !important;
    color: #ffffff !important;
    border: 1px solid #16a34a !important;
  }

  .success-toast [data-icon] {
    color: #ffffff !important;
  }

  .success-toast [data-content] {
    color: #ffffff !important;
  }

  .success-toast [data-title] {
    color: #ffffff !important;
  }

  .success-toast [data-description] {
    color: #ffffff !important;
  }

  .error-toast {
    background: #ef4444 !important;
    color: #ffffff !important;
    border: 1px solid #dc2626 !important;
  }

  .error-toast [data-icon] {
    color: #ffffff !important;
  }

  .error-toast [data-content] {
    color: #ffffff !important;
  }

  .error-toast [data-title] {
    color: #ffffff !important;
  }

  .error-toast [data-description] {
    color: #ffffff !important;
  }
`;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: toastStyles }} />
      <Sonner
        theme={theme as ToasterProps['theme']}
        className="toaster group"
        position="top-right"
        toastOptions={{
          classNames: {
            success: 'success-toast',
            error: 'error-toast',
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
