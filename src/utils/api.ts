import axios, { AxiosInstance } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10 * 1000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response
  },
  (error) => {
    // 处理响应错误
    return Promise.reject(error)
  }
)

export const getGraphNodes = async (name: string) => {
  const res = await axiosInstance.get('/graph', {
    params: {
      name,
    },
  })
  return res.data.data
}
