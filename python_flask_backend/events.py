# Main event file
from flask_socketio import emit

def init_events(socketio):
    @socketio.on("frame")
    def yo(obj):
        #print(obj)
        emitEvents('frame_return', "good")
    
def emitEvents(name, obj):
    print("Gorp")
    emit(name, obj)