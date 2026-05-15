import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const DEFAULT_LOGO_URL =
  'https://machine-app-test-1.s3.us-east-2.amazonaws.com/fondos/logo2.png';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Actualiza el favicon del documento con la URL del logo (parametría).
   */
  setFavicon(url?: string | null): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const href = url?.trim() || DEFAULT_LOGO_URL;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.type = this.resolveMimeType(href);
    link.href = href;
  }

  private resolveMimeType(url: string): string {
    const path = url.split('?')[0].toLowerCase();
    if (path.endsWith('.svg')) {
      return 'image/svg+xml';
    }
    if (path.endsWith('.png')) {
      return 'image/png';
    }
    if (path.endsWith('.ico')) {
      return 'image/x-icon';
    }
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    if (path.endsWith('.webp')) {
      return 'image/webp';
    }
    return 'image/png';
  }
}
