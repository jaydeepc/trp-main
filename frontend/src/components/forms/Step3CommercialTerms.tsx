import React, { useState } from 'react';
import { Calendar, CreditCard, MapPin, Shield, Plus, X, Info } from 'lucide-react';
import { RFQ, CommercialTerms } from '../../types';
import { useRFQ } from '../../contexts/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';

interface Step3CommercialTermsProps {
  rfq: RFQ;
  onNext: () => void;
  onPrevious: () => void;
}

const Step3CommercialTerms: React.FC<Step3CommercialTermsProps> = ({
  rfq,
  onNext,
  onPrevious,
}) => {
  const { updateStep, loading } = useRFQ();

  const [formData, setFormData] = useState<CommercialTerms>({
    desiredLeadTime: rfq.commercialTerms?.desiredLeadTime || '',
    paymentTerms: rfq.commercialTerms?.paymentTerms || 'Net 30',
    deliveryLocation: rfq.commercialTerms?.deliveryLocation || '',
    complianceRequirements: rfq.commercialTerms?.complianceRequirements || [],
    additionalRequirements: rfq.commercialTerms?.additionalRequirements || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentTermsOptions = [
    { value: 'Net 30', label: 'Net 30 Days', description: 'Payment due within 30 days' },
    { value: 'Net 60', label: 'Net 60 Days', description: 'Payment due within 60 days' },
    { value: 'Milestone-based', label: 'Milestone-based', description: 'Payment tied to project milestones' },
    { value: '2/10 Net 30', label: '2/10 Net 30', description: '2% discount if paid within 10 days, otherwise Net 30' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery', description: 'Payment upon delivery' },
    { value: 'Letter of Credit', label: 'Letter of Credit', description: 'Bank-guaranteed payment' },
  ];

  const complianceOptions = [
    { value: 'ISO 9001', label: 'ISO 9001', description: 'Quality Management System' },
    { value: 'AS9100', label: 'AS9100', description: 'Aerospace Quality Management' },
    { value: 'ISO 14001', label: 'ISO 14001', description: 'Environmental Management' },
    { value: 'OHSAS 18001', label: 'OHSAS 18001', description: 'Occupational Health & Safety' },
    { value: 'RoHS', label: 'RoHS', description: 'Restriction of Hazardous Substances' },
    { value: 'REACH', label: 'REACH', description: 'Chemical Safety Regulation' },
    { value: 'FDA', label: 'FDA', description: 'Food and Drug Administration' },
    { value: 'CE Marking', label: 'CE Marking', description: 'European Conformity' },
    { value: 'UL Listed', label: 'UL Listed', description: 'Underwriters Laboratories Safety' },
  ];

  const leadTimePresets = [
    '2-4 weeks',
    '4-6 weeks',
    '6-8 weeks',
    '8-12 weeks',
    '12-16 weeks',
    '16+ weeks',
  ];

  const handleInputChange = (field: keyof CommercialTerms, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleComplianceToggle = (requirement: string) => {
    const current = formData.complianceRequirements;
    const updated = current.includes(requirement)
      ? current.filter(r => r !== requirement)
      : [...current, requirement];

    handleInputChange('complianceRequirements', updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.desiredLeadTime.trim()) {
      newErrors.desiredLeadTime = 'Lead time is required';
    }

    if (!formData.deliveryLocation.trim()) {
      newErrors.deliveryLocation = 'Delivery location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    try {
      await updateStep(rfq.id, 3, formData);
      onNext();
    } catch (error) {
      console.error('Error updating step 3:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card size="large">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-slate-gray mb-2">
            Define Commercial & Compliance Terms
          </h2>
          <p className="text-medium-gray">
            Specify your procurement requirements, payment terms, and compliance needs.
          </p>
        </div>

        <div className="space-y-8">
          {/* Lead Time */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <Calendar className="w-5 h-5 text-accent-teal" />
              <span>Desired Lead Time</span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {leadTimePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleInputChange('desiredLeadTime', preset)}
                  className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                    ${formData.desiredLeadTime === preset
                      ? 'border-accent-teal bg-blue-50 text-primary-blue'
                      : 'border-gray-200 hover:border-gray-300 text-dark-slate-gray'
                    }
                  `}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={formData.desiredLeadTime}
              onChange={(e) => handleInputChange('desiredLeadTime', e.target.value)}
              placeholder="Or enter custom lead time (e.g., '10-12 weeks')"
              className={`input-field ${errors.desiredLeadTime ? 'border-red-500' : ''}`}
            />
            {errors.desiredLeadTime && (
              <p className="text-red-600 text-sm mt-1">{errors.desiredLeadTime}</p>
            )}
          </div>

          {/* Payment Terms */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <CreditCard className="w-5 h-5 text-accent-teal" />
              <span>Payment Terms</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentTermsOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${formData.paymentTerms === option.value
                      ? 'border-accent-teal bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleInputChange('paymentTerms', option.value)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${formData.paymentTerms === option.value
                        ? 'border-accent-teal bg-accent-teal'
                        : 'border-gray-300'
                      }
                    `}>
                      {formData.paymentTerms === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-slate-gray">{option.label}</h4>
                      <p className="text-sm text-medium-gray">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <MapPin className="w-5 h-5 text-accent-teal" />
              <span>Delivery Location</span>
            </label>

            <input
              type="text"
              value={formData.deliveryLocation}
              onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
              placeholder="Enter delivery address or location (e.g., 'San Francisco, CA, USA')"
              className={`input-field ${errors.deliveryLocation ? 'border-red-500' : ''}`}
            />
            {errors.deliveryLocation && (
              <p className="text-red-600 text-sm mt-1">{errors.deliveryLocation}</p>
            )}
          </div>

          {/* Compliance Requirements */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <Shield className="w-5 h-5 text-accent-teal" />
              <span>Compliance Requirements</span>
            </label>

            <p className="text-medium-gray mb-4">
              Select all applicable certifications and compliance standards required for your components.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {complianceOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${formData.complianceRequirements.includes(option.value)
                      ? 'border-accent-teal bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleComplianceToggle(option.value)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5
                      ${formData.complianceRequirements.includes(option.value)
                        ? 'border-accent-teal bg-accent-teal'
                        : 'border-gray-300'
                      }
                    `}>
                      {formData.complianceRequirements.includes(option.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-slate-gray text-sm">{option.label}</h4>
                      <p className="text-xs text-medium-gray">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.complianceRequirements.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Selected Requirements:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.complianceRequirements.map((req) => (
                    <span
                      key={req}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {req}
                      <button
                        onClick={() => handleComplianceToggle(req)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <Plus className="w-5 h-5 text-accent-teal" />
              <span>Additional Requirements (Optional)</span>
            </label>

            <textarea
              value={formData.additionalRequirements}
              onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
              placeholder="Specify any additional requirements, special handling instructions, or custom specifications..."
              className="input-field h-24 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={onPrevious}
            variant="secondary"
            disabled={loading.isLoading}
          >
            Previous
          </Button>

          <Button
            onClick={handleContinue}
            loading={loading.isLoading}
          >
            Continue to Preview
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-blue-800 mb-1">
                Commercial Terms Guidelines
              </h4>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>Lead Time:</strong> Consider manufacturing complexity and supplier capabilities</li>
                <li>• <strong>Payment Terms:</strong> Balance cash flow needs with supplier preferences</li>
                <li>• <strong>Compliance:</strong> Select only requirements that are truly necessary</li>
                <li>• <strong>Delivery:</strong> Specify the exact location for accurate shipping quotes</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step3CommercialTerms;
