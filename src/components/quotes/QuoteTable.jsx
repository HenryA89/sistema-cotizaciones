import React from "react";
import { Eye } from "lucide-react";

const QuoteTable = ({ cotizaciones, onPreview }) => {
  return (
    <div className="bg-white rounded-[50px] border border-gray-100 shadow-sm overflow-hidden">
      {/* Desktop / tablet table */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] uppercase font-black text-gray-300 border-b">
              <th className="p-8">Cliente / Marca</th>
              <th className="p-8">Estado</th>
              <th className="p-8 text-right">Inversión</th>
              <th className="p-8 text-right">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cotizaciones.map((cot) => (
              <tr
                key={cot.id}
                className="transition-colors hover:bg-gray-50 group"
              >
                <td
                  className="p-8 text-sm font-black leading-tight text-black break-words"
                  style={{ hyphens: "none" }}
                >
                  Cotización #{cot.numero_cotizacion || cot.id.substring(0, 8)}
                </td>
                <td className="p-8">
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-700 shadow-sm">
                    ACTIVA
                  </span>
                </td>
                <td className="p-8 text-sm font-black text-right text-black whitespace-nowrap">
                  ${cot.total?.toLocaleString() || "0"}
                </td>
                <td className="p-8 text-right whitespace-nowrap">
                  <button
                    onClick={() => onPreview(cot)}
                    className="p-2 text-gray-300 transition-colors hover:bg-black hover:text-white rounded-xl"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {cotizaciones.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-20 italic text-center text-gray-300"
                >
                  No hay propuestas generadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="p-4 space-y-4 sm:hidden">
        {cotizaciones.length === 0 && (
          <div className="p-6 italic text-center text-gray-300">
            No hay propuestas generadas.
          </div>
        )}
        {cotizaciones.map((cot) => (
          <div
            key={cot.id}
            className="p-4 border border-gray-100 bg-gray-50 rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-black truncate">
                  Cotización #{cot.numero_cotizacion || cot.id.substring(0, 8)}
                </p>
                <p className="text-[12px] text-gray-500 mt-1">
                  ${cot.total?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">
                  ${cot.total?.toLocaleString() || "0"}
                </p>
                <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 inline-block mt-1">
                  ACTIVA
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => onPreview(cot)}
                className="p-2 text-gray-300 transition-colors hover:bg-black hover:text-white rounded-xl"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuoteTable;
