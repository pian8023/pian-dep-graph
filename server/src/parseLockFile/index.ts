import path from 'path'
import { type Context } from 'koa'
import { PnpmLockGraph } from './pnpm'
import { YarnLockGraph } from './yarn'
import { NpmLockGraph } from './npm'

export const parseLockFile = async (ctx: Context) => {
  // const graph = new PnpmLockGraph()
  const graph = new YarnLockGraph()
  // const graph = new NpmLockGraph()
  const data = await graph.parse()

  ctx.body = {
    code: 200,
    data,
  }
}
