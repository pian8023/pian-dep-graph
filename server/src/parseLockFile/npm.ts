import path from 'path'
import { readJson } from 'fs-extra'
import { BaseDepGraph } from './base'
import { deduplicateByName, parseByDepth, saveJsonFile, searchByName } from '../utils'
import { type DepGraph, DepGraphNode, LockGraphOptions } from '../types'

const getDependenceName = (depObj: Record<string, string>) => {
  const list: string[] = []
  Object.keys(depObj).map((key) => {
    list.push(key)
  })

  return list
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

export class NpmLockGraph extends BaseDepGraph {
  private queryName?: string
  private lockPath: string
  private depth?: number
  private savePath?: string

  constructor(options: LockGraphOptions) {
    super()
    const { queryName, lockPath, depth, savePath } = options
    this.queryName = queryName
    this.lockPath = lockPath
    this.depth = depth
    this.savePath = savePath
  }

  async parse(): Promise<DepGraph> {
    const pkgPath = path.resolve(__dirname, this.lockPath)
    if (!pkgPath) {
      throw new Error(`lockPath does not exist or is empty`)
    }
    const pkgJson = await readJson(pkgPath)
    if (!pkgJson) {
      throw new Error('Cannot parse package-lock.json')
    }
    const { packages } = pkgJson

    const res: DepGraph['nodes'] = []
    let dependenceList: string[] = []
    let devDependenceList: string[] = []
    const modules = Object.keys(packages).map((key) => {
      if (key === '') {
        dependenceList = getDependenceName(packages[key].dependencies)
        devDependenceList = getDependenceName(packages[key].devDependencies)
      }
      return {
        name: key.slice(13), //去除前缀'node_modules/'
        import: false,
        version: packages[key].version as string,
        dependence: parsePackages(packages[key]),
      }
    })
    res.push(...modules)

    const depRes = this.depth ? parseByDepth(res) : res
    const searchRes = this.queryName ? searchByName(depRes, this.queryName) : depRes
    const deduplicateRes = deduplicateByName(searchRes)
    if (this.savePath) {
      saveJsonFile(deduplicateRes, this.lockPath, this.savePath)
    }

    return {
      nodes: deduplicateRes,
      dependencies: dependenceList,
      devDependencies: devDependenceList,
    }
  }
}
