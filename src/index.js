export default {
  async fetch(request, env, ctx) {

    const origen = request.headers.get("Origin");
    const dominiosPermitidos = ["https://netosalon.com", "https://netosalon.com/dtfbogota"];
    const esValido = dominiosPermitidos.includes(origen);

    const corsHeaders = {
      "Access-Control-Allow-Origin": esValido ? origen : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 1. PERMISO CORS (Preflight para navegadores)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. BLOQUEO REAL DE SEGURIDAD (Detiene PowerShell, Postman, etc.)
    if (!esValido) {
      return new Response("Acceso denegado: Origen no autorizado", { status: 403, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 3. RUTA PARA REGISTRAR CLICS
    if (request.method === "POST" && url.pathname === "/registrar-clic") {
      const datos = await request.json();
      try {
        await env.DB.prepare(
          "INSERT INTO clics (boton) VALUES (?)"
        ).bind(datos.boton).run();

        return new Response("Clic registrado exitosamente", { status: 201, headers: corsHeaders });
      } catch (error) {
        return new Response("Error al registrar clic", { status: 400, headers: corsHeaders });
      }
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Pagina no encontrada", { status: 404 });
    }

  }
};