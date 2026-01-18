from flask import Flask
from flask_socketio import SocketIO
from events import init_events

from routes import init_routes

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

init_events(socketio)
init_routes(app)

if __name__ == "__main__":
    socketio.run(app, debug=True)
