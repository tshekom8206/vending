import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiError } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected baseUrl = environment.apiUrl || 'http://localhost:3000/api/v1';

  constructor(protected http: HttpClient) {}

  protected get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        params: httpParams,
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  protected put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  protected patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = this.getAuthToken();
    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('khanyi_admin_token');
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else if (value instanceof Date) {
            httpParams = httpParams.append(key, value.toISOString());
          } else {
            httpParams = httpParams.append(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    console.log('Base API handleResponse:', response);
    if (response.success && response.data !== undefined) {
      return response.data;
    } else if (response.success) {
      // For endpoints that return the full response structure
      return response as any as T;
    } else {
      throw new Error(response.error || response.message || 'Unknown error occurred');
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific HTTP status codes
    switch (error.status) {
      case 401:
        errorMessage = 'Unauthorized. Please log in again.';
        this.handleUnauthorized();
        break;
      case 403:
        errorMessage = 'Forbidden. You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'Resource not found.';
        break;
      case 422:
        errorMessage = 'Validation error. Please check your input.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
    }

    const apiError: ApiError = {
      code: error.status?.toString() || 'UNKNOWN',
      message: errorMessage,
      details: error.error,
      timestamp: new Date()
    };

    return throwError(() => apiError);
  }

  private handleUnauthorized(): void {
    // Clear auth token and redirect to login
    localStorage.removeItem('khanyi_admin_token');
    localStorage.removeItem('khanyi_admin_user');
    // You can inject Router here and redirect to login
    // this.router.navigate(['/auth/login']);
  }

  // Utility methods for specific API endpoints
  protected buildEndpoint(path: string, id?: string): string {
    return id ? `${path}/${id}` : path;
  }

  protected buildSearchEndpoint(path: string, searchParams: any): string {
    const params = this.buildParams(searchParams);
    return `${path}?${params.toString()}`;
  }
}