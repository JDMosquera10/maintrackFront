import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Permission, 
  CreatePermissionRequest, 
  UpdatePermissionRequest 
} from '../shared/models/permission.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'permissions');
  }

  /**
   * Obtiene todos los permisos
   */
  getPermissions(): Observable<Permission[]> {
    return this.get<Permission[]>(this.baseUrl).pipe(
      map(result => result.map(this.mapToPermission))
    );
  }

  /**
   * Obtiene un permiso por ID
   */
  getPermissionById(id: string): Observable<Permission> {
    return this.get<Permission>(`${this.baseUrl}/${id}`).pipe(
      map(result => this.mapToPermission(result))
    );
  }

  /**
   * Crea un nuevo permiso
   */
  createPermission(permission: CreatePermissionRequest): Observable<Permission> {
    return this.post<Permission>(this.baseUrl, permission).pipe(
      map(result => this.mapToPermission(result))
    );
  }

  /**
   * Actualiza un permiso existente
   */
  updatePermission(permission: UpdatePermissionRequest): Observable<Permission> {
    return this.put<Permission>(`${this.baseUrl}/${permission.id}`, permission).pipe(
      map(result => this.mapToPermission(result))
    );
  }

  /**
   * Elimina un permiso
   */
  deletePermission(id: string): Observable<boolean> {
    return this.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convierte un objeto de datos en un objeto Permission
   */
  private mapToPermission(data: any): Permission {
    return {
      id: data._id || data.id,
      name: data.name,
      description: data.description,
      resource: data.resource,
      action: data.action,
      isActive: data.isActive,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }
}

