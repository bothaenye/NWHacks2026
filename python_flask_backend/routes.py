
def init_routes (app):
    @app.route("/", methods=["GET"])
    def hello():
        return "hello"