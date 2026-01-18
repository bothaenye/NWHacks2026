from flask import Flask
from flask_socketio import SocketIO
from events import init_events
import os
from routes import init_routes

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

init_events(socketio)
init_routes(app)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
