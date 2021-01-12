// based on https://www.npmjs.com/package/sse-express

module.exports = (req, res, next) => {

	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
		'Access-Control-Allow-Origin': '*'
	})

	const keepAliveHandshake = setInterval(() => {
		res.write(':keepalive')
	}, 15000)

	res.on('finish', () => clearInterval(keepAliveHandshake))
	res.on('close', () => clearInterval(keepAliveHandshake))

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
	}

	next()
}