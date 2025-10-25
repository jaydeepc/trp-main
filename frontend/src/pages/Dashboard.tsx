import React, { useState, useEffect } from 'react';
import {
  Plus, TrendingUp, Clock, AlertTriangle,
  BarChart3, Sparkles, Brain,
  Activity, DollarSign, Users, Award, ArrowUpRight, MessageCircle
} from 'lucide-react';
import { useRFQ } from '../contexts/RFQContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SupplierTrustGraph from '../components/common/SupplierTrustGraph';
import StaticMetricCard from '../components/common/StaticMetricCard';
import InfoTooltip from '../components/common/InfoTooltip';

interface DashboardProps {
  onCreateRFQ: () => void;
  onViewRFQ: (rfqId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateRFQ, onViewRFQ }) => {
  const { rfqs, fetchRFQs } = useRFQ();
  const { currentUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [rfqFilter, setRfqFilter] = useState<'all' | 'draft' | 'sent' | 'in-progress'>('all');

  const getUserFirstName = () => {
    console.log(currentUser);
    
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'there';
  };

  useEffect(() => {
    fetchRFQs();
    setTimeout(() => setIsLoaded(true), 300);
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

  const filteredRFQs = rfqFilter === 'all'
    ? rfqs
    : rfqs.filter(rfq => {
      if (rfqFilter === 'draft') return rfq.status === 'draft';
      if (rfqFilter === 'sent') return rfq.status === 'sent' || rfq.status === 'completed';
      if (rfqFilter === 'in-progress') return rfq.status === 'in-progress';
      return true;
    });

  const recentRFQs = filteredRFQs.slice(0, 5);

  const mockSuppliers = Array.from({ length: 200 }, (_, index) => {
    const categories = ['trusted', 'empanelled', 'new'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
    const certifications = ['ISO 9001', 'ISO 14001', 'SOC 2', 'RoHS Compliant', 'CE Marking', 'UL Listed', 'FCC Certified'];

    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];

    let trustScore;
    if (category === 'trusted') {
      trustScore = 8.5 + Math.random() * 1.5;
    } else if (category === 'empanelled') {
      trustScore = 7.0 + Math.random() * 2.0;
    } else {
      trustScore = 5.0 + Math.random() * 3.0;
    }

    const baseCost = 5000 + Math.random() * 45000;
    const regionMultiplier = region === 'North America' ? 1.2 : region === 'Europe' ? 1.1 : 0.9;
    const categoryMultiplier = category === 'trusted' ? 1.15 : category === 'empanelled' ? 1.0 : 0.85;

    const cost = Math.round(baseCost * regionMultiplier * categoryMultiplier);

    let riskLevel;
    if (trustScore >= 8.5) riskLevel = 'Low';
    else if (trustScore >= 7.0) riskLevel = 'Medium';
    else riskLevel = 'High';

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
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Enhanced Premium Design */}
        <div className={`mb-16 mt-10 transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-surface-900 mb-4 tracking-tight">
              Hey {getUserFirstName()} 👋
            </h1>
            <p className="text-xl font-medium text-surface-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Let's make your next procurement smarter, faster, easier.
            </p>

            {/* Enhanced Primary CTA with Pixel-Perfect Styling */}
            <button
              onClick={() => {
                // This should trigger the Robbie panel in Layout
                const robbieBtn = document.querySelector('[data-robbie-fab]') as HTMLElement;
                if (robbieBtn) robbieBtn.click();
              }}
              className="group relative bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-10 py-5 rounded-xl font-semibold text-[15px] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center space-x-3 mx-auto overflow-hidden"
            >
              {/* Subtle animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <MessageCircle className="w-7 h-7 relative z-10" />
              <span className="text-lg relative z-10">Let Robbie Help You Get Started</span>
            </button>

            <p className="text-base text-surface-500 mt-6 max-w-2xl mx-auto font-medium">
              Upload a BOM, create an RFQ, or review supplier insights — all powered by AI.
            </p>
          </div>
        </div>

        {/* KPI Summary Cards with Enhanced Visual Hierarchy */}
        <div className={`mb-12 transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-surface-900 mb-3 flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span>Your Procurement Snapshot</span>
            </h2>
            {/* Colored accent bar */}
            <div className="h-1 w-8 bg-blue-500 rounded-full mx-auto mt-2 mb-3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
        </div>

        {/* Robbie's Smart Suggestions - Enhanced with Personality */}
        <div className={`mb-12 transition-all duration-700 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative">
            <Card className="bg-gradient-to-br from-blue-50 via-primary-50 to-accent-50 border-2 border-primary-200 hover:border-primary-300 transition-all duration-300 p-6 shadow-lg hover:shadow-xl">
              <div className="flex items-start space-x-5">
                {/* Robbie Avatar with Personality */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-bold text-surface-900">Robbie here!</h3>
                  </div>
                  <p className="text-base text-surface-800 mb-5 font-medium italic leading-relaxed">
                    "I noticed you added 2 new suppliers to your network. Want me to draft an RFQ to get competitive quotes from them? I can make this super easy for you!"
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      onClick={onCreateRFQ}
                      className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Yes, let's do it!
                    </Button>
                    <Button
                      variant="secondary"
                      className="bg-white hover:bg-surface-50 text-surface-700 border-2 border-surface-200 hover:border-surface-300 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                    >
                      Maybe later
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Supplier Intelligence Matrix + AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Supplier Trust Graph - Enhanced */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <SupplierTrustGraph
              componentName="All Supplier Categories"
              suppliers={mockSuppliers}
              className="h-full"
            />
          </div>

          {/* Quick Actions & Insights */}
          <div className={`space-y-6 transition-all duration-700 delay-1000 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            {/* AI Insights Panel */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900">Insights from Robbie</h3>
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
          </div>
        </div>

        {/* Recent Activity - Enhanced */}
        <div className={`transition-all duration-700 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-surface-900">Recent RFQs</h3>
                  <p className="text-surface-600 font-medium">Continue where you left off</p>
                </div>
              </div>
              <button className="group text-primary-600 hover:text-primary-700 font-semibold text-base flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-all duration-300">
                <span>View all</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </button>
            </div>

            {/* Filter Tags */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setRfqFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rfqFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setRfqFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rfqFilter === 'draft'
                  ? 'bg-warning-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
              >
                Draft
              </button>
              <button
                onClick={() => setRfqFilter('sent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rfqFilter === 'sent'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
              >
                Sent
              </button>
              <button
                onClick={() => setRfqFilter('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rfqFilter === 'in-progress'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
              >
                In Progress
              </button>
            </div>

            <div className="space-y-3">
              {recentRFQs.length > 0 ? (
                recentRFQs.map((rfq, index) => (
                  <div
                    key={rfq.rfqId}
                    onClick={() => onViewRFQ(rfq.rfqId)}
                    className="group bg-surface-50 hover:bg-surface-100 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <BarChart3 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                            {rfq.rfqId}
                          </div>
                          <div className="text-sm text-surface-600">
                            Created {new Date(rfq.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${rfq.status === 'completed' || rfq.status === 'sent'
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
