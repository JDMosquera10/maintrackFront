
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Maintenance, CreateMaintenanceRequest, UpdateMaintenanceRequest } from '../shared/models/maintenance.model';
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
    return this.get<Maintenance[]>(this.baseUrl).pipe(map(result => result.map(this.mapToMaintenance)));
  }

  /**
   * Fetches a machine by its ID.
   * @param id - The machine ID
   * @returns An observable containing the machine data.
   */
  getMaintenanceById(id: string): Observable<Maintenance> {
    return this.get<Maintenance>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new machine.
   * @param machine - The machine data to create
   * @returns An observable containing the created machine.
   */
  createMaintenance(maintenance: CreateMaintenanceRequest): Observable<Maintenance> {
    return this.post<Maintenance>(this.baseUrl, maintenance).pipe(map(result => this.mapToMaintenance(result)));
  }

  /**
   * Updates an existing machine.
   * @param machine - The machine data to update
   * @returns An observable containing the updated machine.
   */
  updateMaintenance(maintenance: UpdateMaintenanceRequest): Observable<Maintenance> {
    return this.put<Maintenance>(`${this.baseUrl}/${maintenance.id}`, maintenance).pipe(map(result => this.mapToMaintenance(result)));
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
   *  Convierte un objeto de datos en un objeto de máquina.
   * @param data - El objeto de datos a convertir.
   * @returns El objeto de máquina convertido.
   */
  mapToMaintenance(data: any): Maintenance {
    return {
      id: data._id,
      machineId: data.machineId,
      date: data.date,
      observations: data.observations,
      workHours: data.workHours,
      type: data.type,
      spareParts: data.spareParts,
      technicianId: data.technicianId,
      isCompleted: data.isCompleted,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
}