import { Injectable } from '@angular/core';
import { TRANSLATION_CONSTANTS, TranslationConstants } from '../constants/translation.constants';

/**
 * Servicio de traducción
 * Siguiendo el principio de responsabilidad única (SRP)
 * y el principio de inversión de dependencias (DIP)
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  
  private readonly translations: TranslationConstants = TRANSLATION_CONSTANTS;

  /**
   * Obtiene la traducción del estado de una máquina
   * @param status - Estado de la máquina
   * @returns Traducción del estado o el estado original si no existe traducción
   */
  getMachineStatusTranslation(status: string): string {
    return this.translations.machineStatus[status] || status;
  }

  /**
   * Obtiene la traducción del tipo de mantenimiento
   * @param type - Tipo de mantenimiento
   * @returns Traducción del tipo o el tipo original si no existe traducción
   */
  getMaintenanceTypeTranslation(type: string): string {
    return this.translations.maintenanceType[type] || type;
  }

  /**
   * Obtiene todas las traducciones de estados de máquinas
   * @returns Objeto con todas las traducciones de estados
   */
  getMachineStatusTranslations(): { [key: string]: string } {
    return { ...this.translations.machineStatus };
  }

  /**
   * Obtiene todas las traducciones de tipos de mantenimiento
   * @returns Objeto con todas las traducciones de tipos
   */
  getMaintenanceTypeTranslations(): { [key: string]: string } {
    return { ...this.translations.maintenanceType };
  }

  /**
   * Obtiene todas las traducciones disponibles
   * @returns Objeto con todas las traducciones del sistema
   */
  getAllTranslations(): TranslationConstants {
    return { ...this.translations };
  }
} 