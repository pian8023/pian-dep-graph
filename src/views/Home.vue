<template>
  <div class="common-layout">
    <aside class="aside">
      <h3 class="title">依赖分析工具</h3>
      <el-tabs v-model="activeName">
        <el-tab-pane label="dependencies" name="dependencies">
          <ol>
            <li v-for="(item, index) in dependenceList" :key="index" @click="chooseDepence(item)" class="li-item">
              {{ item }}
            </li>
          </ol>
        </el-tab-pane>
        <el-tab-pane label="devDependencies" name="devDependencies">
          <ol>
            <li v-for="(item, index) in devDependenceList" :key="index" @click="chooseDepence(item)" class="li-item">
              {{ item }}
            </li>
          </ol>
        </el-tab-pane>
      </el-tabs>
    </aside>

    <div class="container">
      <header class="header">
        <el-input
          v-model="depName"
          clearable
          size="large"
          style="width: 400px"
          placeholder="依赖名"
          :prefix-icon="Search"
          @change="handleSearch" />
      </header>

      <main class="main" v-loading="loading">
        <div id="mountNode" v-show="GraphNodes.length"></div>
        <el-empty :image-size="200" v-show="!GraphNodes.length" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { renderGraph } from '@/utils/draph'
import { getGraphNodes } from '@/utils/api'

const loading = ref(true)
const depName = ref('')
const activeName = ref('dependencies')
const dependenceList = ref([])
const devDependenceList = ref([])
const GraphNodes = ref([])

onMounted(() => {
  handleSearch()
})

const handleSearch = async () => {
  loading.value = true
  const { nodes, dependencies, devDependencies } = await getGraphNodes(depName.value)
  loading.value = false
  GraphNodes.value = nodes
  dependenceList.value = dependencies
  devDependenceList.value = devDependencies
  const element = document.getElementById('mountNode')
  nextTick(() => {
    renderGraph(nodes, element!)
  })
}

const chooseDepence = (item: string) => {
  depName.value = item
  handleSearch()
}
</script>

<style lang="less" scoped>
.common-layout {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;

  .aside {
    width: 272px;
    margin-right: 8px;
    height: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    .title {
      text-align: center;
    }

    .li-item {
      cursor: pointer;
      &:hover {
        color: #1e80ff;
      }
    }
  }

  .container {
    width: calc(100% - 280px);
    height: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }

  .header {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main {
    width: 100%;
    height: calc(100% - 60px);
    display: flex;
    align-items: center;
    justify-content: center;

    #mountNode {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
