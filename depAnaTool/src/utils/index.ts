import path from 'path'
import { writeFile, mkdir } from 'fs-extra'
import { dependence, DepGraphNode, type DepGraph } from '../types'

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
export const searchByName = <T extends DepGraphNode | dependence>(data: T[], keyword: string): T[] => {
  return data
    .map((item) => {
      if (item.name.includes(keyword)) {
        return item
      } else if ('dependence' in item && Array.isArray(item.dependence)) {
        const filteredDependence = searchByName(item.dependence as T[], keyword)
        if (filteredDependence.length > 0) {
          return {
            ...item,
            dependence: filteredDependence,
          }
        }
      }
      return undefined
    })
    .filter((item) => item !== undefined) as T[]
}

// 存储为Json文件
export const saveJsonFile = async (data: DepGraphNode[], filePath: string, lockPath?: string) => {
  const savePath = path.resolve(process.cwd(), filePath)
  const graphFilePath = lockPath
    ? path.join(savePath, `${path.basename(lockPath)}.json`)
    : path.join(savePath, 'modulesData.json')
  const json = JSON.stringify(data, null, 2)

  await mkdir(savePath, { recursive: true })

  try {
    await writeFile(graphFilePath, json, 'utf-8')
    console.log('The file has been saved!', graphFilePath)
  } catch (err) {
    console.error('Error saving file', err)
  }
}
