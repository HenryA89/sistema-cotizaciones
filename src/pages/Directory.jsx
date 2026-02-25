import React from "react";
import { UserPlus, ChevronRight } from "lucide-react";
import ClientCard from "../components/clients/ClientCard.jsx";

const Directory = ({
  clientes,
  setSelectedClient,
  onCreateQuote,
  onAddClient,
}) => {
  return (
    <div className="space-y-8 duration-700 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mt-2 text-xs tracking-widest uppercase text-blue-950">
            Gestiona tus clientes y crea cotizaciones
          </p>
        </div>
        <button
          onClick={onAddClient}
          className="flex items-center gap-2 px-6 py-3 text-xs font-black tracking-widest text-white uppercase transition-all rounded-full shadow-lg bg-amber-500 hover:scale-105 hover:shadow-xl hover:bg-white hover:text-black"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Lista de Clientes */}
      {clientes.length === 0 ? (
        <div className="bg-white p-12 rounded-[60px] border-blue-300 shadow-sm text-center">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          <h3 className="mb-2 text-2xl font-black text-blue-950">
            Sin Clientes Aún
          </h3>
          <p className="mb-8 text-blue-300">
            Crea tu primer cliente para empezar a generar cotizaciones
          </p>
          <button
            onClick={onAddClient}
            className="px-10 py-4 text-sm font-black tracking-widest uppercase transition-all rounded-full bg-cream-bg text-primary-green"
          >
            Crear Primer Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <div key={c.id} className="relative group">
              <ClientCard client={c} onClick={() => setSelectedClient(c)} />
              <button
                onClick={() => setSelectedClient(c)}
                className="absolute p-2 text-white transition-opacity rounded-full shadow-lg opacity-0 md:p-3 bg-blue-950 -bottom-3 -right-3 group-hover:opacity-100 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Botón agregar más clientes */}
          <button
            onClick={onAddClient}
            className="border-2 border-dashed border-blue-300 rounded-[50px] p-8 flex flex-col items-center justify-center text-blue-300 hover:bg-cream-bg hover:text-primary-green transition-all group min-h-45 w-full"
          >
            <UserPlus className="w-12 h-12 mb-3 transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Añadir Cliente
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Directory;
