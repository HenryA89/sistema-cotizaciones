import React from "react";
import { FileText, Users, Sparkles, MapPin } from "lucide-react";
import QuoteTable from "../components/quotes/QuoteTable.jsx";

const Dashboard = ({
  cotizaciones,
  clientes,
  onNavigateToClientes,
  onNavigateToPropuestas,
}) => {
  return (
    <div className="space-y-8 duration-700 animate-in fade-in">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Propuestas",
            val: cotizaciones.length,
            icon: FileText,
            color: "text-blue-500",
            onClick: onNavigateToPropuestas,
          },
          {
            label: "Aliados",
            val: clientes.length,
            icon: Users,
            color: "text-blue-500",
            onClick: onNavigateToClientes,
          },
          {
            label: "Sistema",
            val: "V3.3",
            icon: Sparkles,
            color: "text-green-500",
            onClick: null,
          },
          {
            label: "Ubicación",
            val: "Pasto",
            icon: MapPin,
            color: "text-purple-500",
            onClick: null,
          },
        ].map((s, i) => (
          <button
            key={i}
            onClick={s.onClick}
            disabled={!s.onClick}
            className={`card p-6 md:p-7 rounded-[35px] bg-amber-600 text-white border-subtle shadow-sm flex justify-between items-start transition-all duration-200 w-full ${s.onClick ? "hover:scale-105 hover:bg-blue-950 cursor-pointer active:scale-95" : "cursor-default opacity-75"}`}
            style={{ pointerEvents: s.onClick ? "auto" : "none" }}
          >
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                {s.label}
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black leading-none">
                {s.val}
              </h3>
            </div>
            <div
              className={`${s.color} p-3 bg-accent-orange rounded-2xl shadow-inner text-white`}
            >
              <s.icon className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
