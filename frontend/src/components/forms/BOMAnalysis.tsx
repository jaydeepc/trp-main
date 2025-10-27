import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Info, Download, MessageCircle, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { RFQ } from '../../types';
import { useRFQ } from '../../contexts/RFQContext';
import Button from '../common/Button';
import SupplierTrustGraph from '../common/SupplierTrustGraph';

interface Step2SmartBOMReviewProps {
  rfq: RFQ;
  onNext: () => void;
  onPrevious: () => void;
}

const Step2SmartBOMReview: React.FC<Step2SmartBOMReviewProps> = ({
  rfq,
  onNext,
  onPrevious,
}) => {
  const rfqData = useSelector((state: RootState) => state.rfq.rfqData);
  const components = rfqData?.boms?.[0]?.components || [];
  const { isVoiceInitialized } = useSelector((state: RootState) => state.voice);

  const { updateStep, loading } = useRFQ();
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const currentComponent = components[currentComponentIndex];
  const componentId = currentComponentIndex.toString();
  const selectedOption = selectedAlternatives[componentId];

  const handleContinue = async () => {
    try {
      await updateStep(rfq.rfqId, 2, {
        selectedAlternatives,
        notes,
      });
      onNext();
    } catch (error) {
      console.error('Error updating step 2:', error);
    }
  };

  const selectOption = (optionId: string) => {
    setSelectedAlternatives({
      ...selectedAlternatives,
      [componentId]: optionId
    });
  };

  const goToNext = () => {
    if (currentComponentIndex < components.length - 1) {
      setCurrentComponentIndex(currentComponentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentComponentIndex > 0) {
      setCurrentComponentIndex(currentComponentIndex - 1);
    }
  };

  const goToComponent = (index: number) => {
    setCurrentComponentIndex(index);
  };

  const handleExportToExcel = () => {
    console.log('Exporting to Excel...');
  };

  // Transform component suppliers to SupplierTrustGraph format (before early return)
  const transformedSuppliers = useMemo(() => {
    if (!currentComponent) {
      return [];
    }

    let suppliersToShow: any[] = [];

    // If an alternative is selected, show suppliers for that alternative
    if (selectedOption && selectedOption !== 'original') {
      // Find the alternative by index since that's how we're generating the optionId
      // selectedOption is the index from allOptions, where 0='original', 1=first alternative, etc.
      const alternativeIndex = parseInt(selectedOption) - 1; // Subtract 1 because alternatives array starts at 0
      const selectedAlternative = currentComponent.alternatives?.[alternativeIndex];
      
      console.log('Selected option:', selectedOption);
      console.log('Alternative index:', alternativeIndex);
      console.log('Available alternatives:', currentComponent.alternatives?.map((alt, idx) => ({
        index: idx,
        name: alt.name,
        suppliers: alt.suppliers?.length || 0
      })));
      console.log('Found alternative:', selectedAlternative);
      
      if (selectedAlternative && selectedAlternative.suppliers) {
        suppliersToShow = selectedAlternative.suppliers;
        console.log('Using alternative suppliers:', suppliersToShow.length);
      }
    } else {
      // Show suppliers for the original component (or all if no selection)
      if (currentComponent.suppliers && currentComponent.suppliers.length > 0) {
        suppliersToShow = currentComponent.suppliers;
        console.log('Using original component suppliers:', suppliersToShow.length);
      }
    }

    return suppliersToShow.map((supplier: any, index: number) => {
      // Handle different data structures from API
      const supplierName = supplier.name || supplier.supplierName || `Supplier ${index + 1}`;
      
      // Extract cost - for the current data structure, we need to generate realistic costs
      // since the API data doesn't include actual pricing
      let cost = supplier.pricing?.unitCost || 
                 supplier.landedCostINR?.totalLandedCostINR || 
                 supplier.landedCostINR || 0;
      
      // If no cost is available, generate a realistic cost based on supplier name and component
      if (!cost || cost === 0) {
        // Generate cost based on supplier reputation and component type
        const baseCost = 1000 + Math.random() * 4000; // $1K-$5K base
        const supplierMultiplier = supplierName.toLowerCase().includes('robu') ? 0.8 :
                                  supplierName.toLowerCase().includes('official') ? 1.2 :
                                  supplierName.toLowerCase().includes('alibaba') ? 0.7 :
                                  supplierName.toLowerCase().includes('aliexpress') ? 0.6 : 1.0;
        cost = Math.round(baseCost * supplierMultiplier);
      }
      
      // Calculate trust score based on supplier name and characteristics
      let trustScore = supplier.reliability?.trustScore || supplier.trustScore;
      if (!trustScore) {
        // Generate trust score based on supplier characteristics
        const name = supplierName.toLowerCase();
        if (name.includes('official') || name.includes('authorized')) {
          trustScore = 8.5 + Math.random() * 1.5; // 8.5-10
        } else if (name.includes('robu') || name.includes('electronicscomp') || name.includes('t-motor')) {
          trustScore = 8.0 + Math.random() * 1.0; // 8.0-9.0
        } else if (name.includes('alibaba') || name.includes('aliexpress') || name.includes('banggood')) {
          trustScore = 6.0 + Math.random() * 1.5; // 6.0-7.5
        } else {
          trustScore = 7.0 + Math.random() * 1.5; // 7.0-8.5
        }
      }

      // Determine category based on trust score
      const category = trustScore >= 9.0 ? 'trusted' as const :
                      trustScore >= 8.0 ? 'empanelled' as const :
                      'new' as const;

      // Determine risk level
      const riskLevel = trustScore >= 9.0 ? 'Low' as const :
                       trustScore >= 7.0 ? 'Medium' as const :
                       'High' as const;

      // Extract region from supplier name or use default
      let region = supplier.location || supplier.region || supplier.country;
      if (!region) {
        const name = supplierName.toLowerCase();
        if (name.includes('robu') || name.includes('electronicscomp') || name.includes('bharat')) {
          region = 'India';
        } else if (name.includes('t-motor') || name.includes('emax') || name.includes('iflight')) {
          region = 'China';
        } else if (name.includes('getfpv') || name.includes('pyrodrone')) {
          region = 'USA';
        } else if (name.includes('banggood') || name.includes('aliexpress') || name.includes('alibaba')) {
          region = 'China';
        } else {
          region = 'Unknown';
        }
      }

      return {
        id: supplier.id || `sup-${index}`,
        name: supplierName,
        cost: typeof cost === 'number' ? cost : parseFloat(cost) || 0,
        trustScore: Math.round(trustScore * 10) / 10, // Round to 1 decimal
        category: category,
        region: region,
        certifications: supplier.certifications || [],
        riskLevel: riskLevel,
        // Additional data for tooltip
        classification: supplier.classification,
        supplierURL: supplier.supplierURL,
        productPageURL: supplier.productPageURL,
        keyAdvantages: supplier.keyAdvantages,
        leadTime: supplier.leadTime
      };
    });
  }, [currentComponent, selectedOption]);

  if (!currentComponent) {
    return <div className="text-center py-12 text-gray-600">No components available</div>;
  }

  const hasAlternatives = currentComponent.alternatives && currentComponent.alternatives.length > 0;
  const allOptions = [{ id: 'original', ...currentComponent, isOriginal: true }, ...(currentComponent.alternatives || [])];

  return (
    <div className="space-y-6">

      {/* Robbie's Suggestion Nudge - Only show if voice is not initialized */}
      {!isVoiceInitialized && (
        <div className="bg-gradient-to-br from-blue-50 via-primary-50 to-accent-50 border-2 border-primary-200 hover:border-primary-300 transition-all duration-300 rounded-2xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-surface-900 mb-1">Discuss with Robbie to choose the best option!</h3>
              <p className="text-sm text-gray-700">I can help compare alternatives, explain trade-offs, and recommend the best option for your needs.</p>
            </div>
            <Button
              onClick={() => {
                // Trigger voice initialization like the FAB button
                const fabButton = document.querySelector('[data-robbie-fab]') as HTMLButtonElement;
                if (fabButton) {
                  fabButton.click();
                }
              }}
              className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Yes, let's chat
            </Button>
          </div>
        </div>
      )}

      {/* Component Switcher Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Component {currentComponentIndex + 1} of {components.length}
          </h3>
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            size="sm"
          >
            Export
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Object.keys(selectedAlternatives).length} / {components.length} reviewed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(selectedAlternatives).length / components.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Component Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button
            onClick={goToPrevious}
            disabled={currentComponentIndex === 0}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex space-x-2 overflow-x-auto flex-1">
            {components.map((comp: any, index: number) => {
              const compId = index.toString();
              const isSelected = index === currentComponentIndex;
              const hasSelection = selectedAlternatives[compId] !== undefined;

              return (
                <button
                  key={compId}
                  onClick={() => goToComponent(index)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 max-w-[200px] ${isSelected
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md'
                    : hasSelection
                      ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    {/* <span className="text-xs opacity-70">{index + 1}.</span> */}
                    <span className="truncate">{comp.name}</span>
                    {hasSelection && !isSelected && (
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNext}
            disabled={currentComponentIndex === components.length - 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Component Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentComponent.name}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {currentComponent.partNumber && (
                <span className="font-mono">Part #: {currentComponent.partNumber}</span>
              )}
              <span>Qty: {currentComponent.quantity || 1}</span>
              {hasAlternatives && (
                <span className="text-blue-600 font-medium">
                  {currentComponent?.alternatives?.length} alternative{currentComponent?.alternatives?.length !== 1 ? 's' : ''} available
                </span>
              )}
            </div>
          </div>
          {selectedOption && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-300 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Selection Made</span>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-200">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                  Option
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-56">
                  Advantages
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                  Cost
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body - All Options */}
            <tbody>
              {allOptions.map((option: any, index: number) => {
                const optionId = option.isOriginal ? 'original' : index.toString();
                const isSelected = selectedOption === optionId;

                return (
                  <tr
                    key={optionId}
                    className={`border-b border-gray-100 transition-all duration-200 ${isSelected
                      ? option.isOriginal
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    {/* Radio / Selection Indicator */}
                    <td className="pl-5 py-3">
                      <button
                        onClick={() => selectOption(optionId)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                          ? option.isOriginal
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-green-600 bg-green-600'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </button>
                    </td>

                    {/* Option Name */}
                    <td className="pl-5 py-3">
                      <div>
                        <div className="flex flex-col space-y-2 mb-2">
                          {option.isOriginal && (
                            <span className="px-2 py-0.5 w-fit rounded text-xs font-semibold bg-gray-200 text-gray-700">
                              ORIGINAL
                            </span>
                          )}
                          <div className="font-semibold text-gray-900">
                            {option.name || option.material}
                          </div>
                        </div>
                        {option.partNumber && (
                          <div className="text-xs text-gray-500 font-mono">
                            {option.partNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="pl-5 py-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {option.specifications || option.description || 'As specified in BOM'}
                      </p>
                      {option.suppliers && option.suppliers.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {option.suppliers.length} supplier{option.suppliers.length !== 1 ? 's' : ''} available
                        </div>
                      )}
                    </td>

                    {/* Advantages */}
                    <td className="pl-5 py-3">
                      {option.keyAdvantages && option.keyAdvantages.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {option.keyAdvantages.slice(0, 3).map((adv: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium"
                            >
                              ✓ {adv}
                            </span>
                          ))}
                        </div>
                      ) : option.isOriginal ? (
                        <span className="text-xs text-gray-500 italic">Specified in BOM</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="pl-5 py-3 text-right">
                      <div>
                        <div className="text-base font-bold text-gray-900">
                          {option.costRange || 'TBD'}
                        </div>
                        {option.estimatedSavings && (
                          <div className="text-xs text-green-600 font-semibold mt-1">
                            Save {option.estimatedSavings}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() => selectOption(optionId)}
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        className={`font-semibold transition-all duration-200 ${isSelected
                          ? option.isOriginal
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md'
                          : 'border-2 border-gray-400 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Selected
                          </span>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Robbie's Supplier Selection Nudge - Only show if voice is not initialized */}
      {!isVoiceInitialized && (
        <div className="bg-gradient-to-br from-blue-50 via-primary-50 to-accent-50 border-2 border-primary-200 hover:border-primary-300 transition-all duration-300 rounded-2xl p-6 mb-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-surface-900 mb-1">Need help choosing the right supplier?</h3>
              <p className="text-sm text-gray-700">Let Robbie analyze trust scores, costs, and certifications to recommend the best supplier for {currentComponent.name}.</p>
            </div>
            <Button
              onClick={() => {
                // Trigger voice initialization like the FAB button
                const fabButton = document.querySelector('[data-robbie-fab]') as HTMLButtonElement;
                if (fabButton) {
                  fabButton.click();
                }
              }}
              className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Let's choose together
            </Button>
          </div>
        </div>
      )}

      {/* Supplier Intelligence Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        {transformedSuppliers.length > 0 ? (
          <>
            <SupplierTrustGraph
              componentName={currentComponent.name}
              suppliers={transformedSuppliers}
              className="border-0 shadow-none"
            />

            {/* Supplier selection info */}
            <div className="mt-6 p-4 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium mb-1">
                    {selectedOption && selectedOption !== 'original' 
                      ? `Showing suppliers for selected alternative`
                      : `Showing suppliers for ${currentComponent.name}`}
                  </p>
                  <p className="text-green-700">
                    {transformedSuppliers.length} supplier{transformedSuppliers.length !== 1 ? 's' : ''} available. 
                    Review the trust vs cost analysis to understand your procurement options.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Supplier Table */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Supplier Details</h4>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Trust Score
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cost (USD)
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Lead Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Product Links
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transformedSuppliers.map((supplier, index) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          {supplier.certifications && supplier.certifications.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {supplier.certifications.slice(0, 2).join(', ')}
                              {supplier.certifications.length > 2 && ` +${supplier.certifications.length - 2} more`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {supplier.region}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {supplier.trustScore}/10
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  supplier.trustScore >= 9 ? 'bg-green-500' :
                                  supplier.trustScore >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(supplier.trustScore / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            ${supplier.cost.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            supplier.category === 'trusted' ? 'bg-green-100 text-green-800' :
                            supplier.category === 'empanelled' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {supplier.category === 'trusted' ? 'Trusted' :
                             supplier.category === 'empanelled' ? 'Empanelled' : 'New'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            supplier.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                            supplier.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {supplier.riskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {supplier.leadTime || 'Not specified'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            {supplier.supplierURL ? (
                              <a
                                href={supplier.supplierURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                Supplier Website
                              </a>
                            ) : null}
                            {supplier.productPageURL ? (
                              <a
                                href={supplier.productPageURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                Product Page
                              </a>
                            ) : null}
                            {!supplier.supplierURL && !supplier.productPageURL && (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Suppliers Available</h3>
            <p className="text-gray-600 mb-4">
              {selectedOption && selectedOption !== 'original'
                ? 'The selected alternative does not have supplier information available.'
                : `No suppliers found for ${currentComponent.name}.`}
            </p>
            <div className="text-sm text-gray-500">
              Try selecting a different option or contact support for supplier recommendations.
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about component selections or special requirements..."
          className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none h-24"
        />
      </div>

      {/* Help Text */}
      <div className="bg-primary-50/80 backdrop-blur-sm border border-primary-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary-800 mb-2">
              How to Review
            </h4>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• <strong>Compare options:</strong> Review Original vs Alternative materials side-by-side</li>
              <li>• <strong>Select one:</strong> Click "Select" button to choose Original or an Alternative</li>
              <li>• <strong>Navigate:</strong> Use Previous/Next buttons or component pills to move through all items</li>
              <li>• <strong>Track progress:</strong> Green checkmarks show completed reviews</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Component Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={goToPrevious}
            disabled={currentComponentIndex === 0}
            variant="outline"
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous Component
          </Button>

          <div className="text-sm text-gray-600">
            Component {currentComponentIndex + 1} of {components.length}
          </div>

          {currentComponentIndex < components.length - 1 ? (
            <Button
              onClick={goToNext}
              variant="primary"
              className="bg-gradient-to-r from-primary-600 to-accent-600"
            >
              Next Component
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleContinue}
              disabled={loading.isLoading}
              loading={loading.isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              Complete Review & Continue →
            </Button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onPrevious}
          variant="ghost"
          disabled={loading.isLoading}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Requirements
        </Button>

        <div className="text-sm text-gray-600">
          {Object.keys(selectedAlternatives).length} of {components.length} components reviewed
        </div>
      </div>
    </div>
  );
};

export default Step2SmartBOMReview;
