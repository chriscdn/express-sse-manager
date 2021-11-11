# express-sse-manager

Server-Sent Events are great, but a little tricky to setup and manage with Express.

This package provides a way of managing individual sse connections.  In the future a channel subscribe/unsubscribe.

## Express

### First

```js
const sse = require('@chriscdn/express-sse-manager/express/')

app.use('/sse', sse.routes())
```

### Second

Add to routes where you'd like access to the `sse` connection.

```js
const sseMiddleware = require('@chriscdn/express-sse-manager/express/middleware')

app.use('/myroute/', sseMiddleware, ...)
```

This adds a `sseSendMessage` function to the request.

### Third

Connect from the client.