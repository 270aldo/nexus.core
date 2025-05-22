from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import date, datetime, timedelta
import json
import databutton as db
from supabase import create_client, Client

# Initialize Supabase client
def get_supabase() -> Client:
    url = db.secrets.get("SUPABASE_URL")
    service_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(url, service_key)

router = APIRouter(tags=["MCP-Communication"])

# ------ Models ------

class MessageTemplate(BaseModel):
    id: Optional[str] = None
    name: str
    subject: str
    body: str
    type: str  # email, sms, notification
    parameters: List[str]  # List of parameters that can be replaced in the template
    created_at: Optional[datetime] = None

class TemplatedMessageRequest(BaseModel):
    client_id: str
    template_id: str
    custom_params: Dict[str, str]

class ReminderRequest(BaseModel):
    client_id: str
    reminder_type: str  # workout, nutrition, check-in, measurement
    date: date
    custom_message: Optional[str] = None

class CommunicationHistoryRequest(BaseModel):
    client_id: str
    limit: Optional[int] = 20

class CommunicationHistoryResponse(BaseModel):
    history: List[Dict[str, Any]]
    total_count: int

class CommunicationResponse(BaseModel):
    success: bool
    message: str
    message_id: Optional[str] = None
    reminder_id: Optional[str] = None

# ------ Endpoints ------

@router.post("/mcp/send-templated-message", response_model=CommunicationResponse)
def mcpnew_send_templated_message(request: TemplatedMessageRequest) -> CommunicationResponse:
    """Send a templated message to a client with custom parameters"""
    try:
        supabase = get_supabase()
        
        # Get client information
        client_result = supabase.table("clients") \
            .select("*") \
            .eq("id", request.client_id) \
            .execute()
        
        if not client_result.data or len(client_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        client_data = client_result.data[0]
        
        # Get message template
        template_result = supabase.table("message_templates") \
            .select("*") \
            .eq("id", request.template_id) \
            .execute()
        
        if not template_result.data or len(template_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Message template with ID {request.template_id} not found")
        
        template_data = template_result.data[0]
        
        # Replace parameters in template
        subject = template_data["subject"]
        body = template_data["body"]
        
        # Add client information to custom params
        params = {
            "client_name": client_data.get("name", ""),
            "client_email": client_data.get("email", ""),
            "client_phone": client_data.get("phone", ""),
            "date": date.today().isoformat(),
            **request.custom_params
        }
        
        # Replace parameters in template
        for param_name, param_value in params.items():
            placeholder = f"{{{param_name}}}"
            subject = subject.replace(placeholder, str(param_value))
            body = body.replace(placeholder, str(param_value))
        
        # Create communication log entry
        communication_data = {
            "client_id": request.client_id,
            "type": template_data["type"],
            "subject": subject,
            "content": body,
            "sent_at": datetime.now().isoformat(),
            "status": "sent",
            "template_id": request.template_id
        }
        
        # Insert the communication log
        result = supabase.table("communication_logs").insert(communication_data).execute()
        
        # Extract the ID of the newly created communication log
        if result.data and len(result.data) > 0:
            message_id = result.data[0]["id"]
            
            # In a real implementation, you would send the actual message here
            # For example, using an email service, SMS gateway, or push notification service
            
            return CommunicationResponse(
                success=True,
                message=f"Message sent successfully to {client_data.get('name')}",
                message_id=message_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to log message sending")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending templated message: {str(e)}")

@router.post("/mcp/schedule-client-reminder", response_model=CommunicationResponse)
def mcpnew_schedule_client_reminder(request: ReminderRequest) -> CommunicationResponse:
    """Schedule a reminder for a client for a specific date"""
    try:
        supabase = get_supabase()
        
        # Get client information to verify it exists
        client_result = supabase.table("clients") \
            .select("id, name") \
            .eq("id", request.client_id) \
            .execute()
        
        if not client_result.data or len(client_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        client_name = client_result.data[0].get("name", "client")
        
        # Determine reminder message based on type if custom message not provided
        message = request.custom_message
        if not message:
            if request.reminder_type == "workout":
                message = f"Don't forget your scheduled workout today!"
            elif request.reminder_type == "nutrition":
                message = f"Remember to follow your nutrition plan today!"
            elif request.reminder_type == "check-in":
                message = f"It's time for your weekly check-in."
            elif request.reminder_type == "measurement":
                message = f"Time to record your measurements for tracking progress."
            else:
                message = f"You have a reminder scheduled for today."
        
        # Create reminder data
        reminder_data = {
            "client_id": request.client_id,
            "reminder_type": request.reminder_type,
            "date": request.date.isoformat(),
            "message": message,
            "status": "scheduled",
            "created_at": datetime.now().isoformat()
        }
        
        # Insert the reminder
        result = supabase.table("client_reminders").insert(reminder_data).execute()
        
        # Extract the ID of the newly created reminder
        if result.data and len(result.data) > 0:
            reminder_id = result.data[0]["id"]
            return CommunicationResponse(
                success=True,
                message=f"Reminder scheduled for {client_name} on {request.date}",
                reminder_id=reminder_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to schedule reminder")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scheduling reminder: {str(e)}")

@router.post("/mcp/communication-history", response_model=CommunicationHistoryResponse)
def mcpnew_get_communication_history(request: CommunicationHistoryRequest) -> CommunicationHistoryResponse:
    """Retrieve communication history for a specific client"""
    try:
        supabase = get_supabase()
        
        # Verify client exists
        client_result = supabase.table("clients") \
            .select("id") \
            .eq("id", request.client_id) \
            .execute()
        
        if not client_result.data or len(client_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Get communication logs for the client
        query = supabase.table("communication_logs") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .order("sent_at", desc=True)
        
        # Add limit if provided
        if request.limit:
            query = query.limit(request.limit)
        
        comm_result = query.execute()
        
        # Get reminders for the client
        reminders_query = supabase.table("client_reminders") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .order("date", desc=True)
        
        # Add limit if provided
        if request.limit:
            reminders_query = reminders_query.limit(request.limit)
        
        reminders_result = reminders_query.execute()
        
        # Combine and sort all communication items
        all_items = []
        
        # Add communication logs
        for log in comm_result.data:
            all_items.append({
                "id": log["id"],
                "date": log.get("sent_at"),
                "type": f"message:{log.get('type', 'unknown')}",
                "subject": log.get("subject"),
                "content": log.get("content"),
                "status": log.get("status")
            })
        
        # Add reminders
        for reminder in reminders_result.data:
            all_items.append({
                "id": reminder["id"],
                "date": reminder.get("date"),
                "type": f"reminder:{reminder.get('reminder_type', 'unknown')}",
                "subject": f"Reminder: {reminder.get('reminder_type', '')}",
                "content": reminder.get("message"),
                "status": reminder.get("status")
            })
        
        # Sort all items by date (newest first)
        all_items.sort(key=lambda x: x.get("date", ""), reverse=True)
        
        # Limit to requested amount
        if request.limit and len(all_items) > request.limit:
            all_items = all_items[:request.limit]
        
        # Count total items for this client
        count_query = supabase.table("communication_logs") \
            .select("id", count="exact") \
            .eq("client_id", request.client_id) \
            .execute()
        
        reminders_count_query = supabase.table("client_reminders") \
            .select("id", count="exact") \
            .eq("client_id", request.client_id) \
            .execute()
        
        total_count = 0
        total_count += count_query.count if hasattr(count_query, 'count') else len(count_query.data)
        total_count += reminders_count_query.count if hasattr(reminders_count_query, 'count') else len(reminders_count_query.data)
        
        return CommunicationHistoryResponse(
            history=all_items,
            total_count=total_count
        )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving communication history: {str(e)}")
