import G6, { Graph, type GraphData, type NodeConfig, type EdgeConfig } from '@antv/g6'
import { type DepGraph } from '@/types'
import insertCss from 'insert-css'

let graph: Graph | null = null

insertCss(`
  .g6-component-tooltip {
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    font-size: 14px;
    color: #000;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  }
`)

const tooltip = new G6.Tooltip({
  offsetX: 10,
  offsetY: 10,
  fixToNode: [1, 0.5],
  // 允许出现 tooltip 的 item 类型
  itemTypes: ['node', 'edge'],
  // 自定义 tooltip 内容
  getContent: (e: any) => {
    const outDiv = document.createElement('div')
    outDiv.style.width = 'fit-content'
    outDiv.style.height = 'fit-content'
    const model = e.item.getModel()
    if (e.item.getType() === 'node') {
      outDiv.innerHTML = `${model.name}`
    } else {
      const source = e.item.getSource()
      const target = e.item.getTarget()
      outDiv.innerHTML = `来源：${source.getModel().name}<br/>去向：${target.getModel().name}`
    }
    return outDiv
  },
})

const options = {
  fitView: true,
  fitViewPadding: 50,
  animate: true,
  groupByTypes: false,
  minZoom: 0.00000001,
  layout: {
    type: 'force',
    preventOverlap: true,
  },
  defaultNode: {
    style: {
      fill: '#DEE9FF',
      stroke: '#5B8FF9',
    },
    labelCfg: {
      position: 'center',
      style: {
        fontSize: 12,
        fontWeight: 500,
      },
    },
  },
  defaultEdge: {
    style: { endArrow: true, lineWidth: 1, stroke: '#b5b5b5' },
  },
  defaultCombo: {
    type: 'rect',
  },
  nodeStateStyles: {
    selected: {
      fill: 'steelblue',
      stroke: '#000',
      lineWidth: 1,
    },
  },
  modes: {
    default: ['zoom-canvas', 'drag-canvas', 'drag-node', 'activate-relations'],
  },
  plugins: [tooltip],
}

const getGraphData = (data: DepGraph['nodes']): GraphData => {
  const nodes: NodeConfig[] = []
  const edges: EdgeConfig[] = []

  for (const item of data) {
    let { name } = item
    const { dependence } = item

    // package-lock.json文件下packages对象第一个key为'',这里取个别名
    if (name === '') {
      name = 'pkgLockJson'
    }
    nodes.push({
      id: name,
      label: name,
      name: name,
      // color: '#40a9ff',
      size: 24,
    })

    dependence?.forEach((dep) => {
      const edge = edges.find((e) => e.source === name && e.target === dep.name)
      if (!edge) {
        nodes.push({
          id: dep.name,
          label: dep.name,
          name: dep.name,
          size: 24,
        })
        edges.push({
          source: name,
          target: dep.name,
        })
      }
    })
  }

  return {
    nodes: deduplicateByName(nodes),
    edges,
  }
}

// 确保每个边的源和目标节点都存在于节点列表中
const validateGraphData = (data: GraphData) => {
  const nodesMap = new Map(data.nodes!.map((node) => [node.id, node]))

  data.edges = data.edges!.filter((edge) => {
    const sourceNode = nodesMap.get(edge.source!)
    const targetNode = nodesMap.get(edge.target!)
    if (!sourceNode || !targetNode) {
      // console.error(`Invalid edge found: ${JSON.stringify(edge)}`)
      return false
    }
    return true
  })

  return data
}

const deduplicateByName = (nodes: NodeConfig[]) => {
  const seen = new Set()
  return nodes.reduce((acc: NodeConfig[], item) => {
    const keyValue = item['name']
    if (!seen.has(keyValue)) {
      seen.add(keyValue)
      acc.push(item)
    }
    return acc
  }, [])
}

export const renderGraph = (nodes: DepGraph['nodes'], element: HTMLElement) => {
  if (graph) {
    // graph.destroy()  不使用destroy()，使用changeData()来更新数据以确保tooltip插件正常工作
    const graphData = getGraphData(nodes)
    const validatedData = validateGraphData(graphData)
    graph.changeData(validatedData)
    graph.layout()
    graph.render()
  } else {
    graph = new Graph({
      container: element.id,
      width: element.scrollWidth,
      height: element.scrollHeight,
      ...options,
    })
    const graphData = getGraphData(nodes)
    graph.data(graphData)
    graph.render()
  }

  if (typeof window !== 'undefined')
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return
      if (!element || !element.scrollWidth || !element.scrollHeight) return
      graph.changeSize(element.scrollWidth, element.scrollHeight)
    }
}
