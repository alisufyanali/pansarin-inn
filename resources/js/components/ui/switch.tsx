import * as React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, className, ...props }, ref) => {
    return (
      <label className={
        'inline-flex items-center cursor-pointer ' + (className || '')
      }>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={e => onCheckedChange(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <span
          className="w-10 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-primary peer-checked:bg-primary relative transition-colors duration-200"
        >
          <span
            className={
              'absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ' +
              (checked ? 'translate-x-4' : '')
            }
          />
        </span>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
