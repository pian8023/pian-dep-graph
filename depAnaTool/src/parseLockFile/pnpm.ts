import path from 'path'
import { Lockfile, readWantedLockfile, ProjectSnapshot, PackageSnapshot } from '@pnpm/lockfile-file'
import { BaseDepGraph } from './base'
import { deduplicateByName, saveJsonFile } from '../utils'
import { DepGraph, pnpmLockYaml, DepGraphNode, LockGraphOptions } from '../types'

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
    '/vary/1.1.2', // 输出vary和1.1.2
    '/@probe.gl/env/3.6.0', // 输出@probe.gl/env和3.6.0
    '/@pnpm/crypto.base32-hash/3.0.0', // 输出@pnpm/crypto.base32-hash和3.0.0
    '/@pnpm/core-loggers/10.0.2(@pnpm/logger@5.0.0)', // 输出@pnpm/core-loggers和10.0.2
    '/@isaacs/cliui/8.0.2', // 输出@isaacs/cliui和8.0.2
    '/zustand/4.5.1(@types/react@18.2.60)(react@18.2.0)', // 输出zustand和4.5.1
    '/vue-inbrowser-compiler-independent-utils/4.71.1(vue@3.4.23)', // 输出vue-inbrowser-compiler-independent-utils和4.71.1
    '/@storybook/addon-controls/8.0.8(@types/react@18.3.2)(react-dom@18.3.1)(react@18.3.1)', // 输出@storybook/addon-controls和8.0.8
    '/@types/yarnpkg__lockfile/1.1.9',  // 输出@types/yarnpkg__lockfile和1.1.9
    '@antv/matrix-util/3.1.0-beta.3', // 输出@antv/matrix-uti和3.1.0-beta.3
*/
const parsePkgByReg = (pkgKey: string) => {
  const regex =
    /^\/?(@?([a-z0-9][a-z0-9._-]*[a-z0-9]\/)?([a-z0-9][a-z0-9._-]*[a-z0-9]))\/([0-9]+(?:\.[0-9]+)*(?:-[a-zA-Z0-9._-]+)*)/
  const match = pkgKey.match(regex)

  if (!match) {
    throw new Error(`Failed to match this key: ${pkgKey}`)
  }

  const scope = match[1]
  const packageName = match[2]
  const version = match[3]

  const fullPackageName = scope ? `@${scope}/${packageName}` : packageName

  return {
    name: fullPackageName,
    version,
    specifier: pkgKey,
  }
}

export class PnpmLockGraph extends BaseDepGraph {
  private filepath: string
  private savepath?: string

  constructor(options: LockGraphOptions) {
    super()
    const { filepath, savepath } = options
    this.filepath = filepath
    this.savepath = savepath
  }

  async parse(): Promise<DepGraph> {
    const pkgFilePath = path.resolve(process.cwd(), path.dirname(this.filepath))
    console.log(pkgFilePath)
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
          dependence: parsePackages(packages[key as keyof typeof packages]),
        }
      })
      res.push(...modules)
    }

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
