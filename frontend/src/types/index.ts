// RFQ Types
export interface RFQ {
  id: string;
  rfqId: string; // Business identifier from backend
  rfqNumber: string;
  status: 'draft' | 'in-progress' | 'completed' | 'sent' | 'cancelled';
  currentStep: number;
  userId: string;
  sourceDocument?: SourceDocument;
  components: SmartBOMComponent[];
  commercialTerms?: CommercialTerms;
  summary: RFQSummary;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

export interface SourceDocument {
  fileName: string;
  fileType: string;
  fileCategory: string;
  fileSize: number;
  processingMode: 'mock' | 'gemini';
  analysisType: 'GENERATED_ZBC' | 'EXTRACTED_ZBC' | 'BOM_PROCESSING';
}

export interface SmartBOMComponent {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  material: string;
  
  // AI Suggestions
  aiSuggestedAlternative: string;
  
  // Compliance
  complianceStatus: 'compliant' | 'pending' | 'non-compliant' | 'unknown';
  complianceFlags: ComplianceFlag[];
  
  // Risk Assessment
  riskFlag: RiskFlag;
  
  // Supplier Information
  aiRecommendedRegion: string;
  
  // Pricing
  predictedMarketRange: string;
  
  // ZBC Data
  zbcShouldCost: string;
  zbcVariance: string;
  zbcSource: 'AI Generated' | 'Professional Report' | 'Manual Entry';
  
  // Metadata
  confidence: number | string;
  notes: string;
  
  // Raw data for detailed views
  rawData?: {
    component: any;
    suggestions: any;
    prices: any;
  };
}

export interface ComplianceFlag {
  type: 'success' | 'warning' | 'error';
  text: string;
  icon: string;
}

export interface RiskFlag {
  level: 'Low' | 'Medium' | 'High' | 'unknown';
  color: 'green' | 'yellow' | 'red' | 'gray';
}

export interface CommercialTerms {
  desiredLeadTime: string;
  paymentTerms: 'Net 30' | 'Net 60' | 'Milestone-based' | '2/10 Net 30' | 'Cash on Delivery' | 'Letter of Credit';
  deliveryLocation: string;
  complianceRequirements: string[];
  additionalRequirements?: string;
}

export interface RFQSummary {
  totalComponents: number;
  estimatedTotalValue?: number;
  averageZBCVariance?: number;
  highRiskComponents: number;
  complianceIssues: number;
}

// Document Processing Types
export interface DocumentProcessingResult {
  success: boolean;
  message: string;
  summary?: string;
}

export interface ProcessingSummary {
  totalComponents: number;
  analysisType: string;
  confidence: string | number;
  processingTime: string | number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface RFQFormData {
  step1?: {
    file?: File;
    analysisType?: string;
  };
  step2?: {
    componentUpdates?: ComponentUpdate[];
    notes?: string;
  };
  step3?: CommercialTerms;
  step4?: {
    action: 'preview' | 'send';
  };
}

export interface ComponentUpdate {
  componentId: string;
  changes: Partial<SmartBOMComponent>;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// File Upload Types
export interface FileUploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export interface SupportedFileType {
  category: string;
  description: string;
  extensions: string[];
  maxSize: string;
  analysisType: string;
}

// Dashboard Types
export interface DashboardAnalytics {
  summary: {
    totalRFQs: number;
    activeRFQs: number;
    completedRFQs: number;
    totalComponents: number;
    averageZBCVariance: number;
  };
  breakdown: Array<{
    _id: string;
    count: number;
    totalComponents: number;
    avgZBCVariance?: number;
  }>;
}

// Step Navigation Types
export interface StepConfig {
  number: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isAccessible: boolean;
}

// Table Types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  className?: string;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

// Context Types
export interface RFQContextType {
  currentRFQ: RFQ | null;
  rfqs: RFQ[];
  loading: LoadingState;
  error: ErrorState;
  createRFQ: () => Promise<RFQ>;
  updateRFQ: (id: string, data: Partial<RFQ>) => Promise<void>;
  deleteRFQ: (id: string) => Promise<void>;
  fetchRFQs: () => Promise<void>;
  fetchRFQ: (id: string) => Promise<void>;
  processDocument: (rfqId: string, file: File, analysisType?: string) => Promise<DocumentProcessingResult>;
  updateStep: (rfqId: string, step: number, data: any) => Promise<void>;
}

export interface AppContextType {
  notifications: NotificationState[];
  addNotification: (notification: Omit<NotificationState, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
