import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCurrentStep } from '../store/rfqSlice';
import { ArrowLeft, Upload, FileText, Settings, Eye } from 'lucide-react';
import { useRFQ } from '../contexts/RFQContext';
import { StepConfig } from '../types';
import StepIndicator from '../components/common/StepIndicator';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import UploadDocuments from '../components/forms/UploadDocuments';
import RequirementsForm from '../components/forms/RequirementsForm';
import BOMAnalysis from '../components/forms/BOMAnalysis';
import Step3CommercialTerms from '../components/forms/Step3CommercialTerms';
import RFQPreview from '../components/forms/RFQPreview';

interface RFQWizardProps {
  rfqId?: string;
  onBackToDashboard: () => void;
}

const RFQWizard: React.FC<RFQWizardProps> = ({ rfqId, onBackToDashboard }) => {
  const dispatch = useDispatch();

  const currentStep = useSelector((state: RootState) => state.rfq.currentStep);

  const { currentRFQ, loading, error, fetchRFQ } = useRFQ();

  useEffect(() => {
    if (rfqId && rfqId !== 'new') {
      fetchRFQ(rfqId);
    }
  }, [rfqId, fetchRFQ]);

  const steps: StepConfig[] = [
    {
      number: 1,
      title: 'Upload Documents',
      description: 'Upload BOMs & specs',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
      isAccessible: true,
    },
    {
      number: 2,
      title: 'Requirements',
      description: 'Define requirements',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
      isAccessible: currentStep >= 2,
    },
    {
      number: 3,
      title: 'BOM Analysis',
      description: 'Review Smart BOM',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
      isAccessible: currentStep >= 3,
    },
    {
      number: 4,
      title: 'Commercial Terms',
      description: 'Define terms',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4,
      isAccessible: currentStep >= 4,
    },
    {
      number: 5,
      title: 'Preview & Send',
      description: 'Final review',
      isCompleted: currentStep > 5,
      isActive: currentStep === 5,
      isAccessible: currentStep >= 5,
    },
  ];

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      dispatch(setCurrentStep(step));
    }
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      dispatch(setCurrentStep(currentStep + 1));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <Upload className="w-5 h-5" />;
      case 2:
        return <Settings className="w-5 h-5" />;
      case 3:
        return <FileText className="w-5 h-5" />;
      case 4:
        return <Settings className="w-5 h-5" />;
      case 5:
        return <Eye className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading.isLoading && !currentRFQ) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Loading message={loading.message} size="lg" />
      </div>
    );
  }

  if (error.hasError) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-medium-gray mb-6">{error.message}</p>
          <Button onClick={onBackToDashboard} variant="outline">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentRFQ) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-dark-slate-gray mb-4">RFQ Not Found</h2>
          <p className="text-medium-gray mb-6">The requested RFQ could not be found.</p>
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
          <p className="text-medium-gray">Loading RFQ data...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <UploadDocuments
            rfq={currentRFQ}
            onNext={handleNextStep}
            onCancel={onBackToDashboard}
          />
        );

      case 2:
        return (
          <RequirementsForm
            rfq={currentRFQ}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );

      case 3:
        return (
          <BOMAnalysis
            rfq={currentRFQ}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 4:
        return (
          <Step3CommercialTerms
            rfq={currentRFQ}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 5:
        return (
          <RFQPreview
            rfq={currentRFQ}
            onPrevious={handlePreviousStep}
            onComplete={onBackToDashboard}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-medium-gray">Invalid step: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <div className="bg-white border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBackToDashboard}
                variant="ghost"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary-blue">
                  Smart RFQ Creation
                </h1>
                <p className="text-medium-gray">
                  {currentRFQ.rfqNumber} • Step {currentStep} of 5
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStepIcon(currentStep)}
              <span className="text-sm font-medium text-medium-gray">
                {steps[currentStep - 1]?.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StepIndicator
            steps={steps}
            onStepClick={handleStepClick}
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading.isLoading && (
          <div className="mb-6">
            <Loading message={loading.message} progress={loading.progress} />
          </div>
        )}

        {error.hasError && (
          <div className="mb-6">
            <Card className="border-l-4 border-red-500 bg-red-50">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error.message}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
};

export default RFQWizard;
