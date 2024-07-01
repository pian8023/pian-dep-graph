import { readFileSync } from 'fs-extra'
import { parse } from '@yarnpkg/lockfile'
import { BaseDepGraph } from './base'
import { type DepGraph, DepGraphNode } from '../types'

export class YarnLockGraph extends BaseDepGraph {
  async parse(): Promise<DepGraph> {
    const pkgPath = readFileSync('../../yarn.lock', 'utf8')
    const pkgJson = await parse(pkgPath)
    const { object } = pkgJson

    const res: DepGraph = []
    const modules = Object.keys(object).map((key) => {
      return {
        name: key,
        import: false,
        version: object[key].version as string,
        dependence: parseObject(object[key]),
      }
    })
    res.push(...modules)
    return res
  }
}

const parseObject = (depDef: any) => {
  const { dependencies } = depDef
  const packages: DepGraphNode['dependence'] = []
  if (dependencies) {
    Object.keys(dependencies).map((key) => {
      packages.push({
        name: key,
        version: dependencies[key],
        depType: 'dependencies',
      })
    })
  }

  return packages
}

const doAnalysis = async () => {
  const graph = new YarnLockGraph()
  await graph.parse()
}

doAnalysis()
