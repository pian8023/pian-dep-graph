import path from 'path'
import ora from 'ora'
import chalk from 'chalk'
import figlet from 'figlet'
import inquirer from 'inquirer'
import { Command } from 'commander'
import { exec } from 'child_process'
import { existsSync, lstatSync, readFileSync } from 'fs-extra'

const COMMAND_NAME = 'depAnaTool-cli'
const InitPrompts = [
  {
    type: 'list',
    name: 'initChoice',
    message:
      'Please select an option: node_modules: Recursively iterate through package.json in all node_modules; lockfile: support package-lock.json/pnpm-lock.yaml/yarn.lock',
    choices: ['node_modules', 'lockfile'],
  },
]

const validateFilePath = (val: string) => {
  const filePath = path.resolve(process.cwd(), val)
  // 检查一个给定的路径是否指向一个文件
  if (!existsSync(filePath) || !lstatSync(filePath).isFile()) {
    console.error(`The provided path '${val}' does not point to an existing file.`)
    process.exit(1)
  }
  if (
    !(filePath.endsWith('pnpm-lock.yaml') || filePath.endsWith('yarn.lock') || filePath.endsWith('package-lock.json'))
  ) {
    console.error(`Please choose one of package-lock.json/pnpm-lock.yaml/yarn.lock`)
    process.exit(1)
  }

  return val
}

const validateDepth = (val: string) => {
  const parsedVal = parseInt(val, 10)
  const originalVal = parseFloat(val)

  if (isNaN(parsedVal) || parsedVal < 0 || originalVal !== parsedVal) {
    console.error('The value provided for depth must be a non-negative integer.')
    process.exit(1)
  }
  return parsedVal
}

const startNodeServer = (options: NodeJS.ProcessEnv) => {
  try {
    const pkgJsonContent = readFileSync('./package.json', 'utf8')
    const pkgJson = JSON.parse(pkgJsonContent)
    if (pkgJson.scripts.dev) {
      const nodeSever = exec(`pnpm run dev`, {
        cwd: process.cwd(),
        env: { ...process.env, ...options },
      })
      // 将子进程的输出流导向父进程的输出流
      nodeSever.stdout?.pipe(process.stdout)
      nodeSever.stderr?.pipe(process.stderr)

      // 传入后不再打开网页，只是将依赖关系以 JSON 形式存储到用户指定的文件
      if (options.savepath) {
        return
      }

      const webPkgJson = JSON.parse(readFileSync('../package.json', 'utf8'))
      if (webPkgJson.scripts.dev) {
        setTimeout(() => {
          const frontendServer = exec(`pnpm run dev`, { cwd: path.resolve(process.cwd(), '../') })
          frontendServer.stdout?.pipe(process.stdout)
          frontendServer.stderr?.pipe(process.stderr)
        }, 1000) // 延迟1秒以确保Node.js服务已经启动
      }
    }
  } catch (error) {
    console.error(`Failed to read package.json: ${error}`)
  }
}

export const main = async () => {
  console.log(
    '\r\n' +
      figlet.textSync(COMMAND_NAME, {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 200,
        whitespaceBreak: true,
      }) +
      '\r\n'
  )

  const program = new Command()
  program
    .name(COMMAND_NAME)
    .usage(`<command> [options]`)
    .version(`${COMMAND_NAME}:${require('../package.json').version}`)

  // <>必选参数，[]可选参数
  program
    .command('analyze')
    .alias('ana')
    .description(
      'Analyze the full dependencies (package name & version number), automatically open the page after analysis, and render the dependency graph'
    )
    .option('-f, --filepath <file-path>', 'The file you want to parse', validateFilePath)
    .option('-d, --depth [number]', 'Limit the analysis of depth n', validateDepth, 0)
    .option('-s, --savepath <save-path>', 'Save the output as JSON to the specified file')
    .action(async (options) => {
      console.log('options: ', options)
      const { filepath, depth, savepath } = options
      const initOptions = await inquirer.prompt(InitPrompts)

      if (initOptions.initChoice === 'node_modules') {
        const spinner = ora(`start parsing node_modules`)
        spinner.start()
        try {
          await startNodeServer({
            depth,
            savepath,
            choice: 'node_modules',
          })
          spinner.succeed(`parse node_modules succeed`)
        } catch (error) {
          spinner.fail(`parse node_modules failed: ${error}`)
        }
      } else if (initOptions.initChoice === 'lockfile') {
        if (!filepath) {
          console.error('Error: The --filepath option is required for "lockfile".')
          process.exit(1)
        }

        const spinner = ora(`start parsing ${path.basename(filepath)}: `)
        spinner.start()
        try {
          await startNodeServer({
            filepath,
            savepath,
            choice: 'lockfile',
          })
          spinner.succeed(`parse ${path.basename(filepath)} succeed`)
        } catch (error) {
          spinner.fail(`parse ${path.basename(filepath)} failed: ${error}`)
        }
      }
    })

  program.on('command:*', (obj) => {
    console.error('Unknown command' + obj[0])
  })

  program.on('--help', function () {
    // 前后两个空行调整格式
    console.log()
    console.log(`Run ${chalk.cyan(`${COMMAND_NAME} <command> --help`)} for detailed usage of given command.`)
    console.log()
  })

  program.parse(process.argv)
}
