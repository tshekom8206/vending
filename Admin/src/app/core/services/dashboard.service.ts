import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { DashboardStats, ChartData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {

  private readonly endpoint = '/dashboard';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Get main dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.get(`${this.endpoint}/stats`);
  }

  /**
   * Get revenue analytics for charts
   */
  getRevenueAnalytics(period: string = 'monthly'): Observable<ChartData> {
    return this.get(`${this.endpoint}/revenue`, { period });
  }

  /**
   * Get user growth analytics
   */
  getUserGrowthAnalytics(period: string = 'monthly'): Observable<ChartData> {
    return this.get(`${this.endpoint}/users/growth`, { period });
  }

  /**
   * Get transaction analytics
   */
  getTransactionAnalytics(period: string = 'daily'): Observable<ChartData> {
    return this.get(`${this.endpoint}/transactions`, { period });
  }

  /**
   * Get estate performance analytics
   */
  getEstatePerformance(limit: number = 10): Observable<any[]> {
    return this.get(`${this.endpoint}/estates/performance`, { limit });
  }

  /**
   * Get recent activities
   */
  getRecentActivities(limit: number = 20): Observable<any[]> {
    return this.get(`${this.endpoint}/activities`, { limit });
  }

  /**
   * Get system alerts
   */
  getSystemAlerts(): Observable<any[]> {
    return this.get(`${this.endpoint}/alerts`);
  }

  /**
   * Get energy consumption trends
   */
  getEnergyConsumptionTrends(period: string = 'weekly'): Observable<ChartData> {
    return this.get(`${this.endpoint}/energy/consumption`, { period });
  }

  /**
   * Get geographic distribution of estates
   */
  getGeographicDistribution(): Observable<any[]> {
    return this.get(`${this.endpoint}/geography`);
  }

  /**
   * Get top performing estates
   */
  getTopEstates(metric: 'revenue' | 'users' | 'transactions' = 'revenue', limit: number = 5): Observable<any[]> {
    return this.get(`${this.endpoint}/estates/top`, { metric, limit });
  }

  /**
   * Get low balance alerts
   */
  getLowBalanceAlerts(): Observable<any[]> {
    return this.get(`${this.endpoint}/alerts/low-balance`);
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): Observable<{
    api: string;
    database: string;
    services: any[];
    uptime: number;
    lastCheck: Date;
  }> {
    return this.get(`${this.endpoint}/health`);
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(): Observable<{
    activeUsers: number;
    ongoingTransactions: number;
    systemLoad: number;
    responseTime: number;
  }> {
    return this.get(`${this.endpoint}/realtime`);
  }

  /**
   * Get notification summary
   */
  getNotificationSummary(): Observable<{
    total: number;
    unread: number;
    byType: any[];
    recent: any[];
  }> {
    return this.get(`${this.endpoint}/notifications/summary`);
  }

  /**
   * Export dashboard data
   */
  exportDashboardData(format: 'csv' | 'excel' | 'pdf' = 'csv', period?: string): Observable<Blob> {
    const params: any = { format };
    if (period) params.period = period;

    return this.http.get(
      `${this.baseUrl}${this.endpoint}/export`,
      {
        params,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('khanyi_admin_token')}`
        }
      }
    );
  }
}