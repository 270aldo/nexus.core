export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  programType: 'PRIME' | 'LONGEVITY';
  status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  avatar?: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  programType: 'PRIME' | 'LONGEVITY';
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  programType?: 'PRIME' | 'LONGEVITY';
  status?: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  notes?: string;
}

export interface ClientSearchFilters {
  query?: string;
  programType?: 'PRIME' | 'LONGEVITY';
  status?: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClientSearchResult {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
  searchFilters: ClientSearchFilters;
  totalClients: number;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}