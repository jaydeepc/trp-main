import React, { useState } from 'react';
import { Filter, Shield, Award, AlertTriangle, Zap, Target, Star, Brain, TrendingUp } from 'lucide-react';
import Card from './Card';

interface Supplier {
  id: string;
  name: string;
  cost: number;
  trustScore: number;
  category: 'trusted' | 'new' | 'empanelled';
  region: string;
  certifications: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface SupplierTrustGraphProps {
  componentName: string;
  suppliers: Supplier[];
  onSupplierSelect?: (supplier: Supplier) => void;
  selectedSupplierId?: string;
  className?: string;
}

const SupplierTrustGraph: React.FC<SupplierTrustGraphProps> = ({
  componentName,
  suppliers,
  onSupplierSelect,
  selectedSupplierId,
  className = '',
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hoveredSupplier, setHoveredSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    filterCategory === 'all' || supplier.category === filterCategory
  );

  const getSupplierColor = (category: string) => {
    switch (category) {
      case 'trusted':
        return '#0ea5e9';
      case 'empanelled':
        return '#10b981';
      case 'new':
        return '#f59e0b';
      default:
        return '#737373';
    }
  };

  const getSupplierGradient = (category: string) => {
    switch (category) {
      case 'trusted':
        return 'from-primary-500 to-primary-600';
      case 'empanelled':
        return 'from-accent-500 to-accent-600';
      case 'new':
        return 'from-warning-500 to-warning-600';
      default:
        return 'from-surface-400 to-surface-500';
    }
  };

  // Calculate actual stats from supplier data
  const categoryStats = {
    trusted: filteredSuppliers.filter(s => s.category === 'trusted').length,
    empanelled: filteredSuppliers.filter(s => s.category === 'empanelled').length,
    new: filteredSuppliers.filter(s => s.category === 'new').length,
  };

  // Calculate actual averages from supplier data
  const avgTrustScore = filteredSuppliers.reduce((sum, s) => sum + s.trustScore, 0) / filteredSuppliers.length;
  const avgCost = filteredSuppliers.reduce((sum, s) => sum + s.cost, 0) / filteredSuppliers.length;

  // Calculate chart dimensions and scaling
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = 40;

  // Calculate actual min/max values from supplier data
  const costs = filteredSuppliers.map(s => s.cost);
  const trustScores = filteredSuppliers.map(s => s.trustScore);
  const minCost = Math.min(...costs) - 50;
  const maxCost = Math.max(...costs) + 50;
  const minTrust = Math.min(...trustScores) - 0.5;
  const maxTrust = Math.max(...trustScores) + 0.5;

  const getXPosition = (cost: number) => {
    return padding + ((cost - minCost) / (maxCost - minCost)) * (chartWidth - 2 * padding);
  };

  const getYPosition = (trustScore: number) => {
    return chartHeight - padding - ((trustScore - minTrust) / (maxTrust - minTrust)) * (chartHeight - 2 * padding);
  };

  const getSupplierSize = (trustScore: number, category: string) => {
    const baseSize = category === 'trusted' ? 8 : category === 'empanelled' ? 6 : 4;
    return baseSize + (trustScore / 10) * 4;
  };

  const avgCostX = getXPosition(avgCost);
  const avgTrustY = getYPosition(avgTrustScore);

  const selectCategory = (category: string) => {
    if (category === filterCategory) {
      setFilterCategory('all');
    } else {
      setFilterCategory(category);
    }
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-surface-900">
              Supplier Intelligence Matrix
            </h3>
            <p className="text-surface-600 font-medium">
              Trust vs Cost Analysis • {componentName}
            </p>
          </div>
        </div>

        {/* Enhanced Legend & Stats */}
        <div className="space-y-4">
          <h4 className="font-semibold text-surface-900 text-sm mt-4 -mb-2">Supplier Categories</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { category: 'trusted', label: 'Trusted', icon: Award, count: categoryStats.trusted, click: () => selectCategory('trusted') },
              { category: 'empanelled', label: 'Empanelled', icon: Shield, count: categoryStats.empanelled, click: () => selectCategory('empanelled') },
              { category: 'new', label: 'New', icon: Zap, count: categoryStats.new, click: () => selectCategory('new') },
            ].map(({ category, label, icon: Icon, count, click }) => (
              <div key={category} className={`flex items-center space-x-2 p-2 bg-surface-50 rounded-lg ${category === filterCategory ? 'border-2 border-primary-500 bg-primary-50' : 'border border-surface-200 hover:border-surface-300 cursor-pointer'}`} onClick={click}>
                <div className={`w-6 h-6 bg-gradient-to-br ${getSupplierGradient(category)} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-surface-900">{count}</div>
                  <div className="text-xs text-surface-600">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-surface-900 text-sm mt-4 -mb-2">Market Insights</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
              <div className="text-lg font-bold text-surface-900">{avgTrustScore.toFixed(1)}/10</div>
              <div className="text-xs text-surface-600">Avg Trust Score</div>
            </div>
            <div className="p-3 bg-gradient-to-r from-accent-50 to-emerald-50 rounded-xl border border-accent-100">
              <div className="text-lg font-bold text-surface-900">${(avgCost / 1000).toFixed(0)}K</div>
              <div className="text-xs text-surface-600">Avg Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Static Chart */}
      <div className="px-6 pb-6">
        <div className="h-96 bg-gradient-to-br from-surface-50/50 to-primary-50/30 rounded-2xl p-4 border border-surface-100">
          <style>
            {`
              .static-chart,
              .static-chart *,
              .static-chart svg,
              .static-chart svg * {
                animation: none !important;
                transition: none !important;
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
                transform: none !important;
              }
            `}
          </style>
          <div className="static-chart relative w-full h-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Average lines */}
              <line
                x1={avgCostX}
                y1={padding}
                x2={avgCostX}
                y2={chartHeight - padding}
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
              <line
                x1={padding}
                y1={avgTrustY}
                x2={chartWidth - padding}
                y2={avgTrustY}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />

              {/* Axis labels */}
              <text x={avgCostX} y={padding - 10} textAnchor="middle" className="text-xs fill-primary-600 font-medium">
                Avg Cost
              </text>
              <text x={chartWidth - padding + 10} y={avgTrustY + 4} textAnchor="start" className="text-xs fill-accent-600 font-medium">
                Avg Trust
              </text>

              {/* X-axis */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="2" />
              {/* Y-axis */}
              <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="2" />

              {/* X-axis labels */}
              <text x={padding} y={chartHeight - 10} textAnchor="middle" className="text-xs fill-surface-600">
                ${(minCost / 1000).toFixed(0)}K
              </text>
              <text x={chartWidth - padding} y={chartHeight - 10} textAnchor="middle" className="text-xs fill-surface-600">
                ${(maxCost / 1000).toFixed(0)}K
              </text>

              {/* Y-axis labels */}
              <text x={20} y={chartHeight - padding + 4} textAnchor="middle" className="text-xs fill-surface-600">
                0
              </text>
              <text x={20} y={padding + 4} textAnchor="middle" className="text-xs fill-surface-600">
                10
              </text>

              {/* Axis titles */}
              <text x={chartWidth / 2} y={chartHeight - 5} textAnchor="middle" className="text-sm fill-surface-700 font-medium">
                Cost ($)
              </text>
              <text x={15} y={chartHeight / 2} textAnchor="middle" className="text-sm fill-surface-700 font-medium" transform={`rotate(-90 15 ${chartHeight / 2})`}>
                Trust Score
              </text>

              {/* Data points */}
              {filteredSuppliers.map((supplier, index) => {
                const x = getXPosition(supplier.cost);
                const y = getYPosition(supplier.trustScore);
                const size = getSupplierSize(supplier.trustScore, supplier.category);
                const color = getSupplierColor(supplier.category);
                const isSelected = selectedSupplierId === supplier.id;

                return (
                  <g key={supplier.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill={color}
                      stroke={isSelected ? '#1e293b' : 'rgba(255,255,255,0.8)'}
                      strokeWidth={isSelected ? 3 : 2}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSupplierSelect && onSupplierSelect(supplier)}
                      onMouseEnter={() => setHoveredSupplier(supplier)}
                      onMouseLeave={() => setHoveredSupplier(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredSupplier && (
              <div className="absolute z-10 bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-surface-200/50 max-w-sm pointer-events-none"
                style={{
                  left: Math.min(getXPosition(hoveredSupplier.cost) + 20, chartWidth - 250),
                  top: Math.max(getYPosition(hoveredSupplier.trustScore) - 100, 10)
                }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getSupplierGradient(hoveredSupplier.category)} rounded-lg flex items-center justify-center`}>
                    {hoveredSupplier.category === 'trusted' ? (
                      <Award className="w-4 h-4 text-white" />
                    ) : hoveredSupplier.category === 'empanelled' ? (
                      <Shield className="w-4 h-4 text-white" />
                    ) : (
                      <Zap className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900">{hoveredSupplier.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${hoveredSupplier.category === 'trusted' ? 'bg-primary-100 text-primary-700' :
                      hoveredSupplier.category === 'empanelled' ? 'bg-accent-100 text-accent-700' :
                        'bg-warning-100 text-warning-700'
                      }`}>
                      {hoveredSupplier.category.charAt(0).toUpperCase() + hoveredSupplier.category.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-surface-50 p-2 rounded-lg">
                    <div className="flex items-center space-x-1 mb-1">
                      <Target className="w-3 h-3 text-primary-600" />
                      <span className="text-xs font-medium text-surface-600">Cost</span>
                    </div>
                    <div className="text-sm font-bold text-surface-900">${hoveredSupplier.cost.toLocaleString()}</div>
                  </div>
                  <div className="bg-surface-50 p-2 rounded-lg">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="w-3 h-3 text-warning-500" />
                      <span className="text-xs font-medium text-surface-600">Trust</span>
                    </div>
                    <div className="text-sm font-bold text-surface-900">{hoveredSupplier.trustScore}/10</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-600">Region:</span>
                    <span className="text-xs font-medium text-surface-900">{hoveredSupplier.region}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-600">Risk:</span>
                    <span className={`text-xs font-medium ${hoveredSupplier.riskLevel === 'Low' ? 'text-emerald-600' :
                      hoveredSupplier.riskLevel === 'Medium' ? 'text-warning-600' : 'text-red-600'
                      }`}>
                      {hoveredSupplier.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced AI Insights */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-emerald-500/10 rounded-2xl p-6 border border-primary-200/50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-surface-900 mb-3 text-lg">
                AI-Powered Procurement Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 text-sm">Sweet Spot Zone</div>
                    <div className="text-sm text-surface-600">
                      Top-left quadrant offers optimal trust-cost balance
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-warning-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 text-sm">Risk vs Reward</div>
                    <div className="text-sm text-surface-600">
                      New suppliers may offer savings but need assessment
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-accent-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 text-sm">Trust Premium</div>
                    <div className="text-sm text-surface-600">
                      Trusted suppliers ensure reliability and quality
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SupplierTrustGraph;
