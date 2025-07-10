# NGX Prompt Templates: Comandos Optimizados por Rol

## 🎯 Propósito

Colección de templates de prompts optimizados para cada rol en NGX, diseñados para obtener máxima eficiencia y precisión en las interacciones con Claude Desktop a través de NEXUS-CORE MCP.

## 🏗️ Estructura de Templates

### Categorías por Rol
- **👑 CEO/Founder** - Visión estratégica, decisiones de alto nivel
- **📊 Administrador** - Operaciones, métricas, ROI
- **👨‍⚕️ Especialista Senior** - Análisis técnico profundo, investigación
- **💪 Coach Principal** - Gestión de equipo, mejores prácticas
- **🥇 Coach Individual** - Interacción directa con clientes
- **📈 Analista de Datos** - Insights, predicciones, reportes

---

## 👑 TEMPLATES PARA CEO/FOUNDER

### CEO001: Visión Estratégica Mensual
```
Dame un resumen ejecutivo estratégico de NGX para este mes:

CONTEXTO: Soy el founder de NGX y necesito una visión de 30,000 pies para tomar decisiones estratégicas importantes.

ANALIZA:
- Performance financiero vs objetivos (revenue, profit, growth rate)
- Posición competitiva y diferenciación en el mercado
- Oportunidades de expansión o nuevos productos/servicios
- Riesgos principales para el negocio
- Capital humano y capacity para crecimiento
- Tendencias del mercado que podrían impactarnos

FORMATO DE RESPUESTA:
1. **Estado General** (1 párrafo): Salud general del negocio
2. **Métricas Clave** (bullets): Solo números que más importan
3. **Oportunidades Estratégicas** (top 3): Con potential impact estimado
4. **Riesgos a Mitigar** (top 2): Con probability y severity
5. **Decisiones Requeridas** (máximo 3): Con timeline y implications
6. **Recommendation**: Una acción de máximo impacto para próximas 4 semanas

Sé conciso pero profundo. Maximum 300 palabras total.
```

### CEO002: Evaluación de Nueva Oportunidad
```
Evalúa esta oportunidad de negocio para NGX:

OPORTUNIDAD: [DESCRIBIR OPORTUNIDAD]

ANALIZA USANDO DATOS DE NEXUS-CORE:
- Market size y addressable market
- Fit con capacidades actuales NGX
- Investment requerido vs potential return
- Impact en operaciones existentes
- Competitive advantage que podríamos crear
- Risk factors y mitigation strategies

FRAMEWORK ANÁLISIS:
1. **Strategic Alignment** (1-10): ¿Qué tan bien fit con misión NGX?
2. **Market Opportunity** (1-10): Size y growth potential
3. **Execution Feasibility** (1-10): Con recursos actuales
4. **ROI Potential** (1-10): Financial return esperado
5. **Risk Level** (1-10): Exposure y probability de falla

RECOMENDACIÓN FINAL:
- GO/NO-GO con rationale
- Si GO: Next steps específicos y timeline
- Si NO-GO: Alternative approaches a considerar
- Investment level recomendado
- Success metrics para trackear

Max 250 palabras, formato decisión ejecutiva.
```

---

## 📊 TEMPLATES PARA ADMINISTRADOR

### ADM001: Dashboard Operacional Diario
```
NEXUS-CORE Dashboard Operacional para [FECHA]:

Necesito el snapshot operacional completo para tomar decisiones del día.

MÉTRICAS CORE:
- Clientes activos totales (PRIME vs LONGEVITY)
- Adherencia promedio últimas 48 horas
- Revenue this month vs target
- Sessions completadas hoy vs programadas
- New sign-ups últimos 7 días
- Cancellations/pauses últimos 7 días
- Coach utilization rate
- Customer satisfaction score promedio

ALERTAS OPERACIONALES:
- Clientes que necesitan follow-up inmediato
- Coaches con carga de trabajo excepcional
- Technical issues o system performance problems
- Financial items que requieren atención
- Scheduling conflicts o capacity issues

DECISIONES HOY:
- Aprobaciones pending que necesito revisar
- Escalations de coaches que requieren mi input
- Resource allocation decisions
- Priority items para delegar

FORMATO: Bullets concisos, números específicos, acción required clear.
Maximum 200 palabras, enfoque en actionable items.
```

### ADM002: Análisis de Eficiencia Operacional
```
Analiza la eficiencia operacional de NGX comparando estas métricas:

PERÍODO: [ESPECIFICAR PERÍODO, ej: último mes vs anterior]

ANÁLISIS REQUERIDO:
- Coach productivity: sessions per coach, client satisfaction per coach
- Client journey efficiency: onboarding time, time to see results
- Resource utilization: facility usage, equipment optimization
- Process efficiency: admin time per client, response times
- Cost efficiency: cost per client acquisition, cost per client retention

COMPARAR CONTRA:
- Períodos anteriores
- Industry benchmarks (si available)
- Nuestros targets internos
- Best practices en fitness industry

IDENTIFICAR:
- Bottlenecks más significativos
- Opportunities para automation
- Process improvements con mayor ROI
- Resource reallocation opportunities
- Training needs para equipo

DELIVERABLES:
1. **Efficiency Score General** (1-100)
2. **Top 3 Improvement Opportunities** con impact estimado
3. **Quick Wins** implementables esta semana
4. **Strategic Improvements** para próximos 3 meses
5. **Investment Requirements** para mejoras propuestas

Formato ejecutivo, datos específicos, action plan claro.
```

---

## 👨‍⚕️ TEMPLATES PARA ESPECIALISTA SENIOR

### ESP001: Análisis Técnico Profundo de Cliente
```
ANÁLISIS ESPECIALISTA PROFUNDO para cliente: [CLIENT_ID]

Como especialista senior, necesito análisis técnico comprehensivo para determinar optimizaciones avanzadas del programa.

DATOS A ANALIZAR:
- Historial completo de ejercicios y progresión
- Métricas de recuperación y adaptación
- Respuesta fisiológica a diferentes protocolos
- Biomecánica y limitaciones identificadas
- Nutrition compliance y su impact en resultados
- Sleep/stress patterns correlation con performance

ANÁLISIS ESPECÍFICO:
1. **Periodización Effectiveness**: ¿El programa actual sigue principios óptimos?
2. **Adaptation Patterns**: ¿Cómo responde el cliente a diferentes estímulos?
3. **Recovery Optimization**: ¿Hay gaps en protocolo de recuperación?
4. **Plateau Prevention**: ¿Qué cambios prevenir stagnation?
5. **Risk Assessment**: ¿Factores de riesgo de lesión o overtraining?

ENTREGABLES TÉCNICOS:
- **Assessment Score** por área (strength, endurance, mobility, recovery)
- **Protocol Modifications** específicas con scientific rationale
- **Progression Timeline** para próximas 8-12 semanas
- **Monitoring Points** críticos para trackear
- **Red Flags** que indicarían necesidad de ajuste inmediato

NIVEL TÉCNICO: Especialista senior - usa terminología científica apropiada.
Incluye references a literatura científica cuando relevant.
```

### ESP002: Research de Efectividad de Protocolo
```
RESEARCH ANÁLYSIS: Efectividad del protocolo "[PROTOCOL_NAME]"

Como especialista senior, necesito análisis basado en evidencia para validar o modificar este protocolo.

METODOLOGÍA DE ANÁLISIS:
- Comparar resultados clients que usaron este protocolo vs control group
- Analizar variables confounding (age, gender, fitness level, adherence)
- Identificar success predictors y failure patterns
- Correlacionar con scientific literature y best practices
- Evaluar cost-effectiveness (time investment vs results)

MÉTRICAS DE EFECTIVIDAD:
1. **Primary Outcomes**: Improvement en objective measurements
2. **Secondary Outcomes**: Satisfaction, adherence, side effects
3. **Time to Results**: Average time para ver significant improvements
4. **Retention Impact**: Effect en client retention y satisfaction
5. **Scalability**: ¿Qué tan well funciona across different client profiles?

SCIENTIFIC VALIDATION:
- Literature review de protocolos similares
- Evidence level de research que supports este approach
- Gaps en current evidence que necesitamos address
- Recommendations para improve scientific validity

DELIVERABLES:
- **Effectiveness Rating** (A/B/C/D) con detailed justification
- **Client Profile** óptimo para este protocolo
- **Modifications Recommended** para improve effectiveness
- **Implementation Guidelines** para coaches
- **Monitoring Protocol** para track ongoing effectiveness
- **Research Gaps** que podríamos address con internal data

Formato: Scientific pero aplicable. Include data visualizations si helpful.
```

---

## 💪 TEMPLATES PARA COACH PRINCIPAL

### CP001: Gestión de Equipo de Coaches
```
TEAM MANAGEMENT REPORT para equipo de coaches:

Como coach principal, necesito insights para optimizar performance y development del equipo.

ANÁLISIS DEL EQUIPO:
- Performance metrics per coach (client satisfaction, retention, results)
- Workload distribution y capacity utilization
- Development needs y training opportunities
- Client-coach matching effectiveness
- Peer collaboration y knowledge sharing

INDIVIDUAL ASSESSMENTS:
Para cada coach en el equipo:
1. **Strengths Principales** que leverage más
2. **Development Areas** con specific action plans
3. **Client Types** que mejor match su style/expertise
4. **Workload Optimization** current vs optimal
5. **Career Development** next steps recomendados

TEAM DYNAMICS:
- Collaboration effectiveness entre coaches
- Knowledge sharing gaps y opportunities
- Mentorship relationships que fomentar
- Cross-training needs para backup coverage
- Team morale y motivation factors

OPERATIONAL EXCELLENCE:
- Best practices que algunos coaches usan y otros deberían adopt
- Process improvements que facilitarían trabajo de todos
- Technology/tools que mejorarían efficiency
- Client communication patterns más efectivos

DELIVERABLES:
- **Team Performance Score** (1-100)
- **Individual Development Plans** (bullets per coach)
- **Best Practices Playbook** update suggestions
- **Training Calendar** para próximos 3 meses
- **Team Building Activities** recomendadas
- **Resource Needs** para support team growth

Enfoque en actionable development, no criticism.
```

### CP002: Optimización de Programas Standard
```
OPTIMIZACIÓN DE PROGRAMAS STANDARD NGX:

Analiza performance de nuestros programas standard para identificar mejoras.

PROGRAMAS A ANALIZAR:
- [LISTAR PROGRAMAS STANDARD DE NGX]

MÉTRICAS DE ANÁLISIS:
1. **Client Results**: Objective improvements promedio
2. **Adherence Rates**: Completion rates por programa
3. **Satisfaction Scores**: Client feedback y ratings
4. **Coach Feedback**: Difficulty de implementation, client engagement
5. **Modification Frequency**: ¿Qué tan often coaches modify protocols?

COMPARATIVE ANALYSIS:
- Performance programa vs programa
- Success factors que distinguish top performers
- Common failure points across programs
- Resource requirements vs results delivered
- Scalability y standardization effectiveness

OPTIMIZATION OPPORTUNITIES:
Para cada programa:
- **Strengths to Leverage** más en marketing/delivery
- **Weaknesses to Address** con specific solutions
- **Modifications Recommended** basadas en data
- **Coach Training Needs** para improve delivery
- **Client Education** que improve adherence

STANDARDIZATION REVIEW:
- ¿Qué elementos deben ser más standardized?
- ¿Dónde necesitamos más flexibility para coaches?
- Balance optimal entre consistency y personalization
- Quality control mechanisms que implement

DELIVERABLES:
- **Program Rankings** por effectiveness overall
- **Improvement Recommendations** específicas per program
- **Coach Training Updates** required
- **Client Materials** que need updates
- **Implementation Timeline** para changes
- **Success Metrics** para track improvements

Enfoque en practical implementation para coaches.
```

---

## 🥇 TEMPLATES PARA COACH INDIVIDUAL

### CI001: Check-in Semanal con Cliente
```
WEEKLY CHECK-IN PERSONALIZADO para cliente: [CLIENT_NAME]

Analiza el progreso de mi cliente esta semana y dame insights para nuestra próxima conversación.

REVIEW ESTA SEMANA:
- Sessions completadas vs programadas
- Quality de execution (RPE, feedback, modifications)
- Nutrition adherence y patterns
- Sleep/recovery indicators
- Motivation level y engagement
- Challenges mencionadas o observed

PROGRESS ANALYSIS:
- Movement toward goals (objective measurements)
- Adherence trends (improving, stable, declining)
- Behavioral patterns worth noting
- Wins to celebrate (por pequeños que sean)
- Areas needing attention o support

CONVERSATION PREP:
1. **Celebración**: Specific wins para acknowledge
2. **Check-in Questions**: 2-3 questions específicas sobre challenges
3. **Motivation Boost**: Personalized message based en su personality
4. **Next Week Focus**: 1-2 priorities específicas para focus
5. **Program Adjustments**: Any modifications basadas en this week's data

PERSONALIZATION NOTES:
- Communication style que prefiere este cliente
- Motivation triggers que work best
- Potential roadblocks próxima semana
- External factors que might impact adherence

FORMATO: Conversational prep notes, bullets para reference durante call.
Maximum 150 palabras, enfoque en building relationship y motivation.
```

### CI002: Problema-Solving Rápido
```
PROBLEM-SOLVING para situación con cliente: [CLIENT_NAME]

SITUACIÓN: [DESCRIBIR PROBLEMA/CHALLENGE]

Necesito guidance rápido para manejar esta situación effective y professionally.

ANÁLISIS DE SITUACIÓN:
- Root cause probable del issue
- Client perspective likely
- Impact en relationship si no se maneja well
- Similar situations en el past y cómo se resolvieron
- Resources o support que might need

RESPONSE OPTIONS:
1. **Immediate Response** (what to say/do ahora)
2. **Short-term Solution** (next 24-48 hours)
3. **Long-term Prevention** (avoid similar issues)

COMMUNICATION STRATEGY:
- Tone y approach más appropriate
- Key messages que convey
- Empathy points que acknowledge
- Solution options para offer
- Follow-up plan

ESCALATION CONSIDERATIONS:
- ¿Cuándo debería involve coach principal o specialist?
- Red flags que watch for
- Documentation requirements
- Client retention risk assessment

LEARNING OPPORTUNITY:
- What this teaches sobre este client specifically
- General lessons para apply con otros clients
- Process improvements que suggest
- Training topics que podrían help

DELIVERABLE: Clear action plan con specific next steps y timing.
Maximum 100 palabras, enfoque en immediate practical solution.
```

---

## 📈 TEMPLATES PARA ANALISTA DE DATOS

### AD001: Weekly Insights Discovery
```
WEEKLY DATA INSIGHTS para NGX operations:

Analiza los datos de esta semana para découvrir patterns y insights no obvios que pueden inform decisions.

DATA SOURCES A ANALIZAR:
- Client adherence patterns
- Coach performance metrics
- Program effectiveness indicators
- Business metrics (revenue, retention, acquisition)
- System usage patterns
- External factors (weather, seasonality, events)

ANÁLISIS EXPLORATORIO:
1. **Anomalies Detection**: ¿Qué está behaving different than usual?
2. **Correlation Discovery**: Relationships entre variables que no habíamos noticed
3. **Trend Analysis**: Emerging patterns que might predict future behavior
4. **Segmentation Insights**: Client subgroups con distinct behaviors
5. **Performance Outliers**: Best/worst performers y qué los distingue

STATISTICAL ANALYSIS:
- Significance testing para observed differences
- Confidence intervals para predictions
- Cohort analysis para understand long-term trends
- A/B testing opportunities identificadas

ACTIONABLE INSIGHTS:
Para cada insight discovered:
- **Business Impact Potential** (High/Medium/Low)
- **Confidence Level** en finding (based en statistical significance)
- **Recommended Action** específica para capitalize
- **Testing Strategy** para validate hypothesis
- **Implementation Timeline** y resource requirements

PREDICTIVE COMPONENTS:
- Forecasts para next week/month basados en current trends
- Early warning indicators que monitor
- Opportunities para proactive interventions

DELIVERABLE FORMAT:
- **Top 3 Insights** más actionables
- **Data Story** que explains key findings
- **Recommendations** con business priority
- **Dashboard Updates** suggested para ongoing monitoring

Enfoque en insights que lead to concrete business decisions.
```

### AD002: A/B Testing Design y Analysis
```
A/B TESTING para NGX: [TESTING HYPOTHESIS]

HYPOTHESIS TO TEST: [DESCRIBIR HYPOTHESIS]

EXPERIMENTAL DESIGN:
- Primary metric a measure
- Secondary metrics que track
- Sample size calculation y power analysis
- Randomization strategy
- Control y treatment group definitions
- Testing duration required

CONTROL VARIABLES:
- Factors que need to remain constant
- Potential confounding variables
- Seasonal o external factors que consider
- Baseline measurements required

DATA COLLECTION PLAN:
- Specific data points a capture
- Frequency de measurement
- Data quality checks
- Statistical analysis plan pre-defined

ANALYSIS FRAMEWORK:
1. **Statistical Significance Testing**: Methods y thresholds
2. **Effect Size Calculation**: Practical significance assessment
3. **Confidence Intervals**: Para quantify uncertainty
4. **Subgroup Analysis**: Different client segments
5. **Long-term Impact Assessment**: Beyond immediate results

SUCCESS CRITERIA:
- Primary success metrics y thresholds
- Statistical power requirements
- Business significance thresholds
- Decision framework para different outcomes

IMPLEMENTATION PLAN:
- Rollout strategy si results are positive
- Rollback plan si results are negative
- Communication plan para stakeholders
- Timeline para decision making

LEARNING OBJECTIVES:
- What specifically we want to learn
- How results will inform future decisions
- Additional hypotheses que could generate
- Implications para other areas of business

DELIVERABLE: Complete testing protocol con clear decision framework.
Include statistical power calculations y expected timeline.
```

---

## 🚀 TEMPLATES DE USO RÁPIDO

### Quick Commands (Copy & Paste Directo)

**Daily Essentials:**
```
"Dashboard rápido NGX hoy: clientes activos, alertas críticas, y mi top 3 acciones"
```

**Client Focus:**
```
"Analiza [CLIENT_NAME] esta semana: progreso, adherence, y 1 acción específica para mañana"
```

**Business Intelligence:**
```
"Top insight más importante en data de NGX últimos 7 días que no es obvio"
```

**Problem Solving:**
```
"Cliente [NAME] situation: [BRIEF DESCRIPTION]. Dame 3 response options con pros/cons"
```

**Strategy Quick Check:**
```
"NGX performance este mes vs targets: 3 bullets sobre estado y 1 decisión crítica pending"
```

### Formato Response Optimization

**Para Respuestas Ejecutivas:**
```
SIEMPRE INCLUIR al final de executive prompts:
"Formato: Executive summary style, bullets concisos, números específicos, recommendations clear y actionable."
```

**Para Análisis Técnico:**
```
SIEMPRE INCLUIR al final de technical prompts:
"Formato: Scientific rigor pero aplicable, data específica, confidence levels, practical implementation steps."
```

**Para Coaching:**
```
SIEMPRE INCLUIR al final de coaching prompts:
"Formato: Conversational y empático, specific to this client, actionable steps, relationship-building focus."
```

---

## 💡 TIPS DE OPTIMIZACIÓN

### Personalización de Templates
1. **Sustituir variables** en brackets [] con datos específicos
2. **Ajustar tone** según relationship con Claude (más formal/casual)
3. **Modificar length** según urgency (shorter para quick decisions)
4. **Agregar context** específico cuando sea relevant

### Mejores Prácticas
- **Usar nombres específicos** instead de "el cliente"
- **Incluir timeframes** específicos when requesting analysis
- **Especificar format** de response desired
- **Proporcionar context** sobre decision importance
- **Request confidence levels** para recommendations críticas

### Iteración y Mejora
- **Track effectiveness** de cada template usado
- **Refinar wording** basado en quality de responses
- **Crear variants** para different situations
- **Share improvements** con team para collective learning

---

**Versión**: 1.0  
**Última Actualización**: 19 de Junio, 2025  
**Mantenido por**: Equipo NGX + AI Optimization Team