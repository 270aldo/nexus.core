// Export only what actually exists
export { default as useClientsStore } from './store/clientsStore';
export * from './types';

// Placeholder exports for components until they are implemented
export const ClientCard = () => null;
export const ClientForm = () => null;
export const ClientList = () => null;
export const ClientSearch = () => null;
export const ClientDetails = () => null;

// Placeholder hooks
export const useClients = () => ({ clients: [], loading: false, error: null });
export const useClientForm = () => ({ 
  register: () => {}, 
  handleSubmit: () => () => {}, 
  formState: { errors: {} } 
});
export const useClientSearch = () => ({ 
  searchTerm: '', 
  setSearchTerm: () => {}, 
  results: [] 
});