import React from "react";
import { X, LayoutDashboard, Users, Package } from "lucide-react";

const Sidebar = ({
  activeTab,
  setActiveTab,
  setSelectedClient,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "directory", label: "Bitácoras & Clientes", icon: Users },
    { id: "productos", label: "Tarifario Global", icon: Package },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed z-50 flex-col h-full p-8 text-cream bg-orange-400 shadow-2xl w-72 no-print">
        <div className="flex items-center gap-4 mb-14">
          <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-white shadow-inner rounded-2xl shrink-0">
            <img
              src="https://storage.googleapis.com/msgsndr/XZif5wJzzFnk4lYBAZEH/media/682d2fdee10a0857ddd47d84.png"
              alt="Logo"
              className="object-contain w-12 h-12 bg-amber-50 rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black leading-none tracking-tighter text-white uppercase">
              Sr.&nbsp;Zur
            </h1>
            <p className="text-[9px] tracking-widest font-bold text-muted uppercase mt-1">
              Management
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedClient(null);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[11px] font-blue-950 uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-blue-950 text-white shadow-2xl translate-x-2" : "bg-white text-primary-green hover:bg-blue-950 hover:text-white"}`}
            >
              <item.icon
                className={`w-4 h-4 ${activeTab === item.id ? "text-primary-green" : "text-primary-green"}`}
              />{" "}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4 pt-8 border-t border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[11px] font-black uppercase text-blue-950 shadow-lg shadow-indigo-500/20">
            AP
          </div>
          <p className="text-[11px] font-black uppercase text-blue-950">
            Ana Paredes
          </p>
        </div>
      </aside>

      {/* Mobile overlay + panel */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 pointer-events-none invisible"}`}
        aria-hidden={!isOpen}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 p-6 bg-accent-orange text-cream transform transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-white rounded-2xl">
              <img
                src="https://storage.googleapis.com/msgsndr/XZif5wJzzFnk4lYBAZEH/media/682d2fdee10a0857ddd47d84.png"
                alt="Logo"
                className="object-contain w-12 h-12 bg-amber-50 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase">Sr. Zur</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-primary-dark/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedClient(null);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-white text-primary-green" : "bg-white text-primary-green hover:bg-orange-400 hover:text-white"}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
