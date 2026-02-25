import React from "react";
import ProductCard from "../components/products/ProductCard.jsx";

const Products = ({ productos }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700 text-black bg-blue-300">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Products;
