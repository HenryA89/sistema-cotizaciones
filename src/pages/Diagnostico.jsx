import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, User, Building, CheckCircle } from "lucide-react";
import supabase from "../services/supabaseClient.js";

const Diagnostico = () => {
  const [clienteId, setClienteId] = useState(null);
  const [clienteData, setClienteData] = useState(null);
  const [diagnostico1, setDiagnostico1] = useState("");
  const [diagnostico2, setDiagnostico2] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardado1, setGuardado1] = useState(false);
  const [guardado2, setGuardado2] = useState(false);

  // Obtener ID del cliente y cargar datos
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id =
      urlParams.get("clienteId") ||
      localStorage.getItem("selectedClientId") ||
      "";
    setClienteId(id);

    if (id) {
      cargarDatosCliente(id);
      cargarDiagnosticosExistentes(id);
    } else {
      setCargandoDatos(false);
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
    } finally {
      setCargandoDatos(false);
    }
  };

  const cargarDiagnosticosExistentes = async (id) => {
    try {
      const { data, error } = await supabase
        .from("notas")
        .select("*")
        .eq("cliente_id", id)
        .order("fecha_creacion", { ascending: false });

      if (error) {
        console.error("Error cargando notas existentes:", error);
      } else {
        // Cargar última nota de cada tipo
        const notas = data || [];
        const nota1 = notas.find((n) => n.tipo === "nota1");
        const nota2 = notas.find((n) => n.tipo === "nota2");

        if (nota1) setDiagnostico1(nota1.texto);
        if (nota2) setDiagnostico2(nota2.texto);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSaveDiagnostico1 = () => {
    if (!diagnostico1.trim()) {
      alert("Por favor ingresa el diagnóstico y propósito");
      return;
    }

    // Guardar en localStorage para que Propuesta.jsx lo pueda leer
    localStorage.setItem("diagnostico1", diagnostico1);
    setGuardado1(true);
    alert("Diagnóstico y Propósito guardado satisfactoriamente");

    // Verificar si ambos están guardados para redirigir al perfil
    verificarYRedirigir();
  };

  const handleSaveDiagnostico2 = () => {
    if (!diagnostico2.trim()) {
      alert("Por favor ingresa el alcance y diseño");
      return;
    }

    // Guardar en localStorage para que Propuesta.jsx lo pueda leer
    localStorage.setItem("diagnostico2", diagnostico2);
    setGuardado2(true);
    alert("Alcance del Diseño guardado satisfactoriamente");

    // Verificar si ambos están guardados para redirigir al perfil
    verificarYRedirigir();
  };

  const verificarYRedirigir = () => {
    // Verificar si ambos diagnósticos están guardados
    const diag1Guardado = localStorage.getItem("diagnostico1")?.trim() || "";
    const diag2Guardado = localStorage.getItem("diagnostico2")?.trim() || "";

    if (diag1Guardado && diag2Guardado) {
      // Ambos están guardados, redirigir al perfil del cliente
      setTimeout(() => {
        window.location.href = `/profile?clienteId=${clienteId}`;
      }, 1000); // Pequeña pausa para que el usuario vea el último mensaje
    }
  };

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Diagnóstico y Diseño
              </h1>
              {clienteData && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Cliente: {clienteData.nombres} {clienteData.apellidos}
                  </span>
                  {clienteData.empresa && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <Building className="w-3 h-3 inline mr-1" />
                      {clienteData.empresa}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!clienteId ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cliente no seleccionado
            </h3>
            <p className="text-gray-500">
              Por favor selecciona un cliente desde el perfil para continuar.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Indicador de Progreso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Progreso de Diagnóstico
                </h3>
                <span className="text-sm text-gray-500">
                  {guardado1 && guardado2
                    ? "Completo"
                    : guardado1 || guardado2
                      ? "En progreso"
                      : "Pendiente"}
                </span>
              </div>
              <div className="flex gap-2">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    guardado1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                  title="Diagnóstico y Propósito"
                ></div>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    guardado2 ? "bg-green-500" : "bg-gray-200"
                  }`}
                  title="Alcance y Diseño"
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Diagnóstico y Propósito</span>
                <span>Alcance y Diseño</span>
              </div>
            </div>

            {/* Diagnóstico 1 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Diagnóstico y Propósito
                    </h2>
                    {guardado1 && (
                      <CheckCircle
                        className="w-5 h-5 text-green-500"
                        title="Guardado"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Análisis inicial de la situación del cliente
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico y Propósito
                  </label>
                  <textarea
                    value={diagnostico1}
                    onChange={(e) => setDiagnostico1(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Describe el diagnóstico actual de la situación del cliente y los objetivos principales de esta propuesta..."
                  />
                </div>

                <button
                  onClick={handleSaveDiagnostico1}
                  disabled={loading || !diagnostico1.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {loading ? "Guardando..." : "Guardar Diagnóstico y Propósito"}
                </button>
              </div>
            </div>

            {/* Diagnóstico 2 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Alcance y Diseño
                    </h2>
                    {guardado2 && (
                      <CheckCircle
                        className="w-5 h-5 text-green-500"
                        title="Guardado"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Análisis detallado del alcance y diseño
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcance y Diseño
                  </label>
                  <textarea
                    value={diagnostico2}
                    onChange={(e) => setDiagnostico2(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Describe el alcance del diseño y los deliverables que se incluirán en la propuesta..."
                  />
                </div>

                <button
                  onClick={handleSaveDiagnostico2}
                  disabled={loading || !diagnostico2.trim()}
                  className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {loading ? "Guardando..." : "Guardar Alcance y Diseño"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnostico;
