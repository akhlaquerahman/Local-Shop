import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, Check, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  label?: string;
  accept?: string; // e.g. "image/*,application/pdf"
  maxSizeMB?: number;
  onUploadSuccess: (url: string, file: File) => void;
  onUploadError?: (error: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  label = 'Upload file (Image, PDF)',
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  onUploadSuccess,
  onUploadError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const validateAndUpload = (selectedFile: File) => {
    setStatus('idle');
    setUploadProgress(0);
    setErrorMsg('');

    // 1. Validate File Size
    const sizeLimit = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > sizeLimit) {
      const err = `File size exceeds ${maxSizeMB}MB limit.`;
      setErrorMsg(err);
      setStatus('error');
      if (onUploadError) onUploadError(err);
      return;
    }

    setFile(selectedFile);
    setStatus('uploading');

    // Simulate upload progress interval
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStatus('success');
        
        // Mock successful uploaded URL (using object URLs for mock persistence)
        const mockUrl = URL.createObjectURL(selectedFile);
        onUploadSuccess(mockUrl, selectedFile);
      }
    }, 150);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setStatus('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full text-left space-y-2">
      {label && <span className="text-xs font-semibold text-text-primary">{label}</span>}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          ${dragActive ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-text-secondary/50'}
          ${status === 'success' ? 'border-success/50 bg-success/5' : ''}
          ${status === 'error' ? 'border-danger/50 bg-danger/5' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {status === 'idle' && (
          <div className="text-center space-y-2">
            <UploadCloud className="mx-auto text-text-secondary" size={32} />
            <div className="text-xs font-semibold">
              Drag & Drop file here, or <span className="text-accent underline font-bold">Browse</span>
            </div>
            <p className="text-[10px] text-text-secondary">
              PDF, JPG, PNG up to {maxSizeMB}MB
            </p>
          </div>
        )}

        {status === 'uploading' && (
          <div className="w-full text-center space-y-2.5">
            <File className="mx-auto text-accent animate-bounce" size={24} />
            <div className="text-xs font-semibold text-text-primary">Uploading {file?.name}...</div>
            <div className="w-full max-w-xs mx-auto bg-border rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-150" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-accent">{uploadProgress}%</span>
          </div>
        )}

        {status === 'success' && (
          <div className="w-full flex items-center justify-between text-xs px-2 animate-in fade-in duration-100">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded bg-success/20 flex items-center justify-center text-success flex-shrink-0">
                <Check size={16} />
              </div>
              <div className="truncate">
                <div className="font-bold text-text-primary truncate">{file?.name}</div>
                <div className="text-[10px] text-text-secondary">Upload complete</div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-1.5 hover:bg-border/50 rounded-full text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full flex items-center justify-between text-xs px-2 animate-in fade-in duration-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-danger/20 flex items-center justify-center text-danger flex-shrink-0">
                <AlertCircle size={16} />
              </div>
              <div>
                <div className="font-bold text-text-primary">Upload failed</div>
                <div className="text-[10px] text-danger font-medium">{errorMsg}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-1.5 hover:bg-border/50 rounded-full text-text-secondary"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
