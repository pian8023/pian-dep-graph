type DepTypes = 'dependencies' | 'devDependencies' | 'peerDependencies'

export interface DepGraphNode {
  name: string
  version?: string
  specifier?: string
  dependence: { name: string; version?: string; depType: DepTypes }[]
}

export interface DepGraph {
  nodes: DepGraphNode[]
  dependencies?: string[]
  devDependencies?: string[]
}
