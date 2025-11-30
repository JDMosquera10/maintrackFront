import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingMessageSubject = new BehaviorSubject<string>('Cargando...');
  public loadingMessage$: Observable<string> = this.loadingMessageSubject.asObservable();

  /**
   * Muestra el loading con un mensaje opcional
   */
  show(message: string = 'Cargando...'): void {
    this.loadingMessageSubject.next(message);
    this.loadingSubject.next(true);
  }

  /**
   * Oculta el loading
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Obtiene el estado actual del loading
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Ejecuta una operación Observable mostrando el loading automáticamente
   */
  executeWithLoading<T>(
    operation: Observable<T>,
    message: string = 'Cargando...'
  ): Observable<T> {
    return new Observable<T>(observer => {
      this.show(message);
      
      const subscription = operation.subscribe({
        next: (value) => {
          observer.next(value);
        },
        error: (err) => {
          this.hide();
          observer.error(err);
        },
        complete: () => {
          this.hide();
          observer.complete();
        }
      });

      return () => {
        subscription.unsubscribe();
        this.hide();
      };
    });
  }
}

