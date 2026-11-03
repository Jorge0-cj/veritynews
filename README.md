# VerityNews – Reconocimiento facial con Python

## Cómo ejecutarlo
```bash
cd backend
pip install -r requirements.txt
python server.py
```
Abre **http://localhost:5000** (no abras index.html con doble clic: la cámara requiere localhost o HTTPS).

La primera vez, el servidor descarga solos los modelos de OpenCV (YuNet ≈ 0.2 MB y SFace ≈ 37 MB) a `backend/models/`.
Si no hay internet, descárgalos manualmente desde https://github.com/opencv/opencv_zoo
(`face_detection_yunet_2023mar.onnx` y `face_recognition_sface_2021dec.onnx`) y colócalos en esa carpeta.

## Cómo funciona
- **Navegador:** lista las cámaras (integrada, USB, virtuales), muestra la elegida y envía fotogramas JPEG al servidor.
- **Python (Flask + OpenCV):** YuNet detecta el rostro, SFace genera el embedding y se compara por similitud coseno (umbral 0.363).
- Solo se guarda el embedding numérico en `backend/data/faces.json`, nunca la foto.
- Registro: 3 capturas. Verificación: hasta 3 intentos antes de bloquear el envío y alertar al admin.

## Suscripción y notificaciones (integrado)
- **Mi Suscripción** (menú superior o clic en tu usuario): plan actual, resumen de facturación, renovar / cancelar / reactivar, renovación automática, aviso previo, correos y verificación de vencimiento. Los pagos son simulados (modo demostración) y el estado se guarda en `localStorage`.
- **Notificaciones**: la campana abre un panel con los últimos avisos (sin leer resaltadas, clic para ir a la pantalla relacionada). "Ver todas" abre la bandeja completa con filtro Todas / Sin leer.
- Cada rol recibe solo lo suyo: el admin las noticias por aprobar y alertas faciales; el periodista, la aprobación o devolución de sus noticias; el lector, las noticias nuevas y los avisos de su suscripción.
- Los avisos emergentes (toasts) tienen tipo (éxito, error, atención, info), barra de progreso, botón de cierre y se pausan al pasar el mouse.
- Los textos de confirmación usan un diálogo propio en lugar de `confirm()`.
