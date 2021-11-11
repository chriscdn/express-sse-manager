class MessageHistory {
	constructor() {
		this.items = []
		this.kMaxHistoryItems = 1000
	}

	add(item) {
		this.items.push(item)
		this.items = this.items.slice(Math.max(this.items.length - this.kMaxHistoryItems, 0))
	}

	fetch(channelName, lastEventId) {
		return this.items
			.filter((item) => item.channelName == channelName)
			.filter((item) => item.lastEventId > lastEventId)
			.sort((a, b) => a.lastEventId - b.lastEventId)
	}
}

const messageHistory = new MessageHistory()

class Channel {
	constructor(channelName) {
		this.channelName = channelName
		this.connections = new Set()
	}

	get isEmpty() {
		return this.connections.size == 0
	}

	tuneIn(res) {
		console.log('tuneIn')
		this.connections.add(res)
		res.on('finish', () => this.tuneOut(res))
		res.on('close', () => this.tuneOut(res))
	}

	tuneOut(res) {
		console.log('tuneOut')
		this.connections.delete(res)
	}

	destroy() {
		this.connections.forEach((res) => this.tuneOut(res))
	}

	broadcast(item) {
		this.connections.forEach((res) => res.sse(item))
		messageHistory.add({
			channelName: this.channelName,
			timestamp: new Date(),
			...item,
		})
	}

	sendMissedMessages(res, lastEventId) {
		messageHistory.fetch(this.channelName, lastEventId).forEach((item) => res.sse(item))
	}
}

class ChannelManager {
	constructor() {
		this.channels = new Map()

		// each minute we cleanup empty channels
		setInterval(() => this.cleanupEmptyChannels(), 60000)
	}

	hasChannel(channelName) {
		return this.channels.has(channelName)
	}

	getChannel(channelName) {
		if (!this.hasChannel(channelName)) {
			this.channels.set(channelName, new Channel(channelName))
		}
		return this.channels.get(channelName)
	}

	destroyChannel(channelName) {
		if (this.hasChannel(channelName)) {
			console.log(`Destroyed: ${channelName}`)

			const channel = this.channels.get(channelName)
			channel.destroy()
			this.channels.delete(channelName)
		}
	}

	async cleanupEmptyChannels() {
		this.channels.forEach((channel, channelName) => {
			if (channel.isEmpty) {
				this.destroyChannel(channelName)
			}
		})
	}
}

class Manager {
	constructor() {
		this.channelManager = new ChannelManager()
		this.lastEventId = 0
	}

	// This simply means, this request wants to listen to events on this channel.
	registerConnection(channelName, req, res) {
		console.log(`sse registering connection: ${channelName}`)

		// Here's the big question.  May this user subscribe to this channel?
		const channel = this.channelManager.getChannel(channelName)

		channel.tuneIn(res)

		const lastEventId = parseInt(req.headers['last-event-id']) || 0

		if (lastEventId > this.lastEventId) {
			// this is an error case likely caused by the server restarting and resetting the
			// lastEvent messages to 0.
		} else if (lastEventId > 0) {
			console.log(`LastEventID: ${lastEventId}`)

			// this means the connection was interrupted... send missing messages for this channel
			channel.sendMissedMessages(res, lastEventId)
		}
	}

	broadcast(channelName, eventName, json = {}) {
		this.lastEventId = this.lastEventId + 1

		// no point in broadcasting a message if nobody is listening
		if (this.channelManager.hasChannel(channelName)) {
			const channel = this.channelManager.getChannel(channelName)
			channel.broadcast({ eventName, json, lastEventId: this.lastEventId })
		}
	}
}

module.exports = new Manager()
