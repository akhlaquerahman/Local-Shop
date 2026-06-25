import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, X, Eye, FileText, Clock, FileWarning, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMyKycDocuments, useUploadKycDocument } from '@/services/kyc.queries';
import { useForm, FormProvider } from 'react-hook-form';
import { useNotificationStore } from '@/store/notificationStore';

const requiredDocuments = [
  { id: 'AADHAAR', label: 'Aadhaar Card', description: 'Aadhaar card front and back.' },
  { id: 'PAN_CARD', label: 'PAN Card', description: 'Personal PAN card image.' },
  { id: 'DRIVING_LICENSE', label: 'Driving License', description: 'Valid Driving License (Front & Back).' },
  { id: 'VEHICLE_RC', label: 'Vehicle RC', description: 'Registration Certificate of vehicle.' },
  { id: 'VEHICLE_INSURANCE', label: 'Vehicle Insurance', description: 'Active insurance policy.' },
  { id: 'BANK_PROOF', label: 'Bank Proof', description: 'Cancelled cheque or passbook.' },
  { id: 'PROFILE_PHOTO', label: 'Profile Photo', description: 'Clear face photo for customer app.' },
];

const RiderKycPage: React.FC = () => {
  const { data, isLoading } = useMyKycDocuments();
  const uploadMutation = useUploadKycDocument();
  const { addToast } = useNotificationStore();

  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const methods = useForm({
    defaultValues: {
      documentNumber: '',
      frontImage: '',
      backImage: '',
      pdf: ''
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading KYC Status...</div>;

  const uploadedDocs = data?.data || [];
  
  // Calculate Progress
  const approvedCount = uploadedDocs.filter((d: any) => d.status === 'APPROVED').length;
  const progressPercent = Math.round((approvedCount / requiredDocuments.length) * 100);

  let overallStatus = 'Pending';
  if (approvedCount === requiredDocuments.length) overallStatus = 'Approved';
  else if (uploadedDocs.some((d: any) => d.status === 'REJECTED')) overallStatus = 'Rejected';
  else if (uploadedDocs.some((d: any) => d.status === 'REUPLOAD_REQUIRED')) overallStatus = 'Action Required';
  else if (uploadedDocs.some((d: any) => d.status === 'UNDER_REVIEW' || d.status === 'PENDING')) overallStatus = 'Under Review';

  const handleUploadClick = (docType: string) => {
    setSelectedDoc(docType);
    methods.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast({ title: 'Error', message: 'File must be less than 10MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        methods.setValue(fieldName as any, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (!formData.frontImage && !formData.pdf) {
        addToast({ title: 'Error', message: 'Please upload at least one file', type: 'error' });
        return;
      }

      await uploadMutation.mutateAsync({
        documentType: selectedDoc,
        documentNumber: formData.documentNumber,
        frontImageUrl: formData.frontImage,
        backImageUrl: formData.backImage,
        pdfUrl: formData.pdf
      });

      addToast({ title: 'Success', message: 'Document uploaded for verification', type: 'success' });
      setSelectedDoc(null);
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> APPROVED</span>;
      case 'PENDING': return <span className="bg-warning/10 text-warning px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12}/> PENDING</span>;
      case 'UNDER_REVIEW': return <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Eye size={12}/> UNDER REVIEW</span>;
      case 'REJECTED': return <span className="bg-danger/10 text-danger px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> REJECTED</span>;
      case 'REUPLOAD_REQUIRED': return <span className="bg-danger/10 text-danger px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><FileWarning size={12}/> RE-UPLOAD REQUIRED</span>;
      default: return <span className="bg-surface text-text-secondary px-2 py-1 rounded text-xs font-bold">NOT UPLOADED</span>;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Delivery Partner KYC</h1>
          <p className="text-sm text-text-secondary">Complete your KYC to start receiving delivery requests.</p>
        </div>
      </div>

      {/* Top Section - Progress */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Overall Status</p>
            <h2 className={`text-xl font-bold ${overallStatus === 'Approved' ? 'text-success' : overallStatus === 'Rejected' || overallStatus === 'Action Required' ? 'text-danger' : 'text-warning'}`}>
              {overallStatus}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-text-secondary">{approvedCount} / {requiredDocuments.length} Approved</p>
          </div>
        </div>
        <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
          <div className="bg-success h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requiredDocuments.map(docDef => {
          const doc = uploadedDocs.find((d: any) => d.documentType === docDef.id);
          const status = doc ? doc.status : 'NOT_UPLOADED';

          return (
            <div key={docDef.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-background text-text-secondary'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">{docDef.label}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{docDef.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                {renderStatusBadge(status)}
                
                {status !== 'APPROVED' && status !== 'UNDER_REVIEW' && (
                  <Button size="sm" variant="outline" onClick={() => handleUploadClick(docDef.id)} className="h-8">
                    {status === 'NOT_UPLOADED' ? <><Upload size={14} className="mr-1"/> Upload</> : <><RefreshCcw size={14} className="mr-1"/> Re-upload</>}
                  </Button>
                )}
              </div>

              {doc?.rejectionReason && (status === 'REJECTED' || status === 'REUPLOAD_REQUIRED') && (
                <div className="mt-3 bg-danger/5 border border-danger/20 p-2 rounded-lg">
                  <p className="text-xs text-danger font-medium"><span className="font-bold">Reason:</span> {doc.rejectionReason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border bg-background">
              <h2 className="text-lg font-bold text-text-primary">Upload {requiredDocuments.find(d => d.id === selectedDoc)?.label}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}><X size={16} /></Button>
            </div>
            <div className="p-6">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-text-primary">Document Number (Optional)</label>
                    <input type="text" {...methods.register('documentNumber')} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. DL-123456789" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-text-primary">Front Image / Photo</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'frontImage')} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
                  </div>
                  
                  {['AADHAAR', 'DRIVING_LICENSE', 'VEHICLE_RC'].includes(selectedDoc) && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-text-primary">Back Image</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'backImage')} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
                    </div>
                  )}

                  <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex gap-3 mt-4">
                    <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-text-secondary">Max file size: 10MB. Formats: JPG, PNG, PDF. Ensure documents are clear and readable.</p>
                  </div>

                  <Button type="submit" className="w-full mt-6" isLoading={uploadMutation.isPending}>Submit Document</Button>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderKycPage;
