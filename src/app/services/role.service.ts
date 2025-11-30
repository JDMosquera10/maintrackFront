import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest 
} from '../shared/models/role.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'roles');
  }

  /**
   * Obtiene todos los roles
   */
  getRoles(): Observable<Role[]> {
    return this.get<Role[]>(this.baseUrl).pipe(
      map(result => result.map(this.mapToRole))
    );
  }

  /**
   * Obtiene un rol por ID
   */
  getRoleById(id: string): Observable<Role> {
    return this.get<Role>(`${this.baseUrl}/${id}`).pipe(
      map(result => this.mapToRole(result))
    );
  }

  /**
   * Crea un nuevo rol
   */
  createRole(role: CreateRoleRequest): Observable<Role> {
    return this.post<Role>(this.baseUrl, role).pipe(
      map(result => this.mapToRole(result))
    );
  }

  /**
   * Actualiza un rol existente
   */
  updateRole(role: UpdateRoleRequest): Observable<Role> {
    return this.put<Role>(`${this.baseUrl}/${role.id}`, role).pipe(
      map(result => this.mapToRole(result))
    );
  }

  /**
   * Elimina un rol
   */
  deleteRole(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convierte un objeto de datos en un objeto Role
   */
  private mapToRole(data: any): Role {
    return {
      id: data._id || data.id,
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
      isActive: data.isActive,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
}

