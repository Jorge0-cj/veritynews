/* ============================================================
   MODELO (MODEL): Datos, reglas de negocio, estado y simulación de IA
   No conoce el DOM ni las vistas.
   ============================================================ */
const Model = {
  // Usuarios registrados iniciales
  usuarios: [
    { id: "usr_1", email: "usuario@veritynews.mx", pass: "usuario123", rol: "usuario", nombre: "Carlos Mendoza" },
    { id: "usr_2", email: "periodista@veritynews.mx", pass: "periodista123", rol: "periodista", nombre: "Elena Rostova (Periodista)" },
    { id: "usr_3", email: "admin@veritynews.mx", pass: "admin123", rol: "admin", nombre: "Dr. Víctor Valdez (Admin)" }
  ],

  // Temas / categorías disponibles
  categorias: ["Todas", "Tecnología", "Cultura", "Deportes", "Economía", "Medio Ambiente", "Salud"],
  categoriaActiva: "Todas",

  // Base de noticias
  // status: 'publicada' | 'pendiente_aprobacion' | 'rechazada'
  noticias: [
    {
      id: "not_1",
      titulo: "Sensores IoT y gemelos digitales optimizan la red eléctrica y reducen fallas en 40%",
      categoria: "Tecnología",
      autor: "Elena Rostova",
      autorRol: "periodista",
      fecha: "Hace 1 hora",
      status: "publicada",
      resumen: "Nuevas redes de telemetría IoT instaladas en infraestructura crítica permiten predecir sobrecargas antes de que ocurran apagones masivos.",
      contenidoCompleto: "La integración masiva de sensores IoT en las subestaciones de distribución de alta tensión ha completado hoy su primer trimestre de pruebas operativas. Los datos analizados por algoritmos de Machine Learning han permitido detectar 14 anomalías térmicas críticas con 72 horas de anticipación. Esto representa un salto cuántico en confiabilidad energética para más de 4 millones de hogares.",
      imagen: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      veredictoIA: {
        confiabilidad: 98,
        esVerdadera: true,
        resumenIA: "La correlación entre los registros de telemetría de las subestaciones y los boletines oficiales de energía confirma los porcentajes de reducción de fallas.",
        fuentesVerificadas: ["Red Nacional de Distribución", "Sensor IoT Hub Nodo-MX3", "Instituto Tecnológico Eléctrico"],
        iotTelemetria: "Telemetría activa: 482 sensores en línea | Estado: Normal"
      }
    },
    {
      id: "not_2",
      titulo: "Descubren frescos prehispánicos intactos mediante escaneo LIDAR en la selva maya",
      categoria: "Cultura",
      autor: "Elena Rostova",
      autorRol: "periodista",
      fecha: "Hace 3 horas",
      status: "publicada",
      resumen: "Investigadores revelan un complejo ceremonial desconocido hasta la fecha, preservado gracias a la espesa vegetación y catalogado en 3D.",
      contenidoCompleto: "Utilizando pulsos de láser aerotransportados (LIDAR), un equipo multidisciplinario penetró la densa cubierta forestal para revelar muros policromados que datan del año 650 d.C. Los pigmentos conservan tonalidades azules y rojas minerales extraordinarias. Las autoridades culturales han establecido un perímetro de protección satelital para prevenir saqueos.",
      imagen: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
      veredictoIA: {
        confiabilidad: 96,
        esVerdadera: true,
        resumenIA: "Verificado contra imágenes satelitales multiespectrales y validación por pares del Instituto de Antropología.",
        fuentesVerificadas: ["Boletín Oficial de Antropología", "Sensores Multiespectrales Sentinel-2", "Universidad Nacional"],
        iotTelemetria: "Geolocalización protegida con sensores sísmicos de área"
      }
    },
    {
      id: "not_3",
      titulo: "Biometría y cámaras inteligentes revolucionan el arbitraje en el campeonato nacional",
      categoria: "Deportes",
      autor: "Elena Rostova",
      autorRol: "periodista",
      fecha: "Hace 5 horas",
      status: "publicada",
      resumen: "La implementación de cámaras de 120 cuadros por segundo y chips en el balón reduce el tiempo de decisión en jugadas dudosas a solo 4 segundos.",
      contenidoCompleto: "El nuevo sistema de arbitraje asistido por computadora combina 28 cámaras periféricas calibradas milimétricamente con microchips inerciales embebidos en el balón oficial. La precisión en detección de posiciones adelantadas y cruces de línea de gol es del 99.8%, eliminando la controversia en el clásico deportivo del domingo.",
      imagen: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      veredictoIA: {
        confiabilidad: 94,
        esVerdadera: true,
        resumenIA: "Datos de telemetría de balones inteligentes cotejados con el reporte del cuerpo arbitral y la liga profesional.",
        fuentesVerificadas: ["Federación Deportiva", "Proveedores de Sensores SmartBall", "Actas de Partido"],
        iotTelemetria: "Dispositivos en cancha sincronizados a 1000 Hz"
      }
    },
    {
      id: "not_4",
      titulo: "Transición a energías limpias registra cifra récord en el primer trimestre",
      categoria: "Medio Ambiente",
      autor: "Elena Rostova",
      autorRol: "periodista",
      fecha: "Ayer",
      status: "publicada",
      resumen: "Parques eólicos y solares aportaron más del 32% del consumo eléctrico total del país este mes.",
      contenidoCompleto: "Impulsados por condiciones climáticas favorables y una red más robusta, los generadores renovables superaron las proyecciones anuales con creces. Sensores de radiación solar y anemómetros en línea confirmaron la consistencia del flujo sin interrupciones durante 30 días continuos.",
      imagen: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
      veredictoIA: {
        confiabilidad: 95,
        esVerdadera: true,
        resumenIA: "Cruce de datos de generación eléctrica pública corroborado con telemetría de inversores solares y turbinas.",
        fuentesVerificadas: ["Monitor Nacional de Energía", "Sensores Eólicos del Golfo", "Agencia Climatológica"],
        iotTelemetria: "Nodos eólicos: 114 activos | Eficiencia: 91%"
      }
    }
  ],

  // Cola de notificaciones.
  //  tipo:    info | ok | warning | error | noticia | suscripcion
  //  para:    "todos", un rol ("admin" | "periodista" | "usuario") o un id de usuario
  //  destino: vista a la que lleva la notificación al hacer clic (opcional)
  notificaciones: [
    {
      id: "notif_init", tipo: "info", titulo: "Bienvenido a VerityNews",
      mensaje: "La red verídica respaldada por IA e IoT. Aquí verás los avisos de tus noticias, tu suscripción y el sistema.",
      para: "todos", ts: Date.now() - 5 * 60000, leidaPor: [], destino: null
    },
    {
      id: "notif_demo_sub", tipo: "suscripcion", titulo: "Tu suscripción Premium está activa",
      mensaje: "Tu próxima renovación es el 15 de noviembre de 2026. Puedes administrar la renovación y los avisos desde Mi suscripción.",
      para: "usr_1", ts: Date.now() - 2 * 3600000, leidaPor: [], destino: "suscripcion"
    }
  ],

  // ---------- Autenticación ----------
  autenticar(email, pass) {
    return this.usuarios.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.pass === pass
    );
  },

  registrarUsuario(nombre, email, pass, rol) {
    const existe = this.usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existe) {
      return { exito: false, mensaje: "Este correo ya se encuentra registrado." };
    }
    const nuevo = {
      id: "usr_" + Date.now(),
      nombre,
      email: email.toLowerCase().trim(),
      pass,
      rol
    };
    this.usuarios.push(nuevo);
    return { exito: true, usuario: nuevo };
  },

  // ---------- Simulación de motor de IA & sensores IoT ----------
  analizarConIA(titulo, contenido, categoria) {
    const palabrasClave = ["sensores", "datos", "oficial", "estudio", "investigación", "cifras", "tecnología", "red", "análisis", "instituto"];
    let hits = 0;
    const textoTotal = (titulo + " " + contenido).toLowerCase();
    palabrasClave.forEach(p => { if (textoTotal.includes(p)) hits++; });

    const scoreBase = Math.min(99, 88 + (hits * 2));
    const esVerdadera = scoreBase >= 85;

    return {
      confiabilidad: scoreBase,
      esVerdadera: esVerdadera,
      resumenIA: `El motor de IA procesó la información contra 32 bases de datos indexadas y fuentes de telemetría IoT. Índice de coincidencia semántica verídica: ${scoreBase}%.`,
      fuentesVerificadas: [
        "Base de datos de Verity Core AI",
        "Muestreo de fuentes abiertas autorizadas (OSINT)",
        `Sensores y telemetría de monitoreo (${categoria})`
      ],
      iotTelemetria: `Nodo IoT #${Math.floor(1000 + Math.random() * 9000)}: Datos analizados sin anomalías estructurales.`
    };
  },

  // ---------- Noticias ----------
  // El periodista somete una noticia
  someterNoticiaPeriodista(datosNoticia) {
    const veredicto = this.analizarConIA(datosNoticia.titulo, datosNoticia.contenidoCompleto, datosNoticia.categoria);

    const nuevaNoticia = {
      id: "not_" + Date.now(),
      titulo: datosNoticia.titulo,
      categoria: datosNoticia.categoria,
      autor: datosNoticia.autor,
      autorRol: "periodista",
      autorId: datosNoticia.autorId || null,
      fecha: "Hace un momento",
      status: "pendiente_aprobacion",
      resumen: datosNoticia.resumen,
      contenidoCompleto: datosNoticia.contenidoCompleto,
      imagen: datosNoticia.imagen || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
      veredictoIA: veredicto,
      verificacionFacial: datosNoticia.verificacionFacial
        ? { ...datosNoticia.verificacionFacial, fecha: new Date().toLocaleString("es-MX") }
        : null
    };

    this.noticias.unshift(nuevaNoticia);

    // Aviso al administrador
    this.notificar({
      tipo: "noticia",
      titulo: "Nueva noticia por aprobar",
      mensaje: `${datosNoticia.autor} envió “${this._recortar(datosNoticia.titulo, 70)}”. Requiere tu aprobación.`,
      para: "admin",
      destino: "admin"
    });
    // Acuse para el periodista
    this.notificar({
      tipo: "info",
      titulo: "Noticia enviada a revisión",
      mensaje: `La IA la analizó (${veredicto.confiabilidad}% de confiabilidad) y quedó en la cola del Administrador.`,
      para: datosNoticia.autorId || "periodista",
      destino: "periodista"
    });

    return nuevaNoticia;
  },

  // El administrador aprueba una noticia
  aprobarNoticia(noticiaId) {
    const noti = this.noticias.find(n => n.id === noticiaId);
    if (!noti) return false;
    noti.status = "publicada";
    noti.fecha = "Aprobada recientemente";
    const titulo = this._recortar(noti.titulo, 70);

    this.notificar({
      tipo: "ok",
      titulo: "Tu noticia fue aprobada",
      mensaje: `“${titulo}” ya está publicada y visible para todos los lectores.`,
      para: noti.autorId || "periodista",
      destino: "periodista"
    });
    this.notificar({
      tipo: "noticia",
      titulo: "Nueva noticia verificada",
      mensaje: `“${titulo}” acaba de publicarse en el portal.`,
      para: "usuario",
      destino: "portal"
    });
    return true;
  },

  // El administrador rechaza o regresa una noticia
  rechazarNoticia(noticiaId, motivo = "Requiere mayor respaldo de fuentes o telemetría IoT") {
    const noti = this.noticias.find(n => n.id === noticiaId);
    if (!noti) return false;
    noti.status = "rechazada";
    noti.motivoRechazo = motivo;
    this.notificar({
      tipo: "warning",
      titulo: "Noticia devuelta con observaciones",
      mensaje: `“${this._recortar(noti.titulo, 60)}”. Motivo: ${motivo}`,
      para: noti.autorId || "periodista",
      destino: "periodista"
    });
    return true;
  },

  // ---------- Consultas ----------
  obtenerNoticiasPublicadas(cat = "Todas", busqueda = "") {
    return this.noticias.filter(n => {
      const esPublicada = n.status === "publicada";
      const coincideCat = (cat === "Todas" || n.categoria.toLowerCase() === cat.toLowerCase());
      const coincideQuery = !busqueda ||
        n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.resumen.toLowerCase().includes(busqueda.toLowerCase());
      return esPublicada && coincideCat && coincideQuery;
    });
  },

  obtenerNoticiaPorId(id) {
    return this.noticias.find(n => n.id === id);
  },

  obtenerPendientes() {
    return this.noticias.filter(n => n.status === "pendiente_aprobacion");
  },

  obtenerUsuarioPorRol(rol) {
    return this.usuarios.find(u => u.rol === rol);
  },

  // ---------- Notificaciones ----------
  notificar({ tipo = "info", titulo, mensaje, para = "todos", destino = null }) {
    const n = {
      id: "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1e4),
      tipo, titulo, mensaje, para, destino,
      ts: Date.now(),
      leidaPor: []
    };
    this.notificaciones.unshift(n);
    return n;
  },

  _esPara(n, usuario) {
    return n.para === "todos" || n.para === usuario.id || n.para === usuario.rol;
  },

  obtenerNotificaciones(usuario) {
    return this.notificaciones.filter(n => this._esPara(n, usuario));
  },

  estaLeida(n, usuario) {
    return n.leidaPor.includes(usuario.id);
  },

  contarNoLeidas(usuario) {
    return this.obtenerNotificaciones(usuario).filter(n => !this.estaLeida(n, usuario)).length;
  },

  marcarLeida(id, usuario) {
    const n = this.notificaciones.find(x => x.id === id);
    if (n && !n.leidaPor.includes(usuario.id)) n.leidaPor.push(usuario.id);
  },

  marcarTodasLeidas(usuario) {
    this.obtenerNotificaciones(usuario).forEach(n => this.marcarLeida(n.id, usuario));
  },

  _recortar(texto, max) {
    return texto.length > max ? texto.slice(0, max).trimEnd() + "…" : texto;
  },

  // ---------- Suscripción ----------
  planes: {
    premium: { nombre: "VerityNews Premium", etiqueta: "Plan premium", precio: 99, moneda: "MXN" }
  },

  // userId -> estado de la suscripción (se persiste en localStorage)
  suscripciones: {},

  _suscripcionPorDefecto() {
    return {
      plan: "premium",
      estado: "activa",                 // "activa" | "cancelacion_programada"
      vencimiento: "2026-11-15",
      ultimoCobro: "2026-10-15",
      metodoPago: "•••• 4821",
      diasAviso: 3,
      prefs: { autoRenovar: true, aviso: true, correo: true },
      ultimaActualizacion: null,
      ultimaVerificacion: Date.now(),
      avisoEnviadoPara: null
    };
  },

  obtenerSuscripcion(userId) {
    if (!this.suscripciones[userId]) this.suscripciones[userId] = this._suscripcionPorDefecto();
    return this.suscripciones[userId];
  },

  cargarSuscripciones() {
    try {
      const guardadas = JSON.parse(localStorage.getItem("verity_suscripciones") || "{}");
      Object.keys(guardadas).forEach(id => {
        this.suscripciones[id] = { ...this._suscripcionPorDefecto(), ...guardadas[id] };
        this.suscripciones[id].prefs = { ...this._suscripcionPorDefecto().prefs, ...(guardadas[id].prefs || {}) };
      });
    } catch (e) { /* sin almacenamiento disponible */ }
  },

  _persistirSuscripciones() {
    try { localStorage.setItem("verity_suscripciones", JSON.stringify(this.suscripciones)); }
    catch (e) { /* sin almacenamiento disponible */ }
  },

  // --- Fechas ---
  _fechaISO(d) {
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },

  hoyISO() { return this._fechaISO(new Date()); },

  formatearFecha(iso, largo = false) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("es-MX", largo
      ? { day: "numeric", month: "long", year: "numeric" }
      : { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "");
  },

  diasRestantes(sus) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const venc = new Date(sus.vencimiento + "T00:00:00");
    return Math.round((venc - hoy) / 86400000);
  },

  textoDias(dias) {
    if (dias < 0) return "vencida";
    if (dias === 0) return "vence hoy";
    if (dias === 1) return "falta 1 día";
    return `faltan ${dias} días`;
  },

  _sumarMes(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const sig = new Date(y, m, 1); // primer día del mes siguiente (m es 1-based)
    const ultimo = new Date(sig.getFullYear(), sig.getMonth() + 1, 0).getDate();
    sig.setDate(Math.min(d, ultimo));
    return this._fechaISO(sig);
  },

  // --- Acciones ---
  guardarPreferencias(userId, prefs) {
    const s = this.obtenerSuscripcion(userId);
    s.prefs = { ...prefs };
    s.ultimaActualizacion = Date.now();
    this._persistirSuscripciones();
    const si = v => (v ? "activada" : "desactivada");
    this.notificar({
      tipo: "suscripcion",
      titulo: "Preferencias de suscripción guardadas",
      mensaje: `Renovación automática ${si(prefs.autoRenovar)} · Aviso previo ${si(prefs.aviso)} · Correos ${prefs.correo ? "activados" : "desactivados"}.`,
      para: userId, destino: "suscripcion"
    });
  },

  renovarSuscripcion(userId) {
    const s = this.obtenerSuscripcion(userId);
    const hoy = this.hoyISO();
    const base = s.vencimiento >= hoy ? s.vencimiento : hoy;
    s.vencimiento = this._sumarMes(base);
    s.ultimoCobro = hoy;
    s.estado = "activa";
    s.avisoEnviadoPara = null;
    this._persistirSuscripciones();
    const plan = this.planes[s.plan];
    this.notificar({
      tipo: "ok",
      titulo: "Renovación registrada",
      mensaje: `Cobro de $${plan.precio} ${plan.moneda} (modo demostración). Tu nueva fecha de vencimiento es el ${this.formatearFecha(s.vencimiento, true)}.`,
      para: userId, destino: "suscripcion"
    });
    return s;
  },

  cancelarSuscripcion(userId) {
    const s = this.obtenerSuscripcion(userId);
    s.estado = "cancelacion_programada";
    s.prefs.autoRenovar = false;
    s.ultimaActualizacion = Date.now();
    this._persistirSuscripciones();
    this.notificar({
      tipo: "warning",
      titulo: "Cancelación programada",
      mensaje: `No se harán más cobros. Conservas el acceso Premium hasta el ${this.formatearFecha(s.vencimiento, true)}.`,
      para: userId, destino: "suscripcion"
    });
    return s;
  },

  reactivarSuscripcion(userId) {
    const s = this.obtenerSuscripcion(userId);
    s.estado = "activa";
    s.prefs.autoRenovar = true;
    s.ultimaActualizacion = Date.now();
    this._persistirSuscripciones();
    this.notificar({
      tipo: "ok",
      titulo: "Suscripción reactivada",
      mensaje: `La renovación automática volvió a activarse. Próxima renovación: ${this.formatearFecha(s.vencimiento, true)}.`,
      para: userId, destino: "suscripcion"
    });
    return s;
  },

  verificarSuscripcion(userId) {
    const s = this.obtenerSuscripcion(userId);
    s.ultimaVerificacion = Date.now();
    this._persistirSuscripciones();
    return s;
  },

  // Genera (una sola vez por ciclo) el aviso previo a la renovación
  sincronizarAvisosSuscripcion(usuario) {
    const s = this.obtenerSuscripcion(usuario.id);
    if (!s.prefs.aviso) return;
    const dias = this.diasRestantes(s);
    if (dias < 0 || dias > s.diasAviso || s.avisoEnviadoPara === s.vencimiento) return;

    s.avisoEnviadoPara = s.vencimiento;
    const plan = this.planes[s.plan];
    const fecha = this.formatearFecha(s.vencimiento, true);
    const cancelada = s.estado === "cancelacion_programada";
    this.notificar({
      tipo: "warning",
      titulo: cancelada ? "Tu acceso Premium está por terminar" : "Tu suscripción se renueva pronto",
      mensaje: cancelada
        ? `Tu acceso Premium termina el ${fecha} (${this.textoDias(dias)}). Puedes reactivarla desde Mi suscripción.`
        : s.prefs.autoRenovar
          ? `El ${fecha} (${this.textoDias(dias)}) se cobrarán $${plan.precio} ${plan.moneda} por tu plan ${plan.nombre}.`
          : `Tu plan vence el ${fecha} (${this.textoDias(dias)}) y la renovación automática está desactivada. Renueva manualmente para no perder el acceso.`,
      para: usuario.id, destino: "suscripcion"
    });
    this._persistirSuscripciones();
  },

  // ---------- Biometría facial ----------
  // La plantilla facial vive en el servidor Python; aquí solo se guarda el estado del registro.
  // Recupera el estado de registro facial guardado en el navegador
  cargarRostrosGuardados() {
    try {
      const guardados = JSON.parse(localStorage.getItem("verity_rostros") || "{}");
      this.usuarios.forEach(u => { if (guardados[u.email]) u.rostro = guardados[u.email]; });
    } catch (e) { /* sin almacenamiento disponible */ }
  },

  _persistirRostros() {
    try {
      const out = {};
      this.usuarios.forEach(u => { if (u.rostro) out[u.email] = u.rostro; });
      localStorage.setItem("verity_rostros", JSON.stringify(out));
    } catch (e) { /* sin almacenamiento disponible */ }
  },

  tieneRostroRegistrado(userId) {
    const u = this.usuarios.find(x => x.id === userId);
    return !!(u && u.rostro);
  },

  registrarRostro(userId, camara) {
    const u = this.usuarios.find(x => x.id === userId);
    if (!u) return false;
    u.rostro = { camara, fecha: new Date().toLocaleString("es-MX") };
    this._persistirRostros();
    return true;
  },

  olvidarRostro(userId) {
    const u = this.usuarios.find(x => x.id === userId);
    if (u) { delete u.rostro; this._persistirRostros(); }
  },

  notificarIntentoFallido(nombre, camara) {
    this.notificar({
      tipo: "error",
      titulo: "Verificación facial fallida",
      mensaje: `No se pudo confirmar la identidad de ${nombre} (${camara}). Se bloqueó el envío de una noticia.`,
      para: "admin",
      destino: "admin"
    });
  }
};
