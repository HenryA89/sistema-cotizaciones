import React from "react";
import { Menu } from "lucide-react";

const Header = ({ activeTab, onToggleSidebar }) => {
  const titles = {
    dashboard: "Panel Operativo",
    directory: "Directorio de Aliados",
    productos: "Tarifario Global",
  };

  return (
    <header className="flex items-end justify-between mb-8 md:mb-14 bg-blue-300 text-blue-950">
      <div className="mr-4 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-cream bg-primary-dark rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-w-0 pr-10">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">
          Enterprise Agency OS
        </p>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-none tracking-tighter uppercase wrap-break-word whitespace-normal"
          style={{ hyphens: "none" }}
        >
          {titles[activeTab]}
        </h2>
      </div>
      <div className="flex items-center gap-3 px-5 py-3 bg-cream border border-subtle shadow-sm rounded-2xl shrink-0">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted whitespace-nowrap">
          Cloud Sync On
        </span>
      </div>
    </header>
  );
};

export default Header;
