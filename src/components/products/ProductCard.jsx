import React from "react";
import { Package } from "lucide-react";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white p-10 rounded-[60px] border border-gray-100 shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col h-full overflow-hidden shadow-black/5">
      <div className="w-16 h-16 bg-gray-50 rounded-[30px] flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-all shadow-inner shrink-0 shadow-black/5">
        <Package className="w-8 h-8" />
      </div>
      <h4
        className="font-black text-xl md:text-2xl tracking-tighter mb-2 leading-none uppercase break-words whitespace-normal"
        style={{ hyphens: "none" }}
      >
        {product.nombre}
      </h4>
      <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-10 shrink-0">
        {product.categoria}
      </p>
      <div className="mt-auto pt-8 border-t border-gray-50 flex flex-wrap justify-between items-end gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest whitespace-nowrap">
          Inversión Sugerida
        </span>
        <span className="font-black text-xl md:text-2xl break-words leading-none">
          ${(product.precio_unitario || product.precio)?.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
