import { Lockfile, readWantedLockfile, ProjectSnapshot, PackageSnapshot } from '@pnpm/lockfile-file'
import { BaseDepGraph } from './base'
import { deduplicateByName, parseByDepth, searchByName } from '../utils'
import { type DepGraph, pnpmLockYaml, DepGraphNode, LockGraphOptions } from '../types'
import path from 'path'

const parseImporters = (depDef: ProjectSnapshot) => {
  const { dependencies, devDependencies } = depDef
  const importers: DepGraphNode['dependence'] = []
  if (dependencies) {
    Object.keys(dependencies).map((key) => {
      importers.push({
        name: key,
        version: dependencies[key],
        depType: 'dependencies',
      })
    })
  }
  if (devDependencies) {
    Object.keys(devDependencies).map((key) => {
      importers.push({
        name: key,
        version: devDependencies[key],
        depType: 'devDependencies',
      })
    })
  }
  return importers
}

const parsePackages = (depDef: PackageSnapshot) => {
  const { dependencies, peerDependencies } = depDef
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
  if (peerDependencies) {
    Object.keys(peerDependencies).map((key) => {
      packages.push({
        name: key,
        version: peerDependencies[key],
        depType: 'peerDependencies',
      })
    })
  }

  return packages
}

/* 
  几种类型：
    '/vary@1.1.2', // 输出vary和1.1.2
    '/koa-logger@3.2.1', // 输出koa-logger和3.2.1
    '/@pnpm/crypto.base32-hash@3.0.0', // 输出@pnpm/crypto.base32-hash和3.0.0
    '/@pnpm/core-loggers@10.0.2(@pnpm/logger@5.0.0)', // 输出@pnpm/core-loggers和10.0.2
    '/@isaacs/cliui@8.0.2', // 输出@isaacs/cliui和8.0.2
    '/zustand@4.5.1(@types/react@18.2.60)(react@18.2.0)', // 输出zustand和4.5.1
    '/vue-inbrowser-compiler-independent-utils@4.71.1(vue@3.4.23)', // 输出vue-inbrowser-compiler-independent-utils和4.71.1
    '/@storybook/addon-controls@8.0.8(@types/react@18.3.2)(react-dom@18.3.1)(react@18.3.1)', // 输出@storybook/addon-controls和8.0.8
*/
const parsePkgByReg = (pkgKey: string) => {
  const regex = /^\/?(?:@([\w-]+)\/)?([\w.-]+)@([\d.]+)/
  const match = pkgKey.match(regex)
  if (!match) {
    throw new Error(`Failed to match this key: ${pkgKey}`)
  }

  let name = match[2]
  if (match[1]) {
    name = `@${match[1]}/${name}`
  }
  const version = match[3]

  return {
    name,
    version,
    specifier: pkgKey,
  }
}

export class PnpmLockGraph extends BaseDepGraph {
  private queryName?: string
  private lockPath: string
  private depth?: number

  constructor(options: LockGraphOptions) {
    super()
    const { queryName, lockPath, depth } = options
    this.queryName = queryName
    this.lockPath = lockPath
    this.depth = depth
  }

  async parse(): Promise<DepGraph> {
    const pkgFilePath = path.resolve(__dirname, path.dirname(this.lockPath))
    const wantedLockFile = await readWantedLockfile(pkgFilePath, { ignoreIncompatible: true })
    if (!wantedLockFile) {
      throw new Error('Cannot parse pnpm-lock.yaml')
    }

    const { importers, dependencies, devDependencies, packages } = wantedLockFile as Lockfile & pnpmLockYaml
    const res: DepGraph['nodes'] = []

    if (importers) {
      const modules = Object.keys(importers).map((key) => {
        return {
          name: key,
          import: true,
          dependence: parseImporters(importers[key as keyof typeof importers]),
        }
      })
      res.push(...modules)
    }

    const dependenceList: string[] = []
    if (dependencies) {
      const modules = Object.keys(dependencies).map((key) => {
        const { specifier, version } = dependencies[key]
        dependenceList.push(key)
        return {
          name: key,
          version,
          specifier,
          import: false,
          dependence: [],
        }
      })

      res.push(...modules)
    }

    const devDependenceList: string[] = []
    if (devDependencies) {
      const modules = Object.keys(devDependencies).map((key) => {
        const { specifier, version } = devDependencies[key]
        devDependenceList.push(key)
        return {
          name: key,
          version,
          specifier,
          import: false,
          dependence: [],
        }
      })

      res.push(...modules)
    }

    if (packages) {
      const modules = Object.keys(packages).map((key) => {
        const { name, version, specifier } = parsePkgByReg(key)

        return {
          name,
          version,
          specifier,
          import: false,
          dependence: parsePackages(packages[key as keyof typeof packages]),
        }
      })
      res.push(...modules)
    }

    // 这里是根据pnpm-lock.yaml来解析（而不是从项目 package.json 出发，递归遍历所有 node_modules 中的 package.json这种方式），向下层次深度depth只有1
    const depRes = this.depth ? parseByDepth(res) : res // 平铺dependence下所有package
    const results = this.queryName ? searchByName(depRes, this.queryName) : depRes

    return {
      nodes: deduplicateByName(results),
      dependencies: dependenceList,
      devDependencies: devDependenceList,
    }
  }
}
