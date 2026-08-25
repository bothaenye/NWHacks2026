from flask import Flask
from flask_socketio import SocketIO
from events import init_events
import os
import sys
import threading
import webbrowser
from routes import init_routes


def resource_path(relative_path):
    base_path = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)


app = Flask(__name__, static_folder=resource_path("static_frontend"), static_url_path="")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

init_events(socketio)
init_routes(app)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Only auto-open a browser when running as the bundled desktop app
    # (PyInstaller sets sys.frozen); avoid this during normal dev/hosting runs.
    if getattr(sys, "frozen", False):
        threading.Timer(1.5, lambda: webbrowser.open(f"http://localhost:{port}")).start()
    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
