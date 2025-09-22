import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Store, select } from '@ngrx/store';
import { login } from 'src/app/store/actions/authentication.actions';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { KhanyiAuthService } from 'src/app/core/services/khanyi-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;

  toast!: false;;

  // set the current year
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private AuthenticationService: AuthenticationService,
    private khanyiAuthService: KhanyiAuthService
  ) {
    // redirect to home if already logged in
    if (this.khanyiAuthService.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    if (this.khanyiAuthService.isAuthenticated) {
      this.router.navigate(['/']);
    }
    /**
     * Form Validation
     */
    this.loginForm = this.formBuilder.group({
      email: ['admin@khanyi.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const email = this.f['email'].value;
    const password = this.f['password'].value;

    // Use Khanyi authentication service
    this.khanyiAuthService.login({ email, password }).subscribe({
      next: (authUser) => {
        // Successful login - redirect to dashboard
        this.router.navigate(['/']);
      },
      error: (error) => {
        // Handle login error
        this.error = error.message || 'Login failed. Please check your credentials.';
        this.submitted = false;
      }
    });
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
