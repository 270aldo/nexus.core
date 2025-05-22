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
import { ClientNotes } from "components/ClientNotes";
import { useClientStore } from "../utils/client-store";
import { Client } from "../utils/client-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import brain from "brain";

const ClientsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const {
    clients,
    totalClients,
    isLoading,
    error,
    fetchClients,
  } = useClientStore();

  // State for delete dialog
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [clientType, setClientType] = useState<string>(typeFromUrl || "");
  const [status, setStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Effect to load clients on mount and when filters change
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    fetchClients(searchQuery, clientType, status, itemsPerPage, offset);
  }, [fetchClients, searchQuery, clientType, status, currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle delete client
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await brain.delete_client({ client_id: clientToDelete.id });
      
      if (response.ok) {
        toast.success("Cliente eliminado con éxito");
        // Refresh client list
        fetchClients(searchQuery, clientType, status, itemsPerPage, (currentPage - 1) * itemsPerPage);
      } else {
        const errorData = await response.text();
        throw new Error(errorData);
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar el cliente");
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "paused":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "inactive":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalClients / itemsPerPage);

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Header
        title="Clients"
        subtitle={`Manage your NGX ${typeFromUrl ? typeFromUrl : ''} clients`}
        accentColor={typeFromUrl?.toLowerCase() as "prime" | "longevity" | undefined}
        actions={<BackButton fallbackPath="/" />}
      />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <Button 
          onClick={() => navigate(`/add-client?type=${clientType || typeFromUrl || 'PRIME'}`)} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Search</CardTitle>
          <CardDescription>
            Filter and search through your client database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={clientType}
                onValueChange={(value) => setClientType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="PRIME">PRIME</SelectItem>
                  <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:w-auto">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clients ({totalClients})</CardTitle>
          <CardDescription>
            Showing {clients.length} of {totalClients} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading clients...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => fetchClients()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No clients found</p>
              <Button 
                onClick={() => navigate(`/add-client?type=${clientType || typeFromUrl || 'PRIME'}`)} 
                className="mt-4"
              >
                Add Your First Client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead aria-label="Actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={client.type === "PRIME" ? "text-blue-500 border-blue-500" : "text-purple-500 border-purple-500"}>
                          {client.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(client.join_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/client-detail?id=${client.id}`)}
                        >
                          View
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => setClientToDelete(client)}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el cliente 
                                <span className="font-semibold"> {clientToDelete?.name}</span> y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={handleDeleteClient}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevPage} 
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button 
              variant="outline" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ClientsPage;
