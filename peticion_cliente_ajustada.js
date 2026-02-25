// ESTRUCTURA DE PETICIÓN AJUSTADA A TABLA CLIENTES DE SUPABASE
// Basado en los atributos reales de la tabla

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://your-project.supabase.co",
  "your-anon-key",
);

// 1️⃣ PETICIÓN BÁSICA - Con atributos reales de la tabla
async function obtenerClientePorId(clienteId) {
  console.log("🔍 OBTENIENDO CLIENTE POR ID:", clienteId);

  try {
    const { data, error, status } = await supabase
      .from("clientes")
      .select(
        `
        id,
        nombre,
        apellido,
        empresa,
        email,
        telefono,
        ciudad,
        direccion,
        tipo_cliente,
        created_at,
        updated_at
      `,
      )
      .eq("id", clienteId)
      .single();

    if (error) {
      console.error("❌ Error:", error);
      console.error("📊 Status:", status);
      return null;
    }

    console.log("✅ Cliente encontrado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error general:", error);
    return null;
  }
}

// 2️⃣ PETICIÓN PARA TIPO_CLIENTE (usado en cotizaciones)
async function obtenerTipoCliente(clienteId) {
  console.log("🏷️ OBTENIENDO TIPO DE CLIENTE:", clienteId);

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("tipo_cliente")
      .eq("id", clienteId)
      .single();

    if (error) {
      console.error("❌ Error obteniendo tipo cliente:", error);
      return "personal"; // Valor por defecto
    }

    console.log("✅ Tipo cliente:", data.tipo_cliente);
    return data.tipo_cliente;
  } catch (error) {
    console.error("❌ Error general:", error);
    return "personal"; // Valor por defecto
  }
}

// 3️⃣ PETICIÓN CON DATOS COMPLETOS PARA COTIZACIÓN
async function obtenerClienteParaCotizacion(clienteId) {
  console.log("📋 OBTENIENDO CLIENTE PARA COTIZACIÓN:", clienteId);

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
        id,
        nombre,
        apellido,
        empresa,
        email,
        telefono,
        ciudad,
        tipo_cliente
      `,
      )
      .eq("id", clienteId)
      .single();

    if (error) {
      console.error("❌ Error:", error);
      return null;
    }

    // Formatear nombre completo para la UI
    const clienteFormateado = {
      ...data,
      nombreCompleto: `${data.nombre} ${data.apellido}`.trim(),
    };

    console.log("✅ Cliente para cotización:", clienteFormateado);
    return clienteFormateado;
  } catch (error) {
    console.error("❌ Error general:", error);
    return null;
  }
}

// 4️⃣ PETICIÓN CON RELACIONES (cliente + sus cotizaciones)
async function obtenerClienteConCotizaciones(clienteId) {
  console.log("🔗 OBTENIENDO CLIENTE CON SUS COTIZACIONES:", clienteId);

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
        id,
        nombre,
        apellido,
        empresa,
        email,
        telefono,
        ciudad,
        tipo_cliente,
        created_at,
        cotizaciones (
          id,
          estado,
          created_at,
          cotizacion_items (
            id,
            tipo_item,
            producto_id,
            servicio_id,
            descripcion,
            cantidad,
            precio_unitario,
            subtotal
          )
        )
      `,
      )
      .eq("id", clienteId)
      .single();

    if (error) {
      console.error("❌ Error:", error);
      return null;
    }

    // Formatear nombre completo
    const clienteCompleto = {
      ...data,
      nombreCompleto: `${data.nombre} ${data.apellido}`.trim(),
    };

    console.log("✅ Cliente completo con cotizaciones:", clienteCompleto);
    return clienteCompleto;
  } catch (error) {
    console.error("❌ Error general:", error);
    return null;
  }
}

// 5️⃣ PETICIÓN POR TIPO DE CLIENTE
async function obtenerClientesPorTipo(tipoCliente) {
  console.log("🏷️ OBTENIENDO CLIENTES POR TIPO:", tipoCliente);

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
        id,
        nombre,
        apellido,
        empresa,
        email,
        telefono,
        ciudad,
        tipo_cliente,
        created_at
      `,
      )
      .eq("tipo_cliente", tipoCliente) // 'personal' o 'distribuidor'
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error:", error);
      return [];
    }

    // Formatear nombres completos
    const clientesFormateados = data.map((cliente) => ({
      ...cliente,
      nombreCompleto: `${cliente.nombre} ${cliente.apellido}`.trim(),
    }));

    console.log(`✅ Clientes tipo ${tipoCliente}:`, clientesFormateados);
    return clientesFormateados;
  } catch (error) {
    console.error("❌ Error general:", error);
    return [];
  }
}

// 6️⃣ PETICIÓN CON BÚSQUEDA ATRIBUTOS REALES
async function buscarClientes(terminoBusqueda) {
  console.log("🔍 BUSCANDO CLIENTES CON TÉRMINO:", terminoBusqueda);

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
        id,
        nombre,
        apellido,
        empresa,
        email,
        telefono,
        ciudad,
        tipo_cliente,
        created_at
      `,
      )
      .or(
        `
        nombre.ilike.%${terminoBusqueda}%,
        apellido.ilike.%${terminoBusqueda}%,
        empresa.ilike.%${terminoBusqueda}%,
        email.ilike.%${terminoBusqueda}%
      `,
      )
      .order("empresa", { ascending: true });

    if (error) {
      console.error("❌ Error:", error);
      return [];
    }

    // Formatear nombres completos
    const clientesFormateados = data.map((cliente) => ({
      ...cliente,
      nombreCompleto: `${cliente.nombre} ${cliente.apellido}`.trim(),
    }));

    console.log("✅ Clientes encontrados:", clientesFormateados);
    return clientesFormateados;
  } catch (error) {
    console.error("❌ Error general:", error);
    return [];
  }
}

// 7️⃣ ESTRUCTURA HTTP cURL AJUSTADA
console.log("🌐 ESTRUCTURA HTTP cURL AJUSTADA:");

const curlEjemplo = `curl -X GET 'https://your-project.supabase.co/rest/v1/clientes?id=eq.123e4567-e89b-12d3-a456-426614174000&select=id,nombre,apellido,empresa,email,telefono,ciudad,direccion,tipo_cliente,created_at,updated_at' \\
  -H 'apikey: your-anon-key' \\
  -H 'Authorization: Bearer your-anon-key' \\
  -H 'Content-Type: application/json'`;

console.log(curlEjemplo);

// 8️⃣ RESPUESTA ESPERADA AJUSTADA
console.log("📋 RESPUESTA ESPERADA AJUSTADA:");

const respuestaAjustada = {
  id: "uuid-del-cliente",
  nombre: "María",
  apellido: "González",
  empresa: "Café Boutique Ltda.",
  email: "maria.gonzalez@cafeboutique.com",
  telefono: "+57 4 123 4567",
  ciudad: "Medellín",
  direccion: "Calle 50 #45-67, Centro",
  tipo_cliente: "distribuidor",
  created_at: "2024-01-10T09:15:00.000Z",
  updated_at: "2024-02-20T15:30:00.000Z",
};

console.log(JSON.stringify(respuestaAjustada, null, 2));

// 9️⃣ EJEMPLOS DE USO AJUSTADOS
console.log("🚀 EJEMPLOS DE USO AJUSTADOS:");

// Ejemplo 1: Obtener tipo cliente (para descuentos)
console.log("\n📌 EJEMPLO 1 - Obtener tipo cliente:");
console.log('const tipoCliente = await obtenerTipoCliente("uuid-cliente");');
console.log('// Retorna: "distribuidor" o "personal"');

// Ejemplo 2: Obtener cliente para cotización
console.log("\n📌 EJEMPLO 2 - Cliente para cotización:");
console.log(
  'const cliente = await obtenerClienteParaCotizacion("uuid-cliente");',
);
console.log(
  "// Retorna: { id, nombre, apellido, empresa, ..., nombreCompleto }",
);

// Ejemplo 3: Buscar por nombre o empresa
console.log("\n📌 EJEMPLO 3 - Buscar clientes:");
console.log('const resultados = await buscarClientes("Café");');
console.log("// Busca en: nombre, apellido, empresa, email");

// Ejemplo 4: Clientes por tipo
console.log("\n📌 EJEMPLO 4 - Clientes distribuidores:");
console.log(
  'const distribuidores = await obtenerClientesPorTipo("distribuidor");',
);

// 10️⃣ USO EN COMPONENTES DEL PROYECTO
console.log("\n🔧 USO EN COMPONENTES DEL PROYECTO:");

// En QuoteBuilder.jsx - para obtener tipo_cliente
console.log("\n📋 En QuoteBuilder.jsx:");
const quoteBuilderExample = `
// Para obtener tipo_cliente y calcular descuentos
const { data: cliente } = await supabase
  .from('clientes')
  .select('tipo_cliente')
  .eq('id', client.id)
  .single();

const descuento = cliente.tipo_cliente === 'distribuidor' ? 8 : 0;
`;
console.log(quoteBuilderExample);

// En Propuesta.jsx - para mostrar datos del cliente
console.log("\n📋 En Propuesta.jsx:");
const propuestaExample = `
// Para obtener datos completos del cliente
const { data: cliente } = await supabase
  .from('clientes')
  .select(\`
    id,
    nombre,
    apellido,
    empresa,
    ciudad
  \`)
  .eq('id', selectedPropuesta.cliente_id)
  .single();

const clienteFormateado = {
  nombreCompleto: \`\${cliente.nombre} \${cliente.apellido}\`,
  empresa: cliente.empresa,
  ciudad: cliente.ciudad
};
`;
console.log(propuestaExample);

// Exportar funciones ajustadas
export {
  obtenerClientePorId,
  obtenerTipoCliente,
  obtenerClienteParaCotizacion,
  obtenerClienteConCotizaciones,
  obtenerClientesPorTipo,
  buscarClientes,
};
