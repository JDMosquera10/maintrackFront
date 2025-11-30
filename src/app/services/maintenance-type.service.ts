import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateMaintenanceTypeRequest,
  MaintenanceType,
  UpdateMaintenanceTypeRequest
} from '../shared/models/maintenance-type.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceTypeService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'maintenances/types');
  }

  /**
   * Obtiene todos los tipos de mantenimiento
   */
  getMaintenanceTypes(): Observable<MaintenanceType[]> {
    return this.get<MaintenanceType[]>(this.baseUrl).pipe(
      map(result => result.map(this.mapToMaintenanceType))
    );
  }

  /**
   * Obtiene solo los tipos de mantenimiento activos
   */
  getActiveMaintenanceTypes(): Observable<MaintenanceType[]> {
    return this.get<MaintenanceType[]>(`${this.baseUrl}/active`).pipe(
      map(result => result.map(this.mapToMaintenanceType))
    );
  }

  /**
   * Obtiene un tipo de mantenimiento por ID
   */
  getMaintenanceTypeById(id: string): Observable<MaintenanceType> {
    return this.get<MaintenanceType>(`${this.baseUrl}/${id}`).pipe(
      map(result => this.mapToMaintenanceType(result))
    );
  }

  /**
   * Crea un nuevo tipo de mantenimiento
   */
  createMaintenanceType(maintenanceType: CreateMaintenanceTypeRequest): Observable<MaintenanceType> {
    return this.post<MaintenanceType>(this.baseUrl, maintenanceType).pipe(
      map(result => this.mapToMaintenanceType(result))
    );
  }

  /**
   * Actualiza un tipo de mantenimiento existente
   */
  updateMaintenanceType(maintenanceType: UpdateMaintenanceTypeRequest): Observable<MaintenanceType> {
    return this.put<MaintenanceType>(`${this.baseUrl}/${maintenanceType.id}`, maintenanceType).pipe(
      map(result => this.mapToMaintenanceType(result))
    );
  }

  /**
   * Elimina un tipo de mantenimiento
   */
  deleteMaintenanceType(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convierte un objeto de datos en un objeto MaintenanceType
   */
  private mapToMaintenanceType(data: any): MaintenanceType {
    return {
      id: data._id || data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
}

