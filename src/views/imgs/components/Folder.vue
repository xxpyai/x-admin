<template>
    <div class="page-img-folder">
        <el-scrollbar>
            <div v-for="item in 40" :key="item" class="folder">{{ item }}</div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
    defineOptions({ name: '' })
</script>

<style lang="scss" scoped>
    .page-img-folder {
        .folder {
            height: 30px;
        }
    }
</style>
