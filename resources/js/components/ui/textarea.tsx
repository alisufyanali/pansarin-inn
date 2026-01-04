import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={
          'block w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none ' +
          (className || '')
        }
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
