"""
VerityNews - Backend de reconocimiento facial (Python)

  Detección:      YuNet   (cv2.FaceDetectorYN)
  Reconocimiento: SFace   (cv2.FaceRecognizerSF) -> embedding de 128 valores

Endpoints:
  GET    /api/face/status/<user_id>   ¿tiene rostro registrado?
  POST   /api/face/enroll             {user_id, images:[dataURL,...]}  registra plantilla
  POST   /api/face/verify             {user_id, image:dataURL}         verifica identidad
  DELETE /api/face/<user_id>          borra la plantilla

También sirve el frontend (carpeta padre) en http://localhost:5000
Solo se guarda el embedding numérico, nunca la foto.
"""
import base64
import json
import os
import threading
import urllib.request

import cv2
import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE = os.path.dirname(os.path.abspath(__file__))
FRONT = os.path.abspath(os.path.join(BASE, ".."))
MODELS = os.path.join(BASE, "models")
DATA = os.path.join(BASE, "data", "faces.json")

DET_PATH = os.path.join(MODELS, "face_detection_yunet_2023mar.onnx")
REC_PATH = os.path.join(MODELS, "face_recognition_sface_2021dec.onnx")
DET_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
REC_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

# Similitud coseno mínima para aceptar que es la misma persona (valor oficial de SFace: 0.363)
UMBRAL_COSENO = 0.363
MAX_BYTES = 6 * 1024 * 1024

app = Flask(__name__, static_folder=None)
CORS(app)
_lock = threading.Lock()  # los modelos de OpenCV no son thread-safe


def descargar_modelos():
    os.makedirs(MODELS, exist_ok=True)
    for ruta, url in ((DET_PATH, DET_URL), (REC_PATH, REC_URL)):
        if not os.path.exists(ruta):
            print(f"Descargando {os.path.basename(ruta)} ...")
            urllib.request.urlretrieve(url, ruta)


descargar_modelos()
detector = cv2.FaceDetectorYN.create(DET_PATH, "", (320, 320), 0.8, 0.3, 5000)
reconocedor = cv2.FaceRecognizerSF.create(REC_PATH, "")


# ---------------- almacenamiento ----------------
def leer_db():
    try:
        with open(DATA, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def guardar_db(db):
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(db, f)


# ---------------- IA ----------------
def decodificar(data_url):
    if not isinstance(data_url, str) or "," not in data_url:
        raise ValueError("imagen inválida")
    crudo = base64.b64decode(data_url.split(",", 1)[1])
    if len(crudo) > MAX_BYTES:
        raise ValueError("imagen demasiado grande")
    img = cv2.imdecode(np.frombuffer(crudo, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("imagen inválida")
    return img


def extraer_embedding(img):
    """Devuelve (embedding, None) o (None, 'sin_rostro' | 'multiples')."""
    with _lock:
        h, w = img.shape[:2]
        detector.setInputSize((w, h))
        _, caras = detector.detect(img)
        if caras is None or len(caras) == 0:
            return None, "sin_rostro"
        if len(caras) > 1:
            return None, "multiples"
        alineada = reconocedor.alignCrop(img, caras[0])
        emb = reconocedor.feature(alineada).flatten().astype(np.float32)
    return emb / np.linalg.norm(emb), None


def similitud(a, b):
    return float(np.dot(a, b))  # ambos normalizados -> coseno


# ---------------- API ----------------
@app.get("/api/face/status/<user_id>")
def estado(user_id):
    return jsonify(registrado=user_id in leer_db())


@app.post("/api/face/enroll")
def registrar():
    body = request.get_json(silent=True) or {}
    user_id = body.get("user_id")
    imagenes = body.get("images") or []
    if not user_id or not imagenes:
        return jsonify(ok=False, error="datos_incompletos"), 400

    embs = []
    try:
        for data_url in imagenes[:6]:
            emb, err = extraer_embedding(decodificar(data_url))
            if err:
                return jsonify(ok=False, error=err)
            embs.append(emb)
    except ValueError as e:
        return jsonify(ok=False, error="imagen_invalida", mensaje=str(e)), 400

    # Las muestras deben ser de la misma persona
    for e in embs[1:]:
        if similitud(embs[0], e) < UMBRAL_COSENO:
            return jsonify(ok=False, error="muestras_inconsistentes")

    plantilla = np.mean(embs, axis=0)
    plantilla /= np.linalg.norm(plantilla)
    db = leer_db()
    db[user_id] = plantilla.tolist()
    guardar_db(db)
    return jsonify(ok=True)


@app.post("/api/face/verify")
def verificar():
    body = request.get_json(silent=True) or {}
    user_id = body.get("user_id")
    db = leer_db()
    if user_id not in db:
        return jsonify(ok=False, error="sin_registro")
    try:
        emb, err = extraer_embedding(decodificar(body.get("image")))
    except ValueError as e:
        return jsonify(ok=False, error="imagen_invalida", mensaje=str(e)), 400
    if err:
        return jsonify(ok=False, error=err)

    sim = similitud(np.array(db[user_id], dtype=np.float32), emb)
    return jsonify(ok=True, coincide=sim >= UMBRAL_COSENO, similitud=round(sim, 4))


@app.delete("/api/face/<user_id>")
def borrar(user_id):
    db = leer_db()
    db.pop(user_id, None)
    guardar_db(db)
    return jsonify(ok=True)


@app.get("/api/health")
def salud():
    return jsonify(ok=True)


# ---------------- Frontend estático ----------------
@app.get("/")
def raiz():
    return send_from_directory(FRONT, "index.html")


@app.get("/<path:ruta>")
def estaticos(ruta):
    if ruta.startswith(("backend", "api")):
        return ("", 404)
    return send_from_directory(FRONT, ruta)


if __name__ == "__main__":
    print("VerityNews en http://localhost:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
