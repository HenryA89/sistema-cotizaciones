import React, { useState, useEffect } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { addNote, getNotes } from "../services/clientService.js";

const ClientNotesPage = ({ client, onBack }) => {
  const [noteInput, setNoteInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const clientName = `${client.nombres || ""} ${client.apellidos || ""}`.trim();

  useEffect(() => {
    loadNotes();
  }, [client.id]);

  const loadNotes = async () => {
    try {
      const notes = await getNotes(client.id);
      setNotas(notes || []);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteInput.trim()) return;

    setIsSaving(true);
    try {
      await addNote(client.id, noteInput);
      setNoteInput("");
      await loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSaveNote();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-black tracking-widest uppercase transition-all btn-primary rounded-full shadow-lg hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">
            Bitácora de {clientName}
          </h2>
          <p className="text-xs text-muted uppercase tracking-widest mt-2">
            Registra acuerdos y observaciones estratégicas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Escritura */}
        <div className="card p-10 rounded-[60px] border-subtle shadow-sm-custom">
          <h3 className="mb-6 text-xl font-black uppercase tracking-tighter">
            Nueva Nota
          </h3>
          <div className="space-y-4">
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe aquí los acuerdos, observaciones o decisiones importantes...&#10;(Ctrl+Enter para guardar rápidamente)"
              className="w-full p-6 text-sm bg-cream rounded-[35px] border border-subtle outline-none resize-none min-h-75 focus:ring-2 focus:ring-primary-dark focus:border-transparent text-primary-dark leading-relaxed placeholder-muted"
            />
            <button
              onClick={handleSaveNote}
              disabled={!noteInput.trim() || isSaving}
              className="w-full btn-primary py-4 rounded-[35px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />{" "}
              {isSaving ? "Guardando..." : "Guardar Nota"}
            </button>
          </div>
        </div>

        {/* Panel de Notas Anteriores */}
        <div className="card p-10 rounded-[60px] border-subtle shadow-sm-custom">
          <h3 className="mb-6 text-xl font-black uppercase tracking-tighter">
            Historial de Notas
          </h3>
          <div className="space-y-4 max-h-150 overflow-y-auto pr-4 custom-scrollbar">
            {loading ? (
              <p className="text-center text-muted italic py-12">
                Cargando notas...
              </p>
            ) : notas.length === 0 ? (
              <p className="text-center text-muted italic py-12">
                Sin notas registradas aún
              </p>
            ) : (
              notas
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((note) => (
                  <div
                    key={note.id}
                    className="p-6 bg-cream rounded-[30px] border border-subtle hover:border-subtle transition-all shadow-sm-custom"
                  >
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">
                      {new Date(note.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-primary-dark leading-relaxed font-medium wrap-break-word whitespace-pre-wrap">
                      {note.contenido}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientNotesPage;
