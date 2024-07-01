export interface dataNode {
  id: string
  x: number
  y: number
}

export interface dataEdge {
  source: string
  target: string
}

export interface graghData {
  nodes: dataNode[]
  edges: dataEdge[]
}

type DepTypes = 'dependencies' | 'devDependencies' | 'peerDependencies'

export interface DepGraphNode {
  name: string
  import: boolean // 是否import的
  version?: string
  specifier?: string
  dependence: { name: string; version?: string; depType: DepTypes }[]
}

export type DepGraph = DepGraphNode[]
