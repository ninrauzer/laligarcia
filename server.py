import os
import json
import secrets
from pathlib import Path
from flask import Flask, request, redirect, send_from_directory, jsonify, make_response

app = Flask(__name__, static_folder=None)

ROOT = Path(__file__).parent
CONTENT_DIR = ROOT / 'content'
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')
ALLOWED_FILES = {'obras.json', 'bio.json', 'videos.json', 'meta.json'}
MAX_UPLOAD = 10 * 1024 * 1024  # 10 MB

sessions: set[str] = set()

if not ADMIN_PASSWORD:
    print('ERROR: falta la variable de entorno ADMIN_PASSWORD')
    raise SystemExit(1)


def token() -> str | None:
    return request.cookies.get('admin_token')

def is_auth() -> bool:
    return bool(token() and token() in sessions)


# ── AUTH ──────────────────────────────────────────────────────────

@app.post('/admin/login')
def admin_login():
    if request.form.get('password') == ADMIN_PASSWORD:
        t = secrets.token_hex(32)
        sessions.add(t)
        resp = make_response(redirect('/admin'))
        resp.set_cookie('admin_token', t, httponly=True, samesite='Strict', path='/')
        return resp
    return redirect('/admin/login?error=1')

@app.post('/admin/logout')
def admin_logout():
    sessions.discard(token())
    resp = make_response(redirect('/admin/login'))
    resp.set_cookie('admin_token', '', max_age=0, path='/')
    return resp


# ── ADMIN PANEL ───────────────────────────────────────────────────

@app.get('/admin/login')
def admin_login_page():
    return send_from_directory(ROOT / 'admin', 'login.html')

@app.get('/admin')
@app.get('/admin/')
def admin_panel():
    if not is_auth():
        return redirect('/admin/login')
    return send_from_directory(ROOT / 'admin', 'index.html')

@app.get('/admin/index.html')
def admin_index_redirect():
    return redirect('/admin')

@app.get('/admin/<path:filename>')
def admin_static(filename):
    if not is_auth():
        return redirect('/admin/login')
    return send_from_directory(ROOT / 'admin', filename)


# ── API ───────────────────────────────────────────────────────────

@app.get('/api/content/<filename>')
def api_read(filename):
    if not is_auth():
        return jsonify(error='No autorizado'), 401
    if filename not in ALLOWED_FILES:
        return jsonify(error='No permitido'), 403
    try:
        return jsonify(json.loads((CONTENT_DIR / filename).read_text('utf-8')))
    except Exception:
        return jsonify(error='Error de lectura'), 500

@app.post('/api/content/<filename>')
def api_write(filename):
    if not is_auth():
        return jsonify(error='No autorizado'), 401
    if filename not in ALLOWED_FILES:
        return jsonify(error='No permitido'), 403
    try:
        data = request.get_json(force=True)
        (CONTENT_DIR / filename).write_text(
            json.dumps(data, ensure_ascii=False, indent=2), 'utf-8'
        )
        return jsonify(ok=True)
    except Exception:
        return jsonify(error='Error guardando'), 500

@app.post('/api/upload')
def api_upload():
    if not is_auth():
        return jsonify(error='No autorizado'), 401
    f = request.files.get('image')
    if not f or not f.filename:
        return jsonify(error='Sin imagen'), 400
    if not f.mimetype.startswith('image/'):
        return jsonify(error='Solo imágenes'), 400
    data = f.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        return jsonify(error='Imagen demasiado grande (máx. 10 MB)'), 400
    folder = 'bio' if request.args.get('folder') == 'bio' else 'obras'
    dest = ROOT / 'images' / folder
    dest.mkdir(parents=True, exist_ok=True)
    ext = Path(f.filename).suffix.lower() or '.jpg'
    name = f"{secrets.token_hex(8)}{ext}"
    (dest / name).write_bytes(data)
    return jsonify(path=f'/images/{folder}/{name}')


# ── SITIO PÚBLICO (catch-all) ─────────────────────────────────────

@app.get('/')
def index():
    return send_from_directory(ROOT, 'index.html')

@app.get('/<path:path>')
def serve_public(path):
    return send_from_directory(ROOT, path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
