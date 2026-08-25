from flask import Flask
from flask_socketio import SocketIO
from events import init_events
import os
import socket
import sys
import threading
import time
import webbrowser
from routes import init_routes


def resource_path(relative_path):
    base_path = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)


app = Flask(__name__, static_folder=resource_path("static_frontend"), static_url_path="")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

init_events(socketio)
init_routes(app)


def open_browser_when_ready(port, timeout=120):
    # mediapipe/matplotlib initialization can take a while on first run
    # (unpacking the bundle, building the font cache, etc.), so poll for
    # the server to actually be listening instead of guessing a delay.
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                break
        except OSError:
            time.sleep(0.5)
    webbrowser.open(f"http://localhost:{port}")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Only auto-open a browser when running as the bundled desktop app
    # (PyInstaller sets sys.frozen); avoid this during normal dev/hosting runs.
    if getattr(sys, "frozen", False):
        threading.Thread(target=open_browser_when_ready, args=(port,), daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
