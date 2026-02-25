import React from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

const ClientSketchGallery = ({ client, onAddSketch }) => {
  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  return (
    <div className="bg-white p-12 rounded-[60px] border border-gray-100 shadow-sm overflow-hidden text-black">
      <h4 className="font-black text-[11px] uppercase tracking-widest mb-10 flex items-center gap-3 text-gray-400 tracking-[0.3em]">
        <ImageIcon className="w-5 h-5" /> Galería de Bocetos
      </h4>
      <div className="grid grid-cols-4 gap-6">
        {(client.bocetos || []).map((b) => (
          <div
            key={b.id}
            className="aspect-square rounded-[35px] overflow-hidden border border-gray-100 shadow-sm group relative hover:scale-105 transition-all shadow-black/5"
          >
            <img src={b.url} className="w-full h-full object-cover" />
          </div>
        ))}
        <label className="aspect-square bg-gray-50 rounded-[35px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:text-black hover:border-black cursor-pointer transition-all group shrink-0 shadow-inner">
          <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-black uppercase text-center px-2">
            Subir
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, onAddSketch)}
          />
        </label>
      </div>
    </div>
  );
};

export default ClientSketchGallery;
