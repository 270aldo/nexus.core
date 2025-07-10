# NGX AI Workflows: Biblioteca de Comandos Inteligentes

## 🎯 Propósito

Esta biblioteca contiene workflows de IA pre-configurados para maximizar la productividad del equipo NGX usando NEXUS-CORE con Claude Desktop. Cada workflow está optimizado para casos de uso específicos y roles dentro del equipo.

## 🏗️ Estructura de Workflows

### Categorías Principales
- **🎯 Administración Ejecutiva** - Métricas, ROI, toma de decisiones estratégicas
- **👨‍⚕️ Especialistas** - Análisis técnico, optimización de programas, investigación
- **💪 Coaches** - Interacción cliente, motivación, seguimiento diario
- **📊 Análisis de Datos** - Insights, predicciones, reportes automatizados
- **🚨 Alertas y Monitoreo** - Detección proactiva, intervenciones oportunas

---

## 🎯 WORKFLOWS PARA ADMINISTRACIÓN EJECUTIVA

### W001: Dashboard Ejecutivo Instantáneo
```
Genera un dashboard ejecutivo completo para NGX con:
- Métricas de negocio del mes actual vs mes anterior
- Clientes activos por programa (PRIME vs LONGEVITY)
- Tasa de retención y proyección de ingresos
- Top 5 insights más importantes para toma de decisiones
- Alertas críticas que requieren atención inmediata
- Forecast de crecimiento para próximos 3 meses

Usa datos reales de /mcp/analytics/business-metrics2 y presenta en formato ejecutivo con bullets y números clave.
```

### W002: Análisis ROI por Programa
```
Analiza el ROI de cada programa NGX (PRIME y LONGEVITY):
- Revenue por cliente promedio por programa
- Costo de adquisición vs lifetime value
- Tasa de conversión y retención por programa
- Identificar programas más rentables y por qué
- Recomendaciones para optimizar programas menos rentables
- Benchmarks vs industria fitness

Presenta con métricas específicas y recomendaciones accionables.
```

### W003: Detección de Riesgo de Abandono
```
Identifica clientes en riesgo de abandono usando:
- Patrones de adherencia últimas 2 semanas
- Métricas de engagement (login, uso de app, respuesta a mensajes)
- Progreso hacia objetivos vs expectativas
- Historial de pagos y renovaciones
- Feedback y satisfaction scores

Para cada cliente en riesgo, proporciona:
- Probabilidad de abandono (%)
- Factores de riesgo principales
- Estrategias de retención específicas
- Timeline recomendado para intervención
```

---

## 👨‍⚕️ WORKFLOWS PARA ESPECIALISTAS

### W101: Optimización de Programa Basada en Datos
```
Para el cliente [CLIENT_ID], optimiza su programa actual basándote en:
- Análisis de adherencia /mcp/analytics/adherence con granularidad semanal
- Progreso en métricas objetivas (fuerza, resistencia, composición corporal)
- Feedback subjetivo y satisfaction scores
- Comparación con benchmarks de clientes similares
- Identificación de ejercicios/protocolos más/menos efectivos

Proporciona:
- Análisis detallado de qué está funcionando vs qué no
- Ajustes específicos recomendados (ejercicios, volumen, intensidad)
- Timeline de implementación de cambios
- Métricas para trackear mejoras
- Predicción de resultados esperados en 4-8 semanas
```

### W102: Análisis Biomecánico Predictivo
```
Analiza el perfil biomecánico y de lesiones del cliente [CLIENT_ID]:
- Historial de lesiones y limitaciones
- Patrones de movimiento reportados
- Ejercicios que generan molestias o dolor
- Progresión en ejercicios técnicos
- Asimetrias o desequilibrios identificados

Genera:
- Assessment de riesgo de lesión por área corporal
- Ejercicios prioritarios para corrección
- Modificaciones específicas para programa actual
- Protocolo de warm-up personalizado
- Timeline de progresión segura
- Indicadores de alerta a monitorear
```

### W103: Investigación de Efectividad por Protocolo
```
Analiza la efectividad del protocolo [PROTOCOL_NAME] comparando:
- Resultados de clientes que lo han usado vs control
- Métricas de adherencia específicas al protocolo
- Tiempo promedio para ver resultados
- Factores que predicen éxito vs fracaso
- Segmentación por demografía (edad, género, nivel inicial)

Entrega:
- Score de efectividad general (1-10)
- Perfil de cliente ideal para este protocolo
- Variaciones que podrían mejorar resultados
- Recomendación: mantener, modificar o discontinuar
- Evidencia científica que support findings
```

---

## 💪 WORKFLOWS PARA COACHES

### W201: Motivación Personalizada Diaria
```
Para el cliente [CLIENT_NAME], genera mensaje motivacional personalizado basado en:
- Adherencia última semana vs meta
- Progreso reciente en métricas clave
- Desafíos personales mencionados
- Preferencias de comunicación y personalidad
- Eventos próximos (competencias, vacaciones, fechas importantes)

Crea mensaje que:
- Sea específico para su situación actual
- Celebre wins recientes (por pequeños que sean)
- Aborde desafíos con empatía y soluciones
- Include next steps concretos y achievables
- Mantenga tono apropiado para relación coach-cliente
- Sea bajo 150 palabras pero high impact
```

### W202: Traducción Técnica para Cliente
```
Traduce este programa técnico para [CLIENT_NAME] considerando:
- Su nivel de experiencia en fitness
- Términos que ha usado en conversaciones previas
- Objetivos personales y motivaciones
- Preocupaciones o limitaciones expresadas

Programa técnico a traducir:
[TECHNICAL_PROGRAM_DATA]

Proporciona:
- Explicación simple de cada ejercicio y por qué lo hace
- Conexión clara entre ejercicios y sus objetivos
- Tips de ejecución en lenguaje no técnico
- Expectativas realistas de resultados
- Respuestas anticipadas a preguntas típicas del cliente
```

### W203: Evaluación Rápida de Sesión
```
Basándote en la sesión de entrenamiento reportada por [CLIENT_NAME]:
- Ejercicios completados vs programados
- RPE (Rate of Perceived Exertion) reportado
- Tiempo total de sesión
- Comentarios adicionales del cliente

Datos de la sesión:
[SESSION_DATA]

Evalúa:
- Quality score de la sesión (1-10)
- Adherencia al programa (%)
- Indicadores de fatiga o recovery
- Ajustes necesarios para próxima sesión
- Feedback específico para dar al cliente
- Red flags que requieran atención especialista
```

---

## 📊 WORKFLOWS PARA ANÁLISIS DE DATOS

### W301: Insight Discovery Semanal
```
Analiza todos los datos de la última semana para descubrir insights no obvios:
- Patrones de adherencia por día de semana/hora
- Correlaciones entre weather/temporada y performance
- Ejercicios que consistentemente generan mejor/peor adherencia
- Segmentos de clientes con comportamientos similares
- Anomalías en métricas que podrían indicar oportunidades

Presenta:
- Top 3 insights más sorprendentes o actionables
- Hipótesis sobre causas de patrones observados
- Experimentos recomendados para validar hipótesis
- Implicaciones para ajustar estrategias NGX
- Métricas que sugieren trackear más de cerca
```

### W302: Análisis Competitivo de Performance
```
Compara performance NGX vs benchmarks de industria:
- Tasa de retención vs gyms premium
- Resultados cliente promedio vs competitors
- Tiempo para ver resultados vs estándares
- Satisfaction scores vs benchmarks fitness
- Pricing vs value delivered

Identifica:
- Áreas donde NGX supera claramente la competencia
- Gaps donde competencia podría tener ventaja
- Oportunidades para crear nuevas ventajas competitivas
- Métricas únicas que NGX podría trackear para diferenciarse
- Insights para marketing y positioning
```

### W303: Predicción de Tendencias de Demanda
```
Analiza patrones históricos para predecir demanda:
- Estacionalidad en inscripciones por programa
- Correlación con eventos (New Year, summer, holidays)
- Tendencias en tipos de objetivos que buscan clientes
- Evolución de preferencias en modalidades de entrenamiento
- Impacto de factores externos (economía, health trends)

Proyecta:
- Demanda esperada próximos 3-6 meses por programa
- Capacity planning para evitar over/under booking
- Oportunidades para nuevos programas o servicios
- Timing óptimo para campaigns de marketing
- Resource allocation recomendado
```

---

## 🚨 WORKFLOWS PARA ALERTAS Y MONITOREO

### W401: Health Check Sistema Completo
```
Verifica la salud integral del ecosistema NGX:
- Performance técnico de NEXUS-CORE (response times, uptime)
- Métricas de engagement cliente (logins, uso features)
- Quality de datos (missing data, inconsistencies)
- Adherencia promedio vs targets por programa
- Financial health indicators (revenue, costs, profit)

Para cualquier métrica fuera de rango normal:
- Severity level (low/medium/high/critical)
- Impact potencial en negocio
- Root cause analysis preliminar
- Action items recomendados
- Timeline para resolución
- Escalation path si persiste
```

### W402: Intervención Proactiva de Adherencia
```
Identifica clientes que necesitan intervención basándote en:
- Decline en adherencia >20% últimas 2 semanas
- Missed sessions 3+ en última semana
- Negative feedback o reduced engagement
- Significant deviation from typical patterns
- External factors que podrían impactar (travel, stress, illness)

Para cada cliente identificado:
- Urgencia de intervención (1-5 scale)
- Tipo de intervención más efectiva para su perfil
- Script sugerido para coach outreach
- Alternative solutions si coach contact no efectivo
- Timeline para follow-up y re-assessment
```

### W403: Optimización de Revenue en Tiempo Real
```
Monitorea oportunidades de revenue optimization:
- Clientes próximos a renewal que podrían upgrade
- Clientes satisfechos candidatos para referral programs
- Utilization de sessions vs package purchased
- Clients con potential para servicios adicionales
- Pricing opportunities basado en value delivered

Identifica:
- Upsell opportunities con highest probability
- Cross-sell services que match client needs/goals
- Retention strategies para clients at risk
- Optimal timing para revenue conversations
- A/B testing opportunities para pricing/packages
```

---

## 🎮 CASOS DE USO RÁPIDOS

### Quick Wins Diarios (Copy & Paste en Claude Desktop)

**Para Coaches:**
```
"Analiza la adherencia de mis 5 clientes principales esta semana y dame 1 acción específica para cada uno"
```

**Para Especialistas:**
```
"Compara el progreso de [CLIENTE] contra el benchmark de clientes similares y sugiere 2 ajustes a su programa"
```

**Para Administradores:**
```
"Dashboard ejecutivo ahora: revenue este mes, clientes en riesgo, y top 3 decisiones que necesito tomar hoy"
```

**Para Análisis:**
```
"Encuentra el patrón no obvio más importante en los datos de esta semana"
```

---

## 🚀 IMPLEMENTACIÓN

### Setup Inicial
1. **Configurar Claude Desktop** con NEXUS-CORE MCP server
2. **Training del equipo** en workflows específicos para su rol
3. **Crear shortcuts** para comandos más frecuentes
4. **Establecer rutinas** de uso diario/semanal

### Optimización Continua
- **Weekly review** de qué workflows son más útiles
- **Refinamiento** de prompts basado en resultados
- **Nuevos workflows** basados en necesidades emergentes
- **A/B testing** de diferentes approaches

### Métricas de Éxito
- **Tiempo ahorrado** por workflow vs proceso manual
- **Quality de decisiones** tomadas con data vs intuición
- **Satisfaction score** del equipo con herramientas
- **Business impact** medible (retention, revenue, efficiency)

---

**Versión**: 1.0  
**Última Actualización**: 19 de Junio, 2025  
**Mantenido por**: Equipo NGX + Claude Integration Team