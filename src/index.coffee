Router = require "./router"

## expose these so people can monkeypatch / extend them
exports.Messenger = require "./concrete/messenger"

# the "Event Emitter"
exports.Director  = require "./concrete/director"

# the message which is sent to the particular request
exports.Message   = require "./message"

# the response to the message
exports.Response  = require "./concrete/response"


# creates a new router
exports.router = () -> new Router()