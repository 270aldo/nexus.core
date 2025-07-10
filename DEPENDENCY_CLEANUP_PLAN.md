# Plan de Limpieza de Dependencias - NEXUS-CORE

## 📊 Resumen del Análisis

- **Total de dependencias actuales**: 287
- **Dependencias realmente usadas**: 74
- **Dependencias no utilizadas**: 213 (74% del total!)
- **Reducción potencial**: De 287 a ~50 dependencias

## 🎯 Objetivos

1. Reducir el tamaño de node_modules de ~1GB a ~200MB
2. Mejorar tiempos de instalación de 5+ minutos a <1 minuto
3. Reducir el bundle size inicial de ~5MB a <500KB
4. Simplificar el mantenimiento y actualizaciones

## 📋 Plan de Ejecución

### Fase 1: Preparación (30 minutos)

```bash
# 1. Crear backup completo
cd frontend
cp package.json package.json.backup-$(date +%Y%m%d)
cp -r node_modules node_modules.backup

# 2. Commit estado actual
git add -A
git commit -m "chore: backup before dependency cleanup"

# 3. Crear rama para la migración
git checkout -b feature/dependency-cleanup
```

### Fase 2: Limpieza Inicial (1 hora)

```bash
# 1. Reemplazar package.json con versión limpia
cp package-clean.json package.json

# 2. Limpiar e instalar
rm -rf node_modules package-lock.json
npm install

# 3. Verificar instalación
npm ls --depth=0
```

### Fase 3: Actualización de Imports (2-3 horas)

#### Cambios Principales de Imports:

1. **UI Components**
   ```typescript
   // Antes
   import { Button } from '@chakra-ui/react'
   import { Button } from '@mui/material'
   
   // Después
   import { Button } from '@/components/ui/button'
   ```

2. **Icons**
   ```typescript
   // Antes
   import { FaUser } from 'react-icons/fa'
   import { AddIcon } from '@chakra-ui/icons'
   
   // Después
   import { User, Plus } from 'lucide-react'
   ```

3. **Rich Text Editor**
   ```typescript
   // Antes
   import ReactQuill from 'react-quill'
   
   // Después
   import { useEditor, EditorContent } from '@tiptap/react'
   ```

4. **Data Tables**
   ```typescript
   // Antes
   import { AgGridReact } from 'ag-grid-react'
   
   // Después
   import { useReactTable } from '@tanstack/react-table'
   ```

### Fase 4: Componentes UI Unificados (4-6 horas)

Crear componentes shadcn/ui para reemplazar múltiples librerías:

```bash
# Instalar componentes shadcn/ui necesarios
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
```

### Fase 5: Testing y Validación (2 horas)

```bash
# 1. Type checking
npm run type-check

# 2. Linting
npm run lint

# 3. Build test
npm run build

# 4. Bundle analysis
npm run analyze

# 5. Dev server test
npm run dev
```

## 🔄 Mapeo de Reemplazos

### UI Libraries
| Eliminar | Reemplazar con |
|----------|----------------|
| @chakra-ui/* | shadcn/ui components |
| @mui/material | shadcn/ui components |
| daisyui | Tailwind CSS classes |
| @headlessui/react | @radix-ui components |

### Editores de Texto
| Eliminar | Reemplazar con |
|----------|----------------|
| react-quill | @tiptap/react |
| @ckeditor/* | @tiptap/react |
| @lexical/react | @tiptap/react |
| @blocknote/* | @tiptap/react |

### Tablas de Datos
| Eliminar | Reemplazar con |
|----------|----------------|
| ag-grid-react | @tanstack/react-table |
| react-table (v7) | @tanstack/react-table |
| react-datasheet-grid | @tanstack/react-table |

### Drag & Drop
| Eliminar | Reemplazar con |
|----------|----------------|
| react-beautiful-dnd | @dnd-kit/sortable |
| @hello-pangea/dnd | @dnd-kit/sortable |

### Gráficos
| Eliminar | Reemplazar con |
|----------|----------------|
| chart.js | recharts |
| @amcharts/amcharts5 | recharts |
| plotly.js | recharts |
| lightweight-charts | recharts |

## 📈 Métricas de Éxito

- [ ] Bundle size < 500KB
- [ ] node_modules < 200MB
- [ ] npm install < 60 segundos
- [ ] Todas las páginas funcionando correctamente
- [ ] Type checking sin errores
- [ ] Tests pasando

## ⚠️ Riesgos y Mitigación

1. **Funcionalidad rota**: Mantener backup y poder revertir
2. **Componentes faltantes**: Crear componentes custom si es necesario
3. **Estilos inconsistentes**: Revisar y ajustar Tailwind classes

## 🚀 Beneficios Esperados

1. **Performance**
   - 80% reducción en tiempo de instalación
   - 90% reducción en tamaño de bundle
   - Builds 5x más rápidos

2. **Mantenibilidad**
   - Una sola fuente de verdad para UI
   - Menos conflictos de versiones
   - Actualizaciones más simples

3. **Developer Experience**
   - IDE más responsivo
   - Menos confusión sobre qué librería usar
   - Documentación centralizada

## 📝 Checklist Final

- [ ] Backup creado
- [ ] Package.json actualizado
- [ ] Dependencias instaladas
- [ ] Imports actualizados
- [ ] Componentes UI migrados
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] Review de bundle size
- [ ] Documentación actualizada
- [ ] PR creado y revisado