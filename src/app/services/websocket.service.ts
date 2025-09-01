import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardWebSocketEvent } from '../shared/models/dashboard.model';

export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}
  
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private ws?: WebSocket;
  private messagesSubject = new Subject<any>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 segundos

  constructor() {
    // Inicialización automática si está configurado
    if (this.shouldConnect()) {
      this.connect();
    }
  }

  /**
   * Observable para recibir mensajes
   */
  get messages$(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  /**
   * Observable para el estado de conexión
   */
  get connectionStatus$(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Observable para eventos específicos del dashboard
   */
  get dashboardEvents$(): Observable<DashboardWebSocketEvent> {
    return this.messagesSubject.pipe(
      filter(event => this.isDashboardEvent(event)),
      map(event => event as DashboardWebSocketEvent)
    );
  }

  /**
   * Observable para alertas de mantenimiento próximos
   */
  get maintenanceAlerts$(): Observable<any> {
    return this.messagesSubject.pipe(
      filter(event => {
        const isMaintenanceAlert = event && event.type === 'upcoming_maintenance_alerts';
        if (isMaintenanceAlert) {
          console.log('🔔 Filtro de alertas de mantenimiento activado:', event);
        }
        return isMaintenanceAlert;
      }),
      map(event => {
        console.log('📨 Mapeando datos de alertas:', event.data);
        return event.data;
      })
    );
  }

  /**
   * Se conecta al WebSocket
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Ya está conectado
    }

    this.connectionStatusSubject.next(ConnectionStatus.CONNECTING);
    
    try {
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.connectionStatusSubject.next(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Mensaje WebSocket recibido:', data);
          this.messagesSubject.next(data);
        } catch (error) {
          console.warn('Error parseando mensaje WebSocket:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
    }
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
    this.reconnectAttempts = this.maxReconnectAttempts; // Evita reconexión automática
  }

  /**
   * Envía un mensaje a través del WebSocket
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado. No se puede enviar el mensaje:', message);
    }
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtiene la URL del WebSocket
   */
  private getWebSocketUrl(): string {
    // Convierte HTTP a WS
    const baseUrl = environment.UrlServer || 'http://localhost:3000/api';
    const wsUrl = baseUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
      .replace('/api', '/ws'); // Asume que el WebSocket está en /ws
    
    return wsUrl;
  }

  /**
   * Verifica si debe conectarse automáticamente
   */
  private shouldConnect(): boolean {
    // Solo conectar en navegador (no en SSR)
    return typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
  }

  /**
   * Verifica si un evento es del tipo dashboard
   */
  private isDashboardEvent(event: any): boolean {
    return event && 
           typeof event === 'object' && 
           ['dashboard_update', 'machine_status_update', 'maintenance_update'].includes(event.type);
  }

  /**
   * Intenta reconectar automáticamente
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.log('Máximo número de intentos de reconexión alcanzado');
    }
  }
}
