import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  role: string;
  content: string;
  timestamp?: string;
}

interface SuggestedPromptProps {
  text: string;
  onClick: (text: string) => void;
}

interface ReferenceProps {
  title: string;
  url: string;
  type: string;
}

interface ActionProps {
  text: string;
  isCompleted?: boolean;
  onToggle?: () => void;
}

export interface ChatProps {
  clientId?: string;
  programId?: string;
  clientName?: string;
  programName?: string;
}

export function CoachAssistantChat({ clientId, programId, clientName, programName }: ChatProps) {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [references, setReferences] = useState<ReferenceProps[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hola, soy el Asistente NGX. ¿En qué puedo ayudarte hoy con tus clientes y programas de PRIME y LONGEVITY?",
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Fetch suggested prompts
    fetchSuggestedPrompts();
  }, [clientId, programId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const fetchSuggestedPrompts = async () => {
    try {
      // This would call the API in a real implementation
      // const response = await fetch(`/api/coach-assistant/suggested-prompts?clientId=${clientId}&programId=${programId}`);
      // const data = await response.json();
      // setSuggestedPrompts(data.data.suggested_prompts);
      
      // Mock data for demo
      const baseSuggestions = [
        "¿Cómo puedo mejorar la adherencia para este cliente?",
        "¿Cuáles son las métricas clave en las que debo enfocarme para este programa?",
        "Sugiere modificaciones para este programa basado en el progreso reciente",
        "Compara el progreso de este cliente con clientes similares",
        "Genera un informe de progreso para mi próxima reunión con el cliente"
      ];
      
      // Add client specific suggestions
      let allSuggestions = [...baseSuggestions];
      if (clientId) {
        allSuggestions = [
          ...allSuggestions,
          "¿Por qué el progreso de este cliente se ha estancado en las últimas 2 semanas?",
          "¿Qué ajustes nutricionales beneficiarían los objetivos actuales de este cliente?",
          "Genera puntos de conversación para mi próxima sesión con este cliente"
        ];
      }
      
      // Add program specific suggestions
      if (programId) {
        allSuggestions = [
          ...allSuggestions,
          "¿Cómo se compara este programa con otros programas PRIME en efectividad?",
          "¿Qué modificaciones debería hacer a este programa para mejores ganancias de fuerza?",
          "¿Cómo puedo ajustar este programa para un cliente con equipo limitado?"
        ];
      }
      
      setSuggestedPrompts(allSuggestions);
    } catch (error) {
      console.error("Error fetching suggested prompts:", error);
      toast.error("Error al cargar sugerencias de preguntas");
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Este sería el código en una implementación real
      // const response = await fetch("/api/coach-assistant/chat", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     message: userMessage.content,
      //     client_id: clientId,
      //     program_id: programId,
      //     conversation_history: messages
      //   })
      // });
      // const data = await response.json();
      
      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockResponse = generateMockResponse(userMessage.content);
      
      const assistantMessage = {
        role: "assistant",
        content: mockResponse.message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedActions(mockResponse.suggestedActions || []);
      setReferences(mockResponse.references || []);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const useSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };
  
  const toggleAction = (action: string) => {
    if (completedActions.includes(action)) {
      setCompletedActions(prev => prev.filter(a => a !== action));
    } else {
      setCompletedActions(prev => [...prev, action]);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex overflow-hidden">
        {/* Chat section */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none">
            <div className="flex items-center p-4 border-b">
              <Avatar className="h-10 w-10 bg-primary">
                <span className="text-lg font-bold">AI</span>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-medium">Asistente NGX</h3>
                <p className="text-sm text-muted-foreground">Experto en PRIME y LONGEVITY</p>
              </div>
              {(clientName || programName) && (
                <div className="ml-auto flex items-center space-x-2">
                  {clientName && (
                    <Badge variant="outline" className="bg-primary/10">
                      Cliente: {clientName}
                    </Badge>
                  )}
                  {programName && (
                    <Badge variant="outline" className="bg-primary/10">
                      Programa: {programName}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Messages container */}
            <ScrollArea className="flex-1 px-4 py-6">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      {message.timestamp && (
                        <p className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="p-4 border-t">
              <div className="flex">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta o solicitud..."
                  className="min-h-[80px] flex-1 resize-none"
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Presiona Enter para enviar, Shift+Enter para nueva línea
                </p>
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                  {isLoading ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar - context and tools */}
        <Card className="w-80 ml-4 overflow-hidden flex flex-col border-0 shadow-none">
          <Tabs defaultValue="suggestions">
            <TabsList className="w-full">
              <TabsTrigger value="suggestions" className="flex-1">Sugerencias</TabsTrigger>
              <TabsTrigger value="actions" className="flex-1">Acciones</TabsTrigger>
              <TabsTrigger value="references" className="flex-1">Referencias</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-4">
              <TabsContent value="suggestions" className="mt-4 space-y-2">
                <h3 className="font-medium mb-3">Sugerencias de preguntas</h3>
                {suggestedPrompts.map((prompt, index) => (
                  <SuggestedPrompt key={index} text={prompt} onClick={useSuggestedPrompt} />
                ))}
              </TabsContent>

              <TabsContent value="actions" className="mt-4 space-y-2">
                <h3 className="font-medium mb-3">Acciones sugeridas</h3>
                {suggestedActions.length > 0 ? (
                  suggestedActions.map((action, index) => (
                    <Action
                      key={index}
                      text={action}
                      isCompleted={completedActions.includes(action)}
                      onToggle={() => toggleAction(action)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Las acciones sugeridas aparecerán aquí después de tu consulta al asistente.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="references" className="mt-4">
                <h3 className="font-medium mb-3">Referencias y recursos</h3>
                {references.length > 0 ? (
                  <div className="space-y-3">
                    {references.map((reference, index) => (
                      <Reference key={index} {...reference} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Las referencias relevantes aparecerán aquí después de tu consulta al asistente.
                  </p>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Helper components
function SuggestedPrompt({ text, onClick }: SuggestedPromptProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-3 text-left whitespace-normal"
      onClick={() => onClick(text)}
    >
      {text}
    </Button>
  );
}

function Action({ text, isCompleted, onToggle }: ActionProps) {
  return (
    <div className="flex items-center space-x-2 p-2 rounded border">
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={onToggle}
        className="h-4 w-4"
      />
      <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
        {text}
      </span>
    </div>
  );
}

function Reference({ title, url, type }: ReferenceProps) {
  const getIcon = () => {
    switch (type) {
      case 'document':
        return '📄';
      case 'client_profile':
        return '👤';
      case 'program':
        return '🏋️';
      default:
        return '🔗';
    }
  };

  return (
    <a
      href={url}
      className="block p-3 rounded border hover:bg-muted transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center">
        <span className="text-lg mr-2">{getIcon()}</span>
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {type === 'document' ? 'Documento' : type === 'client_profile' ? 'Perfil de cliente' : 'Programa'}
      </p>
    </a>
  );
}

// Mock response generator
function generateMockResponse(message: string): { 
  message: string; 
  suggestedActions: string[]; 
  references: ReferenceProps[] 
} {
  if (message.toLowerCase().includes("adherencia")) {
    return {
      message: "Basado en los datos del cliente, su adherencia está actualmente en un 85%, lo cual es bueno pero tiene margen de mejora. Los principales problemas de adherencia parecen estar con los entrenamientos de fin de semana y el cumplimiento nutricional en ocasiones sociales. Recomiendo implementar una opción de horario flexible para el fin de semana y proporcionar estrategias específicas para situaciones de comidas fuera de casa. También considera configurar verificaciones automatizadas los viernes por la tarde como recordatorios.",
      suggestedActions: [
        "Programar verificaciones automáticas de fin de semana",
        "Actualizar pautas de nutrición para situaciones sociales",
        "Ajustar programa para mayor flexibilidad en fines de semana"
      ],
      references: [
        {
          title: "Estrategias de mejora de adherencia",
          url: "/resources/adherence-strategies",
          type: "document"
        },
        {
          title: "Guía de planificación nutricional",
          url: "/resources/nutrition-planning",
          type: "document"
        }
      ]
    };
  } else if (message.toLowerCase().includes("programa") && message.toLowerCase().includes("modifi")) {
    return {
      message: "Analizando el programa actual Hypertrophy Block 2 y las métricas de progreso del cliente, recomiendo:\n\n1. Aumentar el volumen en ejercicios de cadena posterior ya que muestran una progresión más lenta\n2. Añadir un ejercicio unilateral por sesión para abordar el ligero desequilibrio de fuerza\n3. Ajustar los protocolos de recuperación para incluir más técnicas de recuperación activa\n\nEstas modificaciones mantienen el enfoque de hipertrofia del programa mientras abordan las necesidades específicas identificadas en los datos de progreso.",
      suggestedActions: [
        "Ajustar programa en el módulo de Gestión de Entrenamiento",
        "Programar evaluación de seguimiento en 2 semanas",
        "Actualizar protocolos de recuperación"
      ],
      references: [
        {
          title: "Directrices de modificación de programas",
          url: "/resources/program-modification",
          type: "document"
        },
        {
          title: "Programa: Hypertrophy Block 2",
          url: "/programs/prog123",
          type: "program"
        }
      ]
    };
  } else if (message.toLowerCase().includes("compar")) {
    return {
      message: "En comparación con clientes similares en programas PRIME, este cliente está progresando un 15% más rápido en métricas de fuerza pero un 10% más lento en cambios de composición corporal. Su adherencia está por encima del promedio (85% frente al típico 78%). La diferencia más destacada es su consistencia con la frecuencia de entrenamiento, que se correlaciona con sus excelentes ganancias de fuerza. El área de mejora es su cumplimiento nutricional, lo que explica los cambios más lentos en la composición corporal.",
      suggestedActions: [
        "Revisar plan nutricional en el módulo de Gestión de Nutrición",
        "Programar sesión de educación nutricional",
        "Generar informe comparativo para mostrar al cliente"
      ],
      references: [
        {
          title: "Métricas de comparación de clientes PRIME",
          url: "/resources/prime-client-metrics",
          type: "document"
        },
        {
          title: "Perfil de cliente: John Doe",
          url: "/clients/abc123",
          type: "client_profile"
        }
      ]
    };
  } else if (message.toLowerCase().includes("informe")) {
    return {
      message: "# Informe de Progreso del Cliente\n\n## Logros Clave\n- Press de banca aumentó de 90kg a 102kg (mejora del 13.3%)\n- Grasa corporal reducida del 22% al 18% (4 puntos porcentuales)\n- Adherencia al entrenamiento consistente en 87%\n\n## Áreas de Enfoque\n- Cumplimiento nutricional actualmente en 78%, por debajo del objetivo\n- Métricas de recuperación mostrando signos de fatiga acumulada\n- Desarrollo de cadena posterior rezagado en relación con los objetivos del programa\n\n## Ajustes Recomendados\n- Simplificar plan nutricional para mejorar cumplimiento\n- Añadir protocolos de recuperación específicos para las próximas 2 semanas\n- Aumentar volumen de cadena posterior en un 20%\n\nEste informe se basa en datos de las últimas 8 semanas de entrenamiento.",
      suggestedActions: [
        "Programar reunión para revisar informe con cliente",
        "Implementar ajustes recomendados al programa",
        "Establecer nuevos objetivos basados en el progreso"
      ],
      references: [
        {
          title: "Plantilla de informe de progreso",
          url: "/resources/progress-report-template",
          type: "document"
        },
        {
          title: "Perfil de cliente: John Doe",
          url: "/clients/abc123",
          type: "client_profile"
        },
        {
          title: "Histórico de métricas de cliente",
          url: "/clients/abc123/metrics",
          type: "document"
        }
      ]
    };
  } else {
    return {
      message: "Entiendo que estás preguntando sobre optimización general del programa. Basado en el contexto proporcionado, recomiendo enfocarte en tres áreas clave: frecuencia de entrenamiento, calidad de recuperación y cumplimiento nutricional. Los datos muestran que estos factores tienen la correlación más alta con resultados exitosos en programas PRIME. ¿Te gustaría recomendaciones más específicas para alguna de estas áreas?",
      suggestedActions: [
        "Revisar métricas de frecuencia de entrenamiento",
        "Evaluar protocolos de recuperación actuales",
        "Analizar registros de cumplimiento nutricional"
      ],
      references: [
        {
          title: "Factores clave de éxito en programas PRIME",
          url: "/resources/prime-success-factors",
          type: "document"
        },
        {
          title: "Guía de optimización de programas",
          url: "/resources/program-optimization",
          type: "document"
        }
      ]
    };
  }
}