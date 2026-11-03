/* ============================================================
   CONTROLADOR (CONTROLLER): Enlace, eventos y enrutamiento
   Conecta el Modelo con las Vistas y maneja la interacción.
   ============================================================ */
const Controller = {
  usuarioActual: null,
  vistaActual: "portal", // "portal" | "periodista" | "admin" | "suscripcion" | "notificaciones"
  filtroNotif: "todas",  // filtro de la pantalla de notificaciones

  init() {
    // Inicia con Carlos Mendoza (Lector)
    this.usuarioActual = Model.usuarios[0];

    Model.cargarRostrosGuardados();
    Model.cargarSuscripciones();
    Model.sincronizarAvisosSuscripcion(this.usuarioActual);
    this.vincularEventosGlobales();
    this.renderizarNavbar();
    this.navegar("portal");
    this.actualizarNotificacionesBadge();

    this.mostrarToast("Sistema VerityNews MVC inicializado con éxito.", "info");
  },

  vincularEventosGlobales() {
    const $ = id => document.getElementById(id);

    // Logo: regresa al portal
    $("headerLogo").onclick = () => this.navegar("portal");

    // Logout: abre el modal de login/registro
    $("btnLogout").onclick = () => {
      $("authModal").classList.remove("hidden");
    };

    // Tabs del modal de autenticación
    $("tabLoginBtn").onclick = () => {
      $("tabLoginBtn").classList.add("active");
      $("tabRegisterBtn").classList.remove("active");
      $("formLogin").classList.remove("hidden");
      $("formRegister").classList.add("hidden");
      $("authAlert").classList.add("hidden");
    };

    $("tabRegisterBtn").onclick = () => {
      $("tabRegisterBtn").classList.add("active");
      $("tabLoginBtn").classList.remove("active");
      $("formRegister").classList.remove("hidden");
      $("formLogin").classList.add("hidden");
      $("authAlert").classList.add("hidden");
    };

    // Login
    $("formLogin").onsubmit = e => {
      e.preventDefault();
      const email = $("loginEmail").value;
      const pass = $("loginPass").value;
      const user = Model.autenticar(email, pass);

      if (!user) {
        this.mostrarAuthAlert("Correo o contraseña incorrectos.", false);
        return;
      }

      this.usuarioActual = user;
      Model.sincronizarAvisosSuscripcion(user);
      $("authModal").classList.add("hidden");
      this.mostrarToast(`Qué gusto verte de nuevo, ${user.nombre}.`, "ok", "Sesión iniciada");
      this.renderizarNavbar();

      // Redirección según rol
      if (user.rol === "periodista") this.navegar("periodista");
      else if (user.rol === "admin") this.navegar("admin");
      else this.navegar("portal");
    };

    // Registro
    $("formRegister").onsubmit = e => {
      e.preventDefault();
      const nom = $("regName").value;
      const email = $("regEmail").value;
      const pass = $("regPass").value;
      const rol = $("regRole").value;

      const res = Model.registrarUsuario(nom, email, pass, rol);
      if (!res.exito) {
        this.mostrarAuthAlert(res.mensaje, false);
        return;
      }

      this.usuarioActual = res.usuario;
      $("authModal").classList.add("hidden");
      this.mostrarToast(`Cuenta creada con éxito como ${rol}. ¡Bienvenido, ${nom}!`, "ok", "Cuenta creada");
      this.renderizarNavbar();

      if (rol === "periodista") this.navegar("periodista");
      else this.navegar("portal");
    };

    // Botones de cuentas demo
    document.querySelectorAll(".demo-pill-btn").forEach(btn => {
      btn.onclick = () => {
        const u = Model.obtenerUsuarioPorRol(btn.dataset.demo);
        if (u) {
          $("loginEmail").value = u.email;
          $("loginPass").value = u.pass;
          $("tabLoginBtn").click();
        }
      };
    });

    // Campana de notificaciones: panel desplegable
    $("btnNotifications").onclick = e => {
      e.stopPropagation();
      this.alternarPanelNotif();
    };
    $("notifPanel").onclick = e => {
      e.stopPropagation();
      const item = e.target.closest("[data-notif-id]");
      if (item) return this.abrirNotificacion(item.dataset.notifId);
      if (e.target.closest("#btnMarcarTodasPanel")) {
        Model.marcarTodasLeidas(this.usuarioActual);
        this.actualizarNotificacionesBadge();
        if (this.vistaActual === "notificaciones") this.navegar("notificaciones", "", { scroll: false });
        return;
      }
      if (e.target.closest("#btnVerTodasNotif")) {
        this.alternarPanelNotif(false);
        this.navegar("notificaciones");
      }
    };
    document.addEventListener("click", e => {
      if (!e.target.closest(".notif-wrap")) this.alternarPanelNotif(false);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") this.alternarPanelNotif(false);
    });

    // Tarjeta de usuario: lleva a Mi cuenta
    $("userPill").onclick = () => this.navegar("suscripcion");

    // Cerrar modal de noticia
    $("btnCloseArticleModal").onclick = () => {
      $("articleModal").classList.add("hidden");
    };
    $("articleModal").onclick = e => {
      if (e.target === $("articleModal")) $("articleModal").classList.add("hidden");
    };
  },

  mostrarAuthAlert(msg, esOk = true) {
    const el = document.getElementById("authAlert");
    el.className = `auth-alert ${esOk ? 'auth-alert-ok' : 'auth-alert-err'}`;
    el.textContent = msg;
    el.classList.remove("hidden");
  },

  /**
   * Toast de aviso. tipo: "ok" | "error" | "warning" | "info"
   * Se cierra solo (con barra de progreso), se pausa al pasar el mouse y tiene botón de cierre.
   */
  mostrarToast(mensaje, tipo = "info", titulo = null) {
    const container = document.getElementById("toastContainer");
    const iconos = { ok: "✅", error: "🚨", warning: "⚠️", info: "🛡️" };
    const titulos = { ok: "Listo", error: "Ocurrió un problema", warning: "Atención", info: "VerityNews" };
    if (!iconos[tipo]) tipo = "info";

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.setAttribute("role", tipo === "error" ? "alert" : "status");
    toast.innerHTML = `
      <span class="toast-icon">${iconos[tipo]}</span>
      <div class="toast-body">
        <div class="toast-title"></div>
        <div class="toast-msg"></div>
      </div>
      <button type="button" class="toast-close" aria-label="Cerrar aviso">✕</button>
      <span class="toast-progress"></span>
    `;
    toast.querySelector(".toast-title").textContent = titulo || titulos[tipo];
    toast.querySelector(".toast-msg").textContent = mensaje;
    toast.style.setProperty("--toast-dur", tipo === "error" ? "7s" : "5s");

    const cerrar = () => {
      if (toast.classList.contains("saliendo")) return;
      toast.classList.add("saliendo");
      setTimeout(() => toast.remove(), 250);
    };
    toast.querySelector(".toast-close").onclick = cerrar;
    toast.querySelector(".toast-progress").addEventListener("animationend", cerrar);

    container.appendChild(toast);
    // Máximo 4 avisos a la vez: se retira el más antiguo
    const activos = container.querySelectorAll(".toast:not(.saliendo)");
    if (activos.length > 4) activos[0].querySelector(".toast-close").click();
  },

  /**
   * Diálogo de confirmación propio (reemplaza a confirm()/alert()).
   * Devuelve una promesa con true (confirmó) o false (volvió / cerró).
   */
  confirmar({ icono = "ℹ️", titulo, mensaje, confirmar = "Confirmar", volver = "Volver", peligro = false, soloAceptar = false }) {
    return new Promise(resolve => {
      const $ = id => document.getElementById(id);
      const modal = $("dialogModal");
      $("dialogIcon").textContent = icono;
      $("dialogIcon").classList.toggle("danger", peligro);
      $("dialogTitle").textContent = titulo;
      $("dialogText").textContent = mensaje;
      $("dialogConfirm").textContent = confirmar;
      $("dialogConfirm").className = `btn-ui ${peligro ? "btn-ui-danger-solid" : "btn-ui-primary"}`;
      $("dialogBack").textContent = volver;
      $("dialogBack").classList.toggle("hidden", soloAceptar);
      modal.classList.remove("hidden");
      $("dialogConfirm").focus();

      const onKey = e => { if (e.key === "Escape") cerrar(false); };
      const cerrar = resultado => {
        modal.classList.add("hidden");
        document.removeEventListener("keydown", onKey);
        resolve(resultado);
      };
      document.addEventListener("keydown", onKey);
      $("dialogConfirm").onclick = () => cerrar(true);
      $("dialogBack").onclick = () => cerrar(false);
      modal.onclick = e => { if (e.target === modal) cerrar(false); };
    });
  },

  // ---------- Notificaciones ----------
  actualizarNotificacionesBadge() {
    const badge = document.getElementById("notifBadge");
    const n = Model.contarNoLeidas(this.usuarioActual);
    badge.textContent = n > 9 ? "9+" : n;
    badge.style.display = n > 0 ? "grid" : "none";
    document.getElementById("btnNotifications")
      .setAttribute("aria-label", n > 0 ? `Notificaciones (${n} sin leer)` : "Notificaciones");
    this.renderizarPanelNotif();
  },

  renderizarPanelNotif() {
    const panel = document.getElementById("notifPanel");
    if (panel.classList.contains("hidden")) return;
    panel.innerHTML = Views.panelNotificaciones(Model, this.usuarioActual);
  },

  alternarPanelNotif(abrir) {
    const panel = document.getElementById("notifPanel");
    const campana = document.getElementById("btnNotifications");
    const mostrar = abrir === undefined ? panel.classList.contains("hidden") : abrir;
    if (mostrar === !panel.classList.contains("hidden")) return;

    if (mostrar) {
      panel.classList.remove("hidden");
      panel.innerHTML = Views.panelNotificaciones(Model, this.usuarioActual);
      // En móvil el panel es fixed: se alinea justo debajo de la campana
      panel.style.top = window.matchMedia("(max-width: 768px)").matches
        ? `${campana.getBoundingClientRect().bottom + 10}px`
        : "";
    } else {
      panel.classList.add("hidden");
    }
    campana.setAttribute("aria-expanded", String(mostrar));
  },

  puedeVerVista(vista) {
    const rol = this.usuarioActual.rol;
    if (vista === "admin") return rol === "admin";
    if (vista === "periodista") return rol === "periodista" || rol === "admin";
    return true;
  },

  abrirNotificacion(id) {
    const n = Model.notificaciones.find(x => x.id === id);
    if (!n) return;
    Model.marcarLeida(id, this.usuarioActual);
    this.alternarPanelNotif(false);
    this.actualizarNotificacionesBadge();
    if (n.destino && this.puedeVerVista(n.destino)) this.navegar(n.destino);
    else if (this.vistaActual === "notificaciones") this.navegar("notificaciones", "", { scroll: false });
  },

  renderizarNavbar() {
    const nav = document.getElementById("mainNav");
    const u = this.usuarioActual;

    // Tarjeta de usuario en el header
    document.getElementById("userAvatarChar").textContent = u.nombre.charAt(0);
    document.getElementById("userNameLabel").textContent = u.nombre;
    document.getElementById("userRoleLabel").textContent = u.rol === "admin" ? "Administrador" : u.rol;

    const links = [{ id: "portal", texto: "📰 Noticias Verificadas" }];

    if (u.rol === "periodista" || u.rol === "admin") {
      links.push({ id: "periodista", texto: "✍️ Redactar Noticia" });
    }

    if (u.rol === "admin") {
      const countPendientes = Model.obtenerPendientes().length;
      links.push({
        id: "admin",
        texto: `🛡️ Panel de Moderación ${countPendientes > 0 ? `(${countPendientes})` : ''}`
      });
    }

    links.push({ id: "suscripcion", texto: "💎 Mi Suscripción" });

    const activo = l => this.vistaActual === l.id || (l.id === "suscripcion" && this.vistaActual === "notificaciones");
    nav.innerHTML = links.map(l => `
      <a class="${activo(l) ? 'active' : ''}" data-nav="${l.id}">${l.texto}</a>
    `).join("");

    nav.querySelectorAll("a").forEach(a => {
      a.onclick = () => this.navegar(a.dataset.nav);
    });

    this.actualizarNotificacionesBadge();
  },

  navegar(vista, param = "", opciones = {}) {
    this.vistaActual = vista;
    this.alternarPanelNotif(false);
    this.renderizarNavbar();
    const main = document.getElementById("appView");

    if (vista === "portal") {
      main.innerHTML = Views.portalNoticias(Model, param);
      this.vincularEventosPortal();
    } else if (vista === "periodista") {
      main.innerHTML = Views.panelPeriodista(Model, this.usuarioActual);
      this.vincularEventosPeriodista();
    } else if (vista === "admin") {
      main.innerHTML = Views.panelAdmin(Model, this.usuarioActual);
      this.vincularEventosAdmin();
    } else if (vista === "suscripcion" || vista === "notificaciones") {
      main.innerHTML = Views.cuenta(Model, this.usuarioActual, vista, { filtro: this.filtroNotif });
      this.vincularEventosCuenta(vista);
    }

    if (opciones.scroll !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ---------- Eventos: Portal ----------
  vincularEventosPortal() {
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.onclick = () => {
        Model.categoriaActiva = btn.dataset.cat;
        this.navegar("portal");
      };
    });

    const resetBtn = document.getElementById("btnResetFilter");
    if (resetBtn) {
      resetBtn.onclick = () => {
        Model.categoriaActiva = "Todas";
        this.navegar("portal");
      };
    }

    const input = document.getElementById("searchInput");
    const btnSearch = document.getElementById("btnSearch");
    if (btnSearch && input) {
      const runSearch = () => this.navegar("portal", input.value.trim());
      btnSearch.onclick = runSearch;
      input.onkeydown = e => { if (e.key === "Enter") runSearch(); };
    }

    document.querySelectorAll("[data-read-id]").forEach(btn => {
      btn.onclick = () => {
        const noti = Model.obtenerNoticiaPorId(btn.dataset.readId);
        if (noti) {
          const modalData = Views.modalNoticiaCompleta(noti);
          document.getElementById("modalHeroImgWrap").innerHTML = modalData.hero;
          document.getElementById("modalContentBody").innerHTML = modalData.body;
          document.getElementById("articleModal").classList.remove("hidden");
        }
      };
    });
  },

  // ---------- Eventos: Periodista ----------
  vincularEventosPeriodista() {
    const form = document.getElementById("formNuevaNoticia");
    if (!form) return;

    // Registrar / actualizar rostro desde el panel
    const btnRostro = document.getElementById("btnRegistrarRostro");
    if (btnRostro) {
      btnRostro.onclick = async () => {
        const u = this.usuarioActual;
        if (Model.tieneRostroRegistrado(u.id)) {
          // Para cambiar la plantilla primero hay que demostrar que eres tú
          const ver = await this.escanearRostro("verificacion");
          if (!ver) {
            this.mostrarToast("No se confirmó tu identidad, así que el rostro no se actualizó.", "warning", "Verificación no completada");
            return;
          }
        }
        const reg = await this.escanearRostro("registro");
        if (reg) {
          this.mostrarToast("Tu plantilla facial se guardó correctamente.", "ok", "Rostro registrado");
          this.navegar("periodista");
        }
      };
    }

    form.onsubmit = async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const datos = {
        titulo: document.getElementById("newsTitle").value,
        categoria: document.getElementById("newsCategory").value,
        resumen: document.getElementById("newsSummary").value,
        contenidoCompleto: document.getElementById("newsContent").value,
        imagen: document.getElementById("newsImageUrl").value,
        autor: this.usuarioActual.nombre,
        autorId: this.usuarioActual.id
      };

      btn.disabled = true;
      try {
        // Sin rostro registrado: se registra primero. Con rostro: se verifica.
        const modo = Model.tieneRostroRegistrado(this.usuarioActual.id) ? "verificacion" : "registro";
        const resultado = await this.escanearRostro(modo);

        if (!resultado) {
          this.mostrarToast("No se completó la verificación facial, por eso la noticia no se envió.", "error", "Envío cancelado");
          return;
        }

        const nueva = Model.someterNoticiaPeriodista({ ...datos, verificacionFacial: resultado });
        this.mostrarToast(`Identidad confirmada y noticia analizada por IA (${nueva.veredictoIA.confiabilidad}% de veracidad). Se notificó al Administrador.`, "ok", "Noticia enviada");
        this.actualizarNotificacionesBadge();
        this.navegar("periodista");
      } finally {
        btn.disabled = false;
      }
    };
  },

  // ---------- Eventos: Admin ----------
  vincularEventosAdmin() {
    document.querySelectorAll("[data-approve-id]").forEach(btn => {
      btn.onclick = () => {
        if (Model.aprobarNoticia(btn.dataset.approveId)) {
          this.mostrarToast("Ya está en vivo para todos los usuarios y se avisó al periodista.", "ok", "Noticia aprobada");
          this.navegar("admin");
        }
      };
    });

    document.querySelectorAll("[data-reject-id]").forEach(btn => {
      btn.onclick = () => {
        const motivo = prompt("Motivo para regresar la noticia al periodista:", "Faltan fuentes cotejadas o validación de sensores IoT.");
        if (motivo) {
          Model.rechazarNoticia(btn.dataset.rejectId, motivo);
          this.mostrarToast("El periodista recibió tus observaciones.", "warning", "Noticia devuelta");
          this.navegar("admin");
        }
      };
    });
  },

  // ---------- Eventos: Mi cuenta ----------
  vincularEventosCuenta(seccion) {
    document.querySelectorAll("[data-acc]").forEach(b => {
      b.onclick = () => this.navegar(b.dataset.acc);
    });
    document.getElementById("btnAccLogout").onclick = () => {
      document.getElementById("authModal").classList.remove("hidden");
    };
    if (seccion === "suscripcion") this.vincularEventosSuscripcion();
    else this.vincularEventosNotificaciones();
  },

  vincularEventosNotificaciones() {
    const u = this.usuarioActual;
    document.querySelectorAll("[data-filtro]").forEach(b => {
      b.onclick = () => {
        this.filtroNotif = b.dataset.filtro;
        this.navegar("notificaciones", "", { scroll: false });
      };
    });
    const todas = document.getElementById("btnMarcarTodasPagina");
    if (todas) {
      todas.onclick = () => {
        Model.marcarTodasLeidas(u);
        this.actualizarNotificacionesBadge();
        this.navegar("notificaciones", "", { scroll: false });
        this.mostrarToast("Todas tus notificaciones se marcaron como leídas.", "ok");
      };
    }
    document.querySelectorAll("#appView [data-notif-id]").forEach(b => {
      b.onclick = () => this.abrirNotificacion(b.dataset.notifId);
    });
  },

  vincularEventosSuscripcion() {
    const $ = id => document.getElementById(id);
    const u = this.usuarioActual;
    const sub = () => Model.obtenerSuscripcion(u.id);
    const plan = () => Model.planes[sub().plan];
    const refrescar = () => {
      this.actualizarNotificacionesBadge();
      this.navegar("suscripcion", "", { scroll: false });
    };
    const leer = () => ({
      autoRenovar: $("subAutoRenew").checked,
      aviso: $("subReminder").checked,
      correo: $("subEmail").checked
    });

    // Etiquetas en vivo + detección de cambios sin guardar
    const sincronizar = () => {
      const p = leer(), s = sub();
      $("subAutoLabel").textContent = p.autoRenovar ? "Activada" : "Desactivada";
      $("subReminderLabel").textContent = p.aviso ? `Aviso ${s.diasAviso} días antes` : "Aviso desactivado";
      $("subEmailLabel").textContent = p.correo ? "Activadas" : "Desactivadas";

      const sucio = p.autoRenovar !== s.prefs.autoRenovar || p.aviso !== s.prefs.aviso || p.correo !== s.prefs.correo;
      const hint = $("subDirtyHint");
      hint.classList.toggle("dirty", sucio);
      hint.textContent = sucio ? "● Cambios sin guardar" : Views.textoUltimaActualizacion(s);
      $("btnGuardarPrefs").disabled = !sucio;
      $("btnRestablecerPrefs").disabled = !sucio;
    };
    ["subAutoRenew", "subReminder", "subEmail"].forEach(id => { $(id).onchange = sincronizar; });

    $("btnGuardarPrefs").onclick = () => {
      Model.guardarPreferencias(u.id, leer());
      Model.sincronizarAvisosSuscripcion(u);
      this.mostrarToast("Tus preferencias de renovación y avisos se guardaron correctamente.", "ok", "Preferencias guardadas");
      refrescar();
    };

    $("btnRestablecerPrefs").onclick = () => {
      const p = sub().prefs;
      $("subAutoRenew").checked = p.autoRenovar;
      $("subReminder").checked = p.aviso;
      $("subEmail").checked = p.correo;
      sincronizar();
      this.mostrarToast("Se restauraron las últimas preferencias guardadas.", "info");
    };

    $("btnVerificarSuscripcion").onclick = () => {
      const s = Model.verificarSuscripcion(u.id);
      $("subCheckState").textContent = "Última verificación: justo ahora";
      const fecha = Model.formatearFecha(s.vencimiento);
      this.mostrarToast(
        s.estado === "cancelacion_programada"
          ? `Tu acceso Premium sigue activo y termina el ${fecha}.`
          : `Tu suscripción está activa hasta el ${fecha}.`,
        "ok", "Verificación completada"
      );
    };

    $("btnAyudaSuscripcion").onclick = () => this.confirmar({
      icono: "ⓘ",
      titulo: "Ayuda de suscripción",
      mensaje: "Desde esta pantalla puedes cancelar o renovar tu plan, activar la renovación automática, configurar recordatorios y verificar la fecha de vencimiento.",
      confirmar: "Entendido",
      soloAceptar: true
    });

    const renovar = $("btnRenovar");
    if (renovar) {
      renovar.onclick = async () => {
        const p = plan();
        const ok = await this.confirmar({
          icono: "↻",
          titulo: "Renovar suscripción",
          mensaje: `Se iniciará la renovación del plan ${p.nombre} por $${p.precio} ${p.moneda}. Esta demostración no procesa pagos reales.`,
          confirmar: "Continuar"
        });
        if (!ok) return;
        const s = Model.renovarSuscripcion(u.id);
        Model.sincronizarAvisosSuscripcion(u);
        this.mostrarToast(`Renovación registrada (modo demostración). Nuevo vencimiento: ${Model.formatearFecha(s.vencimiento)}.`, "ok", "Suscripción renovada");
        refrescar();
      };
    }

    const cancelar = $("btnCancelarSuscripcion");
    if (cancelar) {
      cancelar.onclick = async () => {
        const fecha = Model.formatearFecha(sub().vencimiento, true);
        const ok = await this.confirmar({
          icono: "⚠️",
          titulo: "¿Cancelar suscripción?",
          mensaje: `La cancelación desactivará la renovación automática. Mantendrás el acceso Premium hasta el ${fecha}.`,
          confirmar: "Sí, cancelar",
          volver: "Mantener plan",
          peligro: true
        });
        if (!ok) return;
        Model.cancelarSuscripcion(u.id);
        this.mostrarToast("La suscripción sigue activa hasta su vencimiento y no se harán más cobros.", "warning", "Cancelación programada");
        refrescar();
      };
    }

    const reactivar = $("btnReactivar");
    if (reactivar) {
      reactivar.onclick = () => {
        Model.reactivarSuscripcion(u.id);
        this.mostrarToast("La renovación automática volvió a activarse.", "ok", "Suscripción reactivada");
        refrescar();
      };
    }
  },

  // ---------- Reconocimiento facial ----------
  // Se recuerda la última cámara elegida (deviceId) en este navegador
  cargarCamaraPreferida() {
    try { return localStorage.getItem("verity_camara_id") || ""; } catch (e) { return ""; }
  },

  guardarCamaraPreferida(id) {
    try { localStorage.setItem("verity_camara_id", id); } catch (e) { /* ignorar */ }
  },

  /**
   * Abre el modal de escaneo facial.
   * modo: "registro" | "verificacion"
   * Devuelve una promesa con { ok, similitud, camara, registro } o null si se cancela / falla.
   */
  escanearRostro(modo) {
    return new Promise(resolve => {
      const $ = id => document.getElementById(id);
      const modal = $("faceModal");
      const MAX_INTENTOS = 3;
      const MUESTRAS_REGISTRO = 3;
      let intentos = 0;
      let camaraLista = false;
      let ocupado = false;
      let cerrado = false;
      let camaras = [];

      modal.innerHTML = Views.modalEscaneoFacial(modo);
      modal.classList.remove("hidden");

      const setEstado = (msg, tipo = "info") => {
        if (cerrado) return;
        const el = $("faceStatus");
        el.className = `face-status face-status-${tipo}`;
        el.textContent = msg;
      };
      const refrescarBoton = () => {
        if (cerrado) return;
        $("btnEscanearRostro").disabled = !camaraLista || ocupado;
      };
      let dejarDeEscuchar = () => {};
      const cerrar = resultado => {
        if (cerrado) return;
        cerrado = true;
        dejarDeEscuchar();
        CameraService.detener();
        modal.classList.add("hidden");
        modal.innerHTML = "";
        resolve(resultado);
      };

      // Llena el selector con las cámaras detectadas (integrada, USB, etc.)
      const llenarCamaras = async () => {
        try {
          camaras = await CameraService.listar();
        } catch (err) {
          setEstado(err.message, "error");
          return;
        }
        if (cerrado) return;
        const sel = $("faceSource");
        if (!camaras.length) {
          sel.innerHTML = '<option value="">No se detectó ninguna cámara</option>';
          setEstado("No se detectó ninguna cámara. Conecta una y se actualizará sola.", "error");
          return;
        }
        const previa = sel.value || this.cargarCamaraPreferida();
        sel.innerHTML = camaras
          .map(c => `<option value="${c.deviceId}">📷 ${c.label.replace(/</g, "&lt;")}</option>`)
          .join("");
        if (camaras.some(c => c.deviceId === previa)) sel.value = previa;
        if (!camaraLista) setEstado("Elige tu cámara y presiona «Conectar».");
      };

      $("btnCancelarFace").onclick = () => cerrar(null);
      $("btnCerrarFace").onclick = () => cerrar(null);
      dejarDeEscuchar = CameraService.alCambiarDispositivos(llenarCamaras);

      // 1) Servidor de IA + lista de cámaras
      setEstado("Comprobando servidor de reconocimiento facial…");
      FaceService.disponible().then(ok => {
        if (cerrado) return;
        if (!ok) {
          setEstado("El servidor de IA no responde. Ejecuta backend/server.py y abre http://localhost:5000", "error");
          return;
        }
        llenarCamaras();
      });

      // 2) Conectar la cámara elegida
      $("btnConectarCamara").onclick = async () => {
        const deviceId = $("faceSource").value;
        if (!deviceId) {
          setEstado("Selecciona una cámara de la lista.", "error");
          return;
        }
        const cam = camaras.find(c => c.deviceId === deviceId);
        this.guardarCamaraPreferida(deviceId);

        camaraLista = false;
        refrescarBoton();
        setEstado("Conectando con la cámara…");
        try {
          await CameraService.iniciar($("faceCanvas"), deviceId, cam ? cam.label : "Cámara");
          if (cerrado) { CameraService.detener(); return; }
          camaraLista = true;
          $("facePlaceholder").classList.add("hidden");
          refrescarBoton();
          setEstado("Cámara conectada. Colócate frente a la lente y presiona el botón.");
        } catch (err) {
          $("facePlaceholder").classList.remove("hidden");
          setEstado(err.message, "error");
        }
      };

      // 3) Escanear y enviar a la IA (Python)
      $("btnEscanearRostro").onclick = async () => {
        if (ocupado) return;
        ocupado = true;
        refrescarBoton();
        $("faceScanLine").classList.remove("hidden");
        setEstado("Analizando rostro… mantente quieto frente a la cámara.");

        const camara = CameraService.etiqueta();
        let r;
        try {
          if (modo === "registro") {
            const fotos = [];
            for (let i = 0; i < MUESTRAS_REGISTRO; i++) {
              fotos.push(CameraService.capturar());
              if (i < MUESTRAS_REGISTRO - 1) await new Promise(res => setTimeout(res, 500));
            }
            r = await FaceService.registrar(this.usuarioActual.id, fotos);
          } else {
            r = await FaceService.verificar(this.usuarioActual.id, CameraService.capturar());
          }
        } catch (err) {
          r = { ok: false, error: "servidor", mensaje: err.message };
        }
        if (cerrado) return;
        $("faceScanLine").classList.add("hidden");
        ocupado = false;

        if (!r.ok) {
          const msgs = {
            sin_rostro: "No se detectó ningún rostro. Mejora la iluminación y acércate a la cámara.",
            multiples: "Se detectó más de un rostro. Debe aparecer solo el periodista.",
            muestras_inconsistentes: "Las capturas no parecen de la misma persona. Intenta de nuevo con un solo rostro.",
            imagen_invalida: "La imagen de la cámara no es válida. Reconecta la cámara.",
            servidor: r.mensaje
          };
          if (r.error === "sin_registro") {
            // La plantilla ya no existe en el servidor: hay que volver a registrar
            Model.olvidarRostro(this.usuarioActual.id);
            setEstado("Tu plantilla facial no existe en el servidor. Vuelve a enviar para registrarla de nuevo.", "error");
            setTimeout(() => cerrar(null), 1800);
            return;
          }
          setEstado(msgs[r.error] || "Error durante el análisis facial.", "error");
          refrescarBoton();
          return;
        }

        if (modo === "registro") {
          Model.registrarRostro(this.usuarioActual.id, camara);
          ocupado = true;
          refrescarBoton();
          setEstado("✔ Rostro registrado correctamente.", "ok");
          setTimeout(() => cerrar({ ok: true, similitud: 1, camara, registro: true }), 900);
          return;
        }

        if (r.coincide) {
          ocupado = true;
          refrescarBoton();
          setEstado(`✔ Identidad confirmada (similitud ${r.similitud.toFixed(2)}).`, "ok");
          setTimeout(() => cerrar({ ok: true, similitud: r.similitud, camara, registro: false }), 900);
          return;
        }

        intentos++;
        if (intentos >= MAX_INTENTOS) {
          ocupado = true;
          refrescarBoton();
          setEstado("✘ Verificación fallida. Se agotaron los intentos.", "error");
          Model.notificarIntentoFallido(this.usuarioActual.nombre, camara);
          this.actualizarNotificacionesBadge();
          setTimeout(() => cerrar(null), 1400);
        } else {
          setEstado(`✘ El rostro no coincide (similitud ${r.similitud.toFixed(2)}). Intento ${intentos} de ${MAX_INTENTOS}.`, "error");
          refrescarBoton();
        }
      };
    });
  }
};
