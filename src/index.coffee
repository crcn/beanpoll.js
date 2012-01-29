Router = require "./router"

## expose these so people can extend onto them
exports.Messenger = require "./concrete/messenger"
exports.Director = require "./concrete/director"


exports.router = () ->
	new Router()