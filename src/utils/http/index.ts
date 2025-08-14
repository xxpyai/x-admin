import { getToken } from '@/utils/auth'
import { message } from '@/utils/message'
import Axios, { type AxiosInstance, type AxiosRequestConfig, type CustomParamsSerializer } from 'axios'
import { stringify } from 'qs'
import NProgress from '../progress'
import type { PureHttpError, PureHttpRequestConfig, PureHttpResponse, RequestMethods } from './types.d'

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
    // 请求超时时间
    timeout: 10000,
    // 设置默认请求头
    headers: {
        Accept: 'application/json, text/plain, */*', // 接受的响应数据类型
        'Content-Type': 'application/json', // 发送的数据类型
        'X-Requested-With': 'XMLHttpRequest' // 标识这是一个AJAX请求
    },
    // 数组格式参数序列化配置，解决axios对数组参数序列化的问题（https://github.com/axios/axios/issues/5142）
    paramsSerializer: {
        serialize: stringify as unknown as CustomParamsSerializer
    }
}

class PureHttp {
    constructor() {
        this.httpInterceptorsRequest()
        this.httpInterceptorsResponse()
    }

    // 保存当前 Axios 实例对象
    private static axiosInstance: AxiosInstance = Axios.create(defaultConfig)

    /** 请求拦截 */
    private httpInterceptorsRequest(): void {
        PureHttp.axiosInstance.interceptors.request.use(
            async (config: PureHttpRequestConfig): Promise<any> => {
                // 开启进度条动画
                config.loading !== false && NProgress.start()

                config.headers['Token'] = getToken().token

                return config
            },
            error => Promise.reject(error)
        )
    }

    /** 响应拦截 */
    private httpInterceptorsResponse(): void {
        PureHttp.axiosInstance.interceptors.response.use(
            (res: PureHttpResponse) => {
                // console.log('----------- res success ---------', res)

                // 关闭进度条动画
                NProgress.done()

                const { config, data } = res

                // 不自动处理响应结果，直接返回给调用者自行处理
                if (config?.autores === false) {
                    return res
                }

                const { code, msg } = data
                if (code === 200) {
                    return data
                }

                message(msg, { type: 'error' })
                return Promise.reject({ code, msg, success: false, data: null })

                // token 失效
                // if (res?.data?.code === -200) {
                //     useUserStoreHook().logOut()
                //     message('请重新登录～', { type: 'error' })
                //     return Promise.reject(new Error(res?.data?.msg))
                // }
            },
            (error: PureHttpError) => {
                // console.log('----------- res error -----------', error)

                // 关闭进度条动画
                NProgress.done()

                const { status, message } = error

                // 所有的响应异常 区分来源为取消请求/非取消请求
                return Promise.reject({ code: status, msg: message, success: false, data: null })
            }
        )
    }

    /** 通用请求工具函数 */
    public request<T>(method: RequestMethods, url: string, param?: AxiosRequestConfig, axiosConfig?: PureHttpRequestConfig): Promise<T> {
        const config = { method, url, ...param, ...axiosConfig } as PureHttpRequestConfig
        // console.log('----------- req config ----------', config)

        // 单独处理自定义请求/响应回调
        return new Promise((resolve, reject) => {
            PureHttp.axiosInstance
                .request(config)
                .then((res: undefined) => resolve(res))
                .catch(err => reject(err))
        })
    }

    /** 单独抽离的`post`工具函数 */
    public post<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: PureHttpRequestConfig): Promise<T> {
        return this.request<T>('post', url, params, config)
    }

    /** 单独抽离的`get`工具函数 */
    public get<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: PureHttpRequestConfig): Promise<T> {
        return this.request<T>('get', url, params, config)
    }
}

export const http = new PureHttp()
