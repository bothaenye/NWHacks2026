# Main event file
from flask_socketio import emit
from FrameProcessor import getPosture

def init_events(socketio):
    @socketio.on("frame")
    def recieveFrame(obj):
        emitEvents('frame_return', getPosture(obj["frame"]))
    
def emitEvents(name, obj):
    emit(name, obj)