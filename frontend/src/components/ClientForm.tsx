import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Client, ClientCreateRequest, ClientUpdateRequest } from "../utils/client-types";
import { useClientStore } from "../utils/client-store";

// Form validation schema
const clientFormSchema = z.object({
  type: z.enum(["PRIME", "LONGEVITY"]),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  status: z.enum(["active", "paused", "inactive"]).default("active"),
  payment_status: z.string().optional(),
  goals: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client; // If provided, we're editing an existing client
  isEdit?: boolean;
  initialType?: 'PRIME' | 'LONGEVITY';
}

export function ClientForm({ client, isEdit = false, initialType = 'PRIME' }: ClientFormProps) {
  const navigate = useNavigate();
  const { createClient, updateClient, isLoading } = useClientStore();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Initialize form with default values or existing client data
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: isEdit && client
      ? {
          type: client.type,
          name: client.name,
          email: client.email,
          phone: client.phone || "",
          birth_date: client.birth_date || "",
          status: client.status,
          payment_status: client.payment_status || "",
          goals: client.goals ? client.goals.join(", ") : "",
        }
      : {
          type: initialType,
          name: "",
          email: "",
          phone: "",
          birth_date: "",
          status: "active",
          payment_status: "",
          goals: "",
        },
  });

  // Handle form submission
  const onSubmit = async (values: ClientFormValues) => {
    setSubmissionError(null);
    
    try {
      // Process goals into array
      const goals = values.goals
        ? values.goals.split(",").map(goal => goal.trim()).filter(goal => goal)
        : undefined;
      
      // Prepare client data
      const clientData = {
        ...values,
        goals,
      };
      
      // Create or update client
      if (isEdit && client) {
        const result = await updateClient(client.id, clientData as ClientUpdateRequest);
        if (result) {
          navigate(`/client-detail?id=${result.id}`);
        }
      } else {
        const result = await createClient(clientData as ClientCreateRequest);
        if (result) {
          navigate(`/client-detail?id=${result.id}`);
        }
      }
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="font-mono text-lg tracking-tight">{isEdit ? "Edit Client" : "Add New Client"}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {isEdit 
            ? "Update the client's information below" 
            : "Fill out the form below to add a new client"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {submissionError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {submissionError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRIME">PRIME</SelectItem>
                        <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <FormControl>
                      <Input placeholder="Paid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Weight loss, Muscle gain, Better sleep (comma separated)"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit && client ? `/client-detail?id=${client.id}` : "/clients?type=" + form.getValues().type)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEdit ? "Update Client" : "Add Client"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
