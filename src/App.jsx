import React, { useState, useMemo, useEffect } from "react";
import { Zap } from "lucide-react";

// Firebase
import { useAuth } from "./hooks/useAuth.js";

import {
  createClientFromFormData,
  createClientRemote,
} from "./services/clientRegistrationService.js";
import supabase from "./services/supabaseClient.js";

// Components
import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";
import QuoteBuilder from "./components/quotes/QuoteBuilder.jsx";
import QuoteDocumentPreview from "./components/quotes/QuoteDocumentPreview.jsx";
import NewClientModal from "./components/clients/NewClientModal.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Directory from "./pages/Directory.jsx";
import Products from "./pages/Products.jsx";
import ClientProfile from "./pages/ClientProfile.jsx";
import ClientNotesPage from "./pages/ClientNotesPage.jsx";
import Propuesta from "./pages/Propuesta.jsx";
import Diagnostico from "./pages/Diagnostico.jsx";
import ClienteBitacora from "./pages/ClienteBitacora.jsx";

const App = () => {
  useAuth(); // Initialize auth
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading] = useState(false); // Temporarily set to false for testing

  const [selectedClient, setSelectedClient] = useState(null);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [previewingQuote, setPreviewingQuote] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [viewingNotes, setViewingNotes] = useState(false);

  // Reset to dashboard on mount
  useEffect(() => {
    setActiveTab("dashboard");
    setSelectedClient(null);
    setViewingProfile(false);
    setViewingNotes(false);
    setIsQuoteBuilderOpen(false);
    setPreviewingQuote(null);
    setIsNewClientModalOpen(false);
    setMobileSidebarOpen(false);
  }, []);

  // Remote fetch helpers
  const fetchClientes = async () => {
    try {
      console.log("Obteniendo lista de clientes...");
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      console.log("Clientes obtenidos:", data?.length || 0);
      setClientes(data || []);
    } catch (err) {
      console.error("fetchClientes error", err);
    }
  };

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error("fetchProductos error", err);
    }
  };

  const fetchServicios = async () => {
    try {
      const { data, error } = await supabase
        .from("servicios")
        .select("*, categorias(nombre)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setServicios(data || []);
    } catch (err) {
      console.error("fetchServicios error", err);
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("fetchCategorias error", err);
    }
  };

  const fetchCotizaciones = async () => {
    try {
      const { data, error } = await supabase
        .from("cotizaciones")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCotizaciones(data || []);
    } catch (err) {
      console.error("fetchCotizaciones error", err);
    }
  };

  useEffect(() => {
    // load initial remote data
    (async () => {
      await Promise.all([
        fetchClientes(),
        fetchProductos(),
        fetchServicios(),
        fetchCategorias(),
        fetchCotizaciones(),
      ]);
    })();
  }, []);

  // Sincronización en tiempo real del cliente seleccionado
  const freshClient = useMemo(() => {
    if (!selectedClient) return null;
    return clientes.find((c) => c.id === selectedClient.id) || selectedClient;
  }, [clientes, selectedClient]);

  const addProduct = async (product) => {
    try {
      const { error } = await supabase.from("productos").insert([
        {
          nombre: product.nombre,
          precio_unitario: product.precio,
          descripcion: product.descripcion || "",
        },
      ]);
      if (error) throw error;
      await fetchProductos();
    } catch (err) {
      console.error("addProduct error", err);
    }
  };

  const handleCreateClient = async (formData) => {
    try {
      console.log("Creando cliente con payload:", formData);
      const payload = createClientFromFormData(formData);
      console.log("Payload formateado:", payload);
      await createClientRemote(payload);
      console.log("Cliente creado, refrescando lista...");
      // refresh local list
      await fetchClientes();
      console.log("Lista de clientes actualizada:", clientes.length);
      setIsNewClientModalOpen(false);
    } catch (err) {
      console.error("handleCreateClient error", err);
    }
  };

  const addClient = () => {
    setIsNewClientModalOpen(true);
  };

  const loadExampleData = async () => {
    // Load remote data and navigate to directory
    await Promise.all([
      fetchClientes(),
      fetchProductos(),
      fetchServicios(),
      fetchCategorias(),
      fetchCotizaciones(),
    ]);
    setActiveTab("directory");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
        <div className="w-16 h-16 mb-6 border-t-4 border-white rounded-full animate-spin"></div>
        <h1 className="text-[12px] font-black uppercase tracking-[0.6em] animate-pulse">
          Sr.&nbsp;Zur Agency OS
        </h1>
      </div>
    );

  return (
    <div className="min-h-screen flex bg-blue-300 text-black font-sans selection:bg-black selection:text-white overflow-hidden">
      {/* CAPA DE DOCUMENTO PDF */}
      {previewingQuote && (
        <QuoteDocumentPreview
          quote={previewingQuote}
          onClose={() => setPreviewingQuote(null)}
        />
      )}

      {/* MODAL NUEVO CLIENTE */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSubmit={handleCreateClient}
      />

      {/* CONSTRUCTOR DE COTIZACIÓN */}
      <QuoteBuilder
        isOpen={isQuoteBuilderOpen}
        onClose={() => setIsQuoteBuilderOpen(false)}
        client={freshClient}
        productos={productos}
        servicios={servicios}
        onAddProduct={addProduct}
      />

      {/* SIDEBAR INSTITUCIONAL */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedClient={setSelectedClient}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen p-6 overflow-x-hidden text-black md:p-12 md:ml-72">
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
        />

        {activeTab === "dashboard" && (
          <Dashboard
            cotizaciones={cotizaciones}
            clientes={clientes}
            loadExampleData={loadExampleData}
            onPreview={setPreviewingQuote}
            onNavigateToClientes={() => {
              setActiveTab("directory");
              setViewingProfile(false);
              setViewingNotes(false);
            }}
            onNavigateToPropuestas={() => {
              console.log("Click en botón Propuestas - Navegando a propuestas");
              setActiveTab("propuestas");
              setViewingProfile(false);
              setViewingNotes(false);
            }}
          />
        )}

        {!viewingProfile && !viewingNotes && activeTab === "directory" && (
          <Directory
            clientes={clientes}
            selectedClient={selectedClient}
            setSelectedClient={(client) => {
              setSelectedClient(client);
              setViewingProfile(true);
            }}
            onCreateQuote={() => setIsQuoteBuilderOpen(true)}
            onAddClient={addClient}
          />
        )}

        {viewingProfile && selectedClient && (
          <ClientProfile
            client={selectedClient}
            onBack={() => {
              setViewingProfile(false);
              setSelectedClient(null);
            }}
            onCreateQuote={() => setIsQuoteBuilderOpen(true)}
            onOpenNotes={() => {
              setViewingProfile(false);
              setViewingNotes(true);
            }}
          />
        )}

        {viewingNotes && selectedClient && (
          <ClientNotesPage
            client={selectedClient}
            onBack={() => {
              setViewingNotes(false);
              setViewingProfile(true);
            }}
          />
        )}

        {activeTab === "propuestas" && <Propuesta />}

        {activeTab === "diagnosticos" && <Diagnostico />}

        {activeTab === "cliente-bitacora" && <ClienteBitacora />}

        {activeTab === "productos" && <Products productos={productos} />}
      </main>
    </div>
  );
};

export default App;
