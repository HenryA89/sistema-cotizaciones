import React, { useRef } from "react";
import { Printer, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PlantillaCotizacion = ({
  quoteData,
  clientData,
  quoteItems,
  notas,
  diagnostico1,
  diagnostico2,
  onFinalize,
}) => {
  const printRef = useRef(null);

  const currentDate = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const totalInversion =
    quoteItems?.reduce((total, item) => {
      return total + (item.subtotal || 0);
    }, 0) || 0;

  // Función de impresión optimizada con formato profesional
  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cotización ${quoteData?.numero || "______"}</title>
            <style>
              @page {
                size: A4;
                margin: 15mm;
                @top-center {
                  content: "";
                }
                @bottom-center {
                  content: "";
                }
              }
              
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                body { 
                  font-family: 'Times New Roman', serif; 
                  margin: 0; 
                  padding: 20px;
                  line-height: 1.6;
                  font-size: 12pt;
                  color: #000;
                  background: #fff;
                }
                
                .print-container {
                  max-width: 100%;
                  margin: 0 auto;
                  page-break-inside: avoid;
                }
                
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  page-break-after: avoid;
                }
                
                .logo {
                  max-width: 150px;
                  height: auto;
                  margin-bottom: 15px;
                }
                
                .section { 
                  margin-bottom: 25px; 
                  page-break-inside: avoid;
                }
                
                .solicitante-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 25px;
                  page-break-inside: avoid;
                }
                
                .solicitante-column {
                  flex: 1;
                  padding-right: 20px;
                }
                
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 20px;
                  page-break-inside: avoid;
                }
                
                table th, table td { 
                  border: 1px solid #000; 
                  padding: 8px 12px; 
                  text-align: left;
                  vertical-align: top;
                }
                
                table th { 
                  background: #f8f9fa; 
                  font-weight: bold;
                  font-size: 11pt;
                }
                
                table td {
                  font-size: 10pt;
                }
                
                .total { 
                  text-align: right; 
                  font-size: 14pt; 
                  font-weight: bold; 
                  margin-top: 20px;
                  page-break-inside: avoid;
                }
                
                .signature { 
                  margin-top: 60px; 
                  page-break-inside: avoid;
                }
                
                .signature-line {
                  border-bottom: 1px solid #000;
                  width: 200px;
                  margin-top: 40px;
                  text-align: center;
                  font-size: 10pt;
                }
                
                .diagnostico-section {
                  margin: 25px 0;
                  padding: 15px;
                  background: #f8f9fa;
                  border-left: 4px solid #007bff;
                  page-break-inside: avoid;
                }
                
                .diagnostico-section h4 {
                  margin: 0 0 10px 0;
                  font-size: 12pt;
                  color: #007bff;
                }
                
                .diagnostico-section p {
                  margin: 0;
                  font-size: 10pt;
                  line-height: 1.5;
                }
                
                .no-print { 
                  display: none !important; 
                }
                
                .print-break {
                  page-break-before: always;
                }
                
                .avoid-break {
                  page-break-inside: avoid;
                }
              }
              
              @media screen {
                body { 
                  font-family: Arial, sans-serif; 
                  background: #f5f5f5;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printRef.current.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Esperar a que el contenido se cargue completamente
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Función para generar PDF real con html2canvas y jsPDF
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      // Mostrar indicador de carga
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = "Generando PDF...";
      button.disabled = true;

      // Capturar el contenido como imagen
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calcular dimensiones
      const imgWidth = 210; // Ancho A4 en mm
      const pageHeight = 297; // Alto A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar imagen al PDF
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si la imagen es más alta que una página, agregar páginas adicionales
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      const fileName = `cotizacion-${quoteData?.numero || "sin-numero"}.pdf`;
      pdf.save(fileName);

      // Restaurar botón
      button.innerHTML = originalText;
      button.disabled = false;

      console.log(`PDF generado: ${fileName}`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      // Restaurar botón en caso de error
      const button = event.target;
      button.innerHTML = originalText;
      button.disabled = false;
    }
  };

  // Función para generar Word real (simulado - requiere librería adicional)
  const handleDownloadWord = async () => {
    if (!printRef.current) return;

    try {
      // Mostrar indicador de carga
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = "Generando Word...";
      button.disabled = true;

      // Extraer el contenido HTML
      const content = printRef.current.innerHTML;

      // Crear contenido para Word (formato simplificado)
      const wordContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Cotización ${quoteData?.numero || "sin-numero"}</title>
            <style>
              body { font-family: 'Calibri', sans-serif; margin: 20px; line-height: 1.6; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `;

      // Crear Blob y descargar
      const blob = new Blob([wordContent], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion-${quoteData?.numero || "sin-numero"}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Restaurar botón
      button.innerHTML = originalText;
      button.disabled = false;

      console.log(
        `Word generado: cotizacion-${quoteData?.numero || "sin-numero"}.doc`,
      );
    } catch (error) {
      console.error("Error generando Word:", error);
      // Restaurar botón en caso de error
      const button = event.target;
      button.innerHTML = originalText;
      button.disabled = false;
    }
  };

  return (
    <div
      ref={printRef}
      className="max-w-4xl p-8 mx-auto font-serif text-gray-800 bg-white print:p-6"
      style={{ fontFamily: "Times New Roman, serif", lineHeight: "1.5" }}
    >
      {/* Header con Logo */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <img
            src="https://storage.googleapis.com/msgsndr/XZif5wJzzFnk4lYBAZEH/media/682d2fdee10a0857ddd47d84.png"
            alt="Sr. Zur Logo"
            className="w-auto h-16"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <div className="hidden text-center">
            <h2 className="text-lg font-bold tracking-widest text-gray-900">
              SR. ZUR
            </h2>
            <p className="text-sm text-gray-600">
              ESTUDIO ESTRATÉGICO DE DISEÑO
            </p>
          </div>
        </div>

        <p className="mt-1 text-sm text-gray-600">WWW.SRZUR.COM</p>
      </div>

      {/* Información General */}
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold text-center">
          COTIZACIÓN No. {quoteData?.numero || "______"}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p>
            <strong>FECHA:</strong> {currentDate}
          </p>
          <p>
            <strong>CIUDAD:</strong>{" "}
            {clientData?.ciudad || "_____________________"}
          </p>
          <p>
            <strong>VALIDEZ:</strong>{" "}
            {quoteData?.validez || "_____________________"}
          </p>
          <p>
            <strong>CONTACTO:</strong>{" "}
            {clientData?.telefono || "_____________________"}
          </p>
        </div>
      </div>

      {/* Solicitante */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-bold text-center">SOLICITANTE</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>NOMBRE:</strong> {clientData?.nombres}{" "}
            {clientData?.apellidos}
          </p>
          <p>
            <strong>EMPRESA:</strong>{" "}
            {clientData?.empresa_nombre ||
              "________________________________________"}
          </p>
          <p>
            <strong>EMAIL:</strong>{" "}
            {clientData?.email || "________________________________________"}
          </p>
          <p>
            <strong>TELÉFONO:</strong>{" "}
            {clientData?.telefono || "________________________________________"}
          </p>
        </div>
      </div>

      {/* Gestión de Cuenta */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-bold text-center">
          GESTIÓN DE CUENTA
        </h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>NOMBRE:</strong> Ana Patricia Chamorro P.
          </p>
          <p>
            <strong>CARGO:</strong> Directora Creativa | Sr. Zur
          </p>
          <p>
            <strong>EMAIL:</strong> ana@srzur.com
          </p>
        </div>
      </div>

      {/* 02 Alcance del Diseño - DESDE PROPS */}
      <div className="mb-10">
        <h3 className="mb-4 text-lg font-bold text-center">
          02. ALCANCE DEL DISEÑO
        </h3>
        <div className="p-4 text-sm leading-relaxed text-justify border border-gray-400 bg-gray-50 min-h-32">
          <div className="whitespace-pre-wrap">
            {diagnostico2 ||
              "El alcance del diseño se agregará desde el formulario de diagnóstico..."}
          </div>
        </div>
      </div>

      {/* 03 Cotización Detallada */}
      <div className="mb-10">
        <h3 className="mb-4 text-lg font-bold text-center">
          03. COTIZACIÓN DETALLADA
        </h3>
        <div className="p-4 text-sm leading-relaxed text-justify border border-gray-400 bg-gray-50 min-h-24">
          {quoteItems?.length > 0 ? (
            <div>
              <p className="mb-3">
                Desarrollo integral de identidad visual y sistema de empaques
                que incluye:
              </p>
              <ol className="ml-6 space-y-2 list-decimal">
                {quoteItems.map((item, index) => (
                  <li key={item.id} className="mb-2">
                    <strong>
                      {item.descripcion || item.nombre || `Item ${index + 1}`}
                    </strong>
                    {item.descripcionPersonalizada && (
                      <span className="block mt-1 text-gray-600">
                        {item.descripcionPersonalizada}
                      </span>
                    )}
                    {item.cantidad > 1 && (
                      <span className="block text-gray-600">
                        Cantidad: {item.cantidad}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="italic text-gray-500">
              [El alcance se definirá según los productos y servicios
              seleccionados]
            </div>
          )}
        </div>
      </div>

      {/* 03 Inversión del Diseño - CON DATOS DINÁMICOS */}
      <div className="mb-12">
        <h3 className="mb-4 text-lg font-bold text-center">
          03. INVERSIÓN DEL DISEÑO
        </h3>

        <table className="w-full text-sm border border-collapse border-gray-400">
          <thead>
            <tr className="bg-gray-100 border border-gray-400">
              <th className="p-3 font-bold text-left border border-gray-400">
                MÓDULO DE TRABAJO
              </th>
              <th className="p-3 font-bold text-left border border-gray-400">
                ENTREGABLE DETALLADO
              </th>
              <th className="p-3 font-bold text-center border border-gray-400">
                CANTIDAD
              </th>
              <th className="p-3 font-bold text-right border border-gray-400">
                VALOR UNITARIO (COP)
              </th>
              <th className="p-3 font-bold text-right border border-gray-400">
                VALOR NETO (COP)
              </th>
            </tr>
          </thead>
          <tbody>
            {quoteItems?.length > 0 ? (
              quoteItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="p-3 border border-gray-400">
                    {item.descripcion || item.nombre || `Módulo ${index + 1}`}
                    {item.tipo_item === "servicio" && (
                      <span className="block text-xs text-gray-500">
                        (Servicio)
                      </span>
                    )}
                  </td>
                  <td className="p-3 border border-gray-400">
                    {item.descripcion ||
                      "Entrega estándar según especificaciones"}
                  </td>
                  <td className="p-3 text-center border border-gray-400">
                    {item.cantidad || 1}
                  </td>
                  <td className="p-3 text-right border border-gray-400">
                    $
                    {item.precio_unitario?.toLocaleString("es-CO") ||
                      item.precio?.toLocaleString("es-CO") ||
                      "0"}
                  </td>
                  <td className="p-3 font-bold text-right border border-gray-400">
                    ${item.subtotal?.toLocaleString("es-CO") || "0"}
                  </td>
                </tr>
              ))
            ) : (
              // Filas vacías para formato
              <>
                <tr className="bg-gray-50">
                  <td className="p-3 border border-gray-400">
                    __________________
                  </td>
                  <td className="p-3 border border-gray-400">
                    __________________
                  </td>
                  <td className="p-3 text-center border border-gray-400">__</td>
                  <td className="p-3 text-right border border-gray-400">
                    $________
                  </td>
                  <td className="p-3 text-right border border-gray-400">
                    $________
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-400">
                    __________________
                  </td>
                  <td className="p-3 border border-gray-400">
                    __________________
                  </td>
                  <td className="p-3 text-center border border-gray-400">__</td>
                  <td className="p-3 text-right border border-gray-400">
                    $________
                  </td>
                  <td className="p-3 text-right border border-gray-400">
                    $________
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 border border-gray-400">
                    __________________
                  </td>
                  <td className="p-3 border border-gray-400">
                    __________________
                  </td>
                  <td className="p-3 text-center border border-gray-400">__</td>
                  <td className="p-3 text-right border border-gray-400">
                    $________
                  </td>
                  <td className="p-3 text-right border border-gray-400">
                    $________
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <div className="mt-6 text-xl font-bold text-right">
          VALOR TOTAL DEL DISEÑO: $
          {totalInversion?.toLocaleString("es-CO") || "$________"}
        </div>
      </div>

      {/* 04 Políticas - TEXTO COMPLETO CONSERVADO */}
      <div className="mb-10">
        <h3 className="mb-4 text-lg font-bold text-center">
          04. POLÍTICAS DE DISEÑO Y GARANTÍAS
        </h3>

        <div className="space-y-3 text-sm leading-relaxed text-justify">
          <p>
            <strong>Gestión de Revisiones:</strong> Se incluyen hasta 5 ajustes
            en la etapa de concepto. Una vez aprobado el camino gráfico final,
            se permite una (1) sesión de ajustes de cierre técnico.
          </p>

          <p>
            <strong>Derechos de Autor:</strong> Al liquidar el pago final, se
            cede al cliente el 100% de los derechos de explotación comercial y
            los archivos originales editables.
          </p>

          <p>
            <strong>Acuerdo de Pago:</strong> Anticipo del 50% para inicio de
            labores y el 50% restante a la entrega de archivos finales y
            prototipo físico.
          </p>

          <p>
            <strong>Asesoría Técnica:</strong> El diseño incluye el
            acompañamiento para supervisión de artes finales en impresión.
          </p>
        </div>
      </div>

      {/* Nota */}
      <div className="mb-10">
        <h4 className="mb-3 text-lg font-bold text-center">
          NOTA SOBRE AJUSTES ADICIONALES
        </h4>
        <p className="text-sm leading-relaxed text-justify">
          Cualquier cambio solicitado posterior a la revisión final aprobada, o
          solicitudes que modifiquen fases técnicas ya validadas, generarán un
          cargo adicional proporcional al tiempo de diseño requerido.
        </p>
      </div>

      {/* Sección institucional */}
      <div className="mb-10">
        <h4 className="mb-3 text-lg font-bold text-center">
          ¿Por qué diseñar con Sr. Zur?
        </h4>
        <p className="text-sm leading-relaxed text-justify">
          No entregamos simples gráficos; construimos activos de negocio.
          Transformamos tradición en una marca competitiva que justifique un
          posicionamiento premium en el mercado.
        </p>
      </div>

      {/* Aceptación */}
      <div className="mt-16">
        <h3 className="mb-4 text-lg font-bold text-center">
          ACEPTACIÓN DE PROPUESTA (FIRMA Y CÉDULA)
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>NOMBRE:</strong>{" "}
            {clientData?.nombreCompleto ||
              "_________________________________________"}
          </p>
          <p>
            <strong>CARGO:</strong>{" "}
            {clientData?.cargo || "___________________________________________"}
          </p>
          <p>
            <strong>EMPRESA:</strong>{" "}
            {clientData?.empresa || "________________________________________"}
          </p>
          <p>
            <strong>CÉDULA:</strong> _________________________________________
          </p>
        </div>

        <div className="mt-8">
          <p className="text-sm">
            <strong>FIRMA:</strong> ___________________________________________
          </p>
        </div>
      </div>

      {/* Botones de acción - OCULTOS EN PDF */}
      <div className="flex justify-center gap-4 mt-8 print:hidden no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
        >
          <Printer className="w-5 h-5" />
          Imprimir
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          <Download className="w-5 h-5" />
          Descargar PDF
        </button>

        <button
          onClick={handleDownloadWord}
          className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
        >
          <FileText className="w-5 h-5" />
          Descargar Word
        </button>

        {onFinalize && (
          <button
            onClick={onFinalize}
            className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
};

export default PlantillaCotizacion;
