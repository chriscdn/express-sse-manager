const {
	nanoid
} = require('nanoid')

const urljoin = require('url-join')

class Client {

	constructor(path = '/sse', key = nanoid()) {
		this.events = new Map()

		const fullPath = urljoin(path, key)

		this.eventSource = new EventSource(fullPath)
		this.key = key

		this.eventSource.addEventListener('open', this.onOpen.bind(this))
		this.eventSource.addEventListener('error', this.onError.bind(this))
		this.eventSource.addEventListener('close', this.onClose.bind(this))
	}

	get headers() {
		return {
			'sse-key-e5b6a1db': this.key
		}
	}

	// addSSEHeadersToAxiosClient(axiosInstance) {
	// 	axiosInstance.interceptors.request.use(config => {
	// 		config.headers['sse-key'] = this.key
	// 		return config
	// 	})
	// }

	onOpen(event) {
		// console.log('onOpen')
	}

	onError(event) {
		// console.log('client onError called')
	}

	onClose(event) {
		this.eventSource.close()
		this.eventSource = null
	}

	addEventListener(eventName, _callback) {

		// this assumes a single listener for each event

		const callback = event => {
			const type = event.type
			const data = JSON.parse(event.data)

			_callback({
				type,
				data
			})
		}

		this.removeEventListener(eventName)
		this.events.set(eventName, callback)
		this.eventSource.addEventListener(eventName, callback)
	}

	removeEventListener(eventName) {
		const callback = this.events.get(eventName)

		if (callback) {
			this.events.delete(eventName)
			this.eventSource.removeEventListener(eventName, callback)
		}

	}

}

module.exports = Client