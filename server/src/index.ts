import { Command } from 'commander'
import inquirer from 'inquirer'
import path from 'path'
import { readFileSync, writeFileSync } from 'fs-extra'

export const main = async () => {
  const CWD = process.cwd()
  const program = new Command()

  program.version('1.0.0')

  program
    .command('build')
    .description('打包cli成功')
    .option('-d, --debug', 'whether to enable debug mode?', false)
    .option('-e, --envName <envName>', 'get environment variable name')
    .action(async () => {
      // inquirer
      //   .prompt([
      //     {
      //       type: 'confirm',
      //       name: 'language',
      //       message: '新建项目是否引入typescript?',
      //     },
      //     {
      //       type: 'input',
      //       name: 'desc',
      //       message: '请输入项目备注',
      //     },
      //   ])
      //   .then((result) => {
      //     console.log('请输入', result)
      //   })
    })

  // process.argv.forEach(function (val, index, array) {
  //   console.log('参数' + index + ': ' + val)
  // })

  console.log('program.opts(): ', program.opts())

  program.parse(process.argv)

  program.on('option:debug', () => {
    console.log('开启了debug模式')
  })

  program.on('command:*', (obj) => {
    console.error('未知的命令：' + obj[0])
  })
}
