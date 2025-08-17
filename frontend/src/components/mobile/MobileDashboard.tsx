import React, { useState, useEffect } from 'react';
import {
  Plus, TrendingUp, Clock, AlertTriangle,
  BarChart3, Sparkles, Brain, Target,
  Activity, DollarSign, Users, Award, ArrowUpRight,
  Calendar, ChevronRight, Eye, Filter
} from 'lucide-react';
import { useRFQ } from '../../contexts/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
import StaticMetricCard from '../common/StaticMetricCard';

interface MobileDashboardProps {
  onCreateRFQ: () => void;
  onViewRFQ: (rfqId: string) => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ onCreateRFQ, onViewRFQ }) => {
  const { rfqs, loading, fetchRFQs } = useRFQ();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rfqs' | 'insights'>('overview');

  useEffect(() => {
    fetchRFQs();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-surface-900 mb-2">
          Welcome back, Admin
        </h2>
        <p className="text-surface-600 mb-4">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div className="text-lg font-bold text-primary-600">
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-surface-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onCreateRFQ}
            className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white p-4 rounded-xl flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Create Smart RFQ</span>
            </div>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-surface-50 hover:bg-surface-100 p-3 rounded-xl transition-colors">
              <Target className="w-5 h-5 text-primary-600 mb-2 mx-auto" />
              <div className="text-sm font-medium text-surface-700">Analytics</div>
            </button>
            <button className="bg-surface-50 hover:bg-surface-100 p-3 rounded-xl transition-colors">
              <Users className="w-5 h-5 text-accent-600 mb-2 mx-auto" />
              <div className="text-sm font-medium text-surface-700">Suppliers</div>
            </button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
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
          title="Active"
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
          description="engagement"
        />
      </div>

      {/* AI Insights */}
      <Card className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-surface-900">AI Insights</h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-100">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-4 h-4 text-primary-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-surface-900 text-sm mb-1">Cost Optimization</h4>
                <p className="text-xs text-surface-600">
                  Identified 15.2% potential savings in Q1 procurement
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-accent-50 to-emerald-50 rounded-lg border border-accent-100">
            <div className="flex items-start space-x-3">
              <Users className="w-4 h-4 text-accent-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-surface-900 text-sm mb-1">Supplier Diversity</h4>
                <p className="text-xs text-surface-600">
                  3 new qualified suppliers added this month
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-warning-50 to-orange-50 rounded-lg border border-warning-100">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-warning-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-surface-900 text-sm mb-1">Risk Alert</h4>
                <p className="text-xs text-surface-600">
                  2 suppliers require compliance review
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderRFQsTab = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-surface-900">Recent RFQs</h3>
        <button className="flex items-center space-x-1 text-primary-600 text-sm">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* RFQ List */}
      <div className="space-y-3">
        {recentRFQs.length > 0 ? (
          recentRFQs.map((rfq) => (
            <Card
              key={rfq.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewRFQ(rfq.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium text-surface-900 text-sm">
                      {rfq.rfqNumber}
                    </div>
                    <div className="text-xs text-surface-600">
                      Created {new Date(rfq.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${rfq.status === 'completed' || rfq.status === 'sent'
                      ? 'bg-emerald-100 text-emerald-700'
                      : rfq.status === 'in-progress'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                    {rfq.status}
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-400" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-surface-400" />
            </div>
            <h4 className="font-medium text-surface-900 mb-2">No RFQs yet</h4>
            <p className="text-surface-600 mb-4 text-sm">Create your first Smart RFQ to get started</p>
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
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="p-4">
        <h3 className="font-semibold text-surface-900 mb-4">Performance Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600">Average Processing Time</span>
            <span className="font-semibold text-surface-900">{stats.avgProcessingTime} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600">Cost Optimization</span>
            <span className="font-semibold text-emerald-600">+{stats.costOptimization}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600">Risk Reduction</span>
            <span className="font-semibold text-blue-600">{stats.riskReduction}%</span>
          </div>
        </div>
      </Card>

      {/* Supplier Insights */}
      <Card className="p-4">
        <h3 className="font-semibold text-surface-900 mb-4">Supplier Insights</h3>
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-800">Trusted Suppliers</span>
              <span className="text-lg font-bold text-emerald-600">67</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Empanelled</span>
              <span className="text-lg font-bold text-blue-600">89</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800">New Suppliers</span>
              <span className="text-lg font-bold text-orange-600">44</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '44%' }}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-semibold text-surface-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-surface-900">New RFQ created for Aluminum Components</p>
              <p className="text-xs text-surface-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-surface-900">Supplier evaluation completed</p>
              <p className="text-xs text-surface-600">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-warning-600 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-surface-900">Cost analysis updated</p>
              <p className="text-xs text-surface-600">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b border-surface-200">
        <div className="flex">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${selectedTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-surface-600 hover:text-surface-900'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('rfqs')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${selectedTab === 'rfqs'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-surface-600 hover:text-surface-900'
              }`}
          >
            RFQs
          </button>
          <button
            onClick={() => setSelectedTab('insights')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${selectedTab === 'insights'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-surface-600 hover:text-surface-900'
              }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'rfqs' && renderRFQsTab()}
        {selectedTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default MobileDashboard;
