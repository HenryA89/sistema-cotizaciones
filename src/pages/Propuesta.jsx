import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  Building,
  User,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PlantillaCotizacion from "../components/quotes/PlantillaCotizacion.jsx";
import supabase from "../services/supabaseClient.js";

const Propuesta = () => {
  // Probar conexión a Supabase al iniciar
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("count")
        .limit(1);

      if (error) {
        console.error("❌ Error de conexión a Supabase:", error);
        return false;
      } else {
        console.log("✅ Conexión a Supabase exitosa");
        console.log("📊 Total clientes:", data?.length || 0);
        return true;
      }
    } catch (err) {
      console.error("❌ Error crítico de conexión:", err);
      return false;
    }
  };

  const [propuestas, setPropuestas] = useState([]);
  const [selectedPropuesta, setSelectedPropuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTemplate, setShowTemplate] = useState(false);
  const [notasCliente, setNotasCliente] = useState({ nota1: "", nota2: "" });
  const [diagnosticos, setDiagnosticos] = useState({
    diagnostico1: localStorage.getItem("diagnostico1") || "",
    diagnostico2: localStorage.getItem("diagnostico2") || "",
  });
  const pdfRef = useRef(null);

  useEffect(() => {
    // Probar conexión antes de cargar datos
    const initializeApp = async () => {
      const connectionOk = await testConnection();
      if (!connectionOk) {
        console.error("❌ No se puede continuar sin conexión a Supabase");
        setLoading(false);
        return;
      }

      // Cargar diagnósticos del localStorage
      const diag1 = localStorage.getItem("diagnostico1") || "";
      const diag2 = localStorage.getItem("diagnostico2") || "";
      setDiagnosticos({
        diagnostico1: diag1,
        diagnostico2: diag2,
      });

      const urlParams = new URLSearchParams(window.location.search);
      const cotizacionId = urlParams.get("cotizacionId");

      if (cotizacionId) {
        cargarCotizacionEspecifica(cotizacionId);
      } else {
        cargarPropuestas();
      }
    };

    initializeApp();
  }, []);

  const cargarPropuestas = async () => {
    try {
      // 1. Cargar cotizaciones principales
      const { data: cotizaciones, error: errorCotizaciones } = await supabase
        .from("cotizaciones")
        .select("*")
        .order("created_at", { ascending: false });

      if (errorCotizaciones) {
        console.error("Error cargando cotizaciones:", errorCotizaciones);
        setPropuestas([]);
        return;
      }

      // 2. Cargar items y datos de clientes para cada cotización
      const propuestasCompletas = await Promise.all(
        cotizaciones.map(async (cotizacion) => {
          // Cargar items de esta cotización
          const { data: items, error: errorItems } = await supabase
            .from("cotizacion_items")
            .select("*")
            .eq("cotizacion_id", cotizacion.id);

          // Cargar datos del cliente (necesarios para mostrar en la UI)
          console.log("🔍 Buscando cliente con ID:", cotizacion.cliente_id);

          const { data: cliente, error: errorCliente } = await supabase
            .from("clientes")
            .select(
              "id, nombres, apellidos, empresa_nombre, ciudad, email, telefono",
            )
            .eq("id", cotizacion.cliente_id)
            .single();

          if (errorCliente) {
            console.error("❌ Error cargando cliente:", errorCliente);
            console.error("📍 Cliente ID buscado:", cotizacion.cliente_id);
          } else {
            console.log("✅ Cliente encontrado:", cliente);
            console.log("📊 Nombres:", cliente?.nombres);
            console.log("📊 Apellidos:", cliente?.apellidos);
          }

          return {
            ...cotizacion,
            items: items || [],
            cliente: cliente
              ? {
                  id: cliente.id,
                  nombres: cliente.nombres || "",
                  apellidos: cliente.apellidos || "",
                  nombreCompleto:
                    `${cliente.nombres} ${cliente.apellidos}`.trim(),
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
                },
            quoteData: {
              numero: `COT-${cotizacion.id.substring(0, 8)}`,
              validez: "8 DÍAS CALENDARIO",
              fecha: new Date(cotizacion.created_at).toLocaleDateString(),
            },
          };
        }),
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
      // 1. Cargar cotización principal
      const { data: cotizacion, error: errorCotizacion } = await supabase
        .from("cotizaciones")
        .select("*")
        .eq("id", cotizacionId)
        .single();

      if (errorCotizacion) {
        console.error("Error cargando cotización:", errorCotizacion);
        setPropuestas([]);
        return;
      }

      // 2. Cargar items de la cotización (con subtotales ya calculados)
      const { data: items, error: errorItems } = await supabase
        .from("cotizacion_items")
        .select("*")
        .eq("cotizacion_id", cotizacionId);

      if (errorItems) {
        console.error("Error cargando items:", errorItems);
        setPropuestas([]);
        return;
      }

      // 3. Cargar datos del cliente (necesarios para mostrar en la UI)
      const { data: cliente, error: errorCliente } = await supabase
        .from("clientes")
        .select([
          "id",
          "nombres",
          "apellidos",
          "empresa_nombre",
          "ciudad",
          "email",
          "telefono",
        ])
        .eq("id", cotizacion.cliente_id)
        .single();

      if (errorCliente) {
        console.error("Error cargando datos del cliente:", errorCliente);
      }

      // 4. Formatear cotización completa con datos del cliente
      const cotizacionCompleta = {
        ...cotizacion,
        items: items || [],
        cliente: cliente
          ? {
              id: cliente.id,
              nombres: cliente.nombres || "",
              apellidos: cliente.apellidos || "",
              nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`.trim(),
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
            },
        quoteData: {
          numero: `COT-${cotizacion.id.substring(0, 8)}`,
          validez: "8 DÍAS CALENDARIO",
          fecha: new Date(cotizacion.created_at).toLocaleDateString(),
        },
      };

      setPropuestas([cotizacionCompleta]);
    } catch (error) {
      console.error("Error en cargarCotizacionEspecifica:", error);
      setPropuestas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerPropuesta = (propuesta) => {
    setSelectedPropuesta(propuesta);
    setShowTemplate(true);
  };

  const handleVolver = () => {
    setShowTemplate(false);
    setSelectedPropuesta(null);
  };

  const handlePrint = () => {
    if (pdfRef.current) {
      const printContent = pdfRef.current;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Propuesta ${selectedPropuesta.quoteData.numero}</title>
            <style>
              body { margin: 0; font-family: Arial, sans-serif; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (pdfRef.current) {
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
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio,
        );
        pdf.save(`propuesta-${selectedPropuesta.quoteData.numero}.pdf`);
      } catch (error) {
        console.error("Error generando PDF:", error);
      }
    }
  };

  const handleDescargarWord = (propuesta) => {
    // Implementación para descargar como Word
    console.log("Descargando como Word:", propuesta);
  };

  const handleGuardarDiagnosticos = async () => {
    try {
      // Implementación para guardar diagnósticos en la propuesta
      console.log("Guardando diagnósticos:", diagnosticos);
    } catch (error) {
      console.error("Error guardando diagnósticos:", error);
    }
  };

  const calcularTotal = (items) => {
    return (
      items?.reduce((total, item) => {
        return (
          total +
          item.precio * (item.cantidad || 1) * (1 - (item.descuento || 0) / 100)
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
    }).format(cantidad);
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
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
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
              onClick={handleGuardarDiagnosticos}
              className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Guardar Diagnósticos en Propuesta
            </button>
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
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Propuestas
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {propuestas.length}{" "}
                {propuestas.length === 1 ? "propuesta" : "propuestas"}
              </span>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {propuestas.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-base sm:text-lg lg:text-xl font-medium text-gray-900">
              No hay propuesta generada
            </h3>
            <p className="text-gray-500">No se han creado propuestas aún.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {propuestas.map((propuesta) => {
              // Debug: Verificar datos del cliente en cada card
              const cliente = propuesta.cliente;
              const nombres = cliente?.nombres;
              const apellidos = cliente?.apellidos;
              const empresa = cliente?.empresa_nombre;

              return (
                <div
                  key={propuesta.id}
                  className="transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                          Propuesta #{propuesta.numero_cotizacion}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatearFecha(propuesta.created_at)}
                        </p>
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

                    {/* Cliente Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{propuesta.cliente.empresa_nombre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          {propuesta.cliente.nombres}{" "}
                          {propuesta.cliente.apellidos}{" "}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Vigencia: {propuesta.quoteData.validez}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        Total inversión
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatearMoneda(calcularTotal(propuesta.items))}
                      </span>
                    </div>
                    <div className="mb-4 text-sm text-gray-600">
                      <p className="line-clamp-2">{propuesta.diagnosis}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerPropuesta(propuesta)}
                      className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDescargarPDF(propuesta)}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                      title="Descargar PDF"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Propuesta;
