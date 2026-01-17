# Main router file


# ROUTE SYNTAX
# @app.route("path", methods=["METHOD"])
# def foobar():
#   ...


def init_routes(app):
    @app.route("/", methods=["POST"])
    def yo():
        return "Yo"