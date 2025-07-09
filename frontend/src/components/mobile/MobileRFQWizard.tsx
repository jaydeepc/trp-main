import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Settings, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { useRFQ } from '../../context/RFQContext';
import { StepConfig } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import Step1DefineRequirement from '../forms/Step1DefineRequirement';
import Step2SmartBOMReview from '../forms/Step2SmartBOMReview';
import Step3CommercialTerms from '../forms/Step3CommercialTerms';
import Step4PreviewRFQ from '../forms/Step4PreviewRFQ';

interface MobileRFQWizardProps {
  rfqId: string;
  onBackToDashboard: () => void;
}

const MobileRFQWizard: React.FC<MobileRFQWizardProps> = ({ rfqId, onBackToDashboard }) => {
  const { currentRFQ, loading, error, fetchRFQ } = useRFQ();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (rfqId) {
      fetchRFQ(rfqId);
    }
  }, [rfqId, fetchRFQ]);

  useEffect(() => {
    if (currentRFQ) {
      setCurrentStep(currentRFQ.currentStep || 1);
    }
  }, [currentRFQ]);

  const steps: StepConfig[] = [
    {
      number: 1,
      title: 'Define Requirement',
      description: 'Upload documents',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
      isAccessible: true,
    },
    {
      number: 2,
      title: 'Smart BoM Review',
      description: 'Review AI insights',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
      isAccessible: currentStep >= 2,
    },
    {
      number: 3,
      title: 'Commercial Terms',
      description: 'Define terms',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
      isAccessible: currentStep >= 3,
    },
    {
      number: 4,
      title: 'Preview & Send',
      description: 'Final review',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4,
      isAccessible: currentStep >= 4,
    },
  ];

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <Upload className="w-4 h-4" />;
      case 2:
        return <FileText className="w-4 h-4" />;
      case 3:
        return <Settings className="w-4 h-4" />;
      case 4:
        return <Eye className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading.isLoading && !currentRFQ) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loading message={loading.message} size="lg" />
      </div>
    );
  }

  if (error.hasError) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-surface-600 mb-6">{error.message}</p>
          <Button onClick={onBackToDashboard} variant="outline">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentRFQ) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-surface-900 mb-4">RFQ Not Found</h2>
          <p className="text-surface-600 mb-6">The requested RFQ could not be found.</p>
          <Button onClick={onBackToDashboard} variant="outline">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    if (!currentRFQ) {
      return (
        <div className="text-center py-12">
          <p className="text-surface-600">Loading RFQ data...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1DefineRequirement
            rfq={currentRFQ}
            onNext={handleNextStep}
            onCancel={onBackToDashboard}
          />
        );

      case 2:
        return (
          <Step2SmartBOMReview
            rfq={currentRFQ}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 3:
        return (
          <Step3CommercialTerms
            rfq={currentRFQ}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 4:
        return (
          <Step4PreviewRFQ
            rfq={currentRFQ}
            onPrevious={handlePreviousStep}
            onComplete={onBackToDashboard}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-surface-600">Invalid step: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              onClick={onBackToDashboard}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-surface-900">Smart RFQ</h1>
              <p className="text-xs text-surface-600">
                {currentRFQ.rfqNumber} • Step {currentStep} of 4
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-surface-600" />
          </button>
        </div>
      </header>

      {/* Mobile Progress Indicator */}
      <div className="bg-white border-b border-surface-200">
        <div className="px-4 py-4">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-900">
              {steps[currentStep - 1]?.title}
            </span>
            <span className="text-sm text-surface-600">
              {currentStep}/4
            </span>
          </div>
          <div className="w-full bg-surface-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          
          {/* Step Description */}
          <p className="text-sm text-surface-600 mt-2">
            {steps[currentStep - 1]?.description}
          </p>
        </div>

        {/* Horizontal Step Indicators */}
        <div className="flex items-center justify-between px-4 pb-4">
          {steps.map((step, index) => (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              disabled={!step.isAccessible}
              className={`flex flex-col items-center space-y-1 ${
                step.isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step.isCompleted
                  ? 'bg-emerald-500 text-white'
                  : step.isActive
                  ? 'bg-primary-600 text-white'
                  : step.isAccessible
                  ? 'bg-surface-200 text-surface-600 hover:bg-surface-300'
                  : 'bg-surface-100 text-surface-400'
              }`}>
                {step.isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  getStepIcon(step.number)
                )}
              </div>
              <span className={`text-xs font-medium ${
                step.isActive ? 'text-primary-600' : 'text-surface-600'
              }`}>
                {step.number}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {loading.isLoading && (
          <div className="mb-6">
            <Loading message={loading.message} progress={loading.progress} />
          </div>
        )}
        
        {error.hasError && (
          <div className="mb-6">
            <Card className="border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error.message}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {renderStepContent()}
      </div>

      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePreviousStep}
            variant="outline"
            disabled={currentStep === 1 || loading.isLoading}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`w-2 h-2 rounded-full ${
                  step.isCompleted
                    ? 'bg-emerald-500'
                    : step.isActive
                    ? 'bg-primary-600'
                    : 'bg-surface-300'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={currentStep === 4 ? onBackToDashboard : handleNextStep}
            disabled={loading.isLoading}
            className="flex items-center space-x-2"
          >
            <span>{currentStep === 4 ? 'Complete' : 'Next'}</span>
            {currentStep !== 4 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileRFQWizard;
