Router = require "./router"

## expose these so people can monkeypatch / extend them
exports.Messenger = require "./concrete/messenger"

# the "Event Emitter"
exports.Director  = require "./concrete/director"

# the request which is sent to the particular request
exports.Request   = require "./request"

# the response to the request
exports.Response  = require "./concrete/response"


# creates a new router
exports.router = () -> new Router()