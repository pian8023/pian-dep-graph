import { type Context } from 'koa'
import { PnpmLockGraph } from './pnpm'
import { YarnLockGraph } from './yarn'
import { NpmLockGraph } from './npm'
import { NodeModulesGraph } from './node_modules'
import { type DepGraph } from '../types'
import { searchByName } from '../utils'

export const graphController = async (ctx: Context) => {
  const { filepath, depth, savepath, choice } = process.env
  const queryName = ctx.query.name as string
  let data: DepGraph = {
    nodes: [],
    dependencies: [],
    devDependencies: [],
  }

  if (choice === 'lockfile') {
    if (filepath?.endsWith('pnpm-lock.yaml')) {
      const graph = new PnpmLockGraph({
        filepath,
        savepath,
      })
      data = await graph.parse()
    } else if (filepath?.endsWith('yarn.lock')) {
      const graph = new YarnLockGraph({
        filepath,
        savepath,
      })
      data = await graph.parse()
    } else if (filepath?.endsWith('package-lock.json')) {
      const graph = new NpmLockGraph({
        filepath,
        savepath,
      })
      data = await graph.parse()
    }
  } else if (choice === 'node_modules') {
    const graph = new NodeModulesGraph({
      depth: Number(depth),
      savepath,
    })
    data = await graph.parse()
  }

  data.nodes = queryName ? searchByName(data.nodes, queryName) : data.nodes

  ctx.body = {
    code: 200,
    data,
  }
}
