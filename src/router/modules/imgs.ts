export default {
    path: '/imgs',
    redirect: '/imgs/upload',
    meta: {
        icon: 'ep/picture-filled',
        title: '图片',
        rank: 2
    },
    children: [
        {
            path: '/imgs/upload',
            name: 'ImgUpload',
            component: () => import('@/views/imgs/upload/index.vue'),
            meta: {
                title: '上传'
            }
        }
    ]
} satisfies RouteConfigsTable
