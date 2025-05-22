import { create } from 'zustand';
import brain from 'brain';
import { Client, ClientCreateRequest, ClientUpdateRequest, ClientSearchResponse } from './client-types';
import { toast } from 'sonner';

interface ClientState {
  // Client list
  clients: Client[];
  totalClients: number;
  isLoading: boolean;
  error: string | null;
  
  // Current client
  currentClient: Client | null;
  isLoadingCurrentClient: boolean;
  
  // Actions
  fetchClients: (query?: string, clientType?: string, status?: string, limit?: number, offset?: number) => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  createClient: (client: ClientCreateRequest) => Promise<Client | null>;
  updateClient: (id: string, client: ClientUpdateRequest) => Promise<Client | null>;
  clearCurrentClient: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  // Client list
  clients: [],
  totalClients: 0,
  isLoading: false,
  error: null,
  
  // Current client
  currentClient: null,
  isLoadingCurrentClient: false,
  
  // Actions
  fetchClients: async (query?: string, clientType?: string, status?: string, limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });
    
    try {
      const params: Record<string, any> = {};
      if (query) params.query = query;
      // Check for special filter values and convert to empty string for API
      if (clientType && clientType !== 'all-types') params.client_type = clientType;
      if (status && status !== 'all-status') params.status = status;
      params.limit = limit;
      params.offset = offset;
      
      console.log('Fetching clients with params:', params);
      const response = await brain.search_clients(params);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }
      
      const data: ClientSearchResponse = await response.json();
      console.log('Clients data received:', data);
      
      set({ 
        clients: data.clients, 
        totalClients: data.total,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch clients', 
        isLoading: false 
      });
      toast.error('Failed to fetch clients');
    }
  },
  
  fetchClientById: async (id: string) => {
    set({ isLoadingCurrentClient: true, error: null });
    
    try {
      const response = await brain.get_client_by_id({ client_id: id });
      const client = await response.json();
      
      set({ currentClient: client, isLoadingCurrentClient: false });
    } catch (error) {
      console.error('Error fetching client:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch client', 
        isLoadingCurrentClient: false 
      });
      toast.error('Failed to fetch client details');
    }
  },
  
  createClient: async (client: ClientCreateRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await brain.add_client(client);
      const newClient = await response.json();
      
      // Update the client list
      const { clients } = get();
      set({ 
        clients: [newClient, ...clients],
        totalClients: get().totalClients + 1,
        isLoading: false 
      });
      
      toast.success('Client created successfully');
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create client', 
        isLoading: false 
      });
      toast.error('Failed to create client');
      return null;
    }
  },
  
  updateClient: async (id: string, client: ClientUpdateRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await brain.update_client({ client_id: id }, client);
      const updatedClient = await response.json();
      
      // Update the client list and current client
      const { clients, currentClient } = get();
      const updatedClients = clients.map(c => c.id === id ? updatedClient : c);
      
      set({ 
        clients: updatedClients,
        currentClient: currentClient?.id === id ? updatedClient : currentClient,
        isLoading: false 
      });
      
      toast.success('Client updated successfully');
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update client', 
        isLoading: false 
      });
      toast.error('Failed to update client');
      return null;
    }
  },
  
  clearCurrentClient: () => {
    set({ currentClient: null });
  }
}));
