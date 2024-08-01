# pian-dep-graph

依赖关系分析工具

安装依赖：当前目录 /pian-dep-graph 执行 pnpm i, cd depAnaTool 后执行 pnpm i
/depAnaTool 目录下 npm link 链接到全局后可执行 depAnaTool-cli 命令

/depAnaTool 目录下 执行 depAnaTool-cli analyze：
1、选择node_modules会从项目 package.json 出发，递归遍历所有 node_modules 中的 package.json ，生成模块依赖关系图。此时输入filepath不做处理。
2、选择lockfile会解析package-lock.json/pnpm-lock.yaml/yarn.lock文件。此时输入depth不做处理。

例如：depAnaTool-cli analyze --filepath=./pnpm-lock.yaml --savepath=../../target --depth=2
--filepath：选择lockfile时必选项，解析文件的路径。
--savepath：传入后不再打开网页，只是将依赖关系以 JSON 形式存储到指定的文件。
--depth：选择node_modules时，向下递归分析的层次深度，默认为0
