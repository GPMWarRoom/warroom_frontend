<template>
    <div id="app">
        <!-- Header -->
        <header class="app-header">
            <div class="header-left">
                <el-button type="text" @click="toggleSideMenu">
                    <el-icon>
                        <Fold v-if="isCollapse" />
                        <Expand v-else />
                    </el-icon>
                </el-button>
                <h1>War Room</h1>
            </div>
            <div class="header-right">
                <el-dropdown>
                    <span class="user-profile"> {{ userName }} <el-icon>
                            <ArrowDown />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu v-if="isLogin">
                            <el-dropdown-item>設定</el-dropdown-item>
                            <el-dropdown-item>登出</el-dropdown-item>
                        </el-dropdown-menu>
                        <el-dropdown-menu v-else>
                            <el-dropdown-item @click="login">登入</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </header>
        <!-- Main Container -->
        <div class="app-container">
            <!-- Side Menu -->
            <el-menu class="side-menu" :collapse="isCollapse" background-color="#1e1e1e" text-color="#fff" active-text-color="rgb(32, 160, 255)" :collapse-transition="true">
                <el-menu-item v-for="item in menu" :index="item.path" :route="item.path" @click="handleSelect(item?.path as string)">
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <template #title>{{ item.title }}</template>
                </el-menu-item>
            </el-menu>
            <!-- Main Content -->
            <main class="main-content">
                <ContentContainer>
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                    </router-view>
                </ContentContainer>
            </main>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref ,computed} from "vue";
import { useRouter } from "vue-router";
import { menuRoutes } from "../router";
import ContentContainer from "../components/ContentContainer.vue";
import type { RouteMeta } from "vue-router";
import { userStore } from "../stores/user";

const router = useRouter();
const user = userStore();
const menu = menuRoutes as RouteMeta[];
const isCollapse = ref(false);

const toggleSideMenu = () => {
    isCollapse.value = !isCollapse.value;
};

const handleSelect = (Path: string) => {
    router.push(Path);
};

const isLogin = computed(() => {
    return user.getIsLogin
})

const userName = computed(() => {
    return user.name
})

const login = () => {
    router.push('/login')
}
</script>
<style scoped>
.app-header {
    height: 40px;
    background-color: #1e1e1e;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-left h1 {
    margin: 0;
    font-size: 1.1rem;
    color: #fff;
}

.header-right {
    color: #fff;
}

.user-profile {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.app-container {
    display: flex;
    height: calc(100vh - 40px);
    margin-top: 40px;
}

.side-menu {
    height: calc(100vh - 40px);
    border-right: 1px solid #333;
}

.side-menu:not(.el-menu--collapse) {
    width: 150px;
}

.main-content {
    flex: 1;
    padding: 5px;
    overflow-y: auto;
    height: calc(100vh - 60px);
}

/* 響應式設計 */
@media (max-width: 768px) {
    .side-menu {
        position: fixed;
        z-index: 999;
        height: calc(100vh - 40px);
    }

    .main-content {
        margin-left: 64px;
        /* 收起時的寬度 */
    }

    .side-menu:not(.el-menu--collapse)+.main-content {
        margin-left: 200px;
    }
}
</style>
