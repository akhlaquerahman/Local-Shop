import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';
import { X, Plus, Bold, Italic, List, AlignLeft, Info } from 'lucide-react';

interface AdvancedInputProps {
  name: string;
  label?: string;
  helperText?: string;
}

/**
 * 1. TimePicker
 */
export const TimePicker: React.FC<AdvancedInputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  name,
  label,
  helperText,
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const hasError = !!errors[name];

  return (
    <FormField name={name} label={label} helperText={helperText}>
      <input
        type="time"
        {...register(name)}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-xs bg-background focus:ring-1 outline-none transition-all cursor-pointer
          ${hasError 
            ? 'border-danger focus:ring-danger focus:border-danger' 
            : 'border-border focus:ring-accent focus:border-accent'
          }`}
      />
    </FormField>
  );
};

/**
 * 2. TagInput
 * Supports typing items and pressing enter to catalog them.
 */
export const TagInput: React.FC<AdvancedInputProps & { placeholder?: string }> = ({
  name,
  label,
  helperText,
  placeholder = 'Add tag and press Enter...',
}) => {
  const { watch, setValue } = useFormContext();
  const tags: string[] = watch(name) || [];
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanVal = inputVal.trim();
      if (cleanVal && !tags.includes(cleanVal)) {
        setValue(name, [...tags, cleanVal], { shouldValidate: true });
        setInputVal('');
      }
    }
  };

  const handleRemove = (tag: string) => {
    setValue(name, tags.filter((t) => t !== tag), { shouldValidate: true });
  };

  return (
    <FormField name={name} label={label} helperText={helperText}>
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-1.5 flex-wrap border border-border bg-background p-2 rounded-md focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-semibold text-text-primary">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="text-text-secondary hover:text-text-primary rounded-full p-0.5 hover:bg-border"
              >
                <X size={8} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent outline-none text-xs min-w-[120px] py-0.5"
          />
        </div>
      </div>
    </FormField>
  );
};

/**
 * 3. RichTextEditor (Mockup)
 * Displays a clean text editor frame with mock editing tools.
 */
export const RichTextEditor: React.FC<AdvancedInputProps & { placeholder?: string }> = ({
  name,
  label,
  helperText,
  placeholder = 'Start writing product details here...',
}) => {
  const { register, formState: { errors } } = useFormContext();
  const hasError = !!errors[name];

  return (
    <FormField name={name} label={label} helperText={helperText}>
      <div className={`border rounded-lg overflow-hidden bg-background flex flex-col text-left
        ${hasError ? 'border-danger' : 'border-border'}`}
      >
        {/* Editor Toolbar */}
        <div className="bg-surface border-b border-border p-1.5 flex items-center gap-1 select-none">
          <button type="button" className="p-1 hover:bg-border/60 rounded text-text-secondary hover:text-text-primary" title="Bold"><Bold size={13} /></button>
          <button type="button" className="p-1 hover:bg-border/60 rounded text-text-secondary hover:text-text-primary" title="Italic"><Italic size={13} /></button>
          <div className="w-[1px] h-4 bg-border mx-1" />
          <button type="button" className="p-1 hover:bg-border/60 rounded text-text-secondary hover:text-text-primary" title="Bullet List"><List size={13} /></button>
          <button type="button" className="p-1 hover:bg-border/60 rounded text-text-secondary hover:text-text-primary" title="Align Left"><AlignLeft size={13} /></button>
        </div>
        
        {/* Text Area */}
        <textarea
          {...register(name)}
          placeholder={placeholder}
          className="w-full p-3 text-xs outline-none bg-transparent resize-y min-h-[120px] focus:ring-1 focus:ring-accent"
        />
      </div>
    </FormField>
  );
};
