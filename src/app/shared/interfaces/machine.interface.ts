import { Observable } from 'rxjs';
import { Machine, CreateMachineRequest, UpdateMachineRequest, MachineResponse, PaginatedMachineResponse } from '../models/machine.model';

export interface IMachineService {
  getMachines(): Observable<Machine[]>;
  getMachineById(id: string): Observable<Machine>;
  createMachine(machine: CreateMachineRequest): Observable<Machine>;
  updateMachine(machine: UpdateMachineRequest): Observable<Machine>;
  deleteMachine(id: string): Observable<boolean>;
  getMachinesPaginated(page: number, limit: number): Observable<PaginatedMachineResponse>;
} 