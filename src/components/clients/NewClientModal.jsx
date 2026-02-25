import React, { useState } from "react";
import { X, Upload } from "lucide-react";

const NewClientModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    foto: null,
    fotoUrl: null,
    nombres: "",
    apellidos: "",
    telefono: "",
    email: "",
    ciudad: "",
    pais: "",
    empresaNombre: "",
    empresaActividad: "",
    empresaDireccion: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        fotoUrl: reader.result,
        foto: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) newErrors.nombres = "Nombres requeridos";
    if (!formData.apellidos.trim())
      newErrors.apellidos = "Apellidos requeridos";
    if (!formData.email.trim()) newErrors.email = "Email requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.telefono.trim()) newErrors.telefono = "Teléfono requerido";
    if (!formData.ciudad.trim()) newErrors.ciudad = "Ciudad requerida";
    if (!formData.pais.trim()) newErrors.pais = "País requerido";
    if (!formData.empresaNombre.trim())
      newErrors.empresaNombre = "Nombre empresa requerido";
    if (!formData.empresaActividad.trim())
      newErrors.empresaActividad = "Actividad empresa requerida";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        foto: null,
        fotoUrl: null,
        nombres: "",
        apellidos: "",
        telefono: "",
        email: "",
        ciudad: "",
        pais: "",
        empresaNombre: "",
        empresaActividad: "",
        empresaDireccion: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error al crear cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b rounded-t-[40px] p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-blue-950">
              Nuevo Cliente
            </h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Completa todos los datos para registrar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Foto de Perfil */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
              Foto de Perfil
            </label>
            <label className="flex items-center justify-center w-full p-8 transition-colors border-2 border-gray-200 border-dashed cursor-pointer rounded-3xl hover:border-black group">
              <div className="flex flex-col items-center gap-3">
                {formData.fotoUrl ? (
                  <>
                    <img
                      src={formData.fotoUrl}
                      alt="preview"
                      className="object-cover w-24 h-24 rounded-2xl"
                    />
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Cambiar foto
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 transition-colors group-hover:text-black" />
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Sube una foto
                    </span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Datos Personales */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-black mb-4">
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="nombres"
                  placeholder="Nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.nombres
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.nombres && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.nombres}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.apellidos
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.apellidos && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.apellidos}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.telefono
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.telefono && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.telefono}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.ciudad
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.ciudad && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.ciudad}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="pais"
                  placeholder="País"
                  value={formData.pais}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.pais
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.pais && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.pais}</p>
                )}
              </div>
            </div>
          </div>

          {/* Datos Empresa */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-black mb-4">
              Datos de la Empresa
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <input
                  type="text"
                  name="empresaNombre"
                  placeholder="Nombre de la Empresa"
                  value={formData.empresaNombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.empresaNombre
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.empresaNombre && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.empresaNombre}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="empresaDireccion"
                  placeholder="Dirección de la Empresa"
                  value={formData.empresaDireccion}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.empresaDireccion
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.empresaDireccion && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.empresaDireccion}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="empresaActividad"
                  placeholder="Actividad de la Empresa (ej: Manufactura, Servicios, etc.)"
                  value={formData.empresaActividad}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl outline-none font-bold text-sm transition-colors ${
                    errors.empresaActividad
                      ? "border-red-500"
                      : "border-gray-100 focus:border-black"
                  }`}
                />
                {errors.empresaActividad && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.empresaActividad}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-black tracking-widest uppercase transition-colors border-2 border-gray-200 rounded-3xl hover:border-black"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 text-sm font-black tracking-widest text-white uppercase transition-all bg-black shadow-lg rounded-3xl hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientModal;
