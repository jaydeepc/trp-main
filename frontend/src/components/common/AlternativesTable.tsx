import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Star } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface Alternative {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  specifications: string;
  costRange: string;
  recommendationReason: string;
  keyAdvantages?: string[];
  potentialDrawbacks?: string[];
  suppliers: any[];
}

interface Component {
  partNumber: string;
  name: string;
  description: string;
  specifications: string;
  quantity: number;
  zbc?: {
    shouldCost: number;
    variance?: string;
  };
  alternatives: Alternative[];
}

interface AlternativesTableProps {
  components: Component[];
  onAlternativeSelect?: (componentId: string, alternativeId: string) => void;
  className?: string;
}

const AlternativesTable: React.FC<AlternativesTableProps> = ({
  components,
  onAlternativeSelect,
  className = ""
}) => {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, string>>({});

  const toggleComponentExpansion = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  const handleAlternativeSelect = (componentId: string, alternativeId: string) => {
    setSelectedAlternatives(prev => ({
      ...prev,
      [componentId]: alternativeId
    }));
    onAlternativeSelect?.(componentId, alternativeId);
  };

  const getCostTrendIcon = (costRange: string, originalCost?: number) => {
    if (!originalCost) return null;

    // Extract average cost from range (e.g., "$10 - $15" -> 12.5)
    const costs = costRange.match(/\$(\d+(?:\.\d+)?)/g);
    if (!costs || costs.length < 2) return null;

    const lowCost = parseFloat(costs[0].replace('$', ''));
    const highCost = parseFloat(costs[1].replace('$', ''));
    const avgCost = (lowCost + highCost) / 2;

    if (avgCost < originalCost * 0.9) {
      return <div title="Cost savings potential"><TrendingDown className="w-4 h-4 text-green-600" /></div>;
    } else if (avgCost > originalCost * 1.1) {
      return <div title="Higher cost"><TrendingUp className="w-4 h-4 text-red-600" /></div>;
    }
    return <div className="w-4 h-4" />;
  };

  const getQualityIndicator = (alternative: Alternative) => {
    if (alternative.keyAdvantages?.some(adv => adv.toLowerCase().includes('quality') || adv.toLowerCase().includes('premium'))) {
      return <div title="Premium quality"><Star className="w-4 h-4 text-yellow-500" /></div>;
    }
    return <div title="Standard quality"><CheckCircle className="w-4 h-4 text-green-600" /></div>;
  };

  if (!components || components.length === 0) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alternatives Found</h3>
          <p className="text-gray-600">Run BOM analysis to discover component alternatives.</p>
        </div>
      </Card>
    );
  }

  const componentsWithAlternatives = components.filter(c => c.alternatives && c.alternatives.length > 0);
  const totalAlternatives = componentsWithAlternatives.reduce((total, c) => total + c.alternatives.length, 0);

  return (
    <Card className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark-slate-gray">Component Alternatives</h3>
          <div className="text-sm text-gray-600">
            {componentsWithAlternatives.length} components • {totalAlternatives} alternatives found
          </div>
        </div>
        <p className="text-medium-gray">
          AI-powered alternatives analysis using market intelligence and technical specifications.
        </p>
      </div>

      <div className="space-y-4">
        {componentsWithAlternatives.map((component) => {
          const componentId = component.partNumber || component.name;
          const isExpanded = expandedComponents.has(componentId);

          return (
            <div key={componentId} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Component Header */}
              <div
                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleComponentExpansion(componentId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">{component.name}</h4>
                      <span className="text-sm text-gray-500 font-mono">{component.partNumber}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {component.alternatives.length} alternatives
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {component.zbc?.shouldCost && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-primary-blue">
                          ${component.zbc.shouldCost}
                        </div>
                        <div className="text-xs text-gray-500">Current cost</div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Alternatives List */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="space-y-4">
                    {component.alternatives.map((alternative, index) => (
                      <div
                        key={alternative.id || index}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedAlternatives[componentId] === alternative.id
                          ? 'border-accent-teal bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => handleAlternativeSelect(componentId, alternative.id)}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Selection Radio */}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${selectedAlternatives[componentId] === alternative.id
                            ? 'border-accent-teal bg-accent-teal'
                            : 'border-gray-300'
                            }`}>
                            {selectedAlternatives[componentId] === alternative.id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>

                          {/* Alternative Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h5 className="font-semibold text-gray-900">{alternative.name}</h5>
                                  {alternative.partNumber && (
                                    <span className="text-sm text-gray-500 font-mono">{alternative.partNumber}</span>
                                  )}
                                  {getQualityIndicator(alternative)}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{alternative.description}</p>

                                {/* Key Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="font-medium text-gray-700 mb-1">Specifications:</div>
                                    <p className="text-gray-600">{alternative.specifications || 'Similar to original'}</p>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-700 mb-1">Recommendation:</div>
                                    <p className="text-blue-700">{alternative.recommendationReason}</p>
                                  </div>
                                </div>

                                {/* Advantages & Drawbacks */}
                                {(alternative.keyAdvantages || alternative.potentialDrawbacks) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {alternative.keyAdvantages && alternative.keyAdvantages.length > 0 && (
                                      <div>
                                        <div className="font-medium text-green-700 mb-2 flex items-center space-x-1">
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Advantages</span>
                                        </div>
                                        <ul className="space-y-1">
                                          {alternative.keyAdvantages.map((advantage, i) => (
                                            <li key={i} className="text-sm text-green-600 flex items-start space-x-1">
                                              <span className="text-green-500 mt-1">•</span>
                                              <span>{advantage}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {alternative.potentialDrawbacks && alternative.potentialDrawbacks.length > 0 && (
                                      <div>
                                        <div className="font-medium text-orange-700 mb-2 flex items-center space-x-1">
                                          <AlertCircle className="w-4 h-4" />
                                          <span>Considerations</span>
                                        </div>
                                        <ul className="space-y-1">
                                          {alternative.potentialDrawbacks.map((drawback, i) => (
                                            <li key={i} className="text-sm text-orange-600 flex items-start space-x-1">
                                              <span className="text-orange-500 mt-1">•</span>
                                              <span>{drawback}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Cost & Trend */}
                              <div className="text-right ml-4">
                                <div className="flex items-center space-x-2">
                                  {getCostTrendIcon(alternative.costRange, component.zbc?.shouldCost)}
                                  <div className="font-bold text-lg text-primary-blue">
                                    {alternative.costRange}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Est. cost range</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AlternativesTable;
