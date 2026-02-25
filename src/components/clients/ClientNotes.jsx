import React from "react";
import { MessageSquare } from "lucide-react";

const ClientNotes = ({ client }) => {
  return (
    <div className="bg-white p-12 rounded-[60px] border border-gray-100 shadow-sm text-black">
      <h4 className="font-black text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3 text-gray-400">
        <MessageSquare className="w-5 h-5" /> Bitácora Estratégica
      </h4>
      <div className="pr-4 space-y-4 overflow-y-auto max-h-125 custom-scrollbar">
        {(client.notas || []).length === 0 ? (
          <p className="py-12 italic text-center text-gray-300">
            Sin notas registradas
          </p>
        ) : (
          (client.notas || [])
            .sort((a, b) => b.date - a.date)
            .map((n) => (
              <div
                key={n.id}
                className="p-8 bg-gray-50 rounded-[45px] border border-gray-100 transition-all shadow-sm"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  {n.date.toDate().toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-sm font-medium leading-relaxed text-gray-700 whitespace-pre-wrap wrap-break-word">
                  {n.text}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ClientNotes;
