import React, { useState } from 'react';
import { 
    X, 
    Bot, 
    Mic, 
    BarChart3, 
    Users, 
    CheckCircle, 
    DollarSign, 
    Network, 
    Upload,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronRight,
    Star,
    Clock,
    Target,
    Zap
} from 'lucide-react';
import { FeatureDetail, getFeatureDetail } from '../../data/featureDetails';

interface DetailWindowProps {
    featureId: string;
    onClose: () => void;
    queryContext?: string;
}

const DetailWindow: React.FC<DetailWindowProps> = ({ featureId, onClose, queryContext }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'metrics' | 'integration'>('overview');
    const feature = getFeatureDetail(featureId);

    // Generate dynamic content based on query context
    const getDynamicContent = (baseFeature: FeatureDetail, context?: string) => {
        if (!context) return baseFeature;

        const contextLower = context.toLowerCase();
        console.log('🎯 Dynamic content context:', contextLower);
        
        // Create dynamic variations based on what user is asking about
        const dynamicFeature = { ...baseFeature };

        // Dynamic title and subtitle based on context
        if (contextLower.includes('cost') || contextLower.includes('price') || contextLower.includes('savings')) {
            dynamicFeature.title = `${baseFeature.title} - Cost Analysis`;
            dynamicFeature.subtitle = 'Cost Optimization & Savings Analysis';
            console.log('🎯 Applied cost context');
        } else if (contextLower.includes('speed') || contextLower.includes('fast') || contextLower.includes('performance')) {
            dynamicFeature.title = `${baseFeature.title} - Performance`;
            dynamicFeature.subtitle = 'Speed & Performance Metrics';
            console.log('🎯 Applied performance context');
        } else if (contextLower.includes('accuracy') || contextLower.includes('reliable') || contextLower.includes('quality')) {
            dynamicFeature.title = `${baseFeature.title} - Accuracy`;
            dynamicFeature.subtitle = 'Precision & Reliability Analysis';
            console.log('🎯 Applied accuracy context');
        } else if (contextLower.includes('integration') || contextLower.includes('connect') || contextLower.includes('api')) {
            dynamicFeature.title = `${baseFeature.title} - Integration`;
            dynamicFeature.subtitle = 'System Connectivity & APIs';
            console.log('🎯 Applied integration context');
        } else if (contextLower.includes('security') || contextLower.includes('compliance') || contextLower.includes('safe')) {
            dynamicFeature.title = `${baseFeature.title} - Security`;
            dynamicFeature.subtitle = 'Security & Compliance Overview';
            console.log('🎯 Applied security context');
        } else if (contextLower.includes('detail') || contextLower.includes('information') || contextLower.includes('about')) {
            // For generic requests like "supplier detail", enhance the subtitle to be more descriptive
            dynamicFeature.title = `${baseFeature.title} - Detailed Overview`;
            dynamicFeature.subtitle = `Complete ${baseFeature.title} Information & Analysis`;
            console.log('🎯 Applied generic detail context');
        } else {
            console.log('🎯 No specific context matched, using base feature');
        }

        // Filter and prioritize content based on context
        if (contextLower.includes('cost') || contextLower.includes('savings')) {
            // Prioritize cost-related features and benefits
            dynamicFeature.keyFeatures = baseFeature.keyFeatures.filter(f => 
                f.toLowerCase().includes('cost') || 
                f.toLowerCase().includes('price') || 
                f.toLowerCase().includes('saving') ||
                f.toLowerCase().includes('optimization') ||
                f.toLowerCase().includes('budget')
            ).concat(baseFeature.keyFeatures.filter(f => 
                !f.toLowerCase().includes('cost') && 
                !f.toLowerCase().includes('price') && 
                !f.toLowerCase().includes('saving') &&
                !f.toLowerCase().includes('optimization') &&
                !f.toLowerCase().includes('budget')
            ));

            dynamicFeature.benefits = baseFeature.benefits.filter(b => 
                b.toLowerCase().includes('cost') || 
                b.toLowerCase().includes('saving') ||
                b.toLowerCase().includes('reduction') ||
                b.toLowerCase().includes('budget') ||
                b.toLowerCase().includes('roi')
            ).concat(baseFeature.benefits.filter(b => 
                !b.toLowerCase().includes('cost') && 
                !b.toLowerCase().includes('saving') &&
                !b.toLowerCase().includes('reduction') &&
                !b.toLowerCase().includes('budget') &&
                !b.toLowerCase().includes('roi')
            ));
        }

        if (contextLower.includes('speed') || contextLower.includes('performance')) {
            // Prioritize performance-related content
            dynamicFeature.keyFeatures = baseFeature.keyFeatures.filter(f => 
                f.toLowerCase().includes('speed') || 
                f.toLowerCase().includes('fast') || 
                f.toLowerCase().includes('real-time') ||
                f.toLowerCase().includes('performance') ||
                f.toLowerCase().includes('quick')
            ).concat(baseFeature.keyFeatures.filter(f => 
                !f.toLowerCase().includes('speed') && 
                !f.toLowerCase().includes('fast') && 
                !f.toLowerCase().includes('real-time') &&
                !f.toLowerCase().includes('performance') &&
                !f.toLowerCase().includes('quick')
            ));
        }

        if (contextLower.includes('accuracy') || contextLower.includes('reliable')) {
            // Prioritize accuracy-related content
            dynamicFeature.keyFeatures = baseFeature.keyFeatures.filter(f => 
                f.toLowerCase().includes('accuracy') || 
                f.toLowerCase().includes('precise') || 
                f.toLowerCase().includes('reliable') ||
                f.toLowerCase().includes('quality') ||
                f.toLowerCase().includes('trust')
            ).concat(baseFeature.keyFeatures.filter(f => 
                !f.toLowerCase().includes('accuracy') && 
                !f.toLowerCase().includes('precise') && 
                !f.toLowerCase().includes('reliable') &&
                !f.toLowerCase().includes('quality') &&
                !f.toLowerCase().includes('trust')
            ));
        }

        return dynamicFeature;
    };

    const dynamicFeature = feature ? getDynamicContent(feature, queryContext) : null;

    // Debug logging
    console.log('🔍 DetailWindow Debug Info:');
    console.log('  Feature ID:', featureId);
    console.log('  Query Context:', queryContext);
    console.log('  Base Feature Title:', feature?.title);
    console.log('  Dynamic Feature Title:', dynamicFeature?.title);
    console.log('  Dynamic Feature Subtitle:', dynamicFeature?.subtitle);

    if (!feature) {
        return (
            <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Feature not found</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // Icon mapping
    const getIcon = (iconName: string): React.ReactNode => {
        const iconMap: Record<string, React.ReactNode> = {
            Bot: <Bot className="w-5 h-5" />,
            Mic: <Mic className="w-5 h-5" />,
            BarChart3: <BarChart3 className="w-5 h-5" />,
            Users: <Users className="w-5 h-5" />,
            CheckCircle: <CheckCircle className="w-5 h-5" />,
            DollarSign: <DollarSign className="w-5 h-5" />,
            Network: <Network className="w-5 h-5" />,
            Upload: <Upload className="w-5 h-5" />
        };
        return iconMap[iconName] || <Bot className="w-5 h-5" />;
    };

    // Category colors
    const categoryColors: Record<string, string> = {
        core: 'bg-blue-500/20 border-blue-500/40 text-blue-600',
        analysis: 'bg-green-500/20 border-green-500/40 text-green-600',
        intelligence: 'bg-purple-500/20 border-purple-500/40 text-purple-600',
        automation: 'bg-red-500/20 border-red-500/40 text-red-600',
        optimization: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-600',
        integration: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-600'
    };

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-3 h-3 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-3 h-3 text-red-500" />;
            default:
                return <Minus className="w-3 h-3 text-gray-500" />;
        }
    };

    const renderOverviewTab = () => (
        <div className="space-y-4">
            {/* Query Context Banner */}
            {queryContext && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">
                            Showing details based on: "{queryContext}"
                        </span>
                    </div>
                </div>
            )}

            {/* Description */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{dynamicFeature?.description}</p>
            </div>

            {/* Technical Specs */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Technical Specifications</h4>
                <div className="space-y-2">
                    {Object.entries(dynamicFeature?.technicalSpecs || {}).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-xs font-semibold text-gray-900">{value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demo Data */}
            {dynamicFeature?.demoData && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Live Data</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                        <div className="space-y-2">
                            {Object.entries(dynamicFeature.demoData).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-600 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-xs font-bold text-blue-700">
                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFeaturesTab = () => (
        <div className="space-y-4">
            {/* Key Features */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h4>
                <div className="space-y-2">
                    {dynamicFeature?.keyFeatures.slice(0, 4).map((keyFeature, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                            <Zap className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{keyFeature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Use Cases */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Use Cases</h4>
                <div className="space-y-2">
                    {dynamicFeature?.useCases.slice(0, 3).map((useCase, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <Target className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{useCase}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMetricsTab = () => (
        <div className="space-y-4">
            {feature.metrics && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {feature.metrics.map((metric, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-600">{metric.label}</span>
                                    {getTrendIcon(metric.trend)}
                                </div>
                                <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Benefits */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Benefits</h4>
                <div className="space-y-2">
                    {dynamicFeature?.benefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderIntegrationTab = () => (
        <div className="space-y-4">
            {/* Related Features */}
            {feature.relatedFeatures && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Related Features</h4>
                    <div className="space-y-2">
                        {feature.relatedFeatures.map((relatedId, index) => {
                            const relatedFeature = getFeatureDetail(relatedId);
                            if (!relatedFeature) return null;
                            
                            return (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <div className={`p-1 rounded ${categoryColors[relatedFeature.category]}`}>
                                            {getIcon(relatedFeature.icon)}
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-900">{relatedFeature.title}</h5>
                                            <p className="text-xs text-gray-600">{relatedFeature.subtitle}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-gray-400" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Integrations */}
            {feature.integrations && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Supported Integrations</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {feature.integrations.slice(0, 6).map((integration, index) => (
                            <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-center">
                                <span className="text-xs font-medium text-indigo-700">{integration}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
            {/* Header - Now uses dynamic feature data */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${categoryColors[feature.category]} bg-white/20`}>
                            {getIcon(feature.icon)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{dynamicFeature?.title}</h3>
                            <p className="text-sm text-white/90">{dynamicFeature?.subtitle}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${categoryColors[feature.category]} bg-white/20`}>
                                {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-4 px-4">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'features', label: 'Features' },
                        { id: 'metrics', label: 'Metrics' },
                        { id: 'integration', label: 'Integration' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-3 px-1 border-b-2 font-medium text-xs transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'features' && renderFeaturesTab()}
                {activeTab === 'metrics' && renderMetricsTab()}
                {activeTab === 'integration' && renderIntegrationTab()}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-2xl">
                <div className="flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailWindow;
