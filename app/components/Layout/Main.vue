<script setup>
import sidebarItems from '@/components/Layout/Full/vertical-sidebar/sidebarItem';
import { Menu2Icon, BellRingingIcon } from 'vue-tabler-icons';
import { useUserStore } from '@/stores/User';
import { onMounted } from 'vue';
import { useAutoAnimate } from '@formkit/auto-animate/vue';

const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);
const userStore = useUserStore();
const [listRef] = useAutoAnimate();

// Fetch user data on mount (was previously conditional on user ref existence, causing early access issues)
onMounted(() => {
    try {
        userStore.fetchUser();
    } catch (e) {}
});
</script>

<template>
    <v-navigation-drawer
        left
        v-model="sDrawer"
        app
        class="leftSidebar"
        elevation="0"
        width="270"
    >
        <div class="p-8 w-full flex justify-center items-center">
            <LayoutFullLogoDark />
        </div>
        <div class="scrollnavbar overflow-y-hidden flex flex-col h-full relative">
            <v-list class="py-2" ref="listRef">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarMenu">
                    <!---Item Sub Header -->
                    <LayoutFullVerticalSidebarNavGroup
                        :item="item"
                        v-if="item.header"
                        :key="item.title"
                        v-can="item.permission"
                    />
                    <!---Single Item-->
                    <LayoutFullVerticalSidebarNavItem
                        :item="item"
                        v-else
                        class="leftPadding"
                        v-can="item.permission"
                    />
                    <!---End Single Item-->
                </template>

            </v-list>
            
            <!-- User Profile Button with Dropdown Trigger -->
            <div class="mt-auto pa-3">
                <v-menu location="top" offset="8">
                    <template v-slot:activator="{ props }">
                        <v-btn
                            v-bind="props"
                            variant="flat"
                            class="w-100 d-flex align-start justify-space-between pa-0 text-start"
                            style="background: transparent; text-transform: none; height: auto;"
                            rounded="lg"
                        >
                            <div class="d-flex align-center ga-3 flex-1" style="min-width: 0;">
                                <LayoutFullVerticalHeaderProfileDD :photo="userStore.user?.photo || '/images/profile/user.png'" />
                                <div class="d-flex flex-column align-start flex-1" style="min-width: 0;">
                                    <span class="font-medium text-xs text-white text-truncate" style="line-height: 1.2; width: 100%;">{{ userStore.user?.full_name || 'Username' }}</span>
                                    <span class="text-xs text-[#B3B3B3] text-truncate" style="line-height: 1.2; width: 100%;">{{ userStore.user?.email || userStore.user?.role || 'user@example.com' }}</span>
                                </div>
                                <v-icon icon="mdi-chevron-right" size="20" color="white" style="opacity: 0.6;" />
                            </div>
                        </v-btn>
                    </template>
                    
                    <div class="bg-red/30 rounded-lg" style="min-width: 220px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <button 
                            @click="userStore.logout()" 
                            class="w-100 d-flex align-center ga-3 pa-3 rounded-lg text-left"
                            style="background: rgba(239, 68, 68, 0.01); border: 1px solid rgba(239, 68, 68, 0.2); cursor: pointer; transition: all 0.2s;"
                            @mouseenter="$event.target.style.background = 'rgba(239, 68, 68, 0.1)'"
                            @mouseleave="$event.target.style.background = 'rgba(239, 68, 68, 0.05)'"
                        >
                            <v-icon icon="mdi-logout-variant" color="error" size="20" />
                            <div class="d-flex flex-column flex-1">
                                <span class="text-body-2 font-weight-medium text-error">Logout Account</span>
                                <span class="text-caption text-white" style="opacity: 0.7;">Sign out from dashboard</span>
                            </div>
                        </button>
                    </div>
                </v-menu>
            </div>
            
            <div class="text-xs text-start px-6 pb-4 space-y-1 text-[#B3B3B3]">APM DASA - V2</div>
        </div>
    </v-navigation-drawer>
</template>
