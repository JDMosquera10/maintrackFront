import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CorporateIdentityService } from './corporate-identity.service';
import { CorporateIdentity } from '../shared/models/corporate-identity.model';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = new BehaviorSubject<ThemeMode>('dark');
  private corporateIdentities: Map<'dark' | 'light', CorporateIdentity | null> = new Map();
  private identitiesLoaded = false;
  
  // Observable para que los componentes puedan suscribirse
  public theme$ = this.currentTheme.asObservable();

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private corporateIdentityService: CorporateIdentityService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    // Solo cargar el tema si estamos en el browser
    if (isPlatformBrowser(this.platformId)) {
      // Aplicar el tema guardado inmediatamente para evitar flash
      this.loadSavedThemeSync();
      
      // Luego cargar la identidad corporativa de forma asíncrona
      this.loadCorporateIdentity().then(() => {
        // Aplicar colores corporativos después de cargar
        this.applyCorporateColors(this.currentTheme.value);
      }).catch(() => {
        // Si falla la carga, usar valores por defecto
        this.applyDefaultColors(this.currentTheme.value);
      });
    } else {
      // En el servidor, usar tema por defecto sin aplicar al DOM
      this.currentTheme.next('dark');
    }
  }

  /**
   * Cambia entre tema oscuro y claro
   * Solo funciona si hay más de un tema disponible
   */
  toggleTheme(): void {
    // Verificar si se debe permitir el cambio de tema
    if (!this.shouldShowThemeToggle()) {
      return;
    }
    
    const availableThemes = this.corporateIdentityService.getAvailableThemes();
    
    // Si no hay temas disponibles, usar los por defecto (dark y light)
    if (availableThemes.length === 0) {
      const newTheme: ThemeMode = this.currentTheme.value === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
      return;
    }
    
    // Si hay más de un tema disponible, alternar entre ellos
    if (availableThemes.length > 1) {
      const currentIndex = availableThemes.indexOf(this.currentTheme.value);
      const nextIndex = (currentIndex + 1) % availableThemes.length;
      this.setTheme(availableThemes[nextIndex]);
    }
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme.next(theme);
    this.applyTheme(theme);
    this.applyCorporateColors(theme);
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
   * Carga la identidad corporativa desde el backend
   */
  private async loadCorporateIdentity(): Promise<void> {
    try {
      const identities = await firstValueFrom(this.corporateIdentityService.getCorporateIdentity());
      
      // Organizar identidades por tema
      identities.forEach(identity => {
        if (identity.theme === 'dark' || identity.theme === 'light') {
          this.corporateIdentities.set(identity.theme, identity);
        }
      });
      
      this.identitiesLoaded = true;
      
      // Si solo hay un tema disponible, aplicarlo automáticamente
      const availableThemes = this.corporateIdentityService.getAvailableThemes();
      if (availableThemes.length === 1) {
        const singleTheme = availableThemes[0];
        // Aplicar el único tema disponible sin guardar en localStorage
        this.currentTheme.next(singleTheme);
        this.applyTheme(singleTheme);
        this.applyCorporateColors(singleTheme);
      }
    } catch (error) {
      console.warn('Error al cargar identidad corporativa:', error);
      this.identitiesLoaded = true; // Marcar como cargado para no intentar de nuevo
    }
  }

  /**
   * Aplica los colores de la identidad corporativa al tema actual
   */
  private applyCorporateColors(theme: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const identity = this.corporateIdentityService.getIdentityByTheme(theme);
    const htmlElement = document.documentElement;

    if (identity && identity.color) {
      // Aplicar colores de la identidad corporativa
      this.renderer.setStyle(htmlElement, '--color-primary', identity.color.colorPrimary);
      this.renderer.setStyle(htmlElement, '--color-primary-alt', identity.color.colorPrimaryAlt);
      this.renderer.setStyle(htmlElement, '--color-accent', identity.color.colorAccent);
      this.renderer.setStyle(htmlElement, '--color-warning', identity.color.colorWarning);
      this.renderer.setStyle(htmlElement, '--text-primary', identity.color.textPrimary);
      this.renderer.setStyle(htmlElement, '--text-secondary', identity.color.textSecondary);
      this.renderer.setStyle(htmlElement, '--text-tertiary', identity.color.textTertiary);
      this.renderer.setStyle(htmlElement, '--bg-primary', identity.color.backgroundPrimary);
      this.renderer.setStyle(htmlElement, '--bg-secondary', identity.color.backgroundSecondary);
      this.renderer.setStyle(htmlElement, '--bg-tertiary', identity.color.backgroundTertiary);
      this.renderer.setStyle(htmlElement, '--border-color', identity.color.border);
      this.renderer.setStyle(htmlElement, '--border-color-strong', identity.color.borderStrong);
      this.renderer.setStyle(htmlElement, '--shadow-color', identity.color.shadow);
      this.renderer.setStyle(htmlElement, '--shadow-color-strong', identity.color.shadowStrong);
      
      // También actualizar --color-dark y --color-dark-alt para compatibilidad
      this.renderer.setStyle(htmlElement, '--color-dark', identity.color.backgroundPrimary);
      this.renderer.setStyle(htmlElement, '--color-dark-alt', identity.color.backgroundSecondary);
    } else {
      // Si no hay identidad corporativa, usar valores por defecto del CSS
      this.applyDefaultColors(theme);
    }
  }

  /**
   * Aplica los colores por defecto del CSS
   */
  private applyDefaultColors(theme: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      // Valores por defecto para tema oscuro
      this.renderer.setStyle(htmlElement, '--color-primary', '#02BEC1');
      this.renderer.setStyle(htmlElement, '--color-primary-alt', '#04c0c3');
      this.renderer.setStyle(htmlElement, '--color-dark', '#192230');
      this.renderer.setStyle(htmlElement, '--color-dark-alt', '#202837');
      this.renderer.setStyle(htmlElement, '--color-accent', '#a44a5d');
      this.renderer.setStyle(htmlElement, '--color-warning', '#f0961b');
      this.renderer.setStyle(htmlElement, '--text-primary', '#ffffff');
      this.renderer.setStyle(htmlElement, '--text-secondary', 'rgba(255, 255, 255, 0.7)');
      this.renderer.setStyle(htmlElement, '--text-tertiary', 'rgba(255, 255, 255, 0.5)');
      this.renderer.setStyle(htmlElement, '--bg-primary', '#192230');
      this.renderer.setStyle(htmlElement, '--bg-secondary', '#202837');
      this.renderer.setStyle(htmlElement, '--bg-tertiary', '#2a3441');
      this.renderer.setStyle(htmlElement, '--border-color', 'rgba(255, 255, 255, 0.1)');
      this.renderer.setStyle(htmlElement, '--border-color-strong', 'rgba(255, 255, 255, 0.2)');
      this.renderer.setStyle(htmlElement, '--shadow-color', 'rgba(0, 0, 0, 0.3)');
      this.renderer.setStyle(htmlElement, '--shadow-color-strong', 'rgba(0, 0, 0, 0.5)');
    } else {
      // Valores por defecto para tema claro
      this.renderer.setStyle(htmlElement, '--color-primary', '#02BEC1');
      this.renderer.setStyle(htmlElement, '--color-primary-alt', '#04c0c3');
      this.renderer.setStyle(htmlElement, '--color-dark', '#f8f9fa');
      this.renderer.setStyle(htmlElement, '--color-dark-alt', '#ffffff');
      this.renderer.setStyle(htmlElement, '--color-accent', '#a44a5d');
      this.renderer.setStyle(htmlElement, '--color-warning', '#f0961b');
      this.renderer.setStyle(htmlElement, '--text-primary', '#1a202c');
      this.renderer.setStyle(htmlElement, '--text-secondary', 'rgba(26, 32, 44, 0.7)');
      this.renderer.setStyle(htmlElement, '--text-tertiary', 'rgba(26, 32, 44, 0.5)');
      this.renderer.setStyle(htmlElement, '--bg-primary', '#f8f9fa');
      this.renderer.setStyle(htmlElement, '--bg-secondary', '#ffffff');
      this.renderer.setStyle(htmlElement, '--bg-tertiary', '#e2e8f0');
      this.renderer.setStyle(htmlElement, '--border-color', 'rgba(203, 213, 224, 0.6)');
      this.renderer.setStyle(htmlElement, '--border-color-strong', 'rgba(203, 213, 224, 0.8)');
      this.renderer.setStyle(htmlElement, '--shadow-color', 'rgba(0, 0, 0, 0.1)');
      this.renderer.setStyle(htmlElement, '--shadow-color-strong', 'rgba(0, 0, 0, 0.15)');
    }
  }

  /**
   * Recarga la identidad corporativa desde el backend
   */
  async reloadCorporateIdentity(): Promise<void> {
    this.corporateIdentityService.clearCache();
    await this.loadCorporateIdentity();
    const currentTheme = this.getCurrentTheme();
    this.applyCorporateColors(currentTheme);
  }

  /**
   * Obtiene la identidad corporativa actual
   */
  getCorporateIdentity(theme?: ThemeMode): CorporateIdentity | null {
    const themeToUse = theme || this.getCurrentTheme();
    return this.corporateIdentityService.getIdentityByTheme(themeToUse);
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
   * Carga la preferencia de tema guardada de forma síncrona (sin depender de identidad corporativa)
   * Esto se usa para evitar el flash de contenido sin estilo
   */
  private loadSavedThemeSync(): void {
    // Solo acceder a localStorage si estamos en el browser
    if (!isPlatformBrowser(this.platformId)) {
      this.currentTheme.next('dark');
      this.applyTheme('dark');
      return;
    }

    try {
      const savedTheme = localStorage.getItem('app-theme') as ThemeMode;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        this.currentTheme.next(savedTheme);
        this.applyTheme(savedTheme);
      } else {
        // Si no hay tema guardado, usar por defecto
        this.currentTheme.next('dark');
        this.applyTheme('dark');
      }
    } catch (error) {
      console.warn('Error al cargar tema guardado:', error);
      this.currentTheme.next('dark');
      this.applyTheme('dark');
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

    // Verificar si solo hay un tema disponible
    const availableThemes = this.corporateIdentityService.getAvailableThemes();
    
    // Si solo hay un tema disponible, ya fue aplicado en loadCorporateIdentity
    if (availableThemes.length === 1) {
      const singleTheme = availableThemes[0];
      // Asegurar que el tema único está aplicado
      if (this.currentTheme.value !== singleTheme) {
        this.setTheme(singleTheme);
      }
      return;
    }

    // Si hay 0 temas o 2 temas disponibles, usar la lógica normal
    try {
      const savedTheme = localStorage.getItem('app-theme') as ThemeMode;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        // Verificar que el tema guardado esté disponible
        if (availableThemes.length === 0 || availableThemes.includes(savedTheme)) {
          this.setTheme(savedTheme);
        } else {
          // Si el tema guardado no está disponible, usar el primero disponible o por defecto
          this.setTheme(availableThemes.length > 0 ? availableThemes[0] : 'dark');
        }
      } else {
        // Si no hay tema guardado, usar el tema por defecto (dark) o el primero disponible
        this.setTheme(availableThemes.length > 0 ? availableThemes[0] : 'dark');
      }
    } catch (error) {
      console.warn('No se pudo cargar la preferencia de tema:', error);
      this.setTheme(availableThemes.length > 0 ? availableThemes[0] : 'dark');
    }
  }

  /**
   * Verifica si se debe mostrar el botón de cambio de tema
   * Solo se muestra si hay más de un tema disponible o si no hay temas (usa los por defecto)
   */
  shouldShowThemeToggle(): boolean {
    const availableThemes = this.corporateIdentityService.getAvailableThemes();
    // Si hay 0 temas, se usan los por defecto (dark y light), así que se puede cambiar
    // Si hay 1 tema, no se puede cambiar
    // Si hay 2 temas, se puede cambiar
    return availableThemes.length !== 1;
  }
}
