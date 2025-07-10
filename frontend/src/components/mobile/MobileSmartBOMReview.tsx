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
  Search,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight
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
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);

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

    // Extended mock supplier data for better visualization
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
      {
        id: 'sup-4',
        name: 'Precision Alloys Inc',
        cost: 35600,
        trustScore: 9.4,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'AS9100', 'NADCAP'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-5',
        name: 'Budget Aluminum Works',
        cost: 22100,
        trustScore: 6.8,
        category: 'new' as const,
        region: 'Vietnam',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-6',
        name: 'Quality Metal Fabricators',
        cost: 32500,
        trustScore: 8.8,
        category: 'trusted' as const,
        region: 'India',
        certifications: ['ISO 9001', 'AS9100'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-7',
        name: 'Advanced Materials Co',
        cost: 29800,
        trustScore: 8.2,
        category: 'empanelled' as const,
        region: 'Thailand',
        certifications: ['ISO 9001', 'ISO 14001'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-8',
        name: 'Reliable Metals Inc',
        cost: 33400,
        trustScore: 9.1,
        category: 'trusted' as const,
        region: 'India - Karnataka',
        certifications: ['ISO 9001', 'AS9100', 'IATF 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-9',
        name: 'Economy Fabricators',
        cost: 24600,
        trustScore: 7.2,
        category: 'new' as const,
        region: 'Bangladesh',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-10',
        name: 'Premium Alloy Solutions',
        cost: 38200,
        trustScore: 9.6,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'AS9100', 'JIS Q 9100'],
        riskLevel: 'Low' as const,
      },
    ];

    // Calculate stats for graphs
    const categoryStats = {
      trusted: mockSuppliers.filter(s => s.category === 'trusted').length,
      empanelled: mockSuppliers.filter(s => s.category === 'empanelled').length,
      new: mockSuppliers.filter(s => s.category === 'new').length,
    };

    const riskStats = {
      low: mockSuppliers.filter(s => s.riskLevel === 'Low').length,
      medium: mockSuppliers.filter(s => s.riskLevel === 'Medium').length,
      high: mockSuppliers.filter(s => s.riskLevel === 'High').length,
    };

    const avgTrustScore = mockSuppliers.reduce((sum, s) => sum + s.trustScore, 0) / mockSuppliers.length;
    const avgCost = mockSuppliers.reduce((sum, s) => sum + s.cost, 0) / mockSuppliers.length;

    // Mobile-optimized mini graphs
    const renderMiniTrustVsCostGraph = () => {
      // Calculate proper ranges for better visualization
      const minCost = Math.min(...mockSuppliers.map(s => s.cost));
      const maxCost = Math.max(...mockSuppliers.map(s => s.cost));
      const minTrust = Math.min(...mockSuppliers.map(s => s.trustScore));
      const maxTrust = Math.max(...mockSuppliers.map(s => s.trustScore));
      
      // Add padding to ranges
      const costRange = maxCost - minCost;
      const trustRange = maxTrust - minTrust;
      const costPadding = costRange * 0.1;
      const trustPadding = trustRange * 0.1;
      
      const adjustedMinCost = minCost - costPadding;
      const adjustedMaxCost = maxCost + costPadding;
      const adjustedMinTrust = minTrust - trustPadding;
      const adjustedMaxTrust = maxTrust + trustPadding;

      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-surface-900 text-sm flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Trust vs Cost
            </h4>
            <div className="text-xs text-surface-600">
              {mockSuppliers.length} suppliers
            </div>
          </div>
          
          {/* Mini scatter plot */}
          <div className="relative h-32 bg-white/70 rounded-lg p-3 mb-3">
            <svg width="100%" height="100%" viewBox="0 0 180 100" className="overflow-visible">
              {/* Grid lines */}
              <defs>
                <pattern id="miniGrid" width="18" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 18 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.4"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#miniGrid)" />
              
              {/* Average lines */}
              <line 
                x1={((avgCost - adjustedMinCost) / (adjustedMaxCost - adjustedMinCost)) * 180} 
                y1="0" 
                x2={((avgCost - adjustedMinCost) / (adjustedMaxCost - adjustedMinCost)) * 180} 
                y2="100" 
                stroke="#3b82f6" 
                strokeWidth="1" 
                strokeDasharray="3,3" 
                opacity="0.7"
              />
              <line 
                x1="0" 
                y1={100 - ((avgTrustScore - adjustedMinTrust) / (adjustedMaxTrust - adjustedMinTrust)) * 100} 
                x2="180" 
                y2={100 - ((avgTrustScore - adjustedMinTrust) / (adjustedMaxTrust - adjustedMinTrust)) * 100} 
                stroke="#10b981" 
                strokeWidth="1" 
                strokeDasharray="3,3" 
                opacity="0.7"
              />
              
              {/* Axes */}
              <line x1="0" y1="100" x2="180" y2="100" stroke="#94a3b8" strokeWidth="1"/>
              <line x1="0" y1="0" x2="0" y2="100" stroke="#94a3b8" strokeWidth="1"/>
              
              {/* Data points */}
              {mockSuppliers.map((supplier) => {
                const x = ((supplier.cost - adjustedMinCost) / (adjustedMaxCost - adjustedMinCost)) * 180;
                const y = 100 - ((supplier.trustScore - adjustedMinTrust) / (adjustedMaxTrust - adjustedMinTrust)) * 100;
                const color = supplier.category === 'trusted' ? '#3b82f6' : 
                             supplier.category === 'empanelled' ? '#10b981' : '#f59e0b';
                
                return (
                  <circle
                    key={supplier.id}
                    cx={Math.max(3, Math.min(177, x))}
                    cy={Math.max(3, Math.min(97, y))}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                );
              })}
            </svg>
            
            {/* Axis labels */}
            <div className="absolute bottom-1 left-1 text-xs text-surface-500">
              ${(adjustedMinCost/1000).toFixed(0)}K
            </div>
            <div className="absolute bottom-1 right-1 text-xs text-surface-500">
              ${(adjustedMaxCost/1000).toFixed(0)}K
            </div>
            <div className="absolute top-1 left-1 text-xs text-surface-500">
              {adjustedMaxTrust.toFixed(1)}
            </div>
            <div className="absolute bottom-8 left-1 text-xs text-surface-500">
              {adjustedMinTrust.toFixed(1)}
            </div>
          </div>

          {/* Key insights */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/80 p-2 rounded">
              <div className="font-semibold text-blue-600">{avgTrustScore.toFixed(1)}/10</div>
              <div className="text-surface-600">Avg Trust</div>
            </div>
            <div className="bg-white/80 p-2 rounded">
              <div className="font-semibold text-green-600">${(avgCost/1000).toFixed(0)}K</div>
              <div className="text-surface-600">Avg Cost</div>
            </div>
          </div>
        </div>
      );
    };

    const renderMiniCategoryDistribution = () => (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-surface-900 text-sm flex items-center">
            <PieChart className="w-4 h-4 mr-2 text-green-600" />
            Category Mix
          </h4>
          <div className="text-xs text-surface-600">
            Distribution
          </div>
        </div>

        {/* Mini donut chart representation */}
        <div className="flex items-center justify-center mb-3">
          <div className="relative w-20 h-20">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
              <circle 
                cx="40" cy="40" r="30" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="8"
                strokeDasharray={`${(categoryStats.trusted / mockSuppliers.length) * 188.5} 188.5`}
                strokeDashoffset="0"
                transform="rotate(-90 40 40)"
              />
              <circle 
                cx="40" cy="40" r="30" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="8"
                strokeDasharray={`${(categoryStats.empanelled / mockSuppliers.length) * 188.5} 188.5`}
                strokeDashoffset={`-${(categoryStats.trusted / mockSuppliers.length) * 188.5}`}
                transform="rotate(-90 40 40)"
              />
              <circle 
                cx="40" cy="40" r="30" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="8"
                strokeDasharray={`${(categoryStats.new / mockSuppliers.length) * 188.5} 188.5`}
                strokeDashoffset={`-${((categoryStats.trusted + categoryStats.empanelled) / mockSuppliers.length) * 188.5}`}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-surface-900">{mockSuppliers.length}</div>
                <div className="text-xs text-surface-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Trusted</span>
            </div>
            <span className="font-semibold">{categoryStats.trusted}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Empanelled</span>
            </div>
            <span className="font-semibold">{categoryStats.empanelled}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>New</span>
            </div>
            <span className="font-semibold">{categoryStats.new}</span>
          </div>
        </div>
      </div>
    );

    const renderMiniRiskAnalysis = () => (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-surface-900 text-sm flex items-center">
            <Shield className="w-4 h-4 mr-2 text-orange-600" />
            Risk Profile
          </h4>
          <div className="text-xs text-surface-600">
            Assessment
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Low Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(riskStats.low / mockSuppliers.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold w-4">{riskStats.low}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(riskStats.medium / mockSuppliers.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold w-4">{riskStats.medium}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(riskStats.high / mockSuppliers.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold w-4">{riskStats.high}</span>
            </div>
          </div>
        </div>

        {/* Risk insight */}
        <div className="bg-white/80 p-2 rounded text-xs">
          <div className="font-semibold text-orange-600">
            {Math.round((riskStats.low / mockSuppliers.length) * 100)}% Low Risk
          </div>
          <div className="text-surface-600">Suppliers available</div>
        </div>
      </div>
    );

    const graphs = [
      { component: renderMiniTrustVsCostGraph, title: "Trust vs Cost" },
      { component: renderMiniCategoryDistribution, title: "Category Mix" },
      { component: renderMiniRiskAnalysis, title: "Risk Profile" }
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

          {/* Mobile Supplier Analytics - Swipeable Cards */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-surface-900 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-primary-600" />
                Supplier Analytics
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentGraphIndex(Math.max(0, currentGraphIndex - 1))}
                  disabled={currentGraphIndex === 0}
                  className="p-1 rounded-full bg-surface-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex space-x-1">
                  {graphs.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentGraphIndex ? 'bg-primary-600' : 'bg-surface-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentGraphIndex(Math.min(graphs.length - 1, currentGraphIndex + 1))}
                  disabled={currentGraphIndex === graphs.length - 1}
                  className="p-1 rounded-full bg-surface-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Graph */}
            <div className="transition-all duration-300">
              {graphs[currentGraphIndex].component()}
            </div>

            {/* Graph Navigation Dots */}
            <div className="flex justify-center mt-3 space-x-2">
              {graphs.map((graph, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGraphIndex(index)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    index === currentGraphIndex
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  {graph.title}
                </button>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">AI Procurement Insights</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• <strong>Sweet Spot:</strong> 4 suppliers offer optimal trust-cost balance</p>
                  <p>• <strong>Cost Savings:</strong> Up to 22% savings available with new suppliers</p>
                  <p>• <strong>Risk Assessment:</strong> {Math.round((riskStats.low / mockSuppliers.length) * 100)}% of suppliers are low-risk</p>
                </div>
              </div>
            </div>
          </Card>

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
