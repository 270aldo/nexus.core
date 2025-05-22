import {
  ActivateMcpData,
  ActivateMcpEndpoint2Data,
  ActivateMcpEndpoint2Error,
  ActivateMcpEndpointData,
  ActivateMcpEndpointError,
  ActivateMcpError,
  ActivationRequest,
  ActivityLogRequest,
  AddClientData,
  AddClientDirect22Data,
  AddClientDirect22Error,
  AddClientDirect2Data,
  AddClientDirect2Error,
  AddClientError,
  AddClientRequest,
  AdherenceMetricsRequest,
  AdvancedFoodSearchData,
  AdvancedFoodSearchError,
  AgentAnalysisRequest,
  AnalysisRequest,
  AppApisCommunicationReminderRequest,
  AppApisCommunicationTemplatedMessageRequest,
  AppApisMcpAnalysisBusinessMetricsRequest,
  AppApisMcpAnalysisProgramEffectivenessRequest,
  AppApisMcpCommunicationReminderRequest,
  AppApisMcpCommunicationTemplatedMessageRequest,
  AppApisMcpDirect2SimpleClient,
  AppApisMcpEmergencySimpleClient,
  AppApisMcpnewBusinessMetricsRequest,
  AppApisMcpnewProgramEffectivenessRequest,
  AppApisMcpnewProgressHistoryRequest,
  AppApisProgressFeedbackRequest,
  AppApisProgressMeasurementRequest,
  AppApisProgressV2FeedbackRequest,
  AppApisProgressV2MeasurementRequest,
  AppApisProgressV2ProgressHistoryRequest,
  AppApisProgressV2WorkoutRequest,
  AppApisProgressWorkoutRequest,
  AssignNutritionPlanData,
  AssignNutritionPlanError,
  AssignNutritionRequest,
  AssignProgramRequest,
  AssignProgramToClientData,
  AssignProgramToClientError,
  BulkImportExercisesData,
  BulkImportExercisesError,
  BulkImportExercisesPayload,
  ChatRequest,
  CheckHealthData,
  ClientAdherenceRequest,
  ClientCreate,
  ClientDetailsRequest,
  ClientNutritionRequest,
  ClientNutritionUpdate,
  ClientProgramRequest,
  ClientProgramUpdate,
  ClientReportRequest,
  ClientRequest,
  ClientSearchParams,
  ClientSearchRequest,
  CoachAssistantChatData,
  CoachAssistantChatError,
  CommunicationHistoryRequest,
  CreateClientAdminData,
  CreateClientAdminError,
  CreateClientSimpleData,
  CreateClientSimpleError,
  CreateExerciseData,
  CreateExerciseError,
  CreateNotificationData,
  CreateNotificationError,
  CreateNutritionPlanData,
  CreateNutritionPlanError,
  DeleteExerciseData,
  DeleteExerciseError,
  DeleteExerciseParams,
  DeleteNotificationData,
  DeleteNotificationError,
  DeleteNotificationParams,
  ExerciseCreate,
  ExerciseDetailsRequest,
  ExerciseUpdate,
  FoodNutritionRequest,
  FoodSearchRequest,
  GenerateBusinessMetrics2Data,
  GenerateBusinessMetrics2Error,
  GenerateBusinessMetrics2Params,
  GenerateBusinessMetricsData,
  GenerateBusinessMetricsError,
  GenerateBusinessMetricsParams,
  GenerateClientReportData,
  GenerateClientReportError,
  GetActivityLogsData,
  GetActivityLogsError,
  GetActivityLogsRequest,
  GetAgentSystemStatusData,
  GetCategoriesData,
  GetClaudeMcpStatus2Data,
  GetClaudeMcpStatusData,
  GetClientActiveNutritionData,
  GetClientActiveNutritionError,
  GetClientActiveNutritionParams,
  GetClientActiveProgramData,
  GetClientActiveProgramError,
  GetClientActiveProgramParams,
  GetClientAdherenceMetrics2Data,
  GetClientAdherenceMetrics2Error,
  GetClientAdherenceMetrics2Params,
  GetClientAdherenceMetricsData,
  GetClientAdherenceMetricsError,
  GetClientAdherenceMetricsParams,
  GetClientByIdAdminData,
  GetClientByIdAdminError,
  GetClientByIdAdminParams,
  GetClientByIdData,
  GetClientByIdError,
  GetClientByIdParams,
  GetCommunicationHistoryData,
  GetCommunicationHistoryError,
  GetCommunicationHistoryParams,
  GetExerciseData,
  GetExerciseDetailsData,
  GetExerciseDetailsError,
  GetExerciseDetailsParams,
  GetExerciseError,
  GetExerciseParams,
  GetMcpAccessLogsEndpointData,
  GetMcpStatusData,
  GetMcpStatusEndpoint2Data,
  GetMcpStatusEndpointData,
  GetMcpToolsEndpointData,
  GetNutritionPlanData,
  GetNutritionPlanError,
  GetNutritionPlanParams,
  GetNutritionTemplatesData,
  GetNutritionTemplatesError,
  GetNutritionTemplatesParams,
  GetProgramEffectiveness2Data,
  GetProgramEffectiveness2Error,
  GetProgramEffectiveness2Params,
  GetProgramEffectivenessData,
  GetProgramEffectivenessError,
  GetProgramEffectivenessParams,
  GetProgressHistoryData,
  GetProgressHistoryError,
  GetProgressHistoryParams,
  GetProgressSummaryData,
  GetProgressSummaryError,
  GetProgressSummaryParams,
  GetSchemaSummaryData,
  GetSuggestedPromptsData,
  GetSuggestedPromptsError,
  GetSuggestedPromptsParams,
  GetSupabaseConfigData,
  GetTrainingProgramData,
  GetTrainingProgramError,
  GetTrainingProgramParams,
  GetTrainingTemplatesData,
  GetTrainingTemplatesError,
  GetTrainingTemplatesParams,
  GetUserNotificationsData,
  GetUserNotificationsError,
  GetUserNotificationsParams,
  InitializeActivityLogsTableData,
  InitializeDatabaseData,
  InitializeDatabaseError,
  InitializeDatabaseParams,
  ListExercisesData,
  ListExercisesError,
  ListExercisesParams,
  LogActivityData,
  LogActivityError,
  LogActivityPayload,
  LogActivityRequest,
  LogMeasurementData,
  LogMeasurementError,
  LogSubjectiveFeedbackData,
  LogSubjectiveFeedbackError,
  LogWorkoutData,
  LogWorkoutError,
  LookupFoodNutritionData,
  LookupFoodNutritionError,
  LookupFoodNutritionParams,
  MCPActivationRequest,
  MarkAllNotificationsReadData,
  MarkAllNotificationsReadError,
  MarkAllNotificationsReadParams,
  MarkNotificationReadData,
  MarkNotificationReadError,
  MarkNotificationReadParams,
  McpGetProgressHistoryData,
  McpGetProgressHistoryError,
  McpGetProgressSummaryData,
  McpGetProgressSummaryError,
  McpLogMeasurementData,
  McpLogMeasurementError,
  McpLogSubjectiveFeedbackData,
  McpLogSubjectiveFeedbackError,
  McpLogWorkoutData,
  McpLogWorkoutError,
  McpnewAddClientData,
  McpnewAddClientError,
  McpnewAssignNutritionPlanData,
  McpnewAssignNutritionPlanError,
  McpnewAssignProgramToClientData,
  McpnewAssignProgramToClientError,
  McpnewCreateNutritionPlanData,
  McpnewCreateNutritionPlanError,
  McpnewGenerateBusinessMetrics2Data,
  McpnewGenerateBusinessMetrics2Error,
  McpnewGenerateBusinessMetricsData,
  McpnewGenerateBusinessMetricsError,
  McpnewGenerateClientReportData,
  McpnewGenerateClientReportError,
  McpnewGetAgentSystemStatusData,
  McpnewGetClientActiveNutritionData,
  McpnewGetClientActiveNutritionError,
  McpnewGetClientActiveProgramData,
  McpnewGetClientActiveProgramError,
  McpnewGetClientAdherenceMetrics2Data,
  McpnewGetClientAdherenceMetrics2Error,
  McpnewGetClientAdherenceMetricsData,
  McpnewGetClientAdherenceMetricsError,
  McpnewGetClientDetailsData,
  McpnewGetClientDetailsError,
  McpnewGetCommunicationHistoryData,
  McpnewGetCommunicationHistoryError,
  McpnewGetExerciseDetailsData,
  McpnewGetExerciseDetailsError,
  McpnewGetNutritionPlanData,
  McpnewGetNutritionPlanError,
  McpnewGetNutritionTemplatesData,
  McpnewGetNutritionTemplatesError,
  McpnewGetProgramEffectiveness2Data,
  McpnewGetProgramEffectiveness2Error,
  McpnewGetProgramEffectivenessData,
  McpnewGetProgramEffectivenessError,
  McpnewGetProgressHistoryData,
  McpnewGetProgressHistoryError,
  McpnewGetTrainingProgramData,
  McpnewGetTrainingProgramError,
  McpnewGetTrainingTemplatesData,
  McpnewGetTrainingTemplatesError,
  McpnewLookupFoodNutritionData,
  McpnewLookupFoodNutritionError,
  McpnewRunAgentAnalysisData,
  McpnewRunAgentAnalysisError,
  McpnewScheduleClientReminderData,
  McpnewScheduleClientReminderError,
  McpnewSearchClientsData,
  McpnewSearchClientsError,
  McpnewSendTemplatedMessageData,
  McpnewSendTemplatedMessageError,
  McpnewTranslateProgramToNaturalLanguageData,
  McpnewTranslateProgramToNaturalLanguageError,
  McpnewUpdateClientNutritionData,
  McpnewUpdateClientNutritionError,
  McpnewUpdateClientProgramData,
  McpnewUpdateClientProgramError,
  NotificationCreate,
  NutritionPlanAssignment,
  NutritionPlanCreate,
  NutritionPlanInput,
  NutritionPlanRequest,
  NutritionTemplatesRequest,
  ProgressSummaryRequest,
  RecordSystemActivityData,
  RecordSystemActivityError,
  ReportRequest,
  RetrieveSystemActivitiesData,
  RetrieveSystemActivitiesError,
  RunAgentAnalysisData,
  RunAgentAnalysisError,
  ScheduleClientReminderData,
  ScheduleClientReminderError,
  SearchClientsAdminData,
  SearchClientsAdminError,
  SearchClientsAdminParams,
  SearchClientsData,
  SearchClientsError,
  SendTemplatedMessageData,
  SendTemplatedMessageError,
  SimpleClientRequest,
  TrainingProgramAssignment,
  TrainingProgramRequest,
  TrainingTemplatesRequest,
  TranslateProgramRequest,
  TranslateProgramToNaturalLanguageData,
  TranslateProgramToNaturalLanguageError,
  TranslationRequest,
  UpdateClientData,
  UpdateClientError,
  UpdateClientNutritionData,
  UpdateClientNutritionError,
  UpdateClientNutritionParams,
  UpdateClientNutritionRequest,
  UpdateClientParams,
  UpdateClientProgramData,
  UpdateClientProgramError,
  UpdateClientProgramParams,
  UpdateClientProgramRequest,
  UpdateExerciseData,
  UpdateExerciseError,
  UpdateExerciseParams,
  UpdateMcpSettingsEndpointData,
  UpdateMcpSettingsEndpointError,
  UpdateMcpSettingsEndpointPayload,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get Supabase configuration for the frontend
   *
   * @tags dbtn/module:config
   * @name get_supabase_config
   * @summary Get Supabase Config
   * @request GET:/routes/supabase-config
   */
  get_supabase_config = (params: RequestParams = {}) =>
    this.request<GetSupabaseConfigData, any>({
      path: `/routes/supabase-config`,
      method: "GET",
      ...params,
    });

  /**
   * @description Send a templated message to a client through specified channels
   *
   * @tags dbtn/module:communication
   * @name send_templated_message
   * @summary Send Templated Message
   * @request POST:/routes/communication/send-message
   */
  send_templated_message = (data: AppApisCommunicationTemplatedMessageRequest, params: RequestParams = {}) =>
    this.request<SendTemplatedMessageData, SendTemplatedMessageError>({
      path: `/routes/communication/send-message`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Schedule a reminder for a client
   *
   * @tags dbtn/module:communication
   * @name schedule_client_reminder
   * @summary Schedule Client Reminder
   * @request POST:/routes/communication/schedule-reminder
   */
  schedule_client_reminder = (data: AppApisCommunicationReminderRequest, params: RequestParams = {}) =>
    this.request<ScheduleClientReminderData, ScheduleClientReminderError>({
      path: `/routes/communication/schedule-reminder`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the communication history for a client
   *
   * @tags dbtn/module:communication
   * @name get_communication_history
   * @summary Get Communication History
   * @request GET:/routes/communication/history/{client_id}
   */
  get_communication_history = ({ clientId, ...query }: GetCommunicationHistoryParams, params: RequestParams = {}) =>
    this.request<GetCommunicationHistoryData, GetCommunicationHistoryError>({
      path: `/routes/communication/history/${clientId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get adherence metrics for a client over a specified time period
   *
   * @tags dbtn/module:analytics
   * @name get_client_adherence_metrics
   * @summary Get Client Adherence Metrics
   * @request GET:/routes/analysis/client/{client_id}/adherence
   */
  get_client_adherence_metrics = (
    { clientId, ...query }: GetClientAdherenceMetricsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetClientAdherenceMetricsData, GetClientAdherenceMetricsError>({
      path: `/routes/analysis/client/${clientId}/adherence`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get effectiveness metrics for a specific program
   *
   * @tags dbtn/module:analytics
   * @name get_program_effectiveness
   * @summary Get Program Effectiveness
   * @request GET:/routes/analysis/program/{program_id}/effectiveness
   */
  get_program_effectiveness = ({ programId, ...query }: GetProgramEffectivenessParams, params: RequestParams = {}) =>
    this.request<GetProgramEffectivenessData, GetProgramEffectivenessError>({
      path: `/routes/analysis/program/${programId}/effectiveness`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Generate business metrics and KPIs for the specified date range and segments
   *
   * @tags dbtn/module:analytics
   * @name generate_business_metrics
   * @summary Generate Business Metrics
   * @request GET:/routes/analysis/business/metrics
   */
  generate_business_metrics = (query: GenerateBusinessMetricsParams, params: RequestParams = {}) =>
    this.request<GenerateBusinessMetricsData, GenerateBusinessMetricsError>({
      path: `/routes/analysis/business/metrics`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Initialize the database with the required schema and policies
   *
   * @tags dbtn/module:database
   * @name initialize_database
   * @summary Initialize Database
   * @request POST:/routes/init-database
   */
  initialize_database = (query: InitializeDatabaseParams, params: RequestParams = {}) =>
    this.request<InitializeDatabaseData, InitializeDatabaseError>({
      path: `/routes/init-database`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get a summary of the database schema
   *
   * @tags dbtn/module:database
   * @name get_schema_summary
   * @summary Get Schema Summary
   * @request GET:/routes/schema-summary
   */
  get_schema_summary = (params: RequestParams = {}) =>
    this.request<GetSchemaSummaryData, any>({
      path: `/routes/schema-summary`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate business metrics for the dashboard
   *
   * @tags dbtn/module:business
   * @name generate_business_metrics2
   * @summary Generate Business Metrics2
   * @request GET:/routes/business-metrics
   */
  generate_business_metrics2 = (query: GenerateBusinessMetrics2Params, params: RequestParams = {}) =>
    this.request<GenerateBusinessMetrics2Data, GenerateBusinessMetrics2Error>({
      path: `/routes/business-metrics`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get adherence metrics for a specific client
   *
   * @tags dbtn/module:business
   * @name get_client_adherence_metrics2
   * @summary Get Client Adherence Metrics2
   * @request GET:/routes/client-adherence-metrics
   */
  get_client_adherence_metrics2 = (query: GetClientAdherenceMetrics2Params, params: RequestParams = {}) =>
    this.request<GetClientAdherenceMetrics2Data, GetClientAdherenceMetrics2Error>({
      path: `/routes/client-adherence-metrics`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get effectiveness metrics for a specific program
   *
   * @tags dbtn/module:business
   * @name get_program_effectiveness2
   * @summary Get Program Effectiveness2
   * @request GET:/routes/program-effectiveness
   */
  get_program_effectiveness2 = (query: GetProgramEffectiveness2Params, params: RequestParams = {}) =>
    this.request<GetProgramEffectiveness2Data, GetProgramEffectiveness2Error>({
      path: `/routes/program-effectiveness`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get the current status of the agent system - moved from /agent/status to avoid conflict with MCP endpoint
   *
   * @tags dbtn/module:agent
   * @name get_agent_system_status
   * @summary Get Agent System Status
   * @request GET:/routes/agent/system-status
   */
  get_agent_system_status = (params: RequestParams = {}) =>
    this.request<GetAgentSystemStatusData, any>({
      path: `/routes/agent/system-status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Run an AI analysis on client data
   *
   * @tags dbtn/module:agent
   * @name run_agent_analysis
   * @summary Run Agent Analysis
   * @request POST:/routes/agent/analyze
   */
  run_agent_analysis = (data: AnalysisRequest, params: RequestParams = {}) =>
    this.request<RunAgentAnalysisData, RunAgentAnalysisError>({
      path: `/routes/agent/analyze`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a comprehensive client report
   *
   * @tags dbtn/module:agent
   * @name generate_client_report
   * @summary Generate Client Report
   * @request POST:/routes/agent/reports
   */
  generate_client_report = (data: ReportRequest, params: RequestParams = {}) =>
    this.request<GenerateClientReportData, GenerateClientReportError>({
      path: `/routes/agent/reports`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Translate structured program data into natural language descriptions
   *
   * @tags dbtn/module:agent
   * @name translate_program_to_natural_language
   * @summary Translate Program To Natural Language
   * @request POST:/routes/agent/translate
   */
  translate_program_to_natural_language = (data: TranslationRequest, params: RequestParams = {}) =>
    this.request<TranslateProgramToNaturalLanguageData, TranslateProgramToNaturalLanguageError>({
      path: `/routes/agent/translate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Chat with the coach assistant to get AI-powered recommendations and analysis
   *
   * @tags coach_assistant, dbtn/module:coach_assistant
   * @name coach_assistant_chat
   * @summary Coach Assistant Chat
   * @request POST:/routes/chat
   */
  coach_assistant_chat = (data: ChatRequest, params: RequestParams = {}) =>
    this.request<CoachAssistantChatData, CoachAssistantChatError>({
      path: `/routes/chat`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get suggested prompts for the coach assistant based on client and program context
   *
   * @tags coach_assistant, dbtn/module:coach_assistant
   * @name get_suggested_prompts
   * @summary Get Suggested Prompts
   * @request GET:/routes/suggested-prompts
   */
  get_suggested_prompts = (query: GetSuggestedPromptsParams, params: RequestParams = {}) =>
    this.request<GetSuggestedPromptsData, GetSuggestedPromptsError>({
      path: `/routes/suggested-prompts`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new notification for a user This endpoint allows creating notifications for important user events like: - Reminders for upcoming client appointments - Alerts for missed training sessions - Milestone notifications for client achievements - System alerts about program changes
   *
   * @tags dbtn/module:notifications
   * @name create_notification
   * @summary Create Notification
   * @request POST:/routes/notifications
   */
  create_notification = (data: NotificationCreate, params: RequestParams = {}) =>
    this.request<CreateNotificationData, CreateNotificationError>({
      path: `/routes/notifications`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get notifications for a specific user Retrieves a list of notifications for the specified user, with options to filter and paginate.
   *
   * @tags dbtn/module:notifications
   * @name get_user_notifications
   * @summary Get User Notifications
   * @request GET:/routes/notifications/user/{user_id}
   */
  get_user_notifications = ({ userId, ...query }: GetUserNotificationsParams, params: RequestParams = {}) =>
    this.request<GetUserNotificationsData, GetUserNotificationsError>({
      path: `/routes/notifications/user/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Mark a notification as read Updates the read status of a notification to indicate it has been seen by the user.
   *
   * @tags dbtn/module:notifications
   * @name mark_notification_read
   * @summary Mark Notification Read
   * @request PATCH:/routes/notifications/{notification_id}/read
   */
  mark_notification_read = ({ notificationId, ...query }: MarkNotificationReadParams, params: RequestParams = {}) =>
    this.request<MarkNotificationReadData, MarkNotificationReadError>({
      path: `/routes/notifications/${notificationId}/read`,
      method: "PATCH",
      ...params,
    });

  /**
   * @description Mark all notifications for a user as read Updates all unread notifications for the specified user to be marked as read.
   *
   * @tags dbtn/module:notifications
   * @name mark_all_notifications_read
   * @summary Mark All Notifications Read
   * @request PATCH:/routes/notifications/user/{user_id}/read-all
   */
  mark_all_notifications_read = ({ userId, ...query }: MarkAllNotificationsReadParams, params: RequestParams = {}) =>
    this.request<MarkAllNotificationsReadData, MarkAllNotificationsReadError>({
      path: `/routes/notifications/user/${userId}/read-all`,
      method: "PATCH",
      ...params,
    });

  /**
   * @description Delete a specific notification Permanently removes a notification from the system.
   *
   * @tags dbtn/module:notifications
   * @name delete_notification
   * @summary Delete Notification
   * @request DELETE:/routes/notifications/{notification_id}
   */
  delete_notification = ({ notificationId, ...query }: DeleteNotificationParams, params: RequestParams = {}) =>
    this.request<DeleteNotificationData, DeleteNotificationError>({
      path: `/routes/notifications/${notificationId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create a new client with admin privileges to bypass RLS
   *
   * @tags client-service, dbtn/module:client_service
   * @name create_client_admin
   * @summary Create Client Admin
   * @request POST:/routes/client-service/clients
   */
  create_client_admin = (data: ClientCreate, params: RequestParams = {}) =>
    this.request<CreateClientAdminData, CreateClientAdminError>({
      path: `/routes/client-service/clients`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Search clients with admin privileges
   *
   * @tags client-service, dbtn/module:client_service
   * @name search_clients_admin
   * @summary Search Clients Admin
   * @request GET:/routes/client-service/clients
   */
  search_clients_admin = (query: SearchClientsAdminParams, params: RequestParams = {}) =>
    this.request<SearchClientsAdminData, SearchClientsAdminError>({
      path: `/routes/client-service/clients`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a client by ID with admin privileges
   *
   * @tags client-service, dbtn/module:client_service
   * @name get_client_by_id_admin
   * @summary Get Client By Id Admin
   * @request GET:/routes/client-service/clients/{client_id}
   */
  get_client_by_id_admin = ({ clientId, ...query }: GetClientByIdAdminParams, params: RequestParams = {}) =>
    this.request<GetClientByIdAdminData, GetClientByIdAdminError>({
      path: `/routes/client-service/clients/${clientId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Endpoint simplificado para crear clientes desde Claude Desktop
   *
   * @tags mcp, dbtn/module:claude_mcp
   * @name create_client_simple
   * @summary Create Client Simple
   * @request POST:/routes/claude-mcp/create-client
   */
  create_client_simple = (data: SimpleClientRequest, params: RequestParams = {}) =>
    this.request<CreateClientSimpleData, CreateClientSimpleError>({
      path: `/routes/claude-mcp/create-client`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Verificar el estado de la integración MCP con Claude Desktop
   *
   * @tags mcp, dbtn/module:claude_mcp
   * @name get_claude_mcp_status
   * @summary Get Claude Mcp Status
   * @request GET:/routes/claude-mcp/status
   */
  get_claude_mcp_status = (params: RequestParams = {}) =>
    this.request<GetClaudeMcpStatusData, any>({
      path: `/routes/claude-mcp/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Obtiene el estado actual del servicio MCP
   *
   * @tags mcp-activation, dbtn/module:mcp_activator2
   * @name get_mcp_status
   * @summary Get Mcp Status
   * @request GET:/routes/mcp/status
   */
  get_mcp_status = (params: RequestParams = {}) =>
    this.request<GetMcpStatusData, any>({
      path: `/routes/mcp/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Activa el servicio MCP para un cliente específico o para toda la instancia
   *
   * @tags mcp-activation, dbtn/module:mcp_activator2
   * @name activate_mcp
   * @summary Activate Mcp
   * @request POST:/routes/mcp/activate
   */
  activate_mcp = (data: ActivationRequest, params: RequestParams = {}) =>
    this.request<ActivateMcpData, ActivateMcpError>({
      path: `/routes/mcp/activate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Crea un cliente directo desde Claude Desktop - solución emergencia
   *
   * @tags direct-mcp, dbtn/module:mcp_emergency
   * @name add_client_direct2
   * @summary Add Client Direct2
   * @request POST:/routes/add-client-direct2
   */
  add_client_direct2 = (data: AppApisMcpEmergencySimpleClient, params: RequestParams = {}) =>
    this.request<AddClientDirect2Data, AddClientDirect2Error>({
      path: `/routes/add-client-direct2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Adds a new client to the system
   *
   * @tags dbtn/module:claude_direct
   * @name add_client
   * @summary Add Client
   * @request POST:/routes/add_client
   */
  add_client = (data: ClientRequest, params: RequestParams = {}) =>
    this.request<AddClientData, AddClientError>({
      path: `/routes/add_client`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Searches for clients matching the given criteria
   *
   * @tags dbtn/module:claude_direct
   * @name search_clients
   * @summary Search Clients
   * @request POST:/routes/search_clients
   */
  search_clients = (data: ClientSearchParams, params: RequestParams = {}) =>
    this.request<SearchClientsData, SearchClientsError>({
      path: `/routes/search_clients`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Gets client details by ID
   *
   * @tags dbtn/module:claude_direct
   * @name get_client_by_id
   * @summary Get Client By Id
   * @request GET:/routes/get_client_by_id
   */
  get_client_by_id = (query: GetClientByIdParams, params: RequestParams = {}) =>
    this.request<GetClientByIdData, GetClientByIdError>({
      path: `/routes/get_client_by_id`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Updates an existing client's information
   *
   * @tags dbtn/module:claude_direct
   * @name update_client
   * @summary Update Client
   * @request POST:/routes/update_client
   */
  update_client = (query: UpdateClientParams, data: ClientRequest, params: RequestParams = {}) =>
    this.request<UpdateClientData, UpdateClientError>({
      path: `/routes/update_client`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Checks the status of Claude MCP tools
   *
   * @tags dbtn/module:claude_direct
   * @name get_claude_mcp_status2
   * @summary Get Claude Mcp Status2
   * @request GET:/routes/get_claude_mcp_status2
   */
  get_claude_mcp_status2 = (params: RequestParams = {}) =>
    this.request<GetClaudeMcpStatus2Data, any>({
      path: `/routes/get_claude_mcp_status2`,
      method: "GET",
      ...params,
    });

  /**
   * @description Crea un cliente directamente desde Claude Desktop - endpoint optimizado
   *
   * @tags mcp-direct, dbtn/module:mcp_direct2
   * @name add_client_direct22
   * @summary Add Client Direct22
   * @request POST:/routes/mcp/add-client-direct22
   */
  add_client_direct22 = (data: AppApisMcpDirect2SimpleClient, params: RequestParams = {}) =>
    this.request<AddClientDirect22Data, AddClientDirect22Error>({
      path: `/routes/mcp/add-client-direct22`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Send a templated message to a client with custom parameters
   *
   * @tags MCP-Communication, dbtn/module:mcp_communication
   * @name mcpnew_send_templated_message
   * @summary Mcpnew Send Templated Message
   * @request POST:/routes/mcp/send-templated-message
   */
  mcpnew_send_templated_message = (data: AppApisMcpCommunicationTemplatedMessageRequest, params: RequestParams = {}) =>
    this.request<McpnewSendTemplatedMessageData, McpnewSendTemplatedMessageError>({
      path: `/routes/mcp/send-templated-message`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Schedule a reminder for a client for a specific date
   *
   * @tags MCP-Communication, dbtn/module:mcp_communication
   * @name mcpnew_schedule_client_reminder
   * @summary Mcpnew Schedule Client Reminder
   * @request POST:/routes/mcp/schedule-client-reminder
   */
  mcpnew_schedule_client_reminder = (data: AppApisMcpCommunicationReminderRequest, params: RequestParams = {}) =>
    this.request<McpnewScheduleClientReminderData, McpnewScheduleClientReminderError>({
      path: `/routes/mcp/schedule-client-reminder`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve communication history for a specific client
   *
   * @tags MCP-Communication, dbtn/module:mcp_communication
   * @name mcpnew_get_communication_history
   * @summary Mcpnew Get Communication History
   * @request POST:/routes/mcp/communication-history
   */
  mcpnew_get_communication_history = (data: CommunicationHistoryRequest, params: RequestParams = {}) =>
    this.request<McpnewGetCommunicationHistoryData, McpnewGetCommunicationHistoryError>({
      path: `/routes/mcp/communication-history`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate client adherence metrics for workout, nutrition, and communication
   *
   * @tags MCP-Analysis, dbtn/module:mcp_analysis
   * @name mcpnew_get_client_adherence_metrics
   * @summary Mcpnew Get Client Adherence Metrics
   * @request POST:/routes/mcp/client-adherence
   */
  mcpnew_get_client_adherence_metrics = (data: ClientAdherenceRequest, params: RequestParams = {}) =>
    this.request<McpnewGetClientAdherenceMetricsData, McpnewGetClientAdherenceMetricsError>({
      path: `/routes/mcp/client-adherence`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate effectiveness metrics for a specific training program
   *
   * @tags MCP-Analysis, dbtn/module:mcp_analysis
   * @name mcpnew_get_program_effectiveness
   * @summary Mcpnew Get Program Effectiveness
   * @request POST:/routes/mcp/program-effectiveness
   */
  mcpnew_get_program_effectiveness = (
    data: AppApisMcpAnalysisProgramEffectivenessRequest,
    params: RequestParams = {},
  ) =>
    this.request<McpnewGetProgramEffectivenessData, McpnewGetProgramEffectivenessError>({
      path: `/routes/mcp/program-effectiveness`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate business metrics and KPIs for the specified date range and segments
   *
   * @tags MCP-Analysis, dbtn/module:mcp_analysis
   * @name mcpnew_generate_business_metrics
   * @summary Mcpnew Generate Business Metrics
   * @request POST:/routes/mcp/business-metrics
   */
  mcpnew_generate_business_metrics = (data: AppApisMcpAnalysisBusinessMetricsRequest, params: RequestParams = {}) =>
    this.request<McpnewGenerateBusinessMetricsData, McpnewGenerateBusinessMetricsError>({
      path: `/routes/mcp/business-metrics`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Redirige a la implementación principal en mcp_system
   *
   * @tags mcp-setup, dbtn/module:mcp_activation
   * @name get_mcp_status_endpoint
   * @summary Get Mcp Status Endpoint
   * @request GET:/routes/get_mcp_status
   */
  get_mcp_status_endpoint = (params: RequestParams = {}) =>
    this.request<GetMcpStatusEndpointData, any>({
      path: `/routes/get_mcp_status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Activa el MCP para Claude Desktop
   *
   * @tags mcp-setup, dbtn/module:mcp_activation
   * @name activate_mcp_endpoint
   * @summary Activate Mcp Endpoint
   * @request POST:/routes/activate_mcp
   */
  activate_mcp_endpoint = (data: MCPActivationRequest, params: RequestParams = {}) =>
    this.request<ActivateMcpEndpointData, ActivateMcpEndpointError>({
      path: `/routes/activate_mcp`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Obtiene el estado actual del servicio MCP para Claude Desktop
   *
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name get_mcp_status_endpoint2
   * @summary Get Mcp Status Endpoint2
   * @request GET:/routes/mcp/status2
   */
  get_mcp_status_endpoint2 = (params: RequestParams = {}) =>
    this.request<GetMcpStatusEndpoint2Data, any>({
      path: `/routes/mcp/status2`,
      method: "GET",
      ...params,
    });

  /**
   * @description Activa el MCP para Claude Desktop
   *
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name activate_mcp_endpoint2
   * @summary Activate Mcp Endpoint2
   * @request POST:/routes/mcp/activate2
   */
  activate_mcp_endpoint2 = (data: MCPActivationRequest, params: RequestParams = {}) =>
    this.request<ActivateMcpEndpoint2Data, ActivateMcpEndpoint2Error>({
      path: `/routes/mcp/activate2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Obtiene la lista de herramientas disponibles en el MCP
   *
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name get_mcp_tools_endpoint
   * @summary Get Mcp Tools Endpoint
   * @request GET:/routes/mcp/tools
   */
  get_mcp_tools_endpoint = (params: RequestParams = {}) =>
    this.request<GetMcpToolsEndpointData, any>({
      path: `/routes/mcp/tools`,
      method: "GET",
      ...params,
    });

  /**
   * @description Obtiene los registros de acceso al MCP
   *
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name get_mcp_access_logs_endpoint
   * @summary Get Mcp Access Logs Endpoint
   * @request GET:/routes/mcp/access-logs
   */
  get_mcp_access_logs_endpoint = (params: RequestParams = {}) =>
    this.request<GetMcpAccessLogsEndpointData, any>({
      path: `/routes/mcp/access-logs`,
      method: "GET",
      ...params,
    });

  /**
   * @description Actualiza la configuración del MCP
   *
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name update_mcp_settings_endpoint
   * @summary Update Mcp Settings Endpoint
   * @request POST:/routes/mcp/settings
   */
  update_mcp_settings_endpoint = (data: UpdateMcpSettingsEndpointPayload, params: RequestParams = {}) =>
    this.request<UpdateMcpSettingsEndpointData, UpdateMcpSettingsEndpointError>({
      path: `/routes/mcp/settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log body measurements for a client
   *
   * @tags dbtn/module:progress
   * @name log_measurement
   * @summary Log Measurement
   * @request POST:/routes/progress/measurements
   */
  log_measurement = (data: AppApisProgressMeasurementRequest, params: RequestParams = {}) =>
    this.request<LogMeasurementData, LogMeasurementError>({
      path: `/routes/progress/measurements`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log a completed workout for a client
   *
   * @tags dbtn/module:progress
   * @name log_workout
   * @summary Log Workout
   * @request POST:/routes/progress/workouts
   */
  log_workout = (data: AppApisProgressWorkoutRequest, params: RequestParams = {}) =>
    this.request<LogWorkoutData, LogWorkoutError>({
      path: `/routes/progress/workouts`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log subjective feedback from a client
   *
   * @tags dbtn/module:progress
   * @name log_subjective_feedback
   * @summary Log Subjective Feedback
   * @request POST:/routes/progress/feedback
   */
  log_subjective_feedback = (data: AppApisProgressFeedbackRequest, params: RequestParams = {}) =>
    this.request<LogSubjectiveFeedbackData, LogSubjectiveFeedbackError>({
      path: `/routes/progress/feedback`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get progress history for a client with optional filtering
   *
   * @tags dbtn/module:progress
   * @name get_progress_history
   * @summary Get Progress History
   * @request GET:/routes/progress/history/{client_id}
   */
  get_progress_history = ({ clientId, ...query }: GetProgressHistoryParams, params: RequestParams = {}) =>
    this.request<GetProgressHistoryData, GetProgressHistoryError>({
      path: `/routes/progress/history/${clientId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get summary of progress metrics for a client
   *
   * @tags dbtn/module:progress
   * @name get_progress_summary
   * @summary Get Progress Summary
   * @request GET:/routes/progress/summary/{client_id}
   */
  get_progress_summary = ({ clientId, ...query }: GetProgressSummaryParams, params: RequestParams = {}) =>
    this.request<GetProgressSummaryData, GetProgressSummaryError>({
      path: `/routes/progress/summary/${clientId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get training program templates with optional filtering
   *
   * @tags dbtn/module:training
   * @name get_training_templates
   * @summary Get Training Templates
   * @request GET:/routes/training/templates
   */
  get_training_templates = (query: GetTrainingTemplatesParams, params: RequestParams = {}) =>
    this.request<GetTrainingTemplatesData, GetTrainingTemplatesError>({
      path: `/routes/training/templates`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific training program by ID
   *
   * @tags dbtn/module:training
   * @name get_training_program
   * @summary Get Training Program
   * @request GET:/routes/training/programs/{program_id}
   */
  get_training_program = ({ programId, ...query }: GetTrainingProgramParams, params: RequestParams = {}) =>
    this.request<GetTrainingProgramData, GetTrainingProgramError>({
      path: `/routes/training/programs/${programId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a client's active training program
   *
   * @tags dbtn/module:training
   * @name get_client_active_program
   * @summary Get Client Active Program
   * @request GET:/routes/training/clients/{client_id}/program
   */
  get_client_active_program = ({ clientId, ...query }: GetClientActiveProgramParams, params: RequestParams = {}) =>
    this.request<GetClientActiveProgramData, GetClientActiveProgramError>({
      path: `/routes/training/clients/${clientId}/program`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a client's active training program
   *
   * @tags dbtn/module:training
   * @name update_client_program
   * @summary Update Client Program
   * @request PATCH:/routes/training/clients/{client_id}/program
   */
  update_client_program = (
    { clientId, ...query }: UpdateClientProgramParams,
    data: ClientProgramUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateClientProgramData, UpdateClientProgramError>({
      path: `/routes/training/clients/${clientId}/program`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Assign a training program to a client
   *
   * @tags dbtn/module:training
   * @name assign_program_to_client
   * @summary Assign Program To Client
   * @request POST:/routes/training/clients/program
   */
  assign_program_to_client = (data: TrainingProgramAssignment, params: RequestParams = {}) =>
    this.request<AssignProgramToClientData, AssignProgramToClientError>({
      path: `/routes/training/clients/program`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get detailed information about a specific exercise
   *
   * @tags dbtn/module:training
   * @name get_exercise_details
   * @summary Get Exercise Details
   * @request GET:/routes/training/exercises/{exercise_id}
   */
  get_exercise_details = ({ exerciseId, ...query }: GetExerciseDetailsParams, params: RequestParams = {}) =>
    this.request<GetExerciseDetailsData, GetExerciseDetailsError>({
      path: `/routes/training/exercises/${exerciseId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get nutrition plan templates with optional filtering
   *
   * @tags dbtn/module:nutrition
   * @name get_nutrition_templates
   * @summary Get Nutrition Templates
   * @request GET:/routes/nutrition/nutrition/templates
   */
  get_nutrition_templates = (query: GetNutritionTemplatesParams, params: RequestParams = {}) =>
    this.request<GetNutritionTemplatesData, GetNutritionTemplatesError>({
      path: `/routes/nutrition/nutrition/templates`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific nutrition plan by ID
   *
   * @tags dbtn/module:nutrition
   * @name get_nutrition_plan
   * @summary Get Nutrition Plan
   * @request GET:/routes/nutrition/nutrition/plans/{plan_id}
   */
  get_nutrition_plan = ({ planId, ...query }: GetNutritionPlanParams, params: RequestParams = {}) =>
    this.request<GetNutritionPlanData, GetNutritionPlanError>({
      path: `/routes/nutrition/nutrition/plans/${planId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a client's active nutrition plan
   *
   * @tags dbtn/module:nutrition
   * @name get_client_active_nutrition
   * @summary Get Client Active Nutrition
   * @request GET:/routes/nutrition/nutrition/clients/{client_id}/plan
   */
  get_client_active_nutrition = ({ clientId, ...query }: GetClientActiveNutritionParams, params: RequestParams = {}) =>
    this.request<GetClientActiveNutritionData, GetClientActiveNutritionError>({
      path: `/routes/nutrition/nutrition/clients/${clientId}/plan`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a client's active nutrition plan
   *
   * @tags dbtn/module:nutrition
   * @name update_client_nutrition
   * @summary Update Client Nutrition
   * @request PATCH:/routes/nutrition/nutrition/clients/{client_id}/plan
   */
  update_client_nutrition = (
    { clientId, ...query }: UpdateClientNutritionParams,
    data: ClientNutritionUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateClientNutritionData, UpdateClientNutritionError>({
      path: `/routes/nutrition/nutrition/clients/${clientId}/plan`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Assign a nutrition plan to a client
   *
   * @tags dbtn/module:nutrition
   * @name assign_nutrition_plan
   * @summary Assign Nutrition Plan
   * @request POST:/routes/nutrition/nutrition/clients/plan
   */
  assign_nutrition_plan = (data: NutritionPlanAssignment, params: RequestParams = {}) =>
    this.request<AssignNutritionPlanData, AssignNutritionPlanError>({
      path: `/routes/nutrition/nutrition/clients/plan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Search for nutrition information for multiple food items matching query criteria This endpoint provides advanced food search functionality, returning multiple matching results. Parameters: - query: Search text to find matching foods - limit: Maximum number of results to return (default: 10) - category: Optional food category filter Returns a list of matching food items with their complete nutritional information. Example for Claude Desktop MCP: ``` You can use this tool to search for nutrition information about foods. For example: - "Search for chicken breast information" - "Get nutrition facts for almonds" - "Find macros for greek yogurt and berries" ```
   *
   * @tags dbtn/module:nutrition
   * @name advanced_food_search
   * @summary Advanced Food Search
   * @request POST:/routes/nutrition/food/search
   */
  advanced_food_search = (data: FoodSearchRequest, params: RequestParams = {}) =>
    this.request<AdvancedFoodSearchData, AdvancedFoodSearchError>({
      path: `/routes/nutrition/food/search`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Look up nutrition information for a specific food item This endpoint retrieves detailed nutritional information for a single food item. Consider using the /food/search endpoint for more advanced search capabilities. Parameters: - food_name: Name of the food to look up Returns complete nutritional information for the matched food item.
   *
   * @tags dbtn/module:nutrition
   * @name lookup_food_nutrition
   * @summary Lookup Food Nutrition
   * @request GET:/routes/nutrition/food/{food_name}
   */
  lookup_food_nutrition = ({ foodName, ...query }: LookupFoodNutritionParams, params: RequestParams = {}) =>
    this.request<LookupFoodNutritionData, LookupFoodNutritionError>({
      path: `/routes/nutrition/food/${foodName}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new nutrition plan
   *
   * @tags dbtn/module:nutrition
   * @name create_nutrition_plan
   * @summary Create Nutrition Plan
   * @request POST:/routes/nutrition/plans
   */
  create_nutrition_plan = (data: NutritionPlanCreate, params: RequestParams = {}) =>
    this.request<CreateNutritionPlanData, CreateNutritionPlanError>({
      path: `/routes/nutrition/plans`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Search for clients by name, email, type, or status. This endpoint allows searching across all clients in the system using various filters and criteria. It's useful for finding specific clients quickly or generating filtered lists of clients matching certain parameters. Args: request: A search request containing query terms and filters Returns: A list of clients matching the search criteria with basic profile information Example Claude Usage: "Find all PRIME clients that joined in the last month" "Search for clients named Smith" "List all active LONGEVITY clients"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_search_clients
   * @summary Mcpnew Search Clients
   * @request POST:/routes/mcp/clients/search
   */
  mcpnew_search_clients = (data: ClientSearchRequest, params: RequestParams = {}) =>
    this.request<McpnewSearchClientsData, McpnewSearchClientsError>({
      path: `/routes/mcp/clients/search`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get detailed information about a specific client. This endpoint retrieves comprehensive client information including profile details, active programs, nutrition plans, and recent progress. It's the primary method to get a complete view of a client's current status. Args: request: A request containing the client's ID Returns: Comprehensive client profile data including active programs and plans Example Claude Usage: "Get all details for client with ID abc123" "Tell me about Jane Smith's profile" "What programs is Michael currently enrolled in?"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_client_details
   * @summary Mcpnew Get Client Details
   * @request POST:/routes/mcp/clients/get
   */
  mcpnew_get_client_details = (data: ClientDetailsRequest, params: RequestParams = {}) =>
    this.request<McpnewGetClientDetailsData, McpnewGetClientDetailsError>({
      path: `/routes/mcp/clients/get`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Add a new client to the system
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_add_client
   * @summary Mcpnew Add Client
   * @request POST:/routes/mcp/clients/add
   */
  mcpnew_add_client = (data: AddClientRequest, params: RequestParams = {}) =>
    this.request<McpnewAddClientData, McpnewAddClientError>({
      path: `/routes/mcp/clients/add`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get client progress history with optional filtering. This endpoint retrieves a client's progress records over time, with the ability to filter by record type (weight, measurements, workouts, etc.) and time period. It's essential for tracking client progress and visualizing trends. Args: request: A request specifying the client ID, record type, and time period Returns: A chronological history of progress records with calculated summaries Example Claude Usage: "Show me John's weight history for the last 3 months" "Get all workout records for client abc123" "What progress has Sarah made on her measurements?"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_progress_history
   * @summary Mcpnew Get Progress History
   * @request POST:/routes/mcp/progress-history
   */
  mcpnew_get_progress_history = (data: AppApisMcpnewProgressHistoryRequest, params: RequestParams = {}) =>
    this.request<McpnewGetProgressHistoryData, McpnewGetProgressHistoryError>({
      path: `/routes/mcp/progress-history`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get adherence metrics for a client. This endpoint analyzes a client's adherence to their training, nutrition, and recovery protocols. It provides both overall adherence scores and breakdowns by different categories and time periods, helping coaches identify areas where clients may need additional support or motivation. Args: request: A request specifying the client ID, date range, and breakdown options Returns: Adherence metrics with summaries, trends, and optional detailed breakdowns Example Claude Usage: "What's John's overall adherence rate?" "Show me Sarah's training compliance over the last month" "Which days of the week does Michael have the lowest nutrition adherence?"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_client_adherence_metrics2
   * @summary Mcpnew Get Client Adherence Metrics2
   * @request POST:/routes/mcp/analytics/adherence2
   */
  mcpnew_get_client_adherence_metrics2 = (data: AdherenceMetricsRequest, params: RequestParams = {}) =>
    this.request<McpnewGetClientAdherenceMetrics2Data, McpnewGetClientAdherenceMetrics2Error>({
      path: `/routes/mcp/analytics/adherence2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze the effectiveness of a training program. This endpoint evaluates how effective a specific training program has been across all clients who have used it. It measures various metrics like strength gains, body composition changes, adherence rates, and client satisfaction, providing valuable insights for program refinement. Args: request: A request specifying the program ID and metrics to analyze Returns: Effectiveness metrics with comparisons to previous programs and averages Example Claude Usage: "How effective is the Hypertrophy Block 2 program?" "What's the client satisfaction rate for the PRIME Strength program?" "Compare the effectiveness of the LONGEVITY Mobility program to average"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_program_effectiveness2
   * @summary Mcpnew Get Program Effectiveness2
   * @request POST:/routes/mcp/analytics/effectiveness2
   */
  mcpnew_get_program_effectiveness2 = (data: AppApisMcpnewProgramEffectivenessRequest, params: RequestParams = {}) =>
    this.request<McpnewGetProgramEffectiveness2Data, McpnewGetProgramEffectiveness2Error>({
      path: `/routes/mcp/analytics/effectiveness2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate business-level metrics and analytics. This endpoint provides high-level business metrics and insights across the entire NGX system, including client statistics, revenue data, program performance, and retention rates. It's valuable for business planning, marketing strategy, and overall performance monitoring. Args: request: A request specifying the date range and segments to analyze Returns: Comprehensive business metrics with optional segment breakdowns Example Claude Usage: "What are our overall business metrics for this quarter?" "Show me client retention rates by program type" "Generate revenue metrics for the PRIME program from January to March"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_generate_business_metrics2
   * @summary Mcpnew Generate Business Metrics2
   * @request POST:/routes/mcp/analytics/business-metrics2
   */
  mcpnew_generate_business_metrics2 = (data: AppApisMcpnewBusinessMetricsRequest, params: RequestParams = {}) =>
    this.request<McpnewGenerateBusinessMetrics2Data, McpnewGenerateBusinessMetrics2Error>({
      path: `/routes/mcp/analytics/business-metrics2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the current status of the agent system. This endpoint provides information about the AI agent system's current operational status, available models, capabilities, and recent updates. It's useful for monitoring the system's health and understanding what AI capabilities are currently available. Returns: The current operational status of the agent system and its capabilities Example Claude Usage: "Check if the agent system is operational" "What AI models are currently active in NGX?" "What are the current capabilities of the NGX AI system?"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_agent_system_status
   * @summary Mcpnew Get Agent System Status
   * @request GET:/routes/mcp/agent/status
   */
  mcpnew_get_agent_system_status = (params: RequestParams = {}) =>
    this.request<McpnewGetAgentSystemStatusData, any>({
      path: `/routes/mcp/agent/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Run specialized agent analysis on client data. This endpoint leverages AI to perform in-depth analysis on client data, generating insights, predictions, and recommendations. The analysis type parameter allows for different types of analyses including progress prediction, program optimization, and more. Args: request: A request specifying the client ID, analysis type, and parameters Returns: AI-generated analysis results with insights and recommendations Example Claude Usage: "Predict John's progress for the next 4 weeks" "Optimize Sarah's current training program" "Analyze client adherence patterns for Michael"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_run_agent_analysis
   * @summary Mcpnew Run Agent Analysis
   * @request POST:/routes/mcp/agent/analysis
   */
  mcpnew_run_agent_analysis = (data: AgentAnalysisRequest, params: RequestParams = {}) =>
    this.request<McpnewRunAgentAnalysisData, McpnewRunAgentAnalysisError>({
      path: `/routes/mcp/agent/analysis`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a comprehensive client report. This endpoint creates detailed reports for clients based on their historical data and current status. Different report types are available including quarterly progress reports, nutrition analysis, and program effectiveness reports. These reports provide valuable insights and recommendations for both coaches and clients. Args: request: A request specifying the client ID, report type, and date range Returns: A comprehensive client report with summaries, metrics, and recommendations Example Claude Usage: "Generate a quarterly progress report for John" "Create a nutrition analysis report for Sarah" "Prepare a comprehensive fitness report for Michael from January to March"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_generate_client_report
   * @summary Mcpnew Generate Client Report
   * @request POST:/routes/mcp/agent/report
   */
  mcpnew_generate_client_report = (data: ClientReportRequest, params: RequestParams = {}) =>
    this.request<McpnewGenerateClientReportData, McpnewGenerateClientReportError>({
      path: `/routes/mcp/agent/report`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Translate technical program data into natural language. This endpoint converts technical training program data into clear, natural language descriptions that clients can easily understand. The complexity level parameter allows for different levels of detail and technical terminology in the output, from simple explanations to detailed professional descriptions. Args: request: A request containing the program data and desired complexity level Returns: A natural language translation of the technical program data Example Claude Usage: "Translate John's strength program into simple language" "Create a detailed explanation of Sarah's hypertrophy program" "Convert Michael's training plan to client-friendly language"
   *
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_translate_program_to_natural_language
   * @summary Mcpnew Translate Program To Natural Language
   * @request POST:/routes/mcp/agent/translate-program
   */
  mcpnew_translate_program_to_natural_language = (data: TranslateProgramRequest, params: RequestParams = {}) =>
    this.request<McpnewTranslateProgramToNaturalLanguageData, McpnewTranslateProgramToNaturalLanguageError>({
      path: `/routes/mcp/agent/translate-program`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve training program templates with optional filtering by program type. This endpoint allows you to fetch available training program templates from the database. Templates can be filtered by program type (PRIME or LONGEVITY) and limited in quantity. Parameters: - program_type: Optional filter for program type (PRIME or LONGEVITY) - limit: Maximum number of templates to return (default: 10) Returns a list of training program templates and the total count of matching templates. Example for Claude: ``` To retrieve LONGEVITY training templates: {"program_type": "LONGEVITY", "limit": 5} To retrieve all templates (up to 10): {} ```
   *
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_training_templates
   * @summary Mcpnew Get Training Templates
   * @request POST:/routes/mcp/training-templates
   */
  mcpnew_get_training_templates = (data: TrainingTemplatesRequest, params: RequestParams = {}) =>
    this.request<McpnewGetTrainingTemplatesData, McpnewGetTrainingTemplatesError>({
      path: `/routes/mcp/training-templates`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve detailed information about a specific training program
   *
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_training_program
   * @summary Mcpnew Get Training Program
   * @request POST:/routes/mcp/training-program
   */
  mcpnew_get_training_program = (data: TrainingProgramRequest, params: RequestParams = {}) =>
    this.request<McpnewGetTrainingProgramData, McpnewGetTrainingProgramError>({
      path: `/routes/mcp/training-program`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve the active training program assigned to a specific client
   *
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_client_active_program
   * @summary Mcpnew Get Client Active Program
   * @request POST:/routes/mcp/client-active-program
   */
  mcpnew_get_client_active_program = (data: ClientProgramRequest, params: RequestParams = {}) =>
    this.request<McpnewGetClientActiveProgramData, McpnewGetClientActiveProgramError>({
      path: `/routes/mcp/client-active-program`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Assign a training program to a client with optional adjustments
   *
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_assign_program_to_client
   * @summary Mcpnew Assign Program To Client
   * @request POST:/routes/mcp/assign-program
   */
  mcpnew_assign_program_to_client = (data: AssignProgramRequest, params: RequestParams = {}) =>
    this.request<McpnewAssignProgramToClientData, McpnewAssignProgramToClientError>({
      path: `/routes/mcp/assign-program`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a client's active training program with progress tracking and program adjustments
   *
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_update_client_program
   * @summary Mcpnew Update Client Program
   * @request POST:/routes/mcp/update-client-program
   */
  mcpnew_update_client_program = (data: UpdateClientProgramRequest, params: RequestParams = {}) =>
    this.request<McpnewUpdateClientProgramData, McpnewUpdateClientProgramError>({
      path: `/routes/mcp/update-client-program`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve detailed information about a specific exercise. This endpoint provides comprehensive details about a specific exercise including name, category, target muscles, equipment needed, difficulty level, instructions, and video URL if available. Parameters: - exercise_id: The unique identifier of the exercise Returns the complete exercise details including all available metadata. Example for Claude: ``` To get details about a specific exercise: {"exercise_id": "12345"} ```
   *
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_exercise_details
   * @summary Mcpnew Get Exercise Details
   * @request POST:/routes/mcp/exercise-details
   */
  mcpnew_get_exercise_details = (data: ExerciseDetailsRequest, params: RequestParams = {}) =>
    this.request<McpnewGetExerciseDetailsData, McpnewGetExerciseDetailsError>({
      path: `/routes/mcp/exercise-details`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve nutrition plan templates with optional filtering by plan type. This endpoint allows you to fetch available nutrition plan templates from the database. Templates can be filtered by plan type (PRIME or LONGEVITY) and limited in quantity. Parameters: - plan_type: Optional filter for program type (PRIME or LONGEVITY) - limit: Maximum number of templates to return (default: 10) Returns a list of nutrition plan templates and the total count of matching templates. Example for Claude: ``` To retrieve PRIME nutrition templates: {"plan_type": "PRIME", "limit": 5} To retrieve all templates (up to 10): {} ```
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_get_nutrition_templates
   * @summary Mcpnew Get Nutrition Templates
   * @request POST:/routes/mcp/nutrition-templates
   */
  mcpnew_get_nutrition_templates = (data: NutritionTemplatesRequest, params: RequestParams = {}) =>
    this.request<McpnewGetNutritionTemplatesData, McpnewGetNutritionTemplatesError>({
      path: `/routes/mcp/nutrition-templates`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve detailed information about a specific nutrition plan
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_get_nutrition_plan
   * @summary Mcpnew Get Nutrition Plan
   * @request POST:/routes/mcp/nutrition-plan
   */
  mcpnew_get_nutrition_plan = (data: NutritionPlanRequest, params: RequestParams = {}) =>
    this.request<McpnewGetNutritionPlanData, McpnewGetNutritionPlanError>({
      path: `/routes/mcp/nutrition-plan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve the active nutrition plan assigned to a specific client
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_get_client_active_nutrition
   * @summary Mcpnew Get Client Active Nutrition
   * @request POST:/routes/mcp/client-active-nutrition
   */
  mcpnew_get_client_active_nutrition = (data: ClientNutritionRequest, params: RequestParams = {}) =>
    this.request<McpnewGetClientActiveNutritionData, McpnewGetClientActiveNutritionError>({
      path: `/routes/mcp/client-active-nutrition`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Assign a nutrition plan to a client with optional adjustments
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_assign_nutrition_plan
   * @summary Mcpnew Assign Nutrition Plan
   * @request POST:/routes/mcp/assign-nutrition-plan
   */
  mcpnew_assign_nutrition_plan = (data: AssignNutritionRequest, params: RequestParams = {}) =>
    this.request<McpnewAssignNutritionPlanData, McpnewAssignNutritionPlanError>({
      path: `/routes/mcp/assign-nutrition-plan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a client's active nutrition plan with progress tracking and plan adjustments
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_update_client_nutrition
   * @summary Mcpnew Update Client Nutrition
   * @request POST:/routes/mcp/update-client-nutrition
   */
  mcpnew_update_client_nutrition = (data: UpdateClientNutritionRequest, params: RequestParams = {}) =>
    this.request<McpnewUpdateClientNutritionData, McpnewUpdateClientNutritionError>({
      path: `/routes/mcp/update-client-nutrition`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Lookup nutritional information for a specific food item. Returns detailed nutritional information for a food item specified by name. This endpoint is optimized for MCP (Model Context Protocol) integration and provides comprehensive macro and micronutrient data. Parameters: - food_name: Name of the food to search for Returns a single food item with complete nutritional breakdown along with alternative options if the exact match is not found. Example for Claude: ``` To lookup nutritional information for chicken breast: {"food_name": "chicken breast"} To lookup nutritional information for brown rice: {"food_name": "brown rice"} ```
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_lookup_food_nutrition
   * @summary Mcpnew Lookup Food Nutrition
   * @request POST:/routes/mcp/lookup-food-nutrition
   */
  mcpnew_lookup_food_nutrition = (data: FoodNutritionRequest, params: RequestParams = {}) =>
    this.request<McpnewLookupFoodNutritionData, McpnewLookupFoodNutritionError>({
      path: `/routes/mcp/lookup-food-nutrition`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new nutrition plan template
   *
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_create_nutrition_plan
   * @summary Mcpnew Create Nutrition Plan
   * @request POST:/routes/mcp/create-nutrition-plan
   */
  mcpnew_create_nutrition_plan = (data: NutritionPlanInput, params: RequestParams = {}) =>
    this.request<McpnewCreateNutritionPlanData, McpnewCreateNutritionPlanError>({
      path: `/routes/mcp/create-nutrition-plan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log an activity in the system This endpoint records system activities like user actions, data changes, and system events. It provides a standardized way to log activities across the application for audit purposes. Args: data: A dictionary containing activity details including action, entity type, and metadata Returns: The created activity log entry with its ID Example Claude Usage: "Log that user X updated client Y's nutrition plan" "Record a system maintenance event" "Track when a program was assigned to a client"
   *
   * @tags logs, dbtn/module:logs
   * @name log_activity
   * @summary Log Activity
   * @request POST:/routes/logs/activity
   */
  log_activity = (data: LogActivityPayload, params: RequestParams = {}) =>
    this.request<LogActivityData, LogActivityError>({
      path: `/routes/logs/activity`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get activity logs with filtering and pagination This endpoint retrieves activity logs with flexible filtering options including entity type, user ID, action type, and date ranges. Results are paginated for performance, and provide detailed information on all system activities for audit and monitoring purposes. Args: request: A request defining filters, pagination, and sorting options for logs Returns: A paginated list of activity logs matching the criteria Example Claude Usage: "Show me all client updates from last week" "Get system activities for user X" "List all deletion actions in chronological order" "Which user made the most recent changes to nutrition plans?"
   *
   * @tags logs, dbtn/module:logs
   * @name get_activity_logs
   * @summary Get Activity Logs
   * @request POST:/routes/logs/get
   */
  get_activity_logs = (data: ActivityLogRequest, params: RequestParams = {}) =>
    this.request<GetActivityLogsData, GetActivityLogsError>({
      path: `/routes/logs/get`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log a new activity in the system. This endpoint records user actions within the system, creating an audit trail of all important operations. The logs are cached for efficient retrieval and optimized for performance. Examples of activities that can be logged: - Client creation/update/deletion - Program assignments - Measurement logging - System configuration changes Returns the created activity log entry with its generated ID.
   *
   * @tags system, dbtn/module:activity_logs
   * @name record_system_activity
   * @summary Record System Activity
   * @request POST:/routes/log_activity
   */
  record_system_activity = (data: LogActivityRequest, params: RequestParams = {}) =>
    this.request<RecordSystemActivityData, RecordSystemActivityError>({
      path: `/routes/log_activity`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve activity logs with optional filtering. This endpoint allows querying the activity logs with various filters such as entity type, entity ID, user ID, action, and date range. The logs provide visibility into all actions taken within the system, creating an audit trail that helps with troubleshooting, compliance, and understanding user behavior. Returns a paginated list of activity logs ordered by timestamp (newest first).
   *
   * @tags system, mcp, dbtn/module:activity_logs
   * @name retrieve_system_activities
   * @summary Retrieve System Activities
   * @request POST:/routes/get_activity_logs
   */
  retrieve_system_activities = (data: GetActivityLogsRequest, params: RequestParams = {}) =>
    this.request<RetrieveSystemActivitiesData, RetrieveSystemActivitiesError>({
      path: `/routes/get_activity_logs`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Initialize the activity_logs table in the database. This endpoint creates the activity_logs table if it doesn't exist already. It's typically called during the initial setup of the system.
   *
   * @tags system, dbtn/module:activity_logs
   * @name initialize_activity_logs_table
   * @summary Initialize Activity Logs Table
   * @request POST:/routes/initialize_activity_logs_table
   */
  initialize_activity_logs_table = (params: RequestParams = {}) =>
    this.request<InitializeActivityLogsTableData, any>({
      path: `/routes/initialize_activity_logs_table`,
      method: "POST",
      ...params,
    });

  /**
   * @description Obtiene todas las categorías, grupos musculares, niveles de dificultad y tipos de equipamiento disponibles Este endpoint es útil para poblar filtros y desplegables en la interfaz de usuario cuando se construye un selector de ejercicios o editor de programas.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name get_categories
   * @summary Get Categories
   * @request GET:/routes/categories
   */
  get_categories = (params: RequestParams = {}) =>
    this.request<GetCategoriesData, any>({
      path: `/routes/categories`,
      method: "GET",
      ...params,
    });

  /**
   * @description Lista ejercicios con opciones de filtrado por categoría, grupo muscular, dificultad y búsqueda por texto Este endpoint permite obtener una lista filtrada de ejercicios para mostrar en la interfaz del editor de programas. Incluye parámetros de paginación y opciones para incluir datos de categorías.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name list_exercises
   * @summary List Exercises
   * @request GET:/routes/list
   */
  list_exercises = (query: ListExercisesParams, params: RequestParams = {}) =>
    this.request<ListExercisesData, ListExercisesError>({
      path: `/routes/list`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Obtiene los detalles completos de un ejercicio específico por su ID Proporciona toda la información disponible sobre un ejercicio, incluyendo descripción, instrucciones, imágenes, videos y metadatos adicionales.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name get_exercise
   * @summary Get Exercise
   * @request GET:/routes/{exercise_id}
   */
  get_exercise = ({ exerciseId, ...query }: GetExerciseParams, params: RequestParams = {}) =>
    this.request<GetExerciseData, GetExerciseError>({
      path: `/routes/${exerciseId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Actualiza un ejercicio existente Permite modificar cualquier atributo de un ejercicio existente, como su nombre, categoría, descripción, instrucciones o recursos multimedia.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name update_exercise
   * @summary Update Exercise
   * @request PUT:/routes/{exercise_id}
   */
  update_exercise = (
    { exerciseId, ...query }: UpdateExerciseParams,
    data: ExerciseUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateExerciseData, UpdateExerciseError>({
      path: `/routes/${exerciseId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Elimina un ejercicio de la biblioteca Permite eliminar un ejercicio completamente de la biblioteca de ejercicios. Se debe usar con precaución ya que esta operación no es reversible.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name delete_exercise
   * @summary Delete Exercise
   * @request DELETE:/routes/{exercise_id}
   */
  delete_exercise = ({ exerciseId, ...query }: DeleteExerciseParams, params: RequestParams = {}) =>
    this.request<DeleteExerciseData, DeleteExerciseError>({
      path: `/routes/${exerciseId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Crea un nuevo ejercicio en la biblioteca Permite añadir un nuevo ejercicio a la biblioteca con todos sus detalles, incluyendo nombre, categoría, grupos musculares, descripciones, imágenes y videos.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name create_exercise
   * @summary Create Exercise
   * @request POST:/routes/create
   */
  create_exercise = (data: ExerciseCreate, params: RequestParams = {}) =>
    this.request<CreateExerciseData, CreateExerciseError>({
      path: `/routes/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Importa múltiples ejercicios a la biblioteca en una sola operación Útil para cargar inicialmente una biblioteca de ejercicios o importar desde otras fuentes. Permite añadir muchos ejercicios en una sola llamada.
   *
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name bulk_import_exercises
   * @summary Bulk Import Exercises
   * @request POST:/routes/bulk-import
   */
  bulk_import_exercises = (data: BulkImportExercisesPayload, params: RequestParams = {}) =>
    this.request<BulkImportExercisesData, BulkImportExercisesError>({
      path: `/routes/bulk-import`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log client measurements such as weight, body fat percentage, and other anthropometric data
   *
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_log_measurement
   * @summary Mcp Log Measurement
   * @request POST:/routes/mcp/progress/log-measurement
   */
  mcp_log_measurement = (data: AppApisProgressV2MeasurementRequest, params: RequestParams = {}) =>
    this.request<McpLogMeasurementData, McpLogMeasurementError>({
      path: `/routes/mcp/progress/log-measurement`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log workout data including exercises performed, duration, intensity, and other metrics
   *
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_log_workout
   * @summary Mcp Log Workout
   * @request POST:/routes/mcp/progress/log-workout
   */
  mcp_log_workout = (data: AppApisProgressV2WorkoutRequest, params: RequestParams = {}) =>
    this.request<McpLogWorkoutData, McpLogWorkoutError>({
      path: `/routes/mcp/progress/log-workout`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log subjective client feedback including energy levels, recovery, and general wellness metrics
   *
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_log_subjective_feedback
   * @summary Mcp Log Subjective Feedback
   * @request POST:/routes/mcp/progress/log-feedback
   */
  mcp_log_subjective_feedback = (data: AppApisProgressV2FeedbackRequest, params: RequestParams = {}) =>
    this.request<McpLogSubjectiveFeedbackData, McpLogSubjectiveFeedbackError>({
      path: `/routes/mcp/progress/log-feedback`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve a client's progress history for a specific record type within a date range
   *
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_get_progress_history
   * @summary Mcp Get Progress History
   * @request POST:/routes/mcp/progress/history
   */
  mcp_get_progress_history = (data: AppApisProgressV2ProgressHistoryRequest, params: RequestParams = {}) =>
    this.request<McpGetProgressHistoryData, McpGetProgressHistoryError>({
      path: `/routes/mcp/progress/history`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a summary of client progress for specified metrics over a time period
   *
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_get_progress_summary
   * @summary Mcp Get Progress Summary
   * @request POST:/routes/mcp/progress/summary
   */
  mcp_get_progress_summary = (data: ProgressSummaryRequest, params: RequestParams = {}) =>
    this.request<McpGetProgressSummaryData, McpGetProgressSummaryError>({
      path: `/routes/mcp/progress/summary`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
