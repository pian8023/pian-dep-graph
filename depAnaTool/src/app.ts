import Koa from 'koa'
import router from './routes'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import { errorCatch } from './middlewares/error-catch'
import { commandParams } from './types'

export const bootstrap = (params: commandParams) => {
  const app = new Koa()
  app.context.config = params
  app.use(errorCatch())
  app.use(logger())
  app.use(bodyParser())
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(3000, () => {
    console.log('Server is running on port 3000')
  })
}
