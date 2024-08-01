import path from 'path'
import { readJson } from 'fs-extra'
import { BaseDepGraph } from './base'
import { deduplicateByName, saveJsonFile } from '../utils'
import { DepGraph, DepGraphNode, LockGraphOptions } from '../types'

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
  private filepath: string
  private savepath?: string

  constructor(options: LockGraphOptions) {
    super()
    const { filepath, savepath } = options
    this.filepath = filepath
    this.savepath = savepath
  }

  async parse(): Promise<DepGraph> {
    const pkgPath = path.resolve(process.cwd(), this.filepath)
    console.log(pkgPath)
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
        version: packages[key].version as string,
        dependence: parsePackages(packages[key]),
      }
    })
    res.push(...modules)

    const deduplicateRes = deduplicateByName(res)
    if (this.savepath) {
      saveJsonFile(deduplicateRes, this.savepath, this.filepath)
    }

    return {
      nodes: deduplicateRes,
      dependencies: dependenceList,
      devDependencies: devDependenceList,
    }
  }
}
