import { type Context } from 'koa'
import { PnpmLockGraph } from './pnpm'
import { YarnLockGraph } from './yarn'
import { NpmLockGraph } from './npm'
import { NodeModulesGraph } from './node_modules'
import { DepGraph } from '../types'
import { searchByName } from '../utils'

export const graphController = async (ctx: Context) => {
  const { filepath, depth, savepath, choice } = ctx.config
  const queryName = ctx.query.name as string
  let data: DepGraph = {
    nodes: [],
    dependencies: [],
    devDependencies: [],
  }

  if (choice === 'lockfile') {
    let graph
    switch (true) {
      case filepath.endsWith('pnpm-lock.yaml'):
        graph = new PnpmLockGraph({ filepath, savepath })
        data = await graph.parse()
        break
      case filepath.endsWith('yarn.lock'):
        graph = new YarnLockGraph({ filepath, savepath })
        data = await graph.parse()
        break
      case filepath.endsWith('package-lock.json'):
        graph = new NpmLockGraph({ filepath, savepath })
        data = await graph.parse()
        break
      default:
        break
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
