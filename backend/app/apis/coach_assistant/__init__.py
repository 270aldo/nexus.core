from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import json

# Estos serían los imports reales en producción
# import databutton as db
# from openai import OpenAI

router = APIRouter(tags=["coach_assistant"])

# ======== Models ========
class AssistantMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user or assistant)")
    content: str = Field(..., description="Content of the message")
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str = Field(..., description="Message from the coach")
    client_id: Optional[str] = Field(None, description="ID of the client being discussed, if any")
    program_id: Optional[str] = Field(None, description="ID of the program being discussed, if any")
    conversation_history: Optional[List[AssistantMessage]] = Field([], description="Previous messages in the conversation")
    context_data: Optional[Dict[str, Any]] = Field(None, description="Additional context data for the assistant")

class ChatResponse(BaseModel):
    message: str = Field(..., description="Response from the assistant")
    suggested_actions: Optional[List[str]] = Field(None, description="Suggested actions the coach might take")
    references: Optional[List[Dict[str, str]]] = Field(None, description="References to relevant data or documentation")

@router.post("/chat")
def coach_assistant_chat(request: ChatRequest) -> Dict[str, Any]:
    """Chat with the coach assistant to get AI-powered recommendations and analysis"""
    try:
        # Get context data based on client_id and program_id if provided
        context = {}
        
        if request.client_id:
            # En producción, obtendríamos datos reales del cliente
            context["client"] = {
                "id": request.client_id,
                "name": "John Doe",
                "type": "PRIME",
                "active_program": "Hypertrophy Block 2",
                "adherence": 0.85,
                "progress": {
                    "strength": 0.12,
                    "body_composition": 0.08
                }
            }
        
        if request.program_id:
            # En producción, obtendríamos datos reales del programa
            context["program"] = {
                "id": request.program_id,
                "name": "Hypertrophy Block 2",
                "type": "PRIME",
                "effectiveness": 0.92,
                "adherence_rate": 0.85
            }
            
        # Merge with any additional context provided
        if request.context_data:
            context.update(request.context_data)
            
        # Prepare conversation for Claude
        conversation = []
        
        # Add system message with context
        system_message = (
            "You are NGX Assistant, an expert AI coach specializing in performance and longevity programs. "
            "Your role is to help coaches analyze client data, design effective programs, and make evidence-based recommendations. "
            "Be concise but comprehensive, focused on actionable insights, and always consider the specific goals of PRIME (performance) "
            "and LONGEVITY programs. Respond in a professional tone suitable for elite coaching staff.\n\n"
        )
        
        # Add context information if available
        if context:
            system_message += f"Context information: {json.dumps(context, indent=2)}\n\n"
            
        # Format the conversation history
        for msg in request.conversation_history:
            conversation.append({"role": msg.role, "content": msg.content})
            
        # Add the current message
        conversation.append({"role": "user", "content": request.message})
        
        # In a real implementation, we would call Claude API here
        # client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))
        # response = client.chat.completions.create(
        #    model="gpt-4o",
        #    messages=[{"role": "system", "content": system_message}] + conversation
        # )
        # assistant_response = response.choices[0].message.content
        
        # Mock response for demo
        assistant_response = generate_mock_response(request.message, context)
        
        # Extract suggested actions (in production this would be more sophisticated)
        suggested_actions = extract_suggested_actions(assistant_response)
        
        # Return formatted response
        return {
            "success": True,
            "data": {
                "message": assistant_response,
                "suggested_actions": suggested_actions,
                "references": get_relevant_references(request.message, context)
            },
            "meta": {
                "client_id": request.client_id,
                "program_id": request.program_id,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in coach assistant chat: {str(e)}")

@router.get("/suggested-prompts")
def get_suggested_prompts(client_id: Optional[str] = None, program_id: Optional[str] = None) -> Dict[str, Any]:
    """Get suggested prompts for the coach assistant based on client and program context"""
    try:
        # Base suggestions always available
        suggestions = [
            "How can I improve adherence for this client?",
            "What are the key metrics I should focus on for this program?",
            "Suggest modifications to this program based on recent progress",
            "Compare this client's progress to similar clients",
            "Generate a progress report for my next client meeting"
        ]
        
        # Add client-specific suggestions
        if client_id:
            # In production, these would be personalized based on actual client data
            client_suggestions = [
                f"Why has this client's progress plateaued in the last 2 weeks?",
                f"What nutrition adjustments would benefit this client's current goals?",
                f"Generate talking points for my next session with this client"
            ]
            suggestions.extend(client_suggestions)
            
        # Add program-specific suggestions
        if program_id:
            # In production, these would be personalized based on actual program data
            program_suggestions = [
                f"How does this program compare to other PRIME programs in effectiveness?",
                f"What modifications should I make to this program for better strength gains?",
                f"How can I adjust this program for a client with limited equipment?"
            ]
            suggestions.extend(program_suggestions)
            
        return {
            "success": True,
            "data": {
                "suggested_prompts": suggestions
            },
            "meta": {
                "client_id": client_id,
                "program_id": program_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggested prompts: {str(e)}")

# ======== Helper Functions ========

def generate_mock_response(message: str, context: Dict[str, Any]) -> str:
    """Generate a mock response for demo purposes"""
    if "adherence" in message.lower():
        return (
            "Based on the client's data, their adherence is currently at 85%, which is good but has room for improvement. "
            "The main adherence issues appear to be with weekend workouts and nutrition compliance on social occasions. "
            "I recommend implementing a flexible weekend schedule option and providing specific strategies for dining out situations. "
            "Also consider setting up automated check-ins on Friday afternoons as reminders."
        )
    elif "program" in message.lower() and "modify" in message.lower():
        return (
            "Looking at the current Hypertrophy Block 2 program and the client's progress metrics, I recommend: \
"
            "1. Increasing the volume on posterior chain exercises as these show slower progression\n"
            "2. Adding one unilateral exercise per session to address the slight strength imbalance\n"
            "3. Adjusting recovery protocols to include more active recovery techniques\n\n"
            "These modifications maintain the program's hypertrophy focus while addressing the specific needs identified in the progress data."
        )
    elif "compare" in message.lower():
        return (
            "Compared to similar clients on PRIME programs, this client is progressing 15% faster in strength metrics "
            "but 10% slower in body composition changes. Their adherence is above average (85% vs. the typical 78%). "
            "The standout difference is their consistency with training frequency, which correlates with their excellent strength gains. "
            "The area for improvement is their nutrition compliance, which explains the slower body composition changes."
        )
    elif "report" in message.lower():
        return (
            "# Client Progress Report\n\n"
            "## Key Achievements\n"
            "- Bench press increased from 90kg to 102kg (13.3% improvement)\n"
            "- Body fat reduced from 22% to 18% (4 percentage points)\n"
            "- Workout adherence consistent at 87%\n\n"
            "## Areas for Focus\n"
            "- Nutrition compliance currently at 78%, below target\n"
            "- Recovery metrics showing signs of accumulated fatigue\n"
            "- Posterior chain development lagging relative to program goals\n\n"
            "## Recommended Adjustments\n"
            "- Simplify nutrition plan to improve compliance\n"
            "- Add targeted recovery protocols for next 2 weeks\n"
            "- Increase posterior chain volume by 20%\n\n"
            "This report is based on data from the past 8 weeks of training."
        )
    else:
        return (
            "I understand you're asking about general program optimization. Based on the context provided, "
            "I recommend focusing on three key areas: training frequency, recovery quality, and nutrition compliance. "
            "The data shows these factors have the highest correlation with successful outcomes in PRIME programs. "
            "Would you like more specific recommendations for any of these areas?"
        )

def extract_suggested_actions(response: str) -> List[str]:
    """Extract suggested actions from the assistant response"""
    # In production, this would use more sophisticated NLP
    # For now, we'll use a simple approach based on the mock responses
    
    actions = []
    
    if "adherence" in response.lower():
        actions.append("Schedule automated weekend check-ins")
        actions.append("Update nutrition guidelines for social situations")
        
    if "program" in response.lower() and any(x in response.lower() for x in ["modify", "adjustment", "change", "increase"]):
        actions.append("Adjust program in Training Management module")
        actions.append("Schedule follow-up assessment in 2 weeks")
        
    if "nutrition" in response.lower():
        actions.append("Review nutrition plan in Nutrition Management module")
        
    if "recovery" in response.lower():
        actions.append("Update recovery protocols")
        
    # Always provide at least one generic action if none were identified
    if not actions:
        actions.append("Log this conversation in client notes")
        actions.append("Schedule follow-up assessment")
        
    return actions

def get_relevant_references(message: str, context: Dict[str, Any]) -> List[Dict[str, str]]:
    """Get relevant references based on the message and context"""
    references = []
    
    # Add references based on message content
    if "adherence" in message.lower():
        references.append({
            "title": "Adherence Improvement Strategies",
            "url": "/resources/adherence-strategies",
            "type": "document"
        })
        
    if "program" in message.lower() and "modify" in message.lower():
        references.append({
            "title": "Program Modification Guidelines",
            "url": "/resources/program-modification",
            "type": "document"
        })
        
    if "nutrition" in message.lower():
        references.append({
            "title": "Nutrition Planning Guide",
            "url": "/resources/nutrition-planning",
            "type": "document"
        })
        
    if context.get("client"):
        references.append({
            "title": f"Client Profile: {context['client'].get('name', 'Unknown')}",
            "url": f"/clients/{context['client'].get('id')}",
            "type": "client_profile"
        })
        
    if context.get("program"):
        references.append({
            "title": f"Program Details: {context['program'].get('name', 'Unknown')}",
            "url": f"/programs/{context['program'].get('id')}",
            "type": "program"
        })
        
    return references
