import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Khanyi Auth Service
import { KhanyiAuthService } from '../services/khanyi-auth.service';
import { UserRole } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private khanyiAuthService: KhanyiAuthService
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        console.log('🛡️ AuthGuard: Checking access to route:', state.url);
        console.log('🔧 Environment auth method:', environment.defaultauth);

        // For Khanyi authentication
        if (environment.defaultauth === 'khanyi') {
            console.log('🔍 Using Khanyi authentication check...');
            return this.khanyiAuthService.isAuthenticated$.pipe(
                take(1),
                map((isAuthenticated: boolean) => {
                    console.log('✅ Current authentication state:', isAuthenticated);
                    console.log('👤 Current user:', this.khanyiAuthService.currentUser?.email || 'null');

                    if (isAuthenticated) {
                        // Check if route requires specific roles
                        const requiredRoles = route.data?.['roles'] as UserRole[];
                        console.log('🎭 Required roles for route:', requiredRoles);

                        if (requiredRoles && requiredRoles.length > 0) {
                            const hasRequiredRole = this.khanyiAuthService.hasAnyRole(requiredRoles);
                            console.log('✅ User has required role:', hasRequiredRole);
                            if (!hasRequiredRole) {
                                console.log('❌ Access denied: insufficient role');
                                // User doesn't have required role, redirect to unauthorized page
                                this.router.navigate(['/pages/error-403']);
                                return false;
                            }
                        }
                        console.log('✅ Access granted to route');
                        return true;
                    } else {
                        console.log('❌ Not authenticated, redirecting to login');
                        // Not authenticated, redirect to login
                        this.router.navigate(['/auth/login'], {
                            queryParams: { returnUrl: state.url }
                        });
                        return false;
                    }
                })
            );
        }

        // Fallback to token check for immediate validation
        console.log('🔍 Using fallback token check...');
        const token = localStorage.getItem('khanyi_admin_token');
        console.log('🔑 Token exists:', !!token);

        if (token) {
            // Check role requirements if specified
            const requiredRoles = route.data?.['roles'] as UserRole[];
            if (requiredRoles && requiredRoles.length > 0) {
                const hasRequiredRole = this.khanyiAuthService.hasAnyRole(requiredRoles);
                if (!hasRequiredRole) {
                    console.log('❌ Fallback: Access denied - insufficient role');
                    this.router.navigate(['/pages/error-403']);
                    return false;
                }
            }
            console.log('✅ Fallback: Access granted');
            return true;
        }

        console.log('❌ Fallback: No token found, redirecting to login');
        // Not authenticated
        this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }
}
