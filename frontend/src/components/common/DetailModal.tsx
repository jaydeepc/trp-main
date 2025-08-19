import React, { useState, useEffect } from 'react';
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

interface DetailModalProps {
    featureId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ featureId, isOpen, onClose }) => {
    const [feature, setFeature] = useState<FeatureDetail | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'metrics' | 'integration'>('overview');

    useEffect(() => {
        if (featureId) {
            const featureData = getFeatureDetail(featureId);
            setFeature(featureData);
            setActiveTab('overview'); // Reset to overview when feature changes
        }
    }, [featureId]);

    if (!isOpen || !feature) return null;

    // Icon mapping
    const getIcon = (iconName: string): React.ReactNode => {
        const iconMap: Record<string, React.ReactNode> = {
            Bot: <Bot className="w-6 h-6" />,
            Mic: <Mic className="w-6 h-6" />,
            BarChart3: <BarChart3 className="w-6 h-6" />,
            Users: <Users className="w-6 h-6" />,
            CheckCircle: <CheckCircle className="w-6 h-6" />,
            DollarSign: <DollarSign className="w-6 h-6" />,
            Network: <Network className="w-6 h-6" />,
            Upload: <Upload className="w-6 h-6" />
        };
        return iconMap[iconName] || <Bot className="w-6 h-6" />;
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
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Description */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
            </div>

            {/* Technical Specs */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(feature.technicalSpecs).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">{value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h3>
                <div className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demo Data */}
            {feature.demoData && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Data</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(feature.demoData).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-sm font-bold text-blue-700">
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
        <div className="space-y-6">
            {/* Key Features */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="space-y-3">
                    {feature.keyFeatures.map((keyFeature, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{keyFeature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Use Cases */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Use Cases</h3>
                <div className="space-y-3">
                    {feature.useCases.map((useCase, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Target className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{useCase}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Integrations */}
            {feature.integrations && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Integrations</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {feature.integrations.map((integration, index) => (
                            <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                                <span className="text-sm font-medium text-indigo-700">{integration}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderMetricsTab = () => (
        <div className="space-y-6">
            {feature.metrics && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feature.metrics.map((metric, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                                    {getTrendIcon(metric.trend)}
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Additional Performance Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">Performance Insights</h4>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-800">Real-time monitoring and analytics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-800">Continuous performance optimization</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-800">Industry-leading benchmarks</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderIntegrationTab = () => (
        <div className="space-y-6">
            {/* Related Features */}
            {feature.relatedFeatures && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Features</h3>
                    <div className="space-y-3">
                        {feature.relatedFeatures.map((relatedId, index) => {
                            const relatedFeature = getFeatureDetail(relatedId);
                            if (!relatedFeature) return null;
                            
                            return (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${categoryColors[relatedFeature.category]}`}>
                                            {getIcon(relatedFeature.icon)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{relatedFeature.title}</h4>
                                            <p className="text-sm text-gray-600">{relatedFeature.subtitle}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Integration Architecture */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Integration Architecture</h4>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <Network className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800">API-first design with REST and GraphQL support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800">Real-time data synchronization</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800">Enterprise-grade security and compliance</span>
                    </div>
                </div>
            </div>

            {/* System Requirements */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Requirements</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-medium text-gray-900 mb-2">Minimum Requirements</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                                <li>• Stable internet connection (1 Mbps+)</li>
                                <li>• JavaScript enabled</li>
                                <li>• Microphone access (for voice features)</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 mb-2">Recommended</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• High-speed internet (10 Mbps+)</li>
                                <li>• Latest browser version</li>
                                <li>• Quality microphone/headset</li>
                                <li>• Desktop or tablet device</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${categoryColors[feature.category]} bg-white/20`}>
                                {getIcon(feature.icon)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{feature.title}</h2>
                                <p className="text-gray-300">{feature.subtitle}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${categoryColors[feature.category]} bg-white/20`}>
                                    {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'features', label: 'Features' },
                            { id: 'metrics', label: 'Metrics' },
                            { id: 'integration', label: 'Integration' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'features' && renderFeaturesTab()}
                    {activeTab === 'metrics' && renderMetricsTab()}
                    {activeTab === 'integration' && renderIntegrationTab()}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Powered by Google Gemini Live API • Real-time AI Processing
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
