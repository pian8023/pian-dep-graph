import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'

const program = new Command()

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

console.log(chalk.green('I am a green line ' + chalk.blue.underline.bold('with a blue substring') + ' that becomes green again!'))

program.name('dep-graph-cli').usage(`<command> [options]`).version('0.0.1')

program
  .command('analyze')
  .description('分析从当前目录 package.json 开始递归查找到的全量依赖关系(包名 & 版本号)，分析完成后自动打开网页，并渲染依赖关系图')
  .action(async (name: string) => {
    console.log('start init koa project:', name)
    const initOptions = await inquirer.prompt(InitPrompts)
    console.log('initOptions', initOptions)
  })

program.parse(process.argv)

program.on('--help', function () {
  // 前后两个空行调整格式，更舒适
  console.log()
  console.log(`Run ${chalk.cyan('zc-cli <command> --help')} for detailed usage of given command.`)
  console.log()
})
