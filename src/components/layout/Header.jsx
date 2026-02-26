import React from "react";
import { Menu } from "lucide-react";

const Header = ({ activeTab, onToggleSidebar }) => {
  const titles = {
    dashboard: "Panel Operativo",
    directory: "Directorio de Aliados",
    productos: "Tarifario Global",
  };

  return (
    <header className="flex items-end justify-between mb-8 bg-blue-300 md:mb-14 text-blue-950">
      <div className="mr-4 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-cream bg-primary-dark"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-w-0 pr-10">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">
          Enterprise Agency OS
        </p>
        <h2
          className="text-xl font-black leading-none tracking-tighter uppercase whitespace-normal sm:text-lg md:text-xl lg:text-4xl wrap-break-word"
          style={{ hyphens: "none" }}
        >
          {titles[activeTab]}
        </h2>
      </div>
    </header>
  );
};

export default Header;
