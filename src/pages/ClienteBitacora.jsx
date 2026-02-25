import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Calendar,
} from "lucide-react";
import supabase from "../services/supabaseClient.js";

const ClienteBitacora = () => {
  const [clienteId, setClienteId] = useState("");
  const [clienteData, setClienteData] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    tipo: "cotizacion",
    prioridad: "media",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id =
      urlParams.get("clienteId") ||
      localStorage.getItem("selectedClientId") ||
      "";
    setClienteId(id);

    if (id) {
      cargarDatosCliente(id);
      cargarNotas(id);
    }
  }, []);

  const cargarDatosCliente = async (id) => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando cliente:", error);
      } else {
        setClienteData(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cargarNotas = async (id) => {
    try {
      const { data, error } = await supabase
        .from("notas_cliente")
        .select("*")
        .eq("cliente_id", id)
        .eq("tipo", "cotizacion")
        .order("fecha_creacion", { ascending: false });

      if (error) {
        console.error("Error cargando notas:", error);
        setNotas([]);
      } else {
        setNotas(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNota = async () => {
    if (!clienteId || !formData.titulo.trim() || !formData.contenido.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const notaData = {
        cliente_id: clienteId,
        titulo: formData.titulo,
        contenido: formData.contenido,
        tipo: "cotizacion",
        prioridad: formData.prioridad,
        fecha_creacion: new Date().toISOString(),
      };

      let result;
      if (editingNota) {
        // Editar nota existente
        result = await supabase
          .from("notas_cliente")
          .update(notaData)
          .eq("id", editingNota.id)
          .select();
      } else {
        // Crear nueva nota
        result = await supabase
          .from("notas_cliente")
          .insert([notaData])
          .select();
      }

      if (result.error) {
        console.error("Error guardando nota:", result.error);
        alert("Error al guardar la nota");
      } else {
        alert(
          editingNota
            ? "Nota actualizada exitosamente"
            : "Nota guardada exitosamente",
        );
        resetForm();
        cargarNotas(clienteId);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la nota");
    }
  };

  const handleEditNota = (nota) => {
    setEditingNota(nota);
    setFormData({
      titulo: nota.titulo,
      contenido: nota.contenido,
      tipo: nota.tipo,
      prioridad: nota.prioridad,
    });
    setShowForm(true);
  };

  const handleDeleteNota = async (notaId) => {
    if (!confirm("¿Estás seguro de eliminar esta nota?")) return;

    try {
      const { error } = await supabase
        .from("notas_cliente")
        .delete()
        .eq("id", notaId);

      if (error) {
        console.error("Error eliminando nota:", error);
        alert("Error al eliminar la nota");
      } else {
        alert("Nota eliminada exitosamente");
        cargarNotas(clienteId);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la nota");
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      contenido: "",
      tipo: "cotizacion",
      prioridad: "media",
    });
    setEditingNota(null);
    setShowForm(false);
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Cargando bitácora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Bitácora de Cotización
              </h1>
              {clienteData && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {clienteData.nombres} {clienteData.apellidos}
                </span>
              )}
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Botón Nueva Nota */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingNota ? "Editar Nota" : "Nueva Nota"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        titulo: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título de la nota..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Contenido
                  </label>
                  <textarea
                    value={formData.contenido}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contenido: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Contenido detallado de la nota..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Prioridad
                  </label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        prioridad: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNota}
                    className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="inline w-4 h-4 mr-2" />
                    {editingNota ? "Actualizar Nota" : "Guardar Nota"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Notas */}
        {notas.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No hay notas
            </h3>
            <p className="mb-4 text-gray-500">
              No se han creado notas de cotización aún.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Crear Primera Nota
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notas.map((nota) => (
              <div
                key={nota.id}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {nota.titulo}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(nota.prioridad)}`}
                      >
                        {nota.prioridad.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatearFecha(nota.fecha_creacion)}
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {nota.contenido}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditNota(nota)}
                      className="p-2 text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNota(nota.id)}
                      className="p-2 text-red-600 transition-colors rounded-lg hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteBitacora;
