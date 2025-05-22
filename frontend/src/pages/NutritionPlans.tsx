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

interface NutritionPlan {
  id: string;
  name: string;
  type: string;
  description: string;
  duration_weeks: number;
  target_goals: string[];
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meal_structure: any[];
  created_at: string;
}

export default function NutritionPlans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string>(typeFromUrl || "");
  const [limit, setLimit] = useState<number>(20);

  const fetchNutritionTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: { plan_type?: string; limit?: number } = {};
      if (planType) params.plan_type = planType;
      if (limit) params.limit = limit;

      const response = await brain.get_nutrition_templates(params);
      const data = await response.json();
      setPlans(data.templates || []);
    } catch (err) {
      console.error("Error fetching nutrition templates:", err);
      setError("Failed to load nutrition plans. Please try again.");
      toast.error("Failed to load nutrition plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionTemplates();
  }, [planType, limit]);

  const handleViewPlan = (planId: string) => {
    navigate(`/nutrition-plan/${planId}`);
  };

  const handleFilterChange = (value: string) => {
    setPlanType(value);
  };

  const getGoalBadge = (goal: string) => {
    switch (goal.toLowerCase()) {
      case "weight loss":
      case "fat loss":
        return "bg-green-500 hover:bg-green-600";
      case "muscle gain":
      case "strength":
        return "bg-blue-500 hover:bg-blue-600";
      case "maintenance":
      case "health":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "performance":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Layout>
      <Header
        title="Nutrition Plans"
        subtitle="Manage and assign nutrition plans for your clients"
        accentColor={typeFromUrl?.toLowerCase() as "prime" | "longevity" | undefined}
        actions={
          <div className="flex gap-2">
            <BackButton fallbackPath="/" />
            <Button
              onClick={() => navigate("/create-nutrition-plan")}
              className="font-mono text-sm"
            >
              Create Plan
            </Button>
          </div>
        }
      />

      <Card className="border-2 border-border overflow-hidden mb-6">
        <CardHeader className="p-4 pb-2 border-b-2 border-border">
          <CardTitle className="text-lg font-mono tracking-tight">
            Nutrition Templates
          </CardTitle>
          <CardDescription>
            View and manage your nutrition plan templates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-5">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Select value={planType} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-plans">All Plans</SelectItem>
                  <SelectItem value="PRIME">PRIME</SelectItem>
                  <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchNutritionTemplates()}
              className="sm:w-auto"
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading plans...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchNutritionTemplates} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No nutrition plans found
              </p>
              <Button
                onClick={() => navigate("/create-nutrition-plan")}
                className="mt-4"
              >
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Goals</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Macros (P/C/F)</TableHead>
                    <TableHead aria-label="Actions"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            plan.type === "PRIME"
                              ? "text-blue-500 border-blue-500"
                              : "text-purple-500 border-purple-500"
                          }
                        >
                          {plan.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {plan.target_goals.slice(0, 2).map((goal, index) => (
                            <Badge key={index} className={getGoalBadge(goal)}>
                              {goal}
                            </Badge>
                          ))}
                          {plan.target_goals.length > 2 && (
                            <Badge variant="outline">
                              +{plan.target_goals.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{plan.duration_weeks} weeks</TableCell>
                      <TableCell>
                        {plan.macros.protein}P/{plan.macros.carbs}C/{plan.macros.fat}F
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => handleViewPlan(plan.id)}
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
