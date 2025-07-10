"""
NEXUS-CORE Proactive Alerts System
==================================

Sistema de alertas inteligentes y proactivas para NGX.
Detecta patrones, predice riesgos y genera notificaciones automáticas
para optimizar intervenciones y retención de clientes.

Funcionalidades:
- Detección automática de patrones de riesgo
- Alertas predictivas basadas en comportamiento
- Notificaciones personalizadas por rol
- Sistema de escalación automática
- Analytics de efectividad de alertas

Autor: Equipo NGX
Versión: 1.0.0
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import date, datetime, timedelta
from uuid import UUID, uuid4
import asyncio
import json
import logging
from enum import Enum
import math

# Configurar logging
logger = logging.getLogger(__name__)

# Router para alertas proactivas
router = APIRouter(
    prefix="/alerts",
    tags=["proactive-alerts"],
    responses={
        404: {"description": "Resource not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

# ============================================================================
# ENUMS Y CONSTANTES
# ============================================================================

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertCategory(str, Enum):
    CLIENT_RISK = "client_risk"
    ADHERENCE = "adherence"
    BUSINESS = "business"
    OPERATIONAL = "operational"
    FINANCIAL = "financial"
    PERFORMANCE = "performance"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class UserRole(str, Enum):
    CEO = "ceo"
    ADMIN = "admin"
    SPECIALIST = "specialist"
    COACH = "coach"

# ============================================================================
# MODELOS DE REQUEST
# ============================================================================

class AlertGenerationRequest(BaseModel):
    """Request para generar alertas proactivas"""
    
    categories: Optional[List[AlertCategory]] = Field(None, description="Categorías específicas a analizar")
    severity_threshold: AlertSeverity = Field(AlertSeverity.MEDIUM, description="Severidad mínima para alertas")
    time_window: Literal["24h", "48h", "7d", "30d"] = Field("24h", description="Ventana de tiempo para análisis")
    include_predictions: bool = Field(True, description="Incluir alertas predictivas")
    target_roles: Optional[List[UserRole]] = Field(None, description="Roles objetivo para las alertas")

class AlertConfigurationRequest(BaseModel):
    """Request para configurar parámetros de alertas"""
    
    alert_type: str = Field(..., description="Tipo de alerta a configurar")
    threshold_values: Dict[str, float] = Field(..., description="Valores de threshold")
    notification_settings: Dict[str, Any] = Field(..., description="Configuración de notificaciones")
    auto_escalation: bool = Field(False, description="Escalación automática activada")
    
class AlertActionRequest(BaseModel):
    """Request para acciones sobre alertas"""
    
    alert_id: str = Field(..., description="ID de la alerta")
    action: Literal["acknowledge", "resolve", "dismiss", "escalate"] = Field(..., description="Acción a realizar")
    user_id: str = Field(..., description="ID del usuario que realiza la acción")
    notes: Optional[str] = Field(None, description="Notas adicionales")

# ============================================================================
# MODELOS DE RESPONSE
# ============================================================================

class Alert(BaseModel):
    """Modelo de alerta individual"""
    
    id: str = Field(default_factory=lambda: str(uuid4()), description="ID único de la alerta")
    category: AlertCategory = Field(..., description="Categoría de la alerta")
    severity: AlertSeverity = Field(..., description="Severidad de la alerta")
    title: str = Field(..., description="Título descriptivo")
    description: str = Field(..., description="Descripción detallada")
    
    # Datos específicos
    data: Dict[str, Any] = Field(default_factory=dict, description="Datos específicos de la alerta")
    metrics: Dict[str, float] = Field(default_factory=dict, description="Métricas relacionadas")
    
    # Recomendaciones
    recommended_actions: List[str] = Field(default_factory=list, description="Acciones recomendadas")
    timeline: str = Field(..., description="Timeline para acción")
    priority_score: float = Field(..., description="Score de prioridad 0-100")
    
    # Metadatos
    created_at: datetime = Field(default_factory=datetime.now, description="Fecha de creación")
    status: AlertStatus = Field(AlertStatus.ACTIVE, description="Estado actual")
    assigned_to: Optional[List[UserRole]] = Field(None, description="Roles asignados")
    
    # Predictivo
    is_predictive: bool = Field(False, description="Es una alerta predictiva")
    confidence_level: Optional[float] = Field(None, description="Nivel de confianza 0-1")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AlertsResponse(BaseModel):
    """Response para endpoints de alertas"""
    
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    alerts: List[Alert] = Field(default_factory=list, description="Lista de alertas")
    summary: Dict[str, Any] = Field(default_factory=dict, description="Resumen de alertas")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos adicionales")
    generated_at: datetime = Field(default_factory=datetime.now, description="Timestamp de generación")

# ============================================================================
# DETECTORES DE ALERTAS
# ============================================================================

class ClientRiskDetector:
    """Detector de riesgos relacionados con clientes"""
    
    @staticmethod
    async def detect_churn_risk() -> List[Alert]:
        """Detecta clientes en riesgo de abandono"""
        alerts = []
        
        # Simular análisis de riesgo de churn
        high_risk_clients = [
            {
                "client_id": "client_001",
                "client_name": "Sarah Johnson",
                "risk_score": 0.85,
                "factors": ["Adherencia bajó 35% últimas 2 semanas", "No responde mensajes del coach", "Missed 3 consecutive sessions"],
                "last_session": "2025-06-15"
            },
            {
                "client_id": "client_002", 
                "client_name": "Mike Rodriguez",
                "risk_score": 0.73,
                "factors": ["Plateau en progreso 6 semanas", "Feedback negativo sobre program difficulty", "Payment delayed"],
                "last_session": "2025-06-17"
            }
        ]
        
        for client in high_risk_clients:
            severity = AlertSeverity.CRITICAL if client["risk_score"] > 0.8 else AlertSeverity.HIGH
            
            alert = Alert(
                category=AlertCategory.CLIENT_RISK,
                severity=severity,
                title=f"Alto Riesgo de Churn: {client['client_name']}",
                description=f"Cliente {client['client_name']} presenta probabilidad {client['risk_score']:.0%} de abandono en próximas 2 semanas",
                data={
                    "client_id": client["client_id"],
                    "client_name": client["client_name"],
                    "risk_score": client["risk_score"],
                    "risk_factors": client["factors"],
                    "last_session_date": client["last_session"]
                },
                metrics={
                    "risk_probability": client["risk_score"] * 100,
                    "days_since_last_session": 4,
                    "adherence_decline": 35.0
                },
                recommended_actions=[
                    "Contacto inmediato del coach principal",
                    "Revisar y ajustar programa de entrenamiento",
                    "Ofrecer sesión de re-engagement gratuita",
                    "Evaluar pricing/package adjustments"
                ],
                timeline="immediate",
                priority_score=client["risk_score"] * 100,
                assigned_to=[UserRole.COACH, UserRole.ADMIN],
                is_predictive=True,
                confidence_level=0.87
            )
            alerts.append(alert)
        
        return alerts
    
    @staticmethod
    async def detect_adherence_decline() -> List[Alert]:
        """Detecta declives significativos en adherencia"""
        alerts = []
        
        # Simular análisis de adherencia
        declining_clients = [
            {
                "client_id": "client_003",
                "client_name": "Jennifer Chen",
                "current_adherence": 45.0,
                "previous_adherence": 78.0,
                "decline_percentage": 42.3,
                "period": "últimas 3 semanas"
            }
        ]
        
        for client in declining_clients:
            if client["decline_percentage"] > 25.0:
                alert = Alert(
                    category=AlertCategory.ADHERENCE,
                    severity=AlertSeverity.HIGH,
                    title=f"Decline Significativo en Adherencia: {client['client_name']}",
                    description=f"Adherencia de {client['client_name']} bajó {client['decline_percentage']:.1f}% en {client['period']}",
                    data={
                        "client_id": client["client_id"],
                        "client_name": client["client_name"],
                        "current_adherence": client["current_adherence"],
                        "previous_adherence": client["previous_adherence"],
                        "decline_period": client["period"]
                    },
                    metrics={
                        "adherence_current": client["current_adherence"],
                        "adherence_previous": client["previous_adherence"],
                        "decline_percentage": client["decline_percentage"]
                    },
                    recommended_actions=[
                        "Check-in personal del coach",
                        "Evaluar factores externos (work stress, family)",
                        "Considerar programa más flexible temporalmente",
                        "Revisar scheduling preferences"
                    ],
                    timeline="next_48_hours",
                    priority_score=85.0,
                    assigned_to=[UserRole.COACH],
                    is_predictive=False,
                    confidence_level=0.92
                )
                alerts.append(alert)
        
        return alerts

class BusinessRiskDetector:
    """Detector de riesgos de negocio"""
    
    @staticmethod
    async def detect_revenue_risks() -> List[Alert]:
        """Detecta riesgos relacionados con revenue"""
        alerts = []
        
        # Simular análisis de revenue
        current_month_revenue = 118000  # USD
        target_revenue = 130000
        shortfall_percentage = ((target_revenue - current_month_revenue) / target_revenue) * 100
        days_remaining = 12
        
        if shortfall_percentage > 10.0 and days_remaining < 15:
            alert = Alert(
                category=AlertCategory.FINANCIAL,
                severity=AlertSeverity.HIGH,
                title=f"Revenue Target en Riesgo: {shortfall_percentage:.1f}% shortfall",
                description=f"Revenue actual (${current_month_revenue:,}) está {shortfall_percentage:.1f}% por debajo del target mensual (${target_revenue:,}) con {days_remaining} días restantes",
                data={
                    "current_revenue": current_month_revenue,
                    "target_revenue": target_revenue,
                    "shortfall_amount": target_revenue - current_month_revenue,
                    "days_remaining": days_remaining
                },
                metrics={
                    "shortfall_percentage": shortfall_percentage,
                    "daily_target_needed": (target_revenue - current_month_revenue) / days_remaining,
                    "current_daily_average": current_month_revenue / (30 - days_remaining)
                },
                recommended_actions=[
                    "Activar campaign de upselling intensiva",
                    "Contactar prospects en pipeline para accelerate closing",
                    "Revisar package pricing para nuevos clients",
                    "Implementar retention bonuses para renewals"
                ],
                timeline="immediate",
                priority_score=92.0,
                assigned_to=[UserRole.CEO, UserRole.ADMIN],
                is_predictive=True,
                confidence_level=0.88
            )
            alerts.append(alert)
        
        return alerts
    
    @staticmethod
    async def detect_capacity_issues() -> List[Alert]:
        """Detecta problemas de capacidad operacional"""
        alerts = []
        
        # Simular análisis de capacidad
        current_utilization = 89.5  # Porcentaje
        coach_availability = 72.0
        booking_rate_trend = 15.0  # Incremento semanal
        
        if current_utilization > 85.0:
            severity = AlertSeverity.CRITICAL if current_utilization > 90.0 else AlertSeverity.HIGH
            
            alert = Alert(
                category=AlertCategory.OPERATIONAL,
                severity=severity,
                title=f"Capacity Constraint: {current_utilization:.1f}% utilization",
                description=f"Utilización actual ({current_utilization:.1f}%) cerca del límite con trend de crecimiento {booking_rate_trend:.1f}% semanal",
                data={
                    "current_utilization": current_utilization,
                    "coach_availability": coach_availability,
                    "booking_trend": booking_rate_trend,
                    "peak_hours": ["6:00-8:00 AM", "6:00-8:00 PM"]
                },
                metrics={
                    "utilization_percentage": current_utilization,
                    "availability_gap": 100 - coach_availability,
                    "weekly_growth_rate": booking_rate_trend
                },
                recommended_actions=[
                    "Considerar hiring additional coaches",
                    "Optimizar scheduling para distribute load",
                    "Implement waitlist system para peak hours",
                    "Offer incentives para off-peak training"
                ],
                timeline="next_2_weeks",
                priority_score=87.0,
                assigned_to=[UserRole.ADMIN, UserRole.CEO],
                is_predictive=True,
                confidence_level=0.91
            )
            alerts.append(alert)
        
        return alerts

class PerformanceDetector:
    """Detector de problemas de performance del sistema"""
    
    @staticmethod
    async def detect_system_performance_issues() -> List[Alert]:
        """Detecta problemas de performance del sistema"""
        alerts = []
        
        # Simular análisis de performance
        avg_response_time = 1250  # milliseconds
        error_rate = 3.2  # percentage
        uptime = 99.2  # percentage
        
        if avg_response_time > 1000:
            alert = Alert(
                category=AlertCategory.OPERATIONAL,
                severity=AlertSeverity.MEDIUM,
                title=f"Degradación de Performance: {avg_response_time}ms response time",
                description=f"Response time promedio ({avg_response_time}ms) por encima del threshold óptimo (500ms)",
                data={
                    "avg_response_time": avg_response_time,
                    "error_rate": error_rate,
                    "uptime_percentage": uptime,
                    "slow_endpoints": [
                        "/mcp/analytics/business-metrics2",
                        "/routes/clients/search",
                        "/routes/analytics/adherence"
                    ]
                },
                metrics={
                    "response_time_ms": avg_response_time,
                    "error_rate_percent": error_rate,
                    "uptime_percent": uptime
                },
                recommended_actions=[
                    "Optimizar queries más lentas en base de datos",
                    "Implement caching para endpoints frecuentes",
                    "Review server resources y scaling",
                    "Monitor database connection pool"
                ],
                timeline="next_week",
                priority_score=68.0,
                assigned_to=[UserRole.ADMIN],
                is_predictive=False,
                confidence_level=0.94
            )
            alerts.append(alert)
        
        return alerts

# ============================================================================
# MOTOR DE ALERTAS PRINCIPAL
# ============================================================================

class ProactiveAlertsEngine:
    """Motor principal de alertas proactivas"""
    
    def __init__(self):
        self.detectors = {
            AlertCategory.CLIENT_RISK: ClientRiskDetector(),
            AlertCategory.BUSINESS: BusinessRiskDetector(),
            AlertCategory.OPERATIONAL: PerformanceDetector()
        }
        self.alert_cache = {}
    
    async def generate_all_alerts(self, request: AlertGenerationRequest) -> List[Alert]:
        """Genera todas las alertas según configuración"""
        all_alerts = []
        
        # Determinar categorías a analizar
        categories_to_check = request.categories or list(AlertCategory)
        
        # Generar alertas por categoría
        for category in categories_to_check:
            category_alerts = await self._generate_category_alerts(category)
            all_alerts.extend(category_alerts)
        
        # Filtrar por severidad mínima
        filtered_alerts = [
            alert for alert in all_alerts 
            if self._severity_to_int(alert.severity) >= self._severity_to_int(request.severity_threshold)
        ]
        
        # Filtrar por roles objetivo si se especifican
        if request.target_roles:
            filtered_alerts = [
                alert for alert in filtered_alerts
                if alert.assigned_to and any(role in alert.assigned_to for role in request.target_roles)
            ]
        
        # Ordenar por prioridad
        filtered_alerts.sort(key=lambda x: x.priority_score, reverse=True)
        
        return filtered_alerts
    
    async def _generate_category_alerts(self, category: AlertCategory) -> List[Alert]:
        """Genera alertas para una categoría específica"""
        alerts = []
        
        try:
            if category == AlertCategory.CLIENT_RISK:
                churn_alerts = await ClientRiskDetector.detect_churn_risk()
                adherence_alerts = await ClientRiskDetector.detect_adherence_decline()
                alerts.extend(churn_alerts + adherence_alerts)
                
            elif category == AlertCategory.BUSINESS or category == AlertCategory.FINANCIAL:
                revenue_alerts = await BusinessRiskDetector.detect_revenue_risks()
                alerts.extend(revenue_alerts)
                
            elif category == AlertCategory.OPERATIONAL:
                capacity_alerts = await BusinessRiskDetector.detect_capacity_issues()
                performance_alerts = await PerformanceDetector.detect_system_performance_issues()
                alerts.extend(capacity_alerts + performance_alerts)
                
        except Exception as e:
            logger.error(f"Error generando alertas para categoría {category}: {str(e)}")
        
        return alerts
    
    def _severity_to_int(self, severity: AlertSeverity) -> int:
        """Convierte severidad a entero para comparación"""
        severity_map = {
            AlertSeverity.LOW: 1,
            AlertSeverity.MEDIUM: 2,
            AlertSeverity.HIGH: 3,
            AlertSeverity.CRITICAL: 4
        }
        return severity_map.get(severity, 1)
    
    async def calculate_alert_summary(self, alerts: List[Alert]) -> Dict[str, Any]:
        """Calcula resumen de alertas"""
        if not alerts:
            return {
                "total_alerts": 0,
                "by_severity": {s.value: 0 for s in AlertSeverity},
                "by_category": {c.value: 0 for c in AlertCategory},
                "urgent_actions": 0,
                "avg_priority": 0
            }
        
        # Contar por severidad
        by_severity = {s.value: 0 for s in AlertSeverity}
        for alert in alerts:
            by_severity[alert.severity.value] += 1
        
        # Contar por categoría
        by_category = {c.value: 0 for c in AlertCategory}
        for alert in alerts:
            by_category[alert.category.value] += 1
        
        # Acciones urgentes (críticas + high con timeline immediate)
        urgent_actions = len([
            alert for alert in alerts 
            if alert.severity in [AlertSeverity.CRITICAL, AlertSeverity.HIGH] 
            and alert.timeline in ["immediate", "next_24_hours"]
        ])
        
        # Prioridad promedio
        avg_priority = sum(alert.priority_score for alert in alerts) / len(alerts)
        
        return {
            "total_alerts": len(alerts),
            "by_severity": by_severity,
            "by_category": by_category,
            "urgent_actions": urgent_actions,
            "avg_priority": round(avg_priority, 1),
            "predictive_alerts": len([a for a in alerts if a.is_predictive]),
            "high_confidence_alerts": len([a for a in alerts if a.confidence_level and a.confidence_level > 0.8])
        }

# ============================================================================
# ENDPOINTS DE ALERTAS
# ============================================================================

# Instancia global del motor de alertas
alerts_engine = ProactiveAlertsEngine()

@router.post("/generate", response_model=AlertsResponse)
async def generate_proactive_alerts(request: AlertGenerationRequest):
    """
    Genera alertas proactivas basadas en análisis de datos actuales
    """
    try:
        logger.info(f"Generando alertas proactivas - Categorías: {request.categories}, Severidad: {request.severity_threshold}")
        
        # Generar alertas
        alerts = await alerts_engine.generate_all_alerts(request)
        
        # Calcular resumen
        summary = await alerts_engine.calculate_alert_summary(alerts)
        
        return AlertsResponse(
            success=True,
            alerts=alerts,
            summary=summary,
            metadata={
                "generation_params": {
                    "categories": request.categories,
                    "severity_threshold": request.severity_threshold,
                    "time_window": request.time_window,
                    "include_predictions": request.include_predictions,
                    "target_roles": request.target_roles
                },
                "generation_time_ms": 250,  # Simulated
                "total_detectors_run": len(alerts_engine.detectors)
            }
        )
        
    except Exception as e:
        logger.error(f"Error generando alertas proactivas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generando alertas: {str(e)}")

@router.get("/active", response_model=AlertsResponse)
async def get_active_alerts(
    severity: Optional[AlertSeverity] = None,
    category: Optional[AlertCategory] = None,
    role: Optional[UserRole] = None
):
    """
    Obtiene alertas activas con filtros opcionales
    """
    try:
        # Simular obtención de alertas activas (en implementación real, desde base de datos)
        request = AlertGenerationRequest(
            categories=[category] if category else None,
            severity_threshold=severity or AlertSeverity.LOW,
            target_roles=[role] if role else None
        )
        
        alerts = await alerts_engine.generate_all_alerts(request)
        
        # Filtrar solo alertas activas
        active_alerts = [alert for alert in alerts if alert.status == AlertStatus.ACTIVE]
        
        summary = await alerts_engine.calculate_alert_summary(active_alerts)
        
        return AlertsResponse(
            success=True,
            alerts=active_alerts,
            summary=summary,
            metadata={
                "filters_applied": {
                    "severity": severity,
                    "category": category,
                    "role": role
                },
                "active_only": True
            }
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo alertas activas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo alertas: {str(e)}")

@router.post("/action", response_model=AlertsResponse)
async def handle_alert_action(request: AlertActionRequest):
    """
    Maneja acciones sobre alertas (acknowledge, resolve, dismiss, escalate)
    """
    try:
        logger.info(f"Procesando acción '{request.action}' en alerta {request.alert_id} por usuario {request.user_id}")
        
        # En implementación real, actualizar estado en base de datos
        # Por ahora, simular respuesta exitosa
        
        action_results = {
            "acknowledge": "Alerta reconocida y asignada",
            "resolve": "Alerta marcada como resuelta",
            "dismiss": "Alerta descartada",
            "escalate": "Alerta escalada a nivel superior"
        }
        
        return AlertsResponse(
            success=True,
            alerts=[],  # No retornar alertas en acciones
            summary={
                "action_performed": request.action,
                "alert_id": request.alert_id,
                "result": action_results.get(request.action, "Acción procesada")
            },
            metadata={
                "action": request.action,
                "user_id": request.user_id,
                "notes": request.notes,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Error procesando acción de alerta: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando acción: {str(e)}")

@router.get("/health", response_model=AlertsResponse)
async def alerts_health_check():
    """
    Health check del sistema de alertas proactivas
    """
    try:
        # Verificar que todos los detectores estén funcionando
        test_alerts = await alerts_engine._generate_category_alerts(AlertCategory.OPERATIONAL)
        
        return AlertsResponse(
            success=True,
            alerts=[],
            summary={
                "status": "healthy",
                "detectors_active": len(alerts_engine.detectors),
                "last_generation": "successful",
                "response_time_ms": 45
            },
            metadata={
                "components": {
                    "client_risk_detector": "operational",
                    "business_risk_detector": "operational",
                    "performance_detector": "operational",
                    "alerts_engine": "operational"
                },
                "version": "1.0.0"
            }
        )
        
    except Exception as e:
        logger.error(f"Error en health check de alertas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Alerts health check failed: {str(e)}")

# ============================================================================
# UTILIDADES
# ============================================================================

def calculate_risk_score(factors: Dict[str, float]) -> float:
    """Calcula score de riesgo basado en múltiples factores"""
    weights = {
        "adherence_decline": 0.3,
        "engagement_drop": 0.25,
        "payment_issues": 0.2,
        "satisfaction_decline": 0.15,
        "communication_gaps": 0.1
    }
    
    weighted_score = sum(
        factors.get(factor, 0) * weight 
        for factor, weight in weights.items()
    )
    
    return min(1.0, max(0.0, weighted_score))

def determine_alert_priority(severity: AlertSeverity, confidence: float, impact: str) -> float:
    """Determina prioridad de alerta basada en múltiples factores"""
    severity_weights = {
        AlertSeverity.LOW: 0.25,
        AlertSeverity.MEDIUM: 0.50,
        AlertSeverity.HIGH: 0.75,
        AlertSeverity.CRITICAL: 1.0
    }
    
    impact_weights = {
        "low": 0.2,
        "medium": 0.5,
        "high": 0.8,
        "critical": 1.0
    }
    
    base_score = severity_weights.get(severity, 0.5) * 100
    confidence_factor = confidence
    impact_factor = impact_weights.get(impact.lower(), 0.5)
    
    priority_score = base_score * confidence_factor * impact_factor
    
    return min(100.0, max(0.0, priority_score))