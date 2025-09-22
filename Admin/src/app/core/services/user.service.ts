import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import {
  User,
  UserProfile,
  UserCreateRequest,
  UserUpdateRequest,
  UserSearchRequest,
  UserStats,
  UserRole,
  PaginationInfo,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {

  private readonly endpoint = '/users';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Get all users with optional filtering
   */
  getUsers(searchParams?: UserSearchRequest): Observable<{
    data: User[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}`, searchParams);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create new user
   */
  createUser(userData: UserCreateRequest): Observable<User> {
    return this.post(`${this.endpoint}`, userData);
  }

  /**
   * Update existing user
   */
  updateUser(id: string, userData: UserUpdateRequest): Observable<User> {
    return this.put(`${this.endpoint}/${id}`, userData);
  }

  /**
   * Delete user (soft delete)
   */
  deleteUser(id: string): Observable<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    return this.get(`${this.endpoint}/stats`);
  }

  /**
   * Get user analytics
   */
  getUserAnalytics(period?: string): Observable<any> {
    const params = period ? { period } : undefined;
    return this.get(`${this.endpoint}/analytics`, params);
  }

  /**
   * Get user registration trends
   */
  getRegistrationTrends(period: string = 'monthly'): Observable<any> {
    return this.get(`${this.endpoint}/registration-trends`, { period });
  }

  /**
   * Get user activity analytics
   */
  getUserActivityAnalytics(userId?: string, period?: string): Observable<any> {
    const params: any = {};
    if (userId) params.userId = userId;
    if (period) params.period = period;
    return this.get(`${this.endpoint}/activity`, params);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole, params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Observable<{
    data: User[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/role/${role}`, params);
  }

  /**
   * Get estate administrators
   */
  getEstateAdministrators(estateId?: string): Observable<User[]> {
    const params = estateId ? { estateId } : undefined;
    return this.get(`${this.endpoint}/administrators`, params);
  }

  /**
   * Activate user account
   */
  activateUser(userId: string): Observable<User> {
    return this.post(`${this.endpoint}/${userId}/activate`, {});
  }

  /**
   * Deactivate user account
   */
  deactivateUser(userId: string, reason?: string): Observable<User> {
    return this.post(`${this.endpoint}/${userId}/deactivate`, { reason });
  }

  /**
   * Verify user account
   */
  verifyUser(userId: string): Observable<User> {
    return this.post(`${this.endpoint}/${userId}/verify`, {});
  }

  /**
   * Unverify user account
   */
  unverifyUser(userId: string, reason?: string): Observable<User> {
    return this.post(`${this.endpoint}/${userId}/unverify`, { reason });
  }

  /**
   * Reset user password
   */
  resetUserPassword(userId: string, newPassword?: string): Observable<{
    temporaryPassword?: string;
    message: string;
  }> {
    const body = newPassword ? { newPassword } : {};
    return this.post(`${this.endpoint}/${userId}/reset-password`, body);
  }

  /**
   * Change user role
   */
  changeUserRole(userId: string, newRole: UserRole, notes?: string): Observable<User> {
    return this.post(`${this.endpoint}/${userId}/change-role`, {
      role: newRole,
      notes
    });
  }

  /**
   * Get user purchase history
   */
  getUserPurchaseHistory(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<any> {
    return this.get(`${this.endpoint}/${userId}/purchases`, params);
  }

  /**
   * Get user estate associations
   */
  getUserEstates(userId: string): Observable<any[]> {
    return this.get(`${this.endpoint}/${userId}/estates`);
  }

  /**
   * Add user to estate
   */
  addUserToEstate(userId: string, estateId: string, role?: string): Observable<any> {
    return this.post(`${this.endpoint}/${userId}/estates`, {
      estateId,
      role
    });
  }

  /**
   * Remove user from estate
   */
  removeUserFromEstate(userId: string, estateId: string): Observable<void> {
    return this.delete(`${this.endpoint}/${userId}/estates/${estateId}`);
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId: string, params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    return this.get(`${this.endpoint}/${userId}/notifications`, params);
  }

  /**
   * Send notification to user
   */
  sendNotificationToUser(userId: string, notificationData: {
    type: string;
    title: string;
    message: string;
    channels?: string[];
    data?: any;
  }): Observable<any> {
    return this.post(`${this.endpoint}/${userId}/notifications`, notificationData);
  }

  /**
   * Get user login history
   */
  getUserLoginHistory(userId: string, params?: {
    page?: number;
    limit?: number;
  }): Observable<any> {
    return this.get(`${this.endpoint}/${userId}/login-history`, params);
  }

  /**
   * Get user device information
   */
  getUserDevices(userId: string): Observable<any[]> {
    return this.get(`${this.endpoint}/${userId}/devices`);
  }

  /**
   * Revoke user sessions
   */
  revokeUserSessions(userId: string, deviceId?: string): Observable<any> {
    const body = deviceId ? { deviceId } : {};
    return this.post(`${this.endpoint}/${userId}/revoke-sessions`, body);
  }

  /**
   * Get inactive users
   */
  getInactiveUsers(days: number = 30): Observable<User[]> {
    return this.get(`${this.endpoint}/inactive`, { days });
  }

  /**
   * Get users requiring verification
   */
  getUsersRequiringVerification(): Observable<User[]> {
    return this.get(`${this.endpoint}/verification-required`);
  }

  /**
   * Bulk update users
   */
  bulkUpdateUsers(userIds: string[], updateData: Partial<UserUpdateRequest>): Observable<User[]> {
    return this.post(`${this.endpoint}/bulk-update`, {
      userIds,
      updateData
    });
  }

  /**
   * Bulk activate users
   */
  bulkActivateUsers(userIds: string[]): Observable<any> {
    return this.post(`${this.endpoint}/bulk-activate`, { userIds });
  }

  /**
   * Bulk deactivate users
   */
  bulkDeactivateUsers(userIds: string[], reason?: string): Observable<any> {
    return this.post(`${this.endpoint}/bulk-deactivate`, {
      userIds,
      reason
    });
  }

  /**
   * Export user data
   */
  exportUserData(format: 'csv' | 'excel' | 'pdf' = 'csv', params?: {
    role?: UserRole;
    isActive?: boolean;
    isVerified?: boolean;
    estateId?: string;
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
   * Search users by email or phone
   */
  searchUsers(query: string, params?: {
    searchIn?: 'email' | 'phone' | 'name' | 'all';
    limit?: number;
  }): Observable<User[]> {
    return this.get(`${this.endpoint}/search`, {
      q: query,
      ...params
    });
  }

  /**
   * Get user balance information
   */
  getUserBalance(userId: string): Observable<{
    walletBalance: number;
    creditBalance: number;
    totalSpent: number;
    pendingTransactions: number;
  }> {
    return this.get(`${this.endpoint}/${userId}/balance`);
  }

  /**
   * Update user balance (admin only)
   */
  updateUserBalance(userId: string, balanceData: {
    type: 'wallet' | 'credit';
    amount: number;
    operation: 'add' | 'subtract' | 'set';
    reason: string;
  }): Observable<any> {
    return this.post(`${this.endpoint}/${userId}/balance`, balanceData);
  }

  /**
   * Get user audit trail
   */
  getUserAuditTrail(userId: string, params?: {
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    return this.get(`${this.endpoint}/${userId}/audit`, params);
  }

  /**
   * Get top users by various metrics
   */
  getTopUsers(metric: 'purchases' | 'revenue' | 'activity' = 'purchases', limit: number = 10): Observable<any[]> {
    return this.get(`${this.endpoint}/top`, { metric, limit });
  }

  /**
   * Get user demographics
   */
  getUserDemographics(): Observable<{
    ageGroups: any[];
    genderDistribution: any[];
    locationDistribution: any[];
    roleDistribution: any[];
  }> {
    return this.get(`${this.endpoint}/demographics`);
  }
}
