"""
Event Publisher Infrastructure Implementation
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime
import asyncio

from ...application.interfaces import IEventPublisher
from ..monitoring import Logger


class EventPublisher(IEventPublisher):
    """Base event publisher"""
    pass


class InMemoryEventPublisher(EventPublisher):
    """
    In-memory event publisher for development and testing.
    
    Stores events in memory and logs them. Useful for development
    and testing scenarios where you don't need persistent event storage.
    """
    
    def __init__(self, logger: Logger):
        self.logger = logger
        self.events: List[Dict[str, Any]] = []
        self._event_handlers: Dict[str, List[callable]] = {}
    
    async def publish(self, event: Dict[str, Any]) -> None:
        """Publish a single event"""
        # Add metadata
        enriched_event = {
            **event,
            "published_at": datetime.utcnow().isoformat(),
            "publisher": "InMemoryEventPublisher"
        }
        
        # Store event
        self.events.append(enriched_event)
        
        # Log event
        self.logger.info(
            f"Event published: {event.get('event_type', 'unknown')}",
            event=enriched_event
        )
        
        # Trigger event handlers
        await self._trigger_handlers(enriched_event)
    
    async def publish_batch(self, events: List[Dict[str, Any]]) -> None:
        """Publish multiple events"""
        for event in events:
            await self.publish(event)
    
    def register_handler(self, event_type: str, handler: callable) -> None:
        """Register an event handler"""
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        self._event_handlers[event_type].append(handler)
    
    async def _trigger_handlers(self, event: Dict[str, Any]) -> None:
        """Trigger registered handlers for an event"""
        event_type = event.get("event_type")
        if event_type and event_type in self._event_handlers:
            handlers = self._event_handlers[event_type]
            
            # Run handlers concurrently
            tasks = []
            for handler in handlers:
                if asyncio.iscoroutinefunction(handler):
                    tasks.append(handler(event))
                else:
                    # Wrap sync handlers
                    tasks.append(asyncio.create_task(
                        asyncio.to_thread(handler, event)
                    ))
            
            if tasks:
                try:
                    await asyncio.gather(*tasks, return_exceptions=True)
                except Exception as e:
                    self.logger.error(f"Error in event handler: {e}")
    
    def get_events(self, event_type: str = None) -> List[Dict[str, Any]]:
        """Get stored events, optionally filtered by type"""
        if event_type:
            return [e for e in self.events if e.get("event_type") == event_type]
        return self.events.copy()
    
    def clear_events(self) -> None:
        """Clear all stored events"""
        self.events.clear()
    
    def get_event_count(self, event_type: str = None) -> int:
        """Get count of events"""
        if event_type:
            return len([e for e in self.events if e.get("event_type") == event_type])
        return len(self.events)


class SupabaseEventPublisher(EventPublisher):
    """
    Supabase-based event publisher that stores events in the database.
    
    Provides persistent event storage and can be used for event sourcing
    or audit trails.
    """
    
    def __init__(self, supabase_connection, logger: Logger):
        self.supabase = supabase_connection
        self.logger = logger
        self.table_name = "events"
    
    async def publish(self, event: Dict[str, Any]) -> None:
        """Publish event to Supabase"""
        try:
            # Prepare event data
            event_data = {
                "event_type": event.get("event_type"),
                "event_data": event,
                "published_at": datetime.utcnow().isoformat(),
                "publisher": "SupabaseEventPublisher"
            }
            
            # Insert into database
            response = self.supabase.client.table(self.table_name)\
                .insert(event_data)\
                .execute()
            
            if response.data:
                self.logger.info(
                    f"Event published to Supabase: {event.get('event_type')}",
                    event_id=response.data[0].get("id")
                )
            else:
                self.logger.error("Failed to publish event to Supabase")
                
        except Exception as e:
            self.logger.error(f"Error publishing event to Supabase: {e}")
            raise
    
    async def publish_batch(self, events: List[Dict[str, Any]]) -> None:
        """Publish multiple events to Supabase"""
        try:
            # Prepare event data
            events_data = []
            for event in events:
                event_data = {
                    "event_type": event.get("event_type"),
                    "event_data": event,
                    "published_at": datetime.utcnow().isoformat(),
                    "publisher": "SupabaseEventPublisher"
                }
                events_data.append(event_data)
            
            # Batch insert
            response = self.supabase.client.table(self.table_name)\
                .insert(events_data)\
                .execute()
            
            if response.data:
                self.logger.info(f"Batch published {len(events)} events to Supabase")
            else:
                self.logger.error("Failed to batch publish events to Supabase")
                
        except Exception as e:
            self.logger.error(f"Error batch publishing events to Supabase: {e}")
            raise
    
    async def get_events(
        self, 
        event_type: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Retrieve events from Supabase"""
        try:
            query = self.supabase.client.table(self.table_name).select("*")
            
            if event_type:
                query = query.eq("event_type", event_type)
            
            if start_date:
                query = query.gte("published_at", start_date.isoformat())
            
            if end_date:
                query = query.lte("published_at", end_date.isoformat())
            
            query = query.order("published_at", desc=True).limit(limit)
            
            response = query.execute()
            return response.data
            
        except Exception as e:
            self.logger.error(f"Error retrieving events from Supabase: {e}")
            return []