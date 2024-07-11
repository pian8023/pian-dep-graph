import { type DepGraph } from '../types'

export abstract class BaseDepGraph {
  abstract parse(): Promise<DepGraph>
}
