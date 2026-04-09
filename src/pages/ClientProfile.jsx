import React from "react";
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

const ClientProfile = ({
  client,
  onBack,
  onCreateQuote,
  onOpenNotes,
  onOpenDiagnostico,
  onCreateProposal,
}) => {
  const clientName = `${client.nombres || ""} ${client.apellidos || ""}`.trim();
  const clientInitial = clientName.charAt(0) || "C";
  const clientLocation = `${client.ciudad || ""}, ${client.pais || ""}`.trim();

  const verificarDiagnosticos = () => {
    const diagnostico1 =
      localStorage.getItem(`diagnostico1:${client.id}`) ||
      localStorage.getItem("diagnostico1") ||
      "";

    const diagnostico2 =
      localStorage.getItem(`diagnostico2:${client.id}`) ||
      localStorage.getItem("diagnostico2") ||
      "";

    if (!diagnostico1.trim() || !diagnostico2.trim()) {
      alert(
        "Falta diligenciar diagnóstico y diseño. Completa ambos campos antes de generar la propuesta.",
      );
      return false;
    }

    return true;
  };

  const handleCrearPropuesta = () => {
    if (!verificarDiagnosticos()) return;

    localStorage.setItem("selectedClientId", String(client.id));
    onCreateProposal();
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
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-black tracking-widest uppercase transition-all rounded-full shadow-lg bg-cream-bg text-primary-green hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" /> Atrás
        </button>

        <div className="card p-10 rounded-[60px] border-blue-300 shadow-sm relative overflow-hidden text-center">
          <div className="w-40 h-40 md:w-56 md:h-56 bg-cream-bg rounded-[60px] border-4 border-blue-300 shadow-2xl overflow-hidden mx-auto mb-8 relative group shrink-0">
            {client.foto_url ? (
              <img
                src={client.foto_url}
                className="object-cover w-full h-full"
                alt={`Foto de ${clientName}`}
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onOpenNotes}
            className="bg-cream-bg text-primary-green py-4 md:py-6 rounded-[35px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-300 hover:text-blue-950 transition-all shadow-lg hover:shadow-xl"
          >
            <BookOpen className="w-5 h-5" /> Bitácora
          </button>

          <button
            onClick={onOpenDiagnostico}
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
            title="Generar propuesta"
          >
            <FilePlus className="w-5 h-5" /> Generar Propuesta
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
