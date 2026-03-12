const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // 1. PERMISO CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 2. RUTA PARA REGISTRAR CLICS
    if (request.method === "POST" && url.pathname === "/registrar-clic") {
      const datos = await request.json();
      try {
        await env.DB.prepare(
          "INSERT INTO clics (boton) VALUES (?)"
        ).bind(datos.boton).run();
        
        return new Response("Clic registrado exitosamente", { status: 201, headers: corsHeaders });
      } catch (error) {
        return new Response("Error al registrar clic: " + error.message, { status: 400, headers: corsHeaders });
      }
    }

    // RUTA POR DEFECTO
    return new Response("API de métricas funcionando.", { status: 200, headers: corsHeaders });
  }
};