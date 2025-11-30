import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateTypeMaintenanceStateRequest,
  TypeMaintenanceState,
  UpdateTypeMaintenanceStateRequest
} from '../shared/models/type-maintenance-state.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class TypeMaintenanceStateService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'maintenances/type-maintenance-states');
  }

  /**
   * Obtiene los estados de un tipo de mantenimiento
   */
  getStatesByTypeMaintenance(typeMaintenanceId: string): Observable<TypeMaintenanceState[]> {
    return this.get<any[]>(`${this.baseUrl}/type-maintenance/${typeMaintenanceId}`).pipe(
      map(result => {
        if (result === null || result === undefined) {
          return [];
        }
        
        if (!Array.isArray(result)) {
          if (typeof result === 'object' && result !== null && '_id' in result) {
            return [this.mapToTypeMaintenanceState(result)];
          }
          return [];
        }
        
        return result.map(item => this.mapToTypeMaintenanceState(item));
      })
    );
  }

  /**
   * Obtiene los tipos de mantenimiento de un estado
   */
  getTypeMaintenancesByState(stateId: string): Observable<TypeMaintenanceState[]> {
    return this.get<TypeMaintenanceState[]>(`${this.baseUrl}/state/${stateId}`).pipe(
      map(result => result.map(this.mapToTypeMaintenanceState))
    );
  }

  /**
   * Obtiene una relación por ID
   */
  getTypeMaintenanceStateById(id: string): Observable<TypeMaintenanceState> {
    return this.get<TypeMaintenanceState>(`${this.baseUrl}/${id}`).pipe(
      map(result => this.mapToTypeMaintenanceState(result))
    );
  }

  /**
   * Crea una nueva relación tipo-estado
   */
  createTypeMaintenanceState(relation: CreateTypeMaintenanceStateRequest): Observable<TypeMaintenanceState> {
    return this.post<TypeMaintenanceState>(this.baseUrl, relation).pipe(
      map(result => this.mapToTypeMaintenanceState(result))
    );
  }

  /**
   * Actualiza una relación tipo-estado
   */
  updateTypeMaintenanceState(relation: UpdateTypeMaintenanceStateRequest): Observable<TypeMaintenanceState> {
    return this.put<TypeMaintenanceState>(`${this.baseUrl}/${relation.id}`, relation).pipe(
      map(result => this.mapToTypeMaintenanceState(result))
    );
  }

  /**
   * Actualiza el orden de un estado en un tipo de mantenimiento
   */
  updateOrder(typeMaintenanceId: string, stateId: string, order: number): Observable<TypeMaintenanceState> {
    return this.put<TypeMaintenanceState>(`${this.baseUrl}/order/${typeMaintenanceId}/${stateId}`, { order }).pipe(
      map(result => this.mapToTypeMaintenanceState(result))
    );
  }

  /**
   * Elimina una relación tipo-estado
   */
  deleteTypeMaintenanceState(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convierte un objeto de datos en un objeto TypeMaintenanceState
   */
  private mapToTypeMaintenanceState(data: any): TypeMaintenanceState {
    const stateId = this.extractId(data.stateId);
    const typeMaintenanceId = this.extractId(data.typeMaintenanceId);
    
    const state = this.mapStateIfPopulated(data.stateId);
    const typeMaintenance = this.mapTypeMaintenanceIfPopulated(data.typeMaintenanceId);

    return {
      id: data._id || data.id,
      typeMaintenanceId: typeMaintenanceId || '',
      stateId: stateId || '',
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      state: state,
      typeMaintenance: typeMaintenance,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  /**
   * Extrae el ID de un campo que puede venir como objeto populated o como string
   */
  private extractId(field: any): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
      return field._id || field.id || '';
    }
    return String(field);
  }

  /**
   * Mapea el estado si viene como objeto populated
   */
  private mapStateIfPopulated(field: any): any {
    if (!field || typeof field !== 'object') return undefined;
    
    return {
      id: field._id || field.id,
      name: field.name || '',
      description: field.description || '',
      isActive: field.isActive !== undefined ? field.isActive : true
    };
  }

  /**
   * Mapea el tipo de mantenimiento si viene como objeto populated
   */
  private mapTypeMaintenanceIfPopulated(field: any): any {
    if (!field || typeof field !== 'object') return undefined;
    
    return {
      id: field._id || field.id,
      name: field.name || '',
      description: field.description || '',
      isActive: field.isActive !== undefined ? field.isActive : true
    };
  }
}

