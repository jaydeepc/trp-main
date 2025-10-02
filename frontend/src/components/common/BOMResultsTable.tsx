import React from 'react';
import ExcelTable from './ExcelTable';

interface BOMResultsTableProps {
  bomData: any[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const BOMResultsTable: React.FC<BOMResultsTableProps> = ({ 
  bomData, 
  isLoading = false, 
  error = null, 
  className = "" 
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-900 mb-2">Processing BOM Data</div>
        <div className="text-sm text-gray-500">
          Analyzing components and finding alternative suppliers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-lg font-medium text-red-900 mb-2">Processing Error</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!bomData || bomData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-900 mb-2">No BOM Data</div>
        <div className="text-sm text-gray-500">
          Upload a BOM file to see the processed supplier research results here.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ExcelTable 
        data={bomData} 
        title="Smart BOM - Supplier Research Results"
      />
      
      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{bomData.length}</div>
          <div className="text-sm text-blue-700">Total Components</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">
            {bomData.filter(item => item.alternativeSuppliers && item.alternativeSuppliers.length > 0).length}
          </div>
          <div className="text-sm text-green-700">Components with Alternatives</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">
            {bomData.reduce((total, item) => {
              return total + (item.alternativeSuppliers ? item.alternativeSuppliers.length : 0);
            }, 0)}
          </div>
          <div className="text-sm text-purple-700">Total Alternative Suppliers</div>
        </div>
      </div>

      {/* Processing Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Data processed using Robbie Supplier Research (RSR) Agent with global supplier analysis
      </div>
    </div>
  );
};

export default BOMResultsTable;
