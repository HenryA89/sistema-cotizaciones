import React from "react";
import { ChevronLeft, Printer } from "lucide-react";

const QuoteDocumentPreview = ({ quote, onClose }) => {
  if (!quote) return null;

  return (
    <div className="fixed inset-0 bg-white z-[300] overflow-y-auto animate-in fade-in duration-300 text-black">
      {/* Barra de Herramientas No Imprimible */}
      <div className="no-print bg-light-blue p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 border-b z-[310] shadow-sm gap-3">
        <button
          onClick={onClose}
          className="btn-primary px-6 py-2 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Regresar al Gestor
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="btn-accent px-8 py-2 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" /> Descargar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* Documento de Papelería de Lujo */}
      <div
        className="max-w-[850px] mx-auto bg-cream min-h-screen print:shadow-none mb-20 px-4 md:px-0"
        style={{ padding: "31.5mm 10mm 22mm 10mm", hyphens: "none" }}
      >
        {/* Header Institucional */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div>
            <img
              src="https://storage.googleapis.com/msgsndr/XZif5wJzzFnk4lYBAZEH/media/682d2fdee10a0857ddd47d84.png"
              alt="Sr. Zur Logo"
              className="h-16 w-auto mb-3"
            />
            <p className="text-[8px] tracking-[0.4em] font-black text-muted uppercase">
              ESTUDIO ESTRATÉGICO DE DISEÑO
            </p>
            <p className="text-[10px] font-bold">WWW.SRZUR.COM</p>
          </div>
          <div className="text-right">
            <p className="font-black text-2xl text-black tracking-tighter mb-1 uppercase">
              COTIZACIÓN No. 0182
            </p>
            <div className="text-[9px] font-bold text-muted uppercase space-y-0.5">
              <p>
                FECHA:{" "}
                {quote.createdAt?.toDate
                  ? quote.createdAt
                      .toDate()
                      .toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      .toUpperCase()
                  : "FEBRERO 2026"}
              </p>
              <p>CIUDAD: PASTO, NARIÑO</p>
              <p>VALIDEZ: 8 DÍAS CALENDARIO</p>
            </div>
          </div>
        </div>

        {/* Bloque de Información de Cliente */}
        <div className="grid grid-cols-2 gap-8 mb-10 border-t border-blue-300 py-8">
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-black text-muted mb-1 tracking-widest">
              Solicitante
            </p>
            <p className="text-xl font-black leading-tight break-words">
              {quote.cliente}
            </p>
            <p className="text-xs font-medium text-muted mt-2 uppercase tracking-tighter">
              Caficultura de Especialidad - Nariño
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-black text-muted mb-1 tracking-widest">
              Gestión de Cuenta
            </p>
            <p className="text-xl font-black leading-none uppercase">
              Ana Patricia Chamorro P.
            </p>
            <p className="text-[10px] font-bold uppercase text-muted mt-2">
              Directora Creativa |{" "}
              <span className="nowrap font-black">Sr.&nbsp;Zur</span>
            </p>
          </div>
        </div>

        <h1 className="text-3xl font-black uppercase text-center my-14 tracking-widest leading-tight">
          Desarrollo de Marca y <br /> Gestión de Empaques
        </h1>

        {/* Sección 01: El Diagnóstico */}
        <div className="mb-14">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-l-4 border-blue-950 pl-4 mb-5">
            01. Diagnóstico y Propósito
          </h4>
          <p className="text-sm text-justify leading-relaxed text-primary-dark break-words whitespace-pre-wrap">
            {quote.diagnostico}
          </p>
        </div>

        {/* Sección 02: Inversión Detallada */}
        <div className="mb-14 overflow-hidden">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-l-4 border-black pl-4 mb-6">
            02. Inversión del Proyecto
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase text-muted border-b-2 border-black">
                <th className="py-4 px-2">Servicio Profesional / Entregable</th>
                <th className="py-4 text-center">Días Estimados</th>
                <th className="py-4 text-right px-2">Inversión (COP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(quote.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-5 px-2">
                    <p className="font-black text-sm uppercase break-words">
                      {item.nombre}
                    </p>
                    {item.descripcionPersonalizada && (
                      <p className="text-xs text-muted italic mt-1 leading-relaxed break-words">
                        {item.descripcionPersonalizada}
                      </p>
                    )}
                  </td>
                  <td className="py-5 text-center font-bold text-muted">
                    {item.diasEntrega || 5} hábiles
                  </td>
                  <td className="py-5 text-right font-black text-base whitespace-nowrap px-2">
                    ${(item.precio_unitario || item.precio)?.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-primary-dark text-cream">
                <td
                  colSpan="2"
                  className="p-5 font-black uppercase tracking-widest text-right"
                >
                  Valor Total del Diseño
                </td>
                <td className="p-5 text-right font-black text-xl underline underline-offset-8 decoration-2 whitespace-nowrap">
                  ${quote.total?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 03: Políticas y Revisiones Legales */}
        <div className="mb-14">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-l-4 border-black pl-4 mb-6">
            03. Políticas de Diseño y Revisiones
          </h4>
          <div className="grid grid-cols-2 gap-10 text-[10.5px] text-justify leading-relaxed text-muted">
            <div className="space-y-4">
              <p>
                <strong>Gestión de Revisiones:</strong> Se incluyen hasta 5
                ajustes en la etapa de concepto. Una vez aprobado el camino
                gráfico final, se permite una (1) sesión de ajustes de cierre
                técnico.
              </p>
              <p>
                <strong>Propiedad Intelectual:</strong> Al liquidar el pago
                final, <span className="nowrap font-bold">Sr.&nbsp;Zur</span>{" "}
                cede el 100% de los derechos de explotación comercial y los
                archivos originales editables al cliente.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <strong>Acuerdo de Pago:</strong> Anticipo del 50% para inicio
                de labores y el 50% restante a la entrega de archivos finales y
                prototipo físico.
              </p>
              <p>
                <strong>Asesoría Técnica:</strong> El diseño incluye el
                acompañamiento para supervisión de artes finales en imprenta.
              </p>
            </div>
          </div>
        </div>

        {/* Cierre Emocional y Firma */}
        <div className="bg-light-blue p-10 rounded-[40px] mb-20 text-black">
          <h5 className="font-black text-sm uppercase mb-4 tracking-widest">
            ¿Por qué diseñar con <span className="nowrap">Sr.&nbsp;Zur</span>?
          </h5>
          <p className="text-xs text-muted leading-relaxed text-justify italic">
            En <span className="nowrap font-bold">Sr.&nbsp;Zur</span> no
            entregamos simples gráficos; construimos activos de negocio
            sostenibles. En Nariño, el café es tradición, y nuestra especialidad
            es transformar esa herencia en una marca competitiva que justifique
            un precio premium ante el mundo.
          </p>
        </div>

        <div className="flex justify-between items-end pt-10 border-t border-black">
          <div className="w-[280px]">
            <div className="border-2 border-black border-dashed h-28 flex flex-col items-center justify-center text-[9px] font-black text-muted uppercase tracking-[0.3em]">
              <p>Firma de Aceptación</p>
              <p className="mt-1">(Sello y Cédula)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-xl text-black leading-none mb-1 uppercase">
              Ana Patricia Chamorro P.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-5">
              Directora Creativa / Propietaria -{" "}
              <span className="nowrap">Sr.&nbsp;Zur</span>
            </p>
            <div className="text-[9px] font-bold text-muted space-y-0.5 uppercase tracking-tighter">
              <p>WHATSAPP: +57 321 6732258</p>
              <p>WWW.SRZUR.COM | HOLA@SRZUR.COM</p>
              <p>PASTO, NARIÑO - COLOMBIA | RRSS: @SRZUR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDocumentPreview;
