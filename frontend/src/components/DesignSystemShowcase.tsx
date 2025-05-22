import React from "react";
import { BaseCard } from "components/BaseCard";
import { CardTitle } from "components/CardTitle";
import * as ds from "utils/design-system";

export interface Props {
  className?: string;
}

/**
 * Componente de ejemplo que demuestra el uso del sistema de diseño
 */
export function DesignSystemShowcase({ className = "" }: Props) {
  return (
    <div className={`${ds.spacing.pagePadding} ${className}`}>
      <h1 className={`${ds.typography.pageTitle} mb-6`}>Sistema de Diseño NEXUSCORE</h1>
      
      <div className={ds.spacing.sectionGap}>
        {/* Tarjetas con diferentes variantes */}
        <section>
          <h2 className={`${ds.typography.sectionTitle} mb-4`}>Variantes de Tarjetas</h2>
          <div className={ds.responsive.grid.twoCol}>
            <BaseCard 
              variant="prime"
              header={<CardTitle variant="prime">Tarjeta PRIME</CardTitle>}
            >
              <p className="mb-2">Elementos con estilo PRIME para el programa de rendimiento</p>
              <div className={`${ds.colors.prime.bg} p-2 rounded-sm mb-2`}>
                <span className={ds.colors.prime.text}>Datos destacados</span>
              </div>
              <div className={`${ds.borders.thin} ${ds.colors.prime.border} p-2 rounded-sm`}>
                <span className={ds.typography.mono}>Datos técnicos en fuente monoespaciada</span>
              </div>
            </BaseCard>
            
            <BaseCard 
              variant="longevity"
              header={<CardTitle variant="longevity">Tarjeta LONGEVITY</CardTitle>}
            >
              <p className="mb-2">Elementos con estilo LONGEVITY para el programa de longevidad</p>
              <div className={`${ds.colors.longevity.bg} p-2 rounded-sm mb-2`}>
                <span className={ds.colors.longevity.text}>Datos destacados</span>
              </div>
              <div className={`${ds.borders.thin} ${ds.colors.longevity.border} p-2 rounded-sm`}>
                <span className={ds.typography.mono}>Datos técnicos en fuente monoespaciada</span>
              </div>
            </BaseCard>
          </div>
        </section>
        
        {/* Componentes tipográficos */}
        <section>
          <h2 className={`${ds.typography.sectionTitle} mb-4`}>Tipografía</h2>
          <BaseCard>
            <div className={ds.spacing.elementsGap}>
              <div>
                <span className={ds.typography.label}>Título Principal</span>
                <div className={ds.typography.pageTitle}>Título Principal</div>
              </div>
              <div>
                <span className={ds.typography.label}>Título de Sección</span>
                <div className={ds.typography.sectionTitle}>Título de Sección</div>
              </div>
              <div>
                <span className={ds.typography.label}>Título de Tarjeta</span>
                <div className={ds.typography.cardTitle}>Título de Tarjeta</div>
              </div>
              <div>
                <span className={ds.typography.label}>Valor Numérico</span>
                <div className={ds.typography.value}>12,345</div>
              </div>
              <div>
                <span className={ds.typography.label}>Valor Destacado</span>
                <div className={ds.typography.prominentValue}>98.7%</div>
              </div>
            </div>
          </BaseCard>
        </section>
        
        {/* Componentes con diferentes estados */}
        <section>
          <h2 className={`${ds.typography.sectionTitle} mb-4`}>Estados y Alertas</h2>
          <div className={ds.responsive.grid.threeCol}>
            <BaseCard 
              variant="success"
              header={<CardTitle variant="success">Estado: Éxito</CardTitle>}
            >
              <p>Operación completada correctamente</p>
            </BaseCard>
            
            <BaseCard 
              variant="warning"
              header={<CardTitle variant="warning">Estado: Advertencia</CardTitle>}
            >
              <p>Se requiere atención</p>
            </BaseCard>
            
            <BaseCard 
              variant="danger"
              header={<CardTitle variant="danger">Estado: Error</CardTitle>}
            >
              <p>Ocurrió un problema crítico</p>
            </BaseCard>
          </div>
        </section>
      </div>
    </div>
  );
}