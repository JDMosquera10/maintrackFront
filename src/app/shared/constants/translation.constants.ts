/**
 * Constantes de traducción para el sistema
 * Siguiendo el principio de responsabilidad única (SRP)
 * y el principio de inversión de dependencias (DIP)
 */

export const MACHINE_STATUS_TRANSLATIONS: { [key: string]: string } = {
  operational: 'Operativo',
  maintenance: 'En mantenimiento',
  out_of_service: 'Fuera de servicio'
};

export const MAINTENANCE_TYPE_TRANSLATIONS: { [key: string]: string } = {
  preventive: 'Preventivo',
  corrective: 'Correctivo'
};

/**
 * Interfaz para definir el contrato de traducciones
 * Siguiendo el principio de inversión de dependencias (DIP)
 */
export interface TranslationConstants {
  machineStatus: { [key: string]: string };
  maintenanceType: { [key: string]: string };
}

/**
 * Objeto que implementa la interfaz de traducciones
 * Centraliza todas las traducciones del sistema
 */
export const TRANSLATION_CONSTANTS: TranslationConstants = {
  machineStatus: MACHINE_STATUS_TRANSLATIONS,
  maintenanceType: MAINTENANCE_TYPE_TRANSLATIONS
}; 