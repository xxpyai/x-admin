<template>
    <div class="full page-img-upload">
        <Upload ref="uploadRef" class="com" />
        <Folder ref="folderRef" class="com" />
        <Images ref="imagesRef" class="com" />
    </div>
</template>

<script setup lang="ts">
    defineOptions({ name: 'ImgUpload' })

    import Folder from '../components/Folder.vue'
    import Images from '../components/Images.vue'
    import Upload from '../components/Upload.vue'

    import { ref } from 'vue'

    const uploadRef = ref()
</script>

<style lang="scss" scoped>
    .page-img-upload {
        display: grid;
        height: calc(100vh - 80px);
        grid-template-rows: 26% calc(74% - 22px);
        grid-template-columns: 260px 1fr;
        gap: 22px;
        padding: 22px;
        background-image: linear-gradient(-225deg, #20e2d7 0%, #f9fea5 100%);
        .com {
            cursor: pointer;
            overflow: hidden;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.3);
            box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.05);
        }
        .com:nth-child(1) {
            grid-column: 1 / 3;
        }
    }
</style>
