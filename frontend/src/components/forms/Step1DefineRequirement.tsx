import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Zap, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { RFQ } from '../../types';
import { useRFQ } from '../../contexts/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';

interface Step1DefineRequirementProps {
  rfq: RFQ;
  onNext: () => void;
  onCancel: () => void;
}

const Step1DefineRequirement: React.FC<Step1DefineRequirementProps> = ({
  rfq,
  onNext,
  onCancel,
}) => {
  const { processDocument, loading } = useRFQ();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldAutoProcess, setShouldAutoProcess] = useState(false);

  const { isVoiceInitialized, sendText } = useSelector((state: RootState) => state.voice);

  // Auto-process when voice upload is ready
  useEffect(() => {
    if (shouldAutoProcess && selectedFile && !loading.isLoading) {
      console.log('🎙️ Auto-processing voice upload:', selectedFile.name);
      handleProcessDocument();
      setShouldAutoProcess(false);
    }
  }, [shouldAutoProcess, selectedFile, loading.isLoading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);

      // Auto-process if voice initiated the upload
      if (isVoiceInitialized && sendText) {
        console.log('🎙️ Voice-initiated upload detected - will auto-process...');

        // Send feedback to AI about the upload
        setTimeout(() => {
          sendText(`Context Update: User has uploaded the following files and these are ready for analysis:
${acceptedFiles.map(file => `- ${file.name} (${file.type})`).join('\n')}

The analysis is starting automatically. Please wait for the results.`);
        }, 500);

        setShouldAutoProcess(true);
      }
    }
  }, [isVoiceInitialized, sendText]);

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
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleProcessDocument = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);

      console.log('🔄 Starting document processing...', selectedFile.name);

      // Make actual API call to backend
      const result = await processDocument(rfq.id, selectedFile);

      console.log('✅ Document processing completed');

      // Send comprehensive voice feedback if available
      if (isVoiceInitialized && sendText && result.summary) {
        console.log('🎙️ Sending comprehensive analysis summary to voice...');
        setTimeout(() => {
          sendText(result.summary!);
        }, 500);
      }

      // API completed - move to next step immediately
      setIsProcessing(false);
      onNext();
    } catch (error) {
      console.error('❌ Error processing document:', error);
      setIsProcessing(false);
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
    <div className="max-w-4xl mx-auto">
      <Card size="large">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark-slate-gray mb-2">
            Start Your Smart RFQ: Define Requirement
          </h2>
          <p className="text-medium-gray">
            Upload your design files, BoM spreadsheets, or ZBC reports to begin the AI-powered analysis
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            {...getRootProps()}
            className={`
              upload-area
              ${isDragActive ? 'upload-area-active' : ''}
              ${selectedFile ? 'border-green-300 bg-green-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              {selectedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      File Selected
                    </h3>
                    <p className="text-green-600 font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-medium-gray mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-dark-slate-gray">
                      {isDragActive ? 'Drop your file here' : 'Upload CAD/BoM File'}
                    </h3>
                    <p className="text-medium-gray">
                      Drag & drop your file here, or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supported File Types */}
          <div className="mt-4 text-center">
            <p className="text-sm text-medium-gray">
              Supported formats: STEP, DXF, IGES, XLSX, CSV, PDF (max 50MB)
            </p>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={onCancel}
            variant="secondary"
            disabled={loading.isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleProcessDocument}
            disabled={!selectedFile || isProcessing}
            loading={isProcessing}
          >
            Process Document & Continue
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-blue-800 mb-1">
                How it works
              </h4>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>Engineering Design:</strong> Upload CAD files to generate ZBC from scratch</li>
                <li>• <strong>ZBC Reports:</strong> Upload existing cost analysis reports to extract data</li>
                <li>• <strong>BoM Files:</strong> Upload spreadsheets to enhance with AI insights</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Processing Overlay with Blurred Background */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-accent-teal animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-dark-slate-gray mb-2">
                  Analyzing BOM
                </h3>
                <p className="text-medium-gray">
                  Processing your document with AI analysis...
                </p>
                {selectedFile && (
                  <p className="text-sm text-accent-teal mt-2 font-medium">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1DefineRequirement;
