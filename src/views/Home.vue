<template>
  <div class="common-layout">
    <aside class="aside">
      <h3>依赖分析工具</h3>
      <el-tabs v-model="activeName">
        <el-tab-pane label="dependencies" name="dependencies"></el-tab-pane>
        <el-tab-pane label="devDependencies" name="devDependencies"></el-tab-pane>
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
          @clear="handleSearch"
          @blur="handleSearch"
          @enter="handleSearch" />
      </header>

      <main class="main" v-loading="loading">
        <div id="mountNode" v-if="GraphNodes.length"></div>
        <el-empty :image-size="200" v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { renderGraph } from '@/utils/draph'
import { getGraphNodes } from '@/utils/api'

const loading = ref(true)
const depName = ref('')
const activeName = ref('dependencies')

const GraphNodes = ref([{}])

onMounted(() => {
  handleSearch()
})

const handleSearch = async () => {
  loading.value = true
  const data = await getGraphNodes(depName.value)
  const element = document.getElementById('mountNode')
  if (element) {
    await renderGraph(data, element)
  }
  loading.value = false
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
    }
  }
}
</style>
