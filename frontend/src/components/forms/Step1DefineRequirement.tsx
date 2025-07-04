import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Zap, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { RFQ } from '../../types';
import { useRFQ } from '../../context/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
import AIProcessingAnimation from '../common/AIProcessingAnimation';

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
  const [analysisType, setAnalysisType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAIAnimation, setShowAIAnimation] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      // Auto-detect analysis type based on file
      const fileName = file.name.toLowerCase();
      if (fileName.includes('zbc') || fileName.includes('cost')) {
        setAnalysisType('EXTRACTED_ZBC');
      } else if (fileName.includes('bom') || fileName.includes('bill')) {
        setAnalysisType('BOM_PROCESSING');
      } else if (fileName.includes('.step') || fileName.includes('.dwg') || fileName.includes('.dxf')) {
        setAnalysisType('GENERATED_ZBC');
      } else {
        setAnalysisType('BOM_PROCESSING'); // Default
      }
    }
  }, []);

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
      setUploadProgress(0);
      setShowAIAnimation(true);
      
      // The animation will run for 8 seconds, then call onNext
      // In a real implementation, this would trigger the actual API call
      // For now, we'll simulate the process
    } catch (error) {
      console.error('Error processing document:', error);
      setShowAIAnimation(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowAIAnimation(false);
    onNext();
  };

  const getAnalysisTypeInfo = (type: string) => {
    switch (type) {
      case 'GENERATED_ZBC':
        return {
          title: 'Engineering Design Analysis',
          description: 'Generate Zero-Based Costing from CAD files and engineering drawings',
          icon: <Settings className="w-5 h-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'EXTRACTED_ZBC':
        return {
          title: 'ZBC Report Extraction',
          description: 'Extract existing Zero-Based Cost data from professional reports',
          icon: <Zap className="w-5 h-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        };
      case 'BOM_PROCESSING':
        return {
          title: 'Bill of Materials Processing',
          description: 'Process BoM files and enhance with AI insights',
          icon: <FileText className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      default:
        return {
          title: 'Document Analysis',
          description: 'Analyze uploaded document',
          icon: <FileText className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const analysisInfo = getAnalysisTypeInfo(analysisType);

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

        {/* Analysis Type Selection */}
        {selectedFile && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dark-slate-gray mb-4">
              Analysis Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['GENERATED_ZBC', 'EXTRACTED_ZBC', 'BOM_PROCESSING'].map((type) => {
                const info = getAnalysisTypeInfo(type);
                return (
                  <div
                    key={type}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${analysisType === type
                        ? 'border-accent-teal bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setAnalysisType(type)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${info.bgColor} flex items-center justify-center mb-3`}>
                      <span className={info.color}>{info.icon}</span>
                    </div>
                    <h4 className="font-semibold text-dark-slate-gray mb-1">
                      {info.title}
                    </h4>
                    <p className="text-sm text-medium-gray">
                      {info.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Analysis Info */}
        {selectedFile && analysisType && (
          <div className="mb-8">
            <Card className={`border-l-4 border-accent-teal ${analysisInfo.bgColor}`}>
              <div className="flex items-start space-x-3">
                <span className={analysisInfo.color}>{analysisInfo.icon}</span>
                <div>
                  <h4 className="font-semibold text-dark-slate-gray">
                    {analysisInfo.title}
                  </h4>
                  <p className="text-sm text-medium-gray mt-1">
                    {analysisInfo.description}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-dark-slate-gray">File: </span>
                    <span className="text-medium-gray">{selectedFile.name}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Upload Progress */}
        {loading.isLoading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark-slate-gray">
                {loading.message || 'Processing document...'}
              </span>
              <span className="text-sm text-medium-gray">
                {loading.progress ? `${Math.round(loading.progress)}%` : ''}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${loading.progress || 0}%` }}
              />
            </div>
          </div>
        )}

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
            disabled={!selectedFile || !analysisType || loading.isLoading}
            loading={loading.isLoading}
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

      {/* AI Processing Animation */}
      <AIProcessingAnimation
        isVisible={showAIAnimation}
        fileName={selectedFile?.name}
        onComplete={handleAnimationComplete}
        duration={8000}
      />
    </div>
  );
};

export default Step1DefineRequirement;
