/** ActivationRequest */
export interface ActivationRequest {
  /** Client Id */
  client_id?: string | null;
}

/** ActivityLogRequest */
export interface ActivityLogRequest {
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 10
   */
  limit?: number;
  /**
   * Offset
   * @min 0
   * @default 0
   */
  offset?: number;
  /** Entity Type */
  entity_type?: string | null;
  /** Entity Id */
  entity_id?: string | null;
  /** User Id */
  user_id?: string | null;
  /** Action */
  action?: string | null;
  /** From Date */
  from_date?: string | null;
  /** To Date */
  to_date?: string | null;
}

/** AddClientRequest */
export interface AddClientRequest {
  /**
   * Type
   * Client type: PRIME or LONGEVITY
   */
  type: string;
  /**
   * Name
   * Full name of the client
   */
  name: string;
  /**
   * Email
   * Email address of the client
   */
  email: string;
  /**
   * Phone
   * Phone number of the client
   */
  phone?: string | null;
  /**
   * Birth Date
   * Birth date in YYYY-MM-DD format
   */
  birth_date?: string | null;
  /**
   * Status
   * Client status: active, paused, inactive
   * @default "active"
   */
  status?: string | null;
  /**
   * Goals
   * List of client goals
   */
  goals?: string[] | null;
  /**
   * Payment Status
   * Payment status of the client
   */
  payment_status?: string | null;
}

/** AdherenceMetrics */
export interface AdherenceMetrics {
  /** Overall Adherence */
  overall_adherence: number;
  /** Training Adherence */
  training_adherence: number;
  /** Nutrition Adherence */
  nutrition_adherence: number;
  /** Measurement Adherence */
  measurement_adherence: number;
  /** Daily Breakdown */
  daily_breakdown?: Record<string, number> | null;
  /** Weekly Breakdown */
  weekly_breakdown?: Record<string, number> | null;
  /** Trend */
  trend?: number | null;
  /** Comparison To Average */
  comparison_to_average?: number | null;
}

/** AdherenceMetricsRequest */
export interface AdherenceMetricsRequest {
  /**
   * Client Id
   * The ID of the client to analyze
   */
  client_id: string;
  /**
   * Date Range
   * Date range in format {start_date: YYYY-MM-DD, end_date: YYYY-MM-DD}
   */
  date_range?: Record<string, string> | null;
  /**
   * Include Breakdowns
   * Include detailed breakdown by category
   * @default false
   */
  include_breakdowns?: boolean | null;
}

/** AgentAnalysisRequest */
export interface AgentAnalysisRequest {
  /**
   * Client Id
   * The ID of the client to analyze
   */
  client_id: string;
  /**
   * Analysis Type
   * Type of analysis to perform
   */
  analysis_type: string;
  /**
   * Parameters
   * Additional parameters for the analysis
   */
  parameters?: Record<string, any> | null;
}

/** AnalysisParameters */
export interface AnalysisParameters {
  /** Date Range */
  date_range?: Record<string, string> | null;
  /** Metrics */
  metrics?: string[] | null;
  /** Comparison Baseline */
  comparison_baseline?: string | null;
  /** Detail Level */
  detail_level?: number | null;
  /** Custom Parameters */
  custom_parameters?: Record<string, any> | null;
}

/** AnalysisRequest */
export interface AnalysisRequest {
  /** Client Id */
  client_id: string;
  analysis_type: AnalysisType;
  parameters?: AnalysisParameters | null;
}

/** AnalysisResult */
export interface AnalysisResult {
  /** Client Id */
  client_id: string;
  /** Analysis Type */
  analysis_type: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Summary */
  summary: string;
  /** Insights */
  insights: string[];
  /** Recommendations */
  recommendations: string[];
  /** Data Points */
  data_points?: Record<string, any> | null;
  /** Visualizations */
  visualizations?: Record<string, any>[] | null;
}

/** AnalysisType */
export enum AnalysisType {
  Progress = "progress",
  Adherence = "adherence",
  ProgramFit = "program_fit",
  NutritionCompliance = "nutrition_compliance",
  Recovery = "recovery",
  Performance = "performance",
}

/** AssignNutritionRequest */
export interface AssignNutritionRequest {
  /** Client Id */
  client_id: string;
  /** Plan Id */
  plan_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date?: string;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
}

/** AssignProgramRequest */
export interface AssignProgramRequest {
  /** Client Id */
  client_id: string;
  /** Program Id */
  program_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date?: string;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
}

/** AssistantMessage */
export interface AssistantMessage {
  /**
   * Role
   * Role of the message sender (user or assistant)
   */
  role: string;
  /**
   * Content
   * Content of the message
   */
  content: string;
  /** Timestamp */
  timestamp?: string | null;
}

/** BodyMeasurements */
export interface BodyMeasurements {
  /** Weight */
  weight?: number | null;
  /** Height */
  height?: number | null;
  /** Body Fat Percentage */
  body_fat_percentage?: number | null;
  /** Chest */
  chest?: number | null;
  /** Waist */
  waist?: number | null;
  /** Hips */
  hips?: number | null;
  /** Arms */
  arms?: Record<string, number> | null;
  /** Legs */
  legs?: Record<string, number> | null;
  /** Neck */
  neck?: number | null;
  /** Shoulders */
  shoulders?: number | null;
  /** Custom */
  custom?: Record<string, number> | null;
}

/** BusinessMetric */
export interface BusinessMetric {
  /** Name */
  name: string;
  /** Value */
  value: number;
  /** Previous Value */
  previous_value?: number | null;
  /** Change */
  change?: number | null;
  /** Change Percentage */
  change_percentage?: number | null;
  /** Breakdown */
  breakdown?: Record<string, number> | null;
  /** Trend */
  trend?: Record<string, any>[] | null;
}

/** ChatRequest */
export interface ChatRequest {
  /**
   * Message
   * Message from the coach
   */
  message: string;
  /**
   * Client Id
   * ID of the client being discussed, if any
   */
  client_id?: string | null;
  /**
   * Program Id
   * ID of the program being discussed, if any
   */
  program_id?: string | null;
  /**
   * Conversation History
   * Previous messages in the conversation
   * @default []
   */
  conversation_history?: AssistantMessage[] | null;
  /**
   * Context Data
   * Additional context data for the assistant
   */
  context_data?: Record<string, any> | null;
}

/** ClientAdherenceRequest */
export interface ClientAdherenceRequest {
  /** Client Id */
  client_id: string;
  date_range?: DateRangeInput | null;
}

/** ClientAdherenceResponse */
export interface ClientAdherenceResponse {
  /** Workout Adherence */
  workout_adherence: Record<string, any>;
  /** Nutrition Adherence */
  nutrition_adherence: Record<string, any>;
  /** Communication Response */
  communication_response: Record<string, any>;
  /** Overall Score */
  overall_score: number;
  /** Trend */
  trend?: string | null;
  /** Recommendations */
  recommendations: string[];
}

/** ClientCreate */
export interface ClientCreate {
  /** Type */
  type: string;
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Phone */
  phone?: string | null;
  /** Birth Date */
  birth_date?: string | null;
  /**
   * Status
   * @default "active"
   */
  status?: string | null;
  /** Goals */
  goals?: string[] | null;
  /** Payment Status */
  payment_status?: string | null;
}

/** ClientDetailsRequest */
export interface ClientDetailsRequest {
  /**
   * Client Id
   * The ID of the client to retrieve
   */
  client_id: string;
}

/** ClientNutrition */
export interface ClientNutrition {
  /** Id */
  id?: string | null;
  /** Client Id */
  client_id: string;
  /** Plan Id */
  plan_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /** End Date */
  end_date?: string | null;
  /**
   * Status
   * @default "active"
   */
  status?: string;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Adherence */
  adherence?: number | null;
  /** Notes */
  notes?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** ClientNutritionRequest */
export interface ClientNutritionRequest {
  /** Client Id */
  client_id: string;
}

/** ClientNutritionUpdate */
export interface ClientNutritionUpdate {
  /** Status */
  status?: string | null;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Adherence */
  adherence?: number | null;
  /** Notes */
  notes?: string | null;
  /** End Date */
  end_date?: string | null;
}

/** ClientProgram */
export interface ClientProgram {
  /** Id */
  id?: string | null;
  /** Client Id */
  client_id: string;
  /** Program Id */
  program_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /** End Date */
  end_date?: string | null;
  /**
   * Status
   * @default "active"
   */
  status?: string;
  /** Progress */
  progress?: number | null;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** ClientProgramRequest */
export interface ClientProgramRequest {
  /** Client Id */
  client_id: string;
}

/** ClientProgramUpdate */
export interface ClientProgramUpdate {
  /** Status */
  status?: string | null;
  /** Progress */
  progress?: number | null;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
  /** End Date */
  end_date?: string | null;
}

/** ClientReport */
export interface ClientReport {
  /** Client Id */
  client_id: string;
  /** Report Type */
  report_type: string;
  /**
   * Generated At
   * @format date-time
   */
  generated_at: string;
  /** Period */
  period: string;
  /** Overview */
  overview: string;
  /** Sections */
  sections: ReportSection[];
  /** Recommendations */
  recommendations: string[];
  /** Notes */
  notes?: string | null;
}

/** ClientReportRequest */
export interface ClientReportRequest {
  /**
   * Client Id
   * The ID of the client to generate a report for
   */
  client_id: string;
  /**
   * Report Type
   * Type of report to generate
   */
  report_type: string;
  /**
   * Date Range
   * Date range for the report
   */
  date_range?: Record<string, string> | null;
}

/** ClientRequest */
export interface ClientRequest {
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  /**
   * Type
   * @default "PRIME"
   */
  type?: string | null;
  /**
   * Status
   * @default "active"
   */
  status?: string | null;
  /** Goals */
  goals?: string[] | null;
  /** Health Conditions */
  health_conditions?: Record<string, any>[] | null;
  /**
   * Payment Status
   * @default "active"
   */
  payment_status?: string | null;
}

/** ClientSearchParams */
export interface ClientSearchParams {
  /** Query */
  query?: string | null;
  /**
   * Limit
   * @default 10
   */
  limit?: number | null;
  /** Filters */
  filters?: Record<string, any> | null;
}

/** ClientSearchRequest */
export interface ClientSearchRequest {
  /**
   * Query
   * Search term for name or email
   */
  query?: string | null;
  /**
   * Client Type
   * Filter by client type (PRIME or LONGEVITY)
   */
  client_type?: string | null;
  /**
   * Limit
   * Maximum number of results to return
   * @default 20
   */
  limit?: number | null;
}

/** CommunicationHistoryRequest */
export interface CommunicationHistoryRequest {
  /** Client Id */
  client_id: string;
  /**
   * Limit
   * @default 20
   */
  limit?: number | null;
}

/** CommunicationLog */
export interface CommunicationLog {
  /** Id */
  id?: string | null;
  /** Client Id */
  client_id: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Type */
  type: string;
  channel: MessageChannel;
  /** Content */
  content: string;
  status: CommunicationStatus;
  /** Metadata */
  metadata?: Record<string, any> | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** CommunicationStatus */
export enum CommunicationStatus {
  Scheduled = "scheduled",
  Sent = "sent",
  Delivered = "delivered",
  Read = "read",
  Responded = "responded",
  Failed = "failed",
}

/** ComplexityLevel */
export enum ComplexityLevel {
  Basic = "basic",
  Standard = "standard",
  Detailed = "detailed",
  Technical = "technical",
  ClientFacing = "client_facing",
}

/** DailyNutritionPlan */
export interface DailyNutritionPlanInput {
  /** Day Number */
  day_number: number;
  /** Meals */
  meals: MealInput[];
  /** Total Calories */
  total_calories: number;
  total_macros: MacroNutrients;
  /** Hydration */
  hydration?: number | null;
  /** Supplements */
  supplements?: Record<string, any>[] | null;
  /** Notes */
  notes?: string | null;
}

/** DailyNutritionPlan */
export interface DailyNutritionPlanOutput {
  /** Day Number */
  day_number: number;
  /** Meals */
  meals: MealOutput[];
  /** Total Calories */
  total_calories: number;
  total_macros: MacroNutrients;
  /** Hydration */
  hydration?: number | null;
  /** Supplements */
  supplements?: Record<string, any>[] | null;
  /** Notes */
  notes?: string | null;
}

/** DailyPlan */
export interface DailyPlan {
  /** Day Type */
  day_type: string;
  /** Meals */
  meals: Record<string, MealTemplate>;
  nutrient_targets?: NutrientTarget | null;
  /** Notes */
  notes?: string | null;
}

/** DateRange */
export interface DateRangeInput {
  /** Date From */
  date_from?: string | null;
  /** Date To */
  date_to?: string | null;
}

/** DateRange */
export interface DateRangeOutput {
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
}

/** EffectivenessData */
export interface EffectivenessData {
  /** Metric */
  metric: string;
  /** Average Value */
  average_value: number;
  /** Median Value */
  median_value?: number | null;
  /** Min Value */
  min_value?: number | null;
  /** Max Value */
  max_value?: number | null;
  /** Distribution */
  distribution?: Record<string, number> | null;
  /** Benchmark Comparison */
  benchmark_comparison?: number | null;
}

/** Exercise */
export interface ExerciseInput {
  /** Name */
  name: string;
  /** Sets */
  sets?: number | null;
  /** Reps */
  reps?: number | null;
  /** Weight */
  weight?: number | null;
  /** Duration */
  duration?: number | null;
  /** Distance */
  distance?: number | null;
  /** Notes */
  notes?: string | null;
  /**
   * Completed
   * @default true
   */
  completed?: boolean | null;
}

/** ExerciseBlock */
export interface ExerciseBlock {
  /** Exercise Id */
  exercise_id: string;
  /** Exercise Name */
  exercise_name: string;
  /** Sets */
  sets: TrainingSet[];
  /** Notes */
  notes?: string | null;
}

/** ExerciseCategoriesResponse */
export interface ExerciseCategoriesResponse {
  /** Categories */
  categories: string[];
  /** Muscle Groups */
  muscle_groups: string[];
  /** Difficulty Levels */
  difficulty_levels: string[];
  /** Equipment Types */
  equipment_types: string[];
}

/** ExerciseCreate */
export interface ExerciseCreate {
  /** Name */
  name: string;
  /** Category */
  category: string;
  /** Muscle Groups */
  muscle_groups: string[];
  /** Description */
  description?: string | null;
  /** Instructions */
  instructions?: string | null;
  /** Difficulty Level */
  difficulty_level?: string | null;
  /** Equipment Needed */
  equipment_needed?: string[] | null;
  /** Video Url */
  video_url?: string | null;
  /** Image Url */
  image_url?: string | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** ExerciseDetails */
export interface ExerciseDetails {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Muscle Groups */
  muscle_groups?: string[] | null;
  /** Equipment */
  equipment?: string[] | null;
  /** Difficulty */
  difficulty?: number | null;
  /** Instructions */
  instructions?: string[] | null;
  /** Video Url */
  video_url?: string | null;
  /** Image Url */
  image_url?: string | null;
  /** Substitutes */
  substitutes?: string[] | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** ExerciseDetailsRequest */
export interface ExerciseDetailsRequest {
  /** Exercise Id */
  exercise_id: string;
}

/** ExerciseResponse */
export interface ExerciseResponse {
  /** Success */
  success: boolean;
  exercise: AppApisExercisesLibraryExercise;
  /** Message */
  message: string;
}

/** ExerciseUpdate */
export interface ExerciseUpdate {
  /** Name */
  name?: string | null;
  /** Category */
  category?: string | null;
  /** Muscle Groups */
  muscle_groups?: string[] | null;
  /** Description */
  description?: string | null;
  /** Instructions */
  instructions?: string | null;
  /** Difficulty Level */
  difficulty_level?: string | null;
  /** Equipment Needed */
  equipment_needed?: string[] | null;
  /** Video Url */
  video_url?: string | null;
  /** Image Url */
  image_url?: string | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** ExercisesListResponse */
export interface ExercisesListResponse {
  /** Exercises */
  exercises: AppApisExercisesLibraryExercise[];
  /** Total Count */
  total_count: number;
  /** Categories */
  categories?: string[] | null;
  /** Muscle Groups */
  muscle_groups?: string[] | null;
}

/** FoodNutritionInfo */
export interface FoodNutritionInfo {
  /** Name */
  name: string;
  /** Calories */
  calories: number;
  /** Serving Size */
  serving_size: number;
  /** Serving Unit */
  serving_unit: string;
  macros: MacroNutrients;
  /** Vitamins */
  vitamins?: Record<string, number> | null;
  /** Minerals */
  minerals?: Record<string, number> | null;
}

/** FoodNutritionRequest */
export interface FoodNutritionRequest {
  /** Food Name */
  food_name: string;
}

/** FoodSearchRequest */
export interface FoodSearchRequest {
  /** Query */
  query: string;
  /**
   * Limit
   * @default 10
   */
  limit?: number;
  /** Category */
  category?: string;
}

/** FoodSearchResponse */
export interface FoodSearchResponse {
  /** Results */
  results: AppApisNutritionFoodNutritionResponse[];
  /** Count */
  count: number;
}

/** GetActivityLogsRequest */
export interface GetActivityLogsRequest {
  /**
   * Entity Type
   * Filter logs by entity type
   */
  entity_type?: string | null;
  /**
   * Entity Id
   * Filter logs by entity ID
   */
  entity_id?: string | null;
  /**
   * User Id
   * Filter logs by user ID
   */
  user_id?: string | null;
  /**
   * Action
   * Filter logs by action
   */
  action?: string | null;
  /**
   * From Date
   * Filter logs from this date
   */
  from_date?: string | null;
  /**
   * To Date
   * Filter logs to this date
   */
  to_date?: string | null;
  /**
   * Limit
   * Limit the number of logs returned
   * @default 10
   */
  limit?: number | null;
  /**
   * Offset
   * Offset for pagination
   * @default 0
   */
  offset?: number | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** LogActivityRequest */
export interface LogActivityRequest {
  /**
   * Action
   * The action performed (e.g., 'create', 'update', 'delete', 'view')
   */
  action: string;
  /**
   * Entity Type
   * The type of entity affected (e.g., 'client', 'program', 'nutrition')
   */
  entity_type: string;
  /**
   * Entity Id
   * The ID of the entity affected
   */
  entity_id?: string | null;
  /**
   * User Id
   * The ID of the user who performed the action
   */
  user_id?: string | null;
  /**
   * Details
   * Additional details about the activity
   */
  details?: Record<string, any> | null;
}

/** MCPActivationRequest */
export interface MCPActivationRequest {
  /**
   * Name
   * @default "Claude Desktop"
   */
  name?: string | null;
  /** Api Key */
  api_key?: string | null;
  /** Client Id */
  client_id?: string | null;
}

/** MacroDistribution */
export interface MacroDistribution {
  /** Protein */
  protein: number;
  /** Carbs */
  carbs: number;
  /** Fat */
  fat: number;
}

/** MacroNutrients */
export interface MacroNutrients {
  /** Protein */
  protein: number;
  /** Carbs */
  carbs: number;
  /** Fat */
  fat: number;
  /** Fiber */
  fiber?: number | null;
}

/** MacroTarget */
export interface MacroTarget {
  /** Protein */
  protein: number;
  /** Carbs */
  carbs: number;
  /** Fat */
  fat: number;
  /** Fiber */
  fiber?: number | null;
  /** Calories */
  calories?: number | null;
}

/** Meal */
export interface MealInput {
  /** Name */
  name: string;
  /** Time */
  time?: string | null;
  /** Foods */
  foods: MealFood[];
  /** Total Calories */
  total_calories: number;
  total_macros: MacroNutrients;
  /** Notes */
  notes?: string | null;
}

/** Meal */
export interface MealOutput {
  /** Name */
  name: string;
  /** Time */
  time?: string | null;
  /** Foods */
  foods: MealFood[];
  /** Total Calories */
  total_calories: number;
  total_macros: MacroNutrients;
  /** Notes */
  notes?: string | null;
}

/** MealFood */
export interface MealFood {
  /** Name */
  name: string;
  /** Amount */
  amount: number;
  /** Unit */
  unit: string;
  /** Calories */
  calories: number;
  macros: MacroNutrients;
  /** Notes */
  notes?: string | null;
}

/** MealStructure */
export interface MealStructure {
  /** Meal Name */
  meal_name: string;
  /** Time */
  time: string;
  /** Description */
  description: string;
  /** Suggested Foods */
  suggested_foods: string[];
}

/** MealTemplate */
export interface MealTemplate {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Protein Sources */
  protein_sources: string[];
  /** Carb Sources */
  carb_sources: string[];
  /** Fat Sources */
  fat_sources: string[];
  /** Vegetables */
  vegetables?: string[] | null;
  /** Fruits */
  fruits?: string[] | null;
  /** Spices */
  spices?: string[] | null;
  /** Recipe */
  recipe?: string | null;
  macro_estimate?: MacroTarget | null;
}

/** MeasurementData */
export interface MeasurementData {
  /** Weight */
  weight?: number | null;
  /** Height */
  height?: number | null;
  /** Body Fat */
  body_fat?: number | null;
  /** Waist */
  waist?: number | null;
  /** Chest */
  chest?: number | null;
  /** Arms */
  arms?: number | null;
  /** Legs */
  legs?: number | null;
  /** Other Metrics */
  other_metrics?: Record<string, number> | null;
}

/** MessageChannel */
export enum MessageChannel {
  Email = "email",
  Sms = "sms",
  App = "app",
  Whatsapp = "whatsapp",
}

/** MessageTemplateType */
export enum MessageTemplateType {
  Welcome = "welcome",
  Checkin = "checkin",
  WorkoutReminder = "workout_reminder",
  NutritionReminder = "nutrition_reminder",
  ProgressUpdate = "progress_update",
  ProgramComplete = "program_complete",
  Renewal = "renewal",
  Custom = "custom",
}

/** MetricSummary */
export interface MetricSummary {
  /** Metric */
  metric: string;
  /** Values */
  values: Record<string, any>[];
  /** Start Value */
  start_value?: number | null;
  /** Current Value */
  current_value?: number | null;
  /** Change */
  change?: number | null;
  /** Change Percentage */
  change_percentage?: number | null;
}

/** NotificationCreate */
export interface NotificationCreate {
  /**
   * User Id
   * ID of the user to notify
   */
  user_id: string;
  /**
   * Title
   * Title of the notification
   */
  title: string;
  /**
   * Message
   * Message content of the notification
   */
  message: string;
  /**
   * Type
   * Type of notification
   * @default "info"
   */
  type?: "info" | "alert" | "reminder" | "milestone";
  /**
   * Priority
   * Priority level
   * @default "medium"
   */
  priority?: "low" | "medium" | "high" | "critical";
  /**
   * Related Client Id
   * ID of the related client if applicable
   */
  related_client_id?: string | null;
  /**
   * Related Program Id
   * ID of the related program if applicable
   */
  related_program_id?: string | null;
  /**
   * Related Data
   * Additional related data
   */
  related_data?: Record<string, any> | null;
  /**
   * Action Url
   * URL for action if applicable
   */
  action_url?: string | null;
}

/** NotificationResponse */
export interface NotificationResponse {
  /**
   * Success
   * Whether the operation was successful
   */
  success: boolean;
  /**
   * Data
   * Response data
   */
  data?: null;
  /**
   * Message
   * Response message
   */
  message?: string | null;
}

/** NutrientTarget */
export interface NutrientTarget {
  daily_macros: MacroTarget;
  /** Meal Distribution */
  meal_distribution?: Record<string, number> | null;
  /** Meal Timing */
  meal_timing?: Record<string, string> | null;
  /** Water Intake */
  water_intake?: number | null;
  /** Supplements */
  supplements?: Record<string, any>[] | null;
}

/** NutritionGuideline */
export interface NutritionGuideline {
  /** Allowed Foods */
  allowed_foods?: string[] | null;
  /** Restricted Foods */
  restricted_foods?: string[] | null;
  /** Food Substitutions */
  food_substitutions?: Record<string, string[]> | null;
  /** Notes */
  notes?: string | null;
}

/** NutritionPlan */
export interface NutritionPlanInput {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Type */
  type: string;
  /** Daily Plans */
  daily_plans: DailyNutritionPlanInput[];
  /** Tags */
  tags?: string[] | null;
  /** Target Calories */
  target_calories?: number | null;
  target_macros?: MacroNutrients | null;
  /** Created By */
  created_by?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** NutritionPlanAssignment */
export interface NutritionPlanAssignment {
  /** Client Id */
  client_id: string;
  /** Plan Id */
  plan_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
}

/** NutritionPlanCreate */
export interface NutritionPlanCreate {
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Description */
  description: string;
  /** Duration Weeks */
  duration_weeks: number;
  /** Target Goals */
  target_goals: string[];
  macros: MacroDistribution;
  /** Meal Structure */
  meal_structure: MealStructure[];
}

/** NutritionPlanRequest */
export interface NutritionPlanRequest {
  /** Plan Id */
  plan_id: string;
}

/** NutritionResponse */
export interface NutritionResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Plan Id */
  plan_id?: string | null;
  /** Client Nutrition Id */
  client_nutrition_id?: string | null;
}

/** NutritionTemplateResponse */
export interface NutritionTemplateResponse {
  /** Plans */
  plans: AppApisNutritionNutritionPlan[];
  /** Total */
  total: number;
}

/** NutritionTemplatesRequest */
export interface NutritionTemplatesRequest {
  /** Plan Type */
  plan_type?: string | null;
  /**
   * Limit
   * @default 10
   */
  limit?: number | null;
}

/** NutritionTemplatesResponse */
export interface NutritionTemplatesResponse {
  /** Templates */
  templates: AppApisMcpNutritionNutritionPlanOutput[];
  /** Total Count */
  total_count: number;
}

/** PlanType */
export enum PlanType {
  WeightLoss = "weight_loss",
  MuscleGain = "muscle_gain",
  Maintenance = "maintenance",
  Performance = "performance",
  Health = "health",
  Custom = "custom",
}

/** ProgramEffectiveness */
export interface ProgramEffectiveness {
  /** Program Id */
  program_id: string;
  /** Program Name */
  program_name: string;
  /** Program Type */
  program_type: string;
  /** Client Count */
  client_count: number;
  /** Completion Rate */
  completion_rate: number;
  /** Average Duration */
  average_duration: number;
  /** Metrics */
  metrics: EffectivenessData[];
  /** Recommendations */
  recommendations?: string[] | null;
}

/** ProgramEffectivenessResponse */
export interface ProgramEffectivenessResponse {
  /** Program Details */
  program_details: Record<string, any>;
  /** Effectiveness Metrics */
  effectiveness_metrics: Record<string, any>;
  /** Client Outcomes */
  client_outcomes: Record<string, any>;
  /** Recommendations */
  recommendations: string[];
}

/** ProgramExercise */
export interface ProgramExercise {
  /** Exercise Id */
  exercise_id: string;
  /** Sets */
  sets: number;
  /** Reps */
  reps?: string | null;
  /** Weight */
  weight?: string | null;
  /** Rest */
  rest?: number | null;
  /** Tempo */
  tempo?: string | null;
  /** Notes */
  notes?: string | null;
  /** Superset With */
  superset_with?: string[] | null;
}

/** ProgramType */
export enum ProgramType {
  Strength = "strength",
  Hypertrophy = "hypertrophy",
  Endurance = "endurance",
  WeightLoss = "weight_loss",
  Mobility = "mobility",
  Rehabilitation = "rehabilitation",
  Custom = "custom",
}

/** ProgramWorkout */
export interface ProgramWorkout {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Duration */
  duration?: number | null;
  /** Exercises */
  exercises: ProgramExercise[];
  /** Notes */
  notes?: string | null;
  /** Order */
  order?: number | null;
}

/** ProgressRecord */
export interface ProgressRecord {
  /**
   * Id
   * @format uuid4
   */
  id: string;
  /**
   * Client Id
   * @format uuid4
   */
  client_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  record_type: RecordType;
  /** Data */
  data: Record<string, any>;
  /** Notes */
  notes?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** ProgressResponse */
export interface ProgressResponse {
  /** Success */
  success: boolean;
  /** Record Id */
  record_id: string;
  /** Message */
  message: string;
}

/** ProgressSummaryRequest */
export interface ProgressSummaryRequest {
  /** Client Id */
  client_id: string;
  /** Metrics */
  metrics: string[];
  /** Date From */
  date_from?: string | null;
  /** Date To */
  date_to?: string | null;
}

/** RecordType */
export enum RecordType {
  Weight = "weight",
  Measurements = "measurements",
  Workout = "workout",
  Feedback = "feedback",
  Nutrition = "nutrition",
  BloodWork = "blood_work",
  Sleep = "sleep",
}

/** ReminderType */
export enum ReminderType {
  Workout = "workout",
  Nutrition = "nutrition",
  CheckIn = "check_in",
  Measurement = "measurement",
  Appointment = "appointment",
  Hydration = "hydration",
  Supplement = "supplement",
  Custom = "custom",
}

/** ReportRequest */
export interface ReportRequest {
  /** Client Id */
  client_id: string;
  report_type: ReportType;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** Include Sections */
  include_sections?: string[] | null;
  /** Exclude Sections */
  exclude_sections?: string[] | null;
  /** Custom Parameters */
  custom_parameters?: Record<string, any> | null;
}

/** ReportSection */
export interface ReportSection {
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Data */
  data?: Record<string, any> | null;
  /** Charts */
  charts?: Record<string, any>[] | null;
}

/** ReportType */
export enum ReportType {
  ProgressSummary = "progress_summary",
  AdherenceReport = "adherence_report",
  PerformanceAnalysis = "performance_analysis",
  NutritionSummary = "nutrition_summary",
  QuarterlyReview = "quarterly_review",
  HealthAssessment = "health_assessment",
}

/** SimpleClientRequest */
export interface SimpleClientRequest {
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  /**
   * Type
   * @default "PRIME"
   */
  type?: string | null;
  /** Goals */
  goals?: string[] | null;
  /** Health Conditions */
  health_conditions?: string[] | null;
}

/** SystemStatus */
export interface SystemStatus {
  /** Status */
  status: string;
  /** Version */
  version: string;
  /**
   * Last Updated
   * @format date-time
   */
  last_updated: string;
  /** Available Models */
  available_models: string[];
  /** Current Model */
  current_model: string;
  /** Available Analyses */
  available_analyses: string[];
  /** Available Reports */
  available_reports: string[];
  /** Usage Metrics */
  usage_metrics?: Record<string, any> | null;
}

/** TrainingDay */
export interface TrainingDay {
  /** Day Number */
  day_number: number;
  /** Name */
  name?: string | null;
  /** Focus */
  focus?: string | null;
  /** Exercises */
  exercises: ExerciseBlock[];
  /** Notes */
  notes?: string | null;
}

/** TrainingProgramAssignment */
export interface TrainingProgramAssignment {
  /** Client Id */
  client_id: string;
  /** Program Id */
  program_id: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
}

/** TrainingProgramRequest */
export interface TrainingProgramRequest {
  /** Program Id */
  program_id: string;
}

/** TrainingSet */
export interface TrainingSet {
  /** Set Number */
  set_number: number;
  /** Reps */
  reps?: number | null;
  /** Weight */
  weight?: number | null;
  /** Duration */
  duration?: number | null;
  /** Distance */
  distance?: number | null;
  /** Rest */
  rest?: number | null;
  /**
   * Is Completed
   * @default false
   */
  is_completed?: boolean | null;
  /** Notes */
  notes?: string | null;
}

/** TrainingTemplatesRequest */
export interface TrainingTemplatesRequest {
  /** Program Type */
  program_type?: string | null;
  /**
   * Limit
   * @default 10
   */
  limit?: number | null;
}

/** TrainingTemplatesResponse */
export interface TrainingTemplatesResponse {
  /** Templates */
  templates: AppApisMcpTrainingTrainingProgram[];
  /** Total Count */
  total_count: number;
}

/** TrainingWeek */
export interface TrainingWeek {
  /** Week Number */
  week_number: number;
  /** Name */
  name?: string | null;
  /** Days */
  days: TrainingDay[];
  /** Notes */
  notes?: string | null;
}

/** TranslateProgramRequest */
export interface TranslateProgramRequest {
  /**
   * Program Data
   * Training program data to translate
   */
  program_data: Record<string, any>;
  /**
   * Complexity Level
   * Complexity level of the natural language output
   * @default "standard"
   */
  complexity_level?: string | null;
}

/** TranslationRequest */
export interface TranslationRequest {
  /** Program Data */
  program_data: Record<string, any>;
  /** @default "standard" */
  complexity_level?: ComplexityLevel;
}

/** TranslationResponse */
export interface TranslationResponse {
  /** Natural Language */
  natural_language: string;
  /** Sections */
  sections?: Record<string, string> | null;
  /** Summary */
  summary?: string | null;
}

/** UpdateClientNutritionRequest */
export interface UpdateClientNutritionRequest {
  /** Client Id */
  client_id: string;
  /** Current Day */
  current_day?: number | null;
  /** Status */
  status?: string | null;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
}

/** UpdateClientProgramRequest */
export interface UpdateClientProgramRequest {
  /** Client Id */
  client_id: string;
  /** Current Week */
  current_week?: number | null;
  /** Current Day */
  current_day?: number | null;
  /** Status */
  status?: string | null;
  /** Adjustments */
  adjustments?: Record<string, any> | null;
  /** Notes */
  notes?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** WorkoutSet */
export interface WorkoutSet {
  /** Exercises */
  exercises: ExerciseInput[];
  /** Rest Between */
  rest_between?: number | null;
  /**
   * Completed
   * @default true
   */
  completed?: boolean | null;
  /** Notes */
  notes?: string | null;
}

/** BusinessMetricsResponse */
export interface AppApisAnalyticsBusinessMetricsResponse {
  /** Period */
  period: string;
  /** Comparison Period */
  comparison_period?: string | null;
  /** Segments */
  segments: Record<string, BusinessMetric[]>;
}

/** CommunicationHistoryResponse */
export interface AppApisCommunicationCommunicationHistoryResponse {
  /** Logs */
  logs: CommunicationLog[];
  /** Total */
  total: number;
}

/** CommunicationResponse */
export interface AppApisCommunicationCommunicationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Log Id */
  log_id?: string | null;
  /** Scheduled Time */
  scheduled_time?: string | null;
}

/** ReminderRequest */
export interface AppApisCommunicationReminderRequest {
  /** Client Id */
  client_id: string;
  reminder_type: ReminderType;
  /**
   * Date
   * @format date-time
   */
  date: string;
  /** Custom Message */
  custom_message?: string | null;
  /**
   * Channels
   * @default ["app"]
   */
  channels?: MessageChannel[];
  /** Repeat */
  repeat?: Record<string, any> | null;
}

/** TemplatedMessageRequest */
export interface AppApisCommunicationTemplatedMessageRequest {
  /** Client Id */
  client_id: string;
  template_id: MessageTemplateType;
  /** Channels */
  channels: MessageChannel[];
  /** Custom Params */
  custom_params?: Record<string, any> | null;
  /** Scheduled Time */
  scheduled_time?: string | null;
}

/** Exercise */
export interface AppApisExercisesLibraryExercise {
  /** Name */
  name: string;
  /** Category */
  category: string;
  /** Muscle Groups */
  muscle_groups: string[];
  /** Description */
  description?: string | null;
  /** Instructions */
  instructions?: string | null;
  /** Difficulty Level */
  difficulty_level?: string | null;
  /** Equipment Needed */
  equipment_needed?: string[] | null;
  /** Video Url */
  video_url?: string | null;
  /** Image Url */
  image_url?: string | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
  /** Id */
  id: string;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** BusinessMetricsRequest */
export interface AppApisMcpAnalysisBusinessMetricsRequest {
  date_range?: DateRangeInput | null;
  /** Segments */
  segments?: string[] | null;
}

/** BusinessMetricsResponse */
export interface AppApisMcpAnalysisBusinessMetricsResponse {
  /** Client Metrics */
  client_metrics: Record<string, any>;
  /** Program Metrics */
  program_metrics: Record<string, any>;
  /** Financial Metrics */
  financial_metrics: Record<string, any>;
  /** Retention Metrics */
  retention_metrics: Record<string, any>;
}

/** ProgramEffectivenessRequest */
export interface AppApisMcpAnalysisProgramEffectivenessRequest {
  /** Program Id */
  program_id: string;
  /** Metrics */
  metrics?: string[] | null;
}

/** CommunicationHistoryResponse */
export interface AppApisMcpCommunicationCommunicationHistoryResponse {
  /** History */
  history: Record<string, any>[];
  /** Total Count */
  total_count: number;
}

/** CommunicationResponse */
export interface AppApisMcpCommunicationCommunicationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Message Id */
  message_id?: string | null;
  /** Reminder Id */
  reminder_id?: string | null;
}

/** ReminderRequest */
export interface AppApisMcpCommunicationReminderRequest {
  /** Client Id */
  client_id: string;
  /** Reminder Type */
  reminder_type: string;
  /**
   * Date
   * @format date
   */
  date: string;
  /** Custom Message */
  custom_message?: string | null;
}

/** TemplatedMessageRequest */
export interface AppApisMcpCommunicationTemplatedMessageRequest {
  /** Client Id */
  client_id: string;
  /** Template Id */
  template_id: string;
  /** Custom Params */
  custom_params: Record<string, string>;
}

/** SimpleClient */
export interface AppApisMcpDirect2SimpleClient {
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  /**
   * Type
   * @default "PRIME"
   */
  type?: string;
  /** Goals */
  goals?: string[] | null;
  /** Health Conditions */
  health_conditions?: Record<string, string>[] | null;
}

/** SimpleClient */
export interface AppApisMcpEmergencySimpleClient {
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string | null;
  /**
   * Type
   * @default "PRIME"
   */
  type?: string | null;
  /** Goals */
  goals?: string[] | null;
  /** Health Conditions */
  health_conditions?: Record<string, string>[] | null;
}

/** FoodNutritionResponse */
export interface AppApisMcpNutritionFoodNutritionResponse {
  food: FoodNutritionInfo;
  /** Alternative Options */
  alternative_options?: string[] | null;
}

/** NutritionPlan */
export interface AppApisMcpNutritionNutritionPlanOutput {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Type */
  type: string;
  /** Daily Plans */
  daily_plans: DailyNutritionPlanOutput[];
  /** Tags */
  tags?: string[] | null;
  /** Target Calories */
  target_calories?: number | null;
  target_macros?: MacroNutrients | null;
  /** Created By */
  created_by?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** Exercise */
export interface AppApisMcpTrainingExercise {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Category */
  category?: string | null;
  /** Description */
  description?: string | null;
  /** Target Muscles */
  target_muscles?: string[] | null;
  /** Equipment */
  equipment?: string[] | null;
  /** Difficulty */
  difficulty?: string | null;
  /** Video Url */
  video_url?: string | null;
  /** Instructions */
  instructions?: string[] | null;
}

/** ProgramResponse */
export interface AppApisMcpTrainingProgramResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Program Id */
  program_id?: string | null;
  /** Client Program Id */
  client_program_id?: string | null;
}

/** TrainingProgram */
export interface AppApisMcpTrainingTrainingProgram {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Type */
  type: string;
  /** Duration Weeks */
  duration_weeks: number;
  /** Target Level */
  target_level?: string | null;
  /** Weeks */
  weeks: TrainingWeek[];
  /** Tags */
  tags?: string[] | null;
  /** Created By */
  created_by?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** BusinessMetricsRequest */
export interface AppApisMcpnewBusinessMetricsRequest {
  /**
   * Date Range
   * Date range in format {start_date: YYYY-MM-DD, end_date: YYYY-MM-DD}
   */
  date_range?: Record<string, string> | null;
  /**
   * Segments
   * Segments to analyze (client_type, revenue, retention)
   */
  segments?: string[] | null;
}

/** ProgramEffectivenessRequest */
export interface AppApisMcpnewProgramEffectivenessRequest {
  /**
   * Program Id
   * The ID of the program to analyze
   */
  program_id: string;
  /**
   * Metrics
   * Specific metrics to analyze
   */
  metrics?: string[] | null;
}

/** ProgressHistoryRequest */
export interface AppApisMcpnewProgressHistoryRequest {
  /**
   * Client Id
   * The ID of the client
   */
  client_id: string;
  /**
   * Record Type
   * Type of records to retrieve
   */
  record_type?: string | null;
  /**
   * Days
   * Number of days of history to retrieve
   * @default 30
   */
  days?: number | null;
}

/** FoodNutritionResponse */
export interface AppApisNutritionFoodNutritionResponse {
  /** Name */
  name: string;
  /** Calories */
  calories: number;
  /** Protein */
  protein: number;
  /** Carbs */
  carbs: number;
  /** Fat */
  fat: number;
  /** Serving Size */
  serving_size: string;
  /** Nutrients */
  nutrients: Record<string, number>;
}

/** NutritionPlan */
export interface AppApisNutritionNutritionPlan {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  type: PlanType;
  /** Duration Weeks */
  duration_weeks: number;
  nutrient_targets: NutrientTarget;
  /** Daily Plans */
  daily_plans: Record<string, DailyPlan>;
  guidelines?: NutritionGuideline | null;
  /** Author */
  author?: string | null;
  /** Notes */
  notes?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

/** FeedbackData */
export interface AppApisProgressFeedbackData {
  /** Energy Level */
  energy_level?: number | null;
  /** Mood */
  mood?: number | null;
  /** Stress Level */
  stress_level?: number | null;
  /** Sleep Quality */
  sleep_quality?: number | null;
  /** Soreness */
  soreness?: Record<string, number> | null;
  /** Motivation */
  motivation?: number | null;
  /** Rating */
  rating?: number | null;
  /** Notes */
  notes?: string | null;
}

/** FeedbackRequest */
export interface AppApisProgressFeedbackRequest {
  /** Client Id */
  client_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  feedback: AppApisProgressFeedbackData;
  /** Notes */
  notes?: string | null;
}

/** MeasurementRequest */
export interface AppApisProgressMeasurementRequest {
  /** Client Id */
  client_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  measurements: BodyMeasurements;
  /** Notes */
  notes?: string | null;
}

/** ProgressHistoryResponse */
export interface AppApisProgressProgressHistoryResponse {
  /** Records */
  records: ProgressRecord[];
  /** Total */
  total: number;
}

/** ProgressSummaryResponse */
export interface AppApisProgressProgressSummaryResponse {
  /** Metrics */
  metrics: MetricSummary[];
  date_range: DateRangeOutput;
}

/** WorkoutData */
export interface AppApisProgressWorkoutData {
  /** Name */
  name?: string | null;
  /** Program Id */
  program_id?: string | null;
  /** Duration */
  duration?: number | null;
  /** Sets */
  sets: WorkoutSet[];
  /** Intensity */
  intensity?: number | null;
  /** Calories Burned */
  calories_burned?: number | null;
  /** Location */
  location?: string | null;
}

/** WorkoutRequest */
export interface AppApisProgressWorkoutRequest {
  /** Client Id */
  client_id: string;
  /**
   * Date
   * @format date
   */
  date: string;
  workout_data: AppApisProgressWorkoutData;
  /** Notes */
  notes?: string | null;
}

/** FeedbackData */
export interface AppApisProgressV2FeedbackData {
  /** Energy Level */
  energy_level?: number | null;
  /** Motivation */
  motivation?: number | null;
  /** Sleep Quality */
  sleep_quality?: number | null;
  /** Stress Level */
  stress_level?: number | null;
  /** Soreness */
  soreness?: number | null;
  /** Recovery */
  recovery?: number | null;
  /** Comments */
  comments?: string | null;
}

/** FeedbackRequest */
export interface AppApisProgressV2FeedbackRequest {
  /** Client Id */
  client_id: string;
  /** Date */
  date?: null;
  /** Notes */
  notes?: string | null;
  feedback: AppApisProgressV2FeedbackData;
}

/** MeasurementRequest */
export interface AppApisProgressV2MeasurementRequest {
  /** Client Id */
  client_id: string;
  /** Date */
  date?: null;
  /** Notes */
  notes?: string | null;
  measurements: MeasurementData;
}

/** ProgressHistoryRequest */
export interface AppApisProgressV2ProgressHistoryRequest {
  /** Client Id */
  client_id: string;
  /** Record Type */
  record_type: string;
  /** Date From */
  date_from?: string | null;
  /** Date To */
  date_to?: string | null;
  /**
   * Limit
   * @default 10
   */
  limit?: number | null;
}

/** ProgressHistoryResponse */
export interface AppApisProgressV2ProgressHistoryResponse {
  /** Records */
  records: Record<string, any>[];
  /** Total Count */
  total_count: number;
}

/** ProgressSummaryResponse */
export interface AppApisProgressV2ProgressSummaryResponse {
  /** Summary */
  summary: Record<string, any>;
  /**
   * Period Start
   * @format date
   */
  period_start: string;
  /**
   * Period End
   * @format date
   */
  period_end: string;
}

/** WorkoutData */
export interface AppApisProgressV2WorkoutData {
  /** Program Id */
  program_id?: string | null;
  /** Exercises */
  exercises: Record<string, any>[];
  /** Duration */
  duration?: number | null;
  /** Intensity */
  intensity?: number | null;
  /** Calories Burned */
  calories_burned?: number | null;
}

/** WorkoutRequest */
export interface AppApisProgressV2WorkoutRequest {
  /** Client Id */
  client_id: string;
  /** Date */
  date?: null;
  /** Notes */
  notes?: string | null;
  workout_data: AppApisProgressV2WorkoutData;
}

/** ProgramResponse */
export interface AppApisTrainingProgramResponse {
  /** Programs */
  programs: AppApisTrainingTrainingProgram[];
  /** Total */
  total: number;
}

/** TrainingProgram */
export interface AppApisTrainingTrainingProgram {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  type: ProgramType;
  /** Duration Weeks */
  duration_weeks: number;
  /** Frequency Per Week */
  frequency_per_week: number;
  /** Target Audience */
  target_audience?: string[] | null;
  /** Difficulty */
  difficulty?: number | null;
  /** Workouts */
  workouts: ProgramWorkout[];
  /** Notes */
  notes?: string | null;
  /** Author */
  author?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
}

export type CheckHealthData = HealthResponse;

export type GetSupabaseConfigData = any;

export type SendTemplatedMessageData = AppApisCommunicationCommunicationResponse;

export type SendTemplatedMessageError = HTTPValidationError;

export type ScheduleClientReminderData = AppApisCommunicationCommunicationResponse;

export type ScheduleClientReminderError = HTTPValidationError;

export interface GetCommunicationHistoryParams {
  /**
   * Limit
   * Maximum number of records to return
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
  /**
   * Offset
   * Number of records to skip
   * @min 0
   * @default 0
   */
  offset?: number;
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

export type GetCommunicationHistoryData = AppApisCommunicationCommunicationHistoryResponse;

export type GetCommunicationHistoryError = HTTPValidationError;

export interface GetClientAdherenceMetricsParams {
  /**
   * Start Date
   * Start date for adherence metrics
   */
  start_date?: string | null;
  /**
   * End Date
   * End date for adherence metrics
   */
  end_date?: string | null;
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

export type GetClientAdherenceMetricsData = AdherenceMetrics;

export type GetClientAdherenceMetricsError = HTTPValidationError;

export interface GetProgramEffectivenessParams {
  /**
   * Metrics
   * Comma-separated list of metrics to analyze
   */
  metrics?: string | null;
  /**
   * Program Id
   * The ID of the program
   */
  programId: string;
}

export type GetProgramEffectivenessData = ProgramEffectiveness;

export type GetProgramEffectivenessError = HTTPValidationError;

export interface GenerateBusinessMetricsParams {
  /**
   * Start Date
   * Start date for metrics
   */
  start_date?: string | null;
  /**
   * End Date
   * End date for metrics
   */
  end_date?: string | null;
  /**
   * Segments
   * Comma-separated list of segments to analyze
   */
  segments?: string | null;
}

export type GenerateBusinessMetricsData = AppApisAnalyticsBusinessMetricsResponse;

export type GenerateBusinessMetricsError = HTTPValidationError;

export interface InitializeDatabaseParams {
  /**
   * Include Sample Data
   * @default true
   */
  include_sample_data?: boolean;
}

export type InitializeDatabaseData = any;

export type InitializeDatabaseError = HTTPValidationError;

export type GetSchemaSummaryData = any;

export interface GenerateBusinessMetrics2Params {
  /**
   * Date Range
   * Time range for metrics
   * @default "30d"
   */
  date_range?: string;
  /** Segments */
  segments?: string[];
}

export type GenerateBusinessMetrics2Data = any;

export type GenerateBusinessMetrics2Error = HTTPValidationError;

export interface GetClientAdherenceMetrics2Params {
  /** Client Id */
  client_id: string;
  /**
   * Date Range
   * @default "30d"
   */
  date_range?: string;
}

export type GetClientAdherenceMetrics2Data = any;

export type GetClientAdherenceMetrics2Error = HTTPValidationError;

export interface GetProgramEffectiveness2Params {
  /** Program Id */
  program_id: string;
  /**
   * Metrics
   * @default "all"
   */
  metrics?: string;
}

export type GetProgramEffectiveness2Data = any;

export type GetProgramEffectiveness2Error = HTTPValidationError;

export type GetAgentSystemStatusData = SystemStatus;

export type RunAgentAnalysisData = AnalysisResult;

export type RunAgentAnalysisError = HTTPValidationError;

export type GenerateClientReportData = ClientReport;

export type GenerateClientReportError = HTTPValidationError;

export type TranslateProgramToNaturalLanguageData = TranslationResponse;

export type TranslateProgramToNaturalLanguageError = HTTPValidationError;

/** Response Coach Assistant Chat */
export type CoachAssistantChatData = Record<string, any>;

export type CoachAssistantChatError = HTTPValidationError;

export interface GetSuggestedPromptsParams {
  /** Client Id */
  client_id?: string | null;
  /** Program Id */
  program_id?: string | null;
}

/** Response Get Suggested Prompts */
export type GetSuggestedPromptsData = Record<string, any>;

export type GetSuggestedPromptsError = HTTPValidationError;

export type CreateNotificationData = NotificationResponse;

export type CreateNotificationError = HTTPValidationError;

export interface GetUserNotificationsParams {
  /**
   * Limit
   * Maximum number of notifications to return
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
  /**
   * Offset
   * Number of notifications to skip
   * @min 0
   * @default 0
   */
  offset?: number;
  /**
   * Unread Only
   * Whether to return only unread notifications
   * @default false
   */
  unread_only?: boolean;
  /**
   * Type
   * Filter by notification type
   */
  type?: string | null;
  /** User Id */
  userId: string;
}

export type GetUserNotificationsData = NotificationResponse;

export type GetUserNotificationsError = HTTPValidationError;

export interface MarkNotificationReadParams {
  /** Notification Id */
  notificationId: string;
}

export type MarkNotificationReadData = NotificationResponse;

export type MarkNotificationReadError = HTTPValidationError;

export interface MarkAllNotificationsReadParams {
  /** User Id */
  userId: string;
}

export type MarkAllNotificationsReadData = NotificationResponse;

export type MarkAllNotificationsReadError = HTTPValidationError;

export interface DeleteNotificationParams {
  /** Notification Id */
  notificationId: string;
}

export type DeleteNotificationData = NotificationResponse;

export type DeleteNotificationError = HTTPValidationError;

export type CreateClientAdminData = any;

export type CreateClientAdminError = HTTPValidationError;

export interface SearchClientsAdminParams {
  /** Q */
  q?: string | null;
  /**
   * Limit
   * @default 10
   */
  limit?: number;
  /**
   * Offset
   * @default 0
   */
  offset?: number;
}

export type SearchClientsAdminData = any;

export type SearchClientsAdminError = HTTPValidationError;

export interface GetClientByIdAdminParams {
  /**
   * Client Id
   * The ID of the client to get
   */
  clientId: string;
}

export type GetClientByIdAdminData = any;

export type GetClientByIdAdminError = HTTPValidationError;

export type CreateClientSimpleData = any;

export type CreateClientSimpleError = HTTPValidationError;

export type GetClaudeMcpStatusData = any;

export type GetMcpStatusData = any;

export type ActivateMcpData = any;

export type ActivateMcpError = HTTPValidationError;

export type AddClientDirect2Data = any;

export type AddClientDirect2Error = HTTPValidationError;

export type AddClientData = any;

export type AddClientError = HTTPValidationError;

export type SearchClientsData = any;

export type SearchClientsError = HTTPValidationError;

export interface GetClientByIdParams {
  /** Client Id */
  client_id: string;
}

export type GetClientByIdData = any;

export type GetClientByIdError = HTTPValidationError;

export interface UpdateClientParams {
  /** Client Id */
  client_id: string;
}

export type UpdateClientData = any;

export type UpdateClientError = HTTPValidationError;

export type GetClaudeMcpStatus2Data = any;

export type AddClientDirect22Data = any;

export type AddClientDirect22Error = HTTPValidationError;

export type McpnewSendTemplatedMessageData = AppApisMcpCommunicationCommunicationResponse;

export type McpnewSendTemplatedMessageError = HTTPValidationError;

export type McpnewScheduleClientReminderData = AppApisMcpCommunicationCommunicationResponse;

export type McpnewScheduleClientReminderError = HTTPValidationError;

export type McpnewGetCommunicationHistoryData = AppApisMcpCommunicationCommunicationHistoryResponse;

export type McpnewGetCommunicationHistoryError = HTTPValidationError;

export type McpnewGetClientAdherenceMetricsData = ClientAdherenceResponse;

export type McpnewGetClientAdherenceMetricsError = HTTPValidationError;

export type McpnewGetProgramEffectivenessData = ProgramEffectivenessResponse;

export type McpnewGetProgramEffectivenessError = HTTPValidationError;

export type McpnewGenerateBusinessMetricsData = AppApisMcpAnalysisBusinessMetricsResponse;

export type McpnewGenerateBusinessMetricsError = HTTPValidationError;

export type GetMcpStatusEndpointData = any;

export type ActivateMcpEndpointData = any;

export type ActivateMcpEndpointError = HTTPValidationError;

export type GetMcpStatusEndpoint2Data = any;

export type ActivateMcpEndpoint2Data = any;

export type ActivateMcpEndpoint2Error = HTTPValidationError;

export type GetMcpToolsEndpointData = any;

export type GetMcpAccessLogsEndpointData = any;

/** Settings */
export type UpdateMcpSettingsEndpointPayload = Record<string, any>;

export type UpdateMcpSettingsEndpointData = any;

export type UpdateMcpSettingsEndpointError = HTTPValidationError;

export type LogMeasurementData = ProgressRecord;

export type LogMeasurementError = HTTPValidationError;

export type LogWorkoutData = ProgressRecord;

export type LogWorkoutError = HTTPValidationError;

export type LogSubjectiveFeedbackData = ProgressRecord;

export type LogSubjectiveFeedbackError = HTTPValidationError;

export interface GetProgressHistoryParams {
  /**
   * Record Type
   * Type of records to retrieve
   */
  record_type?: RecordType | null;
  /**
   * Start Date
   * Start date for filtering records
   */
  start_date?: string | null;
  /**
   * End Date
   * End date for filtering records
   */
  end_date?: string | null;
  /**
   * Limit
   * Maximum number of records to return
   * @default 20
   */
  limit?: number;
  /**
   * Offset
   * Number of records to skip
   * @default 0
   */
  offset?: number;
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

export type GetProgressHistoryData = AppApisProgressProgressHistoryResponse;

export type GetProgressHistoryError = HTTPValidationError;

export interface GetProgressSummaryParams {
  /**
   * Metrics
   * Comma-separated list of metrics to summarize
   */
  metrics: string;
  /**
   * Start Date
   * Start date for filtering records
   */
  start_date?: string | null;
  /**
   * End Date
   * End date for filtering records
   */
  end_date?: string | null;
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

export type GetProgressSummaryData = AppApisProgressProgressSummaryResponse;

export type GetProgressSummaryError = HTTPValidationError;

export interface GetTrainingTemplatesParams {
  /**
   * Program Type
   * Type of training program to filter by
   */
  program_type?: ProgramType | null;
  /**
   * Limit
   * Maximum number of templates to return
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
  /**
   * Offset
   * Number of templates to skip
   * @min 0
   * @default 0
   */
  offset?: number;
}

export type GetTrainingTemplatesData = AppApisTrainingProgramResponse;

export type GetTrainingTemplatesError = HTTPValidationError;

export interface GetTrainingProgramParams {
  /**
   * Program Id
   * The ID of the training program
   */
  programId: string;
}

export type GetTrainingProgramData = AppApisTrainingTrainingProgram;

export type GetTrainingProgramError = HTTPValidationError;

export interface GetClientActiveProgramParams {
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

/** Response Get Client Active Program */
export type GetClientActiveProgramData = ClientProgram | Record<string, null>;

export type GetClientActiveProgramError = HTTPValidationError;

export interface UpdateClientProgramParams {
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

export type UpdateClientProgramData = ClientProgram;

export type UpdateClientProgramError = HTTPValidationError;

export type AssignProgramToClientData = ClientProgram;

export type AssignProgramToClientError = HTTPValidationError;

export interface GetExerciseDetailsParams {
  /**
   * Exercise Id
   * The ID of the exercise
   */
  exerciseId: string;
}

export type GetExerciseDetailsData = ExerciseDetails;

export type GetExerciseDetailsError = HTTPValidationError;

export interface GetNutritionTemplatesParams {
  /**
   * Plan Type
   * Type of nutrition plan to filter by
   */
  plan_type?: PlanType | null;
  /**
   * Limit
   * Maximum number of templates to return
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
  /**
   * Offset
   * Number of templates to skip
   * @min 0
   * @default 0
   */
  offset?: number;
}

export type GetNutritionTemplatesData = NutritionTemplateResponse;

export type GetNutritionTemplatesError = HTTPValidationError;

export interface GetNutritionPlanParams {
  /**
   * Plan Id
   * The ID of the nutrition plan
   */
  planId: string;
}

export type GetNutritionPlanData = AppApisNutritionNutritionPlan;

export type GetNutritionPlanError = HTTPValidationError;

export interface GetClientActiveNutritionParams {
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

/** Response Get Client Active Nutrition */
export type GetClientActiveNutritionData = ClientNutrition | Record<string, null>;

export type GetClientActiveNutritionError = HTTPValidationError;

export interface UpdateClientNutritionParams {
  /**
   * Client Id
   * The ID of the client
   */
  clientId: string;
}

export type UpdateClientNutritionData = ClientNutrition;

export type UpdateClientNutritionError = HTTPValidationError;

export type AssignNutritionPlanData = ClientNutrition;

export type AssignNutritionPlanError = HTTPValidationError;

export type AdvancedFoodSearchData = FoodSearchResponse;

export type AdvancedFoodSearchError = HTTPValidationError;

export interface LookupFoodNutritionParams {
  /** Food Name */
  foodName: string;
}

export type LookupFoodNutritionData = AppApisNutritionFoodNutritionResponse;

export type LookupFoodNutritionError = HTTPValidationError;

export type CreateNutritionPlanData = any;

export type CreateNutritionPlanError = HTTPValidationError;

export type McpnewSearchClientsData = any;

export type McpnewSearchClientsError = HTTPValidationError;

export type McpnewGetClientDetailsData = any;

export type McpnewGetClientDetailsError = HTTPValidationError;

export type McpnewAddClientData = any;

export type McpnewAddClientError = HTTPValidationError;

export type McpnewGetProgressHistoryData = any;

export type McpnewGetProgressHistoryError = HTTPValidationError;

export type McpnewGetClientAdherenceMetrics2Data = any;

export type McpnewGetClientAdherenceMetrics2Error = HTTPValidationError;

export type McpnewGetProgramEffectiveness2Data = any;

export type McpnewGetProgramEffectiveness2Error = HTTPValidationError;

export type McpnewGenerateBusinessMetrics2Data = any;

export type McpnewGenerateBusinessMetrics2Error = HTTPValidationError;

export type McpnewGetAgentSystemStatusData = any;

export type McpnewRunAgentAnalysisData = any;

export type McpnewRunAgentAnalysisError = HTTPValidationError;

export type McpnewGenerateClientReportData = any;

export type McpnewGenerateClientReportError = HTTPValidationError;

export type McpnewTranslateProgramToNaturalLanguageData = any;

export type McpnewTranslateProgramToNaturalLanguageError = HTTPValidationError;

export type McpnewGetTrainingTemplatesData = TrainingTemplatesResponse;

export type McpnewGetTrainingTemplatesError = HTTPValidationError;

export type McpnewGetTrainingProgramData = AppApisMcpTrainingTrainingProgram;

export type McpnewGetTrainingProgramError = HTTPValidationError;

/** Response Mcpnew Get Client Active Program */
export type McpnewGetClientActiveProgramData = Record<string, any>;

export type McpnewGetClientActiveProgramError = HTTPValidationError;

export type McpnewAssignProgramToClientData = AppApisMcpTrainingProgramResponse;

export type McpnewAssignProgramToClientError = HTTPValidationError;

export type McpnewUpdateClientProgramData = AppApisMcpTrainingProgramResponse;

export type McpnewUpdateClientProgramError = HTTPValidationError;

export type McpnewGetExerciseDetailsData = AppApisMcpTrainingExercise;

export type McpnewGetExerciseDetailsError = HTTPValidationError;

export type McpnewGetNutritionTemplatesData = NutritionTemplatesResponse;

export type McpnewGetNutritionTemplatesError = HTTPValidationError;

export type McpnewGetNutritionPlanData = AppApisMcpNutritionNutritionPlanOutput;

export type McpnewGetNutritionPlanError = HTTPValidationError;

/** Response Mcpnew Get Client Active Nutrition */
export type McpnewGetClientActiveNutritionData = Record<string, any>;

export type McpnewGetClientActiveNutritionError = HTTPValidationError;

export type McpnewAssignNutritionPlanData = NutritionResponse;

export type McpnewAssignNutritionPlanError = HTTPValidationError;

export type McpnewUpdateClientNutritionData = NutritionResponse;

export type McpnewUpdateClientNutritionError = HTTPValidationError;

export type McpnewLookupFoodNutritionData = AppApisMcpNutritionFoodNutritionResponse;

export type McpnewLookupFoodNutritionError = HTTPValidationError;

export type McpnewCreateNutritionPlanData = NutritionResponse;

export type McpnewCreateNutritionPlanError = HTTPValidationError;

/** Data */
export type LogActivityPayload = Record<string, any>;

export type LogActivityData = any;

export type LogActivityError = HTTPValidationError;

export type GetActivityLogsData = any;

export type GetActivityLogsError = HTTPValidationError;

export type RecordSystemActivityData = any;

export type RecordSystemActivityError = HTTPValidationError;

export type RetrieveSystemActivitiesData = any;

export type RetrieveSystemActivitiesError = HTTPValidationError;

export type InitializeActivityLogsTableData = any;

export type GetCategoriesData = ExerciseCategoriesResponse;

export interface ListExercisesParams {
  /** Category */
  category?: string | null;
  /** Muscle Group */
  muscle_group?: string | null;
  /** Difficulty */
  difficulty?: string | null;
  /** Equipment */
  equipment?: string | null;
  /** Search */
  search?: string | null;
  /**
   * Include Metadata
   * @default false
   */
  include_metadata?: boolean;
  /**
   * Limit
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
  /**
   * Offset
   * @min 0
   * @default 0
   */
  offset?: number;
  /**
   * With Categories
   * @default false
   */
  with_categories?: boolean;
}

export type ListExercisesData = ExercisesListResponse;

export type ListExercisesError = HTTPValidationError;

export interface GetExerciseParams {
  /**
   * Exercise Id
   * ID del ejercicio a obtener
   */
  exerciseId: string;
}

export type GetExerciseData = ExerciseResponse;

export type GetExerciseError = HTTPValidationError;

export interface UpdateExerciseParams {
  /**
   * Exercise Id
   * ID del ejercicio a actualizar
   */
  exerciseId: string;
}

export type UpdateExerciseData = ExerciseResponse;

export type UpdateExerciseError = HTTPValidationError;

export interface DeleteExerciseParams {
  /**
   * Exercise Id
   * ID del ejercicio a eliminar
   */
  exerciseId: string;
}

/** Response Delete Exercise */
export type DeleteExerciseData = Record<string, any>;

export type DeleteExerciseError = HTTPValidationError;

export type CreateExerciseData = ExerciseResponse;

export type CreateExerciseError = HTTPValidationError;

/** Exercises */
export type BulkImportExercisesPayload = ExerciseCreate[];

/** Response Bulk Import Exercises */
export type BulkImportExercisesData = Record<string, any>;

export type BulkImportExercisesError = HTTPValidationError;

export type McpLogMeasurementData = ProgressResponse;

export type McpLogMeasurementError = HTTPValidationError;

export type McpLogWorkoutData = ProgressResponse;

export type McpLogWorkoutError = HTTPValidationError;

export type McpLogSubjectiveFeedbackData = ProgressResponse;

export type McpLogSubjectiveFeedbackError = HTTPValidationError;

export type McpGetProgressHistoryData = AppApisProgressV2ProgressHistoryResponse;

export type McpGetProgressHistoryError = HTTPValidationError;

export type McpGetProgressSummaryData = AppApisProgressV2ProgressSummaryResponse;

export type McpGetProgressSummaryError = HTTPValidationError;
