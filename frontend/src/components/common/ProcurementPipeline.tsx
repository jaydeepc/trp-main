import React from 'react';
import { FileText, Brain, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card from './Card';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

interface ProcurementPipelineProps {
  className?: string;
}

const ProcurementPipeline: React.FC<ProcurementPipelineProps> = ({ className = '' }) => {
  const pipelineStages: PipelineStage[] = [
    {
      id: 'draft',
      name: 'Draft RFQs',
      count: 3,
      icon: <FileText className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      description: 'Being prepared',
    },
    {
      id: 'ai-processing',
      name: 'AI Analysis',
      count: 2,
      icon: <Brain className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Under AI review',
    },
    {
      id: 'supplier-matching',
      name: 'Supplier Matching',
      count: 5,
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Finding suppliers',
    },
    {
      id: 'active-rfqs',
      name: 'Active RFQs',
      count: 8,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Awaiting responses',
    },
    {
      id: 'completed',
      name: 'Completed',
      count: 12,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Successfully closed',
    },
  ];

  const totalRFQs = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <Card className={className}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark-slate-gray mb-2">
          Procurement Pipeline
        </h3>
        <p className="text-sm text-medium-gray">
          Real-time view of your RFQ workflow ({totalRFQs} total RFQs)
        </p>
      </div>

      {/* Pipeline Visualization */}
      <div className="space-y-4">
        {pipelineStages.map((stage, index) => {
          const percentage = totalRFQs > 0 ? (stage.count / totalRFQs) * 100 : 0;
          
          return (
            <div key={stage.id} className="relative">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 ${stage.bgColor} rounded-lg`}>
                    <span className={stage.color}>{stage.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-dark-slate-gray">{stage.name}</h4>
                    <p className="text-xs text-medium-gray">{stage.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-dark-slate-gray">{stage.count}</span>
                  <p className="text-xs text-medium-gray">{percentage.toFixed(0)}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${stage.color.replace('text-', '#').replace('-600', '')} 0%, ${stage.color.replace('text-', '#').replace('-600', '')}80 100%)`,
                    backgroundColor: stage.color.includes('gray') ? '#9CA3AF' :
                                   stage.color.includes('purple') ? '#9333EA' :
                                   stage.color.includes('blue') ? '#2563EB' :
                                   stage.color.includes('orange') ? '#EA580C' :
                                   stage.color.includes('green') ? '#16A34A' : '#6B7280',
                  }}
                />
              </div>

              {/* Connection Line to Next Stage */}
              {index < pipelineStages.length - 1 && (
                <div className="absolute left-4 top-12 w-px h-4 bg-gray-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-blue-800 mb-1">Pipeline Insights</h4>
            <div className="text-blue-700 space-y-1">
              <p>• <strong>Bottleneck Alert:</strong> {pipelineStages[3].count} RFQs awaiting supplier responses</p>
              <p>• <strong>AI Efficiency:</strong> Average processing time reduced by 65%</p>
              <p>• <strong>Success Rate:</strong> {((pipelineStages[4].count / totalRFQs) * 100).toFixed(0)}% completion rate this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-2">
        <button className="flex-1 px-3 py-2 text-xs font-medium text-accent-teal border border-accent-teal rounded-lg hover:bg-accent-teal hover:text-white transition-colors duration-200">
          View All RFQs
        </button>
        <button className="flex-1 px-3 py-2 text-xs font-medium text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-colors duration-200">
          Pipeline Analytics
        </button>
      </div>
    </Card>
  );
};

export default ProcurementPipeline;
