import React, { useState } from 'react';
import { Eye, Send, Edit, FileText, Clock, MapPin, CreditCard, Shield, CheckCircle, AlertTriangle, TrendingUp, Users, Star, Award, Globe, Calendar, Download } from 'lucide-react';
import { RFQ } from '../../types';
import { useRFQ } from '../../context/RFQContext';
import Button from '../common/Button';
import Card from '../common/Card';
import SupplierTrustGraph from '../common/SupplierTrustGraph';

interface Step4PreviewRFQProps {
  rfq: RFQ;
  onPrevious: () => void;
  onComplete: () => void;
}

const Step4PreviewRFQ: React.FC<Step4PreviewRFQProps> = ({
  rfq,
  onPrevious,
  onComplete,
}) => {
  const { updateStep, loading } = useRFQ();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSendRFQ = async () => {
    try {
      await updateStep(rfq.id, 4, { action: 'send' });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error sending RFQ:', error);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    onComplete();
  };

  // Mock data for preview if no real data exists
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

  const commercialTerms = rfq.commercialTerms || {
    desiredLeadTime: '6-8 weeks',
    paymentTerms: 'Net 30' as const,
    deliveryLocation: 'San Francisco, CA, USA',
    complianceRequirements: ['ISO 9001', 'RoHS', 'REACH'],
    additionalRequirements: 'All components must be traceable to source materials.'
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTotalEstimate = () => {
    return components.reduce((total, component) => {
      const cost = parseFloat(component.zbcShouldCost.replace('$', ''));
      return total + (cost * component.quantity);
    }, 0);
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

  return (
    <div className="max-w-6xl mx-auto">
      <Card size="large">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-slate-gray mb-2">
            Preview Your Smart RFQ
          </h2>
          <p className="text-medium-gray">
            Review all details before sending your RFQ to suppliers. You can edit any section if needed.
          </p>
        </div>

        {/* RFQ Header */}
        <div className="bg-gradient-to-r from-primary-blue to-accent-teal text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{rfq.rfqNumber}</h1>
              <p className="text-blue-100">Smart Request for Quotation</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Created</p>
              <p className="font-semibold">{formatDate(new Date(rfq.createdAt))}</p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-primary-blue">{components.length}</h3>
            <p className="text-sm text-medium-gray">Components</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-green-600">
              ${calculateTotalEstimate().toFixed(2)}
            </h3>
            <p className="text-sm text-medium-gray">Est. ZBC Total</p>
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
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-red-600">
              {components.filter(c => c.riskFlag.level === 'High').length}
            </h3>
            <p className="text-sm text-medium-gray">High Risk Items</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Smart BoM Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-dark-slate-gray">
                  Smart Bill of Materials
                </h3>
                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                  Edit
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="table-cell text-left">Component</th>
                      <th className="table-cell text-center">Qty</th>
                      <th className="table-cell text-center">Risk</th>
                      <th className="table-cell text-right">ZBC Cost</th>
                      <th className="table-cell text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((component) => (
                      <tr key={component.id} className="table-row">
                        <td className="table-cell">
                          <div>
                            <div className="font-semibold text-dark-slate-gray">
                              {component.partName}
                            </div>
                            <div className="text-xs text-medium-gray">
                              {component.partNumber}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-center">
                          {component.quantity}
                        </td>
                        <td className="table-cell text-center">
                          <span className={getRiskBadgeClass(component.riskFlag.level)}>
                            {component.riskFlag.level}
                          </span>
                        </td>
                        <td className="table-cell text-right font-semibold">
                          {component.zbcShouldCost}
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {component.zbcVariance.startsWith('+') ? (
                              <TrendingUp className="w-3 h-3 text-red-600" />
                            ) : (
                              <TrendingUp className="w-3 h-3 text-green-600 transform rotate-180" />
                            )}
                            <span className={component.zbcVariance.startsWith('+') ? 'text-red-600' : 'text-green-600'}>
                              {component.zbcVariance}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source Document */}
            {rfq.sourceDocument && (
              <div>
                <h3 className="text-xl font-semibold text-dark-slate-gray mb-4">
                  Source Document
                </h3>
                <Card className="border-l-4 border-accent-teal">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-slate-gray">
                        {rfq.sourceDocument.fileName}
                      </h4>
                      <p className="text-sm text-medium-gray">
                        {rfq.sourceDocument.analysisType} • Processed with {rfq.sourceDocument.processingMode} mode
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Commercial Terms */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark-slate-gray">
                  Commercial Terms
                </h3>
                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                  Edit
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-accent-teal mt-1" />
                  <div>
                    <p className="text-sm font-medium text-dark-slate-gray">Lead Time</p>
                    <p className="text-sm text-medium-gray">{commercialTerms.desiredLeadTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-4 h-4 text-accent-teal mt-1" />
                  <div>
                    <p className="text-sm font-medium text-dark-slate-gray">Payment Terms</p>
                    <p className="text-sm text-medium-gray">{commercialTerms.paymentTerms}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-accent-teal mt-1" />
                  <div>
                    <p className="text-sm font-medium text-dark-slate-gray">Delivery</p>
                    <p className="text-sm text-medium-gray">{commercialTerms.deliveryLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-accent-teal mt-1" />
                  <div>
                    <p className="text-sm font-medium text-dark-slate-gray">Compliance</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {commercialTerms.complianceRequirements.map((req) => (
                        <span key={req} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-dark-slate-gray mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Edit className="w-4 h-4" />}
                >
                  Save as Draft
                </Button>
              </div>
            </Card>

            {/* Readiness Check */}
            <Card className="border-l-4 border-green-500 bg-green-50">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800">Ready to Send</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your Smart RFQ is complete and ready to be sent to suppliers.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={onPrevious}
            variant="secondary"
            disabled={loading.isLoading}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleSendRFQ}
            loading={loading.isLoading}
            icon={<Send className="w-4 h-4" />}
            size="lg"
          >
            Send Smart RFQ
          </Button>
        </div>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-slate-gray mb-2">
                RFQ Sent Successfully!
              </h3>
              <p className="text-medium-gray mb-6">
                Your Smart RFQ <strong>{rfq.rfqNumber}</strong> has been sent to suppliers. 
                You'll receive notifications as quotes come in.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> Suppliers will receive your RFQ with AI-enhanced 
                  insights and ZBC analysis. This helps them provide more accurate and competitive quotes.
                </p>
              </div>
              <Button onClick={handleCloseModal} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4PreviewRFQ;
