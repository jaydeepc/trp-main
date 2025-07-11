import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  APIResponse, 
  RFQ, 
  DocumentProcessingResult, 
  DashboardAnalytics,
  User,
  PaginatedResponse
} from '../types';

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
      timeout: 30000, // 30 seconds for file uploads
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth headers
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add user ID header for MVP
        config.headers['x-user-id'] = 'demo-user-001';
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<APIResponse<T>>): T {
    if (response.data.success) {
      return response.data.data as T;
    } else {
      throw new Error(response.data.error || 'API request failed');
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/login', { email, password });
    return this.handleResponse(response);
  }

  async register(userData: { email: string; password: string; name: string; company?: string }): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/register', userData);
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return this.handleResponse(response);
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }

  // RFQ endpoints
  async getRFQs(params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<RFQ>> {
    const response = await this.api.get('/rfqs', { params });
    return this.handleResponse(response);
  }

  async getRFQ(id: string): Promise<RFQ> {
    const response = await this.api.get(`/rfqs/${id}`);
    return this.handleResponse(response);
  }

  async createRFQ(): Promise<RFQ> {
    const response = await this.api.post('/rfqs');
    return this.handleResponse(response);
  }

  async deleteRFQ(id: string): Promise<void> {
    const response = await this.api.delete(`/rfqs/${id}`);
    this.handleResponse(response);
  }

  // RFQ Step endpoints
  async updateRFQStep1(id: string, file: File, analysisType?: string): Promise<{
    rfq: RFQ;
    smartBoM: any[];
    processingInfo: any;
  }> {
    const formData = new FormData();
    formData.append('document', file);
    if (analysisType) {
      formData.append('analysisType', analysisType);
    }

    const response = await this.api.put(`/rfqs/${id}/step1`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return this.handleResponse(response);
  }

  async updateRFQStep2(id: string, data: {
    componentUpdates?: Array<{ componentId: string; changes: any }>;
    notes?: string;
  }): Promise<{ rfq: RFQ }> {
    const response = await this.api.put(`/rfqs/${id}/step2`, data);
    return this.handleResponse(response);
  }

  async updateRFQStep3(id: string, commercialTerms: {
    desiredLeadTime: string;
    paymentTerms: string;
    deliveryLocation: string;
    complianceRequirements: string[];
    additionalRequirements?: string;
  }): Promise<{ rfq: RFQ }> {
    const response = await this.api.put(`/rfqs/${id}/step3`, commercialTerms);
    return this.handleResponse(response);
  }

  async updateRFQStep4(id: string, action: 'preview' | 'send'): Promise<{ rfq: RFQ; action: string }> {
    const response = await this.api.put(`/rfqs/${id}/step4`, { action });
    return this.handleResponse(response);
  }

  // Document processing endpoints
  async processDocument(file: File, analysisType?: string): Promise<DocumentProcessingResult> {
    const formData = new FormData();
    formData.append('document', file);
    if (analysisType) {
      formData.append('analysisType', analysisType);
    }

    const response = await this.api.post('/documents/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getSupportedFileTypes(): Promise<any> {
    const response = await this.api.get('/documents/supported-types');
    return this.handleResponse(response);
  }

  async validateFile(file: File): Promise<{
    valid: boolean;
    data?: any;
    error?: string;
  }> {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await this.api.post('/documents/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.error || 'File validation failed'
      };
    }
  }

  // Analytics endpoints
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await this.api.get('/rfqs/analytics/dashboard');
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    environment: string;
    mockData: boolean;
  }> {
    const response = await this.api.get('/health');
    return this.handleResponse(response);
  }

  // File upload with progress tracking
  async uploadFileWithProgress(
    file: File, 
    onProgress?: (progress: number) => void,
    analysisType?: string
  ): Promise<DocumentProcessingResult> {
    const formData = new FormData();
    formData.append('document', file);
    if (analysisType) {
      formData.append('analysisType', analysisType);
    }

    const response = await this.api.post('/documents/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isFileTypeSupported(file: File, supportedTypes: string[]): boolean {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return supportedTypes.includes(fileExtension);
  }

  // Error handling helper
  getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.response?.data?.error) {
      return error.response.data.error;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

// Create and export a singleton instance
const apiService = new APIService();
export default apiService;

// Export the class for testing purposes
export { APIService };
