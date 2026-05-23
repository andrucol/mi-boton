export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url);

    // ─── CORS CONFIG ───
    const origen = request.headers.get("Origin");
    const dominiosPermitidos = ["https://netosalon.com"];
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

    // 2. RUTA API: REGISTRAR CLICS (solo POST, con validación de Origin)
    if (request.method === "POST" && url.pathname === "/registrar-clic") {
      // Bloqueo de seguridad: solo dominios permitidos pueden usar la API
      if (!esValido) {
        return new Response("Acceso denegado: Origen no autorizado", { status: 403, headers: corsHeaders });
      }

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

    // 3. PÁGINAS ESTÁTICAS (/, /dtfbogota/, /cotizador/, /dtfbogota/assets/, etc.)
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Pagina no encontrada", { status: 404 });
    }

  }
};