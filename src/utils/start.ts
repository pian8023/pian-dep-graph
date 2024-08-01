import path from 'path'
import { exec } from 'child_process'

export const startWeb = () => {
  const webServer = exec(`pnpm run dev`, { cwd: path.resolve(process.cwd(), '../') })
  webServer.stdout?.pipe(process.stdout)
  webServer.stderr?.pipe(process.stderr)
}
