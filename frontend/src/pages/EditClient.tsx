import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ClientForm } from "../components/ClientForm";
import { useClientStore } from "../utils/client-store";
import { Layout } from "../components/Layout";
import { Header } from "../components/Header";
import { BackButton } from "../components/BackButton";

const EditClient = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const {
    currentClient,
    isLoadingCurrentClient,
    error,
    fetchClientById,
    clearCurrentClient,
  } = useClientStore();

  useEffect(() => {
    if (id) {
      fetchClientById(id);
    }

    return () => {
      clearCurrentClient();
    };
  }, [id, fetchClientById, clearCurrentClient]);

  if (isLoadingCurrentClient) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading client...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <BackButton fallbackPath="/clients?type=PRIME" />
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="text-muted-foreground mb-4">Client not found</div>
        <BackButton fallbackPath="/clients?type=PRIME" />
      </div>
    );
  }

  return (
    <Layout>
      <Header 
        title={`Edit ${currentClient.name}`}
        subtitle={`Update information for this ${currentClient.type} client`}
        accentColor={currentClient.type.toLowerCase() as "prime" | "longevity"}
        actions={<BackButton fallbackPath={`/client-detail?id=${id}`} />}
      />
      <div className="container mx-auto py-6 space-y-6">
        <ClientForm client={currentClient} isEdit={true} />
      </div>
    </Layout>
  );
};

export default EditClient;