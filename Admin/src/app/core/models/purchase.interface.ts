// Purchase Model Interfaces for Khanyi Vending System

export interface Purchase {
  id: string;
  transactionId: string;
  user: PurchaseUser;
  unit: PurchaseUnit;
  meter: PurchaseMeter;
  amount: number;
  unitsReceived: number;
  tariffRate: number;
  token: TokenInfo;
  payment: PaymentInfo;
  fees: FeeInfo;
  delivery: DeliveryInfo;
  status: PurchaseStatus;
  totalAmount: number;
  efficiency: number;
  auditLog: AuditLogEntry[];
  metadata: PurchaseMetadata;
  createdAt: Date;
  updatedAt: Date;
  // Computed properties
  formattedToken: string;
  deliveryStatus: string;
}

export interface TokenInfo {
  value: string;
  type: TokenType;
  expiryDate: Date;
  isUsed: boolean;
}

export interface PaymentInfo {
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  processedAt?: Date;
  failureReason?: string;
}

export interface FeeInfo {
  transactionFee: number;
  serviceFee: number;
  vatAmount: number;
  totalFees: number;
}

export interface DeliveryInfo {
  method: DeliveryMethod;
  destination: string;
  attempts: number;
  maxAttempts: number;
  deliveredAt?: Date;
  failureReason?: string;
}

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface PurchaseMetadata {
  userAgent: string;
  ipAddress: string;
  platform: string;
  sessionId?: string;
}

export interface PurchaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fullName: string;
}

export interface PurchaseUnit {
  id: string;
  unitNumber: string;
  estate: {
    id: string;
    name: string;
    address: {
      city: string;
    };
  };
  status: string;
  description: string;
}

export interface PurchaseMeter {
  id: string;
  meterNumber: string;
  balance?: number;
  lastReading?: Date;
}

export interface PurchaseStats {
  totalPurchases: number;
  totalRevenue: number;
  totalUnits: number;
  averageTransactionValue: number;
  pendingTransactions: number;
  failedTransactions: number;
  revenueGrowth: number;
  unitsGrowth: number;
}

export interface PurchaseDetails extends Purchase {
  relatedPurchases: Purchase[];
  userHistory: UserPurchaseHistory;
  meterHistory: MeterReadingHistory[];
}

export interface UserPurchaseHistory {
  totalPurchases: number;
  totalSpent: number;
  averagePurchase: number;
  firstPurchase: Date;
  lastPurchase: Date;
  monthlyAverage: number;
}

export interface MeterReadingHistory {
  date: Date;
  reading: number;
  balance: number;
  consumption: number;
}

export interface PurchaseCreateRequest {
  userId: string;
  unitId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  metadata?: Partial<PurchaseMetadata>;
}

export interface PurchaseSearchRequest {
  userId?: string;
  unitId?: string;
  estateId?: string;
  status?: PurchaseStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface TokenGenerationRequest {
  purchaseId: string;
  manual?: boolean;
  expiryDays?: number;
}

export interface RefundRequest {
  purchaseId: string;
  reason: string;
  amount: number;
  refundMethod: PaymentMethod;
}

export interface PurchaseAnalytics {
  revenueByPeriod: RevenueByPeriod[];
  purchasesByHour: PurchasesByHour[];
  topEstates: EstateRevenue[];
  topUsers: UserRevenue[];
  paymentMethodBreakdown: PaymentMethodStats[];
  statusBreakdown: StatusStats[];
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  transactions: number;
  units: number;
  averageTransaction: number;
}

export interface PurchasesByHour {
  hour: number;
  purchases: number;
  revenue: number;
}

export interface EstateRevenue {
  estateId: string;
  estateName: string;
  revenue: number;
  transactions: number;
  averageTransaction: number;
}

export interface UserRevenue {
  userId: string;
  userName: string;
  totalSpent: number;
  transactions: number;
  averageTransaction: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  revenue: number;
  percentage: number;
}

export interface StatusStats {
  status: PurchaseStatus;
  count: number;
  percentage: number;
}

export type PurchaseStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded';
export type TokenType = 'STS' | 'DLMS' | 'Other';
export type PaymentMethod = 'Card' | 'EFT' | 'Cash' | 'Digital Wallet' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded';
export type DeliveryMethod = 'SMS' | 'Email' | 'App Push' | 'WhatsApp' | 'Manual';