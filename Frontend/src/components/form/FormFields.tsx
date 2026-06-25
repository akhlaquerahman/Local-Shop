import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FieldWrapperProps {
  name: string;
  label?: string;
  helperText?: string;
  children: React.ReactNode;
}

/**
 * 1. FormFieldWrapper
 * Renders Label, Input container, and validation error messages.
 */
export const FormFieldWrapper: React.FC<FieldWrapperProps> = ({
  name,
  label,
  helperText,
  children,
}) => {
  const { formState: { errors } } = useFormContext();
  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-text-primary select-none">
          {label}
        </label>
      )}
      
      <div className="relative w-full">{children}</div>
      
      {errorMessage ? (
        <p className="text-[10px] font-semibold text-danger animate-in fade-in slide-in-from-top-1 duration-100">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
}

/**
 * 2. FormInput
 */
export const FormInput: React.FC<InputProps> = ({
  name,
  label,
  helperText,
  type = 'text',
  className = '',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const hasError = !!errors[name];

  return (
    <FormFieldWrapper name={name} label={label} helperText={helperText}>
      <input
        id={name}
        type={type}
        {...register(name)}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-xs bg-background focus:ring-1 outline-none transition-all
          ${hasError 
            ? 'border-danger focus:ring-danger focus:border-danger' 
            : 'border-border focus:ring-accent focus:border-accent'
          } ${className}`}
      />
    </FormFieldWrapper>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
}

/**
 * 3. FormSelect
 */
export const FormSelect: React.FC<SelectProps> = ({
  name,
  label,
  helperText,
  options,
  className = '',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const hasError = !!errors[name];

  return (
    <FormFieldWrapper name={name} label={label} helperText={helperText}>
      <select
        id={name}
        {...register(name)}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-xs bg-background focus:ring-1 outline-none transition-all cursor-pointer
          ${hasError 
            ? 'border-danger focus:ring-danger focus:border-danger' 
            : 'border-border focus:ring-accent focus:border-accent'
          } ${className}`}
      >
        <option value="">Select option...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormFieldWrapper>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  helperText?: string;
}

/**
 * 4. FormTextarea
 */
export const FormTextarea: React.FC<TextareaProps> = ({
  name,
  label,
  helperText,
  rows = 3,
  className = '',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const hasError = !!errors[name];

  return (
    <FormFieldWrapper name={name} label={label} helperText={helperText}>
      <textarea
        id={name}
        rows={rows}
        {...register(name)}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-xs bg-background focus:ring-1 outline-none transition-all
          ${hasError 
            ? 'border-danger focus:ring-danger focus:border-danger' 
            : 'border-border focus:ring-accent focus:border-accent'
          } ${className}`}
      />
    </FormFieldWrapper>
  );
};

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  helperText?: string;
}

/**
 * 5. FormSwitch
 */
export const FormSwitch: React.FC<SwitchProps> = ({
  name,
  label,
  helperText,
  className = '',
  ...props
}) => {
  const { register, watch, setValue } = useFormContext();
  const isChecked = watch(name);

  return (
    <div className="flex flex-col text-left space-y-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          onClick={() => setValue(name, !isChecked, { shouldValidate: true })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none
            ${isChecked ? 'bg-accent' : 'bg-border'}`}
          {...props}
        >
          <span
            className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-enterprise ring-0 transition-transform
              ${isChecked ? 'translate-x-4' : 'translate-x-0.5'}`}
          />
        </button>
        <span className="text-xs font-semibold text-text-primary select-none">{label}</span>
      </div>
      {helperText && <p className="text-[10px] text-text-secondary pl-12">{helperText}</p>}
    </div>
  );
};

/**
 * 6. FormDatePicker
 */
export const FormDatePicker: React.FC<InputProps> = ({
  name,
  label,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <FormInput
      name={name}
      label={label}
      helperText={helperText}
      type="date"
      className={className}
      {...props}
    />
  );
};
