# Main event file
from flask_socketio import send

def init_events(socketio):
    @socketio.on("message")
    def yo():
        send("Hello")
    
def emitEvents(name, obj):
    return#emit(name, obj)