//
//
// Tricky thing is knowing key, which could be a session key of some sorts.
//
// perhaps separate middleware could be used to get the sse res for a given session
// this would likely introduce a dependency on sessions
// 
// 
// 

class Manager {

	constructor() {
		this.connections = new Map()
		this.messageArchive = []
		this.channels = new Map()
		this.lastEventID = 0
	}

	// TODO: a "key" could be considered a channel.  Consider what happens if a user has two
	// browser windows open.  They might register with the same key (depending how token is defined).
	// 
	// send message to a "key" would mean sending to all clients - even if they belong to different users
	registerConnection(key, req, res) {
		res.on('finish', () => this.removeConnection(key))
		res.on('close', () => this.removeConnection(key))

		console.log(`sse registering connection: ${key}`)

		const LastEventID = parseInt(req.headers['last-event-id']) || 0

		this.connections.set(key, res)
		this.sendPendingMessages(key, LastEventID)
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

	sendMessage(key, evt, json = {}, sendId = true) {
		const res = this.getConnection(key)

		if (sendId) {
			this.lastEventID = this.lastEventID + 1
			this.appendToMessageArchive(key, evt, json, this.lastEventID)
		}

		if (res) {
			if (sendId) {
				res.sse(evt, json, this.lastEventID)
			} else {
				res.sse(evt, json, null)
			}
		}
	}

	appendToMessageArchive(key, evt, json = {}, id) {
		this.messageArchive.push({
			key,
			id,
			evt,
			json
		})

		const maxItems = 10000

		// push appends to the end of the array
		this.messageArchive = this.messageArchive.slice(Math.max(this.messageArchive.length - maxItems, 0))
	}

	sendPendingMessages(key, lastEventID) {

		if (lastEventID > 0) {

			const res = this.getConnection(key)

			if (res) {
				const messages = this.messageArchive
					.filter(message => message.key == key)
					.filter(message => message.id > lastEventID)
					.sort((a, b) => a.id - b.id)

				messages.forEach(message => {
					res.sse(message.evt, message.json, message.id)
				})
			}
		}

		this.discardMessages(key)

	}

	discardMessages(key) {
		// toss messages belonging to key
		this.messageArchive = this.messageArchive.filter(message => message.key != key)
	}

	subscribeToChannel(key, channel) {

	}

	unsubscribeFromChannel(key, channel) {

	}

	unsubscribeFromAllChannels(key) {

	}

	broadcastToChannel(channel, evt, json = {}) {

	}

}

module.exports = new Manager()
