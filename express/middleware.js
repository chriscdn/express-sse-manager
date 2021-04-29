const manager = require('./manager')

module.exports = (req, res, next) => {

	const key = req.headers['sse-key-e5b6a1db']

	if (key) {
		req.sseKey = key
	}

	req.sseSendMessage = (evt, json = {}, sendId = true) => {
		manager.sendMessage(key, evt, json, sendId)
	}

	// sse.manager.pleasewait(req.sseKey, 'One moment...')

	next()
}

// console.log(`sseKey: ${key}`)

// req.sendMessage = function sendMessage(evt, json = {}, id = null) {
// 	manager.sendMessage(evt, json, id)
// }