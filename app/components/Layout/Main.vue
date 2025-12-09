<script setup>
import sidebarItems from '@/components/Layout/Full/vertical-sidebar/sidebarItem';
import { Menu2Icon, BellRingingIcon } from 'vue-tabler-icons';
import { useUserStore } from '@/stores/User';
import { onMounted } from 'vue';
import { useAutoAnimate } from '@formkit/auto-animate/vue';
import { useDisplay } from 'vuetify';

const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);
const userStore = useUserStore();
const [listRef] = useAutoAnimate({ duration: 200 });
const [logoRef] = useAutoAnimate({ duration: 150 });
const [profileRef] = useAutoAnimate({ duration: 200 });
const rail = ref(false);
const isDragging = ref(false);
const startX = ref(0);
const { mdAndDown } = useDisplay();

// Fetch user data on mount (was previously conditional on user ref existence, causing early access issues)
onMounted(() => {
    try {
        userStore.fetchUser();
    } catch (e) {}
});

let lastUpdateTime = 0;
const UPDATE_THROTTLE = 50; // milliseconds

const handleMouseDown = (e) => {
    isDragging.value = true;
    startX.value = e.clientX;
    lastUpdateTime = Date.now();
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
};

const handleMouseMove = (e) => {
    if (!isDragging.value) return;
    
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_THROTTLE) return;
    
    const diff = e.clientX - startX.value;
    
    // Jika sidebar terbuka dan drag ke kiri lebih dari 50px, tutup
    if (!rail.value && diff < -50) {
        rail.value = true;
        isDragging.value = false;
        cleanupListeners();
        lastUpdateTime = now;
    }
    // Jika sidebar tertutup dan drag ke kanan lebih dari 50px, buka
    else if (rail.value && diff > 50) {
        rail.value = false;
        isDragging.value = false;
        cleanupListeners();
        lastUpdateTime = now;
    }
};

const handleMouseUp = () => {
    isDragging.value = false;
    cleanupListeners();
};

watch(mdAndDown, value => {
    if (value) rail.value = true;
    else rail.value = false;
});

const cleanupListeners = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
};
</script>

<template>
    <v-navigation-drawer
        left
        v-model="sDrawer"
        app
        class="leftSidebar"
        elevation="0"
        permanent
        :mobile-breakpoint="0"
        :rail="rail"
        :width="rail ? 80 : 270"
    >
        <!-- Toggle Button with Drag Handle -->
        <div
            class="position-absolute d-flex align-center"
            style="right: -10px; top:50%; transform: translateY(-50%); z-index: 10; cursor: grab;"            
            @mousedown="handleMouseDown"            
            :class="{ 'cursor-grabbing': isDragging }"
            >
            <v-btn
                icon
                size="small"
                variant="flat"                
                style="background: #1e1e1e; border: none; border-radius: 5px 0 0 5px;"
                @click="rail = !rail"
            >
                <div style="width: 2px; height: 20px; background-color: #b3b3b3; border-radius: 1px;"></div>
            </v-btn>
        </div>

        <div class="p-8 w-full flex justify-center items-center" :ref="logoRef">
            <LayoutFullLogoDark v-if="!rail" />
        </div>
        <div class="scrollnavbar overflow-y-hidden flex flex-col h-full relative">
            <v-list class="py-2" :ref="listRef">
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
            <div class="mt-auto pa-3" v-if="!rail" :ref="profileRef">
                <LayoutFullVerticalHeaderProfileDD :photo="userStore.user?.photo || '/images/profile/user.png'">
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            variant="flat"
                            class="w-100 d-flex align-start justify-space-between pa-0 text-start"
                            style="background: transparent; text-transform: none; height: auto;"
                            rounded="lg"
                        >
                            <div class="d-flex align-center ga-3 flex-1" style="min-width: 0;">
                                <v-avatar size="35" :image="userStore.user?.photo || '/images/profile/user.png'" />
                                <div class="d-flex flex-column align-start flex-1" style="min-width: 0;">
                                    <span class="font-medium text-xs text-white text-truncate" style="line-height: 1.2; width: 100%;">{{ userStore.user?.full_name || 'Username' }}</span>
                                    <span class="text-xs text-[#B3B3B3] text-truncate" style="line-height: 1.2; width: 100%;">{{ userStore.user?.email || userStore.user?.role || 'user@example.com' }}</span>
                                </div>
                                <v-icon icon="mdi-chevron-right" size="20" color="white" style="opacity: 0.6;" />
                            </div>
                        </v-btn>
                    </template>
                </LayoutFullVerticalHeaderProfileDD>
            </div>

            <!-- Rail Mode Profile -->
            <div class="mt-auto pa-3 d-flex justify-center" v-else>
                <LayoutFullVerticalHeaderProfileDD :photo="userStore.user?.photo || '/images/profile/user.png'" />
            </div>
            
            <div class="text-xs text-start px-3 py-4 space-y-1 text-[#B3B3B3]" v-if="!rail">APM DASA - V2</div>
        </div>
    </v-navigation-drawer>
</template>

<style scoped>
.cursor-grabbing {
    cursor: grabbing !important;
}
</style>