//
//
// Tricky thing is knowing key, which could be a session key of some sorts.
//
// perhaps separate middleware could be used to get the sse res for a given session
// this would likely introduce a dependency on sessions
// 
// 
// 
// 

class Manager {

	constructor() {
		this.connections = new Map()
		this.messageArchive = new Map()
		this.channels = new Map()
	}

	registerConnection(key, req, res) {
		res.on('finish', () => this.removeConnection(key))
		res.on('close', () => this.removeConnection(key))

		console.log(`sse registering connection: ${key}`)

		this.connections.set(key, res)
	}

	getConnection(key) {
		return this.connections.get(key)
	}

	removeConnection(key) {
		const connection = this.getConnection(key)

		if (connection) {
			console.log(`sse deleting connection: ${key}`)
			this.connections.delete(key)
			this.unsubscribeFromAllChannels(key)
		}
	}

	sendMessage(key, evt, json = {}, id = null) {
		const res = this.getConnection(key)

		if (res) {
			res.sse(evt, json, id)
		}
	}

	appendToMessageArchive(key, evt, json = {}) {

		if (!this.messageArchive.has(key)) {
			this.messageArchive.set(key, [])
		}

		const messages = this.messageArchive.get(key)

		messages.push({
			evt,
			json
		})

		return messages.length - 1
	}

	subscribeToChannel(key, channel) {

	}

	unsubscribeFromChannel(key, channel) {

	}

	unsubscribeFromAllChannels(key) {

	}

	broadcastToChannel(channel, evt, json = {}) {

	}

	// sendPendingMessages(key, lastEventID) {
	// 	const messages = this.messageArchive.get(key) || []

	// 	messages.slice(lastEventID + 1).forEach(msg => {
	// 		this.sendMessage(key, msg.evt, msg.json)
	// 	})
	// }

}

module.exports = new Manager()