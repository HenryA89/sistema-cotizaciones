import React, { useState } from "react";
import {
  ChevronLeft,
  Camera,
  MapPin,
  Zap,
  BookOpen,
  FileText,
  FilePlus,
} from "lucide-react";
import { uploadClientPhoto } from "../services/clientService.js";
import Diagnostico from "./Diagnostico.jsx";
import ClientNotes from "../components/clients/ClientNotes.jsx";

const ClientProfile = ({ client, onBack, onCreateQuote, onOpenNotes }) => {
  const clientName = `${client.nombres || ""} ${client.apellidos || ""}`.trim();
  const clientInitial = clientName.charAt(0) || "C";
  const clientLocation = `${client.ciudad || ""}, ${client.pais || ""}`.trim();

  // Estados para controlar qué componente mostrar
  const [showDiagnostico, setShowDiagnostico] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Función para verificar si los diagnósticos están completos
  const verificarDiagnosticos = () => {
    const diagnostico1 = localStorage.getItem("diagnostico1") || "";
    const diagnostico2 = localStorage.getItem("diagnostico2") || "";

    if (!diagnostico1.trim() || !diagnostico2.trim()) {
      alert(
        "Falta diligenciar diagnóstico y diseño. Por favor completa ambos campos en la sección de Diagnóstico y Diseño.",
      );
      return false;
    }

    return true;
  };

  // Función para crear propuesta
  const handleCrearPropuesta = () => {
    if (!verificarDiagnosticos()) {
      return;
    }

    // Redirigir a propuestas con el clienteId
    window.location.href = `/propuestas?clienteId=${client.id}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await uploadClientPhoto(client.id, reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Card de Perfil Centrada */}
      <div className="space-y-6">
        {/* Botón Back Superior */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-full shadow-lg bg-cream-bg text-primary-green hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" /> Atrás
        </button>

        {/* Card de Perfil */}
        <div className="card p-10 rounded-[60px] border-blue-300 shadow-sm relative overflow-hidden text-center">
          <div className="w-40 h-40 md:w-56 md:h-56 bg-cream-bg rounded-[60px] border-4 border-blue-300 shadow-2xl overflow-hidden mx-auto mb-8 relative group shrink-0">
            {client.foto_url ? (
              <img
                src={client.foto_url}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full font-black text-blue-300 bg-blue-950 text-7xl">
                {clientInitial}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center text-blue-300 transition-opacity opacity-0 cursor-pointer bg-blue-950/50 group-hover:opacity-100">
              <Camera className="w-10 h-10 text-blue-300" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <h3
            className="mb-3 text-3xl font-black leading-tight tracking-tighter text-black whitespace-normal wrap-break-word"
            style={{ hyphens: "none" }}
          >
            {clientName}
          </h3>
          <div className="pt-10 mt-10 space-y-5 text-xs font-bold tracking-widest text-left text-blue-300 uppercase border-t border-blue-300">
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-blue-300" /> {clientLocation}
            </div>
          </div>
        </div>
        {/* Botones de Acción */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowNotes(true)}
            className="bg-cream-bg text-primary-green py-4 md:py-6 rounded-[35px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-300 hover:text-blue-950 transition-all shadow-lg hover:shadow-xl"
          >
            <BookOpen className="w-5 h-5" /> Bitácora
          </button>
          <button
            onClick={() => setShowDiagnostico(true)}
            className="bg-cream-bg text-primary-green py-4 md:py-6 rounded-[35px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-300 hover:text-blue-950 transition-all shadow-lg hover:shadow-xl"
          >
            <FileText className="w-5 h-5" /> Diagnóstico y Diseño
          </button>
          <button
            onClick={onCreateQuote}
            className="bg-cream-bg text-primary-green py-4 md:py-6 rounded-[35px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-2xl"
          >
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />{" "}
            Cotización
          </button>
          <button
            onClick={handleCrearPropuesta}
            className="bg-blue-600 text-white py-4 md:py-6 rounded-[35px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-2xl"
            title="Generar Propuesta PDF"
          >
            <FilePlus className="w-5 h-5" /> Generar Propuesta
          </button>
        </div>
      </div>

      {/* Renderizar componentes adicionales */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Bitácora del Cliente
              </h2>
              <button
                onClick={() => setShowNotes(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ClientNotes client={client} />
            </div>
          </div>
        </div>
      )}

      {showDiagnostico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Diagnóstico y Diseño
              </h2>
              <button
                onClick={() => setShowDiagnostico(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <Diagnostico />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
