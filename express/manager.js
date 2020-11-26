module.exports = class Manager {

	constructor() {
		this.connections = new Map()
		this.messageArchive = new Map()
	}

	registerConnection(key, req, res) {
		res.on('finish', () => this.removeConnection(key));
		res.on('close', () => this.removeConnection(key));

		console.log(`sse registering connection: ${key}`)

		this.connections.set(key, res)

		// const lastEventID = parseInt(get(req, 'headers.last-event-id', -1))
		// I have to think more about this...
		// this.sendPendingMessages(key, lastEventID)
	}

	removeConnection(key) {
		const connection = this.connections.get(key)

		if (connection) {
			console.log(`sse deleting connection: ${key}`)
			this.connections.delete(key)
		}
	}

	closeConnection(key) {
		this.sendMessage(key, 'close', {}, -1)
		this.messageArchive.delete(key)
		this.removeConnection(key)
	}

	sendMessage(key, evt, json, id = null) { // , id = null) {

		const res = this.connections.get(key)
		// const theID = isNaN(id) ? -1 : id

		if (res) {
			res.sse(evt, json, id)
		}
	}
	
	appendToMessageArchive(key, evt, json) {

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

	// sendPendingMessages(key, lastEventID) {
	// 	const messages = this.messageArchive.get(key) || []

	// 	messages.slice(lastEventID + 1).forEach(msg => {
	// 		this.sendMessage(key, msg.evt, msg.json)
	// 	})
	// }

}