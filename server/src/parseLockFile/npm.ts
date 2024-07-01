import path from 'path'
import { readJson } from 'fs-extra'
import { BaseDepGraph } from './base'
import { type DepGraph, DepGraphNode } from '../types'

export class NpmLockGraph extends BaseDepGraph {
  async parse(): Promise<DepGraph> {
    const pkgPath = path.resolve(__dirname, '../../package-lock.json')
    const pkgJson = await readJson(pkgPath)
    const { packages } = pkgJson

    const res: DepGraph = []
    const modules = Object.keys(packages).map((key) => {
      return {
        name: key,
        import: false,
        version: packages[key].version as string,
        dependence: parsePackages(packages[key]),
      }
    })
    res.push(...modules)

    return res
  }
}

const parsePackages = (depDef: any) => {
  const { dependencies, devDependencies } = depDef
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
  if (devDependencies) {
    Object.keys(devDependencies).map((key) => {
      packages.push({
        name: key,
        version: devDependencies[key],
        depType: 'devDependencies',
      })
    })
  }

  return packages
}

const doAnalysis = async () => {
  const graph = new NpmLockGraph()
  await graph.parse()
}

doAnalysis()
