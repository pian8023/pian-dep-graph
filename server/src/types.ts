type DepTypes = 'dependencies' | 'devDependencies' | 'peerDependencies'

export interface DepGraphNode {
  name: string
  import: boolean // 是否import的
  version?: string
  specifier?: string
  dependence: { name: string; version?: string; depType: DepTypes }[]
}

export type DepGraph = DepGraphNode[]

// Lockfile缺少部分
export interface pnpmLockYaml {
  dependencies: Record<string, PackageSpec>
  devDependencies: Record<string, PackageSpec>
}

export interface PackageSpec {
  specifier: string
  version: string
}
