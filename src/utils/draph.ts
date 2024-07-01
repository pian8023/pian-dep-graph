import G6, { Graph, registerNode, type GraphData, type NodeConfig, type EdgeConfig } from '@antv/g6'
import { type DepGraph } from '@/types'
import insertCss from 'insert-css'

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
  getContent: (e) => {
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

export const renderGraph = (data: DepGraph, element: HTMLElement) => {
  registerNode(
    'background-animate',
    {
      afterDraw(cfg, group) {
        const r = cfg.size / 2
        const back1 = group.addShape('circle', {
          zIndex: -3,
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: cfg.color,
            opacity: 0.6,
          },
          name: 'back1-shape',
        })
        const back2 = group.addShape('circle', {
          zIndex: -2,
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: cfg.color,
            opacity: 0.6,
          },
          name: 'back2-shape',
        })
        const back3 = group.addShape('circle', {
          zIndex: -1,
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: cfg.color,
            opacity: 0.6,
          },
          name: 'back3-shape',
        })
        group.sort()
        back1.animate(
          {
            r: r + 10,
            opacity: 0.1,
          },
          {
            duration: 3000,
            easing: 'easeCubic',
            delay: 0,
            repeat: true,
          }
        )
        back2.animate(
          {
            r: r + 10,
            opacity: 0.1,
          },
          {
            duration: 3000,
            easing: 'easeCubic',
            delay: 1000,
            repeat: true,
          }
        )
        back3.animate(
          {
            r: r + 10,
            opacity: 0.1,
          },
          {
            duration: 3000,
            easing: 'easeCubic',
            delay: 2000,
            repeat: true,
          }
        )
      },
    },
    'circle'
  )

  const graph = new Graph({
    container: element.id,
    width: element.scrollWidth,
    height: element.scrollHeight,
    ...options,
  })
  const graphData = changeData(data)
  graph.data(graphData)
  graph.render()

  if (typeof window !== 'undefined')
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return
      if (!element || !element.scrollWidth || !element.scrollHeight) return
      graph.changeSize(element.scrollWidth, element.scrollHeight)
    }
}

export const changeData = (data: DepGraph): GraphData => {
  const nodes: NodeConfig[] = []
  const edges: EdgeConfig[] = []

  for (const item of data) {
    nodes.push({
      id: item.name,
      label: item.name,
      name: item.name,
      // type: 'background-animate',
      // color: '#40a9ff',
      size: 24,
    })

    item.dependence.forEach((dep) => {
      edges.push({
        source: item.name,
        target: dep.name,
      })
    })
  }

  return {
    nodes,
    edges,
  }
}
