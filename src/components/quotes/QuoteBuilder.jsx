import React, { useState, useEffect } from "react";

// Función para generar UUIDs válidos
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
import { X, Plus, Trash2, Package, Truck } from "lucide-react";
import { useQuoteBuilder } from "../../hooks/useQuoteBuilder.js";
import supabase from "../../services/supabaseClient.js";

const QuoteBuilder = ({
  isOpen,
  onClose,
  client,
  productos,
  servicios,
  onAddProduct,
}) => {
  const {
    quoteItems,
    editingItem,
    setEditingItem,
    addItem,
    updateItem,
    removeItem,
  } = useQuoteBuilder();

  const [distribuidorMode, setDistribuidorMode] = useState(false);
  const [preciosDistribuidor, setPreciosDistribuidor] = useState({});
  const [activeTab, setActiveTab] = useState("productos"); // "productos" o "servicios"
  const [loadingPrecios, setLoadingPrecios] = useState(false);

  const clientName = client
    ? `${client.nombres || ""} ${client.apellidos || ""}`.trim()
    : "Cliente";

  // Obtener precios de distribuidor
  const fetchPreciosDistribuidor = async () => {
    console.log("🚀 Iniciando petición de precios de distribuidor...");
    setLoadingPrecios(true);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Extraer el project-ref de la URL de Supabase
      const projectRef =
        SUPABASE_URL.split("https://")[1].split(".supabase.co")[0];

      const apiUrl = `https://${projectRef}.supabase.co/rest/v1/precios_producto?tipo_precio=eq.distribuidor`;
      console.log("🔗 URL de la API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Respuesta HTTP:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("✅ Precios de distribuidor obtenidos:", data);
      console.log("📊 Total de precios:", data.length);

      // Crear un mapa de producto_id -> precio_distribuidor
      const preciosMap = {};
      data.forEach((precio) => {
        preciosMap[precio.producto_id] = precio.precio_distribuidor;
        console.log(
          `💰 Producto ${precio.producto_id}: $${precio.precio_distribuidor}`,
        );
      });

      console.log("🗺️ Mapa de precios creado:", preciosMap);
      setPreciosDistribuidor(preciosMap);
    } catch (err) {
      console.error("❌ Error fetching precios distribuidor:", err);
    } finally {
      setLoadingPrecios(false);
    }
  };

  // Cargar precios de distribuidor cuando se activa el modo
  useEffect(() => {
    if (distribuidorMode) {
      fetchPreciosDistribuidor();
    }
  }, [distribuidorMode]);

  // Función para obtener el precio correcto según el modo
  const getPrecioProducto = (producto) => {
    if (distribuidorMode && preciosDistribuidor[producto.id]) {
      return preciosDistribuidor[producto.id];
    }
    return producto.precio_unitario || producto.precio || 0;
  };

  // Función para guardar cotización
  const handleSaveQuote = async () => {
    if (!client?.id || quoteItems.length === 0) {
      alert("Por favor selecciona un cliente y agrega items a la cotización");
      return;
    }

    try {
      // 1️⃣ Crear la cotización
      const { data: cotizacionCreada, error } = await supabase
        .from("cotizaciones")
        .insert({
          cliente_id: client.id,
          estado: "pendiente",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creando cotización:", error);
        return;
      }

      // 2️⃣ Preparar items para insertar
      const items = [
        ...quoteItems
          .filter((item) => item.tipo === "producto")
          .map((p) => {
            console.log("Producto item:", {
              id: p.id,
              producto_id: p.producto_id,
              nombre: p.nombre,
            });
            return {
              cotizacion_id: cotizacionCreada.id,
              tipo_item: "producto",
              producto_id: p.producto_id, // Usar ID original del producto
              descripcion: p.descripcionPersonalizada || p.nombre,
              cantidad: p.cantidad,
              precio_unitario: p.precio,
              subtotal:
                (p.precio - (p.precio * (p.descuento || 0)) / 100) * p.cantidad,
            };
          }),
        ...quoteItems
          .filter((item) => item.tipo === "servicio")
          .map((s) => {
            console.log("Servicio item:", {
              id: s.id,
              servicio_id: s.servicio_id,
              nombre: s.nombre,
            });
            return {
              cotizacion_id: cotizacionCreada.id,
              tipo_item: "servicio",
              servicio_id: s.servicio_id, // Usar ID original del servicio
              descripcion: s.descripcionPersonalizada || s.nombre,
              cantidad: s.cantidad,
              precio_unitario: s.precio,
              subtotal:
                (s.precio - (s.precio * (s.descuento || 0)) / 100) * s.cantidad,
            };
          }),
      ];

      // 3️⃣ Insertar los items
      const { error: errorItems } = await supabase
        .from("cotizacion_items")
        .insert(items);

      if (errorItems) {
        console.error("Error guardando items:", errorItems);
        alert("Error al guardar los items de la cotización");
      } else {
        alert("Cotización guardada exitosamente");
        console.log("Cotización guardada:", cotizacionCreada);

        // Redirigir a página de propuestas
        window.location.href = `/propuestas?cotizacionId=${cotizacionCreada.id}`;
      }
    } catch (error) {
      console.error("Error en handleSaveQuote:", error);
      alert("Error al guardar la cotización");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex md:justify-end justify-center animate-in fade-in duration-300">
      <div className="flex flex-col w-full h-full text-black duration-500 bg-white md:max-w-4xl animate-in slide-in-from-right">
        <header className="flex items-center justify-between p-8 bg-white border-b">
          <div>
            <h3 className="text-2xl font-black tracking-tighter uppercase">
              Constructor de Cotización
            </h3>
            <p className="mt-1 text-xs font-bold leading-none tracking-widest text-gray-400 uppercase">
              Aliado: {clientName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDistribuidorMode(!distribuidorMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                distribuidorMode
                  ? "bg-black text-white"
                  : "border border-gray-200"
              }`}
              disabled={loadingPrecios}
            >
              <Truck className="w-4 h-4" />
              {loadingPrecios
                ? "Cargando..."
                : distribuidorMode
                  ? "Precios Distribuidor"
                  : "Precios Persona"}
            </button>
            {/* Botón de prueba eliminado */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-100"
            >
              <X />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Listado de Productos y Servicios lado a lado */}
          <div className="w-full p-6 overflow-y-auto bg-white border-r md:w-1/2 md:border-r">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 tracking-[0.3em]">
              Catálogo Disponible
            </h4>

            {/* Pestañas para Productos y Servicios */}
            <div className="mb-6">
              <div className="flex border-b border-subtle">
                <button
                  onClick={() => setActiveTab("productos")}
                  className={`flex-1 py-3 px-4 text-center text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === "productos"
                      ? "border-b-2 border-black text-black"
                      : "text-muted hover\:text-primary-dark"
                  }`}
                >
                  Productos
                </button>
                <button
                  onClick={() => setActiveTab("servicios")}
                  className={`flex-1 py-3 px-4 text-center text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === "servicios"
                      ? "border-b-2 border-black text-black"
                      : "text-muted hover\:text-primary-dark"
                  }`}
                >
                  Servicios
                </button>
              </div>
            </div>

            {/* Contenido de las pestañas */}
            <div className="space-y-6">
              {/* PRODUCTOS */}
              {activeTab === "productos" &&
                productos &&
                productos.length > 0 && (
                  <div>
                    <h5 className="font-black text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-3 pb-2 border-b border-gray-200">
                      Productos Disponibles
                    </h5>
                    <div className="space-y-2">
                      {productos.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            const newItem = {
                              ...p,
                              id: generateUUID(), // ID temporal para el item en la UI
                              producto_id: p.id, // Mantener ID original del producto para BD
                              cantidad: 1,
                              precio: getPrecioProducto(p),
                              nombre: p.nombre,
                              tipo: "producto",
                            };
                            addItem(newItem);
                          }}
                          className="flex items-center gap-3 p-3 transition-all bg-white border-gray-200 shadow-sm cursor-pointer rounded-2xl hover:border-black hover:scale-105"
                        >
                          <div className="flex items-center justify-center w-8 h-8 text-blue-300 rounded-lg bg-blue-50 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold leading-tight tracking-tight uppercase">
                              {p.nombre}
                            </p>
                            <p className="text-[8px] text-gray-400 uppercase font-black mt-0.5">
                              ${getPrecioProducto(p)?.toLocaleString() || "0"}
                            </p>
                          </div>
                          <Plus className="w-3 h-3 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SERVICIOS */}
              {activeTab === "servicios" &&
                servicios &&
                servicios.length > 0 && (
                  <div>
                    <h5 className="font-black text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-3 pb-2 border-b border-gray-200">
                      Servicios
                    </h5>
                    <div className="space-y-2">
                      {servicios.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            const newItem = {
                              ...s,
                              id: generateUUID(), // ID temporal para el item en la UI
                              servicio_id: s.id, // Mantener ID original del servicio para BD
                              cantidad: 1,
                              precio:
                                s.precio_unitario ||
                                s.precio_base ||
                                s.precio ||
                                0,
                              nombre: s.nombre,
                              tipo: "servicio",
                            };
                            addItem(newItem);
                          }}
                          className="flex items-center gap-3 p-3 transition-all bg-white border border-gray-100 shadow-sm cursor-pointer rounded-2xl hover:border-black hover:scale-105"
                        >
                          <div className="flex items-center justify-center w-8 h-8 text-green-300 rounded-lg bg-green-50 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold leading-tight tracking-tight uppercase">
                              {s.nombre}
                            </p>
                            <p className="text-[8px] text-gray-400 uppercase font-black mt-0.5">
                              {s.precio_min && s.precio_max
                                ? `$${s.precio_min?.toLocaleString()} - $${s.precio_max?.toLocaleString()}`
                                : `$${(s.precio_unitario || s.precio_base || s.precio)?.toLocaleString() || "0"}`}
                            </p>
                          </div>
                          <Plus className="w-3 h-3 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Mensaje cuando no hay contenido */}
              {((activeTab === "productos" &&
                (!productos || productos.length === 0)) ||
                (activeTab === "servicios" &&
                  (!servicios || servicios.length === 0))) && (
                <div className="py-8 text-sm italic text-center text-gray-400">
                  {activeTab === "productos"
                    ? "No hay productos disponibles"
                    : "No hay servicios disponibles"}
                </div>
              )}
            </div>
          </div>

          {/* Área de Personalización */}
          <div className="w-full p-6 overflow-y-auto bg-white md:w-1/2">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 tracking-[0.3em]">
              Propuesta Actual
            </h4>
            <div className="space-y-4">
              {quoteItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 md:p-5 rounded-[35px] border-2 transition-all ${editingItem?.id === item.id ? "border-black bg-gray-50 shadow-xl" : "border-gray-200"}`}
                >
                  {editingItem?.id === item.id ? (
                    <div className="space-y-4 animate-in fade-in">
                      <input
                        className="w-full pb-1 text-lg font-black tracking-tight uppercase bg-transparent border-b-2 border-black outline-none"
                        value={item.nombre}
                        onChange={(e) =>
                          updateItem(idx, { ...item, nombre: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {item.tipo === "servicio" && (
                          <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                              Días hábiles
                            </label>
                            <input
                              type="number"
                              className="w-full p-2 text-sm font-bold bg-transparent border-b outline-none border-black/10"
                              value={item.diasEntrega || ""}
                              onChange={(e) =>
                                updateItem(idx, {
                                  ...item,
                                  diasEntrega: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                            Inversión{" "}
                            {item.tipo === "servicio" &&
                            item.precio_min &&
                            item.precio_max
                              ? `(${item.precio_min?.toLocaleString()} - ${item.precio_max?.toLocaleString()})`
                              : ""}
                          </label>
                          {item.tipo === "servicio" &&
                          item.precio_min &&
                          item.precio_max ? (
                            <input
                              type="number"
                              min={item.precio_min}
                              max={item.precio_max}
                              className="w-full p-2 text-lg font-black bg-transparent border-b outline-none border-black/10"
                              value={item.precio}
                              onChange={(e) =>
                                updateItem(idx, {
                                  ...item,
                                  precio: Math.min(
                                    Math.max(
                                      parseFloat(e.target.value) ||
                                        item.precio_min,
                                      item.precio_min,
                                    ),
                                    item.precio_max,
                                  ),
                                })
                              }
                            />
                          ) : (
                            <div className="w-full p-2 text-lg font-black border-b border-gray-200 bg-gray-50">
                              ${item.precio?.toLocaleString() || "0"}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                            Descuento (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full p-2 text-sm font-bold bg-transparent border-b outline-none border-black/10"
                            value={item.descuento || 0}
                            onChange={(e) =>
                              updateItem(idx, {
                                ...item,
                                descuento: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 text-sm font-bold bg-transparent border-b outline-none border-black/10"
                            value={item.cantidad || 1}
                            onChange={(e) =>
                              updateItem(idx, {
                                ...item,
                                cantidad: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                            Valor Final
                          </label>
                          <div className="w-full p-2 text-lg font-black border-b border-gray-200 bg-gray-50">
                            $
                            {(
                              item.precio *
                              (item.cantidad || 1) *
                              (1 - (item.descuento || 0) / 100)
                            )?.toLocaleString() || "0"}
                          </div>
                        </div>
                      </div>
                      <textarea
                        className="w-full p-3 text-sm leading-relaxed text-gray-400 bg-transparent border border-gray-200 outline-none resize-none md:text-xs h-28 md:h-24 rounded-2xl"
                        placeholder="Requerimientos específicos..."
                        value={item.descripcionPersonalizada}
                        onChange={(e) =>
                          updateItem(idx, {
                            ...item,
                            descripcionPersonalizada: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 bg-black text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setEditingItem(item)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-bold leading-tight uppercase break-words">
                          {item.nombre}
                        </p>
                        <div className="mt-1 text-xs text-gray-400">
                          <span>
                            {item.tipo === "servicio" &&
                            item.precio_min &&
                            item.precio_max
                              ? `Rango: $${item.precio_min?.toLocaleString()} - $${item.precio_max?.toLocaleString()}`
                              : `Unitario: $${item.precio?.toLocaleString() || "0"}`}
                          </span>
                          {item.cantidad > 1 && (
                            <span className="ml-2">× {item.cantidad}</span>
                          )}
                        </div>
                        <p className="mt-1 text-base font-black">
                          $
                          {(
                            item.precio *
                            (item.cantidad || 1) *
                            (1 - (item.descuento || 0) / 100)
                          )?.toLocaleString()}
                          {item.descuento > 0 && (
                            <span className="ml-2 text-xs text-red-500">
                              (-{item.descuento}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="p-2 text-gray-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {quoteItems.length === 0 && (
                <div className="py-24 text-sm italic text-center text-gray-400">
                  Selecciona servicios para iniciar
                </div>
              )}
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-between p-8 border-t shadow-inner bg-gray-50">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">
              Inversión Bruta
            </span>
            <h4 className="mt-2 text-3xl font-black leading-none text-black">
              $
              {quoteItems
                .reduce(
                  (a, b) =>
                    a +
                    b.precio *
                      (b.cantidad || 1) *
                      (1 - (b.descuento || 0) / 100),
                  0,
                )
                .toLocaleString()}
            </h4>
          </div>
          <button
            onClick={handleSaveQuote}
            disabled={quoteItems.length === 0}
            className="px-8 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cotización
          </button>
        </footer>
      </div>
    </div>
  );
};

export default QuoteBuilder;
