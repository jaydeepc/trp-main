import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setLeadTime,
  setPaymentTerms,
  setDeliveryLocation,
  addComplianceRequirement,
  removeComplianceRequirement,
  setAdditionalRequirements,
  setRFQData
} from '../../store/rfqSlice';
import { Shield, Calendar, CreditCard, MapPin, Plus, Info, X, ChevronDown, ChevronUp, FileText, CheckCircle, AlertTriangle, File as FileIcon } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { voiceAppCommandBus } from '../../services/VoiceAppCommandBus';
import api from '../../services/api';

interface RequirementsFormProps {
  rfq: any;
  onNext: () => void;
  onBack: () => void;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({ rfq, onNext, onBack }) => {
  const dispatch = useDispatch();
  const { commercialTerms, uploadedFiles } = useSelector((state: RootState) => state.rfq);

  const [localCompliance, setLocalCompliance] = useState<string[]>(commercialTerms.complianceRequirements);
  const [localLeadTime, setLocalLeadTime] = useState(commercialTerms.desiredLeadTime);
  const [localPaymentTerms, setLocalPaymentTerms] = useState(commercialTerms.paymentTerms);
  const [localRegion, setLocalRegion] = useState(commercialTerms.deliveryLocation);
  const [localAdditional, setLocalAdditional] = useState(commercialTerms.additionalRequirements);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const extractedData = useSelector((state: RootState) => state.rfq.extractedData);

  const COMPLIANCE_OPTIONS = [
    { value: 'ISO 9001', label: 'ISO 9001', description: 'Quality Management System' },
    { value: 'RoHS', label: 'RoHS', description: 'Restriction of Hazardous Substances' },
    { value: 'REACH', label: 'REACH', description: 'Chemical Safety Regulation (EU)' },
    { value: 'CE Marking', label: 'CE Marking', description: 'European Conformity' },
    { value: 'UL Listed', label: 'UL Listed', description: 'Underwriters Laboratories Safety' },
    { value: 'FDA', label: 'FDA', description: 'Food and Drug Administration' },
    { value: 'AS9100', label: 'AS9100', description: 'Aerospace Quality Management' },
    { value: 'ISO 14001', label: 'ISO 14001', description: 'Environmental Management' },
    { value: 'OHSAS 18001', label: 'OHSAS 18001', description: 'Occupational Health & Safety' }
  ];

  const LEAD_TIME_PRESETS = [
    '1-2 weeks',
    '2-4 weeks',
    '4-6 weeks',
    '6-8 weeks',
    '8-12 weeks',
    '12+ weeks'
  ];

  const PAYMENT_TERMS_OPTIONS = [
    { value: 'Net 30', label: 'Net 30 Days', description: 'Payment due within 30 days' },
    { value: 'Net 60', label: 'Net 60 Days', description: 'Payment due within 60 days' },
    { value: '2/10 Net 30', label: '2/10 Net 30', description: '2% discount if paid within 10 days' },
    { value: 'Milestone-based', label: 'Milestone-based', description: 'Payment upon milestone completion' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery', description: 'Payment upon delivery' },
    { value: 'Letter of Credit', label: 'Letter of Credit', description: 'Bank-guaranteed payment' }
  ];

  const REGION_OPTIONS = [
    { value: 'North America', label: 'North America', description: 'USA, Canada, Mexico' },
    { value: 'Europe', label: 'Europe', description: 'EU and European countries' },
    { value: 'Asia Pacific', label: 'Asia Pacific', description: 'China, India, Japan, etc.' },
    { value: 'Middle East', label: 'Middle East', description: 'UAE, Saudi Arabia, etc.' },
    { value: 'Latin America', label: 'Latin America', description: 'Brazil, Argentina, etc.' },
    { value: 'Global', label: 'Global', description: 'No geographic preference' }
  ];

  useEffect(() => {
    console.log(' RequirementsForm: Registering voice commands with CommandBus');

    voiceAppCommandBus.registerAppCommand('addCompliance', async (params: any) => {
      const complianceId = params?.complianceId;
      if (complianceId && !localCompliance.includes(complianceId)) {
        const newCompliance = [...localCompliance, complianceId];
        setLocalCompliance(newCompliance);
        dispatch(addComplianceRequirement(complianceId));
        return { success: true, message: `Added ${complianceId} requirement` };
      }
      return { success: false, message: 'Invalid or duplicate compliance requirement' };
    });

    voiceAppCommandBus.registerAppCommand('removeCompliance', async (params: any) => {
      const complianceId = params?.complianceId;
      if (complianceId && localCompliance.includes(complianceId)) {
        const newCompliance = localCompliance.filter(c => c !== complianceId);
        setLocalCompliance(newCompliance);
        dispatch(removeComplianceRequirement(complianceId));
        return { success: true, message: `Removed ${complianceId} requirement` };
      }
      return { success: false, message: 'Compliance requirement not found' };
    });

    voiceAppCommandBus.registerAppCommand('setLeadTime', async (params: any) => {
      const leadTime = params?.leadTime;
      if (leadTime) {
        setLocalLeadTime(leadTime);
        dispatch(setLeadTime(leadTime));
        return { success: true, message: `Lead time set to ${leadTime}` };
      }
      return { success: false, message: 'Invalid lead time' };
    });

    voiceAppCommandBus.registerAppCommand('setPaymentTerms', async (params: any) => {
      const terms = params?.paymentTerms;
      if (terms) {
        setLocalPaymentTerms(terms);
        dispatch(setPaymentTerms(terms));
        return { success: true, message: `Payment terms set to ${terms}` };
      }
      return { success: false, message: 'Invalid payment terms' };
    });

    voiceAppCommandBus.registerAppCommand('setRegion', async (params: any) => {
      const region = params?.region;
      if (region) {
        setLocalRegion(region);
        dispatch(setDeliveryLocation(region));
        return { success: true, message: `Region set to ${region}` };
      }
      return { success: false, message: 'Invalid region' };
    });

    voiceAppCommandBus.registerAppCommand('getRequirements', async () => {
      return {
        success: true,
        data: {
          compliance: localCompliance,
          leadTime: localLeadTime,
          paymentTerms: localPaymentTerms,
          region: localRegion,
          additionalRequirements: localAdditional
        }
      };
    });

    voiceAppCommandBus.updateContext('currentStep', 2);
    voiceAppCommandBus.updateContext('requirements', {
      compliance: localCompliance,
      leadTime: localLeadTime,
      paymentTerms: localPaymentTerms,
      region: localRegion
    });

    return () => {
      console.log('📡 RequirementsForm: Unregistering voice commands');
      voiceAppCommandBus.unregisterAppCommand('addCompliance');
      voiceAppCommandBus.unregisterAppCommand('removeCompliance');
      voiceAppCommandBus.unregisterAppCommand('setLeadTime');
      voiceAppCommandBus.unregisterAppCommand('setPaymentTerms');
      voiceAppCommandBus.unregisterAppCommand('setRegion');
      voiceAppCommandBus.unregisterAppCommand('getRequirements');
    };
  }, [localCompliance, localLeadTime, localPaymentTerms, localRegion, localAdditional, dispatch]);

  const toggleCompliance = (complianceValue: string) => {
    const newCompliance = localCompliance.includes(complianceValue)
      ? localCompliance.filter(c => c !== complianceValue)
      : [...localCompliance, complianceValue];

    setLocalCompliance(newCompliance);

    if (newCompliance.includes(complianceValue)) {
      dispatch(addComplianceRequirement(complianceValue));
    } else {
      dispatch(removeComplianceRequirement(complianceValue));
    }

    voiceAppCommandBus.sendVoiceFeedback('complianceToggled', {
      complianceValue,
      action: newCompliance.includes(complianceValue) ? 'added' : 'removed',
      totalCount: newCompliance.length
    });
  };

  const handleLeadTimeChange = (value: string) => {
    setLocalLeadTime(value);
    dispatch(setLeadTime(value));
    voiceAppCommandBus.sendVoiceFeedback('leadTimeChanged', { leadTime: value });
  };

  const handlePaymentTermsChange = (value: string) => {
    setLocalPaymentTerms(value);
    dispatch(setPaymentTerms(value));
    voiceAppCommandBus.sendVoiceFeedback('paymentTermsChanged', { paymentTerms: value });
  };

  const handleRegionChange = (value: string) => {
    setLocalRegion(value);
    dispatch(setDeliveryLocation(value));
    voiceAppCommandBus.sendVoiceFeedback('regionChanged', { region: value });
  };

  const handleAdditionalChange = (value: string) => {
    setLocalAdditional(value);
    dispatch(setAdditionalRequirements(value));
  };

  const handleNext = async () => {
    setAttemptedSubmit(true);
    setAnalysisError(null);

    // Check if required fields are filled
    if (!localLeadTime || !localPaymentTerms || !localRegion) {
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('🔄 Triggering supplier research...');

      // Call supplier research API
      const result = await api.generateSupplierResearch(rfq.id);

      console.log('✅ Supplier research complete:', result);

      // Store supplier research data in Redux
      dispatch(setRFQData({
        components: result.supplierResearch || [],
        suppliers: result.summary || {},
        insights: [`Processed ${result.totalComponents} components in ${(result.processingTime / 1000).toFixed(1)}s`]
      }));
      console.log('📊 Redux: Stored supplier research data -', result.supplierResearch?.length, 'components');

      voiceAppCommandBus.sendVoiceFeedback('step2Complete', {
        complianceCount: localCompliance.length,
        hasLeadTime: !!localLeadTime,
        hasPaymentTerms: !!localPaymentTerms,
        hasRegion: !!localRegion,
        supplierResearchComplete: true
      });

      console.log('✅ Step 2 complete: Requirements defined and supplier research completed');
      onNext();

    } catch (error: any) {
      console.error('❌ Supplier research failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate supplier research';
      setAnalysisError(errorMessage);

      voiceAppCommandBus.sendVoiceFeedback('analysisError', {
        error: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isValid = localLeadTime && localPaymentTerms && localRegion;

  return (
    <div className="max-w-5xl mx-auto">
      <Card size="large">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-slate-gray mb-2">
            Define Project Requirements
          </h2>
          <p className="text-medium-gray">
            Specify compliance standards, timeline, payment preferences, and sourcing region.
          </p>
        </div>

        <div className="space-y-8">
          {/* Document Extraction Results */}
          {extractedData && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all">
              <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-blue-900">
                      Uploaded Documents
                    </h3>
                    {uploadedFiles.length > 0 && (
                      <div className="inline-flex items-center py-1 rounded-full text-blue-700 text-sm">
                        <span className="font-semibold">{uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} processed</span>
                      </div>
                    )}
                  </div>
                </div>
                {isAccordionOpen ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {isAccordionOpen && (
                <div className="p-4 rounded-xl space-y-4">
                  {/* Extracted Components - Modern Table */}
                  {extractedData.components && extractedData.components.length > 0 && (
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Extracted Components</h4>
                            <p className="text-sm text-gray-500 mt-0.5">{extractedData.components.length} items • {extractedData.metadata.confidence}% confidence</p>
                          </div>
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✓ Ready
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-slate-100">
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 w-16">#</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[180px]">Part Name</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[250px]">Description</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[150px]">Material</th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 w-20">Qty</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[120px]">Dimensions</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[200px]">Specifications</th>
                              </tr>
                            </thead>
                            <tbody>
                              {extractedData.components.map((component, idx) => (
                                <tr
                                  key={idx}
                                  className="group hover:bg-blue-50/50 transition-all duration-150 border-b border-slate-300"
                                >
                                  <td className="px-4 py-4 text-sm text-slate-500 font-medium group-hover:text-blue-600 border-r border-slate-300">
                                    {component.partNumber || idx + 1}
                                  </td>
                                  <td className="px-4 py-4 border-r border-slate-300">
                                    <span className="text-sm font-semibold text-gray-900">{component.partName}</span>
                                  </td>
                                  <td className="px-4 py-4 border-r border-slate-300">
                                    <span className="text-sm text-gray-700">
                                      {component.description || component.notes || <span className="text-gray-400">—</span>}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 border-r border-slate-300">
                                    <span className="text-sm text-gray-700">
                                      {component.material || <span className="text-gray-400">—</span>}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-center border-r border-slate-300">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-100 text-sm font-medium text-gray-900">
                                      {component.quantity || <span className="text-gray-400">—</span>}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 border-r border-slate-300">
                                    <span className="text-xs text-gray-600">
                                      {component.dimensions || <span className="text-gray-400">—</span>}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="text-xs text-gray-600">
                                      {component.specifications || <span className="text-gray-400">—</span>}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Table Footer */}
                      <div className="px-6 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Total: {extractedData.components.length} components</span>
                          <span className="text-gray-500 text-xs">Automatically extracted from your documents</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Compliance Requirements */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <Shield className="w-5 h-5 text-accent-teal" />
              <span>Compliance Requirements</span>
            </label>

            <p className="text-medium-gray mb-4">
              Select all applicable certifications and standards required for your components.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMPLIANCE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${localCompliance.includes(option.value)
                      ? 'border-accent-teal bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => toggleCompliance(option.value)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5
                      ${localCompliance.includes(option.value)
                        ? 'border-accent-teal bg-accent-teal'
                        : 'border-gray-300'
                      }
                    `}>
                      {localCompliance.includes(option.value) && (
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
          </div>

          {/* Lead Time */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <Calendar className="w-5 h-5 text-accent-teal" />
              <span>Desired Lead Time</span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {LEAD_TIME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleLeadTimeChange(preset)}
                  className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                    ${localLeadTime === preset
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
              value={localLeadTime}
              onChange={(e) => handleLeadTimeChange(e.target.value)}
              placeholder="Or enter custom lead time (e.g., '10-12 weeks')"
              className="input-field"
            />

            {attemptedSubmit && !localLeadTime && (
              <p className="text-sm text-red-600 mt-2">
                Please select or enter a lead time
              </p>
            )}
          </div>

          {/* Payment Terms */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <CreditCard className="w-5 h-5 text-accent-teal" />
              <span>Payment Terms</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_TERMS_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${localPaymentTerms === option.value
                      ? 'border-accent-teal bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handlePaymentTermsChange(option.value)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${localPaymentTerms === option.value
                        ? 'border-accent-teal bg-accent-teal'
                        : 'border-gray-300'
                      }
                    `}>
                      {localPaymentTerms === option.value && (
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

            {attemptedSubmit && !localPaymentTerms && (
              <p className="text-sm text-red-600 mt-2">
                Please select payment terms
              </p>
            )}
          </div>

          {/* Region Preference */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <MapPin className="w-5 h-5 text-accent-teal" />
              <span>Preferred Sourcing Region</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {REGION_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${localRegion === option.value
                      ? 'border-accent-teal bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleRegionChange(option.value)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${localRegion === option.value
                        ? 'border-accent-teal bg-accent-teal'
                        : 'border-gray-300'
                      }
                    `}>
                      {localRegion === option.value && (
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

            <input
              type="text"
              value={localRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              placeholder="Or enter custom region/location (e.g., 'India', 'China')"
              className="input-field"
            />

            {attemptedSubmit && !localRegion && (
              <p className="text-sm text-red-600 mt-2">
                Please select or enter a sourcing region
              </p>
            )}
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
              <Plus className="w-5 h-5 text-accent-teal" />
              <span>Special Requirements (Optional)</span>
            </label>

            <textarea
              value={localAdditional}
              onChange={(e) => handleAdditionalChange(e.target.value)}
              placeholder="Specify any additional requirements, special handling instructions, or custom specifications..."
              className="input-field h-24 resize-none"
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Researching Suppliers</h3>
                <p className="text-gray-600">
                  Processing your components and finding alternative suppliers...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {analysisError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-1">Supplier Research Failed</h4>
                <p className="text-sm text-red-700">{analysisError}</p>
              </div>
              <button
                onClick={() => setAnalysisError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="secondary" disabled={isAnalyzing}>
            Previous
          </Button>

          <Button onClick={handleNext} disabled={!isValid || isAnalyzing}>
            {isAnalyzing ? 'Researching...' : 'Continue to Supplier Research'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-blue-800 mb-1">
                Requirements Guidelines
              </h4>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>Compliance:</strong> Select only certifications that are truly necessary for your project</li>
                <li>• <strong>Lead Time:</strong> Consider manufacturing complexity and supplier capabilities</li>
                <li>• <strong>Payment Terms:</strong> Balance your cash flow needs with supplier preferences</li>
                <li>• <strong>Region:</strong> Regional preferences can affect pricing, lead time, and compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RequirementsForm;
