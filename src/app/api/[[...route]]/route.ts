import { Hono } from 'hono';
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello', async (c) => {
  return c.json({
    message: 'Hello World!'
  })
})

app.get('/hello/:name', async (c) => {
  return c.json({
    message: `Hello ${c.req.param().name}!`
  })
})
export const GET = handle(app)
