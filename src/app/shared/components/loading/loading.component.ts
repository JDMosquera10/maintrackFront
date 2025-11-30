import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';
import { CorporateIdentityService } from '../../../services/corporate-identity.service';
import { ThemeService } from '../../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit, OnDestroy {
  isLoading = false;
  loadingMessage = 'Cargando...';
  logoUrl = 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/fondos/logo2.png';
  private destroy$ = new Subject<void>();

  constructor(
    private loadingService: LoadingService,
    private corporateIdentityService: CorporateIdentityService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de loading
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Suscribirse al mensaje de loading
    this.loadingService.loadingMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.loadingMessage = message;
      });

    // Cargar logo de la identidad corporativa
    this.loadLogo();

    // Suscribirse a cambios de tema
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadLogo();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLogo(): void {
    const currentTheme = this.themeService.getCurrentTheme();
    const identity = this.corporateIdentityService.getIdentityByTheme(currentTheme);
    
    if (identity && identity.logoUrl) {
      this.logoUrl = identity.logoUrl;
    }
  }
}

