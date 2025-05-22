from fastapi import APIRouter, HTTPException, Query, Path, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import databutton as db
import requests
import json
from datetime import date, datetime, timedelta
from enum import Enum

router = APIRouter()

# ======== Models ========

class MessageTemplateType(str, Enum):
    WELCOME = "welcome"
    CHECKIN = "checkin"
    WORKOUT_REMINDER = "workout_reminder"
    NUTRITION_REMINDER = "nutrition_reminder"
    PROGRESS_UPDATE = "progress_update"
    PROGRAM_COMPLETE = "program_complete"
    RENEWAL = "renewal"
    CUSTOM = "custom"

class ReminderType(str, Enum):
    WORKOUT = "workout"
    NUTRITION = "nutrition"
    CHECK_IN = "check_in"
    MEASUREMENT = "measurement"
    APPOINTMENT = "appointment"
    HYDRATION = "hydration"
    SUPPLEMENT = "supplement"
    CUSTOM = "custom"

class MessageChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    APP = "app"
    WHATSAPP = "whatsapp"

class CommunicationStatus(str, Enum):
    SCHEDULED = "scheduled"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    RESPONDED = "responded"
    FAILED = "failed"

class TemplatedMessageRequest(BaseModel):
    client_id: str
    template_id: MessageTemplateType
    channels: List[MessageChannel]
    custom_params: Optional[Dict[str, Any]] = None
    scheduled_time: Optional[datetime] = None

class ReminderRequest(BaseModel):
    client_id: str
    reminder_type: ReminderType
    date: datetime
    custom_message: Optional[str] = None
    channels: List[MessageChannel] = [MessageChannel.APP]
    repeat: Optional[Dict[str, Any]] = None  # E.g., {"frequency": "weekly", "days": ["Monday", "Wednesday", "Friday"]}

class CommunicationLog(BaseModel):
    id: Optional[str] = None
    client_id: str
    timestamp: datetime
    type: str  # message, reminder, notification, etc.
    channel: MessageChannel
    content: str
    status: CommunicationStatus
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CommunicationResponse(BaseModel):
    success: bool
    message: str
    log_id: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class CommunicationHistoryResponse(BaseModel):
    logs: List[CommunicationLog]
    total: int

# ======== Helper Functions ========

# Function to get Supabase credentials
def get_supabase_credentials():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500, 
            detail="Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets."
        )
    
    return supabase_url, supabase_key

# Function to make requests to Supabase REST API
def supabase_request(method, path, data=None, params=None):
    url, key = get_supabase_credentials()
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    full_url = f"{url}{path}"
    
    try:
        if method.lower() == "get":
            response = requests.get(full_url, headers=headers, params=params)
        elif method.lower() == "post":
            response = requests.post(full_url, headers=headers, json=data)
        elif method.lower() == "put":
            response = requests.put(full_url, headers=headers, json=data)
        elif method.lower() == "patch":
            response = requests.patch(full_url, headers=headers, json=data)
        elif method.lower() == "delete":
            response = requests.delete(full_url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        
        if response.status_code != 204:  # No content
            return response.json()
        return None
    except requests.exceptions.RequestException as e:
        error_detail = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_json = e.response.json()
                error_detail = error_json.get('message', str(e))
            except ValueError:
                error_detail = e.response.text or str(e)
        
        raise HTTPException(status_code=500, detail=f"Supabase API error: {error_detail}") from e

# ======== Mock Templates ========

# In a real implementation, these would be stored in the database
def get_message_template(template_id, custom_params=None):
    templates = {
        MessageTemplateType.WELCOME: {
            "subject": "Welcome to NGX Performance & Longevity",
            "content": "Dear {{client_name}},\n\nWelcome to NGX {{program_type}}! We're excited to have you join our community of dedicated individuals committed to improving their performance and longevity.\n\nYour journey begins with your first session on {{first_session_date}}. Please arrive 15 minutes early to complete your orientation.\n\nIf you have any questions before then, don't hesitate to reach out.\n\nBest regards,\nThe NGX Team"
        },
        MessageTemplateType.CHECKIN: {
            "subject": "Weekly Check-in: NGX {{program_type}}",
            "content": "Hi {{client_name}},\n\nIt's time for your weekly check-in!\n\nPlease take a moment to:\n1. Log your latest measurements\n2. Update your workout compliance\n3. Share any challenges or wins from the past week\n\nStaying consistent with these check-ins helps us optimize your program for maximum results.\n\nSee you soon,\nYour NGX Coach"
        },
        MessageTemplateType.WORKOUT_REMINDER: {
            "subject": "Your NGX Workout Today",
            "content": "Hi {{client_name}},\n\nJust a friendly reminder about your {{workout_type}} session today at {{workout_time}}.\n\nToday's focus: {{workout_focus}}\n\nDon't forget to:\n- Bring water\n- Wear appropriate shoes\n- Log your workout in the app afterward\n\nSee you soon!\nNGX Team"
        },
        MessageTemplateType.NUTRITION_REMINDER: {
            "subject": "Nutrition Reminder - NGX {{program_type}}",
            "content": "Hello {{client_name}},\n\nThis is your reminder to stick with your nutrition plan today.\n\nKey points for today:\n- {{nutrition_tip}}\n- Don't forget to log your meals in the app\n- Stay hydrated (target: {{water_target}} liters)\n\nConsistency with your nutrition is just as important as your training!\n\nYour NGX Team"
        },
        MessageTemplateType.PROGRESS_UPDATE: {
            "subject": "Your NGX Progress Update",
            "content": "Congratulations {{client_name}}!\n\nWe've analyzed your recent performance data, and we're excited to share your progress:\n\n{{progress_metrics}}\n\nThis represents significant improvement since you started. Keep up the great work!\n\nYour next assessment is scheduled for {{next_assessment_date}}.\n\nBest regards,\nNGX Team"
        },
        MessageTemplateType.PROGRAM_COMPLETE: {
            "subject": "Congratulations on Completing Your NGX Program!",
            "content": "Dear {{client_name}},\n\nCongratulations on completing your {{program_name}} program with NGX!\n\nHere's a summary of your achievements:\n\n{{achievement_summary}}\n\nWe'd love to discuss your results and plan your next steps. Please schedule your review session using the link below:\n\n{{booking_link}}\n\nIt's been a pleasure working with you!\n\nBest regards,\nThe NGX Team"
        },
        MessageTemplateType.RENEWAL: {
            "subject": "Time to Renew Your NGX Membership",
            "content": "Hello {{client_name}},\n\nYour NGX {{program_type}} membership is scheduled to end on {{end_date}}. We've enjoyed working with you and helping you achieve your goals.\n\nTo continue your progress without interruption, please renew your membership by {{renewal_deadline}}.\n\nAs a valued member, we're offering you {{renewal_offer}}.\n\nTo renew, simply reply to this message or click the link below:\n\n{{renewal_link}}\n\nWe look forward to continuing our work together!\n\nBest regards,\nNGX Team"
        },
        MessageTemplateType.CUSTOM: {
            "subject": custom_params.get("subject", "Message from NGX") if custom_params else "Message from NGX",
            "content": custom_params.get("content", "This is a custom message.") if custom_params else "This is a custom message."
        }
    }
    
    return templates.get(template_id, templates[MessageTemplateType.CUSTOM])

# Function to replace template parameters
def process_template(template, client_data, custom_params=None):
    content = template["content"]
    subject = template["subject"]
    
    # Combine client data and custom params
    all_params = {}
    if client_data:
        all_params.update(client_data)
    if custom_params:
        all_params.update(custom_params)
    
    # Replace parameters in content and subject
    for key, value in all_params.items():
        placeholder = "{{" + key + "}}"
        content = content.replace(placeholder, str(value))
        subject = subject.replace(placeholder, str(value))
    
    return {"subject": subject, "content": content}

# ======== API Endpoints ========

@router.post("/communication/send-message", response_model=CommunicationResponse)
def send_templated_message(request: TemplatedMessageRequest):
    """Send a templated message to a client through specified channels"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id,name,email,phone,type",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        client_data = client_check[0]
        client_name = client_data.get("name", "Client")
        client_email = client_data.get("email")
        client_phone = client_data.get("phone")
        client_type = client_data.get("type", "PRIME")
        
        # Get the appropriate template
        template = get_message_template(request.template_id, request.custom_params)
        
        # Process template with client data and custom parameters
        client_template_data = {
            "client_name": client_name,
            "program_type": client_type
        }
        processed_message = process_template(template, client_template_data, request.custom_params)
        
        # Determine if message should be sent now or scheduled
        is_scheduled = request.scheduled_time and request.scheduled_time > datetime.now()
        status = CommunicationStatus.SCHEDULED if is_scheduled else CommunicationStatus.SENT
        
        # In a real implementation, this would send messages through the specified channels
        # For now, we'll just log the communication
        
        # Create communication logs for each channel
        log_ids = []
        for channel in request.channels:
            # Validate that we have the necessary contact info for each channel
            if channel == MessageChannel.EMAIL and not client_email:
                continue  # Skip email if no email address
            if (channel == MessageChannel.SMS or channel == MessageChannel.WHATSAPP) and not client_phone:
                continue  # Skip SMS/WhatsApp if no phone number
            
            log_data = {
                "client_id": request.client_id,
                "timestamp": request.scheduled_time.isoformat() if is_scheduled else datetime.now().isoformat(),
                "type": f"templated_message:{request.template_id}",
                "channel": channel,
                "content": json.dumps(processed_message),
                "status": status,
                "metadata": {
                    "template_id": request.template_id,
                    "custom_params": request.custom_params
                }
            }
            
            result = supabase_request(
                "POST", 
                "/rest/v1/communication_logs",
                data=log_data
            )
            
            if result and isinstance(result, list) and len(result) > 0:
                log_ids.append(result[0].get("id"))
        
        if not log_ids:
            return {
                "success": False,
                "message": "Failed to send message to any channel due to missing contact information",
                "log_id": None,
                "scheduled_time": request.scheduled_time if is_scheduled else None
            }
        
        return {
            "success": True,
            "message": f"Message {'scheduled' if is_scheduled else 'sent'} successfully to {len(log_ids)} channel(s)",
            "log_id": log_ids[0] if len(log_ids) == 1 else None,  # Return first log ID if only one channel
            "scheduled_time": request.scheduled_time if is_scheduled else None
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}") from e

@router.post("/communication/schedule-reminder", response_model=CommunicationResponse)
def schedule_client_reminder(request: ReminderRequest):
    """Schedule a reminder for a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id,name,email,phone",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        client_data = client_check[0]
        client_name = client_data.get("name", "Client")
        
        # Create reminder content if not provided
        if not request.custom_message:
            # Default reminder messages by type
            default_messages = {
                ReminderType.WORKOUT: f"Hi {client_name}, don't forget your scheduled workout today!",
                ReminderType.NUTRITION: f"Hi {client_name}, this is your reminder to stick to your nutrition plan today.",
                ReminderType.CHECK_IN: f"Hi {client_name}, it's time for your regular check-in. Please log your progress in the app.",
                ReminderType.MEASUREMENT: f"Hi {client_name}, please remember to log your measurements today.",
                ReminderType.APPOINTMENT: f"Hi {client_name}, this is a reminder about your upcoming appointment.",
                ReminderType.HYDRATION: f"Hi {client_name}, don't forget to stay hydrated today!",
                ReminderType.SUPPLEMENT: f"Hi {client_name}, this is your reminder to take your scheduled supplements.",
                ReminderType.CUSTOM: f"Hi {client_name}, this is your custom reminder."
            }
            content = default_messages.get(request.reminder_type, default_messages[ReminderType.CUSTOM])
        else:
            content = request.custom_message
        
        # Validate reminder date is in the future
        if request.date <= datetime.now():
            raise HTTPException(status_code=400, detail="Reminder date must be in the future")
        
        # Create communication logs for each channel
        log_ids = []
        for channel in request.channels:
            log_data = {
                "client_id": request.client_id,
                "timestamp": request.date.isoformat(),
                "type": f"reminder:{request.reminder_type}",
                "channel": channel,
                "content": content,
                "status": CommunicationStatus.SCHEDULED,
                "metadata": {
                    "reminder_type": request.reminder_type,
                    "repeat": request.repeat
                }
            }
            
            result = supabase_request(
                "POST", 
                "/rest/v1/communication_logs",
                data=log_data
            )
            
            if result and isinstance(result, list) and len(result) > 0:
                log_ids.append(result[0].get("id"))
        
        if not log_ids:
            return {
                "success": False,
                "message": "Failed to schedule reminder",
                "log_id": None,
                "scheduled_time": request.date
            }
        
        return {
            "success": True,
            "message": f"Reminder scheduled successfully for {request.date.isoformat()} on {len(log_ids)} channel(s)",
            "log_id": log_ids[0] if len(log_ids) == 1 else None,
            "scheduled_time": request.date
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error scheduling reminder: {str(e)}") from e

@router.get("/communication/history/{client_id}", response_model=CommunicationHistoryResponse)
def get_communication_history(
    client_id: str = Path(..., description="The ID of the client"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip")
):
    """Get the communication history for a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Build filters
        filters = [f"client_id=eq.{client_id}"]
        filter_str = "&".join(filters)
        
        # Get count first
        count_path = f"/rest/v1/communication_logs?{filter_str}&select=count"
        count_result = supabase_request("GET", count_path)
        total = count_result[0].get("count", 0) if count_result and len(count_result) > 0 else 0
        
        # Get logs
        path = f"/rest/v1/communication_logs?{filter_str}"
        params = {
            "select": "*",
            "order": "timestamp.desc",
            "limit": limit,
            "offset": offset
        }
        
        result = supabase_request("GET", path, params=params)
        
        return {
            "logs": result,
            "total": total
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving communication history: {str(e)}") from e
