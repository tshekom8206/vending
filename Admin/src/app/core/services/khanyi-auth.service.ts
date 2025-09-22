import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import {
  User,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordChangeRequest,
  UserRole
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class KhanyiAuthService extends BaseApiService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    protected override http: HttpClient,
    private router: Router
  ) {
    super(http);
    this.checkStoredAuth();
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.post<any>('/auth/login', credentials).pipe(
      map(response => {
        console.log('🔄 Login API response:', response);
        console.log('🔍 Response structure:', JSON.stringify(response, null, 2));
        console.log('🔍 Response.data:', response.data);
        console.log('🔍 Response.data.accessToken:', response.data?.accessToken);

        // Backend returns: { success: true, data: { accessToken, refreshToken, user } }
        // Frontend expects: { token, refreshToken, user, expiresIn }
        const authUser: AuthUser = {
          token: response.data?.accessToken || response.accessToken,
          refreshToken: response.data?.refreshToken || response.refreshToken,
          user: response.data?.user || response.user,
          expiresIn: 3600 // Default to 1 hour, adjust as needed
        };
        console.log('✅ Mapped AuthUser:', authUser);
        return authUser;
      }),
      tap(authUser => {
        this.setAuthData(authUser);
      }),
      catchError(error => {
        this.clearAuthData();
        throw error;
      })
    );
  }

  /**
   * Register new admin user (system admin only)
   */
  register(userData: RegisterRequest): Observable<AuthUser> {
    return this.post<AuthUser>('/auth/register', userData).pipe(
      tap(authUser => {
        this.setAuthData(authUser);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.post('/auth/logout', {}).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        // Even if logout fails on server, clear local data
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return of(null);
      })
    );
  }

  /**
   * Request password reset
   */
  requestPasswordReset(request: PasswordResetRequest): Observable<any> {
    return this.post('/auth/forgot-password', request);
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.post('/auth/reset-password', { token, password: newPassword });
  }

  /**
   * Change password for current user
   */
  changePassword(request: PasswordChangeRequest): Observable<any> {
    return this.post('/auth/change-password', request);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthUser> {
    const refreshToken = localStorage.getItem('khanyi_admin_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.post<AuthUser>('/auth/refresh', { refreshToken }).pipe(
      tap(authUser => {
        this.setAuthData(authUser);
      }),
      catchError(error => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        throw error;
      })
    );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.get<any>('/auth/me').pipe(
      map((response: any) => {
        // Extract user from nested response structure
        const user = response.user || response;
        return user;
      }),
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Update current user profile
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.put<User>('/auth/profile', userData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.updateStoredUser(user);
      })
    );
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.role === role : false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? roles.includes(currentUser.role) : false;
  }

  /**
   * Check if user is system admin
   */
  isSystemAdmin(): boolean {
    return this.hasRole('system_admin');
  }

  /**
   * Check if user is estate admin
   */
  isEstateAdmin(): boolean {
    return this.hasRole('estate_admin');
  }

  /**
   * Check if user can access admin features
   */
  canAccessAdmin(): boolean {
    return this.hasAnyRole(['system_admin', 'estate_admin']);
  }

  /**
   * Get current user value
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get stored auth token
   */
  get authToken(): string | null {
    return localStorage.getItem('khanyi_admin_token');
  }

  private setAuthData(authUser: AuthUser): void {
    console.log('💾 KhanyiAuthService: setAuthData() called for user:', authUser.user?.email);
    console.log('💾 Storing token:', authUser.token ? `${authUser.token.substring(0, 20)}...` : 'null');
    // Store auth data
    localStorage.setItem('khanyi_admin_token', authUser.token);
    localStorage.setItem('khanyi_admin_user', JSON.stringify(authUser.user));

    if (authUser.refreshToken) {
      localStorage.setItem('khanyi_admin_refresh_token', authUser.refreshToken);
    }

    console.log('✅ Data stored in localStorage');
    console.log('🔍 Verification - token in storage:', localStorage.getItem('khanyi_admin_token') ? 'exists' : 'null');
    console.log('🔍 Verification - user in storage:', localStorage.getItem('khanyi_admin_user') ? 'exists' : 'null');

    // Update subjects
    this.currentUserSubject.next(authUser.user);
    this.isAuthenticatedSubject.next(true);

    // Set token expiry check
    if (authUser.expiresIn) {
      this.setTokenExpiryCheck(authUser.expiresIn);
    }
  }

  private clearAuthData(): void {
    console.log('🧹 KhanyiAuthService: clearAuthData() called');
    console.trace('🔍 Stack trace for clearAuthData call');
    // Clear storage
    localStorage.removeItem('khanyi_admin_token');
    localStorage.removeItem('khanyi_admin_user');
    localStorage.removeItem('khanyi_admin_refresh_token');

    // Update subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Clear any expiry timers
    this.clearTokenExpiryCheck();
  }

  private updateStoredUser(user: User): void {
    localStorage.setItem('khanyi_admin_user', JSON.stringify(user));
  }

  private checkStoredAuth(): void {
    console.log('🔍 KhanyiAuthService: Checking stored auth...');
    const token = localStorage.getItem('khanyi_admin_token');
    const userStr = localStorage.getItem('khanyi_admin_user');

    console.log('🔑 Stored token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('👤 Stored user:', userStr ? 'exists' : 'null');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        console.log('✅ Parsed user from storage:', user.email, 'role:', user.role);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('✅ Set authentication state to true');

        // Verify token is still valid
        console.log('🔄 Verifying token with /auth/me...');
        this.getCurrentUser().subscribe({
          next: (updatedUser) => {
            console.log('✅ Token verification successful, updated user:', updatedUser.email);
            this.currentUserSubject.next(updatedUser);
          },
          error: (error) => {
            console.log('❌ Token verification failed:', error);
            this.clearAuthData();
          }
        });
      } catch (error) {
        console.log('❌ Error parsing stored user data:', error);
        this.clearAuthData();
      }
    } else {
      console.log('❌ No stored authentication data found');
    }
  }

  private tokenExpiryTimer: any;

  private setTokenExpiryCheck(expiresIn: number): void {
    this.clearTokenExpiryCheck();

    // Set timer to refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000; // Convert to milliseconds

    if (refreshTime > 0) {
      this.tokenExpiryTimer = setTimeout(() => {
        this.refreshToken().subscribe({
          error: () => {
            this.clearAuthData();
            this.router.navigate(['/auth/login']);
          }
        });
      }, refreshTime);
    }
  }

  private clearTokenExpiryCheck(): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }
}