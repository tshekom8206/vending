import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import {
  Estate,
  EstateDetails,
  EstateStats,
  EstateCreateRequest,
  EstateUpdateRequest,
  EstateSearchRequest,
  Unit,
  ApiResponse,
  PaginationInfo
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class EstateService extends BaseApiService {

  private readonly endpoint = '/estates';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Get all estates with optional filtering
   */
  getEstates(searchParams?: EstateSearchRequest): Observable<{
    data: Estate[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}`, searchParams);
  }

  /**
   * Get estate by ID with full details
   */
  getEstateById(id: string): Observable<EstateDetails> {
    return this.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create new estate
   */
  createEstate(estate: EstateCreateRequest): Observable<Estate> {
    return this.post(`${this.endpoint}`, estate);
  }

  /**
   * Update existing estate
   */
  updateEstate(id: string, estate: EstateUpdateRequest): Observable<Estate> {
    return this.put(`${this.endpoint}/${id}`, estate);
  }

  /**
   * Delete estate
   */
  deleteEstate(id: string): Observable<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Get estate statistics
   */
  getEstateStats(): Observable<EstateStats> {
    return this.get(`${this.endpoint}/stats`);
  }

  /**
   * Get estates analytics
   */
  getEstateAnalytics(estateId?: string, period?: string): Observable<any> {
    const params: any = {};
    if (estateId) params.estateId = estateId;
    if (period) params.period = period;

    return this.get(`${this.endpoint}/analytics`, params);
  }

  /**
   * Get estate revenue data
   */
  getEstateRevenue(estateId: string, period: string = 'monthly'): Observable<any> {
    return this.get(`${this.endpoint}/${estateId}/revenue`, { period });
  }

  /**
   * Get estate usage statistics
   */
  getEstateUsage(estateId: string, period: string = 'monthly'): Observable<any> {
    return this.get(`${this.endpoint}/${estateId}/usage`, { period });
  }

  /**
   * Get units for a specific estate
   */
  getEstateUnits(estateId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<{
    units: Unit[];
    pagination: PaginationInfo;
  }> {
    return this.get(`${this.endpoint}/${estateId}/units`, params);
  }

  /**
   * Add unit to estate
   */
  addEstateUnit(estateId: string, unitData: any): Observable<Unit> {
    return this.post(`${this.endpoint}/${estateId}/units`, unitData);
  }

  /**
   * Update estate tariff
   */
  updateEstateTariff(estateId: string, tariffData: {
    rate: number;
    currency: string;
    unit: string;
  }): Observable<Estate> {
    return this.patch(`${this.endpoint}/${estateId}/tariff`, tariffData);
  }

  /**
   * Get estate administrators
   */
  getEstateAdministrators(estateId: string): Observable<any[]> {
    return this.get(`${this.endpoint}/${estateId}/administrators`);
  }

  /**
   * Add administrator to estate
   */
  addEstateAdministrator(estateId: string, adminData: {
    userId: string;
    permissions: string[];
  }): Observable<any> {
    return this.post(`${this.endpoint}/${estateId}/administrators`, adminData);
  }

  /**
   * Remove administrator from estate
   */
  removeEstateAdministrator(estateId: string, adminId: string): Observable<void> {
    return this.delete(`${this.endpoint}/${estateId}/administrators/${adminId}`);
  }

  /**
   * Get estate maintenance requests
   */
  getEstateMaintenanceRequests(estateId: string, params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    return this.get(`${this.endpoint}/${estateId}/maintenance`, params);
  }

  /**
   * Get estate notifications
   */
  getEstateNotifications(estateId: string, params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    return this.get(`${this.endpoint}/${estateId}/notifications`, params);
  }

  /**
   * Upload estate images
   */
  uploadEstateImages(estateId: string, files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<ApiResponse<string[]>>(
      `${this.baseUrl}${this.endpoint}/${estateId}/images`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('khanyi_admin_token')}`
        }
      }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete estate image
   */
  deleteEstateImage(estateId: string, imageUrl: string): Observable<void> {
    return this.delete(`${this.endpoint}/${estateId}/images?imageUrl=${encodeURIComponent(imageUrl)}`);
  }

  /**
   * Get estate dashboard data
   */
  getEstateDashboard(estateId: string): Observable<{
    stats: any;
    recentActivity: any[];
    alerts: any[];
    revenue: any;
    occupancy: any;
  }> {
    return this.get(`${this.endpoint}/${estateId}/dashboard`);
  }

  /**
   * Export estate data
   */
  exportEstateData(estateId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}${this.endpoint}/${estateId}/export`,
      {
        params: { format },
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('khanyi_admin_token')}`
        }
      }
    );
  }

  /**
   * Bulk update estates
   */
  bulkUpdateEstates(estateIds: string[], updateData: Partial<EstateUpdateRequest>): Observable<Estate[]> {
    return this.post(`${this.endpoint}/bulk-update`, {
      estateIds,
      updateData
    });
  }

  /**
   * Search estates by location
   */
  searchEstatesByLocation(coordinates: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  }): Observable<Estate[]> {
    return this.get(`${this.endpoint}/search/location`, coordinates);
  }
}