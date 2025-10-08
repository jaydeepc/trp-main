import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, X, File as FileIcon, Sparkles } from 'lucide-react';
import { RFQ } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { voiceAppCommandBus } from '../../services/VoiceAppCommandBus';
import { setUploadedFiles, setAnalysisData } from '../../store/rfqSlice';
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
  const { sendText } = useSelector((state: RootState) => state.voice);
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
      const extractedData = await api.extractDocuments(selectedFiles, rfq.rfqId);

      console.log('✅ Extraction complete:', extractedData);

      // Store file information AND extracted data in Redux
      const fileInfo = selectedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }));

      dispatch(setUploadedFiles(fileInfo));

      // Store extracted data in rfqData.analysisData
      dispatch(setAnalysisData(extractedData));

      // HYBRID: Send feedback to voice about extraction
      const componentCount = extractedData.components?.length || 0;
      voiceAppCommandBus.sendVoiceFeedback('documentsExtracted', {
        filesCount: selectedFiles.length,
        fileNames: selectedFiles.map(f => f.name),
        componentCount,
        documentTypes: extractedData.documentTypes || [],
        success: true
      });

      // Send summary to Gemini via Redux sendText
      if (sendText) {
        const fileNames = selectedFiles.map(f => f.name).join(', ');
        const documentTypesStr = extractedData.documentTypes?.length > 0
          ? extractedData.documentTypes.join(', ')
          : 'procurement documents';

        const summaryMessage = `Document extraction complete! I've processed ${selectedFiles.length} file(s): ${fileNames}

Extracted ${componentCount} component(s) from your ${documentTypesStr}.

Data:
${JSON.stringify({
          files: selectedFiles.map(f => ({ name: f.name, size: f.size })),
          components: extractedData.components || [],
          documentTypes: extractedData.documentTypes || [],
          extractedAt: new Date().toISOString()
        })}

Next, we'll gather your requirements before analyzing these components.`;

        console.log('🎙️ Sending extraction summary via Redux sendText');
        sendText(summaryMessage);
      }

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
    <div className="space-y-8">
      {/* Premium Upload Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Upload your BOM, Requirements, CAD, or design files</h3>
        {/* File Type Badges */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Supported file types:</p>
          <div className="flex flex-wrap gap-2">
            {['PDF', 'Excel', 'Word', 'CSV', 'CAD', 'ZIP'].map((type) => (
              <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-300">
                {type}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Up to 10 files · Max 50 MB each
          </p>
        </div>

        {/* Enhanced Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative group cursor-pointer transition-all duration-300 ease-out
            ${isDragActive
              ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-accent-50 shadow-lg shadow-primary-200/50 scale-102'
              : selectedFiles.length > 0
                ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/50'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50'
            }
            border-2 border-dashed rounded-2xl p-12 text-center
          `}
        >
          <input {...getInputProps()} />

          {/* Upload Content */}
          {selectedFiles.length > 0 ? (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <FileIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Perfect! {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to analyze
                </h3>
                <p className="text-green-600 font-medium mb-2">
                  Drop more files or click to add additional documents
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Robbie is ready to extract intelligent insights!</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`
                w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300
                ${isDragActive
                  ? 'bg-gradient-to-br from-primary-400 to-accent-600 shadow-lg shadow-primary-300/50 scale-110'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-primary-400 group-hover:to-accent-600 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-300/50'
                }
              `}>
                <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragActive || 'group-hover:text-white text-gray-600'} ${isDragActive ? 'text-white' : ''}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDragActive ? 'text-primary-800' : 'text-gray-900 group-hover:text-primary-800'}`}>
                  {isDragActive ? 'Drop your files here!' : 'Drag & drop files or click to browse'}
                </h3>
                <p className={`text-base transition-colors duration-300 ${isDragActive ? 'text-primary-600' : 'text-gray-600'}`}>
                  {isDragActive ? 'Release to upload your documents' : 'I can cross-reference information across documents for better accuracy.'}
                </p>
              </div>

              {/* Visual Enhancement */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Robbie will analyze the documents</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Selected Files ({selectedFiles.length})</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extraction Error */}
      {extractionError && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
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
        <div className="bg-primary-50/80 backdrop-blur-sm border border-primary-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-600 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary-800">Robbie is analyzing your documents...</h4>
              <p className="text-sm text-primary-600 mt-1">This usually takes 15-30 seconds depending on file complexity.</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversational Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onCancel}
          variant="ghost"
          disabled={isExtracting}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Dashboard
        </Button>

        <Button
          onClick={handleNext}
          disabled={selectedFiles.length === 0 || isExtracting}
          loading={isExtracting}
          className="bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isExtracting ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Analyzing Documents...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>Analyze Documents</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadDocuments;
