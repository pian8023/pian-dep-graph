import Koa from 'koa'
import router from './routes'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import { errorCatch } from './middlewares/error-catch'

const app = new Koa()
app.use(errorCatch())
app.use(logger())
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

// 假如这里改成：

// export const bootstrap=(params:{xxx:string;foo:string;...})=>{
//   const app = new Koa()
//   app.use(errorCatch())
//   app.config=params;
//   app.use(logger())
//   app.use(bodyParser())
//   app.use(router.routes()).use(router.allowedMethods())

//   app.listen(3000, () => {
//     console.log('Server is running on port 3000')
//   })
// }

// 你就不需要再通过 process.env 传值了