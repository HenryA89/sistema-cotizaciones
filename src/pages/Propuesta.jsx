import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  Building,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PlantillaCotizacion from "../components/quotes/PlantillaCotizacion.jsx";
import supabase from "../services/supabaseClient.js";
import { getClientDiagnosis } from "../services/clientWorkflowService.js";

const getItemUnitPrice = (item) =>
  item?.precio_unitario ?? item?.precio ?? item?.precio_base ?? 0;

const Propuesta = () => {
  const [propuestas, setPropuestas] = useState([]);
  const [selectedPropuesta, setSelectedPropuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTemplate, setShowTemplate] = useState(false);
  const [diagnosticos, setDiagnosticos] = useState({
    diagnostico1: localStorage.getItem("diagnostico1") || "",
    diagnostico2: localStorage.getItem("diagnostico2") || "",
  });
  const pdfRef = useRef(null);

  const buildQuoteRecord = async (cotizacion) => {
    const [{ data: items, error: errorItems }, { data: cliente, error: errorCliente }] =
      await Promise.all([
        supabase
          .from("cotizacion_items")
          .select("*")
          .eq("cotizacion_id", cotizacion.id),
        supabase
          .from("clientes")
          .select("id, nombres, apellidos, empresa_nombre, ciudad, email, telefono")
          .eq("id", cotizacion.cliente_id)
          .single(),
      ]);

    if (errorItems) {
      console.error("Error cargando items:", errorItems);
    }

    if (errorCliente) {
      console.error("Error cargando cliente:", errorCliente);
    }

    const clienteNormalizado = cliente
      ? {
          id: cliente.id,
          nombres: cliente.nombres || "",
          apellidos: cliente.apellidos || "",
          nombreCompleto: `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim(),
          empresa_nombre: cliente.empresa_nombre || "",
          ciudad: cliente.ciudad || "",
          email: cliente.email || "",
          telefono: cliente.telefono || "",
        }
      : {
          id: cotizacion.cliente_id,
          nombres: "",
          apellidos: "",
          nombreCompleto: "Cliente no encontrado",
          empresa_nombre: "",
          ciudad: "",
          email: "",
          telefono: "",
        };

    return {
      ...cotizacion,
      items: items || [],
      cliente: clienteNormalizado,
      quoteData: {
        numero: `COT-${String(cotizacion.id).substring(0, 8)}`,
        validez: "8 DÍAS CALENDARIO",
        fecha: new Date(cotizacion.created_at).toLocaleDateString("es-CO"),
      },
    };
  };

  const cargarPropuestas = async () => {
    try {
      const { data: cotizaciones, error } = await supabase
        .from("cotizaciones")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando cotizaciones:", error);
        setPropuestas([]);
        return;
      }

      const propuestasCompletas = await Promise.all(
        (cotizaciones || []).map((cotizacion) => buildQuoteRecord(cotizacion)),
      );

      setPropuestas(propuestasCompletas);
    } catch (error) {
      console.error("Error en cargarPropuestas:", error);
      setPropuestas([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCotizacionEspecifica = async (cotizacionId) => {
    try {
      const { data: cotizacion, error } = await supabase
        .from("cotizaciones")
        .select("*")
        .eq("id", cotizacionId)
        .single();

      if (error || !cotizacion) {
        console.error("Error cargando cotización:", error);
        setPropuestas([]);
        return;
      }

      const propuesta = await buildQuoteRecord(cotizacion);
      setPropuestas([propuesta]);
    } catch (error) {
      console.error("Error en cargarCotizacionEspecifica:", error);
      setPropuestas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cotizacionId = urlParams.get("cotizacionId");

      if (cotizacionId) {
        await cargarCotizacionEspecifica(cotizacionId);
      } else {
        await cargarPropuestas();
      }
    };

    initialize();
  }, []);

  const hydrateDiagnostics = async (clientId) => {
    try {
      const diagnostics = await getClientDiagnosis(clientId);
      const diagnostico1 =
        diagnostics.diagnostico1 ||
        localStorage.getItem(`diagnostico1:${clientId}`) ||
        localStorage.getItem("diagnostico1") ||
        "";
      const diagnostico2 =
        diagnostics.diagnostico2 ||
        localStorage.getItem(`diagnostico2:${clientId}`) ||
        localStorage.getItem("diagnostico2") ||
        "";

      setDiagnosticos({ diagnostico1, diagnostico2 });
    } catch (error) {
      console.error("Error cargando diagnósticos:", error);
    }
  };

  const handleVerPropuesta = async (propuesta) => {
    const clientId = propuesta?.cliente?.id || propuesta?.cliente_id;
    if (clientId) {
      await hydrateDiagnostics(clientId);
    }

    setSelectedPropuesta(propuesta);
    setShowTemplate(true);
  };

  const handleVolver = () => {
    setShowTemplate(false);
    setSelectedPropuesta(null);
  };

  const handlePrint = () => {
    if (!pdfRef.current || !selectedPropuesta) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Propuesta ${selectedPropuesta.quoteData.numero}</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${pdfRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !selectedPropuesta) return;

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);

      pdf.addImage(
        imgData,
        "PNG",
        (pdfWidth - canvas.width * ratio) / 2,
        0,
        canvas.width * ratio,
        canvas.height * ratio,
      );

      pdf.save(`propuesta-${selectedPropuesta.quoteData.numero}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
  };

  const handleDescargarWord = (propuesta) => {
    console.log("Descargar como Word (pendiente):", propuesta?.id);
  };

  const handleDescargarPDF = (propuesta) => {
    handleVerPropuesta(propuesta);
  };

  const calcularTotal = (items) => {
    return (
      items?.reduce((total, item) => {
        const unitPrice = getItemUnitPrice(item);
        return (
          total +
          unitPrice *
            (item.cantidad || 1) *
            (1 - (item.descuento || 0) / 100)
        );
      }, 0) || 0
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(cantidad || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Cargando propuestas...</p>
        </div>
      </div>
    );
  }

  if (showTemplate && selectedPropuesta) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleVolver}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver a propuestas
              </button>

              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Propuesta {selectedPropuesta.quoteData.numero}
              </h1>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" /> Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <PlantillaCotizacion
            ref={pdfRef}
            quoteData={selectedPropuesta.quoteData}
            quoteItems={selectedPropuesta.items}
            clientData={selectedPropuesta.cliente}
            diagnostico1={diagnosticos.diagnostico1}
            diagnostico2={diagnosticos.diagnostico2}
          />

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleVolver}
              className="px-6 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Propuestas
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {propuestas.length} {propuestas.length === 1 ? "propuesta" : "propuestas"}
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {propuestas.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-base sm:text-lg lg:text-xl font-medium text-gray-900">
              No hay propuestas generadas
            </h3>
            <p className="text-gray-500">No se han creado propuestas aún.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {propuestas.map((propuesta) => (
              <div
                key={propuesta.id}
                className="transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                        Propuesta #{propuesta.numero_cotizacion || propuesta.quoteData.numero}
                      </h3>
                      <p className="text-sm text-gray-500">{formatearFecha(propuesta.created_at)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        propuesta.estado === "aprobada"
                          ? "bg-green-100 text-green-800"
                          : propuesta.estado === "rechazada"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {propuesta.estado === "aprobada"
                        ? "Aprobada"
                        : propuesta.estado === "rechazada"
                          ? "Rechazada"
                          : "Pendiente"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{propuesta.cliente?.empresa_nombre || "Sin empresa"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>
                        {propuesta.cliente?.nombres} {propuesta.cliente?.apellidos}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Vigencia: {propuesta.quoteData.validez}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Total inversión</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatearMoneda(calcularTotal(propuesta.items))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 px-6 pb-6">
                  <button
                    onClick={() => handleVerPropuesta(propuesta)}
                    className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4" /> Ver
                  </button>
                  <button
                    onClick={() => handleDescargarPDF(propuesta)}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                    title="Abrir y descargar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDescargarWord(propuesta)}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                    title="Descargar Word"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Propuesta;
