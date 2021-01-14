// const manager = require('./manager')

module.exports = (req, res, next) => {
	const key = req.headers['sse-key-e5b6a1db']

	console.log(`sseKey: ${key}`)

	req.sseKey = key

	// req.sendMessage = function sendMessage(evt, json = {}, id = null) {
	// 	manager.sendMessage(evt, json, id)
	// }

	next()
}