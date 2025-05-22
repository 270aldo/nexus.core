import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { BackButton } from "components/BackButton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import brain from "brain";

interface TrainingProgram {
  id: string;
  name: string;
  type: string;
  description: string;
  duration_weeks: number;
  target_level: string;
  phases: any[];
  created_at: string;
}

export default function TrainingPrograms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  
  // Determine variant and title based on program type
  const pageVariant = typeFromUrl?.toUpperCase() === "PRIME" ? "prime" : 
                      typeFromUrl?.toUpperCase() === "LONGEVITY" ? "longevity" : "neutral";
  const pageTitle = typeFromUrl ? `${typeFromUrl.toUpperCase()} Training Programs` : "Training Programs";
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programType, setProgramType] = useState<string>(typeFromUrl || "");
  const [limit, setLimit] = useState<number>(20);

  const fetchTrainingTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: { program_type?: string; limit?: number } = {};
      // Only pass program_type if it's not the 'all' option
      if (programType && programType !== 'all-programs') {
        params.program_type = programType;
      }
      if (limit) params.limit = limit;

      const response = await brain.get_training_templates(params);
      const data = await response.json();
      
      // Check for database errors
      if (data?.error && data.error.includes("does not exist")) {
        setError("Database tables are not initialized. Please go to Database Setup.");
        toast.error("Database not initialized", {
          description: "Please go to Database Setup to create the required tables."
        });
        return;
      }
      
      setPrograms(data.templates || []);
    } catch (err) {
      console.error("Error fetching training templates:", err);
      setError("Failed to load training programs. Please try again.");
      toast.error("Failed to load training programs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingTemplates();
  }, [programType, limit]);

  const handleViewProgram = (programId: string) => {
    navigate(`/training-program/${programId}`);
  };

  const handleFilterChange = (value: string) => {
    setProgramType(value);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500 hover:bg-green-600";
      case "intermediate":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "advanced":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <Layout>
      <Header
        title="Training Programs"
        subtitle="Manage and assign training programs for your clients"
        accentColor={typeFromUrl?.toLowerCase() as "prime" | "longevity" | undefined}
        actions={
          <div className="flex gap-2">
            <BackButton fallbackPath="/" />
            <Button
              onClick={() => navigate("/create-training-program")}
              className="font-mono text-sm"
            >
              Create Program
            </Button>
          </div>
        }
      />

      <Card className="border-2 border-border overflow-hidden mb-6">
        <CardHeader className="p-4 pb-2 border-b-2 border-border">
          <CardTitle className="text-lg font-mono tracking-tight">
            Program Templates
          </CardTitle>
          <CardDescription>
            View and manage your training program templates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-5">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Select value={programType} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Program Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-programs">All Programs</SelectItem>
                  <SelectItem value="PRIME">PRIME</SelectItem>
                  <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchTrainingTemplates()}
              className="sm:w-auto"
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading programs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchTrainingTemplates} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No training programs found
              </p>
              <Button
                onClick={() => navigate("/training-program/new")}
                className="mt-4"
              >
                Create Your First Program
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Level</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead aria-label="Actions"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">
                        {program.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            program.type === "PRIME"
                              ? "text-blue-500 border-blue-500"
                              : "text-purple-500 border-purple-500"
                          }
                        >
                          {program.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadgeColor(program.target_level)}>
                          {program.target_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{program.duration_weeks} weeks</TableCell>
                      <TableCell>
                        {new Date(program.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => handleViewProgram(program.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
