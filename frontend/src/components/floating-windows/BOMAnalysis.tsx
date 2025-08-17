import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Info, Edit3, Sparkles } from 'lucide-react';
import InfoTooltip from '../common/InfoTooltip';
import { RFQ, SmartBOMComponent } from '../../types';
import { useRFQ } from '../../contexts/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
import SupplierTrustGraph from '../common/SupplierTrustGraph';
import MobileSmartBOMReview from '../mobile/MobileSmartBOMReview';
import { useResponsive } from '../../hooks/useResponsive';

interface BOMAnalysisProps {
  onNext: () => void;
  onCancel: () => void;
  uploadedFiles?: any[];
}

const BOMAnalysis: React.FC<BOMAnalysisProps> = ({
  onNext,
  onCancel,
  uploadedFiles = []
}) => {
  const { updateStep, loading } = useRFQ();
  const { isMobile } = useResponsive();
  const [notes, setNotes] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<string>('1'); // Default to first component

  const handleContinue = async () => {
    try {
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

  // Mock supplier data for Mercedes-Benz Infotainment System components
  const mockSupplierData = {
    '1': [ // 12.3" OLED Display Panel - Premium display manufacturers
      {
        id: 'sup-1',
        name: 'LG Electronics',
        cost: 335,
        trustScore: 9.6,
        category: 'trusted' as const,
        region: 'South Korea',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-2',
        name: 'Samsung Electronics',
        cost: 342,
        trustScore: 9.5,
        category: 'trusted' as const,
        region: 'South Korea',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-3',
        name: 'Continental AG',
        cost: 358,
        trustScore: 9.4,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949', 'Mercedes Approved'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-4',
        name: 'BOE Technology',
        cost: 298,
        trustScore: 8.2,
        category: 'empanelled' as const,
        region: 'China',
        certifications: ['ISO 9001', 'AEC-Q200'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-5',
        name: 'AU Optronics',
        cost: 315,
        trustScore: 8.7,
        category: 'trusted' as const,
        region: 'Taiwan',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-6',
        name: 'Sharp Corporation',
        cost: 326,
        trustScore: 8.9,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-7',
        name: 'Innolux Corporation',
        cost: 289,
        trustScore: 8.1,
        category: 'empanelled' as const,
        region: 'Taiwan',
        certifications: ['ISO 9001', 'AEC-Q200'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-8',
        name: 'Tianma Microelectronics',
        cost: 275,
        trustScore: 7.8,
        category: 'empanelled' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-9',
        name: 'Japan Display Inc',
        cost: 345,
        trustScore: 8.6,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-10',
        name: 'Visteon Corporation',
        cost: 365,
        trustScore: 9.1,
        category: 'trusted' as const,
        region: 'USA',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
    ],
    '2': [ // Snapdragon 8cx Gen 3 SoC - Semiconductor manufacturers and contract manufacturers
      {
        id: 'sup-16',
        name: 'Qualcomm Technologies',
        cost: 195,
        trustScore: 9.8,
        category: 'trusted' as const,
        region: 'USA',
        certifications: ['ISO 9001', 'AEC-Q100', 'ISO 26262'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-17',
        name: 'Foxconn Technology',
        cost: 208,
        trustScore: 9.2,
        category: 'trusted' as const,
        region: 'India',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-18',
        name: 'Flex Ltd',
        cost: 215,
        trustScore: 8.9,
        category: 'trusted' as const,
        region: 'Singapore',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-19',
        name: 'Jabil Inc',
        cost: 198,
        trustScore: 8.7,
        category: 'trusted' as const,
        region: 'USA',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-20',
        name: 'Sanmina Corporation',
        cost: 225,
        trustScore: 8.4,
        category: 'empanelled' as const,
        region: 'USA',
        certifications: ['ISO 9001', 'AEC-Q100'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-21',
        name: 'Celestica Inc',
        cost: 212,
        trustScore: 8.6,
        category: 'trusted' as const,
        region: 'Canada',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-22',
        name: 'Bosch Semiconductors',
        cost: 235,
        trustScore: 9.3,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949', 'ISO 26262'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-23',
        name: 'TSMC (via Qualcomm)',
        cost: 188,
        trustScore: 9.7,
        category: 'trusted' as const,
        region: 'Taiwan',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-24',
        name: 'Continental Automotive',
        cost: 245,
        trustScore: 9.1,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949', 'Mercedes Approved'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-25',
        name: 'Harman International',
        cost: 228,
        trustScore: 8.8,
        category: 'trusted' as const,
        region: 'USA',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
    ],
    '3': [ // Carbon Fiber Housing Assembly - Automotive carbon fiber specialists
      {
        id: 'sup-31',
        name: 'Toray Industries',
        cost: 152,
        trustScore: 9.4,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'TS 16949', 'NADCAP'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-32',
        name: 'SGL Carbon',
        cost: 148,
        trustScore: 9.2,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'TS 16949', 'Mercedes Approved'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-33',
        name: 'Hexcel Corporation',
        cost: 165,
        trustScore: 9.0,
        category: 'trusted' as const,
        region: 'USA',
        certifications: ['ISO 9001', 'AS9100', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-34',
        name: 'Teijin Carbon',
        cost: 158,
        trustScore: 8.8,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-35',
        name: 'Mitsubishi Chemical',
        cost: 162,
        trustScore: 8.9,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-36',
        name: 'Solvay Composite',
        cost: 155,
        trustScore: 8.7,
        category: 'trusted' as const,
        region: 'Belgium',
        certifications: ['ISO 9001', 'TS 16949', 'REACH'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-37',
        name: 'Magna International',
        cost: 145,
        trustScore: 8.5,
        category: 'empanelled' as const,
        region: 'Canada',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-38',
        name: 'Plasan Carbon',
        cost: 138,
        trustScore: 8.3,
        category: 'empanelled' as const,
        region: 'Israel',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-39',
        name: 'Zoltek Companies',
        cost: 125,
        trustScore: 7.9,
        category: 'empanelled' as const,
        region: 'USA',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-40',
        name: 'Formosa Plastics',
        cost: 132,
        trustScore: 8.1,
        category: 'empanelled' as const,
        region: 'Taiwan',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Medium' as const,
      },
    ],
  };

  // Mock components data for Mercedes-Benz Infotainment System
  const components = [
    {
      id: '1',
      partName: '12.3" OLED Display Panel',
      partNumber: 'MB-DISP-OLED-001',
      quantity: 1,
      material: 'AMOLED with Gorilla Glass',
      aiSuggestedAlternative: 'Premium QLED alternative (8% cost reduction)',
      complianceStatus: 'compliant' as const,
      complianceFlags: [
        { type: 'success' as const, text: 'AEC-Q200 Qualified', icon: '✅' },
        { type: 'success' as const, text: 'ISO/TS 16949', icon: '✅' },
        { type: 'success' as const, text: 'RoHS Compliant', icon: '✅' }
      ],
      riskFlag: { level: 'Low' as const, color: 'green' as const },
      aiRecommendedRegion: 'Germany - Bavaria (LG Display)',
      predictedMarketRange: '$285 - $350',
      zbcShouldCost: '$320.00',
      zbcVariance: '+4.2%',
      zbcSource: 'AI Generated' as const,
      confidence: 94,
      notes: 'Premium display - quality cannot be compromised for Mercedes-Benz'
    },
    {
      id: '2',
      partName: 'Snapdragon 8cx Gen 3 SoC',
      partNumber: 'QC-SD8CX3-AUTO',
      quantity: 1,
      material: '5nm Process Node',
      aiSuggestedAlternative: 'Consider Qualcomm SA8540P for automotive-optimized performance',
      complianceStatus: 'pending' as const,
      complianceFlags: [
        { type: 'warning' as const, text: 'AEC-Q100 Pending', icon: '⚠️' },
        { type: 'success' as const, text: 'ISO 26262 ASIL-B', icon: '✅' }
      ],
      riskFlag: { level: 'Medium' as const, color: 'yellow' as const },
      aiRecommendedRegion: 'Germany - Munich (Qualcomm)',
      predictedMarketRange: '$180 - $220',
      zbcShouldCost: '$195.00',
      zbcVariance: '+12.8%',
      zbcSource: 'AI Generated' as const,
      confidence: 89,
      notes: 'Critical for infotainment performance - automotive grade essential'
    },
    {
      id: '3',
      partName: 'Carbon Fiber Housing Assembly',
      partNumber: 'MB-CF-HSG-INF',
      quantity: 1,
      material: 'Carbon Fiber Composite',
      aiSuggestedAlternative: 'Aluminum 6061 with premium finish (cost reduction without quality loss)',
      complianceStatus: 'compliant' as const,
      complianceFlags: [
        { type: 'success' as const, text: 'Automotive Grade', icon: '✅' },
        { type: 'success' as const, text: 'Fire Retardant', icon: '✅' },
        { type: 'success' as const, text: 'UV Resistant', icon: '✅' }
      ],
      riskFlag: { level: 'Low' as const, color: 'green' as const },
      aiRecommendedRegion: 'Germany - Stuttgart',
      predictedMarketRange: '$125 - $165',
      zbcShouldCost: '$142.00',
      zbcVariance: '-3.5%',
      zbcSource: 'AI Generated' as const,
      confidence: 85,
      notes: 'Premium material aligns with Mercedes-Benz luxury positioning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'non-compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVarianceColor = (variance: string) => {
    const numericVariance = parseFloat(variance.replace('%', ''));
    if (numericVariance > 15) return 'text-red-600';
    if (numericVariance > 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Smart BOM Analysis
        </h2>
        <p className="text-sm text-gray-600">
          AI-powered insights and cost optimization recommendations
        </p>
      </div>

      {/* Compact Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{components.length}</div>
          <div className="text-xs text-gray-600">Components</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {components.filter(c => c.complianceStatus === 'compliant').length}
          </div>
          <div className="text-xs text-gray-600">Compliant</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">
            {components.filter(c => c.riskFlag.level === 'Medium').length}
          </div>
          <div className="text-xs text-gray-600">Medium Risk</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {Math.round(components.reduce((sum, c) => {
              const variance = parseFloat(c.zbcVariance?.replace('%', '') || '0');
              return sum + variance;
            }, 0) / components.length)}%
          </div>
          <div className="text-xs text-gray-600">Avg ZBC</div>
        </div>
      </div>

      {/* Component Cards View */}
      <div className="space-y-4">
        {components.map((component) => (
          <div key={component.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              {/* Component Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {component.quantity}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{component.partName}</h3>
                    <p className="text-xs text-gray-500 font-mono">{component.partNumber}</p>
                    <p className="text-xs text-gray-600">{component.material}</p>
                  </div>
                </div>
              </div>

              {/* Status & Risk */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getComplianceIcon(component.complianceStatus)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(component.complianceStatus)}`}>
                    {component.complianceStatus}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(component.riskFlag.level)}`}>
                  {component.riskFlag.level} Risk
                </span>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">AI Recommendation</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">{component.aiSuggestedAlternative}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Confidence:</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
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
            </div>

            {/* Cost Analysis */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Market Range</p>
                <p className="text-sm font-medium text-gray-900">{component.predictedMarketRange}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">ZBC Should-Cost</p>
                <p className="text-sm font-bold text-blue-600">{component.zbcShouldCost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Variance</p>
                <div className={`flex items-center justify-center space-x-1 text-sm font-semibold ${getVarianceColor(component.zbcVariance)}`}>
                  {getZBCVarianceIcon(component.zbcVariance)}
                  <span>{component.zbcVariance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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
            {components.map((component) => (
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
        {selectedComponent && mockSupplierData[selectedComponent as keyof typeof mockSupplierData] && (
          <SupplierTrustGraph
            componentName={components.find(c => c.id === selectedComponent)?.partName || 'Component'}
            suppliers={mockSupplierData[selectedComponent as keyof typeof mockSupplierData]}
            onSupplierSelect={(supplier) => {
              console.log('Selected supplier:', supplier);
              // Here you could open a modal with detailed supplier information
            }}
            className="mb-8"
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={loading.isLoading}
        >
          Cancel
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
    </div>
  );
};

export default BOMAnalysis;
