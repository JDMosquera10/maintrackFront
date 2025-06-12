import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export type Image = {
  src: string;  
  title: string;
  description: string;
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  images: Image[] = [
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen.png',
      title: 'Imagen de prueba',
      description: 'Esta es una imagen de prueba para el sidebar.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen2.png',
      title: 'Imagen de prueba 2',
      description: 'Esta es una imagen de prueba 2 para el sidebar.',
    },
    {
      src: 'https://machine-app-test-1.s3.us-east-2.amazonaws.com/siderbar/pruebaimagen3.png',
      title: 'Imagen de prueba 3',
      description: 'Esta es una imagen de prueba 3 para el sidebar.',
    }
  ];
}
