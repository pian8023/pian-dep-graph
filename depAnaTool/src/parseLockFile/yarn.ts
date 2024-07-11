import path from 'path'
import { readFileSync } from 'fs-extra'
import { parse } from '@yarnpkg/lockfile'
import { BaseDepGraph } from './base'
import { deduplicateByName, saveJsonFile } from '../utils'
import { type DepGraph, DepGraphNode, LockGraphOptions } from '../types'

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

/* 
  去除后缀版本号,例如：
  cross-spawn@^7.0.0, cross-spawn@^7.0.3   输出cross-spawn
  @pnpm/network.proxy-agent@2.0.0  输出@pnpm/network.proxy-agent
  get-npm-tarball-url@^2.1.0  输出get-npm-tarball-url
*/
const getName = (specifier: string) => {
  const list = specifier.split('@')
  if (specifier.slice(0, 1) === '@') {
    return `@${list[1]}`
  } else {
    return list[0]
  }
}

export class YarnLockGraph extends BaseDepGraph {
  private filepath: string
  private savepath?: string

  constructor(options: LockGraphOptions) {
    super()
    const { filepath, savepath } = options
    this.filepath = filepath
    this.savepath = savepath
  }

  async parse(): Promise<DepGraph> {
    const yarnLockPath = path.resolve(process.cwd(), this.filepath)
    console.log(yarnLockPath)
    if (!yarnLockPath) {
      throw new Error(`lockPath does not exist or is empty`)
    }
    const pkgPath = readFileSync(yarnLockPath, 'utf8')
    const pkgJson = await parse(pkgPath)
    if (!pkgJson) {
      throw new Error('Cannot parse yarn.lock')
    }
    const { object } = pkgJson

    const res: DepGraph['nodes'] = []
    const modules = Object.keys(object).map((key) => {
      return {
        name: getName(key),
        version: object[key].version as string,
        dependence: parseObject(object[key]),
      }
    })
    res.push(...modules)

    const deduplicateRes = deduplicateByName(res)
    if (this.savepath) {
      saveJsonFile(deduplicateRes, this.filepath, this.savepath)
    }

    return {
      nodes: deduplicateRes,
      dependencies: ['yarn.lock不支持dependencies'],
      devDependencies: ['yarn.lock不支持devDependencies'],
    }
  }
}
