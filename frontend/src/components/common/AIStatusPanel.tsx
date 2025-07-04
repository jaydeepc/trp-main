import React, { useState, useEffect } from 'react';
import { Brain, Zap, Database, Globe, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import Card from './Card';

interface AIService {
  id: string;
  name: string;
  status: 'active' | 'processing' | 'idle' | 'error';
  description: string;
  icon: React.ReactNode;
  lastActivity?: string;
  processingCount?: number;
}

interface AIStatusPanelProps {
  className?: string;
}

const AIStatusPanel: React.FC<AIStatusPanelProps> = ({ className = '' }) => {
  const [services, setServices] = useState<AIService[]>([
    {
      id: 'gemini-vision',
      name: 'Gemini Vision AI',
      status: 'active',
      description: 'Design analysis & material identification',
      icon: <Brain className="w-4 h-4" />,
      lastActivity: '2 min ago',
      processingCount: 3,
    },
    {
      id: 'zbc-engine',
      name: 'ZBC Analysis Engine',
      status: 'processing',
      description: 'Zero-based cost calculations',
      icon: <Zap className="w-4 h-4" />,
      lastActivity: 'Now',
      processingCount: 1,
    },
    {
      id: 'supplier-intelligence',
      name: 'Supplier Intelligence',
      status: 'active',
      description: 'Trust scoring & matching algorithms',
      icon: <Database className="w-4 h-4" />,
      lastActivity: '5 min ago',
      processingCount: 0,
    },
    {
      id: 'market-data',
      name: 'Market Data Sync',
      status: 'idle',
      description: 'Real-time pricing & availability',
      icon: <Globe className="w-4 h-4" />,
      lastActivity: '1 hour ago',
      processingCount: 0,
    },
  ]);

  const [systemHealth, setSystemHealth] = useState(98);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => {
        // Randomly update processing counts and status
        const random = Math.random();
        if (random < 0.1) { // 10% chance of status change
          const statuses: AIService['status'][] = ['active', 'processing', 'idle'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return {
            ...service,
            status: newStatus,
            processingCount: newStatus === 'processing' ? Math.floor(Math.random() * 5) : 0,
            lastActivity: newStatus === 'processing' ? 'Now' : service.lastActivity,
          };
        }
        return service;
      }));

      // Update system health
      setSystemHealth(prev => {
        const change = (Math.random() - 0.5) * 2; // -1 to +1
        return Math.max(95, Math.min(100, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: AIService['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'idle':
        return 'text-gray-500';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status: AIService['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100';
      case 'processing':
        return 'bg-blue-100';
      case 'idle':
        return 'bg-gray-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: AIService['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />;
      case 'idle':
        return <div className="w-3 h-3 rounded-full bg-current opacity-50" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-current opacity-50" />;
    }
  };

  const activeServices = services.filter(s => s.status === 'active' || s.status === 'processing').length;
  const totalProcessing = services.reduce((sum, s) => sum + (s.processingCount || 0), 0);

  return (
    <Card className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-dark-slate-gray">AI System Status</h3>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-accent-teal" />
            <span className="text-sm font-medium text-accent-teal">Live</span>
          </div>
        </div>
        
        {/* System Health */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-medium-gray">System Health</span>
              <span className="font-medium text-dark-slate-gray">{systemHealth.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${systemHealth}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{activeServices}</div>
            <div className="text-xs text-blue-600">Active Services</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{totalProcessing}</div>
            <div className="text-xs text-orange-600">Processing Queue</div>
          </div>
        </div>
      </div>

      {/* AI Services List */}
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className={`flex items-center justify-center w-8 h-8 ${getStatusBg(service.status)} rounded-lg`}>
              <span className={getStatusColor(service.status)}>{service.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-dark-slate-gray text-sm truncate">{service.name}</h4>
                <div className={`flex items-center space-x-1 ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="text-xs font-medium capitalize">{service.status}</span>
                </div>
              </div>
              <p className="text-xs text-medium-gray truncate">{service.description}</p>
              {service.lastActivity && (
                <p className="text-xs text-medium-gray">Last: {service.lastActivity}</p>
              )}
            </div>

            {service.processingCount !== undefined && service.processingCount > 0 && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {service.processingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-start space-x-2">
          <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-purple-800 mb-1">AI Performance Today</h4>
            <div className="text-purple-700 space-y-0.5">
              <p>• Processed 47 design files with 94% accuracy</p>
              <p>• Generated $2.3M in cost savings recommendations</p>
              <p>• Matched 156 suppliers across 23 RFQs</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIStatusPanel;
