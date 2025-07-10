import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Header } from "../components/Header";
import { RichTextEditor } from "../components/ClientNotes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as ds from "utils/design-system";
import { toast } from "sonner";
import { Edit, Plus, Trash, Copy, ExternalLink } from "lucide-react";


interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  program_type: "PRIME" | "LONGEVITY";
  template_type: "email" | "sms" | "notification";
  variables: string[];
  created_at: string;
  updated_at: string;
}

const emptyTemplate: Partial<MessageTemplate> = {
  name: "",
  description: "",
  subject: "",
  body: "",
  program_type: "PRIME",
  template_type: "email",
  variables: ["{{client_name}}", "{{program_name}}", "{{date}}"],
};

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<MessageTemplate>>(emptyTemplate);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState("");

  // For demonstration, this would normally come from an API
  const sampleTemplates = [
    {
      id: "1",
      name: "Welcome Message",
      description: "Sent to new clients upon registration",
      subject: "Welcome to NGX Performance & Longevity!",
      body: "<h1>Welcome, {{client_name}}!</h1><p>We're excited to have you join the NGX {{program_type}} program. Your journey starts on {{date}}.</p><p>Your assigned program is <strong>{{program_name}}</strong>. Please review it and let us know if you have any questions.</p>",
      program_type: "PRIME",
      template_type: "email",
      variables: ["{{client_name}}", "{{program_type}}", "{{date}}", "{{program_name}}"],
      created_at: "2023-01-01T12:00:00Z",
      updated_at: "2023-01-01T12:00:00Z",
    },
    {
      id: "2",
      name: "Program Update Notification",
      description: "Notification when a client's program is updated",
      subject: "Your NGX Program Has Been Updated",
      body: "<h2>Program Update</h2><p>Hello {{client_name}},</p><p>Your {{program_type}} program has been updated. Please review the changes and reach out if you have any questions.</p>",
      program_type: "LONGEVITY",
      template_type: "notification",
      variables: ["{{client_name}}", "{{program_type}}"],
      created_at: "2023-02-15T10:30:00Z",
      updated_at: "2023-03-01T14:22:00Z",
    },
    {
      id: "3",
      name: "Reminder: Log Your Workout",
      description: "SMS reminder to log workouts",
      subject: "Reminder: Log Your Workout",
      body: "Hi {{client_name}}! Don't forget to log your {{workout_type}} workout from today. Consistent tracking leads to better results!",
      program_type: "PRIME",
      template_type: "sms",
      variables: ["{{client_name}}", "{{workout_type}}"],
      created_at: "2023-03-10T09:15:00Z",
      updated_at: "2023-03-10T09:15:00Z",
    },
  ];

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTemplates(sampleTemplates as MessageTemplate[]);
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // This would be a real API call in production
      // const response = await brain.get_message_templates();
      // const data = await response.json();
      // setTemplates(data.templates);
      
      // For now, using static sample data
      setTemplates(sampleTemplates as MessageTemplate[]);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load message templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setCurrentTemplate(emptyTemplate);
    setIsCreating(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        // In a real app, this would delete via an API
        // await brain.delete_message_template({ template_id: templateId });
        setTemplates(templates.filter(t => t.id !== templateId));
        toast.success("Template deleted successfully");
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      }
    }
  };

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const duplicate = {
      ...template,
      id: `new-${Date.now()}`,
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setTemplates([...templates, duplicate]);
    toast.success("Template duplicated. You can now edit the copy.");
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate.name || !currentTemplate.body) {
      toast.error("Template name and body are required");
      return;
    }

    try {
      if (isCreating) {
        // In a real app, this would create via an API
        // const response = await brain.create_message_template(currentTemplate);
        // const newTemplate = await response.json();
        
        // Mock API response with generated ID
        const newTemplate = {
          ...currentTemplate,
          id: `new-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as MessageTemplate;
        
        setTemplates([...templates, newTemplate]);
        toast.success("Template created successfully");
      } else if (isEditing && currentTemplate.id) {
        // In a real app, this would update via an API
        // const response = await brain.update_message_template({
        //   template_id: currentTemplate.id,
        //   ...currentTemplate
        // });
        // const updatedTemplate = await response.json();
        
        // Mock API update
        const updatedTemplates = templates.map(t => 
          t.id === currentTemplate.id ? { ...currentTemplate, updated_at: new Date().toISOString() } as MessageTemplate : t
        );
        setTemplates(updatedTemplates);
        toast.success("Template updated successfully");
      }
      
      setIsCreating(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handlePreviewTemplate = (template: MessageTemplate) => {
    // Initialize default preview data based on template variables
    const initialPreviewData: Record<string, string> = {};
    template.variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      
      // Set some reasonable defaults for common variables
      if (key === 'client_name') initialPreviewData[key] = 'John Doe';
      else if (key === 'program_name') initialPreviewData[key] = 'Advanced Strength Program';
      else if (key === 'program_type') initialPreviewData[key] = template.program_type;
      else if (key === 'date') initialPreviewData[key] = new Date().toLocaleDateString();
      else if (key === 'workout_type') initialPreviewData[key] = 'Strength';
      else initialPreviewData[key] = `[${key}]`;
    });
    
    setPreviewData(initialPreviewData);
    setCurrentTemplate(template);
    generatePreview(template.body, initialPreviewData);
    setIsPreviewOpen(true);
  };

  const generatePreview = (body: string, data: Record<string, string>) => {
    let result = body;
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\{\{${key}\}\}`, 'g'), value);
    });
    setPreviewResult(result);
  };

  const handleUpdatePreviewData = (key: string, value: string) => {
    const newData = { ...previewData, [key]: value };
    setPreviewData(newData);
    if (currentTemplate.body) {
      generatePreview(currentTemplate.body, newData);
    }
  };

  return (
    <Layout>
      <Header
        title="Message Templates"
        subtitle="Create and manage message templates for client communication"
        accentColor="neutral"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Templates</h2>
          <Button onClick={handleCreateTemplate} className={ds.colors.longevity.bg}>
            <Plus className="h-4 w-4 mr-2" /> Create Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className={`${ds.borders.card} overflow-hidden`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className={`${template.program_type === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}`}>
                      {template.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge template={template} />
                </div>
              </CardHeader>
              
              <CardContent className="py-2">
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Subject</h4>
                    <p className="text-sm truncate">{template.subject}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Variables</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((variable, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                    <Trash className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit/Create Template Dialog */}
      <Dialog open={isEditing || isCreating} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setIsCreating(false);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create New Template" : "Edit Template"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Create a new message template for client communications." : "Make changes to the selected template."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={currentTemplate.name || ""}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                  placeholder="e.g., Welcome Email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentTemplate.description || ""}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                  placeholder="What is this template used for?"
                  className="resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program_type">Program Type</Label>
                  <Select
                    value={currentTemplate.program_type}
                    onValueChange={(value) => setCurrentTemplate({...currentTemplate, program_type: value as "PRIME" | "LONGEVITY"})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIME">PRIME</SelectItem>
                      <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select
                    value={currentTemplate.template_type}
                    onValueChange={(value) => setCurrentTemplate({...currentTemplate, template_type: value as "email" | "sms" | "notification"})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={currentTemplate.subject || ""}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                  placeholder="e.g., Welcome to NGX Performance & Longevity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variables">Variables (comma separated)</Label>
                <Textarea
                  id="variables"
                  value={currentTemplate.variables?.join(", ") || ""}
                  onChange={(e) => setCurrentTemplate({
                    ...currentTemplate, 
                    variables: e.target.value.split(",").map(v => v.trim())
                  })}
                  placeholder="{{client_name}}, {{program_name}}, {{date}}"
                  className="resize-none h-20 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <div className="border rounded-md overflow-hidden">
                <RichTextEditor
                  initialContent={currentTemplate.body || ""}
                  onChange={(content) => setCurrentTemplate({...currentTemplate, body: content})}
                  programType={currentTemplate.program_type || "PRIME"}
                  placeholder="Enter your message template..."
                />
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Available Variables</h4>
                <div className="flex flex-wrap gap-1">
                  {currentTemplate.variables?.map((variable, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        // Copy variable to clipboard
                        navigator.clipboard.writeText(variable);
                        toast.success(`Copied ${variable} to clipboard`);
                      }}
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setIsCreating(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className={currentTemplate.program_type === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}>
              {isCreating ? "Create Template" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {currentTemplate.name}</DialogTitle>
            <DialogDescription>
              Preview how your template will appear to clients
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium">Preview Variables</h3>
              <div className="space-y-3">
                {Object.entries(previewData).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2 items-center">
                    <Label htmlFor={`preview-${key}`} className="font-mono text-xs">
                      {`{{${key}}}`}
                    </Label>
                    <Input
                      id={`preview-${key}`}
                      value={value}
                      onChange={(e) => handleUpdatePreviewData(key, e.target.value)}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Result Preview</h3>
              <Card className={`${ds.borders.card} overflow-hidden`}>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm">{currentTemplate.subject}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 border-t border-border">
                  <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: previewResult }} />
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function Badge({ template }: { template: MessageTemplate }) {
  const getBadgeClasses = () => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    // Type-specific styling
    let typeClasses = "";
    if (template.template_type === "email") {
      typeClasses = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    } else if (template.template_type === "sms") {
      typeClasses = "bg-green-500/10 text-green-500 border border-green-500/20";
    } else if (template.template_type === "notification") {
      typeClasses = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }
    
    return `${baseClasses} ${typeClasses}`;
  };
  
  return (
    <span className={getBadgeClasses()}>
      {template.template_type}
    </span>
  );
}
