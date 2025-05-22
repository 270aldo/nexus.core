import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client } from "utils/types";
import brain from "brain";
import { Loader2 } from "lucide-react";

export interface Props {
  onClientChange?: (clientId: string) => void;
  onClientSelect?: (clientId: string) => void;
  selectedClientId?: string;
  className?: string;
}

export function ClientSelector({ onClientSelect, onClientChange, selectedClientId = "", className = "" }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleClientChange = (clientId: string) => {
    if (onClientSelect) onClientSelect(clientId);
    if (onClientChange) onClientChange(clientId);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await brain.search_clients({
          query: "",
          limit: 100,
          status: "active"
        });
        
        if (response.ok) {
          const data = await response.json();
          setClients(Array.isArray(data.clients) ? data.clients : []);
        } else {
          throw new Error("Failed to load clients");
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to load clients");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // If the selected client ID is set but not found in clients, reset it
  useEffect(() => {
    if (selectedClientId && clients.length > 0 && !clients.some(client => client.id === selectedClientId)) {
      handleClientChange("");
    }
  }, [clients, selectedClientId, handleClientChange]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <Select 
        value={selectedClientId} 
        onValueChange={handleClientChange}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select Client" />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>Loading clients...</SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>{error}</SelectItem>
          ) : clients.length === 0 ? (
            <SelectItem value="empty" disabled>No active clients found</SelectItem>
          ) : (
            clients.map((client) => (
              <SelectItem key={client.id} value={client.id || ""}>
                {client.name || "Unnamed Client"}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

