<template>
    <!-- 默认情况下，el-upload 组件在选择多个文件时会为每个文件发送单独的请求。为了在上传多张图片时获得更好的性能，修改组件在单个请求中发送所有文件，从而减少服务器负载 -->
    <el-upload
        ref="uploadRef"
        action="#"
        drag
        :auto-upload="false"
        list-type="picture"
        class="component-upload"
        :limit="state.limit"
        :accept="state.accept"
        :show-file-list="false"
        :headers="state.headers"
        :data="state.uploadData"
        :file-list="state.fileList"
        :multiple="state.limit !== 1"
        :on-change="handleChange"
        :on-exceed="handleExceed">
        <IconClose class="icon-upload" />
    </el-upload>
</template>

<script setup>
    import { message } from '@/utils/message'
    import { cloneDeep } from 'lodash-es'
    import { computed, reactive, ref } from 'vue'
    import IconClose from '~icons/ep/plus'

    const props = defineProps({
        folders: {
            type: Array,
            default: () => []
        }
    })

    const uploadRef = ref(null)

    const folder = computed(() => {
        return props.folders.filter(item => item.active)[0]
    })

    const state = reactive({
        limit: 2,
        fileList: [],
        fileInfo: [],
        formData: new FormData(),
        accept: '.png, .jpeg, .jpg',
        uploadData: { from: 'aiweb', path: 'mypage' },
        headers: { authorization: '', 'Content-Type': 'multipart/form-data' }
    })

    const handleExceed = files => {
        message(`单次最多上传 ${state.limit} 张图片，本次选择了 ${files.length} 张图片`)
    }

    // 清除上传记录
    const clearCache = () => {
        state.fileList = []
        state.fileInfo = []
        state.formData = new FormData()
    }

    // on-change 文件状态改变时的钩子，添加文件、上传成功、上传失败时都会被调用，在 before-upload 之前调用
    // file：Element-Plus的包装对象   file.raw：浏览器原生File对象
    const handleChange = async (file, fileList) => {
        // 清除缓存
        clearCache()

        // 上传文件数量
        let filesNum = 0
        const upload_img = document.getElementsByClassName('component-upload')
        if (upload_img && upload_img.length > 0) {
            const upload = upload_img[0].getElementsByTagName('input')
            if (upload && upload.length > 0 && upload[0].files && upload[0].files.length > 0) {
                filesNum = upload[0].files.length
            }
        }

        if (filesNum !== fileList.length) return

        // 执行校验
        await beforeUpload(fileList)

        // 执行上传
        await execUpload()
    }

    // 设置 :auto-upload="false" 时，需要用 :on-change 方法监听
    // 因为 :auto-upload="false" 时，on-change 和 before-upload 有冲突，会导致 before-upload 方法不起作用
    const beforeUpload = async fileList => {
        return new Promise((resolve, reject) => {
            // 校验文件
            const hasInvalidFile = fileList.some(file => {
                const { type, size, name } = file.raw

                // 文件类型
                const isImg = type.startsWith('image/')
                if (!isImg) {
                    message('只能上传图片!')
                    reject()
                    return true
                }

                // 文件大小
                const mb = size / 1024 / 1024
                if (mb > 3) {
                    message('图片大小不能超过3MB!')
                    reject()
                    return true
                }

                // 扩展名
                const ext = name.substring(name.lastIndexOf('.') + 1)
                if (!state.accept.includes(ext)) {
                    message(`只能上传${state.accept}格式图片`)
                    reject()
                    return true
                }
            })

            // 如果有无效文件
            if (hasInvalidFile) return

            fileList.forEach(file => {
                //
                const { size, name, uid } = file.raw

                // 扩展名
                const ext = name.substring(name.lastIndexOf('.') + 1)

                // 图片名
                const oname = name.substring(0, name.lastIndexOf('.'))

                // 新名称
                const nname = `${folder.value.id}_${uid}.${ext}`

                const reader = new FileReader()
                // ElementPlus 在文件上传过程中会创建一个包装对象 file，而 file.raw 是实际的原始 File 对象（即浏览器原生的 File 对象）
                reader.readAsDataURL(file.raw)

                reader.onload = e => {
                    const img = new Image()
                    img.src = e.target.result

                    img.onload = () => {
                        const nfile = new File([file.raw], nname, { type: file.type })
                        // Object.defineProperty(nfile, 'name', { value: nname, writable: false })

                        // 记录图片信息
                        const { width, height } = img
                        const info = {
                            id: uid,
                            oname,
                            nname,
                            ext,
                            sourceAbsPath: file.raw.path, // 上传时的图片绝对路径
                            targetAbsPath: `/src/assets/img/${nname}`, // 当前存储图片的绝对路径
                            size,
                            width,
                            height
                        }

                        state.fileInfo.push(info)
                        state.formData.append('file', nfile)

                        // 返回修改后的文件对象
                        state.fileInfo.length === fileList.length && resolve()
                    }

                    img.onerror = () => {
                        message('图片加载失败!')
                        reject()
                    }
                }

                reader.onerror = () => {
                    message('读取文件失败!')
                    reject()
                }
            })
        })
    }

    const execUpload = async () => {
        // const res = await uploadImage(state.formData)
        const res = state.fileInfo.map(item => item.id)

        const s = []
        const f = []
        state.fileInfo.forEach(item => (res.includes(item.id) ? s.push(item) : f.push(item)))
        f.length && message(`上传成功: ${s.length}个, 上传失败: ${f.length}个`)
        await copyImage(s)
        await updateFolder(s)
    }

    const copyImage = async arr => {
        const { msg } = await window.ipcRenderer.invoke('images:copy', cloneDeep(arr))
        msg && message(msg)
    }

    const updateFolder = async arr => {
        const folderBak = cloneDeep(folder.value)
        if (folderBak?.imgs?.length) {
            folderBak.imgs.push(...arr)
        } else {
            folderBak.imgs = arr
        }

        const { msg } = await window.ipcRenderer.invoke('folder:edit', cloneDeep(folderBak))
        msg && message(msg)
        if (!msg) {
            if (folderBak?.imgs?.length) {
                folder.value.imgs.push(...arr)
            } else {
                folder.value.imgs = arr
            }
        }
    }

    const open = () => {
        const inputEl = uploadRef.value.$el.querySelector('input[type="file"]')
        inputEl && inputEl.click()
    }

    defineExpose({ open })
</script>

<style lang="scss" scoped>
    .component-upload {
        .icon-upload {
            font-size: 30px;
            color: rgba(0, 0, 0, 0.35);
        }
        :deep(.el-upload) {
            height: 100% !important;
            width: 100% !important;
        }
        :deep(.el-upload-dragger) {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 0;
            border: none;
            background: transparent;
        }
    }
</style>
