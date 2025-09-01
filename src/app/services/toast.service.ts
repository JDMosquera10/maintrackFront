import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MaintenanceAlert } from '../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Muestra una notificación de alerta de mantenimiento próximo
   */
  showMaintenanceAlert(alert: MaintenanceAlert): void {
    const config: MatSnackBarConfig = {
      duration: 8000, // 8 segundos
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: this.getAlertPanelClass(alert.priority)
    };

    const message = this.formatMaintenanceAlertMessage(alert);
    
    this.snackBar.open(message, 'Cerrar', config);
  }

  /**
   * Muestra una notificación de mantenimiento crítico
   */
  showCriticalMaintenanceAlert(alert: MaintenanceAlert): void {
    const config: MatSnackBarConfig = {
      duration: 0, // No se cierra automáticamente
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['critical-alert', this.getAlertPanelClass(alert.priority)]
    };

    const message = this.formatMaintenanceAlertMessage(alert);
    
    this.snackBar.open(message, 'Entendido', config);
  }

  /**
   * Muestra una notificación de mantenimiento vencido
   */
  showOverdueMaintenanceAlert(alert: MaintenanceAlert): void {
    const config: MatSnackBarConfig = {
      duration: 0, // No se cierra automáticamente
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['overdue-alert', this.getAlertPanelClass(alert.priority)]
    };

    const message = this.formatMaintenanceAlertMessage(alert);
    
    this.snackBar.open(message, 'Ver Detalles', config);
  }

  /**
   * Formatea el mensaje de la alerta de mantenimiento
   */
  private formatMaintenanceAlertMessage(alert: MaintenanceAlert): string {
    const daysText = this.getDaysText(alert.daysRemaining);
    const priorityText = this.getPriorityText(alert.priority);
    
    return `⚙️ ${priorityText}: ${alert.machineModel} (${alert.machineSerial}) - ${daysText}`;
  }

  /**
   * Obtiene el texto de días restantes
   */
  private getDaysText(daysRemaining: number): string {
    if (daysRemaining < 0) {
      const days = Math.abs(daysRemaining);
      return `Vencido hace ${days} día${days !== 1 ? 's' : ''}`;
    } else if (daysRemaining === 0) {
      return 'Vence HOY';
    } else if (daysRemaining === 1) {
      return 'Vence MAÑANA';
    } else {
      return `Vence en ${daysRemaining} días`;
    }
  }

  /**
   * Obtiene el texto de prioridad
   */
  private getPriorityText(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'CRÍTICO';
      case 'high':
        return 'ALTA';
      case 'medium':
        return 'MEDIA';
      case 'low':
        return 'BAJA';
      default:
        return 'MANTENIMIENTO';
    }
  }

  /**
   * Obtiene la clase CSS del panel según la prioridad
   */
  private getAlertPanelClass(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'alert-critical';
      case 'high':
        return 'alert-high';
      case 'medium':
        return 'alert-medium';
      case 'low':
        return 'alert-low';
      default:
        return 'alert-info';
    }
  }

  /**
   * Muestra una notificación de información general
   */
  showInfo(message: string, duration: number = 4000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'alert-info'
    };

    this.snackBar.open(message, 'Cerrar', config);
  }

  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string, duration: number = 4000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'alert-success'
    };

    this.snackBar.open(message, 'Cerrar', config);
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string, duration: number = 6000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'alert-warning'
    };

    this.snackBar.open(message, 'Cerrar', config);
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string, duration: number = 8000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'alert-error'
    };

    this.snackBar.open(message, 'Cerrar', config);
  }
}
