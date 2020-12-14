const express = require('express')
const router = express.Router()

const middleware = require('./middleware')
const manager = require('./manager')

router.get('/', middleware, async (req, res) => {

	const key = manager.keyFromRequest(req)

	if (key) {
		manager.registerConnection(key, req, res)
	}

})

module.exports = router