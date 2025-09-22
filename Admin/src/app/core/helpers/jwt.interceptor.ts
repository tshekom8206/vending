import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/auth.service';
import { AuthfakeauthenticationService } from '../services/authfake.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private authfackservice: AuthfakeauthenticationService
    ) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        console.log('🔄 JWT Interceptor called for:', request.url);
        console.log('🔧 Environment auth method:', environment.defaultauth);

        if (environment.defaultauth === 'firebase') {
            // add authorization header with jwt token if available
            let currentUser = this.authenticationService.currentUser();
            console.log('🔥 Firebase currentUser:', currentUser);
            if (currentUser && currentUser.token) {
                console.log('✅ Adding Firebase token to request');
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
            } else {
                console.log('❌ No Firebase token available');
            }
        } else if (environment.defaultauth === 'khanyi') {
            // add authorization header with Khanyi JWT token directly from localStorage
            const token = localStorage.getItem('khanyi_admin_token');
            console.log('🔑 Khanyi token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
            if (token) {
                console.log('✅ Adding Khanyi token to request');
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                console.log('❌ No Khanyi token available');
            }
        } else {
            // add authorization header with jwt token if available (fake backend)
            const currentUser = this.authfackservice.currentUserValue;
            console.log('🎭 Fake auth currentUser:', currentUser);
            if (currentUser && currentUser.token) {
                console.log('✅ Adding fake auth token to request');
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
            } else {
                console.log('❌ No fake auth token available');
            }
        }

        console.log('📤 Final request headers:', request.headers.keys());
        return next.handle(request);
    }
}
