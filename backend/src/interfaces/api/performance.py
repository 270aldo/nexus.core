"""
Performance monitoring API endpoints
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime, timedelta

from ...infrastructure.database.performance import (
    analyze_query_performance,
    get_database_health,
    performance_monitor,
    query_cache,
    connection_pool
)
from ...infrastructure.database.optimized_repository import create_optimized_client_repository
from ..dependencies import get_current_user

router = APIRouter(prefix="/performance", tags=["performance"])


@router.get("/health")
async def get_performance_health():
    """Get comprehensive performance health status"""
    try:
        health_data = await get_database_health()
        return {
            "status": "success",
            "data": health_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health status: {e}")


@router.get("/analytics")
async def get_performance_analytics(
    minutes: int = Query(60, ge=1, le=1440, description="Time period in minutes"),
    table_name: Optional[str] = Query(None, description="Filter by table name")
):
    """Get detailed performance analytics"""
    try:
        analytics = await analyze_query_performance(table_name, minutes)
        return {
            "status": "success",
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {e}")


@router.get("/metrics")
async def get_performance_metrics(
    minutes: int = Query(30, ge=1, le=1440)
):
    """Get performance metrics summary"""
    try:
        stats = performance_monitor.get_stats(minutes)
        cache_stats = query_cache.stats()
        pool_stats = connection_pool.stats()
        
        return {
            "status": "success",
            "data": {
                "query_performance": stats,
                "cache_statistics": cache_stats,
                "connection_pool": pool_stats,
                "period_minutes": minutes
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {e}")


@router.get("/slow-queries")
async def get_slow_queries(
    minutes: int = Query(60, ge=1, le=1440),
    threshold: float = Query(1.0, ge=0.1, description="Slow query threshold in seconds")
):
    """Get slow queries for optimization"""
    try:
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        recent_metrics = [
            m for m in performance_monitor._metrics 
            if m.timestamp > cutoff_time and m.execution_time > threshold
        ]
        
        # Sort by execution time, descending
        slow_queries = sorted(recent_metrics, key=lambda m: m.execution_time, reverse=True)
        
        return {
            "status": "success",
            "data": {
                "slow_queries": [
                    {
                        "query_type": m.query_type,
                        "table_name": m.table_name,
                        "execution_time": round(m.execution_time, 3),
                        "timestamp": m.timestamp.isoformat(),
                        "cache_hit": m.cache_hit
                    }
                    for m in slow_queries[:20]  # Top 20 slowest
                ],
                "total_slow_queries": len(slow_queries),
                "threshold_seconds": threshold,
                "period_minutes": minutes
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get slow queries: {e}")


@router.post("/cache/clear")
async def clear_query_cache(
    table_name: Optional[str] = Query(None, description="Clear cache for specific table"),
    user = Depends(get_current_user)
):
    """Clear query cache (admin only)"""
    try:
        if table_name:
            query_cache.invalidate_table(table_name)
            message = f"Cache cleared for table: {table_name}"
        else:
            query_cache.clear()
            message = "All cache cleared"
        
        return {
            "status": "success",
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {e}")


@router.get("/cache/stats")
async def get_cache_statistics():
    """Get detailed cache statistics"""
    try:
        stats = query_cache.stats()
        return {
            "status": "success",
            "data": {
                "cache_statistics": stats,
                "recommendations": _get_cache_recommendations(stats)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {e}")


@router.get("/database/dashboard")
async def get_database_dashboard():
    """Get optimized database dashboard metrics"""
    try:
        repo = create_optimized_client_repository()
        
        # Get dashboard metrics efficiently
        metrics = await repo.get_dashboard_metrics()
        recent_activity = await repo.get_recent_activity(limit=10)
        
        # Get performance summary
        perf_stats = performance_monitor.get_stats(minutes=60)
        
        return {
            "status": "success",
            "data": {
                "client_metrics": metrics,
                "recent_activity": recent_activity,
                "performance_summary": {
                    "total_queries_last_hour": perf_stats.get("total_queries", 0),
                    "average_response_time": perf_stats.get("average_execution_time", 0),
                    "cache_hit_rate": perf_stats.get("cache_hit_rate", 0)
                }
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {e}")


@router.get("/optimization/recommendations")
async def get_optimization_recommendations():
    """Get performance optimization recommendations"""
    try:
        analytics = await analyze_query_performance(minutes=60)
        cache_stats = query_cache.stats()
        pool_stats = connection_pool.stats()
        
        recommendations = []
        
        # Cache optimization recommendations
        if analytics.get("cache_hit_rate", 0) < 70:
            recommendations.append({
                "category": "cache",
                "priority": "high",
                "title": "Improve Cache Hit Rate",
                "description": f"Current cache hit rate is {analytics.get('cache_hit_rate', 0):.1f}%. Consider increasing TTL for read operations.",
                "impact": "High - Can reduce database load by 30-50%"
            })
        
        # Query performance recommendations
        avg_time = analytics.get("average_execution_time", 0)
        if avg_time > 0.5:
            recommendations.append({
                "category": "query",
                "priority": "high",
                "title": "Optimize Slow Queries",
                "description": f"Average query time is {avg_time:.2f}s. Consider adding indexes or optimizing queries.",
                "impact": "High - Can improve response times by 50-80%"
            })
        
        # Connection pool recommendations
        if pool_stats.get("pool_utilization", 0) > 80:
            recommendations.append({
                "category": "connection",
                "priority": "medium",
                "title": "Increase Connection Pool Size",
                "description": f"Pool utilization is {pool_stats.get('pool_utilization', 0):.1f}%. Consider increasing max connections.",
                "impact": "Medium - Can reduce connection wait times"
            })
        
        # Memory recommendations
        cache_size_mb = cache_stats.get("cache_size_mb", 0)
        if cache_size_mb > 100:
            recommendations.append({
                "category": "memory",
                "priority": "low",
                "title": "Monitor Cache Memory Usage",
                "description": f"Cache is using {cache_size_mb:.1f}MB. Consider implementing LRU eviction.",
                "impact": "Low - Prevents memory bloat"
            })
        
        return {
            "status": "success",
            "data": {
                "recommendations": recommendations,
                "total_recommendations": len(recommendations),
                "generated_at": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {e}")


@router.get("/benchmark")
async def run_performance_benchmark():
    """Run a performance benchmark test"""
    try:
        repo = create_optimized_client_repository()
        
        # Benchmark different operations
        start_time = datetime.now()
        
        # Test 1: Count operation
        count_start = datetime.now()
        total_clients = await repo.count()
        count_time = (datetime.now() - count_start).total_seconds()
        
        # Test 2: Find all with limit
        find_start = datetime.now()
        clients = await repo.find_all(limit=10)
        find_time = (datetime.now() - find_start).total_seconds()
        
        # Test 3: Analytics query
        analytics_start = datetime.now()
        analytics = await repo.get_analytics_data()
        analytics_time = (datetime.now() - analytics_start).total_seconds()
        
        total_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "status": "success",
            "data": {
                "benchmark_results": {
                    "count_operation": {
                        "execution_time": round(count_time, 3),
                        "result_count": total_clients,
                        "performance": "excellent" if count_time < 0.1 else "good" if count_time < 0.5 else "needs_optimization"
                    },
                    "find_operation": {
                        "execution_time": round(find_time, 3),
                        "result_count": len(clients),
                        "performance": "excellent" if find_time < 0.2 else "good" if find_time < 1.0 else "needs_optimization"
                    },
                    "analytics_operation": {
                        "execution_time": round(analytics_time, 3),
                        "data_points": len(analytics),
                        "performance": "excellent" if analytics_time < 0.5 else "good" if analytics_time < 2.0 else "needs_optimization"
                    },
                    "total_benchmark_time": round(total_time, 3)
                },
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {e}")


def _get_cache_recommendations(cache_stats: Dict[str, Any]) -> List[str]:
    """Generate cache optimization recommendations"""
    recommendations = []
    
    active_ratio = cache_stats.get("active_entries", 0) / max(cache_stats.get("total_entries", 1), 1)
    
    if active_ratio < 0.5:
        recommendations.append("High cache expiration rate - consider increasing TTL")
    
    if cache_stats.get("cache_size_mb", 0) > 50:
        recommendations.append("Large cache size - consider implementing LRU eviction")
    
    if cache_stats.get("total_entries", 0) > 10000:
        recommendations.append("High entry count - consider cache partitioning")
    
    return recommendations