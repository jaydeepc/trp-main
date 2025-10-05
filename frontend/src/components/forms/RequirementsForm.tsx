import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setLeadTime,
  addComplianceRequirement,
  removeComplianceRequirement,
  setAdditionalRequirements,
  setSupplierPriority,
  setRFQData
} from '../../store/rfqSlice';
import { Shield, Calendar, Plus, Info, X, AlertTriangle, Sparkles, Clock, MessageCircle, Target, TrendingUp, DollarSign, Award, Users, HeadphonesIcon, GripVertical } from 'lucide-react';
import Button from '../common/Button';
import { voiceAppCommandBus } from '../../services/VoiceAppCommandBus';
import api from '../../services/api';
import Card from '../common/Card';

interface RequirementsFormProps {
  rfq: any;
  onNext: () => void;
  onBack: () => void;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({ rfq, onNext, onBack }) => {
  const dispatch = useDispatch();
  const { commercialTerms } = useSelector((state: RootState) => state.rfq);
  const { sendText } = useSelector((state: RootState) => state.voice);

  const [localCompliance, setLocalCompliance] = useState<string[]>(commercialTerms.complianceRequirements);
  const [localLeadTime, setLocalLeadTime] = useState(commercialTerms.desiredLeadTime);
  const [localAdditional, setLocalAdditional] = useState(commercialTerms.additionalRequirements);
  // Icon mapping for priority items (can't serialize React components to Redux)
  const priorityIcons = {
    quality: Award,
    price: DollarSign,
    reliability: Target,
    established: Users,
    support: HeadphonesIcon,
    warranty: Shield
  };

  const [priorityRanking, setPriorityRanking] = useState<Array<{ id: string, name: string, description: string, iconName: string }>>([
    { id: 'quality', name: 'Quality', description: 'Product quality and reliability', iconName: 'quality' },
    { id: 'price', name: 'Price', description: 'Cost competitiveness', iconName: 'price' },
    { id: 'reliability', name: 'Reliability', description: 'Supplier track record', iconName: 'reliability' },
    { id: 'established-company', name: 'Established Company', description: 'Company reputation and stability', iconName: 'established' },
    { id: 'support', name: 'Support', description: 'Customer service and technical support', iconName: 'support' },
    { id: 'returns-warranty', name: 'Returns & Warranty', description: 'Return policy and warranty coverage', iconName: 'warranty' }
  ]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const extractedData = useSelector((state: RootState) => state.rfq.extractedData);

  // Sync local state with Redux when Redux changes (e.g., from voice commands)
  useEffect(() => {
    setLocalLeadTime(commercialTerms.desiredLeadTime);
  }, [commercialTerms.desiredLeadTime]);

  useEffect(() => {
    setLocalCompliance(commercialTerms.complianceRequirements);
  }, [commercialTerms.complianceRequirements]);

  useEffect(() => {
    setLocalAdditional(commercialTerms.additionalRequirements);
  }, [commercialTerms.additionalRequirements]);

  useEffect(() => {
    // Initialize priority ranking from Redux if available
    if (commercialTerms.supplierPriority) {
      try {
        const savedRanking = JSON.parse(commercialTerms.supplierPriority);
        if (Array.isArray(savedRanking) && savedRanking.length > 0) {
          setPriorityRanking(savedRanking);
        }
      } catch (e) {
        // If parsing fails, keep default ranking
      }
    }
  }, [commercialTerms.supplierPriority]);

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

  // Priority ranking options for drag and drop - solid colors with decreasing intensity
  const getPriorityColor = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-green-600 to-blue-600 opacity-100',     // 1st priority - highest intensity
      'bg-gradient-to-r from-green-600 to-blue-600 opacity-[0.95]',      // 2nd priority - high intensity
      'bg-gradient-to-r from-green-600 to-blue-600 opacity-90',      // 3rd priority - accent color
      'bg-gradient-to-r from-green-600 to-blue-600 opacity-[0.85]',      // 4th priority - lighter accent
      'bg-gradient-to-r from-green-600 to-blue-600 opacity-80',      // 5th priority - lighter blue
      'bg-gradient-to-r from-green-600 to-blue-600 opacity-[0.75]'       // 6th priority - neutral
    ];
    return colors[index] || 'bg-gray-400';
  };

  const getPriorityLabel = (index: number) => {
    const labels = ['Highest Priority', '2nd Priority', '3rd Priority', '4th Priority', '5th Priority', 'Lowest Priority'];
    return labels[index] || `${index + 1}th Priority`;
  };

  useEffect(() => {
    console.log('📡 RequirementsForm: Registering voice commands with CommandBus');

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

    voiceAppCommandBus.registerAppCommand('getRequirements', async () => {
      return {
        success: true,
        data: {
          compliance: localCompliance,
          leadTime: localLeadTime,
          additionalRequirements: localAdditional
        }
      };
    });

    voiceAppCommandBus.registerAppCommand('setPriorityRanking', async (params: any) => {
      const ranking = params?.ranking;
      if (ranking && Array.isArray(ranking)) {
        setPriorityRanking(ranking);
        dispatch(setSupplierPriority(JSON.stringify(ranking)));
        return { success: true, message: 'Priority ranking updated successfully' };
      }
      return { success: false, message: 'Invalid priority ranking' };
    });

    voiceAppCommandBus.registerAppCommand('analyzeBOM', async () => {
      console.log('📡 Voice Command: analyzeBOM triggered');
      if (!localLeadTime) {
        return {
          success: false,
          message: 'Please fill in the required lead time field before triggering analysis'
        };
      }
      // Trigger the analysis by calling handleNext
      handleNext();
      return {
        success: true,
        message: 'BOM analysis triggered successfully'
      };
    });

    voiceAppCommandBus.updateContext('currentStep', 2);
    voiceAppCommandBus.updateContext('requirements', {
      compliance: localCompliance,
      leadTime: localLeadTime,
      priorityRanking: priorityRanking
    });

    return () => {
      console.log('📡 RequirementsForm: Unregistering voice commands');
      voiceAppCommandBus.unregisterAppCommand('addCompliance');
      voiceAppCommandBus.unregisterAppCommand('removeCompliance');
      voiceAppCommandBus.unregisterAppCommand('setLeadTime');
      voiceAppCommandBus.unregisterAppCommand('getRequirements');
      voiceAppCommandBus.unregisterAppCommand('setPriorityRanking');
      voiceAppCommandBus.unregisterAppCommand('analyzeBOM');
    };
  }, [localCompliance, localLeadTime, localAdditional, priorityRanking, dispatch]);

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

    // Inform Gemini about the selection
    if (sendText) {
      const action = newCompliance.includes(complianceValue) ? 'selected' : 'removed';
      const currentList = newCompliance.length > 0 ? newCompliance.join(', ') : 'None';
      sendText(`User ${action} ${complianceValue} compliance requirement. Current compliance requirements selected: ${currentList}`);
    }
  };

  const handleLeadTimeChange = (value: string) => {
    setLocalLeadTime(value);
    dispatch(setLeadTime(value));
    voiceAppCommandBus.sendVoiceFeedback('leadTimeChanged', { leadTime: value });

    // Inform Gemini about the selection
    if (sendText) {
      sendText(`User selected lead time: ${value}`);
    }
  };

  const handleAdditionalChange = (value: string) => {
    setLocalAdditional(value);
    dispatch(setAdditionalRequirements(value));

    // Inform Gemini about additional requirements (only if non-empty to avoid noise)
    if (sendText && value.trim()) {
      sendText(`User added special requirements: ${value}`);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newRanking = [...priorityRanking];
    const draggedPriority = newRanking[draggedItem];

    // Remove from old position
    newRanking.splice(draggedItem, 1);
    // Insert at new position
    newRanking.splice(dropIndex, 0, draggedPriority);

    setPriorityRanking(newRanking);
    dispatch(setSupplierPriority(JSON.stringify(newRanking)));
    setDraggedItem(null);

    // Send feedback to voice system
    voiceAppCommandBus.sendVoiceFeedback('priorityRanking', {
      ranking: newRanking.map((item, idx) => ({ ...item, rank: idx + 1 }))
    });

    // Inform voice about reordering
    if (sendText) {
      sendText(`User reordered priorities: ${newRanking.map(p => p.name).join(' > ')}`);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleNext = async () => {
    setAttemptedSubmit(true);
    setAnalysisError(null);

    // Check if required fields are filled
    if (!localLeadTime) {
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('💾 Saving requirements first...');

      // Transform supplier priority from array objects to just IDs
      const supplierPriorityIds = priorityRanking.map(item => item.id);

      // Save requirements to database first
      await api.updateRequirements(rfq.id, {
        supplierPriority: supplierPriorityIds,
        complianceRequirements: localCompliance,
        desiredLeadTime: localLeadTime,
        additionalRequirements: localAdditional
      });

      console.log('✅ Requirements saved. Now triggering supplier research...');

      // Call supplier research API
      const result = await api.generateSupplierResearch(rfq.id);

      console.log('✅ Supplier research complete:', result);

      // Transform supplier research data to match UI expectations
      const transformedComponents = (result.supplierResearch || []).map((item: any, index: number) => ({
        id: `${index + 1}`,
        partName: item.partName || 'Unknown',
        partNumber: item.baselineAnalysis?.manufacturer || `PART-${index + 1}`,
        quantity: item.quantity || 1,
        material: item.baselineAnalysis?.primaryCategory || 'Unknown',
        unitCost: `₹${item.unitCostINR || 0}`,
        totalCost: `₹${item.totalCostINR || 0}`,
        complianceStatus: 'compliant',
        riskFlag: {
          level: item.alternativeSuppliers?.length > 0 ? 'Low' : 'Medium',
          reason: item.alternativeSuppliers?.length > 0 ? 'Multiple suppliers available' : 'Limited supplier options'
        },
        aiSuggestedAlternative: item.baselineAnalysis?.keySpecifications || 'No alternative suggested',
        confidence: 85,
        aiRecommendedRegion: 'India',
        predictedMarketRange: `₹${Math.round(item.unitCostINR * 0.9)} - ₹${Math.round(item.unitCostINR * 1.1)}`,
        zbcShouldCost: `₹${item.unitCostINR}`,
        zbcVariance: '0%',
        zbcSource: item.baselineAnalysis?.sourceURL || 'N/A',
        complianceFlags: [
          { icon: '✓', text: 'Standard compliance' }
        ]
      }));

      // Store transformed supplier research data in Redux
      dispatch(setRFQData({
        components: transformedComponents,
        suppliers: result.summary || {},
        insights: [`Processed ${result.totalComponents} components in ${(result.processingTime / 1000).toFixed(1)}s`]
      }));
      console.log('📊 Redux: Stored supplier research data -', transformedComponents.length, 'components');

      // Send detailed summary to voice using Redux sendText
      if (sendText && transformedComponents) {
        const totalComponents = transformedComponents.length;
        const complianceStr = localCompliance.length > 0
          ? localCompliance.join(', ')
          : 'No specific compliance requirements';

        const summaryMessage = `Supplier research complete! I've analyzed ${totalComponents} components with your requirements:
• Compliance: ${complianceStr}
• Lead time: ${localLeadTime}

The analyzed components include supplier recommendations, cost data, and compliance status. You can now review the detailed BOM analysis in the next step.

Data:
${JSON.stringify({
          components: transformedComponents,
          summary: result.summary || {},
          processingTime: result.processingTime,
          totalComponents: result.totalComponents
        })}`;

        console.log('🎙️ Sending voice summary via Redux sendText');
        sendText(summaryMessage);
      }

      voiceAppCommandBus.sendVoiceFeedback('step2Complete', {
        complianceCount: localCompliance.length,
        hasLeadTime: !!localLeadTime,
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

  const isValid = localLeadTime;

  return (
    <div className="space-y-8">
      {/* Document Extraction Results */}
      {extractedData && extractedData.components && extractedData.components.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Extracted Components</h3>
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-100">
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 w-16">#</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[120px]">Part Number</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[180px]">Component Name</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[200px]">Description</th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 w-20">Qty</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-300 min-w-[150px]">Specifications</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[140px]">ZBC Analysis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.components.map((component, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-blue-50/50 transition-all duration-150 border-b border-slate-300"
                      >
                        <td className="px-4 py-4 text-sm text-slate-500 font-medium group-hover:text-blue-600 border-r border-slate-300">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-4 border-r border-slate-300">
                          <span className="text-sm font-mono text-blue-600">
                            {component.partNumber || <span className="text-gray-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-r border-slate-300">
                          <span className="text-sm font-semibold text-gray-900">
                            {component.name || component.partName || <span className="text-gray-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-r border-slate-300">
                          <span className="text-sm text-gray-700">
                            {component.description || <span className="text-gray-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-slate-300">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-100 text-sm font-medium text-gray-900">
                            {component.quantity || <span className="text-gray-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-r border-slate-300">
                          <span className="text-xs text-gray-600">
                            {component.specifications || <span className="text-gray-400">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {component.zbc ? (
                            <div className="space-y-1">
                              {component.zbc.shouldCost && (
                                <div className="text-xs font-medium text-green-600">
                                  ${component.zbc.shouldCost.toFixed(2)}
                                </div>
                              )}
                              {component.zbc.variance && (
                                <div className="text-xs text-gray-600">
                                  {component.zbc.variance}
                                </div>
                              )}
                              {component.zbc.confidence && (
                                <div className="text-xs text-blue-600">
                                  {component.zbc.confidence}% confidence
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
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
        </div>
      )}

      {/* Requirements Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Define Your Requirements</h3>

        {/* Robbie's Smart Suggestions - Enhanced with Personality */}
        <div className={`mb-12 transition-all duration-700 delay-700 translate-y-0 opacity-100`}>
          <div className="relative">
            <Card className="bg-gradient-to-br from-blue-50 via-primary-50 to-accent-50 border-2 border-primary-200 hover:border-primary-300 transition-all duration-300 p-6 shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-5">
                {/* Robbie Avatar with Personality */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 flex justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-surface-900">Discuss your requirements details with Robbie!</h3>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      // onClick={onCreateRFQ}
                      className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Yes, let's do it!
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Supplier Priority Ranking */}
        <div>
          <label className="mt-8 flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
            <Target className="w-5 h-5 text-accent-teal" />
            <span>Rank Your Priorities</span>
          </label>

          <p className="text-medium-gray mb-6">
            Drag and drop to rank what matters most when selecting suppliers.
          </p>

          {/* Drag and Drop Priority Ranking */}
          <div className="space-y-3">
            {priorityRanking.map((priority, index) => {
              const IconComponent = priorityIcons[priority.iconName as keyof typeof priorityIcons] || Target; // Fallback to Target icon
              const isDragging = draggedItem === index;

              return (
                <div
                  key={priority.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    relative flex items-center p-4 bg-white rounded-xl border-2 cursor-move transition-all duration-200
                    ${isDragging
                      ? 'opacity-50 shadow-2xl border-accent-teal'
                      : 'hover:shadow-lg border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Drag Handle */}
                  <div className="mr-4 text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Priority Rank Badge */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold mr-4
                    ${getPriorityColor(index)}
                  `}>
                    {index + 1}
                  </div>

                  {/* Priority Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{priority.name}</h4>
                    <p className="text-sm text-gray-600">{priority.description}</p>
                  </div>

                  {/* Priority Label */}
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-500">
                      {getPriorityLabel(index)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Priority Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-accent-teal/5 to-blue-50/50 rounded-xl border border-accent-teal/20">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-accent-teal mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Your Priority Ranking</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Based on your ranking, suppliers will be evaluated in this order:
                </p>
                <div className="flex flex-wrap gap-2">
                  {priorityRanking.slice(0, 3).map((priority, index) => (
                    <span
                      key={priority.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-300`}
                    >
                      {index + 1}. {priority.name}
                    </span>
                  ))}
                  {priorityRanking.length > 3 && (
                    <span className="text-xs text-gray-500 py-1">
                      +{priorityRanking.length - 3} more...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Requirements */}
        <div>
          <label className="mt-6 flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
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
                    p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]
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
          <label className="mt-6 flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
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

        {/* Additional Requirements */}
        <div>
          <label className="mt-6 flex items-center space-x-2 text-lg font-semibold text-dark-slate-gray mb-4">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 max-w-lg mx-4 shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Animated Logo/Icon */}
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-20 animate-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Supplier Research</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Robbie is performing comprehensive analysis to find the best suppliers and optimize your procurement strategy.
              </p>

              {/* Progress Steps */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Analyzing component specifications</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 animate-pulse"></div>
                  <span className="text-gray-700">Finding relevant suppliers</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0 animate-pulse"></div>
                  <span className="text-gray-700">Researching alternative materials</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-500">Calculating best possible suppliers</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse"
                  style={{ width: '45%' }}></div>
              </div>

              <p className="text-xs text-gray-500">
                This comprehensive analysis takes 2-3 minutes
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

      {/* Conversational Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="ghost"
          disabled={isAnalyzing}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isValid || isAnalyzing}
          loading={isAnalyzing}
          className="bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Researching Suppliers...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>Analyze Requirements</span>
            </div>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200">
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
    </div>
  );
};

export default RequirementsForm;
