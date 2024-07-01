import Router from 'koa-router'
import { parseLockFile } from '../parseLockFile'

const router = new Router()
router.prefix('/api')

router.get('/', (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript!'
})

router.get('/graph', parseLockFile)

export default router
