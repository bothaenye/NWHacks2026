# Main router file

# ROUTE SYNTAX
# @app.route("path", methods=["METHOD"])
# def foobar():
#   ...


def init_events(socketio):
    @socketio.on("yo")
    def yo():
        return "Yo"