import Router from 'koa-router'
import { graphController } from '../parseLockFile'

const router = new Router()
router.prefix('/api')

router.get('/', (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript!'
})

router.get('/graph', graphController)

export default router
