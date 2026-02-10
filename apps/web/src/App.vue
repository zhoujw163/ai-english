<template>
    <el-config-provider :locale="zhCn">
        <RouterView />
        <Search />
    </el-config-provider>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Search from './components/Search/index.vue'
</script>
