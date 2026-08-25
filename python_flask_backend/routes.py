# ROUTE SYNTAX
# @app.route("path", methods=["METHOD"])
# def foobar():
#   ...

import os


def init_routes (app):
    @app.route("/", methods=["GET"])
    def index():
        # The bundled desktop build ships a static_frontend/ directory next
        # to the backend; hosted deployments (e.g. Render) don't have one,
        # since the UI is served separately by Vercel there.
        if app.static_folder and os.path.isfile(os.path.join(app.static_folder, "index.html")):
            return app.send_static_file("index.html")
        return "hello"