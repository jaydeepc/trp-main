import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCurrentStep } from '../store/rfqSlice';
import { ArrowLeft, Upload, FileText, Settings, Eye, Bot, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [robbieMessage, setRobbieMessage] = useState('');

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

  const getRobbieMessage = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "👋 Let's create your Smart RFQ!",
          message: "Do you have your BOM or design files ready? Just drop them here — I'll take care of the rest.",
          hint: "I can analyze PDFs, Excel files, Word documents, CAD files, and more!"
        };
      case 2:
        return {
          title: "Great! Now let's define your requirements",
          message: "Based on your uploaded documents, I'll help you specify the technical and commercial requirements.",
          hint: "The more specific you are, the better responses you'll get from suppliers."
        };
      case 3:
        return {
          title: "Time to review the Smart BOM",
          message: "I've analyzed your documents and created an intelligent BOM. Let's review and refine it together.",
          hint: "You can edit quantities, specifications, and add notes for suppliers."
        };
      case 4:
        return {
          title: "Let's set up commercial terms",
          message: "Now we'll define payment terms, delivery schedules, and other commercial conditions.",
          hint: "These terms will be included in your RFQ to suppliers."
        };
      case 5:
        return {
          title: "Almost there! Final review",
          message: "Let's do a final review of your RFQ before sending it to suppliers.",
          hint: "Check all details carefully - this is what suppliers will see."
        };
      default:
        return {
          title: "Let's continue!",
          message: "I'm here to guide you through each step.",
          hint: ""
        };
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

  const robbieContent = getRobbieMessage();

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, rgba(219, 234, 254, 0.8) 0%, rgba(229, 247, 245, 0.6) 100%)
        `,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f83cc' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      {/* Minimal Header with Back Button */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBackToDashboard}
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Progress Ribbon */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${step.isCompleted
                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/30'
                        : step.isActive
                          ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-200/50'
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}
                    onClick={() => handleStepClick(step.number)}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className={`text-sm font-semibold ${step.isActive && "text-white"}`}>{step.number}</span>
                    )}
                  </div>
                  <div className={`hidden sm:block pr-2 ${step.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      hidden sm:block w-8 h-px mx-2 transition-all duration-300
                      ${step.isCompleted ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-200'}
                    `}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with Robbie Conversation Layout */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Content Area (65%) */}
        <div className="col-span-12 lg:col-span-8">
          {/* Robbie's Conversational Greeting */}
          <div className="mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {robbieContent.title}
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  {robbieContent.message}
                </p>
                {robbieContent.hint && (
                  <div className="flex items-center space-x-2 text-sm text-primary-600 bg-primary-50/80 backdrop-blur-sm rounded-xl p-3 border border-primary-200">
                    <Sparkles className="w-4 h-4" />
                    <span>{robbieContent.hint}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading.isLoading && (
            <div className="mb-6">
              <div className="bg-primary-50/80 backdrop-blur-sm border border-primary-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary-800">Robbie is working...</h4>
                    <p className="text-sm text-primary-600 mt-1">{loading.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error.hasError && (
            <div className="mb-6">
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Something went wrong</h4>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQWizard;
