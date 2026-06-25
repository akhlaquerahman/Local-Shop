import React, { useState } from 'react';
import { UploadCloud, Download, CheckCircle, AlertTriangle, FileSpreadsheet, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/table';
import { useImportProducts, useImportHistory } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';

export const BulkUploadPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const { data: history, isLoading: historyLoading } = useImportHistory();
  const importMutation = useImportProducts();
  const { addToast } = useNotificationStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        
        const lines = text.split('\n');
        const parsedData = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Handle commas inside quotes
          const cols = [];
          let inQuotes = false;
          let currentWord = '';
          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(currentWord.trim());
              currentWord = '';
            } else {
              currentWord += char;
            }
          }
          cols.push(currentWord.trim());
          
          // headers = ['Media URL/Upload', 'Product', 'description', 'SKU', 'Category', 'Sub Category', 'MRP', 'Selling Price', 'Available Stock', 'Weight (grams)', 'Status'];
          if (cols.length >= 2 && cols[1]) {
            parsedData.push({
              imageUrl: cols[0],
              name: cols[1],
              description: cols[2],
              sku: cols[3],
              category: cols[4],
              subCategory: cols[5],
              mrp: parseFloat(cols[6]) || 0,
              price: parseFloat(cols[7]) || 0,
              stock: parseInt(cols[8]) || 0,
              weight: parseFloat(cols[9]) || 0,
              status: (cols[10]?.toUpperCase() === 'ACTIVE') ? 'ACTIVE' : 'DRAFT'
            });
          }
        }
        
        setPreviewData(parsedData);
        setStep(3);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    try {
      if (!file) return;
      await importMutation.mutateAsync({
        fileName: file.name,
        products: previewData
      });
      addToast({ title: 'Success', message: 'Products imported successfully', type: 'success' });
      setStep(5);
    } catch (err: any) {
      addToast({ title: 'Import Failed', message: err.message || 'Error during import', type: 'error' });
    }
  };

  const resetFlow = () => {
    setStep(1);
    setFile(null);
    setPreviewData([]);
  };

  const historyColumns = [
    { header: 'File Name', accessorKey: 'fileName', cell: (row: any) => <div className="flex items-center gap-2"><FileSpreadsheet size={16} className="text-text-secondary"/>{row.fileName}</div> },
    { header: 'Total Records', accessorKey: 'records' },
    { header: 'Success', accessorKey: 'successCount', cell: (row: any) => <span className="text-success font-semibold">{row.successCount}</span> },
    { header: 'Failed', accessorKey: 'failureCount', cell: (row: any) => <span className="text-danger font-semibold">{row.failureCount}</span> },
    { header: 'Date', accessorKey: 'createdAt', cell: (row: any) => new Date(row.createdAt).toLocaleDateString() },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-left pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Bulk Import Products</h1>
        <p className="text-sm text-text-secondary">Import thousands of products instantly using our spreadsheet template</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WIZARD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            
            {/* Step Header */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary'}`}>
                    {step > s ? <CheckCircle size={16} /> : s}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s ? 'text-primary' : 'text-text-secondary'}`}>
                    {s === 1 ? 'Download' : s === 2 ? 'Upload' : s === 3 ? 'Validate' : s === 4 ? 'Preview' : 'Done'}
                  </span>
                </div>
              ))}
              <div className="absolute left-6 right-6 top-10 h-[2px] bg-border -z-0 hidden sm:block"></div>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-background/50 text-center">
              
              {step === 1 && (
                <div className="space-y-4 max-w-sm mx-auto">
                  <FileSpreadsheet size={48} className="mx-auto text-primary" />
                  <h3 className="text-lg font-bold">Download Template</h3>
                  <p className="text-sm text-text-secondary">Start by downloading our standard CSV template. Do not modify the headers.</p>
                  <Button 
                    className="w-full justify-center" 
                    icon={<Download size={16}/>} 
                    onClick={() => {
                      const headers = ['Media URL/Upload', 'Product', 'description', 'SKU', 'Category', 'Sub Category', 'MRP', 'Selling Price', 'Available Stock', 'Weight (grams)', 'Status'];
                      const csvContent = headers.join(',') + '\n';
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = 'bulk_product_upload_template.csv';
                      link.click();
                      setStep(2);
                    }}
                  >
                    Download CSV Template
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 max-w-sm mx-auto w-full">
                  <UploadCloud size={48} className="mx-auto text-primary" />
                  <h3 className="text-lg font-bold">Upload Filled Template</h3>
                  <p className="text-sm text-text-secondary">Upload the CSV file you just populated.</p>
                  <div className="relative">
                    <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                    <Button variant="outline" className="w-full justify-center">Select File</Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 max-w-md mx-auto w-full">
                  <AlertTriangle size={48} className="mx-auto text-warning" />
                  <h3 className="text-lg font-bold">Validation Successful</h3>
                  <p className="text-sm text-text-secondary">We found {previewData.length} valid rows in <strong>{file?.name}</strong>.</p>
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Re-upload</Button>
                    <Button className="flex-1" onClick={() => setStep(4)}>Proceed to Preview</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Data Preview</h3>
                    <Button size="sm" isLoading={importMutation.isPending} onClick={handleImport} icon={<Play size={14}/>}>Start Import</Button>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden bg-surface text-left">
                    <table className="w-full text-sm">
                      <thead className="bg-background border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-text-secondary font-semibold">SKU</th>
                          <th className="px-4 py-2 text-text-secondary font-semibold">Product Name</th>
                          <th className="px-4 py-2 text-text-secondary font-semibold">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((r, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-4 py-2">{r.sku}</td>
                            <td className="px-4 py-2">{r.name}</td>
                            <td className="px-4 py-2">₹{r.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 max-w-sm mx-auto">
                  <CheckCircle size={64} className="mx-auto text-success" />
                  <h3 className="text-2xl font-bold">Import Complete!</h3>
                  <p className="text-sm text-text-secondary">{previewData.length} products have been queued for processing.</p>
                  <Button className="w-full justify-center" onClick={resetFlow}>Start New Import</Button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* SIDEBAR: HISTORY */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-background">
              <h2 className="font-bold text-text-primary">Recent Imports</h2>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="p-8 text-center text-text-secondary text-sm">Loading history...</div>
              ) : history && history.length > 0 ? (
                <div className="divide-y divide-border">
                  {history.map((h: any) => (
                    <div key={h._id} className="p-4 space-y-2 hover:bg-background/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-text-primary truncate" title={h.fileName}>{h.fileName}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${h.status === 'COMPLETED' ? 'bg-success/10 text-success' : h.status === 'FAILED' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                          {h.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>{h.records} Rows</span>
                        <span className="text-success">{h.successCount} Success</span>
                        <span className="text-danger">{h.failureCount} Failed</span>
                      </div>
                      <p className="text-[10px] text-text-secondary">{new Date(h.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-text-secondary text-sm">No import history found.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkUploadPage;
