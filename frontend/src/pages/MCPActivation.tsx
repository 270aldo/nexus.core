import React from "react";
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { MCPActivator } from "components/MCPActivator";
import { MCPStatus } from "components/MCPStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EndpointCardProps {
  title: string;
  description: string;
  endpoints: string[];
}

function EndpointCard({ title, description, endpoints }: EndpointCardProps) {
  return (
    <Card className="border border-border hover:border-primary/30 transition-colors">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mt-2">
          {endpoints.map((endpoint, index) => (
            <Badge key={index} variant="outline" className="mr-1 mb-1 font-mono text-xs">
              {endpoint}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MCPActivation() {
  return (
    <Layout>
      <Header 
        title="MCP Activation" 
        subtitle="Activate Model Context Protocol for Claude Desktop"
      />
      
      <div className="container mx-auto py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Claude Desktop Integration</h1>
          <p className="text-muted-foreground">
            Activate and configure your Claude Desktop integration with NGX Performance & Longevity
          </p>
        </div>
        
        <MCPStatus />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          <div className="md:col-span-8">
            <MCPActivator />
          </div>
          
          <div className="md:col-span-4">
            <div className="bg-card/30 backdrop-blur-sm border border-primary/20 p-6 rounded-md">
              <h2 className="text-xl font-bold mb-4">What is MCP?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models like Claude.
              </p>
              
              <h3 className="text-md font-semibold mb-2">Benefits:</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mb-4">
                <li>Access NGX data directly from Claude Desktop</li>
                <li>Generate reports and analyses with natural language</li>
                <li>Get personalized recommendations for clients</li>
                <li>Perform complex queries without SQL knowledge</li>
              </ul>
              
              <h3 className="text-md font-semibold mb-2">Security:</h3>
              <p className="text-sm text-muted-foreground">
                Your unique authentication token ensures only you can access your data through Claude Desktop.
              </p>
            </div>
          </div>
        </div>
        
        <Card className="border-2 border-border overflow-hidden mb-6">
          <CardHeader className="p-4 pb-2 border-b-2 border-border">
            <CardTitle className="text-lg font-mono tracking-tight">
              Available MCP Endpoints
            </CardTitle>
            <CardDescription>
              These endpoints are available for interaction through Claude Desktop
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EndpointCard 
                title="Client Management"
                description="Search, view, add and update client information"
                endpoints={[
                  "get_client_by_id",
                  "search_clients",
                  "add_client",
                  "update_client"
                ]}
              />
              
              <EndpointCard 
                title="Training Management"
                description="Manage training programs and client assignments"
                endpoints={[
                  "get_training_templates",
                  "get_client_active_program",
                  "assign_program_to_client",
                  "update_client_program"
                ]}
              />
              
              <EndpointCard 
                title="Progress Tracking"
                description="Log and analyze client progress metrics"
                endpoints={[
                  "log_measurement",
                  "log_workout",
                  "log_subjective_feedback",
                  "get_progress_history"
                ]}
              />
              
              <EndpointCard 
                title="Communication"
                description="Client communication and reminder management"
                endpoints={[
                  "send_templated_message",
                  "schedule_client_reminder",
                  "get_communication_history"
                ]}
              />
              
              <EndpointCard 
                title="Analytics"
                description="Generate insights and business metrics"
                endpoints={[
                  "get_client_adherence_metrics",
                  "get_program_effectiveness",
                  "generate_business_metrics"
                ]}
              />
              
              <EndpointCard 
                title="AI Agent System"
                description="AI-powered analysis and content generation"
                endpoints={[
                  "get_agent_system_status",
                  "run_agent_analysis",
                  "generate_client_report",
                  "translate_program_to_natural_language"
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
