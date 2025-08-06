# Constantes del Sistema

Esta carpeta contiene todas las constantes del sistema siguiendo los principios SOLID.

## Estructura

```
constants/
├── translation.constants.ts    # Constantes de traducción
├── index.ts                   # Archivo de índice para exportaciones
└── README.md                  # Esta documentación
```

## Principios SOLID Aplicados

### 1. Principio de Responsabilidad Única (SRP)
- Cada archivo de constantes tiene una única responsabilidad
- `translation.constants.ts` se encarga únicamente de las traducciones
- Separación clara de responsabilidades

### 2. Principio de Inversión de Dependencias (DIP)
- Se definen interfaces para las constantes (`TranslationConstants`)
- Los componentes dependen de abstracciones, no de implementaciones concretas
- Facilita el testing y la extensibilidad

### 3. Principio de Abierto/Cerrado (OCP)
- Las constantes están abiertas para extensión (agregar nuevas traducciones)
- Cerradas para modificación (no se modifican las existentes)

## Uso

### Importación Directa
```typescript
import { MACHINE_STATUS_TRANSLATIONS } from '../../shared/constants/translation.constants';
```

### Uso del Servicio (Recomendado)
```typescript
import { TranslationService } from '../../shared/services/translation.service';

constructor(private translationService: TranslationService) {}

// En el template
{{ translationService.getMachineStatusTranslation(element.status) }}
```

## Agregar Nuevas Constantes

1. Crear un nuevo archivo en esta carpeta (ej: `validation.constants.ts`)
2. Definir la interfaz correspondiente
3. Exportar desde `index.ts`
4. Documentar en este README

## Beneficios

- **Mantenibilidad**: Cambios centralizados
- **Reutilización**: Una sola fuente de verdad
- **Testabilidad**: Fácil de mockear y testear
- **Escalabilidad**: Fácil agregar nuevas constantes
- **Consistencia**: Mismo formato en todo el proyecto 