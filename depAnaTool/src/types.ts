type DepTypes = 'dependencies' | 'devDependencies' | 'peerDependencies'

export interface DepGraphNode {
  name: string
  version?: string
  specifier?: string
  dependence: dependence[]
}

export interface dependence {
  name: string
  version?: string
  depType: DepTypes
}

export interface DepGraph {
  nodes: DepGraphNode[]
  dependencies?: string[]
  devDependencies?: string[]
}

// Lockfile缺少部分
export interface pnpmLockYaml {
  dependencies: Record<string, PackageSpec>
  devDependencies: Record<string, PackageSpec>
}

export interface PackageSpec {
  specifier: string
  version: string
}

export interface LockGraphOptions {
  filepath: string
  savepath?: string
}

export interface modulesGraphOptions {
  depth?: number
  savepath?: string
}

export interface commandParams {
  depth?: number
  filepath?: string
  savepath: string
  choice: 'node_modules' | 'lockfile'
}
