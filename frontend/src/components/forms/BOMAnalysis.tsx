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
    if (!currentComponent || !currentComponent.suppliers || currentComponent.suppliers.length === 0) {
      return [];
    }

    return currentComponent.suppliers.map((supplier: any, index: number) => ({
      id: `sup-${index}`,
      name: supplier.name,
      cost: supplier.pricing?.unitCost || 0,
      trustScore: supplier.reliability?.trustScore || 0,
      category: supplier.reliability?.trustScore >= 9.0 ? 'trusted' as const :
        supplier.reliability?.trustScore >= 8.0 ? 'empanelled' as const :
          'new' as const,
      region: supplier.location || 'Unknown',
      certifications: supplier.certifications || [],
      riskLevel: supplier.reliability?.trustScore >= 9.0 ? 'Low' as const :
        supplier.reliability?.trustScore >= 8.0 ? 'Medium' as const :
          'High' as const,
    }));
  }, [currentComponent]);

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
                const optionId = option.isOriginal ? 'original' : (option.id || option._id || index.toString());
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
      {transformedSuppliers.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">

          <SupplierTrustGraph
            componentName={currentComponent.name}
            suppliers={transformedSuppliers}
            className="border-0 shadow-none"
          />

          {/* Info about supplier selection */}
          <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">Supplier Selection Coming Soon</p>
                <p className="text-blue-700">
                  You'll be able to select specific suppliers from the graph for each component.
                  For now, review the trust vs cost analysis to understand your options.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
