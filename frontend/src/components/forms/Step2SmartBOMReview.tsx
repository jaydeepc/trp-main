import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Info, Edit3, Sparkles } from 'lucide-react';
import InfoTooltip from '../common/InfoTooltip';
import { RFQ, SmartBOMComponent } from '../../types';
import { useRFQ } from '../../context/RFQContext';
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
  const { updateStep, loading } = useRFQ();
  const [notes, setNotes] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<string>('1'); // Default to first component

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

  // Mock supplier data for the trust graph
  const mockSupplierData = {
    '1': [ // Aluminum Housing - 15 suppliers (AI-optimized for 6063-T5 alternative)
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
        name: 'Advanced Aluminum Corp',
        cost: 33100,
        trustScore: 9.1,
        category: 'trusted' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'AS9100'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-6',
        name: 'Euro Metal Systems',
        cost: 29700,
        trustScore: 8.5,
        category: 'trusted' as const,
        region: 'Europe',
        certifications: ['ISO 9001', 'REACH'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-7',
        name: 'Asia Pacific Alloys',
        cost: 24300,
        trustScore: 7.2,
        category: 'empanelled' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-8',
        name: 'Premium Metals Ltd',
        cost: 37800,
        trustScore: 9.6,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'AS9100', 'NADCAP'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-9',
        name: 'Global Aluminum Solutions',
        cost: 27900,
        trustScore: 8.3,
        category: 'trusted' as const,
        region: 'India',
        certifications: ['ISO 9001', 'RoHS'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-10',
        name: 'Lightweight Materials Co',
        cost: 25600,
        trustScore: 7.6,
        category: 'empanelled' as const,
        region: 'Thailand',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-11',
        name: 'Aerospace Alloys Inc',
        cost: 39200,
        trustScore: 9.8,
        category: 'trusted' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'AS9100', 'NADCAP'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-12',
        name: 'Industrial Metals Group',
        cost: 30400,
        trustScore: 8.1,
        category: 'empanelled' as const,
        region: 'Europe',
        certifications: ['ISO 9001', 'REACH'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-13',
        name: 'Budget Aluminum Works',
        cost: 22100,
        trustScore: 6.8,
        category: 'new' as const,
        region: 'Vietnam',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-14',
        name: 'Quality Metal Fabricators',
        cost: 32500,
        trustScore: 8.8,
        category: 'trusted' as const,
        region: 'India',
        certifications: ['ISO 9001', 'AS9100'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-15',
        name: 'Reliable Alloys Ltd',
        cost: 26200,
        trustScore: 7.9,
        category: 'empanelled' as const,
        region: 'Taiwan',
        certifications: ['ISO 9001', 'RoHS'],
        riskLevel: 'Medium' as const,
      },
    ],
    '2': [ // Precision Bearing - 15 suppliers (AI-optimized for ceramic hybrid alternative)
      {
        id: 'sup-16',
        name: 'SKF Bearings',
        cost: 11200,
        trustScore: 9.7,
        category: 'trusted' as const,
        region: 'Germany - Bavaria',
        certifications: ['ISO 9001', 'TS 16949', 'AS9100'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-17',
        name: 'NSK Europe',
        cost: 10800,
        trustScore: 9.4,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-18',
        name: 'Bearing Solutions Asia',
        cost: 8900,
        trustScore: 7.6,
        category: 'empanelled' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-19',
        name: 'Precision Bearings Co',
        cost: 7200,
        trustScore: 6.8,
        category: 'new' as const,
        region: 'India',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-20',
        name: 'Timken Corporation',
        cost: 13500,
        trustScore: 9.6,
        category: 'trusted' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'TS 16949', 'AS9100'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-21',
        name: 'FAG Bearings',
        cost: 12100,
        trustScore: 9.2,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-22',
        name: 'NTN Corporation',
        cost: 9600,
        trustScore: 8.9,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-23',
        name: 'Koyo Bearings',
        cost: 8700,
        trustScore: 8.5,
        category: 'empanelled' as const,
        region: 'Japan',
        certifications: ['ISO 9001'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-24',
        name: 'INA Bearings',
        cost: 11800,
        trustScore: 9.1,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-25',
        name: 'THK Linear Systems',
        cost: 14200,
        trustScore: 9.3,
        category: 'trusted' as const,
        region: 'Japan',
        certifications: ['ISO 9001', 'AS9100'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-26',
        name: 'Schaeffler Group',
        cost: 12800,
        trustScore: 9.0,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-27',
        name: 'RBC Bearings',
        cost: 15100,
        trustScore: 8.8,
        category: 'empanelled' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'AS9100'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-28',
        name: 'ZWZ Bearings',
        cost: 6800,
        trustScore: 7.1,
        category: 'new' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-29',
        name: 'LYC Bearing Corp',
        cost: 6200,
        trustScore: 6.9,
        category: 'new' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-30',
        name: 'ABC Bearings India',
        cost: 5900,
        trustScore: 6.5,
        category: 'new' as const,
        region: 'India',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
    ],
    '3': [ // Stainless Steel Fasteners - 15 suppliers (AI-optimized for Grade 304 alternative)
      {
        id: 'sup-31',
        name: 'Taiwan Fastener Corp',
        cost: 850,
        trustScore: 9.1,
        category: 'trusted' as const,
        region: 'Taiwan',
        certifications: ['ISO 9001', 'ASTM A193', 'FDA'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-32',
        name: 'Stainless Solutions',
        cost: 720,
        trustScore: 8.2,
        category: 'empanelled' as const,
        region: 'India',
        certifications: ['ISO 9001', 'ASTM A193'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-33',
        name: 'FastenRight Ltd',
        cost: 580,
        trustScore: 7.1,
        category: 'new' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-34',
        name: 'Würth Group',
        cost: 950,
        trustScore: 9.5,
        category: 'trusted' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'ASTM A193', 'DIN'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-35',
        name: 'Fastenal Company',
        cost: 890,
        trustScore: 9.2,
        category: 'trusted' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'ASTM A193'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-36',
        name: 'Bossard Group',
        cost: 920,
        trustScore: 8.9,
        category: 'trusted' as const,
        region: 'Europe',
        certifications: ['ISO 9001', 'ASTM A193'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-37',
        name: 'Acument Global',
        cost: 810,
        trustScore: 8.6,
        category: 'empanelled' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-38',
        name: 'Sundram Fasteners',
        cost: 680,
        trustScore: 8.4,
        category: 'empanelled' as const,
        region: 'India',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-39',
        name: 'Precision Castparts',
        cost: 1050,
        trustScore: 9.3,
        category: 'trusted' as const,
        region: 'North America',
        certifications: ['ISO 9001', 'AS9100', 'NADCAP'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-40',
        name: 'Bulten AB',
        cost: 980,
        trustScore: 8.8,
        category: 'trusted' as const,
        region: 'Europe',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Low' as const,
      },
      {
        id: 'sup-41',
        name: 'Kamax Group',
        cost: 870,
        trustScore: 8.5,
        category: 'empanelled' as const,
        region: 'Germany',
        certifications: ['ISO 9001', 'TS 16949'],
        riskLevel: 'Medium' as const,
      },
      {
        id: 'sup-42',
        name: 'Ningbo Jinding',
        cost: 520,
        trustScore: 7.3,
        category: 'new' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-43',
        name: 'Jiaxing Brother',
        cost: 480,
        trustScore: 6.9,
        category: 'new' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-44',
        name: 'Haiyan Yintai',
        cost: 450,
        trustScore: 6.6,
        category: 'new' as const,
        region: 'China',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
      {
        id: 'sup-45',
        name: 'Mumbai Fasteners',
        cost: 550,
        trustScore: 7.0,
        category: 'new' as const,
        region: 'India',
        certifications: ['ISO 9001'],
        riskLevel: 'High' as const,
      },
    ],
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-primary-blue">{components.length}</h3>
            <p className="text-sm text-medium-gray">Components</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {components.filter(c => c.complianceStatus === 'compliant').length}
            </h3>
            <p className="text-sm text-medium-gray">Compliant</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-red-600">
              {components.filter(c => c.riskFlag.level === 'High').length}
            </h3>
            <p className="text-sm text-medium-gray">High Risk</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-secondary-orange">
              {Math.round(components.reduce((sum, c) => {
                const variance = parseFloat(c.zbcVariance?.replace('%', '') || '0');
                return sum + variance;
              }, 0) / components.length)}%
            </h3>
            <p className="text-sm text-medium-gray">Avg ZBC Variance</p>
          </Card>
        </div>

        {/* Smart BoM Cards */}
        <div className="space-y-6">
          {components.map((component) => (
            <Card key={component.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-dark-slate-gray mb-1">
                          {component.partName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-medium-gray mb-2">
                          <span className="font-medium">{component.partNumber}</span>
                          <span>•</span>
                          <span>{component.material}</span>
                          <span>•</span>
                          <span className="font-semibold">Qty: {component.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={getRiskBadgeClass(component.riskFlag.level)}>
                          {component.riskFlag.level} Risk
                        </span>
                        <div className="flex items-center space-x-1">
                          {getComplianceIcon(component.complianceStatus)}
                          <span className="text-xs capitalize text-medium-gray">
                            {component.complianceStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* AI Insights Column */}
                  <div className="lg:col-span-1">
                    <div className="bg-blue-50 rounded-lg p-4 h-full">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">AI Insights</h4>
                        <InfoTooltip
                          title="AI-Powered Recommendations"
                          description="Machine learning analysis providing cost optimization and performance improvement suggestions."
                          businessValue="Identifies opportunities for cost savings and quality improvements."
                          position="top"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-blue-700 mb-1">Suggested Alternative:</p>
                          <p className="text-sm text-blue-600">{component.aiSuggestedAlternative}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700 mb-1">Recommended Region:</p>
                          <p className="text-sm text-blue-600">{component.aiRecommendedRegion}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700">Confidence:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-blue-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${component.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">{component.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Analysis Column */}
                  <div className="lg:col-span-1">
                    <div className="bg-green-50 rounded-lg p-4 h-full">
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Cost Analysis</h4>
                        <InfoTooltip
                          title="Zero-Based Costing Analysis"
                          description="Comparison between market pricing and fundamental cost drivers to identify savings opportunities."
                          businessValue="Provides negotiation leverage and identifies overpriced components."
                          position="top"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700">Market Range:</span>
                          <span className="text-sm font-semibold text-green-600">{component.predictedMarketRange}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700">ZBC Should-Cost:</span>
                          <span className="text-sm font-bold text-primary-blue">{component.zbcShouldCost}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700">Variance:</span>
                          <div className={`flex items-center space-x-1 ${getZBCVarianceClass(component.zbcVariance)}`}>
                            {getZBCVarianceIcon(component.zbcVariance)}
                            <span className="text-sm font-bold">{component.zbcVariance}</span>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Source: {component.zbcSource}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance & Risk Column */}
                  <div className="lg:col-span-1">
                    <div className="bg-purple-50 rounded-lg p-4 h-full">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-800">Compliance & Risk</h4>
                        <InfoTooltip
                          title="Regulatory & Supply Chain Risk"
                          description="Assessment of compliance status and supply chain risks for informed decision making."
                          businessValue="Ensures regulatory compliance and helps mitigate supply chain disruptions."
                          position="top"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-purple-700 mb-2">Certifications:</p>
                          <div className="flex flex-wrap gap-1">
                            {component.complianceFlags.map((flag, index) => (
                              <span 
                                key={index}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  flag.type === 'success' ? 'bg-green-100 text-green-800' :
                                  flag.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <span className="mr-1">{flag.icon}</span>
                                {flag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-700">Risk Level:</span>
                          <span className={getRiskBadgeClass(component.riskFlag.level)}>
                            {component.riskFlag.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(component.id)}
                      icon={<Info className="w-4 h-4" />}
                    >
                      {expandedRows.has(component.id) ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit3 className="w-4 h-4" />}
                    >
                      Edit Component
                    </Button>
                  </div>
                  <div className="text-sm text-medium-gray">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRows.has(component.id) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-semibold text-dark-slate-gray mb-3">Technical Specifications</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Part Number:</span>
                            <span className="font-medium">{component.partNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Material:</span>
                            <span className="font-medium">{component.material}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Quantity:</span>
                            <span className="font-medium">{component.quantity}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-dark-slate-gray mb-3">Cost Breakdown</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Market Low:</span>
                            <span className="font-medium">{component.predictedMarketRange.split(' - ')[0]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Market High:</span>
                            <span className="font-medium">{component.predictedMarketRange.split(' - ')[1]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Should-Cost:</span>
                            <span className="font-bold text-primary-blue">{component.zbcShouldCost}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-dark-slate-gray mb-3">Supply Chain Intel</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Recommended Region:</span>
                            <span className="font-medium">{component.aiRecommendedRegion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-medium-gray">Risk Assessment:</span>
                            <span className={getRiskBadgeClass(component.riskFlag.level)}>
                              {component.riskFlag.level}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-medium-gray">AI Confidence:</span>
                            <span className="font-medium">{component.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
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
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                    selectedComponent === component.id
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
