# Main event file
from flask_socketio import emit

def init_events(socketio):
    @socketio.on("yo")
    def yo():
        return "Yo"
    
def emitEvents(name, obj):
    emit(name, obj)