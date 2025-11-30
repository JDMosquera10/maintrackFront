import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CorporateIdentityService } from '../services/corporate-identity.service';
import { ThemeService } from '../services/theme.service';
import { UserRole } from '../shared/models/user.model';

export type Image = {
  src: string;
  title: string;
  description: string;
  path: string;
  role: UserRole[];
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() actionComponent = new EventEmitter<string>();

  protected imagesFiltered: Image[] = [];
  private readonly subscriptions = new Subscription();
  
  // Imágenes por defecto (fallback)
  private readonly defaultImages: Image[] = [
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen.png',
      title: 'Dashboard',
      path: '/dashboard',
      role: [UserRole.ADMIN, UserRole.COORDINATOR],
      description: 'Puedes ver el estado general del sistema aquí.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen2.png',
      title: 'Gestión de maquinas',
      path: '/machines',
      role: [UserRole.ADMIN, UserRole.COORDINATOR],
      description: 'Registra y edita las maquinas de tu sistema.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen4.png',
      title: 'Gestión de mantenimientos',
      path: '/maintenance',
      role: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TECHNICIAN],
      description: 'Registra y edita los mantenimientos de tu sistema.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen3.png',
      title: 'Tabla de mantenimientos',
      path: '/machines-table',
      role: [UserRole.ADMIN, UserRole.COORDINATOR],
      description: 'mira los detalles de tus mantenimientos registrados en una lista.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen.png',
      title: 'Módulo de Gestión',
      path: '/management',
      role: [UserRole.ADMIN],
      description: 'Administra usuarios, roles, permisos y tipos de mantenimientos.',
    }
  ];

  private images: Image[] = [...this.defaultImages];

  constructor(
    private readonly authService: AuthService,
    private readonly themeService: ThemeService,
    private readonly corporateIdentityService: CorporateIdentityService
  ) {}

  ngOnInit(): void {
    // Cargar imágenes de la identidad corporativa
    this.loadCorporateImages();
    
    // Suscribirse a cambios de usuario
    this.subscriptions.add(
      this.authService.getCurrentUser().subscribe((user) => {
        if (user) {
          this.imagesFiltered = this.images.filter((image) => image.role.includes(user.role));
        }
      })
    );
    
    // Suscribirse a cambios de tema para recargar imágenes
    this.subscriptions.add(
      this.themeService.theme$.subscribe(() => {
        this.loadCorporateImages();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Carga las imágenes desde la identidad corporativa
   */
  private loadCorporateImages(): void {
    const currentTheme = this.themeService.getCurrentTheme();
    const identity = this.corporateIdentityService.getIdentityByTheme(currentTheme);
    
    if (identity && identity.imgVar && identity.imgVar.length > 0) {
      // Mapear las imágenes de la identidad corporativa
      this.images = identity.imgVar.map(img => {
        // Buscar la imagen por defecto que coincida con el identifier
        const defaultImage = this.defaultImages.find(def => 
          def.path === `/${img.identifier}` || 
          (img.identifier === 'dashboard' && def.path === '/dashboard') ||
          (img.identifier === 'machines' && def.path === '/machines') ||
          (img.identifier === 'maintenance' && def.path === '/maintenance') ||
          (img.identifier === 'machines-table' && def.path === '/machines-table')
        );
        
        return {
          src: img.url,
          title: defaultImage?.title || img.identifier,
          description: defaultImage?.description || '',
          path: defaultImage?.path || `/${img.identifier}`,
          role: defaultImage?.role || [UserRole.ADMIN, UserRole.COORDINATOR]
        };
      });
      
      // Si no se mapearon todas, agregar las que faltan de las por defecto
      const mappedPaths = new Set(this.images.map(img => img.path));
      for (const defImg of this.defaultImages) {
        if (!mappedPaths.has(defImg.path)) {
          this.images.push(defImg);
        }
      }
    } else {
      // Si no hay identidad corporativa, usar las por defecto
      this.images = [...this.defaultImages];
    }
    
    // Actualizar imágenes filtradas
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.imagesFiltered = this.images.filter((image) => image.role.includes(user.role));
      }
    });
  }

  onActionComponent(data: Image) {
    this.actionComponent.emit(data.path);
  }
}
