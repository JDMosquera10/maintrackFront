
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest
} from '../shared/models/machine.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class MachineService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'machines');
  }

  /**
   * Fetches a list of machines from the server.
   * @returns An observable containing the list of machines.
   */
  getMachines(): Observable<Machine[]> {
    return this.get<Machine[]>(this.baseUrl).pipe(map(result => result.map(this.mapToMachine)));
  }

  /**
   * Fetches a machine by its ID.
   * @param id - The machine ID
   * @returns An observable containing the machine data.
   */
  getMachineById(id: string): Observable<Machine> {
    return this.get<Machine>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new machine.
   * @param machine - The machine data to create
   * @returns An observable containing the created machine.
   */
  createMachine(machine: CreateMachineRequest): Observable<Machine> {
    return this.post<Machine>(this.baseUrl, machine).pipe(map(result => this.mapToMachine(result)));
  }

  /**
   * Updates an existing machine.
   * @param machine - The machine data to update
   * @returns An observable containing the updated machine.
   */
  updateMachine(machine: UpdateMachineRequest): Observable<Machine> {
    return this.put<Machine>(`${this.baseUrl}/${machine.id}`, machine).pipe(map(result => this.mapToMachine(result)));
  }

  /**
   * Deletes a machine by its ID.
   * @param id - The machine ID to delete
   * @returns An observable indicating success or failure.
   */
  deleteMachine(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   *  Convierte un objeto de datos en un objeto de máquina.
   * @param data - El objeto de datos a convertir.
   * @returns El objeto de máquina convertido.
   */
  mapToMachine(data: any): Machine {
    return {
      id: data._id,
      model: data.model,
      serialNumber: data.serialNumber,
      status: data.status,
      usageHours: data.usageHours,
      client: data.client,
      location: data.location,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
}