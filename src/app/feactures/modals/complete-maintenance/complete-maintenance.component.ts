import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Maintenance } from '../../../shared/models/maintenance.model';
import { ThemeService } from '../../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

export interface CompleteMaintenanceData {
  maintenance: Maintenance;
}

export interface CompleteMaintenanceRequest {
  workHours: number;
  observations: string;
}

@Component({
  selector: 'app-complete-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './complete-maintenance.component.html',
  styleUrls: ['./complete-maintenance.component.scss']
})
export class CompleteMaintenanceComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<CompleteMaintenanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CompleteMaintenanceData,
    private fb: FormBuilder,
    private themeService: ThemeService
  ) {
    this.form = this.fb.group({
      workHours: ['', [Validators.required, Validators.min(0.1), Validators.max(24)]],
      observations: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
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

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      const request: CompleteMaintenanceRequest = {
        workHours: this.form.value.workHours,
        observations: this.form.value.observations
      };
      this.dialogRef.close(request);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('min')) {
      return fieldName === 'workHours' ? 'Las horas deben ser mayor a 0' : 'Mínimo 10 caracteres';
    }
    if (field?.hasError('max')) {
      return fieldName === 'workHours' ? 'Las horas no pueden exceder 24' : 'Máximo 500 caracteres';
    }
    if (field?.hasError('minlength')) {
      return 'Mínimo 10 caracteres';
    }
    if (field?.hasError('maxlength')) {
      return 'Máximo 500 caracteres';
    }
    return '';
  }
}
