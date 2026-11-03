/* ============================================================
   VISTAS (VIEWS): Templates y generación de HTML
   Solo reciben datos y devuelven HTML. No modifican el Modelo.
   ============================================================ */
const Views = {
  // 1. Portal de noticias (accesible a todos)
  portalNoticias(model, busqueda = "") {
    const noticias = model.obtenerNoticiasPublicadas(model.categoriaActiva, busqueda);

    return `
      <!-- Hero Principal -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-tag">
            <span>🤖 IA Neural</span> • <span>📡 Sensores IoT Activos</span> • <span>🛡️ Cero Fake News</span>
          </div>
          <h1>Noticias de Alta Confiabilidad Respaldadas por Datos</h1>
          <p>Cada artículo es analizado por inteligencia artificial y cruzado con telemetría en tiempo real para garantizar información verídica e inalterable.</p>

          <div class="hero-search-bar">
            <input type="text" id="searchInput" placeholder="Buscar tecnología, cultura, deportes o telemetría..." value="${busqueda}">
            <button type="button" id="btnSearch">Buscar</button>
          </div>
        </div>
      </section>

      <!-- Filtros de Temas / Categorías -->
      <section class="filter-section">
        <div class="filter-header">
          <div class="filter-title">
            <span>📂 Explora por Temas</span>
            <span class="badge badge-primary">${noticias.length} publicadas</span>
          </div>
          ${model.categoriaActiva !== "Todas" ? `<button id="btnResetFilter" style="border:0;background:transparent;color:var(--blue-600);font-weight:700;font-size:0.85rem;cursor:pointer;">Ver Todas ✕</button>` : ''}
        </div>

        <div class="category-pills-row">
          ${model.categorias.map(cat => `
            <button class="category-btn ${model.categoriaActiva === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat === 'Todas' ? '🌐' : cat === 'Tecnología' ? '💻' : cat === 'Cultura' ? '🏛️' : cat === 'Deportes' ? '⚽' : cat === 'Economía' ? '📈' : cat === 'Medio Ambiente' ? '🍃' : '🩺'}
              ${cat}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Grilla de Noticias -->
      <section>
        ${noticias.length === 0 ? `
          <div style="background:#fff;border:1px dashed var(--border);border-radius:16px;padding:3rem;text-align:center;">
            <span style="font-size:2.5rem;">🔍</span>
            <h3 style="margin-top:0.8rem;color:var(--navy-900);">No se encontraron noticias en esta categoría</h3>
            <p style="color:var(--txt-muted);font-size:0.9rem;margin-top:0.3rem;">Prueba seleccionando "Todas" o redacta una noticia desde el perfil de periodista.</p>
          </div>
        ` : `
          <div class="news-grid">
            ${noticias.map(item => `
              <article class="news-card">
                <div class="news-card-img-wrap">
                  <img src="${item.imagen}" alt="${item.titulo}" loading="lazy">
                  <span class="badge badge-primary news-card-category">${item.categoria}</span>
                  <div class="news-card-verity-badge">
                    <span class="verity-score-indicator ${item.veredictoIA.confiabilidad >= 90 ? 'score-green' : 'score-yellow'}"></span>
                    IA: ${item.veredictoIA.confiabilidad}% Confiable
                  </div>
                </div>

                <div class="news-card-body">
                  <div class="news-card-meta">
                    <span>🕒 ${item.fecha}</span>
                    <span>•</span>
                    <span>✍️ ${item.autor}</span>
                  </div>

                  <h2 class="news-card-title">${item.titulo}</h2>
                  <p class="news-card-desc">${item.resumen}</p>

                  <!-- Veredicto de Inteligencia Artificial -->
                  <div class="ai-verdict-box">
                    <div class="ai-verdict-header">
                      <span>🤖 Análisis de Veracidad IA:</span>
                      <span class="badge ${item.veredictoIA.esVerdadera ? 'badge-ok' : 'badge-danger'}">
                        ${item.veredictoIA.esVerdadera ? '✔ Verdadera' : '✘ En duda'}
                      </span>
                    </div>
                    <p class="ai-verdict-text">${item.veredictoIA.resumenIA}</p>
                    <div class="iot-telemetry-tag">
                      <span>📡</span> ${item.veredictoIA.iotTelemetria}
                    </div>
                  </div>

                  <div class="news-card-footer">
                    <div class="author-info">
                      <div class="author-avatar">${item.autor.charAt(0)}</div>
                      <span class="author-name">${item.autor}</span>
                    </div>
                    <button class="btn-read-more" data-read-id="${item.id}">Leer Noticia Completa →</button>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        `}
      </section>
    `;
  },

  // 2. Sala de redacción para periodista
  panelPeriodista(model, usuario) {
    const misNoticias = model.noticias.filter(n => n.autor === usuario.nombre || n.autorRol === 'periodista');
    const pendientes = misNoticias.filter(n => n.status === 'pendiente_aprobacion');
    const aprobadas = misNoticias.filter(n => n.status === 'publicada');
    const tieneRostro = model.tieneRostroRegistrado(usuario.id);

    return `
      <div class="journalist-panel">
        <div class="panel-header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
            <div>
              <h2 class="panel-title">✍️ Sala de Redacción Periodística</h2>
              <p class="panel-subtitle">Bienvenido, <strong>${usuario.nombre}</strong>. Sube tus investigaciones para que el sistema de IA las certifique y el Administrador las apruebe.</p>
            </div>
            <div style="display:flex;gap:0.8rem;">
              <span class="badge badge-warning">⏳ ${pendientes.length} en espera de moderación</span>
              <span class="badge badge-ok">✅ ${aprobadas.length} publicadas en vivo</span>
            </div>
          </div>
        </div>

        <!-- Estado de la identidad facial -->
        <div class="face-status-banner ${tieneRostro ? 'ok' : 'warn'}">
          <div>
            ${tieneRostro
              ? '🙂 <strong>Rostro registrado.</strong> Se verificará con la cámara cada vez que envíes una noticia.'
              : '⚠️ <strong>Aún no registras tu rostro.</strong> Se te pedirá al enviar tu primera noticia.'}
          </div>
          <button type="button" class="btn-face-secondary" id="btnRegistrarRostro">
            ${tieneRostro ? 'Actualizar rostro' : 'Registrar rostro ahora'}
          </button>
        </div>

        <!-- Formulario de Envío de Noticia -->
        <form id="formNuevaNoticia">
          <div class="form-grid-2">
            <div class="form-group">
              <label>Título de la Noticia</label>
              <input type="text" class="form-input" id="newsTitle" placeholder="Ej: Avances en Inteligencia Artificial aplicada a..." required>
            </div>
            <div class="form-group">
              <label>Categoría / Tema de Interés</label>
              <select class="form-select" id="newsCategory" required>
                <option value="Tecnología">Tecnología</option>
                <option value="Cultura">Cultura</option>
                <option value="Deportes">Deportes</option>
                <option value="Economía">Economía</option>
                <option value="Medio Ambiente">Medio Ambiente</option>
                <option value="Salud">Salud</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Breve Resumen (Aparecerá en el portal de lectores)</label>
            <input type="text" class="form-input" id="newsSummary" placeholder="Un extracto conciso y fáctico de los hechos..." required>
          </div>

          <div class="form-group">
            <label>Contenido Completo y Desarrollo de la Noticia</label>
            <textarea class="form-input" id="newsContent" rows="6" placeholder="Describe los hechos con detalle, citando fuentes, datos de telemetría IoT e investigaciones oficiales..." required></textarea>
          </div>

          <div class="form-group">
            <label>URL de Imagen Destacada (Opcional, se asigna una representativa si se deja vacía)</label>
            <input type="url" class="form-input" id="newsImageUrl" placeholder="https://images.unsplash.com/...">
          </div>

          <!-- Vista previa de Asistencia IA -->
          <div class="ai-assistant-preview">
            <h4>🤖 Pipeline de Certificación Automático:</h4>
            <p style="font-size:0.85rem;color:var(--txt-muted);">
              Al presionar <strong>"Enviar para Aprobación"</strong>, la IA analizará la coherencia, extraerá entidades y enviará una <strong>notificación inmediata al Administrador</strong> para su revisión y publicación final.
            </p>
          </div>

          <button type="submit" class="btn-submit" style="margin-top:1.5rem;max-width:420px;">
            🔐 Verificar rostro y enviar al Administrador
          </button>
        </form>

        <!-- Historial de Envíos del Periodista -->
        <div style="margin-top:2.5rem;border-top:1px solid var(--border);padding-top:1.5rem;">
          <h3 style="font-size:1.15rem;font-weight:800;color:var(--navy-900);margin-bottom:1rem;">Tus Noticias Enviadas</h3>
          <div class="queue-table-wrap">
            <table class="queue-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tema</th>
                  <th>Confiabilidad IA</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${misNoticias.map(n => `
                  <tr>
                    <td><strong>${n.titulo}</strong></td>
                    <td><span class="badge badge-primary">${n.categoria}</span></td>
                    <td>
                      <span class="badge ${n.veredictoIA.confiabilidad >= 90 ? 'badge-ok' : 'badge-warning'}">
                        ${n.veredictoIA.confiabilidad}% Verificada
                      </span>
                    </td>
                    <td>
                      ${n.status === 'publicada' ? '<span class="badge badge-ok">✔ Aprobada por Admin</span>' :
                        n.status === 'pendiente_aprobacion' ? '<span class="badge badge-warning">⏳ En cola del Admin</span>' :
                        '<span class="badge badge-danger">✘ Devuelta con observaciones</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // 3. Panel de administrador (moderación y métricas)
  panelAdmin(model, usuario) {
    const pendientes = model.obtenerPendientes();
    const totalPublicadas = model.noticias.filter(n => n.status === 'publicada').length;
    const totalUsuarios = model.usuarios.length;

    return `
      <div>
        <div style="margin-bottom:1.5rem;">
          <h1 style="font-size:1.8rem;font-weight:800;color:var(--navy-900);">🛡️ Centro de Control y Moderación Editorial</h1>
          <p style="color:var(--txt-muted);font-size:0.9rem;">
            Sesión activa como <strong>${usuario.nombre}</strong>. Revisa las noticias enviadas por los periodistas, valida el informe de la IA y aprueba su publicación para los usuarios.
          </p>
        </div>

        <!-- Métricas Clave -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card" style="border-left: 4px solid var(--warning);">
            <div class="label">Noticias por Aprobar</div>
            <div class="value" style="color:var(--warning);">${pendientes.length}</div>
          </div>
          <div class="admin-stat-card" style="border-left: 4px solid var(--ok);">
            <div class="label">Noticias en Vivo</div>
            <div class="value" style="color:var(--ok);">${totalPublicadas}</div>
          </div>
          <div class="admin-stat-card" style="border-left: 4px solid var(--blue-600);">
            <div class="label">Usuarios Registrados</div>
            <div class="value" style="color:var(--blue-600);">${totalUsuarios}</div>
          </div>
          <div class="admin-stat-card" style="border-left: 4px solid var(--navy-800);">
            <div class="label">Sensores IoT Operativos</div>
            <div class="value">48 Nodos</div>
          </div>
        </div>

        <!-- Noticias pendientes de moderación -->
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:1.8rem;box-shadow:var(--shadow-sm);margin-bottom:2rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
            <div>
              <h2 style="font-size:1.3rem;font-weight:800;color:var(--navy-900);">
                📥 Noticias en Espera de tu Aprobación
              </h2>
              <p style="font-size:0.85rem;color:var(--txt-muted);">Al aprobar una noticia, se publicará de inmediato y estará disponible para todos los usuarios registrados.</p>
            </div>
            <span class="badge ${pendientes.length > 0 ? 'badge-warning' : 'badge-ok'}">
              ${pendientes.length} pendientes
            </span>
          </div>

          ${pendientes.length === 0 ? `
            <div style="text-align:center;padding:2.5rem;background:#f8fafc;border-radius:12px;">
              <span style="font-size:2rem;">🎉</span>
              <h4 style="margin-top:0.5rem;color:var(--navy-900);">Bandeja al día</h4>
              <p style="color:var(--txt-muted);font-size:0.85rem;">No hay noticias pendientes de revisión en este momento.</p>
            </div>
          ` : `
            <div class="queue-table-wrap">
              <table class="queue-table">
                <thead>
                  <tr>
                    <th>Noticia</th>
                    <th>Periodista</th>
                    <th>Tema</th>
                    <th>Diagnóstico IA & IoT</th>
                    <th>Identidad del autor</th>
                    <th>Acción de Moderador</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendientes.map(item => `
                    <tr>
                      <td style="max-width:320px;">
                        <strong>${item.titulo}</strong>
                        <p style="font-size:0.8rem;color:var(--txt-muted);margin-top:0.3rem;">${item.resumen}</p>
                      </td>
                      <td>
                        <div style="display:flex;align-items:center;gap:0.4rem;">
                          <div class="author-avatar">${item.autor.charAt(0)}</div>
                          <span style="font-weight:600;font-size:0.85rem;">${item.autor}</span>
                        </div>
                      </td>
                      <td><span class="badge badge-primary">${item.categoria}</span></td>
                      <td>
                        <div style="line-height:1.3;">
                          <span class="badge ${item.veredictoIA.confiabilidad >= 90 ? 'badge-ok' : 'badge-warning'}">
                            ${item.veredictoIA.confiabilidad}% Confiable
                          </span>
                          <div style="font-size:0.75rem;color:#0284c7;font-family:'JetBrains Mono',monospace;margin-top:0.3rem;">
                            ${item.veredictoIA.iotTelemetria}
                          </div>
                        </div>
                      </td>
                      <td>
                        ${item.verificacionFacial ? `
                          <span class="badge badge-ok">🙂 Rostro verificado</span>
                          <div style="font-size:0.72rem;color:var(--txt-muted);margin-top:0.3rem;line-height:1.35;">
                            ${item.verificacionFacial.registro ? 'Primer registro facial' : 'Similitud ' + item.verificacionFacial.similitud.toFixed(2)}
                            · ${item.verificacionFacial.camara}<br>${item.verificacionFacial.fecha}
                          </div>
                        ` : '<span class="badge badge-warning">Sin verificación facial</span>'}
                      </td>
                      <td>
                        <div class="action-btn-group">
                          <button class="btn-approve" data-approve-id="${item.id}">
                            ✔ Aprobar y Publicar
                          </button>
                          <button class="btn-reject" data-reject-id="${item.id}">
                            ✘ Regresar
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Noticias en vivo -->
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:1.8rem;box-shadow:var(--shadow-sm);">
          <h2 style="font-size:1.2rem;font-weight:800;color:var(--navy-900);margin-bottom:1rem;">
            📰 Noticias Publicadas en el Portal
          </h2>
          <div class="queue-table-wrap">
            <table class="queue-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tema</th>
                  <th>Autor</th>
                  <th>Certificación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${model.noticias.filter(n => n.status === 'publicada').map(n => `
                  <tr>
                    <td><strong>${n.titulo}</strong></td>
                    <td><span class="badge badge-primary">${n.categoria}</span></td>
                    <td>${n.autor}</td>
                    <td><span class="badge badge-ok">${n.veredictoIA.confiabilidad}% Verificada</span></td>
                    <td><span class="badge badge-ok">Publicada en vivo</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Modal con la noticia completa y fuentes verificadas
  modalNoticiaCompleta(noticia) {
    return {
      hero: `<img src="${noticia.imagen}" alt="${noticia.titulo}">`,
      body: `
        <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.8rem;">
          <span class="badge badge-primary">${noticia.categoria}</span>
          <span class="badge ${noticia.veredictoIA.esVerdadera ? 'badge-ok' : 'badge-danger'}">
            ${noticia.veredictoIA.esVerdadera ? '✔ Noticia Verídica Certificada' : '✘ En Revisión'}
          </span>
          <span style="font-size:0.82rem;color:var(--txt-muted);">${noticia.fecha}</span>
        </div>

        <h1>${noticia.titulo}</h1>

        <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border);">
          <div class="author-avatar" style="width:34px;height:34px;font-size:0.9rem;">${noticia.autor.charAt(0)}</div>
          <div>
            <div style="font-weight:700;font-size:0.9rem;color:var(--navy-900);">${noticia.autor}</div>
            <div style="font-size:0.75rem;color:var(--txt-muted);">${noticia.verificacionFacial ? 'Identidad confirmada por reconocimiento facial' : 'Redactor verificado en VerityNews'}</div>
          </div>
        </div>

        <p class="article-full-text">
          ${noticia.contenidoCompleto}
        </p>

        <!-- Centro de validación técnica por IA e IoT -->
        <div class="verification-hub">
          <h3>🤖 Certificación de Veracidad por Inteligencia Artificial & IoT</h3>
          <p style="font-size:0.88rem;color:#334155;margin-bottom:1rem;">
            ${noticia.veredictoIA.resumenIA}
          </p>

          <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:1rem;">
            <div style="font-weight:700;font-size:0.84rem;color:var(--navy-800);margin-bottom:0.5rem;">
              Fuentes oficiales cotejadas:
            </div>
            ${noticia.veredictoIA.fuentesVerificadas.map(f => `
              <div class="check-item">
                <span class="check-icon">✔</span>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>

          <div style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;background:var(--navy-950);color:#38bdf8;padding:0.7rem 1rem;border-radius:8px;">
            📡 ${noticia.veredictoIA.iotTelemetria}
          </div>
        </div>
      `
    };
  },

  // ---------- Utilidades de vista ----------
  esc(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  },

  tiempoRelativo(ts) {
    const seg = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (seg < 45) return "Justo ahora";
    const min = Math.round(seg / 60);
    if (min < 60) return `Hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `Hace ${h} ${h === 1 ? "hora" : "horas"}`;
    const d = Math.round(h / 24);
    if (d < 7) return `Hace ${d} ${d === 1 ? "día" : "días"}`;
    return new Date(ts).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  },

  iconoNotificacion(tipo) {
    return ({
      info: "🔔", ok: "✅", warning: "⚠️", error: "🚨", noticia: "📰", suscripcion: "💎"
    })[tipo] || "🔔";
  },

  textoUltimaActualizacion(s) {
    return s.ultimaActualizacion
      ? "Última actualización: " + this.tiempoRelativo(s.ultimaActualizacion).toLowerCase()
      : "Sin cambios pendientes";
  },

  // ---------- Notificaciones ----------
  itemNotificacion(model, n, usuario) {
    const leida = model.estaLeida(n, usuario);
    return `
      <button type="button" class="notif-item tipo-${n.tipo} ${leida ? "" : "unread"}" data-notif-id="${n.id}">
        <span class="notif-item-icon">${this.iconoNotificacion(n.tipo)}</span>
        <span class="notif-item-body">
          <span class="notif-item-title">${this.esc(n.titulo)}</span>
          <span class="notif-item-msg">${this.esc(n.mensaje)}</span>
          <span class="notif-item-time">🕒 ${this.tiempoRelativo(n.ts)}</span>
        </span>
        ${leida ? "" : '<span class="notif-dot" aria-label="Sin leer"></span>'}
      </button>
    `;
  },

  // Panel desplegable de la campana
  panelNotificaciones(model, usuario) {
    const todas = model.obtenerNotificaciones(usuario);
    const sinLeer = todas.filter(n => !model.estaLeida(n, usuario)).length;
    const visibles = todas.slice(0, 6);

    return `
      <div class="notif-panel-head">
        <div class="notif-panel-title">
          Notificaciones
          ${sinLeer ? `<span class="badge badge-primary">${sinLeer} ${sinLeer === 1 ? "nueva" : "nuevas"}</span>` : ""}
        </div>
        <button type="button" class="notif-link" id="btnMarcarTodasPanel" ${sinLeer ? "" : "disabled"}>Marcar leídas</button>
      </div>
      <div class="notif-panel-list">
        ${visibles.length === 0 ? `
          <div class="notif-empty">
            <span>🎉</span>
            <strong>Estás al día</strong>
            <p>No tienes notificaciones por ahora.</p>
          </div>
        ` : visibles.map(n => this.itemNotificacion(model, n, usuario)).join("")}
      </div>
      <button type="button" class="notif-panel-foot" id="btnVerTodasNotif">Ver todas las notificaciones →</button>
    `;
  },

  // ---------- Mi cuenta (suscripción + notificaciones) ----------
  cuenta(model, usuario, seccion, opciones = {}) {
    const sinLeer = model.contarNoLeidas(usuario);
    return `
      <div class="account-layout">
        <aside class="acc-sidebar" aria-label="Menú de cuenta">
          <div class="acc-side-title">Mi cuenta</div>
          <button type="button" class="acc-side-link ${seccion === "suscripcion" ? "active" : ""}" data-acc="suscripcion">
            <span class="ico">💎</span> Mi suscripción
          </button>
          <button type="button" class="acc-side-link ${seccion === "notificaciones" ? "active" : ""}" data-acc="notificaciones">
            <span class="ico">🔔</span> Notificaciones
            ${sinLeer ? `<span class="count">${sinLeer}</span>` : ""}
          </button>
          <div class="acc-side-sep"></div>
          <button type="button" class="acc-side-link danger" id="btnAccLogout">
            <span class="ico">↪</span> Cerrar sesión
          </button>
        </aside>

        <section class="acc-main">
          ${seccion === "suscripcion"
            ? this.seccionSuscripcion(model, usuario)
            : this.seccionNotificaciones(model, usuario, opciones.filtro || "todas")}
        </section>
      </div>
    `;
  },

  seccionNotificaciones(model, usuario, filtro) {
    const todas = model.obtenerNotificaciones(usuario);
    const sinLeer = todas.filter(n => !model.estaLeida(n, usuario));
    const lista = filtro === "sinleer" ? sinLeer : todas;

    return `
      <div class="acc-crumb">Mi cuenta &nbsp;›&nbsp; <span>Notificaciones</span></div>
      <div class="acc-pagehead">
        <div>
          <h1>Notificaciones</h1>
          <p>Avisos de tus noticias, tu suscripción y la actividad de la plataforma.</p>
        </div>
        <button type="button" class="btn-ui btn-ui-outline" id="btnMarcarTodasPagina" ${sinLeer.length ? "" : "disabled"}>
          ✓ Marcar todas como leídas
        </button>
      </div>

      <div class="category-pills-row" style="margin-bottom:1.2rem;">
        <button type="button" class="category-btn ${filtro === "todas" ? "active" : ""}" data-filtro="todas">
          📥 Todas (${todas.length})
        </button>
        <button type="button" class="category-btn ${filtro === "sinleer" ? "active" : ""}" data-filtro="sinleer">
          🔵 Sin leer (${sinLeer.length})
        </button>
      </div>

      ${lista.length === 0 ? `
        <div class="acc-card notif-empty notif-empty-page">
          <span>${filtro === "sinleer" ? "🎉" : "📭"}</span>
          <strong>${filtro === "sinleer" ? "Estás al día" : "Aún no tienes notificaciones"}</strong>
          <p>${filtro === "sinleer" ? "No tienes notificaciones sin leer." : "Cuando haya novedades aparecerán aquí."}</p>
        </div>
      ` : `
        <div class="acc-card notif-list-card">
          ${lista.map(n => this.itemNotificacion(model, n, usuario)).join("")}
        </div>
      `}
    `;
  },

  // ---------- Gestión de suscripción ----------
  seccionSuscripcion(model, usuario) {
    const s = model.obtenerSuscripcion(usuario.id);
    const plan = model.planes[s.plan];
    const cancelada = s.estado === "cancelacion_programada";
    const dias = model.diasRestantes(s);
    const venc = model.formatearFecha(s.vencimiento);
    const vencLargo = model.formatearFecha(s.vencimiento, true);
    const textoDias = model.textoDias(dias);

    // Banner informativo
    let aviso;
    if (cancelada) {
      aviso = {
        warn: true, icono: "⏳",
        titulo: `Tu suscripción terminará el ${vencLargo}`,
        texto: `Conservarás el acceso Premium hasta esa fecha${dias >= 0 ? ` (${textoDias})` : ""}. Puedes reactivarla cuando quieras.`
      };
    } else if (dias < 0) {
      aviso = {
        warn: true, icono: "⚠️",
        titulo: "Tu renovación está pendiente",
        texto: `La fecha de renovación (${vencLargo}) ya pasó. Renueva ahora para mantener tu acceso Premium.`
      };
    } else {
      aviso = {
        warn: dias <= s.diasAviso, icono: "🔔",
        titulo: `Tu próxima renovación está programada para el ${vencLargo}`,
        texto: [
          s.prefs.aviso
            ? `Te avisaremos ${s.diasAviso} días antes de realizar el cobro.`
            : "Los avisos previos están desactivados; actívalos abajo para recibir un recordatorio.",
          s.prefs.autoRenovar ? "" : "Con la renovación automática desactivada deberás renovar manualmente.",
          `${textoDias.charAt(0).toUpperCase() + textoDias.slice(1)}.`
        ].filter(Boolean).join(" ")
      };
    }

    const proximoCobro = cancelada || !s.prefs.autoRenovar
      ? "Sin cobro programado"
      : `$${plan.precio}.00 ${plan.moneda}`;

    const interruptor = (id, marcado, deshabilitado = false) => `
      <label class="switch">
        <input type="checkbox" id="${id}" ${marcado ? "checked" : ""} ${deshabilitado ? "disabled" : ""}>
        <span class="slider"></span>
      </label>`;

    return `
      <div class="acc-crumb">Mi cuenta &nbsp;›&nbsp; <span>Mi suscripción</span></div>
      <div class="acc-pagehead">
        <div>
          <h1>Gestión de suscripción</h1>
          <p>Consulta tu plan, administra la renovación automática y configura los avisos de vencimiento.</p>
        </div>
        <button type="button" class="btn-ui btn-ui-outline" id="btnAyudaSuscripcion">ⓘ Ayuda</button>
      </div>

      <div class="acc-grid-top">
        <section class="acc-card">
          <h3 class="acc-card-title">
            Tu plan actual
            <span class="badge ${cancelada ? "badge-warning" : "badge-ok"}">
              ${cancelada ? "● Cancelación programada" : "● Activa"}
            </span>
          </h3>
          <div class="plan-card">
            <div class="plan-label">${plan.etiqueta}</div>
            <h2>${plan.nombre}</h2>
            <div class="plan-price"><strong>$${plan.precio}</strong> ${plan.moneda} / mes</div>
            <div class="plan-bottom">
              <div>
                <small>${cancelada ? "Acceso hasta" : "Próxima renovación"}</small>
                <strong>${venc}</strong>
              </div>
              <div>
                <small>Método de pago</small>
                <strong>${this.esc(s.metodoPago)}</strong>
              </div>
            </div>
          </div>
          <div class="acc-actions">
            ${cancelada
              ? `<button type="button" class="btn-ui btn-ui-primary" id="btnReactivar">↻ Reactivar suscripción</button>`
              : `<button type="button" class="btn-ui btn-ui-primary" id="btnRenovar">↻ Renovar ahora</button>
                 <button type="button" class="btn-ui btn-ui-danger" id="btnCancelarSuscripcion">Cancelar suscripción</button>`}
          </div>
          ${cancelada ? "" : '<p class="acc-footnote">Si cancelas, conservarás el acceso Premium hasta el final del periodo pagado.</p>'}
        </section>

        <section class="acc-card">
          <h3 class="acc-card-title">Resumen de facturación</h3>
          <div class="info-list">
            <div class="info-row"><span>Estado del pago</span><strong class="ok">● Pagado</strong></div>
            <div class="info-row"><span>Último cobro</span><strong>${model.formatearFecha(s.ultimoCobro)}</strong></div>
            <div class="info-row"><span>Fecha de vencimiento</span><strong>${venc}</strong></div>
            <div class="info-row"><span>Renovación automática</span><strong>${s.prefs.autoRenovar ? "Activada" : "Desactivada"}</strong></div>
            <div class="info-row"><span>Próximo cobro</span><strong>${proximoCobro}</strong></div>
          </div>
        </section>
      </div>

      <div class="notice-banner ${aviso.warn ? "warn" : ""}" role="status">
        <div class="notice-banner-icon">${aviso.icono}</div>
        <div>
          <strong>${aviso.titulo}</strong>
          <p>${aviso.texto}</p>
        </div>
      </div>

      <section class="acc-card">
        <div class="acc-sectionhead">
          <h3>Preferencias de renovación</h3>
          <span id="subDirtyHint">${this.textoUltimaActualizacion(s)}</span>
        </div>

        <div class="settings-grid">
          <div class="setting">
            <div class="setting-icon">↻</div>
            <div>
              <h4>Renovación automática</h4>
              <p>Renueva tu plan al terminar cada periodo para no perder el acceso a contenido Premium.</p>
              <div class="setting-control">
                ${interruptor("subAutoRenew", s.prefs.autoRenovar, cancelada)}
                <span id="subAutoLabel">${s.prefs.autoRenovar ? "Activada" : "Desactivada"}</span>
              </div>
              ${cancelada ? '<div class="setting-hint">Reactiva tu suscripción para volver a activar la renovación automática.</div>' : ""}
            </div>
          </div>

          <div class="setting">
            <div class="setting-icon">🔔</div>
            <div>
              <h4>Aviso previo a la renovación</h4>
              <p>Recibe un recordatorio antes de la fecha de cobro de tu suscripción.</p>
              <div class="setting-control">
                ${interruptor("subReminder", s.prefs.aviso)}
                <span id="subReminderLabel">${s.prefs.aviso ? `Aviso ${s.diasAviso} días antes` : "Aviso desactivado"}</span>
              </div>
            </div>
          </div>

          <div class="setting">
            <div class="setting-icon">✉️</div>
            <div>
              <h4>Notificaciones por correo</h4>
              <p>Recibe confirmaciones de pago, cambios de plan y avisos importantes.</p>
              <div class="setting-control">
                ${interruptor("subEmail", s.prefs.correo)}
                <span id="subEmailLabel">${s.prefs.correo ? "Activadas" : "Desactivadas"}</span>
              </div>
            </div>
          </div>

          <div class="setting">
            <div class="setting-icon">🕒</div>
            <div>
              <h4>Verificación de vencimiento</h4>
              <p>Consulta el estado de tu suscripción y comprueba la próxima fecha de vencimiento.</p>
              <div class="setting-control">
                <span id="subCheckState">Última verificación: ${this.tiempoRelativo(s.ultimaVerificacion).toLowerCase()}</span>
              </div>
              <button type="button" class="btn-ui btn-ui-outline" id="btnVerificarSuscripcion" style="margin-top:.8rem;">Verificar ahora</button>
            </div>
          </div>
        </div>

        <div class="acc-actions">
          <button type="button" class="btn-ui btn-ui-primary" id="btnGuardarPrefs" disabled>Guardar preferencias</button>
          <button type="button" class="btn-ui btn-ui-outline" id="btnRestablecerPrefs" disabled>Restablecer</button>
        </div>
      </section>
    `;
  },

  // 5. Modal de escaneo facial (registro o verificación)
  modalEscaneoFacial(modo) {
    const esRegistro = modo === 'registro';
    return `
      <div class="face-modal">
        <button class="article-modal-close" id="btnCerrarFace" type="button">✕</button>
        <div class="face-modal-body">
          <h2 class="face-title">${esRegistro ? '🙂 Registro facial del periodista' : '🔐 Verificación facial'}</h2>
          <p class="face-subtitle">
            ${esRegistro
              ? 'Mira a la cámara. Se tomarán 3 capturas para guardar tu plantilla facial.'
              : 'Mira a la cámara para confirmar que eres tú antes de enviar la noticia.'}
          </p>

          <div class="face-source-row">
            <select class="form-select" id="faceSource" aria-label="Cámara">
              <option value="">Buscando cámaras…</option>
            </select>
            <button type="button" class="btn-face-secondary" id="btnConectarCamara">Conectar</button>
          </div>

          <div class="face-preview">
            <canvas id="faceCanvas" width="640" height="480"></canvas>
            <div class="face-preview-placeholder" id="facePlaceholder">📷 Cámara desconectada</div>
            <div class="face-scan-line hidden" id="faceScanLine"></div>
          </div>

          <div class="face-status face-status-info" id="faceStatus">Preparando...</div>

          <div class="face-actions">
            <button type="button" class="btn-submit" id="btnEscanearRostro" disabled style="margin-top:0;">
              🔍 ${esRegistro ? 'Registrar mi rostro' : 'Escanear y verificar'}
            </button>
            <button type="button" class="btn-face-cancel" id="btnCancelarFace">Cancelar</button>
          </div>

          <p class="face-privacy">
            🔒 Tu rostro es un dato personal sensible. Solo se guarda una plantilla numérica (no la foto) y únicamente para verificar tu identidad como autor.
          </p>
        </div>
      </div>
    `;
  }
};
