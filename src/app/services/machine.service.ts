
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Machine, 
  CreateMachineRequest, 
  UpdateMachineRequest, 
  PaginatedMachineResponse 
} from '../shared/models/machine.model';
import { IMachineService } from '../shared/interfaces/machine.interface';
import { BaseApiService } from './base-api.service';

@Injectable({ 
  providedIn: 'root' 
})
export class MachineService extends BaseApiService implements IMachineService {
  
  constructor(http: HttpClient) {
    super(http, 'machines');
  }

  /**
   * Fetches a list of machines from the server.
   * @returns An observable containing the list of machines.
   */
  getMachines(): Observable<Machine[]> {
    return this.get<Machine[]>(this.baseUrl);
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
    return this.post<Machine>(this.baseUrl, machine);
  }

  /**
   * Updates an existing machine.
   * @param machine - The machine data to update
   * @returns An observable containing the updated machine.
   */
  updateMachine(machine: UpdateMachineRequest): Observable<Machine> {
    return this.put<Machine>(`${this.baseUrl}/${machine.id}`, machine);
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
   * Fetches paginated machines from the server.
   * @param page - The page number
   * @param limit - The number of items per page
   * @returns An observable containing paginated machine data.
   */
  getMachinesPaginated(page: number, limit: number): Observable<PaginatedMachineResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<PaginatedMachineResponse>(`${this.baseUrl}/paginated`, {
      headers: this.getHeaders(),
      params
    });
  }
}