Router = require "./router"

## expose these so people can monkeypatch / extend them
exports.Messenger = require "./concrete/messenger"
exports.Director  = require "./concrete/director"
exports.Message   = require "./message"
exports.Response  = require "./concrete/response"


exports.router = () ->
	new Router()