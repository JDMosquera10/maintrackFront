import { environment } from '../../environments/environment';

/**
 * Configuración centralizada para WebSocket en el frontend
 */
export interface WebSocketConfig {
  // Configuración de conexión
  connection: {
    url: string;
    protocols?: string | string[];
    timeout: number;
  };
  
  // Configuración de reconexión
  reconnection: {
    enabled: boolean;
    maxAttempts: number;
    baseInterval: number;
    maxInterval: number;
    backoffMultiplier: number;
  };
  
  // Configuración de heartbeat
  heartbeat: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  
  // Configuración de logging
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    showConnectionStatus: boolean;
  };
  
  // Configuración de eventos
  events: {
    enablePingPong: boolean;
    enableConnectionEvents: boolean;
    enableErrorEvents: boolean;
    enableReconnectionEvents: boolean;
  };
  
  // Configuración de seguridad
  security: {
    enableAuth: boolean;
    tokenHeader: string;
    clientIdHeader: string;
  };
}

/**
 * Configuración por defecto para desarrollo
 */
export const defaultWebSocketConfig: WebSocketConfig = {
  connection: {
    url: getWebSocketUrl(),
    timeout: 10000 // 10 segundos
  },
  
  reconnection: {
    enabled: true,
    maxAttempts: 5,
    baseInterval: 1000, // 1 segundo
    maxInterval: 30000, // 30 segundos
    backoffMultiplier: 1.5
  },
  
  heartbeat: {
    enabled: true,
    interval: 30000, // 30 segundos
    timeout: 10000 // 10 segundos
  },
  
  logging: {
    enabled: true,
    level: 'info',
    showConnectionStatus: true
  },
  
  events: {
    enablePingPong: true,
    enableConnectionEvents: true,
    enableErrorEvents: true,
    enableReconnectionEvents: true
  },
  
  security: {
    enableAuth: false, // Habilitar cuando se implemente autenticación
    tokenHeader: 'x-auth-token',
    clientIdHeader: 'x-client-id'
  }
};

/**
 * Configuración para producción
 */
export const productionWebSocketConfig: WebSocketConfig = {
  ...defaultWebSocketConfig,
  logging: {
    enabled: false,
    level: 'error',
    showConnectionStatus: false
  },
  security: {
    enableAuth: true,
    tokenHeader: 'x-auth-token',
    clientIdHeader: 'x-client-id'
  }
};

/**
 * Obtiene la URL del WebSocket basada en la configuración del entorno
 */
function getWebSocketUrl(): string {
  const baseUrl = environment.UrlServer || 'http://localhost:3000/api';
  
  // Convertir HTTP/HTTPS a WS/WSS
  const wsUrl = baseUrl
    .replace('http://', 'ws://')
    .replace('https://', 'wss://')
    .replace('/api', '/ws');
  
  return wsUrl;
}

/**
 * Obtiene la configuración según el entorno
 */
export function getWebSocketConfig(): WebSocketConfig {
  const env = environment.production ? 'production' : 'development';
  
  switch (env) {
    case 'production':
      return productionWebSocketConfig;
    default:
      return defaultWebSocketConfig;
  }
}

/**
 * Constantes de WebSocket para el frontend
 */
export const WebSocketConstants = {
  // Estados de conexión
  CONNECTION_STATUS: {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    ERROR: 'ERROR',
    RECONNECTING: 'RECONNECTING'
  },
  
  // Tipos de eventos
  EVENT_TYPES: {
    // Eventos del sistema
    CONNECTION_ESTABLISHED: 'connection_established',
    PING: 'ping',
    PONG: 'pong',
    ERROR: 'error',
    
    // Eventos de negocio
    DASHBOARD_UPDATE: 'dashboard_update',
    MACHINE_STATUS_UPDATE: 'machine_status_update',
    MAINTENANCE_UPDATE: 'maintenance_update',
    MAINTENANCE_ALERT: 'maintenance_alert',
    UPCOMING_MAINTENANCE_ALERTS: 'upcoming_maintenance_alerts'
  },
  
  // Códigos de error
  ERROR_CODES: {
    NORMAL_CLOSURE: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    POLICY_VIOLATION: 1008,
    MESSAGE_TOO_BIG: 1009,
    INTERNAL_ERROR: 1011
  },
  
  // Mensajes de error
  ERROR_MESSAGES: {
    CONNECTION_FAILED: 'Error al conectar con el servidor WebSocket',
    CONNECTION_LOST: 'Conexión WebSocket perdida',
    RECONNECTION_FAILED: 'Error al reconectar con el servidor',
    MESSAGE_SEND_FAILED: 'Error al enviar mensaje',
    INVALID_MESSAGE: 'Mensaje inválido recibido'
  }
};

/**
 * Utilidades de configuración para WebSocket
 */
export class WebSocketConfigUtils {
  /**
   * Valida la configuración
   */
  static validateConfig(config: WebSocketConfig): boolean {
    if (!config.connection.url) return false;
    if (config.connection.timeout < 1000) return false;
    if (config.reconnection.maxAttempts < 0) return false;
    if (config.reconnection.baseInterval < 100) return false;
    if (config.heartbeat.interval < 5000) return false;
    
    return true;
  }
  
  /**
   * Obtiene el intervalo de reconexión con backoff exponencial
   */
  static getReconnectionInterval(config: WebSocketConfig, attempt: number): number {
    const { baseInterval, maxInterval, backoffMultiplier } = config.reconnection;
    const interval = baseInterval * Math.pow(backoffMultiplier, attempt);
    return Math.min(interval, maxInterval);
  }
  
  /**
   * Verifica si debe intentar reconectar
   */
  static shouldAttemptReconnection(config: WebSocketConfig, attempt: number): boolean {
    return config.reconnection.enabled && attempt < config.reconnection.maxAttempts;
  }
  
  /**
   * Obtiene el token de autenticación (si está disponible)
   */
  static getAuthToken(): string | null {
    // Implementar según tu sistema de autenticación
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }
  
  /**
   * Obtiene el ID del cliente
   */
  static getClientId(): string {
    let clientId = localStorage.getItem('websocket_client_id');
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('websocket_client_id', clientId);
    }
    return clientId;
  }
  
  /**
   * Obtiene headers adicionales para la conexión
   */
  static getConnectionHeaders(config: WebSocketConfig): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (config.security.enableAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers[config.security.tokenHeader] = token;
      }
    }
    
    headers[config.security.clientIdHeader] = this.getClientId();
    
    return headers;
  }
  
  /**
   * Logs condicionales según la configuración
   */
  static log(config: WebSocketConfig, level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (!config.logging.enabled) return;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[config.logging.level];
    const messageLevel = levels[level];
    
    if (messageLevel >= configLevel) {
      const prefix = `[WebSocket] ${level.toUpperCase()}:`;
      switch (level) {
        case 'debug':
          console.debug(prefix, message, ...args);
          break;
        case 'info':
          console.info(prefix, message, ...args);
          break;
        case 'warn':
          console.warn(prefix, message, ...args);
          break;
        case 'error':
          console.error(prefix, message, ...args);
          break;
      }
    }
  }
}
