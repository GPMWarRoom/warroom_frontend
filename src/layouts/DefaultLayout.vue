<template>
    <div id="app">
        <!-- Header -->
        <header class="app-header">
            <div class="header-left">
                <el-button link @click="toggleSideMenu">
                    <el-icon size="20">
                        <Fold v-if="isCollapse" />
                        <Expand v-else />
                    </el-icon>
                </el-button>
                <h1 class="px-1">GPM AGV Dashboard</h1>
            </div>
            <AlarmMessage v-if="false" class="mx-2" />
            <div class="header-right">
                <el-dropdown trigger="hover">
                    <template #default>
                        <el-button
                        class="bell-btn"
                        type="text"
                        circle
                        style="margin-right: 8px;"
                        :class="{ 'bell-alarm': alarmStore.isAlarmPlaying }"
                        @click="alarmStore.isAlarmPlaying ? alarmStore.stopAlarm() : null"
                        >
                        <el-icon style="font-size: 22px;">
                            <BellFilled />
                        </el-icon>
                        </el-button>
                    </template>
                    <template #dropdown>
                        <el-dropdown-menu>
                        <el-dropdown-item
                            :disabled="!alarmStore.isMuted"
                            @click="alarmStore.unmuteAlarm()"
                        >
                            <el-icon style="margin-right:4px;"><BellFilled /></el-icon>
                            正常
                        </el-dropdown-item>
                        <el-dropdown-item
                            :disabled="alarmStore.isMuted"
                            @click="alarmStore.muteAlarm()"
                        >
                            <el-icon style="margin-right:4px;"><Mute /></el-icon>
                            永久靜音
                        </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div class="theme-switch" role="group" aria-label="色彩切換">
                    <button type="button" :class="{ active: uiStats.theme === 'dark' }" @click="uiStats.setTheme('dark')">
                        <el-icon><Moon /></el-icon>
                        <span>黑暗</span>
                    </button>
                    <button type="button" :class="{ active: uiStats.theme === 'light' }" @click="uiStats.setTheme('light')">
                        <el-icon><Sunny /></el-icon>
                        <span>明亮</span>
                    </button>
                </div>
                <time class="system-clock" :datetime="nowText">{{ nowText }}</time>
                <el-dropdown v-if="false">
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
            <el-menu class="side-menu" :collapse="isCollapse" :collapse-transition="true" :default-active="route.path" :key="uiStats.theme" @select="handleSelect">
                <el-menu-item v-for="item in menu" :index="item.path + ''" :route="item.path" @click="handleSelect(item?.path as string)">
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
                <feedbackForm v-if="false"></feedbackForm>
            </main>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import dayjs from 'dayjs'
import { useRouter } from "vue-router";
import { menuRoutes } from "../router";
import ContentContainer from "../components/ContentContainer.vue";
import feedbackForm from "../components/feedbackForm.vue";
import { uiStatsStore } from "../stores/UiStats";
import type { RouteMeta } from "vue-router";
import { userStore } from "../stores/user";
import AlarmMessage from "../components/Alarms/AlarmMessage.vue";
import { useRoute } from "vue-router";
import { BellFilled, ArrowDown, Fold, Expand, Moon, Sunny } from '@element-plus/icons-vue'
import { useAlarmStore } from '@/stores/alert'
import { useSessionRef } from '@/composables/useSessionState'

const alarmStore = useAlarmStore()
const route = useRoute();
const router = useRouter();
const user = userStore();
const menu = menuRoutes as RouteMeta[];
// 側邊選單收合狀態在自動重新整理後保留
const isCollapse = useSessionRef('side-collapsed', false, v => typeof v === 'boolean');
const uiStats = uiStatsStore();
uiStats.setCollapse(isCollapse.value);
const toggleSideMenu = () => {
    isCollapse.value = !isCollapse.value;
    uiStats.setCollapse(isCollapse.value);
};

const handleSelect = (Path: string) => {
    router.push(Path);
    uiStats.setRouteSelected(Path);
};

// 系統時間（瀏覽器時間），對齊整秒更新，避免 setInterval 漂移造成跳秒
const nowText = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
let clockTimer: number | undefined
const tickClock = () => {
    const now = dayjs()
    nowText.value = now.format('YYYY-MM-DD HH:mm:ss')
    clockTimer = window.setTimeout(tickClock, 1000 - now.millisecond())
}
onMounted(tickClock)
onUnmounted(() => window.clearTimeout(clockTimer))

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
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
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
    flex: 0 0 auto;
    min-width: 0;
}

.header-left h1 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-color);
    white-space: nowrap;
}

.header-right {
    color: var(--text-color);
    align-items: center;
    justify-content: center;
    display: flex;
    font-weight: bold;
}

.user-profile {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.app-container {
    display: flex;
    min-height: calc(100vh - 40px);
    margin-top: 40px;
}

.side-menu {
    --el-menu-bg-color: transparent;
    --el-menu-hover-bg-color: var(--hover-bg);
    --el-menu-text-color: var(--text-color);
    --el-menu-active-color: var(--accent-color);
    --el-menu-item-height: 42px;
    height: calc(100vh - 40px);
    padding-top: 8px;
    border-right: 1px solid var(--border-color);
    background-color: var(--side-bg);
}

.side-menu:not(.el-menu--collapse) {
    width: 150px;
}

.side-menu .el-menu-item {
    margin: 0 8px 6px;
    border-radius: 12px;
}

.side-menu:not(.el-menu--collapse) .el-menu-item {
    padding-left: 14px !important;
}

.side-menu.el-menu--collapse .el-menu-item {
    margin: 0 6px 6px;
}

.side-menu .el-menu-item.is-active {
    background-color: var(--hover-bg);
    box-shadow: inset 0 0 0 1px var(--border-strong);
}

.main-content {
    flex: 1;
    padding: 5px;
    overflow-y: auto;
    height: calc(100vh - 40px);
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
.bell-btn .el-icon {
  opacity: 0.3;
  transition: color 0.2s, opacity 0.2s;
}
.bell-btn.bell-alarm .el-icon {
  color: #ff4d4f;
  opacity: 0.7;
}
.bell-btn.bell-alarm:hover .el-icon {
  color: #ff4d4f;
  opacity: 1;
}
.bell-btn {
  position: relative;
}
.theme-switch {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-pill);
  overflow: hidden;
  background: transparent;
}
.theme-switch button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 10px;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted, var(--text-color));
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}
.theme-switch button.active {
  background: var(--accent-gradient);
  color: #fff;
  box-shadow: var(--accent-glow);
}
.system-clock {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--text-color);
}
.theme-switch .el-icon {
  font-size: 14px;
}
</style>
