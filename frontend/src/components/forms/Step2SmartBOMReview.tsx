import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Info, Edit3, Sparkles, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import InfoTooltip from '../common/InfoTooltip';
import { RootState } from '../../store';
import { RFQ } from '../../types';
import { useRFQ } from '../../contexts/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
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
  const { components, suppliers } = useSelector((state: RootState) => state.rfq);

  const { updateStep, loading } = useRFQ();
  const [notes, setNotes] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<string>('1'); // Default to first component
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string, column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleContinue = async () => {
    try {
      await updateStep(rfq.id, 2, {
        componentUpdates: [],
        notes,
      });
      onNext();
    } catch (error) {
      console.error('Error updating step 2:', error);
    }
  };

  const toggleRowExpansion = (componentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedRows(newExpanded);
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'non-compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'Low':
        return 'badge badge-success';
      case 'Medium':
        return 'badge badge-warning';
      case 'High':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  const getZBCVarianceClass = (variance: string) => {
    if (!variance || variance === 'N/A') return 'text-gray-600';

    const numericVariance = parseFloat(variance.replace('%', ''));
    if (numericVariance < 5) return 'zbc-good';
    if (numericVariance < 20) return 'zbc-moderate';
    return 'zbc-high';
  };

  const getZBCVarianceIcon = (variance: string) => {
    if (!variance || variance === 'N/A') return null;

    const numericVariance = parseFloat(variance.replace('%', ''));
    if (numericVariance > 0) {
      return <TrendingUp className="w-4 h-4" />;
    } else {
      return <TrendingDown className="w-4 h-4" />;
    }
  };


  // Excel-like sorting functionality
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedComponents = () => {
    if (!sortConfig) return components;

    return [...components].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'partName':
          aValue = a.partName;
          bValue = b.partName;
          break;
        case 'partNumber':
          aValue = a.partNumber;
          bValue = b.partNumber;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'zbcShouldCost':
          aValue = parseFloat(a.zbcShouldCost?.replace(/[$,]/g, '') || '0');
          bValue = parseFloat(b.zbcShouldCost?.replace(/[$,]/g, '') || '0');
          break;
        case 'confidence':
          aValue = a.confidence || 0;
          bValue = b.confidence || 0;
          break;
        case 'riskLevel':
          const riskOrder = { Low: 1, Medium: 2, High: 3 };
          aValue = riskOrder[a.riskFlag?.level as keyof typeof riskOrder] || 4;
          bValue = riskOrder[b.riskFlag?.level as keyof typeof riskOrder] || 4;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedComponents = getSortedComponents();

  // Excel export functionality
  const exportToExcel = useCallback(() => {
    // Create CSV content (simple Excel compatibility)
    const headers = [
      'Row #',
      'Part Name',
      'Part Number',
      'Qty',
      'Material',
      'Unit Cost',
      'Total Cost',
      'Status',
      'Risk Level',
      'AI Alternative',
      'Confidence %',
      'Region',
      'Market Range',
      'ZBC Variance'
    ];

    const csvContent = [
      headers.join(','),
      ...sortedComponents.map((component: any, index: number) => [
        index + 1,
        `"${component.partName}"`,
        component.partNumber,
        component.quantity,
        `"${component.material}"`,
        component.zbcShouldCost,
        `"${parseFloat(component.zbcShouldCost?.replace(/[$,]/g, '') || '0') * component.quantity}"`,
        component.complianceStatus,
        component.riskFlag?.level || 'Unknown',
        `"${component.aiSuggestedAlternative}"`,
        component.confidence,
        `"${component.aiRecommendedRegion}"`,
        component.predictedMarketRange,
        component.zbcVariance
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-bom-analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [sortedComponents]);

  // Inline editing functionality
  const handleCellDoubleClick = (rowId: string, column: string, currentValue: string) => {
    setEditingCell({ rowId, column });
    setEditValue(currentValue);
  };

  const handleCellEdit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Save the edit
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'Escape') {
      // Cancel the edit
      setEditingCell(null);
      setEditValue('');
    }
  };

  const renderSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.key !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card size="large">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-slate-gray mb-2">
            Review Your Smart Bill of Materials
          </h2>
          <p className="text-medium-gray">
            Project Robbie's AI has analyzed your input. Review the enhanced data and ZBC insights below.
          </p>
        </div>

        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-dark-slate-gray">Smart BOM Data</h3>
            <span className="text-sm text-medium-gray">({sortedComponents.length} components)</span>
          </div>
          <Button
            onClick={exportToExcel}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            Export to Excel
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-primary-blue">{components.length}</h3>
            <p className="text-sm text-medium-gray">Components</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {components.filter((c: any) => c.complianceStatus === 'compliant').length}
            </h3>
            <p className="text-sm text-medium-gray">Compliant</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-red-600">
              {components.filter((c: any) => c.riskFlag?.level === 'High').length}
            </h3>
            <p className="text-sm text-medium-gray">High Risk</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-secondary-orange">
              {components.length > 0 ? Math.round(components.reduce((sum: number, c: any) => {
                const variance = parseFloat(c.zbcVariance?.replace('%', '') || '0');
                return sum + variance;
              }, 0) / components.length) : 0}%
            </h3>
            <p className="text-sm text-medium-gray">Avg ZBC Variance</p>
          </Card>
        </div>

        {/* Smart BoM Table - Redesigned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 min-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span>Component</span>
                      <InfoTooltip
                        title="Component Information"
                        description="Part details and specifications"
                        businessValue="Core component identification"
                        position="bottom"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 w-16">Qty</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 min-w-[180px]">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI Insights</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 w-24">
                    <div className="flex items-center justify-center space-x-1">
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-900 min-w-[120px]">
                    <div className="flex items-center justify-end space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Cost Analysis</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {components.map((component: any, index: number) => (
                  <React.Fragment key={component.id}>
                    <tr className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      {/* Component Column */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {component.partName}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {component.partNumber}
                          </div>
                          <div className="text-xs text-gray-600">
                            {component.material}
                          </div>
                        </div>
                      </td>

                      {/* Quantity Column */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                          {component.quantity}
                        </span>
                      </td>

                      {/* AI Insights Column */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="text-sm text-blue-700 font-medium line-clamp-2">
                            {component.aiSuggestedAlternative}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500">Confidence:</div>
                            <div className="flex items-center space-x-1">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${component.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-blue-600">{component.confidence}%</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            📍 {component.aiRecommendedRegion}
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-1">
                            {getComplianceIcon(component.complianceStatus)}
                          </div>
                          <span className={`${getRiskBadgeClass(component.riskFlag.level)} text-xs px-2 py-1`}>
                            {component.riskFlag.level}
                          </span>
                        </div>
                      </td>

                      {/* Cost Analysis Column */}
                      <td className="px-4 py-4 text-right">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            Market: <span className="font-medium">{component.predictedMarketRange}</span>
                          </div>
                          <div className="text-sm">
                            ZBC: <span className="font-bold text-primary-blue">{component.zbcShouldCost}</span>
                          </div>
                          <div className={`flex items-center justify-end space-x-1 text-sm ${getZBCVarianceClass(component.zbcVariance)}`}>
                            {getZBCVarianceIcon(component.zbcVariance)}
                            <span className="font-semibold">{component.zbcVariance}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(component.id)}
                          className="text-xs"
                        >
                          {expandedRows.has(component.id) ? '▲' : '▼'}
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded Row Details */}
                    {expandedRows.has(component.id) && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Compliance Details */}
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Compliance & Certifications</span>
                              </h5>
                              <div className="space-y-2">
                                {component.complianceFlags?.map((flag: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <span className="text-sm">{flag.icon}</span>
                                    <span className="text-sm text-gray-700">{flag.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span>Detailed Cost Analysis</span>
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Market Low:</span>
                                  <span className="font-medium">{component.predictedMarketRange.split(' - ')[0]}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Market High:</span>
                                  <span className="font-medium">{component.predictedMarketRange.split(' - ')[1]}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-gray-600">ZBC Should-Cost:</span>
                                  <span className="font-bold text-primary-blue">{component.zbcShouldCost}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Source: {component.zbcSource}
                                </div>
                              </div>
                            </div>

                            {/* AI Recommendations */}
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span>AI Recommendations</span>
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Alternative:</span>
                                  <p className="text-blue-700 font-medium mt-1">{component.aiSuggestedAlternative}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Recommended Region:</span>
                                  <p className="text-gray-900 font-medium mt-1">{component.aiRecommendedRegion}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <span className="text-gray-600">AI Confidence:</span>
                                  <span className="font-semibold text-blue-600">{component.confidence}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Trust Graph Section */}
        <div className="mt-12">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-accent-teal" />
              <h3 className="text-xl font-bold text-dark-slate-gray">
                Supplier Intelligence Analysis
              </h3>
            </div>
            <p className="text-medium-gray">
              Explore cost vs trust relationships for each component. Select a component to view its supplier landscape.
            </p>
          </div>

          {/* Component Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {components.map((component: any) => (
                <button
                  key={component.id}
                  onClick={() => setSelectedComponent(component.id)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${selectedComponent === component.id
                    ? 'border-accent-teal bg-blue-50 text-accent-teal'
                    : 'border-gray-300 text-dark-slate-gray hover:border-gray-400'
                    }`}
                >
                  <div className="text-sm font-medium">{component.partName}</div>
                  <div className="text-xs opacity-75">{component.partNumber}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Trust Graph */}
          {selectedComponent && suppliers[selectedComponent as keyof typeof suppliers] && (
            <SupplierTrustGraph
              componentName={components.find((c: any) => c.id === selectedComponent)?.partName || 'Component'}
              suppliers={suppliers[selectedComponent as keyof typeof suppliers]}
              onSupplierSelect={(supplier) => {
                console.log('Selected supplier:', supplier);
                // Here you could open a modal with detailed supplier information
              }}
              className="mb-8"
            />
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-dark-slate-gray mb-4">
            Review Notes (Optional)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the Smart BoM analysis..."
            className="input-field h-24 resize-none"
          />
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
            Continue to Commercial Terms
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-blue-800 mb-1">
                Understanding Your Smart BoM
              </h4>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>ZBC Variance:</strong> Difference between market price and should-cost</li>
                <li>• <strong>Risk Levels:</strong> Supply chain, geopolitical, and material volatility risks</li>
                <li>• <strong>AI Suggestions:</strong> Alternative materials and processes for cost optimization</li>
                <li>• <strong>Compliance:</strong> Regulatory status and certifications</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step2SmartBOMReview;
