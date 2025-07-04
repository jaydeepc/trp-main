import React, { useState, useEffect } from 'react';
import { 
  Plus, TrendingUp, Clock, AlertTriangle, 
  BarChart3, Sparkles, Brain, Target, Globe, 
  Activity, DollarSign, Users, Award, ArrowUpRight,
  Calendar, Search, Bell, Settings
} from 'lucide-react';
import { useRFQ } from '../../context/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
import SupplierTrustGraph from '../common/SupplierTrustGraph';
import StaticMetricCard from '../common/StaticMetricCard';
import InfoTooltip from '../common/InfoTooltip';

interface DashboardProps {
  onCreateRFQ: () => void;
  onViewRFQ: (rfqId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateRFQ, onViewRFQ }) => {
  const { rfqs, loading, fetchRFQs } = useRFQ();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    fetchRFQs();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setTimeout(() => setIsLoaded(true), 300);
    return () => clearInterval(timer);
  }, [fetchRFQs]);

  const stats = {
    totalRFQs: rfqs.length,
    activeRFQs: rfqs.filter(rfq => rfq.status === 'in-progress' || rfq.status === 'draft').length,
    completedRFQs: rfqs.filter(rfq => rfq.status === 'sent' || rfq.status === 'completed').length,
    aiSavings: 23.5,
    avgProcessingTime: 2.3,
    supplierEngagement: 87,
    costOptimization: 15.2,
    riskReduction: 34
  };

  const recentRFQs = rfqs.slice(0, 5);

  // Import the 200 suppliers from mock data
  const mockSuppliers = Array.from({ length: 200 }, (_, index) => {
    const categories = ['trusted', 'empanelled', 'new'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
    const certifications = ['ISO 9001', 'ISO 14001', 'SOC 2', 'RoHS Compliant', 'CE Marking', 'UL Listed', 'FCC Certified'];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Trust score based on category
    let trustScore;
    if (category === 'trusted') {
      trustScore = 8.5 + Math.random() * 1.5; // 8.5-10
    } else if (category === 'empanelled') {
      trustScore = 7.0 + Math.random() * 2.0; // 7.0-9.0
    } else {
      trustScore = 5.0 + Math.random() * 3.0; // 5.0-8.0
    }
    
    // Cost varies by region and category
    const baseCost = 5000 + Math.random() * 45000; // $5K-$50K
    const regionMultiplier = region === 'North America' ? 1.2 : region === 'Europe' ? 1.1 : 0.9;
    const categoryMultiplier = category === 'trusted' ? 1.15 : category === 'empanelled' ? 1.0 : 0.85;
    
    const cost = Math.round(baseCost * regionMultiplier * categoryMultiplier);
    
    // Risk level based on trust score
    let riskLevel;
    if (trustScore >= 8.5) riskLevel = 'Low';
    else if (trustScore >= 7.0) riskLevel = 'Medium';
    else riskLevel = 'High';
    
    // Random certifications
    const supplierCertifications: string[] = [];
    const numCerts = Math.floor(Math.random() * 4) + (category === 'trusted' ? 2 : 0);
    for (let i = 0; i < numCerts; i++) {
      const cert = certifications[Math.floor(Math.random() * certifications.length)];
      if (!supplierCertifications.includes(cert)) {
        supplierCertifications.push(cert);
      }
    }
    
    const companyPrefixes = ['TechCorp', 'Global', 'Precision', 'Advanced', 'Elite', 'Premier', 'Superior', 'Innovative', 'Dynamic', 'Strategic'];
    const companySuffixes = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Manufacturing', 'Enterprises', 'Corporation', 'Group', 'Holdings', 'Partners'];
    
    const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
    const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
    
    return {
      id: `supplier-${index + 1}`,
      name: `${prefix} ${suffix}`,
      cost: cost,
      trustScore: Math.round(trustScore * 10) / 10,
      category: category as 'trusted' | 'empanelled' | 'new',
      region: region,
      certifications: supplierCertifications,
      riskLevel: riskLevel as 'Low' | 'Medium' | 'High'
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-surface-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className={`flex items-center space-x-4 transition-all duration-500 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900">Project Robbie</h1>
                <p className="text-surface-600 text-sm font-medium">AI-Powered Procurement Intelligence</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className={`flex items-center space-x-4 transition-all duration-500 delay-200 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="hidden md:flex items-center space-x-3 text-sm text-surface-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-primary-600 font-bold">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                  <Search className="w-5 h-5 text-surface-600" />
                </button>
                <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors relative">
                  <Bell className="w-5 h-5 text-surface-600" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></div>
                </button>
                <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                  <Settings className="w-5 h-5 text-surface-600" />
                </button>
              </div>

              <Button
                onClick={onCreateRFQ}
                className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                icon={<Plus className="w-4 h-4" />}
              >
                Create RFQ
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className={`mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-surface-900 mb-2">
                Welcome back, Admin
              </h2>
              <p className="text-lg text-surface-600">
                Here's what's happening with your procurement operations today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Static Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StaticMetricCard
            title="Total RFQs"
            value={stats.totalRFQs}
            icon={BarChart3}
            iconColor="text-primary-600"
            iconBgColor="bg-primary-100"
            trend="up"
            trendValue="+12%"
            description="vs last month"
          />
          <StaticMetricCard
            title="Active Projects"
            value={stats.activeRFQs}
            icon={Activity}
            iconColor="text-accent-600"
            iconBgColor="bg-accent-100"
            trend="up"
            trendValue="+8%"
            description="in progress"
          />
          <StaticMetricCard
            title="Cost Savings"
            value={stats.aiSavings}
            unit="%"
            icon={DollarSign}
            iconColor="text-warning-600"
            iconBgColor="bg-warning-100"
            trend="up"
            trendValue="+5.2%"
            description="AI optimization"
          />
          <StaticMetricCard
            title="Supplier Score"
            value={stats.supplierEngagement}
            unit="/100"
            icon={Award}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            trend="up"
            trendValue="+3%"
            description="engagement rate"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Supplier Trust Graph - Enhanced */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-800 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="mb-4 space-y-4">
              {/* Main Explanation */}
              <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mt-1">
                    <Target className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">Understanding the Supplier Matrix</h4>
                    <p className="text-sm text-surface-600 leading-relaxed mb-3">
                      This visualization shows all <strong>{mockSuppliers.length} suppliers</strong> in our database plotted by <strong>Trust Score vs Cost</strong>. 
                      The ideal suppliers are in the <strong>top-right quadrant</strong> (high trust, competitive cost). 
                      When creating Smart BOMs, suppliers are automatically filtered based on material compatibility and requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Graph Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-accent-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-accent-600" />
                    </div>
                    <h5 className="font-medium text-surface-900">Average Cost Line</h5>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    The <strong>vertical blue line</strong> represents the average cost across all suppliers (${Math.round(mockSuppliers.reduce((sum, s) => sum + s.cost, 0) / mockSuppliers.length / 1000)}K). 
                    Suppliers to the left are below average cost, those to the right are above average.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Award className="w-3 h-3 text-emerald-600" />
                    </div>
                    <h5 className="font-medium text-surface-900">Average Trust Line</h5>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    The <strong>horizontal green line</strong> shows average trust score ({(mockSuppliers.reduce((sum, s) => sum + s.trustScore, 0) / mockSuppliers.length).toFixed(1)}/10). 
                    Suppliers above this line have higher than average trust ratings.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Target className="w-3 h-3 text-primary-600" />
                    </div>
                    <h5 className="font-medium text-surface-900">Sweet Spot Zone</h5>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    The <strong>top-left quadrant</strong> contains the most valuable suppliers: 
                    high trust scores with below-average costs. These are your preferred partners.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-warning-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-warning-600" />
                    </div>
                    <h5 className="font-medium text-surface-900">Dot Sizes & Colors</h5>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    <strong>Dot size</strong> reflects trust score (larger = more trusted). 
                    <strong>Colors:</strong> Blue (trusted), Green (empanelled), Orange (new suppliers).
                  </p>
                </div>
              </div>
            </div>
            <SupplierTrustGraph
              componentName="All Supplier Categories"
              suppliers={mockSuppliers}
              className="h-full"
            />
          </div>

          {/* Quick Actions & Insights */}
          <div className={`space-y-6 transition-all duration-700 delay-900 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            {/* AI Insights Panel */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900">AI Insights</h3>
                <InfoTooltip
                  title="AI-Powered Insights"
                  description="Machine learning recommendations for cost optimization and risk management based on historical data and market trends."
                  businessValue="Leverage artificial intelligence to make data-driven procurement decisions and identify opportunities for savings."
                  position="bottom"
                />
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-surface-900 mb-1">Cost Optimization</h4>
                      <p className="text-sm text-surface-600">
                        Identified 15.2% potential savings in Q1 procurement
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-accent-50 to-emerald-50 rounded-xl border border-accent-100">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-accent-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-surface-900 mb-1">Supplier Diversity</h4>
                      <p className="text-sm text-surface-600">
                        3 new qualified suppliers added this month
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-warning-50 to-orange-50 rounded-xl border border-warning-100">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-surface-900 mb-1">Risk Alert</h4>
                      <p className="text-sm text-surface-600">
                        2 suppliers require compliance review
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={onCreateRFQ}
                  className="w-full group bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">Create Smart RFQ</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-surface-50 hover:bg-surface-100 p-3 rounded-xl transition-all duration-300 hover:scale-105 group">
                    <Target className="w-5 h-5 text-primary-600 mb-2 group-hover:animate-pulse" />
                    <div className="text-sm font-medium text-surface-700">Analytics</div>
                  </button>
                  <button className="bg-surface-50 hover:bg-surface-100 p-3 rounded-xl transition-all duration-300 hover:scale-105 group">
                    <Globe className="w-5 h-5 text-accent-600 mb-2 group-hover:animate-spin" />
                    <div className="text-sm font-medium text-surface-700">Suppliers</div>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`transition-all duration-700 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900">Recent RFQs</h3>
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1">
                <span>View all</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentRFQs.length > 0 ? (
                recentRFQs.map((rfq, index) => (
                  <div
                    key={rfq.id}
                    onClick={() => onViewRFQ(rfq.id)}
                    className="group bg-surface-50 hover:bg-surface-100 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <BarChart3 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                            {rfq.rfqNumber}
                          </div>
                          <div className="text-sm text-surface-600">
                            Created {new Date(rfq.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rfq.status === 'completed' || rfq.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rfq.status === 'in-progress'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-warning-100 text-warning-700'
                        }`}>
                          {rfq.status}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-surface-400 group-hover:text-primary-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-surface-400" />
                  </div>
                  <h4 className="font-medium text-surface-900 mb-2">No RFQs yet</h4>
                  <p className="text-surface-600 mb-4">Create your first Smart RFQ to get started</p>
                  <Button
                    onClick={onCreateRFQ}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Create RFQ
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
