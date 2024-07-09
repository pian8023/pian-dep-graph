import path from 'path'
import { dependence, type DepGraph } from '../types'
import { writeFileSync, existsSync, mkdirSync } from 'fs-extra'

// 根据name对nodes去重
export const deduplicateByName = (arr: DepGraph['nodes']) => {
  const seen = new Set()
  return arr.reduce((acc: DepGraph['nodes'], item) => {
    const keyValue = item['name']
    if (!seen.has(keyValue)) {
      seen.add(keyValue)
      acc.push(item)
    }
    return acc
  }, [])
}

// 关键字筛选
export const searchByName = (data: any, keyword: string) => {
  return data
    .map((item: { name: string | string[]; dependence: any }) => {
      if (item.name.includes(keyword)) {
        return item
      } else if (item.dependence) {
        const filteredDependence = searchByName(item.dependence, keyword)

        if (filteredDependence.length > 0) {
          return {
            ...item,
            dependence: filteredDependence,
          }
        }
      }
      // 如果当前项目不匹配关键字，也不包含匹配关键字的 dependence，跳过该项目
      return null
    })
    .filter(Boolean) // 过滤掉 null 值
}

// 深度分析
export const parseByDepth = (nodes: DepGraph['nodes']) => {
  const arr: dependence[] = []
  nodes.map((node) => {
    if (node.dependence.length) {
      node.dependence.map((item) => {
        arr.push(item)
      })
    }
  })

  return arr
}

// 存储为Json文件
export const saveJsonFile = (data: any, lockPath: string, filePath: string) => {
  const savePath = path.resolve(__dirname, filePath)
  const graphFilePath = path.join(savePath, path.basename(lockPath))
  const json = JSON.stringify(data, null, 2) // 缩进为2

  if (!existsSync(savePath)) {
    mkdirSync(savePath, { recursive: true })
  }

  try {
    writeFileSync(graphFilePath, json, 'utf-8')
    console.log('The file has been saved!', graphFilePath)
  } catch (err) {
    console.error('Error saving file', err)
  }
}
