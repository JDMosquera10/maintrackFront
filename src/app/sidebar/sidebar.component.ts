import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

export type Image = {
  src: string;
  title: string;
  description: string;
  path: string;
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() actionComponent = new EventEmitter<string>();

  images: Image[] = [
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen.png',
      title: 'Dashboard',
      path: '/dashboard',
      description: 'Puedes ver el estado general del sistema aquí.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen2.png',
      title: 'Gestión de maquinas',
      path: '/machines',
      description: 'Registra y edita las maquinas de tu sistema.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen4.png',
      title: 'Gestión de mantenimientos',
      path: '/maintenance',
      description: 'Registra y edita los mantenimientos de tu sistema.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen3.png',
      title: 'Tabla de máquinas',
      path: '/machines-table',
      description: 'mira los detalles de tus maquinas registradas en una lista.',
    }
  ];


  onActionComponent(data: Image) {
    this.actionComponent.emit(data.path);
  }
}
