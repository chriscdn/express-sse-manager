const middleware = require('./middleware')
const Manager = require('./Manager')

module.exports = {
	middleware,
	Manager,
	manager: new Manager()
}