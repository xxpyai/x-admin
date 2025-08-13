import pinia from '@/store'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import { getPlatformConfig } from './config'
import router from './router'
// import { useEcharts } from "@/plugins/echarts";
import { useElementPlus } from '@/plugins/elementPlus'
import { injectResponsiveStorage } from '@/utils/responsive'
import { createApp, type Directive } from 'vue'

import Table from '@pureadmin/table'

// 引入重置样式
import './style/reset.scss'

// 导入公共样式
import './style/index.scss'

// 一定要在 main.ts 中导入 tailwind.css，防止 vite 每次 hmr 都会请求 src/style/index.scss 整体 css 文件导致热更新慢的问题
import 'element-plus/dist/index.css'
import './style/tailwind.css'

// 导入字体图标
import './assets/iconfont/iconfont.css'
import './assets/iconfont/iconfont.js'

const app = createApp(App)

// 自定义指令
import * as directives from '@/directives'
Object.keys(directives).forEach(key => app.directive(key, (directives as { [key: string]: Directive })[key]))

// 全局注册 @iconify/vue 图标库
import { FontIcon, IconifyIconOffline, IconifyIconOnline } from './components/ReIcon'
app.component('IconifyIconOffline', IconifyIconOffline)
app.component('IconifyIconOnline', IconifyIconOnline)
app.component('FontIcon', FontIcon)

// 全局注册按钮级别权限组件
import { Auth } from '@/components/ReAuth'
import { Perms } from '@/components/RePerms'
app.component('Auth', Auth)
app.component('Perms', Perms)

// 全局注册 vue-tippy
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import VueTippy from 'vue-tippy'
app.use(VueTippy)

getPlatformConfig(app).then(async config => {
    app.use(pinia)
    app.use(router)
    await router.isReady()
    injectResponsiveStorage(app, config)
    app.use(MotionPlugin).use(useElementPlus).use(Table)
    // .use(useEcharts);
    app.mount('#app')
})
