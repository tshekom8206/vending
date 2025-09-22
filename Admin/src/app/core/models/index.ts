// Index file for all model interfaces
export * from './user.interface';
export * from './estate.interface';
export * from './purchase.interface';
export * from './notification.interface';

// Common API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Dashboard interfaces
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
  };
  estates: {
    total: number;
    active: number;
    occupancy: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  transactions: {
    total: number;
    pending: number;
    failed: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Filter and search interfaces
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  search?: string;
  dateRange?: DateRange;
  status?: string[];
  type?: string[];
  sort?: SortOption;
}

// System configuration interfaces
export interface SystemConfig {
  apiUrl: string;
  version: string;
  environment: string;
  features: FeatureFlags;
  limits: SystemLimits;
}

export interface FeatureFlags {
  notifications: boolean;
  analytics: boolean;
  reports: boolean;
  bulkOperations: boolean;
}

export interface SystemLimits {
  maxFileSize: number;
  maxBulkOperations: number;
  rateLimitPerMinute: number;
}