import React from "react";
import { MessageSquare, ChevronRight } from "lucide-react";

const ClientCard = ({ client, onClick }) => {
  const clientName = `${client.nombres || ""} ${client.apellidos || ""}`.trim();
  const clientInitial = clientName.charAt(0) || "C";
  const notasCount = client.notas_count || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 md:p-8 rounded-[50px] border border-blue-300 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col min-h-[180px] md:min-h-[220px] overflow-hidden"
    >
      <div className="flex flex-col items-center gap-5 mb-8 min-w-0">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-cream-bg rounded-[30px] flex items-center justify-center font-black text-blue-300 group-hover:bg-blue-950 group-hover:text-white transition-all overflow-hidden shrink-0 shadow-inner">
          {client.foto_url ? (
            <img src={client.foto_url} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl uppercase">{clientInitial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 pr-2 text-center">
          <h4
            className="font-black text-lg md:text-xl leading-tight text-black break-words whitespace-normal uppercase tracking-tight"
            style={{ hyphens: "none" }}
          >
            {clientName}
          </h4>
          <p className="text-[10px] text-blue-300 uppercase font-black mt-1 tracking-widest truncate">
            {client.empresa_nombre || "Particular"}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-8 border-t border-blue-300 flex items-center justify-between text-[10px] font-black text-blue-300 uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3 h-3 text-blue-300" /> {notasCount}{" "}
          bitácoras
        </div>
        <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-blue-950 transition-colors" />
      </div>
    </div>
  );
};

export default ClientCard;
