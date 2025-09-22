import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import {
  Unit,
  UnitCreateRequest,
  UnitUpdateRequest,
  UnitSearchRequest,
  UnitStats
} from '../models/unit.interface';

@Injectable({
  providedIn: 'root'
})
export class UnitService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Get all units with optional filtering
   */
  getUnits(params?: UnitSearchRequest): Observable<Unit[]> {
    return this.get<any>('/units', params).pipe(
      map(response => {
        console.log('Units API response:', response);
        if (response && response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  /**
   * Get units by estate ID
   */
  getUnitsByEstate(estateId: string, params?: UnitSearchRequest): Observable<Unit[]> {
    return this.get<any>(`/estates/${estateId}/units`, params).pipe(
      map(response => {
        console.log('Units by estate API response:', response);
        if (response && response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  /**
   * Get unit by ID
   */
  getUnitById(id: string): Observable<Unit> {
    return this.get<any>(`/units/${id}`).pipe(
      map(response => {
        console.log('Unit detail API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Create new unit
   */
  createUnit(unitData: UnitCreateRequest): Observable<Unit> {
    return this.post<any>('/units', unitData).pipe(
      map(response => {
        console.log('Create unit API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Update unit
   */
  updateUnit(id: string, unitData: UnitUpdateRequest): Observable<Unit> {
    return this.put<any>(`/units/${id}`, unitData).pipe(
      map(response => {
        console.log('Update unit API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Delete unit
   */
  deleteUnit(id: string): Observable<void> {
    return this.delete<any>(`/units/${id}`).pipe(
      map(response => {
        console.log('Delete unit API response:', response);
        return;
      })
    );
  }

  /**
   * Assign tenant to unit
   */
  assignTenant(unitId: string, tenantData: {
    tenantId: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    deposit: number;
  }): Observable<Unit> {
    return this.post<any>(`/units/${unitId}/tenant`, tenantData).pipe(
      map(response => {
        console.log('Assign tenant API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Remove tenant from unit
   */
  removeTenant(unitId: string): Observable<Unit> {
    return this.delete<any>(`/units/${unitId}/tenant`).pipe(
      map(response => {
        console.log('Remove tenant API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Get unit statistics
   */
  getUnitStats(estateId?: string): Observable<UnitStats> {
    const endpoint = estateId ? `/estates/${estateId}/units/stats` : '/units/stats';
    return this.get<any>(endpoint).pipe(
      map(response => {
        console.log('Unit stats API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Upload unit images
   */
  uploadUnitImages(unitId: string, images: FormData): Observable<Unit> {
    return this.http.post<any>(`${this.baseUrl}/units/${unitId}/images`, images).pipe(
      map(response => {
        console.log('Upload images API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Add maintenance record
   */
  addMaintenanceRecord(unitId: string, maintenanceData: {
    type: string;
    description: string;
    cost?: number;
    technician?: string;
  }): Observable<Unit> {
    return this.post<any>(`/units/${unitId}/maintenance`, maintenanceData).pipe(
      map(response => {
        console.log('Add maintenance API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Update maintenance record
   */
  updateMaintenanceRecord(unitId: string, maintenanceId: string, updates: {
    status?: string;
    cost?: number;
    notes?: string;
  }): Observable<Unit> {
    return this.put<any>(`/units/${unitId}/maintenance/${maintenanceId}`, updates).pipe(
      map(response => {
        console.log('Update maintenance API response:', response);
        return response.data || response;
      })
    );
  }

  /**
   * Schedule inspection
   */
  scheduleInspection(unitId: string, inspectionData: {
    type: string;
    date: Date;
    inspector: string;
    notes?: string;
  }): Observable<Unit> {
    return this.post<any>(`/units/${unitId}/inspections`, inspectionData).pipe(
      map(response => {
        console.log('Schedule inspection API response:', response);
        return response.data || response;
      })
    );
  }
}