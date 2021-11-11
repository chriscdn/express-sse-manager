const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const sse = require('../express/')

const sseManager = require('../express/manager')

app.use(express.static(path.resolve(__dirname, './public')))
app.use('/lib', express.static(path.resolve(__dirname, '../lib/')))

app.use('/sse', sse.routes())

setInterval(() => {
	sseManager.broadcast('cbc', 'breaking-news', {name:'bob'})
}, 3000)

console.log('NODE_ENV: ' + process.env.NODE_ENV)
console.log('PORT: 5555')

app.listen(5555)
