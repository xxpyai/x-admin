import { http } from '@/utils/http'

export const tabList = data => {
    return http.request(
        'post',
        '/login',
        { data },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            loading: true,
            autores: true
        }
    )
}
