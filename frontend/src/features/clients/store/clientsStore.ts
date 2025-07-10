import { create } from 'zustand';
import { Client, ClientState, ClientSearchFilters, CreateClientData, UpdateClientData } from '../types';
import { apiClient } from '../../../shared/services';
import { API_ENDPOINTS } from '../../../shared/constants';

interface ClientActions {
  fetchClients: (filters?: ClientSearchFilters) => Promise<void>;
  fetchClient: (id: string) => Promise<Client | null>;
  createClient: (data: CreateClientData) => Promise<Client | null>;
  updateClient: (id: string, data: UpdateClientData) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  searchClients: (filters: ClientSearchFilters) => Promise<void>;
  selectClient: (client: Client | null) => void;
  setSearchFilters: (filters: Partial<ClientSearchFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type ClientStore = ClientState & ClientActions;

const useClientsStore = create<ClientStore>((set, get) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,
  searchFilters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  totalClients: 0,

  fetchClients: async (filters) => {
    set({ isLoading: true, error: null });

    try {
      const searchParams = new URLSearchParams();
      const finalFilters = { ...get().searchFilters, ...filters };

      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.clients.list}?${searchParams.toString()}`
      );

      if (response.success && response.data) {
        set({
          clients: response.data.clients || response.data,
          totalClients: response.data.pagination?.total || response.data.length,
          searchFilters: finalFilters,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch clients',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Network error',
        isLoading: false,
      });
    }
  },

  fetchClient: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get<Client>(API_ENDPOINTS.clients.get(id));

      if (response.success && response.data) {
        set({
          selectedClient: response.data,
          isLoading: false,
        });
        return response.data;
      } else {
        set({
          error: response.error || 'Failed to fetch client',
          isLoading: false,
        });
        return null;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Network error',
        isLoading: false,
      });
      return null;
    }
  },

  createClient: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post<Client>(API_ENDPOINTS.clients.create, data);

      if (response.success && response.data) {
        set((state) => ({
          clients: [response.data!, ...state.clients],
          totalClients: state.totalClients + 1,
          isLoading: false,
        }));
        return response.data;
      } else {
        set({
          error: response.error || 'Failed to create client',
          isLoading: false,
        });
        return null;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Network error',
        isLoading: false,
      });
      return null;
    }
  },

  updateClient: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.put<Client>(API_ENDPOINTS.clients.update(id), data);

      if (response.success && response.data) {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? response.data! : client
          ),
          selectedClient: state.selectedClient?.id === id ? response.data : state.selectedClient,
          isLoading: false,
        }));
        return response.data;
      } else {
        set({
          error: response.error || 'Failed to update client',
          isLoading: false,
        });
        return null;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Network error',
        isLoading: false,
      });
      return null;
    }
  },

  deleteClient: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.delete(API_ENDPOINTS.clients.delete(id));

      if (response.success) {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
          selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
          totalClients: state.totalClients - 1,
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.error || 'Failed to delete client',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Network error',
        isLoading: false,
      });
      return false;
    }
  },

  searchClients: async (filters) => {
    await get().fetchClients(filters);
  },

  selectClient: (client) => set({ selectedClient: client }),

  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default useClientsStore;