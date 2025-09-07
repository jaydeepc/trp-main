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
import Step1DefineRequirement from '../components/forms/Step1DefineRequirement';
import Step2SmartBOMReview from '../components/forms/Step2SmartBOMReview';
import Step3CommercialTerms from '../components/forms/Step3CommercialTerms';
import Step4PreviewRFQ from '../components/forms/Step4PreviewRFQ';

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
      dispatch(setCurrentStep(step));
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
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
        return <FileText className="w-5 h-5" />;
      case 3:
        return <Settings className="w-5 h-5" />;
      case 4:
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
                  {currentRFQ.rfqNumber} • Step {currentStep} of 4
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
