# 🤖 Claude Desktop Integration Guide

This guide explains how to set up and use NEXUS-CORE with Claude Desktop through the MCP (Model Context Protocol) integration.

## 📋 Overview

The MCP integration allows you to interact with NEXUS-CORE data using natural language through Claude Desktop. You can:

- Search and manage clients
- View progress and analytics
- Generate reports
- Create training programs
- Get AI-powered insights

## 🛠️ Prerequisites

1. **NEXUS-CORE** running locally or on a server
2. **Claude Desktop** installed on your computer
3. **MCP Server** enabled in NEXUS-CORE

## 🚀 Setup Instructions

### Step 1: Enable MCP in NEXUS-CORE

Ensure your backend is running with MCP enabled:

```bash
# Check MCP status
curl http://localhost:8000/routes/mcp/agent/status

# Response should show:
{
  "status": "operational",
  "agents": ["NEXUS", "BLAZE", "SAGE", ...],
  "mcp_enabled": true
}
```

### Step 2: Configure Claude Desktop

1. Open Claude Desktop
2. Go to **Settings** → **Connections**
3. Click **Add Connection**
4. Enter the following details:

| Field | Value |
|-------|-------|
| Name | NEXUS-CORE |
| Type | MCP Server |
| URL | `http://localhost:8000/routes/mcp` |
| API Key | Your API key (if auth enabled) |

### Step 3: Activate MCP Connection

```bash
# Activate MCP for your instance
curl -X POST http://localhost:8000/routes/mcp/activate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Claude Desktop",
    "client_id": "your-client-id"
  }'
```

### Step 4: Test the Connection

In Claude Desktop, try these commands:

```
"Show me all active PRIME clients"
"What's the adherence rate for Sarah Johnson?"
"Generate a strength program for client abc123"
```

## 💬 Natural Language Commands

### Client Management

| Intent | Example Commands |
|--------|-----------------|
| Search clients | "Find all LONGEVITY clients", "Show clients who joined last month" |
| View client details | "Tell me about John Smith", "Show details for client abc123" |
| Create clients | "Add a new PRIME client named Jane Doe" |
| Update clients | "Update Sarah's email to sarah@example.com" |

### Progress Tracking

| Intent | Example Commands |
|--------|-----------------|
| View progress | "Show John's weight progress over the last 3 months" |
| Compare periods | "Compare this month's adherence to last month" |
| Log measurements | "Log today's weight as 185 lbs for client abc123" |
| View summaries | "What's the average body fat loss for PRIME clients?" |

### Program Management

| Intent | Example Commands |
|--------|-----------------|
| View programs | "Show all active training programs" |
| Assign programs | "Assign the Hypertrophy Block 2 to Michael" |
| Create programs | "Create a 12-week strength program for beginners" |
| Modify programs | "Add an extra rest day to Sarah's program" |

### Analytics & Insights

| Intent | Example Commands |
|--------|-----------------|
| Adherence metrics | "What's the overall adherence rate this quarter?" |
| Program effectiveness | "How effective is the PRIME Strength program?" |
| Business metrics | "Show revenue by program type" |
| Predictions | "Predict John's progress for the next month" |

### Report Generation

| Intent | Example Commands |
|--------|-----------------|
| Client reports | "Generate a quarterly report for Sarah Johnson" |
| Program reports | "Create an effectiveness report for all LONGEVITY programs" |
| Business reports | "Generate a monthly business summary" |

## 🔧 Advanced Features

### Using Context

Claude remembers context within a conversation:

```
You: "Show me all PRIME clients"
Claude: [Lists PRIME clients]
You: "Which ones have the best adherence?"
Claude: [Filters previous results by adherence]
```

### Complex Queries

Combine multiple criteria:

```
"Find all PRIME clients who joined in the last 3 months, 
have over 80% adherence, and are currently on a strength program"
```

### Batch Operations

Perform actions on multiple items:

```
"Send reminder emails to all clients with sessions tomorrow"
"Update all LONGEVITY programs to include meditation"
```

## 📊 MCP Response Format

Claude provides structured responses with:

1. **Direct Answer**: The main response to your query
2. **Additional Context**: Relevant insights or warnings
3. **Suggested Actions**: Follow-up questions or actions
4. **Data Summary**: Key metrics or statistics

Example response:
```
I found 3 PRIME clients matching your criteria:

1. **John Smith** (ID: abc123)
   - Adherence: 92%
   - Current Program: Strength Phase 2
   - Next Session: Tomorrow at 6 AM

2. **Sarah Johnson** (ID: def456)
   - Adherence: 88%
   - Current Program: Hypertrophy Block
   - Next Session: Today at 5 PM

3. **Michael Chen** (ID: ghi789)
   - Adherence: 95%
   - Current Program: Power Development
   - Next Session: Thursday at 7 AM

📊 **Summary**: Average adherence is 91.7%, which is excellent!

**Suggested follow-ups:**
- View detailed progress for any client
- Check program effectiveness metrics
- Schedule check-ins with clients
```

## 🔐 Security & Permissions

### Authentication Levels

| Level | Access | Use Case |
|-------|--------|----------|
| Public | Read-only public data | General queries |
| User | Own client data | Client self-service |
| Coach | Assigned clients | Coach operations |
| Admin | All data | Full system access |

### Best Practices

1. **Use specific queries** to minimize data exposure
2. **Verify sensitive actions** before confirming
3. **Log out** when finished
4. **Rotate API keys** regularly

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | Ensure NEXUS-CORE backend is running |
| "Unauthorized" | Check API key configuration |
| "No data found" | Verify you have access to requested data |
| "Timeout error" | Check network connection and server status |

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# In Claude Desktop settings
Debug Mode: ON
Log Level: VERBOSE

# View logs at:
~/Library/Logs/Claude Desktop/mcp.log  # macOS
%APPDATA%\Claude Desktop\Logs\mcp.log  # Windows
```

## 📚 Best Practices

### Effective Queries

✅ **Do:**
- Be specific about what you want
- Include relevant context
- Use client names or IDs when known
- Ask for clarification if needed

❌ **Don't:**
- Use vague requests like "show everything"
- Include sensitive information in queries
- Assume Claude knows previous sessions

### Performance Tips

1. **Use filters** to limit result sets
2. **Request summaries** instead of full data
3. **Cache frequent queries** mentally
4. **Batch related requests** together

## 🎯 Use Cases

### For Coaches

```
Morning Routine:
1. "Show me today's scheduled sessions"
2. "Which clients haven't checked in this week?"
3. "Generate today's workout reminders"
```

### For Administrators

```
Weekly Review:
1. "Show me this week's business metrics"
2. "Which programs have the highest satisfaction?"
3. "List clients with expiring memberships"
```

### For Analysts

```
Monthly Analysis:
1. "Compare PRIME vs LONGEVITY adherence rates"
2. "What factors correlate with high adherence?"
3. "Project next quarter's growth"
```

## 🔄 Updates & Maintenance

The MCP integration is continuously improved. To get the latest features:

1. Update NEXUS-CORE to the latest version
2. Update Claude Desktop when prompted
3. Check the [changelog](../CHANGELOG.md) for new commands

---

<div align="center">
  <strong>Need help with Claude Desktop?</strong><br>
  Contact: mcp-support@ngxperformance.com
</div>