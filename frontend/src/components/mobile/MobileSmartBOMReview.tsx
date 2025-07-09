import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import InfoTooltip from '../common/InfoTooltip';
import { RFQ, SmartBOMComponent } from '../../types';
import { useRFQ } from '../../context/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
import SupplierTrustGraph from '../common/SupplierTrustGraph';

interface MobileSmartBOMReviewProps {
  rfq: RFQ;
  onNext: () => void;
  onPrevious: () => void;
}

const MobileSmartBOMReview: React.FC<MobileSmartBOMReviewProps> = ({
  rfq,
  onNext,
  onPrevious,
}) => {
  const { updateStep, loading } = useRFQ();
  const [notes, setNotes] = useState('');
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>('1');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'suppliers'>('list');

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

  const toggleComponentExpansion = (componentId: string) => {
    setExpandedComponent(expandedComponent === componentId ? null : componentId);
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
        return 'bg-emerald-100 text-emerald-700';
      case 'Medium':
        return 'bg-warning-100 text-warning-700';
      case 'High':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-surface-100 text-surface-700';
    }
  };

  const getZBCVarianceClass = (variance: string) => {
    if (!variance || variance === 'N/A') return 'text-gray-600';
    
    const numericVariance = parseFloat(variance.replace('%', ''));
    if (numericVariance < 5) return 'text-emerald-600';
    if (numericVariance < 20) return 'text-warning-600';
    return 'text-red-600';
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

  // Mock data if no components exist yet
  const components = rfq.components && rfq.components.length > 0 ? rfq.components : [
    {
      id: '1',
      partName: 'Aluminum Housing',
      partNumber: 'ALU-HSG-001',
      quantity: 2,
      material: 'Aluminum 6061-T6',
      aiSuggestedAlternative: 'Aluminum 6063-T5 (15% cost reduction)',
      complianceStatus: 'compliant' as const,
      complianceFlags: [
        { type: 'success' as const, text: 'RoHS Compliant', icon: '✅' },
        { type: 'success' as const, text: 'REACH Compliant', icon: '✅' }
      ],
      riskFlag: { level: 'Medium' as const, color: 'yellow' as const },
      aiRecommendedRegion: 'India - Gujarat',
      predictedMarketRange: '$45 - $65',
      zbcShouldCost: '$38.50',
      zbcVariance: '+18.2%',
      zbcSource: 'AI Generated' as const,
      confidence: 85,
      notes: ''
    },
    {
      id: '2',
      partName: 'Precision Bearing',
      partNumber: 'BRG-6205-2RS',
      quantity: 4,
      material: 'Chrome Steel',
      aiSuggestedAlternative: 'Ceramic hybrid bearing (longer life)',
      complianceStatus: 'pending' as const,
      complianceFlags: [
        { type: 'warning' as const, text: 'ISO 9001 Pending', icon: '⚠️' }
      ],
      riskFlag: { level: 'High' as const, color: 'red' as const },
      aiRecommendedRegion: 'Germany - Bavaria',
      predictedMarketRange: '$12 - $18',
      zbcShouldCost: '$14.20',
      zbcVariance: '+8.5%',
      zbcSource: 'AI Generated' as const,
      confidence: 92,
      notes: ''
    },
    {
      id: '3',
      partName: 'Stainless Steel Fasteners',
      partNumber: 'SS-M6x20-A4',
      quantity: 12,
      material: 'Stainless Steel 316L',
      aiSuggestedAlternative: 'Grade 304 for non-marine applications',
      complianceStatus: 'compliant' as const,
      complianceFlags: [
        { type: 'success' as const, text: 'FDA Approved', icon: '✅' },
        { type: 'success' as const, text: 'ASTM A193', icon: '✅' }
      ],
      riskFlag: { level: 'Low' as const, color: 'green' as const },
      aiRecommendedRegion: 'Taiwan',
      predictedMarketRange: '$0.85 - $1.20',
      zbcShouldCost: '$0.95',
      zbcVariance: '-2.1%',
      zbcSource: 'AI Generated' as const,
      confidence: 78,
      notes: ''
    }
  ];

  const stats = {
    totalComponents: components.length,
    compliantComponents: components.filter(c => c.complianceStatus === 'compliant').length,
    highRiskComponents: components.filter(c => c.riskFlag.level === 'High').length,
    avgZBCVariance: Math.round(components.reduce((sum, c) => {
      const variance = parseFloat(c.zbcVariance?.replace('%', '') || '0');
      return sum + variance;
    }, 0) / components.length)
  };

  const renderListView = () => (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <h3 className="text-2xl font-bold text-primary-600">{stats.totalComponents}</h3>
          <p className="text-sm text-surface-600">Components</p>
        </Card>
        <Card className="p-4 text-center">
          <h3 className="text-2xl font-bold text-emerald-600">{stats.compliantComponents}</h3>
          <p className="text-sm text-surface-600">Compliant</p>
        </Card>
        <Card className="p-4 text-center">
          <h3 className="text-2xl font-bold text-red-600">{stats.highRiskComponents}</h3>
          <p className="text-sm text-surface-600">High Risk</p>
        </Card>
        <Card className="p-4 text-center">
          <h3 className="text-2xl font-bold text-warning-600">{stats.avgZBCVariance}%</h3>
          <p className="text-sm text-surface-600">Avg Variance</p>
        </Card>
      </div>

      {/* Component Cards */}
      <div className="space-y-3">
        {components.map((component) => (
          <Card key={component.id} className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 text-sm">
                    {component.partName}
                  </h3>
                  <p className="text-xs text-surface-600 font-mono">
                    {component.partNumber}
                  </p>
                  <p className="text-xs text-surface-600 mt-1">
                    {component.material}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Qty: {component.quantity}
                  </span>
                  <button
                    onClick={() => toggleComponentExpansion(component.id)}
                    className="p-1 hover:bg-surface-100 rounded"
                  >
                    {expandedComponent === component.id ? (
                      <ChevronUp className="w-4 h-4 text-surface-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-surface-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getComplianceIcon(component.complianceStatus)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeClass(component.riskFlag.level)}`}>
                    {component.riskFlag.level} Risk
                  </span>
                </div>
                <div className={`flex items-center space-x-1 text-sm font-semibold ${getZBCVarianceClass(component.zbcVariance)}`}>
                  {getZBCVarianceIcon(component.zbcVariance)}
                  <span>{component.zbcVariance}</span>
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      {component.aiSuggestedAlternative}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-blue-600">Confidence:</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-16 bg-blue-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${component.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-blue-600">{component.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedComponent === component.id && (
                <div className="space-y-4 pt-3 border-t border-surface-200">
                  {/* Cost Analysis */}
                  <div>
                    <h4 className="font-medium text-surface-900 mb-2 text-sm">Cost Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-surface-600">Market Range:</span>
                        <span className="font-medium">{component.predictedMarketRange}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-600">ZBC Should-Cost:</span>
                        <span className="font-bold text-primary-600">{component.zbcShouldCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-600">Recommended Region:</span>
                        <span className="font-medium">{component.aiRecommendedRegion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div>
                    <h4 className="font-medium text-surface-900 mb-2 text-sm">Compliance</h4>
                    <div className="space-y-1">
                      {component.complianceFlags.map((flag, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm">{flag.icon}</span>
                          <span className="text-sm text-surface-700">{flag.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedComponent(component.id);
                        setViewMode('suppliers');
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Suppliers
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedComponent(component.id);
                        setViewMode('details');
                      }}
                      className="flex-1"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDetailsView = () => {
    const component = components.find(c => c.id === selectedComponent);
    if (!component) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setViewMode('list')}
            className="text-primary-600"
          >
            ← Back to List
          </Button>
        </div>

        <Card className="p-4">
          <div className="space-y-4">
            {/* Component Info */}
            <div>
              <h2 className="text-lg font-bold text-surface-900">{component.partName}</h2>
              <p className="text-surface-600 font-mono text-sm">{component.partNumber}</p>
              <p className="text-surface-600 text-sm">{component.material}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-surface-50 rounded-lg">
                <div className="text-lg font-bold text-surface-900">{component.quantity}</div>
                <div className="text-xs text-surface-600">Quantity</div>
              </div>
              <div className="text-center p-3 bg-surface-50 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{component.confidence}%</div>
                <div className="text-xs text-surface-600">AI Confidence</div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Recommendation
              </h3>
              <p className="text-blue-800">{component.aiSuggestedAlternative}</p>
              <p className="text-blue-600 text-sm mt-2">
                📍 Recommended Region: {component.aiRecommendedRegion}
              </p>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-3">Cost Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
                  <span className="text-surface-600">Market Range</span>
                  <span className="font-semibold">{component.predictedMarketRange}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-primary-700">ZBC Should-Cost</span>
                  <span className="font-bold text-primary-800">{component.zbcShouldCost}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
                  <span className="text-surface-600">Variance</span>
                  <div className={`flex items-center space-x-1 font-semibold ${getZBCVarianceClass(component.zbcVariance)}`}>
                    {getZBCVarianceIcon(component.zbcVariance)}
                    <span>{component.zbcVariance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Risk */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-3">Compliance & Risk</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <span className="text-surface-600">Risk Level</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeClass(component.riskFlag.level)}`}>
                    {component.riskFlag.level}
                  </span>
                </div>
                <div className="space-y-2">
                  {component.complianceFlags.map((flag, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-surface-50 rounded-lg">
                      <span className="text-lg">{flag.icon}</span>
                      <span className="text-surface-700">{flag.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSuppliersView = () => {
    const component = components.find(c => c.id === selectedComponent);
    if (!component) return null;

    // Mock supplier data for demonstration
    const mockSuppliers = [
      {
        id: 'sup-1',
        name: 'Gujarat Precision Metals',
        cost: 28500,
        trustScore: 8.7,
        category: 'trusted' as const,
        region: 'India - Gujarat',
        certifications: ['ISO 9001', 'AS9100', 'RoHS'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-2',
        name: 'Aluminum Works Ltd',
        cost: 31200,
        trustScore: 8.9,
        category: 'trusted' as const,
        region: 'India - Tamil Nadu',
        certifications: ['ISO 9001', 'REACH'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-3',
        name: 'MetalCraft Solutions',
        cost: 26800,
        trustScore: 7.8,
        category: 'empanelled' as const,
        region: 'Vietnam',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setViewMode('list')}
            className="text-primary-600"
          >
            ← Back to List
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-surface-900 mb-2">
            Suppliers for {component.partName}
          </h2>
          <p className="text-surface-600 text-sm mb-4">
            {mockSuppliers.length} suppliers found matching your requirements
          </p>

          {/* Supplier Cards */}
          <div className="space-y-3">
            {mockSuppliers.map((supplier) => (
              <Card key={supplier.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-surface-900">{supplier.name}</h3>
                      <p className="text-sm text-surface-600">{supplier.region}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-surface-900">
                        ${(supplier.cost / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-surface-600">Cost</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.category === 'trusted' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : supplier.category === 'empanelled'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {supplier.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeClass(supplier.riskLevel)}`}>
                        {supplier.riskLevel} Risk
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-surface-900">
                        {supplier.trustScore}/10
                      </div>
                      <div className="text-xs text-surface-600">Trust Score</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-surface-600 mb-1">Certifications:</div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.certifications.map((cert, index) => (
                        <span key={index} className="bg-surface-100 text-surface-700 text-xs px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-surface-900 mb-2">
          Smart BoM Review
        </h2>
        <p className="text-surface-600 text-sm">
          AI-enhanced analysis of your components
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex bg-surface-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-surface-600'
          }`}
        >
          Components
        </button>
        <button
          onClick={() => setViewMode('details')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'details'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-surface-600'
          }`}
          disabled={!selectedComponent}
        >
          Details
        </button>
        <button
          onClick={() => setViewMode('suppliers')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'suppliers'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-surface-600'
          }`}
          disabled={!selectedComponent}
        >
          Suppliers
        </button>
      </div>

      {/* Content */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'details' && renderDetailsView()}
      {viewMode === 'suppliers' && renderSuppliersView()}

      {/* Notes Section */}
      {viewMode === 'list' && (
        <Card className="p-4">
          <h3 className="font-semibold text-surface-900 mb-3">
            Review Notes (Optional)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the Smart BoM analysis..."
            className="w-full p-3 border border-surface-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </Card>
      )}

      {/* Action Buttons */}
      {viewMode === 'list' && (
        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            disabled={loading.isLoading}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleContinue}
            loading={loading.isLoading}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileSmartBOMReview;
