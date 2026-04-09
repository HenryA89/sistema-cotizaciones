import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, User, Building, CheckCircle } from "lucide-react";
import {
  getClientById,
  getClientDiagnosis,
  resolveClientId,
  saveDiagnosisNote,
} from "../services/clientWorkflowService.js";

const Diagnostico = ({ clientId: clientIdProp, clientData: clientDataProp, onBack }) => {
  const [clienteId, setClienteId] = useState("");
  const [clienteData, setClienteData] = useState(null);
  const [diagnostico1, setDiagnostico1] = useState("");
  const [diagnostico2, setDiagnostico2] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardado1, setGuardado1] = useState(false);
  const [guardado2, setGuardado2] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setCargandoDatos(true);

      const resolvedId = resolveClientId(clientIdProp);
      setClienteId(resolvedId);

      if (!resolvedId) {
        setClienteData(null);
        setCargandoDatos(false);
        return;
      }

      try {
        if (clientDataProp?.id && String(clientDataProp.id) === String(resolvedId)) {
          setClienteData(clientDataProp);
        } else {
          const fetchedClient = await getClientById(resolvedId);
          setClienteData(fetchedClient);
        }

        const diagnostics = await getClientDiagnosis(resolvedId);

        const storedDiag1 =
          diagnostics.diagnostico1 ||
          localStorage.getItem(`diagnostico1:${resolvedId}`) ||
          localStorage.getItem("diagnostico1") ||
          "";

        const storedDiag2 =
          diagnostics.diagnostico2 ||
          localStorage.getItem(`diagnostico2:${resolvedId}`) ||
          localStorage.getItem("diagnostico2") ||
          "";

        setDiagnostico1(storedDiag1);
        setDiagnostico2(storedDiag2);
        setGuardado1(Boolean(storedDiag1.trim()));
        setGuardado2(Boolean(storedDiag2.trim()));
      } catch (error) {
        console.error("Error cargando diagnóstico:", error);
      } finally {
        setCargandoDatos(false);
      }
    };

    initialize();
  }, [clientIdProp, clientDataProp]);

  const persistLocalDiagnosis = (fieldKey, content) => {
    localStorage.setItem(fieldKey, content);
    if (clienteId) {
      localStorage.setItem(`${fieldKey}:${clienteId}`, content);
    }
  };

  const handleSaveDiagnostico1 = async () => {
    if (!diagnostico1.trim()) {
      alert("Por favor ingresa el diagnóstico y propósito");
      return;
    }

    if (!clienteId) {
      alert("No hay cliente seleccionado");
      return;
    }

    setLoading(true);
    try {
      await saveDiagnosisNote({
        clientId: clienteId,
        type: "diagnostico_1",
        content: diagnostico1,
      });

      persistLocalDiagnosis("diagnostico1", diagnostico1);
      setGuardado1(true);
      alert("Diagnóstico y propósito guardado correctamente");
    } catch (error) {
      console.error("Error guardando diagnóstico 1:", error);
      alert("No fue posible guardar el diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagnostico2 = async () => {
    if (!diagnostico2.trim()) {
      alert("Por favor ingresa el alcance y diseño");
      return;
    }

    if (!clienteId) {
      alert("No hay cliente seleccionado");
      return;
    }

    setLoading(true);
    try {
      await saveDiagnosisNote({
        clientId: clienteId,
        type: "diagnostico_2",
        content: diagnostico2,
      });

      persistLocalDiagnosis("diagnostico2", diagnostico2);
      setGuardado2(true);
      alert("Alcance y diseño guardado correctamente");
    } catch (error) {
      console.error("Error guardando diagnóstico 2:", error);
      alert("No fue posible guardar el alcance y diseño");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    window.history.back();
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Diagnóstico y Diseño
              </h1>
              {clienteData && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Cliente: {clienteData.nombres} {clienteData.apellidos}
                  </span>
                  {clienteData.empresa_nombre && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <Building className="w-3 h-3 inline mr-1" />
                      {clienteData.empresa_nombre}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!clienteId ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">
              Cliente no seleccionado
            </h3>
            <p className="text-gray-500">
              Selecciona un cliente desde el directorio para continuar.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
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
                  className={`flex-1 h-2 rounded-full ${guardado1 ? "bg-green-500" : "bg-gray-200"}`}
                  title="Diagnóstico y Propósito"
                ></div>
                <div
                  className={`flex-1 h-2 rounded-full ${guardado2 ? "bg-green-500" : "bg-gray-200"}`}
                  title="Alcance y Diseño"
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Diagnóstico y Propósito</span>
                <span>Alcance y Diseño</span>
              </div>
            </div>

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
                      <CheckCircle className="w-5 h-5 text-green-500" title="Guardado" />
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
                    onChange={(e) => {
                      setDiagnostico1(e.target.value);
                      setGuardado1(false);
                    }}
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
                      <CheckCircle className="w-5 h-5 text-green-500" title="Guardado" />
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
                    onChange={(e) => {
                      setDiagnostico2(e.target.value);
                      setGuardado2(false);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Describe el alcance del diseño y los entregables que se incluirán en la propuesta..."
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
