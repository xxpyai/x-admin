import { getQueryMap, subBefore } from '@pureadmin/utils'
import { removeToken, setToken, type DataInfo } from './auth'
;(function () {
    // 获取 url 中的参数
    const params = getQueryMap(location.href) as DataInfo<Date>
    const must = ['username', 'roles', 'token']
    const mustLength = must.length
    if (Object.keys(params).length !== mustLength) return

    // url 参数满足 must 里的全部值，才判定为单点登录，避免非单点登录时刷新页面无限循环
    let sso = []
    let start = 0

    while (start < mustLength) {
        if (Object.keys(params).includes(must[start]) && sso.length <= mustLength) {
            sso.push(must[start])
        } else {
            sso = []
        }
        start++
    }

    if (sso.length === mustLength) {
        // 判定为单点登录

        // 清空本地旧信息
        removeToken()

        // 保存新信息到本地
        setToken(params)

        // 删除不需要显示在 url 的参数
        delete params.roles
        delete params.token

        const newUrl = `${location.origin}${location.pathname}${subBefore(location.hash, '?')}?${JSON.stringify(params).replace(/["{}]/g, '').replace(/:/g, '=').replace(/,/g, '&')}`

        // 替换历史记录项
        window.location.replace(newUrl)
    } else {
        return
    }
})()
