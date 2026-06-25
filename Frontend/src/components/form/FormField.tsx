import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label?: string;
  helperText?: string;
  children: React.ReactElement;
}

/**
 * Enterprise FormField wrapper that hooks into the react-hook-form Context
 * to automatically retrieve and display validation error messages.
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  helperText,
  children,
}) => {
  const context = useFormContext();
  
  // Safe check if FormField is rendered outside FormProvider
  if (!context) {
    return (
      <div className="space-y-1.5 w-full text-left">
        {label && <span className="block text-xs font-semibold text-text-primary">{label}</span>}
        {children}
        {helperText && <p className="text-[10px] text-text-secondary">{helperText}</p>}
      </div>
    );
  }

  const { formState: { errors } } = context;
  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-text-primary select-none">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {React.cloneElement(children, { id: name })}
      </div>
      
      {errorMessage ? (
        <p className="text-[10px] font-semibold text-danger animate-in fade-in duration-150">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField;
