const express = require('express')
const router = express.Router()
const manager = require('./manager')
const debounce = require('lodash.debounce')

function randomString(length) {
	let result = ''
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}

	return result
}

function routerGenerator(size, debounceTime) {

	const bigRandomString = randomString(size)

	const middleware = (req, res, next) => {
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*'
		})

		const keepAliveHandshake = setInterval(() => {
			res.write(':keepalive\n')
		}, 15000)

		res.on('finish', () => clearInterval(keepAliveHandshake))
		res.on('close', () => clearInterval(keepAliveHandshake))

		res._flushed = debounce(function() {
			res.write(`:${bigRandomString}\n`)
		}, debounceTime)

		/**
		 * Add function to response which allow to send events to the client
		 * @param evt
		 * @param json
		 * @param [id]
		 */
		res.sse = (evt, json, id) => {
			res.write('\n')

			if (id) {
				res.write(`id: ${id}\n`)
			}

			res.write(`retry: 3000\n`)
			res.write(`event: ${evt}\n`)
			res.write(`data: ${JSON.stringify(json)}\n\n`)

			// jury is out on this... required with compression middleware? 
			// some error about using flushHeaders instead.
			// if (res.flush) {
			// 	res.flush()
			// }
			// 
				
			// Proxies may buffer the response, which prevents
			// messages from being sent.  These routes can be configured with
			// a `size` and `debounceTime` parameter to push a comment to effectively
			// flush the cache.
			if (size > 0) {
				res._flushed()
			}		
		}

		next()
	}

	router.get('/:key', middleware, (req, res) => {
		const key = req.params.key
		manager.registerConnection(key, req, res)
	})

	return router

}

module.exports = (size = 0, debounceTime = 750) => {
	return routerGenerator(size, debounceTime)
}