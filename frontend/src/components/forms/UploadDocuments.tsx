import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, X, File as FileIcon } from 'lucide-react';
import { RFQ } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { voiceAppCommandBus } from '../../services/VoiceAppCommandBus';
import { setUploadedFiles, setExtractedData } from '../../store/rfqSlice';
import api from '../../services/api';

interface UploadDocumentsProps {
  rfq: RFQ;
  onNext: () => void;
  onCancel: () => void;
}

const UploadDocuments: React.FC<UploadDocumentsProps> = ({
  rfq,
  onNext,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // File selection handler (UI or Voice initiated)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Add to existing files (support multiple uploads)
      const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, 10); // Max 10 files
      setSelectedFiles(newFiles);

      console.log('📁 Files selected:', newFiles.map(f => f.name));

      // HYBRID: Send feedback to voice (whether voice initiated or not)
      voiceAppCommandBus.sendVoiceFeedback('filesSelected', {
        count: newFiles.length,
        names: newFiles.map(f => f.name),
        totalSize: newFiles.reduce((sum, f) => sum + f.size, 0)
      });

      voiceAppCommandBus.updateContext('uploadedFiles', newFiles);
    }
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      // Images
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff', '.tif'],
      // Documents
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      // CAD & Engineering
      'application/octet-stream': ['.step', '.stp', '.dwg', '.dxf', '.sldasm', '.sldprt', '.slddrw'],
      // ZIP
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    multiple: true,
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB per file
  });

  // HYBRID: Register voice commands on mount
  useEffect(() => {
    console.log('📡 Step1: Registering voice commands with CommandBus');

    // Command: Voice can trigger file picker
    voiceAppCommandBus.registerAppCommand('openFilePicker', async () => {
      console.log('🎙️ Voice triggered: openFilePicker');
      open();
      return { success: true, message: 'File picker opened' };
    });

    // Command: Voice can get selected files
    voiceAppCommandBus.registerAppCommand('getSelectedFiles', async () => {
      console.log('🎙️ Voice triggered: getSelectedFiles');
      return {
        success: true,
        data: {
          count: selectedFiles.length,
          files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
        }
      };
    });

    // Update context with current state
    voiceAppCommandBus.updateContext('currentStep', 1);
    voiceAppCommandBus.updateContext('uploadedFiles', selectedFiles);

    // Cleanup on unmount
    return () => {
      console.log('📡 Step1: Unregistering voice commands');
      voiceAppCommandBus.unregisterAppCommand('openFilePicker');
      voiceAppCommandBus.unregisterAppCommand('getSelectedFiles');
    };
  }, [selectedFiles, open]);

  // Remove file from list
  const removeFile = (index: number) => {
    const removedFile = selectedFiles[index];
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    voiceAppCommandBus.updateContext('uploadedFiles', newFiles);

    // HYBRID: Notify voice about file removal
    voiceAppCommandBus.sendVoiceFeedback('fileRemoved', {
      removedFile: removedFile.name,
      remainingCount: newFiles.length
    });

    console.log('🗑️ File removed:', removedFile.name);
  };

  // Next button handler - Extract then navigate
  const handleNext = async () => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      console.log('📄 Starting document extraction...');

      // Call extraction API with actual files
      const extractedData = await api.extractDocuments(selectedFiles, rfq.id);

      console.log('✅ Extraction complete:', extractedData);

      // Store file information AND extracted data in Redux
      const fileInfo = selectedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }));

      dispatch(setUploadedFiles(fileInfo));

      // Store extracted data in Redux
      dispatch(setExtractedData(extractedData));

      // HYBRID: Send feedback to voice about extraction
      const componentCount = extractedData.components?.length || 0;
      voiceAppCommandBus.sendVoiceFeedback('documentsExtracted', {
        filesCount: selectedFiles.length,
        fileNames: selectedFiles.map(f => f.name),
        componentCount,
        documentTypes: extractedData.documentTypes || [],
        success: true
      });

      console.log('✅ Step 1 complete: Extraction successful');

      // Navigate to Step 2 (Requirements) with extracted data
      onNext();

    } catch (error: any) {
      console.error('❌ Extraction failed:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to extract documents';
      setExtractionError(errorMessage);

      voiceAppCommandBus.sendVoiceFeedback('extractionFailed', {
        error: errorMessage
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card size="large">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark-slate-gray mb-2">
            Step 1: Upload Your Documents
          </h2>
          <p className="text-medium-gray">
            Upload BOMs, designs, specs, or any procurement documents (up to 10 files)
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            {...getRootProps()}
            className={`
              upload-area
              ${isDragActive ? 'upload-area-active' : ''}
              ${selectedFiles.length > 0 ? 'border-green-300 bg-green-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              {selectedFiles.length > 0 ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <FileIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} Selected
                    </h3>
                    <p className="text-sm text-green-600">
                      Click or drag to add more (max 10 files)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-medium-gray mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-dark-slate-gray">
                      {isDragActive ? 'Drop your files here' : 'Upload Documents'}
                    </h3>
                    <p className="text-medium-gray">
                      Drag & drop files here, or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Supported File Types */}
          <div className="mt-4 text-center">
            <p className="text-sm text-medium-gray">
              Supported: Images, PDFs, Excel, CSV, Word, CAD (DWG, DXF), SolidWorks, ZIP archives
            </p>
            <p className="text-xs text-medium-gray mt-1">
              Up to 10 files, 50MB each
            </p>
          </div>
        </div>

        {/* Extraction Error */}
        {extractionError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Extraction Failed</h4>
                <p className="text-sm text-red-700 mt-1">{extractionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Extraction Loading */}
        {isExtracting && (
          <div className="mb-6">
            <Loading message="Understanding documents..." size="md" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={onCancel}
            variant="secondary"
            disabled={isExtracting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleNext}
            disabled={selectedFiles.length === 0 || isExtracting}
            loading={isExtracting}
          >
            {isExtracting ? 'Extracting...' : 'Next: Requirements →'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UploadDocuments;
