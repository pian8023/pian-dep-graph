type DepTypes = 'dependencies' | 'devDependencies' | 'peerDependencies'

export interface DepGraphNode {
  name: string
  import: boolean // 是否import的
  version?: string
  specifier?: string
  dependence: { name: string; version?: string; depType: DepTypes }[]
}

export interface DepGraph {
  nodes: DepGraphNode[]
  dependencies?: string[]
  devDependencies?: string[]
}
