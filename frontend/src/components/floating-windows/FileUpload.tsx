import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, X, Trash2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploaded' | 'processing' | 'complete';
  file: File;
}

interface FileUploadProps {
  onNext: () => void;
  onCancel: () => void;
  onFilesChange?: (files: UploadedFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onNext,
  onCancel,
  onFilesChange
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'uploaded' as const,
        file
      }));

      setUploadedFiles(prev => {
        const updated = [...prev, ...newFiles];
        onFilesChange?.(updated);
        return updated;
      });
    }
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/octet-stream': ['.step', '.stp'],
      'image/vnd.dwg': ['.dwg'],
      'application/dxf': ['.dxf'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId);
      onFilesChange?.(updated);
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcessFiles = () => {
    if (uploadedFiles.length > 0) {
      // Set all files to processing status
      setUploadedFiles(prev =>
        prev.map(file => ({ ...file, status: 'processing' as const }))
      );

      // Simulate processing time, then proceed to next step
      setTimeout(() => {
        setUploadedFiles(prev =>
          prev.map(file => ({ ...file, status: 'complete' as const }))
        );
        onNext();
      }, 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Description */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Start Your Smart RFQ: Define Requirement
        </h2>
        <p className="text-gray-600">
          Upload your CAD files, BoM spreadsheets, or ZBC reports to begin the AI-powered analysis
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive
              ? 'border-blue-400 bg-blue-50'
              : uploadedFiles.length > 0
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {uploadedFiles.length > 0 ? (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {uploadedFiles.length} File{uploadedFiles.length > 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-green-600">
                    Drop more files here or click to add additional files
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {isDragActive ? 'Drop your files here' : 'Upload Files'}
                  </h3>
                  <p className="text-gray-500">
                    Drag & drop multiple files here, or click to browse
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supported File Types */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">
            Supported formats: STEP, DXF, IGES, XLSX, CSV, PDF (max 50MB each)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${file.status === 'complete' ? 'bg-green-100 text-green-800' :
                      file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {file.status === 'complete' ? 'Complete' :
                      file.status === 'processing' ? 'Processing...' :
                        'Ready'}
                  </span>

                  {file.status === 'uploaded' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-blue-800 mb-1">
              What can you upload?
            </h4>
            <ul className="text-blue-700 space-y-1">
              <li>• <strong>Engineering Design:</strong> Upload CAD files to generate ZBC from scratch</li>
              <li>• <strong>ZBC Reports:</strong> Upload existing cost analysis reports to extract data</li>
              <li>• <strong>BoM Files:</strong> Upload spreadsheets to enhance with AI insights</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={uploadedFiles.some(f => f.status === 'processing')}
        >
          Cancel
        </Button>

        <Button
          onClick={handleProcessFiles}
          disabled={uploadedFiles.length === 0 || uploadedFiles.some(f => f.status === 'processing')}
          loading={uploadedFiles.some(f => f.status === 'processing')}
        >
          {uploadedFiles.some(f => f.status === 'processing')
            ? 'Processing Files...'
            : `Process ${uploadedFiles.length} File${uploadedFiles.length > 1 ? 's' : ''} & Continue`
          }
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
