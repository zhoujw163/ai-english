<template>
    <el-config-provider :locale="zhCn">
        <RouterView />
        <Search />
        <Login />
    </el-config-provider>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Search from './components/Search/index.vue'
import Login from './components/Login/index.vue'
import { IS_SHOW_LOGIN } from './components/Login/type'

// 是否显示登录框 并且扩展为全局调用 默认不显示
provide(IS_SHOW_LOGIN, ref(false))
</script>
