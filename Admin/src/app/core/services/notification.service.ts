import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import {
  Notification,
  NotificationTemplate,
  NotificationCreateRequest,
  NotificationSearchRequest,
  NotificationStats,
  NotificationChannel,
  NotificationBatch,
  PaginationInfo,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseApiService {

  private readonly endpoint = '/notifications';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Get all notifications with optional filtering
   */
  getNotifications(searchParams?: NotificationSearchRequest): Observable<{
    notifications: Notification[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}`, searchParams);
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create and send notification
   */
  createNotification(notificationData: NotificationCreateRequest): Observable<Notification> {
    return this.post(`${this.endpoint}`, notificationData);
  }

  /**
   * Update notification
   */
  updateNotification(id: string, notificationData: Partial<NotificationCreateRequest>): Observable<Notification> {
    return this.put(`${this.endpoint}/${id}`, notificationData);
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): Observable<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(period?: string): Observable<NotificationStats> {
    const params = period ? { period } : undefined;
    return this.get(`${this.endpoint}/stats`, params);
  }

  /**
   * Get notification analytics
   */
  getNotificationAnalytics(params?: {
    period?: string;
    type?: string;
    channel?: string;
  }): Observable<any> {
    return this.get(`${this.endpoint}/analytics`, params);
  }

  /**
   * Get delivery analytics
   */
  getDeliveryAnalytics(period: string = 'weekly'): Observable<any> {
    return this.get(`${this.endpoint}/delivery-analytics`, { period });
  }

  /**
   * Get engagement analytics
   */
  getEngagementAnalytics(period: string = 'monthly'): Observable<any> {
    return this.get(`${this.endpoint}/engagement-analytics`, { period });
  }

  /**
   * Send bulk notifications
   */
  sendBulkNotifications(batchData: NotificationBatch): Observable<{
    batchId: string;
    totalRecipients: number;
    estimatedDeliveryTime: string;
  }> {
    return this.post(`${this.endpoint}/bulk`, batchData);
  }

  /**
   * Get bulk notification status
   */
  getBulkNotificationStatus(batchId: string): Observable<{
    batchId: string;
    status: string;
    progress: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    return this.get(`${this.endpoint}/bulk/${batchId}/status`);
  }

  /**
   * Cancel bulk notification
   */
  cancelBulkNotification(batchId: string): Observable<any> {
    return this.post(`${this.endpoint}/bulk/${batchId}/cancel`, {});
  }

  /**
   * Get notification templates
   */
  getTemplates(params?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Observable<{
    templates: NotificationTemplate[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/templates`, params);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): Observable<NotificationTemplate> {
    return this.get(`${this.endpoint}/templates/${id}`);
  }

  /**
   * Create notification template
   */
  createTemplate(templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Observable<NotificationTemplate> {
    return this.post(`${this.endpoint}/templates`, templateData);
  }

  /**
   * Update notification template
   */
  updateTemplate(id: string, templateData: Partial<NotificationTemplate>): Observable<NotificationTemplate> {
    return this.put(`${this.endpoint}/templates/${id}`, templateData);
  }

  /**
   * Delete notification template
   */
  deleteTemplate(id: string): Observable<void> {
    return this.delete(`${this.endpoint}/templates/${id}`);
  }

  /**
   * Test notification template
   */
  testTemplate(templateId: string, testData: {
    recipientEmail: string;
    variables?: any;
  }): Observable<any> {
    return this.post(`${this.endpoint}/templates/${templateId}/test`, testData);
  }

  /**
   * Get failed notifications
   */
  getFailedNotifications(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<{
    notifications: Notification[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/failed`, params);
  }

  /**
   * Retry failed notification
   */
  retryFailedNotification(notificationId: string): Observable<Notification> {
    return this.post(`${this.endpoint}/${notificationId}/retry`, {});
  }

  /**
   * Retry all failed notifications for a batch
   */
  retryFailedBatch(batchId: string): Observable<any> {
    return this.post(`${this.endpoint}/bulk/${batchId}/retry-failed`, {});
  }

  /**
   * Get notification channels
   */
  getChannels(): Observable<NotificationChannel[]> {
    return this.get(`${this.endpoint}/channels`);
  }

  /**
   * Update channel configuration
   */
  updateChannelConfig(channel: string, config: any): Observable<NotificationChannel> {
    return this.put(`${this.endpoint}/channels/${channel}`, config);
  }

  /**
   * Test channel configuration
   */
  testChannel(channel: string, testData: any): Observable<any> {
    return this.post(`${this.endpoint}/channels/${channel}/test`, testData);
  }

  /**
   * Get user notification preferences
   */
  getUserPreferences(userId: string): Observable<{
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    frequency: string;
    categories: string[];
  }> {
    return this.get(`${this.endpoint}/preferences/${userId}`);
  }

  /**
   * Update user notification preferences
   */
  updateUserPreferences(userId: string, preferences: any): Observable<any> {
    return this.put(`${this.endpoint}/preferences/${userId}`, preferences);
  }

  /**
   * Get scheduled notifications
   */
  getScheduledNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<{
    notifications: Notification[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/scheduled`, params);
  }

  /**
   * Schedule notification
   */
  scheduleNotification(notificationData: NotificationCreateRequest & {
    scheduledFor: string;
    timezone?: string;
  }): Observable<Notification> {
    return this.post(`${this.endpoint}/schedule`, notificationData);
  }

  /**
   * Cancel scheduled notification
   */
  cancelScheduledNotification(notificationId: string): Observable<any> {
    return this.post(`${this.endpoint}/${notificationId}/cancel`, {});
  }

  /**
   * Get notification by reference
   */
  getNotificationByReference(referenceType: string, referenceId: string): Observable<Notification[]> {
    return this.get(`${this.endpoint}/reference/${referenceType}/${referenceId}`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string, userId?: string): Observable<any> {
    const body = userId ? { userId } : {};
    return this.post(`${this.endpoint}/${notificationId}/read`, body);
  }

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead(notificationIds: string[], userId?: string): Observable<any> {
    const body = { notificationIds, userId };
    return this.post(`${this.endpoint}/mark-read-bulk`, body);
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId: string): Observable<{ count: number }> {
    return this.get(`${this.endpoint}/unread-count/${userId}`);
  }

  /**
   * Get notification history for user
   */
  getUserNotificationHistory(userId: string, params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    notifications: Notification[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/user/${userId}/history`, params);
  }

  /**
   * Export notification data
   */
  exportNotificationData(format: 'csv' | 'excel' | 'pdf' = 'csv', params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
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
   * Get notification performance metrics
   */
  getPerformanceMetrics(period: string = 'monthly'): Observable<{
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    avgDeliveryTime: number;
  }> {
    return this.get(`${this.endpoint}/performance`, { period });
  }

  /**
   * Get channel performance comparison
   */
  getChannelPerformance(period: string = 'monthly'): Observable<any[]> {
    return this.get(`${this.endpoint}/channel-performance`, { period });
  }

  /**
   * Create notification campaign
   */
  createCampaign(campaignData: {
    name: string;
    description?: string;
    templateId: string;
    targetAudience: any;
    scheduledFor?: string;
    channels: string[];
  }): Observable<any> {
    return this.post(`${this.endpoint}/campaigns`, campaignData);
  }

  /**
   * Get notification campaigns
   */
  getCampaigns(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    campaigns: any[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/campaigns`, params);
  }

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics(campaignId: string): Observable<any> {
    return this.get(`${this.endpoint}/campaigns/${campaignId}/analytics`);
  }

  /**
   * Get notification queue status
   */
  getQueueStatus(): Observable<{
    pending: number;
    processing: number;
    failed: number;
    avgProcessingTime: number;
  }> {
    return this.get(`${this.endpoint}/queue/status`);
  }

  /**
   * Clear notification queue
   */
  clearQueue(queueType: 'pending' | 'failed' | 'all' = 'failed'): Observable<any> {
    return this.post(`${this.endpoint}/queue/clear`, { type: queueType });
  }
}