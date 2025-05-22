import {
  ActivateMcpData,
  ActivateMcpEndpoint2Data,
  ActivateMcpEndpointData,
  ActivationRequest,
  ActivityLogRequest,
  AddClientData,
  AddClientDirect22Data,
  AddClientDirect2Data,
  AddClientRequest,
  AdherenceMetricsRequest,
  AdvancedFoodSearchData,
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
  AssignNutritionRequest,
  AssignProgramRequest,
  AssignProgramToClientData,
  BulkImportExercisesData,
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
  CommunicationHistoryRequest,
  CreateClientAdminData,
  CreateClientSimpleData,
  CreateExerciseData,
  CreateNotificationData,
  CreateNutritionPlanData,
  DeleteExerciseData,
  DeleteNotificationData,
  ExerciseCreate,
  ExerciseDetailsRequest,
  ExerciseUpdate,
  FoodNutritionRequest,
  FoodSearchRequest,
  GenerateBusinessMetrics2Data,
  GenerateBusinessMetricsData,
  GenerateClientReportData,
  GetActivityLogsData,
  GetActivityLogsRequest,
  GetAgentSystemStatusData,
  GetCategoriesData,
  GetClaudeMcpStatus2Data,
  GetClaudeMcpStatusData,
  GetClientActiveNutritionData,
  GetClientActiveProgramData,
  GetClientAdherenceMetrics2Data,
  GetClientAdherenceMetricsData,
  GetClientByIdAdminData,
  GetClientByIdData,
  GetCommunicationHistoryData,
  GetExerciseData,
  GetExerciseDetailsData,
  GetMcpAccessLogsEndpointData,
  GetMcpStatusData,
  GetMcpStatusEndpoint2Data,
  GetMcpStatusEndpointData,
  GetMcpToolsEndpointData,
  GetNutritionPlanData,
  GetNutritionTemplatesData,
  GetProgramEffectiveness2Data,
  GetProgramEffectivenessData,
  GetProgressHistoryData,
  GetProgressSummaryData,
  GetSchemaSummaryData,
  GetSuggestedPromptsData,
  GetSupabaseConfigData,
  GetTrainingProgramData,
  GetTrainingTemplatesData,
  GetUserNotificationsData,
  InitializeActivityLogsTableData,
  InitializeDatabaseData,
  ListExercisesData,
  LogActivityData,
  LogActivityPayload,
  LogActivityRequest,
  LogMeasurementData,
  LogSubjectiveFeedbackData,
  LogWorkoutData,
  LookupFoodNutritionData,
  MCPActivationRequest,
  MarkAllNotificationsReadData,
  MarkNotificationReadData,
  McpGetProgressHistoryData,
  McpGetProgressSummaryData,
  McpLogMeasurementData,
  McpLogSubjectiveFeedbackData,
  McpLogWorkoutData,
  McpnewAddClientData,
  McpnewAssignNutritionPlanData,
  McpnewAssignProgramToClientData,
  McpnewCreateNutritionPlanData,
  McpnewGenerateBusinessMetrics2Data,
  McpnewGenerateBusinessMetricsData,
  McpnewGenerateClientReportData,
  McpnewGetAgentSystemStatusData,
  McpnewGetClientActiveNutritionData,
  McpnewGetClientActiveProgramData,
  McpnewGetClientAdherenceMetrics2Data,
  McpnewGetClientAdherenceMetricsData,
  McpnewGetClientDetailsData,
  McpnewGetCommunicationHistoryData,
  McpnewGetExerciseDetailsData,
  McpnewGetNutritionPlanData,
  McpnewGetNutritionTemplatesData,
  McpnewGetProgramEffectiveness2Data,
  McpnewGetProgramEffectivenessData,
  McpnewGetProgressHistoryData,
  McpnewGetTrainingProgramData,
  McpnewGetTrainingTemplatesData,
  McpnewLookupFoodNutritionData,
  McpnewRunAgentAnalysisData,
  McpnewScheduleClientReminderData,
  McpnewSearchClientsData,
  McpnewSendTemplatedMessageData,
  McpnewTranslateProgramToNaturalLanguageData,
  McpnewUpdateClientNutritionData,
  McpnewUpdateClientProgramData,
  NotificationCreate,
  NutritionPlanAssignment,
  NutritionPlanCreate,
  NutritionPlanInput,
  NutritionPlanRequest,
  NutritionTemplatesRequest,
  PlanType,
  ProgramType,
  ProgressSummaryRequest,
  RecordSystemActivityData,
  RecordType,
  ReportRequest,
  RetrieveSystemActivitiesData,
  RunAgentAnalysisData,
  ScheduleClientReminderData,
  SearchClientsAdminData,
  SearchClientsData,
  SendTemplatedMessageData,
  SimpleClientRequest,
  TrainingProgramAssignment,
  TrainingProgramRequest,
  TrainingTemplatesRequest,
  TranslateProgramRequest,
  TranslateProgramToNaturalLanguageData,
  TranslationRequest,
  UpdateClientData,
  UpdateClientNutritionData,
  UpdateClientNutritionRequest,
  UpdateClientProgramData,
  UpdateClientProgramRequest,
  UpdateExerciseData,
  UpdateMcpSettingsEndpointData,
  UpdateMcpSettingsEndpointPayload,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Get Supabase configuration for the frontend
   * @tags dbtn/module:config
   * @name get_supabase_config
   * @summary Get Supabase Config
   * @request GET:/routes/supabase-config
   */
  export namespace get_supabase_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseConfigData;
  }

  /**
   * @description Send a templated message to a client through specified channels
   * @tags dbtn/module:communication
   * @name send_templated_message
   * @summary Send Templated Message
   * @request POST:/routes/communication/send-message
   */
  export namespace send_templated_message {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisCommunicationTemplatedMessageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SendTemplatedMessageData;
  }

  /**
   * @description Schedule a reminder for a client
   * @tags dbtn/module:communication
   * @name schedule_client_reminder
   * @summary Schedule Client Reminder
   * @request POST:/routes/communication/schedule-reminder
   */
  export namespace schedule_client_reminder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisCommunicationReminderRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ScheduleClientReminderData;
  }

  /**
   * @description Get the communication history for a client
   * @tags dbtn/module:communication
   * @name get_communication_history
   * @summary Get Communication History
   * @request GET:/routes/communication/history/{client_id}
   */
  export namespace get_communication_history {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommunicationHistoryData;
  }

  /**
   * @description Get adherence metrics for a client over a specified time period
   * @tags dbtn/module:analytics
   * @name get_client_adherence_metrics
   * @summary Get Client Adherence Metrics
   * @request GET:/routes/analysis/client/{client_id}/adherence
   */
  export namespace get_client_adherence_metrics {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientAdherenceMetricsData;
  }

  /**
   * @description Get effectiveness metrics for a specific program
   * @tags dbtn/module:analytics
   * @name get_program_effectiveness
   * @summary Get Program Effectiveness
   * @request GET:/routes/analysis/program/{program_id}/effectiveness
   */
  export namespace get_program_effectiveness {
    export type RequestParams = {
      /**
       * Program Id
       * The ID of the program
       */
      programId: string;
    };
    export type RequestQuery = {
      /**
       * Metrics
       * Comma-separated list of metrics to analyze
       */
      metrics?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProgramEffectivenessData;
  }

  /**
   * @description Generate business metrics and KPIs for the specified date range and segments
   * @tags dbtn/module:analytics
   * @name generate_business_metrics
   * @summary Generate Business Metrics
   * @request GET:/routes/analysis/business/metrics
   */
  export namespace generate_business_metrics {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateBusinessMetricsData;
  }

  /**
   * @description Initialize the database with the required schema and policies
   * @tags dbtn/module:database
   * @name initialize_database
   * @summary Initialize Database
   * @request POST:/routes/init-database
   */
  export namespace initialize_database {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Include Sample Data
       * @default true
       */
      include_sample_data?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InitializeDatabaseData;
  }

  /**
   * @description Get a summary of the database schema
   * @tags dbtn/module:database
   * @name get_schema_summary
   * @summary Get Schema Summary
   * @request GET:/routes/schema-summary
   */
  export namespace get_schema_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSchemaSummaryData;
  }

  /**
   * @description Generate business metrics for the dashboard
   * @tags dbtn/module:business
   * @name generate_business_metrics2
   * @summary Generate Business Metrics2
   * @request GET:/routes/business-metrics
   */
  export namespace generate_business_metrics2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Date Range
       * Time range for metrics
       * @default "30d"
       */
      date_range?: string;
      /** Segments */
      segments?: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateBusinessMetrics2Data;
  }

  /**
   * @description Get adherence metrics for a specific client
   * @tags dbtn/module:business
   * @name get_client_adherence_metrics2
   * @summary Get Client Adherence Metrics2
   * @request GET:/routes/client-adherence-metrics
   */
  export namespace get_client_adherence_metrics2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Client Id */
      client_id: string;
      /**
       * Date Range
       * @default "30d"
       */
      date_range?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientAdherenceMetrics2Data;
  }

  /**
   * @description Get effectiveness metrics for a specific program
   * @tags dbtn/module:business
   * @name get_program_effectiveness2
   * @summary Get Program Effectiveness2
   * @request GET:/routes/program-effectiveness
   */
  export namespace get_program_effectiveness2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Program Id */
      program_id: string;
      /**
       * Metrics
       * @default "all"
       */
      metrics?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProgramEffectiveness2Data;
  }

  /**
   * @description Get the current status of the agent system - moved from /agent/status to avoid conflict with MCP endpoint
   * @tags dbtn/module:agent
   * @name get_agent_system_status
   * @summary Get Agent System Status
   * @request GET:/routes/agent/system-status
   */
  export namespace get_agent_system_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAgentSystemStatusData;
  }

  /**
   * @description Run an AI analysis on client data
   * @tags dbtn/module:agent
   * @name run_agent_analysis
   * @summary Run Agent Analysis
   * @request POST:/routes/agent/analyze
   */
  export namespace run_agent_analysis {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RunAgentAnalysisData;
  }

  /**
   * @description Generate a comprehensive client report
   * @tags dbtn/module:agent
   * @name generate_client_report
   * @summary Generate Client Report
   * @request POST:/routes/agent/reports
   */
  export namespace generate_client_report {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateClientReportData;
  }

  /**
   * @description Translate structured program data into natural language descriptions
   * @tags dbtn/module:agent
   * @name translate_program_to_natural_language
   * @summary Translate Program To Natural Language
   * @request POST:/routes/agent/translate
   */
  export namespace translate_program_to_natural_language {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TranslationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TranslateProgramToNaturalLanguageData;
  }

  /**
   * @description Chat with the coach assistant to get AI-powered recommendations and analysis
   * @tags coach_assistant, dbtn/module:coach_assistant
   * @name coach_assistant_chat
   * @summary Coach Assistant Chat
   * @request POST:/routes/chat
   */
  export namespace coach_assistant_chat {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CoachAssistantChatData;
  }

  /**
   * @description Get suggested prompts for the coach assistant based on client and program context
   * @tags coach_assistant, dbtn/module:coach_assistant
   * @name get_suggested_prompts
   * @summary Get Suggested Prompts
   * @request GET:/routes/suggested-prompts
   */
  export namespace get_suggested_prompts {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Client Id */
      client_id?: string | null;
      /** Program Id */
      program_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSuggestedPromptsData;
  }

  /**
   * @description Create a new notification for a user This endpoint allows creating notifications for important user events like: - Reminders for upcoming client appointments - Alerts for missed training sessions - Milestone notifications for client achievements - System alerts about program changes
   * @tags dbtn/module:notifications
   * @name create_notification
   * @summary Create Notification
   * @request POST:/routes/notifications
   */
  export namespace create_notification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NotificationCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateNotificationData;
  }

  /**
   * @description Get notifications for a specific user Retrieves a list of notifications for the specified user, with options to filter and paginate.
   * @tags dbtn/module:notifications
   * @name get_user_notifications
   * @summary Get User Notifications
   * @request GET:/routes/notifications/user/{user_id}
   */
  export namespace get_user_notifications {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserNotificationsData;
  }

  /**
   * @description Mark a notification as read Updates the read status of a notification to indicate it has been seen by the user.
   * @tags dbtn/module:notifications
   * @name mark_notification_read
   * @summary Mark Notification Read
   * @request PATCH:/routes/notifications/{notification_id}/read
   */
  export namespace mark_notification_read {
    export type RequestParams = {
      /** Notification Id */
      notificationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MarkNotificationReadData;
  }

  /**
   * @description Mark all notifications for a user as read Updates all unread notifications for the specified user to be marked as read.
   * @tags dbtn/module:notifications
   * @name mark_all_notifications_read
   * @summary Mark All Notifications Read
   * @request PATCH:/routes/notifications/user/{user_id}/read-all
   */
  export namespace mark_all_notifications_read {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MarkAllNotificationsReadData;
  }

  /**
   * @description Delete a specific notification Permanently removes a notification from the system.
   * @tags dbtn/module:notifications
   * @name delete_notification
   * @summary Delete Notification
   * @request DELETE:/routes/notifications/{notification_id}
   */
  export namespace delete_notification {
    export type RequestParams = {
      /** Notification Id */
      notificationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteNotificationData;
  }

  /**
   * @description Create a new client with admin privileges to bypass RLS
   * @tags client-service, dbtn/module:client_service
   * @name create_client_admin
   * @summary Create Client Admin
   * @request POST:/routes/client-service/clients
   */
  export namespace create_client_admin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateClientAdminData;
  }

  /**
   * @description Search clients with admin privileges
   * @tags client-service, dbtn/module:client_service
   * @name search_clients_admin
   * @summary Search Clients Admin
   * @request GET:/routes/client-service/clients
   */
  export namespace search_clients_admin {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchClientsAdminData;
  }

  /**
   * @description Get a client by ID with admin privileges
   * @tags client-service, dbtn/module:client_service
   * @name get_client_by_id_admin
   * @summary Get Client By Id Admin
   * @request GET:/routes/client-service/clients/{client_id}
   */
  export namespace get_client_by_id_admin {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client to get
       */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientByIdAdminData;
  }

  /**
   * @description Endpoint simplificado para crear clientes desde Claude Desktop
   * @tags mcp, dbtn/module:claude_mcp
   * @name create_client_simple
   * @summary Create Client Simple
   * @request POST:/routes/claude-mcp/create-client
   */
  export namespace create_client_simple {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SimpleClientRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateClientSimpleData;
  }

  /**
   * @description Verificar el estado de la integración MCP con Claude Desktop
   * @tags mcp, dbtn/module:claude_mcp
   * @name get_claude_mcp_status
   * @summary Get Claude Mcp Status
   * @request GET:/routes/claude-mcp/status
   */
  export namespace get_claude_mcp_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClaudeMcpStatusData;
  }

  /**
   * @description Obtiene el estado actual del servicio MCP
   * @tags mcp-activation, dbtn/module:mcp_activator2
   * @name get_mcp_status
   * @summary Get Mcp Status
   * @request GET:/routes/mcp/status
   */
  export namespace get_mcp_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMcpStatusData;
  }

  /**
   * @description Activa el servicio MCP para un cliente específico o para toda la instancia
   * @tags mcp-activation, dbtn/module:mcp_activator2
   * @name activate_mcp
   * @summary Activate Mcp
   * @request POST:/routes/mcp/activate
   */
  export namespace activate_mcp {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ActivationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ActivateMcpData;
  }

  /**
   * @description Crea un cliente directo desde Claude Desktop - solución emergencia
   * @tags direct-mcp, dbtn/module:mcp_emergency
   * @name add_client_direct2
   * @summary Add Client Direct2
   * @request POST:/routes/add-client-direct2
   */
  export namespace add_client_direct2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpEmergencySimpleClient;
    export type RequestHeaders = {};
    export type ResponseBody = AddClientDirect2Data;
  }

  /**
   * @description Adds a new client to the system
   * @tags dbtn/module:claude_direct
   * @name add_client
   * @summary Add Client
   * @request POST:/routes/add_client
   */
  export namespace add_client {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddClientData;
  }

  /**
   * @description Searches for clients matching the given criteria
   * @tags dbtn/module:claude_direct
   * @name search_clients
   * @summary Search Clients
   * @request POST:/routes/search_clients
   */
  export namespace search_clients {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientSearchParams;
    export type RequestHeaders = {};
    export type ResponseBody = SearchClientsData;
  }

  /**
   * @description Gets client details by ID
   * @tags dbtn/module:claude_direct
   * @name get_client_by_id
   * @summary Get Client By Id
   * @request GET:/routes/get_client_by_id
   */
  export namespace get_client_by_id {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Client Id */
      client_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientByIdData;
  }

  /**
   * @description Updates an existing client's information
   * @tags dbtn/module:claude_direct
   * @name update_client
   * @summary Update Client
   * @request POST:/routes/update_client
   */
  export namespace update_client {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Client Id */
      client_id: string;
    };
    export type RequestBody = ClientRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateClientData;
  }

  /**
   * @description Checks the status of Claude MCP tools
   * @tags dbtn/module:claude_direct
   * @name get_claude_mcp_status2
   * @summary Get Claude Mcp Status2
   * @request GET:/routes/get_claude_mcp_status2
   */
  export namespace get_claude_mcp_status2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClaudeMcpStatus2Data;
  }

  /**
   * @description Crea un cliente directamente desde Claude Desktop - endpoint optimizado
   * @tags mcp-direct, dbtn/module:mcp_direct2
   * @name add_client_direct22
   * @summary Add Client Direct22
   * @request POST:/routes/mcp/add-client-direct22
   */
  export namespace add_client_direct22 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpDirect2SimpleClient;
    export type RequestHeaders = {};
    export type ResponseBody = AddClientDirect22Data;
  }

  /**
   * @description Send a templated message to a client with custom parameters
   * @tags MCP-Communication, dbtn/module:mcp_communication
   * @name mcpnew_send_templated_message
   * @summary Mcpnew Send Templated Message
   * @request POST:/routes/mcp/send-templated-message
   */
  export namespace mcpnew_send_templated_message {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpCommunicationTemplatedMessageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewSendTemplatedMessageData;
  }

  /**
   * @description Schedule a reminder for a client for a specific date
   * @tags MCP-Communication, dbtn/module:mcp_communication
   * @name mcpnew_schedule_client_reminder
   * @summary Mcpnew Schedule Client Reminder
   * @request POST:/routes/mcp/schedule-client-reminder
   */
  export namespace mcpnew_schedule_client_reminder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpCommunicationReminderRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewScheduleClientReminderData;
  }

  /**
   * @description Retrieve communication history for a specific client
   * @tags MCP-Communication, dbtn/module:mcp_communication
   * @name mcpnew_get_communication_history
   * @summary Mcpnew Get Communication History
   * @request POST:/routes/mcp/communication-history
   */
  export namespace mcpnew_get_communication_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CommunicationHistoryRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetCommunicationHistoryData;
  }

  /**
   * @description Calculate client adherence metrics for workout, nutrition, and communication
   * @tags MCP-Analysis, dbtn/module:mcp_analysis
   * @name mcpnew_get_client_adherence_metrics
   * @summary Mcpnew Get Client Adherence Metrics
   * @request POST:/routes/mcp/client-adherence
   */
  export namespace mcpnew_get_client_adherence_metrics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientAdherenceRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetClientAdherenceMetricsData;
  }

  /**
   * @description Calculate effectiveness metrics for a specific training program
   * @tags MCP-Analysis, dbtn/module:mcp_analysis
   * @name mcpnew_get_program_effectiveness
   * @summary Mcpnew Get Program Effectiveness
   * @request POST:/routes/mcp/program-effectiveness
   */
  export namespace mcpnew_get_program_effectiveness {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpAnalysisProgramEffectivenessRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetProgramEffectivenessData;
  }

  /**
   * @description Generate business metrics and KPIs for the specified date range and segments
   * @tags MCP-Analysis, dbtn/module:mcp_analysis
   * @name mcpnew_generate_business_metrics
   * @summary Mcpnew Generate Business Metrics
   * @request POST:/routes/mcp/business-metrics
   */
  export namespace mcpnew_generate_business_metrics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpAnalysisBusinessMetricsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGenerateBusinessMetricsData;
  }

  /**
   * @description Redirige a la implementación principal en mcp_system
   * @tags mcp-setup, dbtn/module:mcp_activation
   * @name get_mcp_status_endpoint
   * @summary Get Mcp Status Endpoint
   * @request GET:/routes/get_mcp_status
   */
  export namespace get_mcp_status_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMcpStatusEndpointData;
  }

  /**
   * @description Activa el MCP para Claude Desktop
   * @tags mcp-setup, dbtn/module:mcp_activation
   * @name activate_mcp_endpoint
   * @summary Activate Mcp Endpoint
   * @request POST:/routes/activate_mcp
   */
  export namespace activate_mcp_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MCPActivationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ActivateMcpEndpointData;
  }

  /**
   * @description Obtiene el estado actual del servicio MCP para Claude Desktop
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name get_mcp_status_endpoint2
   * @summary Get Mcp Status Endpoint2
   * @request GET:/routes/mcp/status2
   */
  export namespace get_mcp_status_endpoint2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMcpStatusEndpoint2Data;
  }

  /**
   * @description Activa el MCP para Claude Desktop
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name activate_mcp_endpoint2
   * @summary Activate Mcp Endpoint2
   * @request POST:/routes/mcp/activate2
   */
  export namespace activate_mcp_endpoint2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MCPActivationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ActivateMcpEndpoint2Data;
  }

  /**
   * @description Obtiene la lista de herramientas disponibles en el MCP
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name get_mcp_tools_endpoint
   * @summary Get Mcp Tools Endpoint
   * @request GET:/routes/mcp/tools
   */
  export namespace get_mcp_tools_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMcpToolsEndpointData;
  }

  /**
   * @description Obtiene los registros de acceso al MCP
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name get_mcp_access_logs_endpoint
   * @summary Get Mcp Access Logs Endpoint
   * @request GET:/routes/mcp/access-logs
   */
  export namespace get_mcp_access_logs_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMcpAccessLogsEndpointData;
  }

  /**
   * @description Actualiza la configuración del MCP
   * @tags mcp-system, mcp, dbtn/module:mcp_system
   * @name update_mcp_settings_endpoint
   * @summary Update Mcp Settings Endpoint
   * @request POST:/routes/mcp/settings
   */
  export namespace update_mcp_settings_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateMcpSettingsEndpointPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateMcpSettingsEndpointData;
  }

  /**
   * @description Log body measurements for a client
   * @tags dbtn/module:progress
   * @name log_measurement
   * @summary Log Measurement
   * @request POST:/routes/progress/measurements
   */
  export namespace log_measurement {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressMeasurementRequest;
    export type RequestHeaders = {};
    export type ResponseBody = LogMeasurementData;
  }

  /**
   * @description Log a completed workout for a client
   * @tags dbtn/module:progress
   * @name log_workout
   * @summary Log Workout
   * @request POST:/routes/progress/workouts
   */
  export namespace log_workout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressWorkoutRequest;
    export type RequestHeaders = {};
    export type ResponseBody = LogWorkoutData;
  }

  /**
   * @description Log subjective feedback from a client
   * @tags dbtn/module:progress
   * @name log_subjective_feedback
   * @summary Log Subjective Feedback
   * @request POST:/routes/progress/feedback
   */
  export namespace log_subjective_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressFeedbackRequest;
    export type RequestHeaders = {};
    export type ResponseBody = LogSubjectiveFeedbackData;
  }

  /**
   * @description Get progress history for a client with optional filtering
   * @tags dbtn/module:progress
   * @name get_progress_history
   * @summary Get Progress History
   * @request GET:/routes/progress/history/{client_id}
   */
  export namespace get_progress_history {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProgressHistoryData;
  }

  /**
   * @description Get summary of progress metrics for a client
   * @tags dbtn/module:progress
   * @name get_progress_summary
   * @summary Get Progress Summary
   * @request GET:/routes/progress/summary/{client_id}
   */
  export namespace get_progress_summary {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProgressSummaryData;
  }

  /**
   * @description Get training program templates with optional filtering
   * @tags dbtn/module:training
   * @name get_training_templates
   * @summary Get Training Templates
   * @request GET:/routes/training/templates
   */
  export namespace get_training_templates {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTrainingTemplatesData;
  }

  /**
   * @description Get a specific training program by ID
   * @tags dbtn/module:training
   * @name get_training_program
   * @summary Get Training Program
   * @request GET:/routes/training/programs/{program_id}
   */
  export namespace get_training_program {
    export type RequestParams = {
      /**
       * Program Id
       * The ID of the training program
       */
      programId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTrainingProgramData;
  }

  /**
   * @description Get a client's active training program
   * @tags dbtn/module:training
   * @name get_client_active_program
   * @summary Get Client Active Program
   * @request GET:/routes/training/clients/{client_id}/program
   */
  export namespace get_client_active_program {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientActiveProgramData;
  }

  /**
   * @description Update a client's active training program
   * @tags dbtn/module:training
   * @name update_client_program
   * @summary Update Client Program
   * @request PATCH:/routes/training/clients/{client_id}/program
   */
  export namespace update_client_program {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ClientProgramUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateClientProgramData;
  }

  /**
   * @description Assign a training program to a client
   * @tags dbtn/module:training
   * @name assign_program_to_client
   * @summary Assign Program To Client
   * @request POST:/routes/training/clients/program
   */
  export namespace assign_program_to_client {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TrainingProgramAssignment;
    export type RequestHeaders = {};
    export type ResponseBody = AssignProgramToClientData;
  }

  /**
   * @description Get detailed information about a specific exercise
   * @tags dbtn/module:training
   * @name get_exercise_details
   * @summary Get Exercise Details
   * @request GET:/routes/training/exercises/{exercise_id}
   */
  export namespace get_exercise_details {
    export type RequestParams = {
      /**
       * Exercise Id
       * The ID of the exercise
       */
      exerciseId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetExerciseDetailsData;
  }

  /**
   * @description Get nutrition plan templates with optional filtering
   * @tags dbtn/module:nutrition
   * @name get_nutrition_templates
   * @summary Get Nutrition Templates
   * @request GET:/routes/nutrition/nutrition/templates
   */
  export namespace get_nutrition_templates {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetNutritionTemplatesData;
  }

  /**
   * @description Get a specific nutrition plan by ID
   * @tags dbtn/module:nutrition
   * @name get_nutrition_plan
   * @summary Get Nutrition Plan
   * @request GET:/routes/nutrition/nutrition/plans/{plan_id}
   */
  export namespace get_nutrition_plan {
    export type RequestParams = {
      /**
       * Plan Id
       * The ID of the nutrition plan
       */
      planId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetNutritionPlanData;
  }

  /**
   * @description Get a client's active nutrition plan
   * @tags dbtn/module:nutrition
   * @name get_client_active_nutrition
   * @summary Get Client Active Nutrition
   * @request GET:/routes/nutrition/nutrition/clients/{client_id}/plan
   */
  export namespace get_client_active_nutrition {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientActiveNutritionData;
  }

  /**
   * @description Update a client's active nutrition plan
   * @tags dbtn/module:nutrition
   * @name update_client_nutrition
   * @summary Update Client Nutrition
   * @request PATCH:/routes/nutrition/nutrition/clients/{client_id}/plan
   */
  export namespace update_client_nutrition {
    export type RequestParams = {
      /**
       * Client Id
       * The ID of the client
       */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ClientNutritionUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateClientNutritionData;
  }

  /**
   * @description Assign a nutrition plan to a client
   * @tags dbtn/module:nutrition
   * @name assign_nutrition_plan
   * @summary Assign Nutrition Plan
   * @request POST:/routes/nutrition/nutrition/clients/plan
   */
  export namespace assign_nutrition_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NutritionPlanAssignment;
    export type RequestHeaders = {};
    export type ResponseBody = AssignNutritionPlanData;
  }

  /**
   * @description Search for nutrition information for multiple food items matching query criteria This endpoint provides advanced food search functionality, returning multiple matching results. Parameters: - query: Search text to find matching foods - limit: Maximum number of results to return (default: 10) - category: Optional food category filter Returns a list of matching food items with their complete nutritional information. Example for Claude Desktop MCP: ``` You can use this tool to search for nutrition information about foods. For example: - "Search for chicken breast information" - "Get nutrition facts for almonds" - "Find macros for greek yogurt and berries" ```
   * @tags dbtn/module:nutrition
   * @name advanced_food_search
   * @summary Advanced Food Search
   * @request POST:/routes/nutrition/food/search
   */
  export namespace advanced_food_search {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FoodSearchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AdvancedFoodSearchData;
  }

  /**
   * @description Look up nutrition information for a specific food item This endpoint retrieves detailed nutritional information for a single food item. Consider using the /food/search endpoint for more advanced search capabilities. Parameters: - food_name: Name of the food to look up Returns complete nutritional information for the matched food item.
   * @tags dbtn/module:nutrition
   * @name lookup_food_nutrition
   * @summary Lookup Food Nutrition
   * @request GET:/routes/nutrition/food/{food_name}
   */
  export namespace lookup_food_nutrition {
    export type RequestParams = {
      /** Food Name */
      foodName: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = LookupFoodNutritionData;
  }

  /**
   * @description Create a new nutrition plan
   * @tags dbtn/module:nutrition
   * @name create_nutrition_plan
   * @summary Create Nutrition Plan
   * @request POST:/routes/nutrition/plans
   */
  export namespace create_nutrition_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NutritionPlanCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateNutritionPlanData;
  }

  /**
   * @description Search for clients by name, email, type, or status. This endpoint allows searching across all clients in the system using various filters and criteria. It's useful for finding specific clients quickly or generating filtered lists of clients matching certain parameters. Args: request: A search request containing query terms and filters Returns: A list of clients matching the search criteria with basic profile information Example Claude Usage: "Find all PRIME clients that joined in the last month" "Search for clients named Smith" "List all active LONGEVITY clients"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_search_clients
   * @summary Mcpnew Search Clients
   * @request POST:/routes/mcp/clients/search
   */
  export namespace mcpnew_search_clients {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientSearchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewSearchClientsData;
  }

  /**
   * @description Get detailed information about a specific client. This endpoint retrieves comprehensive client information including profile details, active programs, nutrition plans, and recent progress. It's the primary method to get a complete view of a client's current status. Args: request: A request containing the client's ID Returns: Comprehensive client profile data including active programs and plans Example Claude Usage: "Get all details for client with ID abc123" "Tell me about Jane Smith's profile" "What programs is Michael currently enrolled in?"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_client_details
   * @summary Mcpnew Get Client Details
   * @request POST:/routes/mcp/clients/get
   */
  export namespace mcpnew_get_client_details {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientDetailsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetClientDetailsData;
  }

  /**
   * @description Add a new client to the system
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_add_client
   * @summary Mcpnew Add Client
   * @request POST:/routes/mcp/clients/add
   */
  export namespace mcpnew_add_client {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AddClientRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewAddClientData;
  }

  /**
   * @description Get client progress history with optional filtering. This endpoint retrieves a client's progress records over time, with the ability to filter by record type (weight, measurements, workouts, etc.) and time period. It's essential for tracking client progress and visualizing trends. Args: request: A request specifying the client ID, record type, and time period Returns: A chronological history of progress records with calculated summaries Example Claude Usage: "Show me John's weight history for the last 3 months" "Get all workout records for client abc123" "What progress has Sarah made on her measurements?"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_progress_history
   * @summary Mcpnew Get Progress History
   * @request POST:/routes/mcp/progress-history
   */
  export namespace mcpnew_get_progress_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpnewProgressHistoryRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetProgressHistoryData;
  }

  /**
   * @description Get adherence metrics for a client. This endpoint analyzes a client's adherence to their training, nutrition, and recovery protocols. It provides both overall adherence scores and breakdowns by different categories and time periods, helping coaches identify areas where clients may need additional support or motivation. Args: request: A request specifying the client ID, date range, and breakdown options Returns: Adherence metrics with summaries, trends, and optional detailed breakdowns Example Claude Usage: "What's John's overall adherence rate?" "Show me Sarah's training compliance over the last month" "Which days of the week does Michael have the lowest nutrition adherence?"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_client_adherence_metrics2
   * @summary Mcpnew Get Client Adherence Metrics2
   * @request POST:/routes/mcp/analytics/adherence2
   */
  export namespace mcpnew_get_client_adherence_metrics2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AdherenceMetricsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetClientAdherenceMetrics2Data;
  }

  /**
   * @description Analyze the effectiveness of a training program. This endpoint evaluates how effective a specific training program has been across all clients who have used it. It measures various metrics like strength gains, body composition changes, adherence rates, and client satisfaction, providing valuable insights for program refinement. Args: request: A request specifying the program ID and metrics to analyze Returns: Effectiveness metrics with comparisons to previous programs and averages Example Claude Usage: "How effective is the Hypertrophy Block 2 program?" "What's the client satisfaction rate for the PRIME Strength program?" "Compare the effectiveness of the LONGEVITY Mobility program to average"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_program_effectiveness2
   * @summary Mcpnew Get Program Effectiveness2
   * @request POST:/routes/mcp/analytics/effectiveness2
   */
  export namespace mcpnew_get_program_effectiveness2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpnewProgramEffectivenessRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetProgramEffectiveness2Data;
  }

  /**
   * @description Generate business-level metrics and analytics. This endpoint provides high-level business metrics and insights across the entire NGX system, including client statistics, revenue data, program performance, and retention rates. It's valuable for business planning, marketing strategy, and overall performance monitoring. Args: request: A request specifying the date range and segments to analyze Returns: Comprehensive business metrics with optional segment breakdowns Example Claude Usage: "What are our overall business metrics for this quarter?" "Show me client retention rates by program type" "Generate revenue metrics for the PRIME program from January to March"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_generate_business_metrics2
   * @summary Mcpnew Generate Business Metrics2
   * @request POST:/routes/mcp/analytics/business-metrics2
   */
  export namespace mcpnew_generate_business_metrics2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisMcpnewBusinessMetricsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGenerateBusinessMetrics2Data;
  }

  /**
   * @description Get the current status of the agent system. This endpoint provides information about the AI agent system's current operational status, available models, capabilities, and recent updates. It's useful for monitoring the system's health and understanding what AI capabilities are currently available. Returns: The current operational status of the agent system and its capabilities Example Claude Usage: "Check if the agent system is operational" "What AI models are currently active in NGX?" "What are the current capabilities of the NGX AI system?"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_get_agent_system_status
   * @summary Mcpnew Get Agent System Status
   * @request GET:/routes/mcp/agent/status
   */
  export namespace mcpnew_get_agent_system_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetAgentSystemStatusData;
  }

  /**
   * @description Run specialized agent analysis on client data. This endpoint leverages AI to perform in-depth analysis on client data, generating insights, predictions, and recommendations. The analysis type parameter allows for different types of analyses including progress prediction, program optimization, and more. Args: request: A request specifying the client ID, analysis type, and parameters Returns: AI-generated analysis results with insights and recommendations Example Claude Usage: "Predict John's progress for the next 4 weeks" "Optimize Sarah's current training program" "Analyze client adherence patterns for Michael"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_run_agent_analysis
   * @summary Mcpnew Run Agent Analysis
   * @request POST:/routes/mcp/agent/analysis
   */
  export namespace mcpnew_run_agent_analysis {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AgentAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewRunAgentAnalysisData;
  }

  /**
   * @description Generate a comprehensive client report. This endpoint creates detailed reports for clients based on their historical data and current status. Different report types are available including quarterly progress reports, nutrition analysis, and program effectiveness reports. These reports provide valuable insights and recommendations for both coaches and clients. Args: request: A request specifying the client ID, report type, and date range Returns: A comprehensive client report with summaries, metrics, and recommendations Example Claude Usage: "Generate a quarterly progress report for John" "Create a nutrition analysis report for Sarah" "Prepare a comprehensive fitness report for Michael from January to March"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_generate_client_report
   * @summary Mcpnew Generate Client Report
   * @request POST:/routes/mcp/agent/report
   */
  export namespace mcpnew_generate_client_report {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientReportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGenerateClientReportData;
  }

  /**
   * @description Translate technical program data into natural language. This endpoint converts technical training program data into clear, natural language descriptions that clients can easily understand. The complexity level parameter allows for different levels of detail and technical terminology in the output, from simple explanations to detailed professional descriptions. Args: request: A request containing the program data and desired complexity level Returns: A natural language translation of the technical program data Example Claude Usage: "Translate John's strength program into simple language" "Create a detailed explanation of Sarah's hypertrophy program" "Convert Michael's training plan to client-friendly language"
   * @tags mcp, dbtn/module:mcpnew
   * @name mcpnew_translate_program_to_natural_language
   * @summary Mcpnew Translate Program To Natural Language
   * @request POST:/routes/mcp/agent/translate-program
   */
  export namespace mcpnew_translate_program_to_natural_language {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TranslateProgramRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewTranslateProgramToNaturalLanguageData;
  }

  /**
   * @description Retrieve training program templates with optional filtering by program type. This endpoint allows you to fetch available training program templates from the database. Templates can be filtered by program type (PRIME or LONGEVITY) and limited in quantity. Parameters: - program_type: Optional filter for program type (PRIME or LONGEVITY) - limit: Maximum number of templates to return (default: 10) Returns a list of training program templates and the total count of matching templates. Example for Claude: ``` To retrieve LONGEVITY training templates: {"program_type": "LONGEVITY", "limit": 5} To retrieve all templates (up to 10): {} ```
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_training_templates
   * @summary Mcpnew Get Training Templates
   * @request POST:/routes/mcp/training-templates
   */
  export namespace mcpnew_get_training_templates {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TrainingTemplatesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetTrainingTemplatesData;
  }

  /**
   * @description Retrieve detailed information about a specific training program
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_training_program
   * @summary Mcpnew Get Training Program
   * @request POST:/routes/mcp/training-program
   */
  export namespace mcpnew_get_training_program {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TrainingProgramRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetTrainingProgramData;
  }

  /**
   * @description Retrieve the active training program assigned to a specific client
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_client_active_program
   * @summary Mcpnew Get Client Active Program
   * @request POST:/routes/mcp/client-active-program
   */
  export namespace mcpnew_get_client_active_program {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientProgramRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetClientActiveProgramData;
  }

  /**
   * @description Assign a training program to a client with optional adjustments
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_assign_program_to_client
   * @summary Mcpnew Assign Program To Client
   * @request POST:/routes/mcp/assign-program
   */
  export namespace mcpnew_assign_program_to_client {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AssignProgramRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewAssignProgramToClientData;
  }

  /**
   * @description Update a client's active training program with progress tracking and program adjustments
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_update_client_program
   * @summary Mcpnew Update Client Program
   * @request POST:/routes/mcp/update-client-program
   */
  export namespace mcpnew_update_client_program {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateClientProgramRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewUpdateClientProgramData;
  }

  /**
   * @description Retrieve detailed information about a specific exercise. This endpoint provides comprehensive details about a specific exercise including name, category, target muscles, equipment needed, difficulty level, instructions, and video URL if available. Parameters: - exercise_id: The unique identifier of the exercise Returns the complete exercise details including all available metadata. Example for Claude: ``` To get details about a specific exercise: {"exercise_id": "12345"} ```
   * @tags MCP-Training, dbtn/module:mcp_training
   * @name mcpnew_get_exercise_details
   * @summary Mcpnew Get Exercise Details
   * @request POST:/routes/mcp/exercise-details
   */
  export namespace mcpnew_get_exercise_details {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ExerciseDetailsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetExerciseDetailsData;
  }

  /**
   * @description Retrieve nutrition plan templates with optional filtering by plan type. This endpoint allows you to fetch available nutrition plan templates from the database. Templates can be filtered by plan type (PRIME or LONGEVITY) and limited in quantity. Parameters: - plan_type: Optional filter for program type (PRIME or LONGEVITY) - limit: Maximum number of templates to return (default: 10) Returns a list of nutrition plan templates and the total count of matching templates. Example for Claude: ``` To retrieve PRIME nutrition templates: {"plan_type": "PRIME", "limit": 5} To retrieve all templates (up to 10): {} ```
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_get_nutrition_templates
   * @summary Mcpnew Get Nutrition Templates
   * @request POST:/routes/mcp/nutrition-templates
   */
  export namespace mcpnew_get_nutrition_templates {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NutritionTemplatesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetNutritionTemplatesData;
  }

  /**
   * @description Retrieve detailed information about a specific nutrition plan
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_get_nutrition_plan
   * @summary Mcpnew Get Nutrition Plan
   * @request POST:/routes/mcp/nutrition-plan
   */
  export namespace mcpnew_get_nutrition_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NutritionPlanRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetNutritionPlanData;
  }

  /**
   * @description Retrieve the active nutrition plan assigned to a specific client
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_get_client_active_nutrition
   * @summary Mcpnew Get Client Active Nutrition
   * @request POST:/routes/mcp/client-active-nutrition
   */
  export namespace mcpnew_get_client_active_nutrition {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientNutritionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewGetClientActiveNutritionData;
  }

  /**
   * @description Assign a nutrition plan to a client with optional adjustments
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_assign_nutrition_plan
   * @summary Mcpnew Assign Nutrition Plan
   * @request POST:/routes/mcp/assign-nutrition-plan
   */
  export namespace mcpnew_assign_nutrition_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AssignNutritionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewAssignNutritionPlanData;
  }

  /**
   * @description Update a client's active nutrition plan with progress tracking and plan adjustments
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_update_client_nutrition
   * @summary Mcpnew Update Client Nutrition
   * @request POST:/routes/mcp/update-client-nutrition
   */
  export namespace mcpnew_update_client_nutrition {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateClientNutritionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewUpdateClientNutritionData;
  }

  /**
   * @description Lookup nutritional information for a specific food item. Returns detailed nutritional information for a food item specified by name. This endpoint is optimized for MCP (Model Context Protocol) integration and provides comprehensive macro and micronutrient data. Parameters: - food_name: Name of the food to search for Returns a single food item with complete nutritional breakdown along with alternative options if the exact match is not found. Example for Claude: ``` To lookup nutritional information for chicken breast: {"food_name": "chicken breast"} To lookup nutritional information for brown rice: {"food_name": "brown rice"} ```
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_lookup_food_nutrition
   * @summary Mcpnew Lookup Food Nutrition
   * @request POST:/routes/mcp/lookup-food-nutrition
   */
  export namespace mcpnew_lookup_food_nutrition {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FoodNutritionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewLookupFoodNutritionData;
  }

  /**
   * @description Create a new nutrition plan template
   * @tags MCP-Nutrition, dbtn/module:mcp_nutrition
   * @name mcpnew_create_nutrition_plan
   * @summary Mcpnew Create Nutrition Plan
   * @request POST:/routes/mcp/create-nutrition-plan
   */
  export namespace mcpnew_create_nutrition_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NutritionPlanInput;
    export type RequestHeaders = {};
    export type ResponseBody = McpnewCreateNutritionPlanData;
  }

  /**
   * @description Log an activity in the system This endpoint records system activities like user actions, data changes, and system events. It provides a standardized way to log activities across the application for audit purposes. Args: data: A dictionary containing activity details including action, entity type, and metadata Returns: The created activity log entry with its ID Example Claude Usage: "Log that user X updated client Y's nutrition plan" "Record a system maintenance event" "Track when a program was assigned to a client"
   * @tags logs, dbtn/module:logs
   * @name log_activity
   * @summary Log Activity
   * @request POST:/routes/logs/activity
   */
  export namespace log_activity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LogActivityPayload;
    export type RequestHeaders = {};
    export type ResponseBody = LogActivityData;
  }

  /**
   * @description Get activity logs with filtering and pagination This endpoint retrieves activity logs with flexible filtering options including entity type, user ID, action type, and date ranges. Results are paginated for performance, and provide detailed information on all system activities for audit and monitoring purposes. Args: request: A request defining filters, pagination, and sorting options for logs Returns: A paginated list of activity logs matching the criteria Example Claude Usage: "Show me all client updates from last week" "Get system activities for user X" "List all deletion actions in chronological order" "Which user made the most recent changes to nutrition plans?"
   * @tags logs, dbtn/module:logs
   * @name get_activity_logs
   * @summary Get Activity Logs
   * @request POST:/routes/logs/get
   */
  export namespace get_activity_logs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ActivityLogRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetActivityLogsData;
  }

  /**
   * @description Log a new activity in the system. This endpoint records user actions within the system, creating an audit trail of all important operations. The logs are cached for efficient retrieval and optimized for performance. Examples of activities that can be logged: - Client creation/update/deletion - Program assignments - Measurement logging - System configuration changes Returns the created activity log entry with its generated ID.
   * @tags system, dbtn/module:activity_logs
   * @name record_system_activity
   * @summary Record System Activity
   * @request POST:/routes/log_activity
   */
  export namespace record_system_activity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LogActivityRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RecordSystemActivityData;
  }

  /**
   * @description Retrieve activity logs with optional filtering. This endpoint allows querying the activity logs with various filters such as entity type, entity ID, user ID, action, and date range. The logs provide visibility into all actions taken within the system, creating an audit trail that helps with troubleshooting, compliance, and understanding user behavior. Returns a paginated list of activity logs ordered by timestamp (newest first).
   * @tags system, mcp, dbtn/module:activity_logs
   * @name retrieve_system_activities
   * @summary Retrieve System Activities
   * @request POST:/routes/get_activity_logs
   */
  export namespace retrieve_system_activities {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetActivityLogsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RetrieveSystemActivitiesData;
  }

  /**
   * @description Initialize the activity_logs table in the database. This endpoint creates the activity_logs table if it doesn't exist already. It's typically called during the initial setup of the system.
   * @tags system, dbtn/module:activity_logs
   * @name initialize_activity_logs_table
   * @summary Initialize Activity Logs Table
   * @request POST:/routes/initialize_activity_logs_table
   */
  export namespace initialize_activity_logs_table {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InitializeActivityLogsTableData;
  }

  /**
   * @description Obtiene todas las categorías, grupos musculares, niveles de dificultad y tipos de equipamiento disponibles Este endpoint es útil para poblar filtros y desplegables en la interfaz de usuario cuando se construye un selector de ejercicios o editor de programas.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name get_categories
   * @summary Get Categories
   * @request GET:/routes/categories
   */
  export namespace get_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCategoriesData;
  }

  /**
   * @description Lista ejercicios con opciones de filtrado por categoría, grupo muscular, dificultad y búsqueda por texto Este endpoint permite obtener una lista filtrada de ejercicios para mostrar en la interfaz del editor de programas. Incluye parámetros de paginación y opciones para incluir datos de categorías.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name list_exercises
   * @summary List Exercises
   * @request GET:/routes/list
   */
  export namespace list_exercises {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListExercisesData;
  }

  /**
   * @description Obtiene los detalles completos de un ejercicio específico por su ID Proporciona toda la información disponible sobre un ejercicio, incluyendo descripción, instrucciones, imágenes, videos y metadatos adicionales.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name get_exercise
   * @summary Get Exercise
   * @request GET:/routes/{exercise_id}
   */
  export namespace get_exercise {
    export type RequestParams = {
      /**
       * Exercise Id
       * ID del ejercicio a obtener
       */
      exerciseId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetExerciseData;
  }

  /**
   * @description Actualiza un ejercicio existente Permite modificar cualquier atributo de un ejercicio existente, como su nombre, categoría, descripción, instrucciones o recursos multimedia.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name update_exercise
   * @summary Update Exercise
   * @request PUT:/routes/{exercise_id}
   */
  export namespace update_exercise {
    export type RequestParams = {
      /**
       * Exercise Id
       * ID del ejercicio a actualizar
       */
      exerciseId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ExerciseUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateExerciseData;
  }

  /**
   * @description Elimina un ejercicio de la biblioteca Permite eliminar un ejercicio completamente de la biblioteca de ejercicios. Se debe usar con precaución ya que esta operación no es reversible.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name delete_exercise
   * @summary Delete Exercise
   * @request DELETE:/routes/{exercise_id}
   */
  export namespace delete_exercise {
    export type RequestParams = {
      /**
       * Exercise Id
       * ID del ejercicio a eliminar
       */
      exerciseId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteExerciseData;
  }

  /**
   * @description Crea un nuevo ejercicio en la biblioteca Permite añadir un nuevo ejercicio a la biblioteca con todos sus detalles, incluyendo nombre, categoría, grupos musculares, descripciones, imágenes y videos.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name create_exercise
   * @summary Create Exercise
   * @request POST:/routes/create
   */
  export namespace create_exercise {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ExerciseCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateExerciseData;
  }

  /**
   * @description Importa múltiples ejercicios a la biblioteca en una sola operación Útil para cargar inicialmente una biblioteca de ejercicios o importar desde otras fuentes. Permite añadir muchos ejercicios en una sola llamada.
   * @tags Exercises-Library, dbtn/module:exercises_library
   * @name bulk_import_exercises
   * @summary Bulk Import Exercises
   * @request POST:/routes/bulk-import
   */
  export namespace bulk_import_exercises {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BulkImportExercisesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = BulkImportExercisesData;
  }

  /**
   * @description Log client measurements such as weight, body fat percentage, and other anthropometric data
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_log_measurement
   * @summary Mcp Log Measurement
   * @request POST:/routes/mcp/progress/log-measurement
   */
  export namespace mcp_log_measurement {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressV2MeasurementRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpLogMeasurementData;
  }

  /**
   * @description Log workout data including exercises performed, duration, intensity, and other metrics
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_log_workout
   * @summary Mcp Log Workout
   * @request POST:/routes/mcp/progress/log-workout
   */
  export namespace mcp_log_workout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressV2WorkoutRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpLogWorkoutData;
  }

  /**
   * @description Log subjective client feedback including energy levels, recovery, and general wellness metrics
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_log_subjective_feedback
   * @summary Mcp Log Subjective Feedback
   * @request POST:/routes/mcp/progress/log-feedback
   */
  export namespace mcp_log_subjective_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressV2FeedbackRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpLogSubjectiveFeedbackData;
  }

  /**
   * @description Retrieve a client's progress history for a specific record type within a date range
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_get_progress_history
   * @summary Mcp Get Progress History
   * @request POST:/routes/mcp/progress/history
   */
  export namespace mcp_get_progress_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisProgressV2ProgressHistoryRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpGetProgressHistoryData;
  }

  /**
   * @description Generate a summary of client progress for specified metrics over a time period
   * @tags MCP-Progress-V2, dbtn/module:progress_v2
   * @name mcp_get_progress_summary
   * @summary Mcp Get Progress Summary
   * @request POST:/routes/mcp/progress/summary
   */
  export namespace mcp_get_progress_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ProgressSummaryRequest;
    export type RequestHeaders = {};
    export type ResponseBody = McpGetProgressSummaryData;
  }
}
