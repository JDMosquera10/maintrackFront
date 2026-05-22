
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateMaintenanceRequest, Maintenance, UpdateMaintenanceRequest } from '../shared/models/maintenance.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'maintenances');
  }

  /**
   * Fetches a list of maintenances from the server.
   * @returns An observable containing the list of maintenances.
   */
  getMaintenances(): Observable<Maintenance[]> {
    return this.get<Maintenance[]>(this.baseUrl).pipe(
      map(result => {
        if (!result || !Array.isArray(result)) {
          return [];
        }
        return result.map(item => this.mapToMaintenance(item));
      })
    );
  }

   /**
   * Fetches a list of maintenances from the server.
   * @returns An observable containing the list of maintenances.
   */
   getMaintenancesPending(skip = 0, limit = 100): Observable<Maintenance[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.get<any[]>(`${this.baseUrl}/pending`, params).pipe(
      map(result => {
        if (!result || !Array.isArray(result)) {
          console.warn('Result is not an array:', result);
          return [];
        }
        return result.map(item => this.mapToMaintenance(item));
      })
    );
  }

  /**
   * Fetches a list of maintenances from the server.
   * @returns An observable containing the list of maintenances.
   */
  getMaintenancesByTechnicianPending(technicianId: string, skip = 0, limit = 100): Observable<Maintenance[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.get<any[]>(`${this.baseUrl}/technician/${technicianId}/pending`, params).pipe(
      map(result => {
        if (!result || !Array.isArray(result)) {
          console.warn('Result is not an array:', result);
          return [];
        }
        return result.map(item => this.mapToMaintenance(item));
      })
    );
  }

  /**
   * Fetches a list of maintenances from the server.
   * @returns An observable containing the list of maintenances.
   */
  getMaintenancesByTechnician(technicianId: string): Observable<Maintenance[]> {
    return this.get<Maintenance[]>(`${this.baseUrl}/technician/${technicianId}`).pipe(
      map(result => {
        if (!result || !Array.isArray(result)) {
          return [];
        }
        return result.map(item => this.mapToMaintenance(item));
      })
    );
  }

  /**
   * Fetches a machine by its ID.
   * @param id - The machine ID
   * @returns An observable containing the machine data.
   */
  searchMaintenances(
    query: string,
    options: { pendingOnly?: boolean; technicianId?: string } = {},
    skip = 0,
    limit = 100
  ): Observable<Maintenance[]> {
    let params = new HttpParams()
      .set('q', query.trim())
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (options.pendingOnly) {
      params = params.set('pending', 'true');
    }
    if (options.technicianId) {
      params = params.set('technicianId', options.technicianId);
    }

    return this.get<any[]>(`${this.baseUrl}/search`, params).pipe(
      map((result) => {
        if (!result || !Array.isArray(result)) {
          return [];
        }
        return result.map((item) => this.mapToMaintenance(item));
      })
    );
  }

  getMaintenanceById(id: string): Observable<Maintenance> {
    return this.get<Maintenance>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new machine.
   * @param machine - The machine data to create
   * @returns An observable containing the created machine.
   */
  createMaintenance(maintenance: CreateMaintenanceRequest): Observable<Maintenance> {
    return this.post<Maintenance>(this.baseUrl, maintenance).pipe(
      map(result => this.mapToMaintenance(result))
    );
  }

  /**
   * Updates an existing machine.
   * @param machine - The machine data to update
   * @returns An observable containing the updated machine.
   */
  updateMaintenance(maintenance: UpdateMaintenanceRequest): Observable<Maintenance> {
    return this.put<Maintenance>(`${this.baseUrl}/${maintenance.id}`, maintenance).pipe(
      map(result => this.mapToMaintenance(result))
    );
  }

  /**
   * Deletes a machine by its ID.
   * @param id - The machine ID to delete
   * @returns An observable indicating success or failure.
   */
  deleteMaintenance(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Completes a maintenance by its ID with work hours and observations.
   * @param id - The maintenance ID to complete
   * @param workHours - The number of hours worked
   * @param observations - The observations about the completed work
   * @returns An observable indicating success or failure.
   */
  completeMaintenance(id: string, workHours: number, observations: string): Observable<boolean> {
    return this.patch<boolean>(`${this.baseUrl}/${id}/complete`, {
      workHours,
      observations
    });
  }

  /**
   * Updates the state of a maintenance.
   * @param maintenanceId - The maintenance ID
   * @param stateId - The new state ID
   * @param observations - Optional observations
   * @returns An observable with the updated maintenance.
   */
  updateMaintenanceState(maintenanceId: string, stateId: string, observations?: string): Observable<Maintenance> {
    return this.patch<Maintenance>(`${this.baseUrl}/${maintenanceId}/state`, {
      stateId,
      observations
    }).pipe(
      map(result => this.mapToMaintenance(result))
    );
  }

  /**
   *  Convierte un objeto de datos en un objeto de mantenimiento.
   * @param data - El objeto de datos a convertir.
   * @returns El objeto de mantenimiento convertido.
   */
  mapToMaintenance(data: any): Maintenance {
    // Extraer typeId - puede venir como objeto populated o como string
    let typeId: string | undefined;
    let typeName: string = '';
    
    if (data.typeId) {
      if (typeof data.typeId === 'object' && data.typeId._id) {
        // Viene populated como objeto
        typeId = data.typeId._id;
        typeName = data.typeId.name || '';
      } else if (typeof data.typeId === 'object' && data.typeId.id) {
        typeId = data.typeId.id;
        typeName = data.typeId.name || '';
      } else if (typeof data.typeId === 'string') {
        typeId = data.typeId;
      }
    }
    
    // Si no hay typeId pero hay type como string, usarlo
    if (!typeId && data.type) {
      typeName = typeof data.type === 'string' ? data.type : data.type.name || '';
    }
    
    // Extraer currentStateId - puede venir como objeto populated o como string
    let currentStateId: string | undefined;
    let currentState: any = undefined;
    
    if (data.currentStateId) {
      if (typeof data.currentStateId === 'object' && data.currentStateId._id) {
        // Viene populated como objeto
        currentStateId = data.currentStateId._id;
        currentState = this.mapState(data.currentStateId);
      } else if (typeof data.currentStateId === 'object' && data.currentStateId.id) {
        currentStateId = data.currentStateId.id;
        currentState = this.mapState(data.currentStateId);
      } else if (typeof data.currentStateId === 'string') {
        currentStateId = data.currentStateId;
      }
    }

    return {
      id: data._id || data.id,
      machineId: data.machineId,
      date: data.date ? new Date(data.date) : new Date(),
      observations: data.observations || '',
      workHours: data.workHours,
      type: typeName, // Nombre del tipo para compatibilidad
      typeId: typeId,
      currentStateId: currentStateId,
      currentState: currentState,
      spareParts: Array.isArray(data.spareParts) ? data.spareParts : [],
      technicianId: data.technicianId,
      technician: this.mapTechnicianName(data.technicianId),
      isCompleted: data.isCompleted === true,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private mapTechnicianName(technicianId: unknown): string | undefined {
    if (!technicianId || typeof technicianId !== 'object') {
      return undefined;
    }
    const technician = technicianId as { firstName?: string; lastName?: string };
    const name = `${technician.firstName || ''} ${technician.lastName || ''}`.trim();
    return name || undefined;
  }

  private mapState(data: any): any {
    if (!data || typeof data !== 'object') return undefined;
    return {
      id: data._id || data.id,
      name: data.name || '',
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true
    };
  }
}