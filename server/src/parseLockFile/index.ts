import path from 'path'
import { type Context } from 'koa'
import { PnpmLockGraph } from './pnpm'
import { YarnLockGraph } from './yarn'
import { NpmLockGraph } from './npm'

export const parseLockFile = async (ctx: Context) => {
  // const graph = new PnpmLockGraph({
  //   queryName: ctx.query.name as string,
  //   lockPath: '../../pnpm-lock.yaml',
  //   depth: 0,
  // })

  // const graph = new YarnLockGraph({
  //   queryName: ctx.query.name as string,
  //   lockPath: '../../yarn.lock',
  //   depth: 0,
  // })

  const graph = new NpmLockGraph({
    queryName: ctx.query.name as string,
    lockPath: '../../package-lock.json',
    depth: 0,
    savePath: '../../target',
  })

  const data = await graph.parse()

  ctx.body = {
    code: 200,
    data,
  }
}
