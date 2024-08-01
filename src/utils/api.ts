import axios, { AxiosInstance } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10 * 1000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
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
