import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateCustomerRequest, Customer, CustomerResponse, UpdateCustomerRequest } from '../shared/models/customer.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http, 'customers');
  }

  /**
   * Obtiene un cliente por su número de identificación (público, no requiere autenticación)
   * @param identificationNumber - Número de identificación del cliente
   * @returns Observable con el cliente encontrado
   */
  getCustomerByIdentificationNumber(identificationNumber: string): Observable<Customer> {
    const url = `${this.baseUrl}/${identificationNumber}`;
    return this.http.get<CustomerResponse>(url, {
      headers: this.getHeaders(),
    }).pipe(
      map(response => response.payload as Customer),
      catchError((error) => {
        console.error('Error obteniendo cliente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo cliente
   * @param customer - Datos del cliente a crear
   * @returns Observable con el cliente creado
   */
  createCustomer(customer: CreateCustomerRequest): Observable<Customer> {
    return this.post<Customer>(this.baseUrl, customer).pipe(
      map(result => result as Customer),
      catchError((error) => {
        console.error('Error creando cliente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los clientes (paginado)
   * @param skip - Número de registros a saltar
   * @param limit - Número máximo de registros a retornar
   * @returns Observable con la lista de clientes
   */
  getCustomers(skip: number = 0, limit: number = 20): Observable<Customer[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    return this.get<Customer[]>(`${this.baseUrl}?${params.toString()}`);
  }

  /**
   * Obtiene un cliente por su ID
   * @param id - ID del cliente
   * @returns Observable con el cliente encontrado
   */
  getCustomerById(id: string): Observable<Customer> {
    return this.get<Customer>(`${this.baseUrl}/${id}`);
  }

  /**
   * Actualiza un cliente existente
   * @param id - ID del cliente a actualizar
   * @param customer - Datos del cliente a actualizar
   * @returns Observable con el cliente actualizado
   */
  updateCustomer(id: string, customer: UpdateCustomerRequest): Observable<Customer> {
    return this.put<Customer>(`${this.baseUrl}/${id}`, customer).pipe(
      map(result => result as Customer),
      catchError((error) => {
        console.error('Error actualizando cliente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un cliente
   * @param id - ID del cliente a eliminar
   * @returns Observable con el resultado de la eliminación
   */
  deleteCustomer(id: string): Observable<boolean> {
    return this.delete<{ success: boolean }>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error eliminando cliente:', error);
        return throwError(() => error);
      })
    );
  }
}

