import React from 'react';
import { FormActionsProps } from '@/types/form.types';
import { Button } from '@/components/ui/Button';

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Save Changes',
  isSubmitting = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-2 w-full pt-2 ${className}`}>
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit" 
        variant="primary" 
        size="sm" 
        isLoading={isSubmitting}
      >
        {submitLabel}
      </Button>
    </div>
  );
};

export default FormActions;
