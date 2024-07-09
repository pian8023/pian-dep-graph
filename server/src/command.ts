import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import path from 'path'
import figlet from 'figlet'

const program = new Command()
program
  .name('dep-graph-cli')
  .usage(`<command> [options]`)
  .version(`dep-graph-cli' ${require('../package.json').version}`)

const InitPrompts = [
  {
    name: 'description',
    message: 'please input description',
    default: '',
  },
  {
    name: 'author',
    message: 'please input author',
    default: '',
  },
]

const spinner = ora('Loading unicorns')
// 启动loading
spinner.start()
setTimeout(() => {
  spinner.color = 'yellow'
  spinner.text = 'Loading rainbows'
}, 1000)

// loading 成功
spinner.succeed()
// loading 失败
spinner.fail()

/**
 * loading加载效果
 * @param {String} message 加载信息
 * @param {Function} fn 加载函数
 * @param {List} args fn 函数执行的参数
 * @returns 异步调用返回值
 */
async function loading(message, fn, ...args) {
  const spinner = ora(message)
  spinner.start() // 开启加载
  let executeRes = await fn(...args)
  spinner.succeed()
  return executeRes
}

console.log(
  chalk.green('I am a green line ' + chalk.blue.underline.bold('with a blue substring') + ' that becomes green again!')
)

figlet.text(
  'dep-graph-cli!',
  {
    font: '3D-ASCII',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log('Something went wrong...')
      console.dir(err)
      return
    }
    console.log(data)
  }
)

program
  .command('analyze')
  .description(
    '分析从当前目录 package.json 开始递归查找到的全量依赖关系(包名 & 版本号)，分析完成后自动打开网页，并渲染依赖关系图'
  )
  .action(async (name: string) => {
    console.log('start init koa project:', name)
    const initOptions = await inquirer.prompt(InitPrompts)
    console.log('initOptions', initOptions)
  })

program.on('--help', function () {
  // 前后两个空行调整格式
  console.log()
  console.log(`Run ${chalk.cyan('dep-graph-cli <command> --help')} for detailed usage of given command.`)
  console.log()
})

program.on('command:*', (obj) => {
  console.error('未知的命令：' + obj[0])
})

program.parse(process.argv)
