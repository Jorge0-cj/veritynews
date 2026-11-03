/* ============================================================
   SERVICIO DE RECONOCIMIENTO FACIAL (cliente del backend Python)
   Envía fotogramas al servidor (OpenCV YuNet + SFace) y devuelve
   el resultado. El servidor guarda solo la plantilla numérica.
   ============================================================ */
const FaceService = {
  API: "/api",

  async _llamar(ruta, opciones = {}) {
    let r;
    try {
      r = await fetch(this.API + ruta, {
        headers: { "Content-Type": "application/json" },
        ...opciones
      });
    } catch (e) {
      throw new Error("No hay conexión con el servidor de IA. Inicia backend/server.py y abre http://localhost:5000");
    }
    return r.json();
  },

  /** Comprueba que el servidor Python esté activo. */
  async disponible() {
    try {
      const r = await fetch(this.API + "/health", { cache: "no-store" });
      return r.ok;
    } catch (e) {
      return false;
    }
  },

  /** Registra al usuario con varias capturas. → { ok } | { ok:false, error } */
  async registrar(userId, imagenes) {
    return this._llamar("/face/enroll", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, images: imagenes })
    });
  },

  /** Verifica un fotograma. → { ok, coincide, similitud } | { ok:false, error } */
  async verificar(userId, imagen) {
    return this._llamar("/face/verify", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, image: imagen })
    });
  }
};
