import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import { Maintenance } from '../../../shared/models/maintenance.model';
import { ThemeService } from '../../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';
import { GeneralModule } from '../../../modules/general.module';


export interface InfoMaintenanceData {
  maintenance: Maintenance;
}

export interface InfoMaintenanceRequest {
  workHours: number;
  observations: string;
}

@Component({
  selector: 'app-complete-maintenance',
  standalone: true,
  imports: [
    GeneralModule
  ],
  templateUrl: './info-maintenance.component.html',
  styleUrls: ['./info-maintenance.component.scss']
})
export class InfoMaintenanceComponent implements OnInit, OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<InfoMaintenanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InfoMaintenanceData,
    private themeService: ThemeService
  ) {
  }

  ngOnInit(): void {
    // Suscribirse a cambios de tema
    this.themeService.theme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyTheme();
    });
    
    // Aplicar tema inicial
    this.applyTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyTheme(): void {
    const isDark = this.themeService.isDarkTheme();
    const dialogElement = document.querySelector('.complete-maintenance-dialog') as HTMLElement;
    
    if (dialogElement) {
      if (isDark) {
        dialogElement.style.setProperty('--text-primary', '#ffffff');
        dialogElement.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
        dialogElement.style.setProperty('--bg-secondary', '#202837');
        dialogElement.style.setProperty('--bg-tertiary', '#2d3748');
        dialogElement.style.setProperty('--bg-hover', 'rgba(255, 255, 255, 0.1)');
        dialogElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        dialogElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      } else {
        dialogElement.style.setProperty('--text-primary', '#1a202c');
        dialogElement.style.setProperty('--text-secondary', 'rgba(26, 32, 44, 0.7)');
        dialogElement.style.setProperty('--bg-secondary', '#ffffff');
        dialogElement.style.setProperty('--bg-tertiary', '#f8f9fa');
        dialogElement.style.setProperty('--bg-hover', 'rgba(0, 0, 0, 0.04)');
        dialogElement.style.setProperty('--border-color', 'rgba(203, 213, 224, 0.6)');
        dialogElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
