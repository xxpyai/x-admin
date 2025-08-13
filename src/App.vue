<template>
    <el-config-provider>
        <router-view />
        <ReDialog />
    </el-config-provider>
</template>

<script setup lang="ts">
    import { ReDialog } from '@/components/ReDialog'
    import { ElConfigProvider } from 'element-plus'
</script>
