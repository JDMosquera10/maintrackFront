import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { CorporateIdentityService } from '../../../services/corporate-identity.service';
import { DEFAULT_LOGO_URL, FaviconService } from '../../../services/favicon.service';
import { ThemeService } from '../../../services/theme.service';
import { LoginRequest } from '../../../shared/models/user.model';
import { GeneralModule } from '../../../modules/general.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  logoUrl = DEFAULT_LOGO_URL;
  defaultLogoUrl = DEFAULT_LOGO_URL;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private corporateIdentityService: CorporateIdentityService,
    private themeService: ThemeService,
    private faviconService: FaviconService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkAuthStatus();
    this.loadLogoFromParametria();
  }

  /**
   * Carga el logo desde la identidad corporativa (parametría).
   */
  private loadLogoFromParametria(): void {
    this.corporateIdentityService.getCorporateIdentity().subscribe({
      next: () => {
        const theme = this.themeService.getCurrentTheme();
        const identity = this.corporateIdentityService.getIdentityByTheme(theme);
        if (identity?.logoUrl) {
          this.logoUrl = identity.logoUrl;
          this.faviconService.setFavicon(identity.logoUrl);
        }
      }
    });
  }

  private checkAuthStatus(): void {
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService
        .login(credentials)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('Login successful!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Login failed', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least 6 characters`;
    }
    
    return '';
  }
} 