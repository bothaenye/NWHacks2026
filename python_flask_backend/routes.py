# ROUTE SYNTAX
# @app.route("path", methods=["METHOD"])
# def foobar():
#   ...

def init_routes (app):
    @app.route("/", methods=["GET"])
    def hello():
        return "hello"