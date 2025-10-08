import React, { useState, useMemo } from 'react';
import { Filter, Search, X, CheckSquare, Square, Zap, DollarSign, Users } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface Component {
  id?: string;
  partNumber: string;
  name: string;
  description: string;
  specifications?: string;
  quantity: number;
  costRange?: string;
  zbc?: {
    shouldCost: number;
    variance?: string;
  };
  alternatives?: Array<{
    partNumber: string;
    name: string;
    description: string;
    specifications: string;
    costRange: string;
    keyAdvantages: string[];
    potentialDrawbacks: string[];
    suppliers: any[];
  }>;
  suppliers?: any[];
}

interface ComponentSelectorProps {
  components: Component[];
  selectedComponents: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onApplyFilter?: (filteredComponents: Component[]) => void;
  className?: string;
}

interface FilterState {
  searchTerm: string;
  hasAlternatives: boolean | null;
  hasSuppliers: boolean | null;
  costVariance: string[];
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  components,
  selectedComponents,
  onSelectionChange,
  onApplyFilter,
  className = ""
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    hasAlternatives: null,
    hasSuppliers: null,
    costVariance: []
  });

  // Filter components based on current filter state
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = [
          component.name,
          component.partNumber,
          component.description,
          component.specifications
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Has alternatives filter
      if (filters.hasAlternatives !== null) {
        const hasAlts = component.alternatives && component.alternatives.length > 0;
        if (filters.hasAlternatives !== hasAlts) {
          return false;
        }
      }

      // Has suppliers filter
      if (filters.hasSuppliers !== null) {
        const hasSuppliers = component.suppliers && component.suppliers.length > 0;
        if (filters.hasSuppliers !== hasSuppliers) {
          return false;
        }
      }

      // Cost variance filter
      if (filters.costVariance.length > 0) {
        const variance = component.zbc?.variance;
        if (!variance) return false;

        const numericVariance = parseFloat(variance.replace('%', ''));
        const matchesVarianceRange = filters.costVariance.some(range => {
          switch (range) {
            case 'low': return numericVariance < 5;
            case 'medium': return numericVariance >= 5 && numericVariance < 20;
            case 'high': return numericVariance >= 20;
            default: return false;
          }
        });

        if (!matchesVarianceRange) {
          return false;
        }
      }

      return true;
    });
  }, [components, filters]);

  // Handle individual component selection
  const handleComponentToggle = (componentId: string) => {
    const isSelected = selectedComponents.includes(componentId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedComponents.filter(id => id !== componentId);
    } else {
      newSelection = [...selectedComponents, componentId];
    }

    onSelectionChange(newSelection);
  };

  // Handle select all/none
  const handleSelectAll = () => {
    const visibleIds = filteredComponents.map(c => c.id || c.partNumber);
    const allSelected = visibleIds.every(id => selectedComponents.includes(id));

    if (allSelected) {
      // Deselect all visible components
      const newSelection = selectedComponents.filter(id => !visibleIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Select all visible components
      const newSelection = Array.from(new Set([...selectedComponents, ...visibleIds]));
      onSelectionChange(newSelection);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onApplyFilter?.(filteredComponents);
  };

  const toggleArrayFilter = (key: 'costVariance', value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    handleFilterChange(key, newValues);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      hasAlternatives: null,
      hasSuppliers: null,
      costVariance: []
    };
    setFilters(clearedFilters);
    onApplyFilter?.(components);
  };

  const visibleComponentsCount = filteredComponents.length;
  const selectedVisibleCount = filteredComponents.filter(c =>
    selectedComponents.includes(c.id || c.partNumber)
  ).length;

  const hasActiveFilters = filters.searchTerm ||
    filters.hasAlternatives !== null ||
    filters.hasSuppliers !== null ||
    filters.costVariance.length > 0;

  return (
    <Card className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-dark-slate-gray">Component Selection</h3>
            <p className="text-sm text-gray-600">
              {selectedComponents.length} of {components.length} components selected
              {visibleComponentsCount !== components.length && (
                <span> • {visibleComponentsCount} visible after filtering</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              className={hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
            >
              Filters {hasActiveFilters && '•'}
            </Button>
            <Button
              onClick={handleSelectAll}
              variant="secondary"
              size="sm"
              icon={selectedVisibleCount === visibleComponentsCount ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            >
              {selectedVisibleCount === visibleComponentsCount ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components by name, part number, or description..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="input-field pl-10 pr-10"
          />
          {filters.searchTerm && (
            <button
              onClick={() => handleFilterChange('searchTerm', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Filter Components</h4>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Cost Variance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Variance</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'low', label: 'Low (<5%)', color: 'green' },
                  { key: 'medium', label: 'Medium (5-20%)', color: 'yellow' },
                  { key: 'high', label: 'High (>20%)', color: 'red' }
                ].map(range => (
                  <button
                    key={range.key}
                    onClick={() => toggleArrayFilter('costVariance', range.key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filters.costVariance.includes(range.key)
                      ? `bg-${range.color}-100 border-${range.color}-300 text-${range.color}-700`
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{range.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Has Alternatives Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alternatives Available</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('hasAlternatives', true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filters.hasAlternatives === true
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Has Alternatives</span>
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange('hasAlternatives', false)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filters.hasAlternatives === false
                    ? 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  No Alternatives
                </button>
                {filters.hasAlternatives !== null && (
                  <button
                    onClick={() => handleFilterChange('hasAlternatives', null)}
                    className="px-2 py-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Has Suppliers Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suppliers Available</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('hasSuppliers', true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filters.hasSuppliers === true
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Has Suppliers</span>
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange('hasSuppliers', false)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filters.hasSuppliers === false
                    ? 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  No Suppliers
                </button>
                {filters.hasSuppliers !== null && (
                  <button
                    onClick={() => handleFilterChange('hasSuppliers', null)}
                    className="px-2 py-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredComponents.map((component) => {
          const componentId = component.id || component.partNumber;
          const isSelected = selectedComponents.includes(componentId);

          return (
            <div
              key={componentId}
              onClick={() => handleComponentToggle(componentId)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                ? 'border-accent-teal bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className="flex items-center space-x-3">
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                  ? 'border-accent-teal bg-accent-teal'
                  : 'border-gray-300'
                  }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Component Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-gray-900">{component.name}</h4>
                    <span className="text-sm text-gray-500 font-mono">{component.partNumber}</span>
                    {component.quantity > 1 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Qty: {component.quantity}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                  {component.costRange && (
                    <p className="text-xs text-gray-500 mt-1">Cost: {component.costRange}</p>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="flex items-center space-x-2">
                  {component.alternatives && component.alternatives.length > 0 && (
                    <div className="text-blue-600" title={`${component.alternatives.length} alternatives available`}>
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                  {component.suppliers && component.suppliers.length > 0 && (
                    <div className="text-green-600" title={`${component.suppliers.length} suppliers available`}>
                      <Users className="w-4 h-4" />
                    </div>
                  )}
                  {component.zbc?.variance && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {component.zbc.variance}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-8">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Components Match Filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or clearing some filters.</p>
          <Button onClick={clearFilters} variant="secondary" size="sm">
            Clear All Filters
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ComponentSelector;
