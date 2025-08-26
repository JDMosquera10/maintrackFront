import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = new BehaviorSubject<ThemeMode>('dark');
  
  // Observable para que los componentes puedan suscribirse
  public theme$ = this.currentTheme.asObservable();

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    // Solo cargar el tema si estamos en el browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedTheme();
    } else {
      // En el servidor, usar tema por defecto sin aplicar al DOM
      this.currentTheme.next('dark');
    }
  }

  /**
   * Cambia entre tema oscuro y claro
   */
  toggleTheme(): void {
    const newTheme: ThemeMode = this.currentTheme.value === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme.next(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): ThemeMode {
    return this.currentTheme.value;
  }

  /**
   * Verifica si el tema actual es oscuro
   */
  isDarkTheme(): boolean {
    return this.currentTheme.value === 'dark';
  }

  /**
   * Aplica el tema al DOM
   */
  private applyTheme(theme: ThemeMode): void {
    // Solo aplicar al DOM si estamos en el browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlElement = document.documentElement;
    
    // Remover clases anteriores
    this.renderer.removeClass(htmlElement, 'theme-dark');
    this.renderer.removeClass(htmlElement, 'theme-light');
    
    // Agregar nueva clase
    this.renderer.addClass(htmlElement, `theme-${theme}`);
    
    // Actualizar atributo data-theme para compatibilidad con CSS
    this.renderer.setAttribute(htmlElement, 'data-theme', theme);
  }

  /**
   * Guarda la preferencia de tema en localStorage
   */
  private saveTheme(theme: ThemeMode): void {
    // Solo usar localStorage si estamos en el browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem('app-theme', theme);
    } catch (error) {
      console.warn('No se pudo guardar la preferencia de tema:', error);
    }
  }

  /**
   * Carga la preferencia de tema guardada
   */
  private loadSavedTheme(): void {
    // Solo acceder a localStorage si estamos en el browser
    if (!isPlatformBrowser(this.platformId)) {
      this.setTheme('dark');
      return;
    }

    try {
      const savedTheme = localStorage.getItem('app-theme') as ThemeMode;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        this.setTheme(savedTheme);
      } else {
        // Si no hay tema guardado, usar el tema por defecto (dark)
        this.setTheme('dark');
      }
    } catch (error) {
      console.warn('No se pudo cargar la preferencia de tema:', error);
      this.setTheme('dark');
    }
  }
}
