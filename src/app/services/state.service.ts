import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  State, 
  CreateStateRequest, 
  UpdateStateRequest 
} from '../shared/models/state.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class StateService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'maintenances/states');
  }

  /**
   * Obtiene todos los estados
   */
  getStates(): Observable<State[]> {
    return this.get<State[]>(this.baseUrl).pipe(
      map(result => result.map(this.mapToState))
    );
  }

  /**
   * Obtiene solo los estados activos
   */
  getActiveStates(): Observable<State[]> {
    return this.getStates().pipe(
      map(states => states.filter(state => state.isActive))
    );
  }

  /**
   * Obtiene un estado por ID
   */
  getStateById(id: string): Observable<State> {
    return this.get<State>(`${this.baseUrl}/${id}`).pipe(
      map(result => this.mapToState(result))
    );
  }

  /**
   * Crea un nuevo estado
   */
  createState(state: CreateStateRequest): Observable<State> {
    return this.post<State>(this.baseUrl, state).pipe(
      map(result => this.mapToState(result))
    );
  }

  /**
   * Actualiza un estado existente
   */
  updateState(state: UpdateStateRequest): Observable<State> {
    return this.put<State>(`${this.baseUrl}/${state.id}`, state).pipe(
      map(result => this.mapToState(result))
    );
  }

  /**
   * Elimina un estado
   */
  deleteState(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convierte un objeto de datos en un objeto State
   */
  private mapToState(data: any): State {
    return {
      id: data._id || data.id,
      name: data.name,
      description: data.description || '',
      isActive: data.isActive,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
}

