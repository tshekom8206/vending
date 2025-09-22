import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import {
  Purchase,
  PurchaseSearchRequest,
  PurchaseStats,
  TokenInfo,
  PaymentInfo,
  RefundRequest,
  PaginationInfo,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService extends BaseApiService {

  private readonly endpoint = '/purchases';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Get all purchases with optional filtering
   */
  getPurchases(searchParams?: PurchaseSearchRequest): Observable<{
    data: Purchase[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}`, searchParams);
  }

  /**
   * Get purchase by ID
   */
  getPurchaseById(id: string): Observable<Purchase> {
    return this.get(`${this.endpoint}/${id}`);
  }

  /**
   * Get purchase statistics
   */
  getPurchaseStats(period?: string): Observable<PurchaseStats> {
    const params = period ? { period } : undefined;
    return this.get(`${this.endpoint}/stats`, params);
  }

  /**
   * Get purchase analytics
   */
  getPurchaseAnalytics(params?: {
    period?: string;
    estateId?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<any> {
    return this.get(`${this.endpoint}/analytics`, params);
  }

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics(period: string = 'monthly'): Observable<any> {
    return this.get(`${this.endpoint}/revenue`, { period });
  }

  /**
   * Get transaction volume analytics
   */
  getTransactionVolumeAnalytics(period: string = 'daily'): Observable<any> {
    return this.get(`${this.endpoint}/volume`, { period });
  }

  /**
   * Get failed transactions
   */
  getFailedTransactions(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<{
    transactions: Purchase[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/failed`, params);
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions(params?: {
    page?: number;
    limit?: number;
  }): Observable<{
    transactions: Purchase[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/pending`, params);
  }

  /**
   * Get top customers by purchase volume
   */
  getTopCustomers(limit: number = 10, period?: string): Observable<any[]> {
    const params: any = { limit };
    if (period) params.period = period;
    return this.get(`${this.endpoint}/customers/top`, params);
  }

  /**
   * Process refund for a purchase
   */
  processRefund(purchaseId: string, refundData: RefundRequest): Observable<any> {
    return this.post(`${this.endpoint}/${purchaseId}/refund`, refundData);
  }

  /**
   * Cancel a pending purchase
   */
  cancelPurchase(purchaseId: string, reason: string): Observable<any> {
    return this.post(`${this.endpoint}/${purchaseId}/cancel`, { reason });
  }

  /**
   * Retry a failed purchase
   */
  retryPurchase(purchaseId: string): Observable<Purchase> {
    return this.post(`${this.endpoint}/${purchaseId}/retry`, {});
  }

  /**
   * Get purchase tokens for a specific purchase
   */
  getPurchaseTokens(purchaseId: string): Observable<TokenInfo[]> {
    return this.get(`${this.endpoint}/${purchaseId}/tokens`);
  }

  /**
   * Regenerate tokens for a purchase
   */
  regenerateTokens(purchaseId: string): Observable<TokenInfo[]> {
    return this.post(`${this.endpoint}/${purchaseId}/tokens/regenerate`, {});
  }

  /**
   * Get payment details for a purchase
   */
  getPaymentDetails(purchaseId: string): Observable<PaymentInfo> {
    return this.get(`${this.endpoint}/${purchaseId}/payment`);
  }

  /**
   * Get purchase history for a user
   */
  getUserPurchaseHistory(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<{
    purchases: Purchase[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/user/${userId}`, params);
  }

  /**
   * Get purchase history for an estate
   */
  getEstatePurchaseHistory(estateId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<{
    purchases: Purchase[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/estate/${estateId}`, params);
  }

  /**
   * Export purchase data
   */
  exportPurchaseData(format: 'csv' | 'excel' | 'pdf' = 'csv', params?: {
    startDate?: string;
    endDate?: string;
    estateId?: string;
    status?: string;
  }): Observable<Blob> {
    const queryParams: any = { format, ...params };

    return this.http.get(
      `${this.baseUrl}${this.endpoint}/export`,
      {
        params: queryParams,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('khanyi_admin_token')}`
        }
      }
    );
  }

  /**
   * Get recent purchase activities
   */
  getRecentActivities(limit: number = 20): Observable<any[]> {
    return this.get(`${this.endpoint}/activities/recent`, { limit });
  }

  /**
   * Get purchase alerts (failed payments, suspicious activity, etc.)
   */
  getPurchaseAlerts(): Observable<any[]> {
    return this.get(`${this.endpoint}/alerts`);
  }

  /**
   * Get commission analytics
   */
  getCommissionAnalytics(params?: {
    period?: string;
    estateId?: string;
  }): Observable<any> {
    return this.get(`${this.endpoint}/commission`, params);
  }

  /**
   * Get payment method analytics
   */
  getPaymentMethodAnalytics(period: string = 'monthly'): Observable<any> {
    return this.get(`${this.endpoint}/payment-methods`, { period });
  }

  /**
   * Bulk update purchase statuses
   */
  bulkUpdateStatus(purchaseIds: string[], status: string, notes?: string): Observable<any> {
    return this.post(`${this.endpoint}/bulk-update`, {
      purchaseIds,
      status,
      notes
    });
  }

  /**
   * Get fraud detection alerts
   */
  getFraudAlerts(): Observable<any[]> {
    return this.get(`${this.endpoint}/fraud/alerts`);
  }

  /**
   * Mark transaction as reviewed
   */
  markAsReviewed(purchaseId: string, notes?: string): Observable<any> {
    return this.post(`${this.endpoint}/${purchaseId}/review`, { notes });
  }

  /**
   * Get purchase reconciliation data
   */
  getReconciliationData(date: string): Observable<any> {
    return this.get(`${this.endpoint}/reconciliation`, { date });
  }

  /**
   * Generate purchase receipt
   */
  generateReceipt(purchaseId: string, format: 'pdf' | 'email' = 'pdf'): Observable<Blob | any> {
    if (format === 'email') {
      return this.post(`${this.endpoint}/${purchaseId}/receipt/email`, {});
    }

    return this.http.get(
      `${this.baseUrl}${this.endpoint}/${purchaseId}/receipt`,
      {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('khanyi_admin_token')}`
        }
      }
    );
  }
}