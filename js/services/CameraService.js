/* ============================================================
   SERVICIO DE CÁMARA
   Lista las cámaras del equipo (integrada, USB, virtuales) y
   dibuja sus fotogramas en un <canvas>.
   No conoce el Modelo ni las Vistas.
   ============================================================ */
const CameraService = {
  canvas: null,
  video: null,
  stream: null,
  raf: null,
  activo: false,
  etiquetaActual: "Cámara",

  soportada() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  /** Devuelve [{ deviceId, label }]. Si aún no hay permiso, lo solicita una vez. */
  async listar() {
    if (!this.soportada()) {
      throw new Error("Tu navegador no permite acceder a la cámara (abre el proyecto desde http://localhost o HTTPS).");
    }
    let dispositivos = await navigator.mediaDevices.enumerateDevices();
    // Sin permiso concedido, el navegador oculta los nombres: se pide acceso y se vuelve a listar
    if (dispositivos.some(d => d.kind === "videoinput" && !d.label)) {
      try {
        const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        tmp.getTracks().forEach(t => t.stop());
        dispositivos = await navigator.mediaDevices.enumerateDevices();
      } catch (e) {
        throw new Error("Permiso de cámara denegado. Habilítalo en el navegador y vuelve a intentar.");
      }
    }
    return dispositivos
      .filter(d => d.kind === "videoinput")
      .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Cámara ${i + 1}` }));
  },

  /** Avisa cuando se conecta o desconecta una cámara USB. */
  alCambiarDispositivos(callback) {
    if (!this.soportada()) return () => {};
    navigator.mediaDevices.addEventListener("devicechange", callback);
    return () => navigator.mediaDevices.removeEventListener("devicechange", callback);
  },

  async iniciar(canvas, deviceId, etiqueta) {
    this.detener();
    this.canvas = canvas;
    this.etiquetaActual = etiqueta || "Cámara";

    const video = deviceId
      ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
      : { width: { ideal: 640 }, height: { ideal: 480 } };
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
    } catch (e) {
      throw new Error("No se pudo abrir la cámara. Puede estar en uso por otra aplicación o sin permisos.");
    }

    this.video = document.createElement("video");
    this.video.srcObject = this.stream;
    this.video.muted = true;
    this.video.playsInline = true;
    await this.video.play();

    this.activo = true;
    const ctx = canvas.getContext("2d");
    const dibujar = () => {
      if (!this.activo || !this.video) return;
      if (this.video.videoWidth) {
        if (canvas.width !== this.video.videoWidth) canvas.width = this.video.videoWidth;
        if (canvas.height !== this.video.videoHeight) canvas.height = this.video.videoHeight;
        ctx.drawImage(this.video, 0, 0);
      }
      this.raf = requestAnimationFrame(dibujar);
    };
    dibujar();
  },

  detener() {
    this.activo = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.video = null;
  },

  etiqueta() {
    return this.etiquetaActual;
  },

  /** Fotograma actual como JPEG en base64 (dataURL). */
  capturar() {
    return this.canvas.toDataURL("image/jpeg", 0.9);
  }
};
