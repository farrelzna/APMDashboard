<script setup>
import UiProjectCard from '@/components/shared/UiProjectCard.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import AvatarGroup from '@/components/ui-components/avatar/AvatarGroup.vue';
const ProjectStatistics = defineAsyncComponent(() => import('@/components/dashboards/ProjectStatistics.vue'));

const config = useRuntimeConfig();
const apiMedia = config.public.apiMedia;
const dashboardStore = useDashboardStore();
const { $formatDate, $getDayname } = useNuxtApp();
const userStore = useUserStore();
const dialogLogout = ref(false);
const isDashboard = ref(userStore.userGroupPermissions.includes('Dashboard'));
const props = defineProps({
    isScroll: Boolean, // Change to Boolean if it's a boolean prop
});

// Data
const dashboardData = ref(null);
const standupMeet = ref(null);
const standupDate = ref(null);
const projectsData = ref([]);
const items = ref([]);
const datas = ref([]);
// Grouped metrics summary
const summaryMetrics = computed(() =>
    datas.value.filter(d => ['Total Client', 'Total Project', 'Total User'].includes(d.title))
);
const teamMetrics = computed(() =>
    datas.value.filter(d => ['Engineer Internal', 'Engineer External'].includes(d.title))
);

// Computed: derive important project (earliest due date / first)
const importantProject = computed(() => {
    if (!dashboardData.value?.projects?.length) return null;
    let earliest = dashboardData.value.projects[0];
    for (let i = 1; i < dashboardData.value.projects.length; i++) {
        if (new Date(dashboardData.value.projects[i].end_date) < new Date(earliest.end_date)) {
            earliest = dashboardData.value.projects[i];
        }
    }
    return earliest;
});

// Computed: simplified project list (sorted by end_date)
const projectList = computed(() => {
    if (!dashboardData.value?.projects?.length) return [];
    return [...dashboardData.value.projects].sort(
        (a, b) => new Date(a.end_date) - new Date(b.end_date)
    );
});


const handleLogout = () => {
    dialogLogout.value = true;
};

const confirmLogout = () => {
    userStore.logout();
    dialogLogout.value = false;
};

const hasDashboardData = computed(() => !!dashboardData.value);

// Non-blocking async data fetching
const { pending } = useAsyncData('dashboard-data', async () => {
    await fetchData();
    return dashboardData.value;
}, { 
    lazy: true,
    server: false // Skip SSR untuk dashboard yang butuh auth
});

onMounted(() => {
    // Setup realtime updates setelah initial data loaded
    watch(dashboardData, (newVal) => {
        if (newVal && !pending.value) {
            setupRealtimeUpdates();
            if (props.isScroll) {
                setupAutoScroll();
            }
        }
    }, { immediate: true });
});

const filterAndFormatFinanceData = (projects = []) => {
    return projects.map(project => {
        if (project?.finances && Array.isArray(project.finances)) {
            project.finances = project.finances
                .filter(financeItem => financeItem?.date_of_payment)
                .sort(
                    (a, b) =>
                        new Date(a.date_of_payment) -
                        new Date(b.date_of_payment)
                )
                .slice(0, 3);
        }
        return project;
    });
};

const fetchData = async () => {
    await dashboardStore.fetchData();
    dashboardData.value = dashboardStore.dashboardData;
    if (dashboardData.value) {
        datas.value = [
            {
                title: 'Total Client',            
                value: dashboardData.value.total_client,
            },
            {
                title: 'Total Project',            
                value: dashboardData.value.total_projects,
            },
            {
                title: 'Total User',
                value: dashboardData.value.total_user,
            },
            {
                title: 'Engineer Internal',            
                value: dashboardData.value.total_engineer_internal,
            },
            {
                title: 'Engineer External',
                value: dashboardData.value.total_engineer_eksternal,
            },
        ];

        if (dashboardData.value.standup.length !== 0) {
            standupMeet.value = dashboardData.value.standup;
            const today = new Date().toISOString().split('T')[0];
            standupDate.value = standupMeet.value.filter(
                entry => entry.date === today
            );

            standupDate.value = standupMeet.value[0].date;
            items.value = standupMeet.value.flatMap(entry => {
                const details = entry.details;

                return details.flatMap(detail => {
                    const photoUrl =
                        detail.participant.photo ||
                        '/images/profile/user-1.jpg';
                    const fullName = detail.participant.full_name;

                    const workDetailsList = [];
                    if (detail.yesterday_work) {
                        workDetailsList.push(
                            `<li><b class="text-blue-600">Yesterday's Work:</b> ${detail.yesterday_work}</li>`
                        );
                    }
                    if (detail.today_work) {
                        workDetailsList.push(
                            `<li><b class="text-blue-600">Today's Work:</b> ${detail.today_work}</li>`
                        );
                    }
                    if (detail.impediments) {
                        workDetailsList.push(
                            `<li><b class="text-blue-600">Impediments:</b> ${detail.impediments}</li>`
                        );
                    }

                    const workDetails = `<ul>${workDetailsList.join('')}</ul>`;

                    return [
                        {
                            prependAvatar: photoUrl,
                            title: fullName,
                            subtitle: workDetails,
                        },
                    ];
                });
            });
        }

        projectsData.value = filterAndFormatFinanceData(
            dashboardData.value.projects
        );
    }
};

const setupRealtimeUpdates = () => {
    const intervalDelay = config.public.realtimeDelay;
    setInterval(async () => {
        await fetchData();
    }, intervalDelay);
};

const getDueDateColor = dueDate => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return { color: 'error', variant: 'flat' };
    } else if (diffDays <= 15) {
        return { color: 'error', variant: 'outlined' };
    } else if (diffDays <= 50) {
        return { color: 'warning', variant: 'flat' };
    } else {
        return { color: 'success', variant: 'outlined' };
    }
};

const getStatusColor = status => {
    switch (status.toLowerCase()) {
        case 'maintenance':
            return 'primary';
        case 'complete':
            return 'success';
        case 'in progress':
            return 'warning';
        case 'almost due':
            return 'error';
        default:
            return '';
    }
};

const scrollProjects = ref();
const scrollWorkload = ref();
const scrollStandup = ref();

const isDown = ref({
    project: false,
    workload: false,
    standup: false,
});

const projectSortOrder = ref('newest'); // 'newest' or 'oldest'

// Memoized sorting untuk performa lebih baik
let cachedProjects = [];
let cachedSortOrder = '';
let cachedResult = [];

const sortedProjects = computed(() => {
    if (!dashboardData.value?.projects?.length) return [];
    
    // Return cached result jika data tidak berubah
    if (cachedProjects === dashboardData.value.projects && cachedSortOrder === projectSortOrder.value) {
        return cachedResult;
    }
    
    const projects = [...dashboardData.value.projects];
    const result = projectSortOrder.value === 'newest'
        ? projects.sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
        : projects.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
    
    // Update cache
    cachedProjects = dashboardData.value.projects;
    cachedSortOrder = projectSortOrder.value;
    cachedResult = result;
    
    return result;
});

const autoScroll = (container, index) => {
    if (container.value) {
        if (
            container.value.scrollTop >=
                container.value.scrollHeight - container.value.clientHeight &&
            isDown.value[index]
        ) {
            isDown.value[index] = false;
        } else if (container.value.scrollTop === 0 && !isDown.value[index]) {
            isDown.value[index] = true;
        }

        if (isDown.value[index]) {
            container.value.scrollTop += 1;
        } else {
            container.value.scrollTop -= 1;
        }
    }
};

const setupAutoScroll = () => {
    setInterval(() => autoScroll(scrollProjects, 'project'), 200);
    setInterval(() => autoScroll(scrollWorkload, 'workload'), 200);
    setInterval(() => autoScroll(scrollStandup, 'standup'), 200);
};

</script>

<template>
    <div
        class="absolute top-0 right-0 p-5 z-50 opacity-0 hover:opacity-100"
        v-if="isDashboard"
    >
        <v-btn variant="elevated" color="error" @click="handleLogout">
            Logout
        </v-btn>
    </div>

    <div v-if="hasDashboardData" class="w-full flex flex-col gap-4">
        <!-- Banner -->
        <div class="bg-[#Ff5f00] rounded-xl p-8 shadow-sm position-relative overflow-hidden">
            <!-- Background Image -->
            <img src="/images/banner.png" alt="Banner Background" class="position-absolute" style="right: 0; top: 50%; transform: translateY(-50%); height: 100%; width: auto; z-index: 0;" />
            
            <div class="d-flex align-end justify-space-between position-relative" style="z-index: 1;">
                <div class="max-w-2xl">
                    <div class="text-white/80 text-sm font-semibold mb-2">Dasa Aprindo Sentosa</div>
                    <h2 class="text-white text-2xl font-bold  mb-3">
                        Most Reliable and Trusted<br />Technology Company
                    </h2>
                    <NuxtLink to="/dashboard/project">
                        <button class="bg-black text-white rounded-xl text-sm font-medium px-6 py-2 scale-100 hover:scale-105 transition-transform duration-200 flex items-center">
                            New Project
                             <v-icon icon="mdi-arrow-right" size="small" class="ml-2" />
                        </button>
                    </NuxtLink>
                </div>
                <div class="d-flex align-center">                    
                    <div class="flex ga-12 items-center uppercase">
                        <div class="d-flex align-center ga-2 ">                        
                            <span class="text-white/70 font-bold tracking-widest hover:text-white/80 transition-colors duration-200">Build</span>
                        </div>
                        <div class="d-flex align-center ga-2">                        
                            <span class="text-white/70 font-bold tracking-widest hover:text-white/80 transition-colors duration-200">Research</span>
                        </div>
                        <div class="d-flex align-center ga-2">                        
                            <span class="text-white/70 font-bold tracking-widest hover:text-white/80 transition-colors duration-200">Develop</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <v-row class="gy-4" style="margin:0 !important">
            <!-- Left Column -->
            <v-col cols="7" class="flex flex-col gap-4 px-0">
                <!-- Important Project Card -->
                <v-card v-if="importantProject" class="pa-4" elevation="0" rounded="lg" style="border: 1px solid #F4F4F4;">
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-4 min-w-0">
                            <div size="56" class="bg-red-100 rounded-xl flex justify-center items-center w-14 h-14">
                                <v-icon icon="mdi-calendar-alert" color="error" />
                            </div>
                            <div class="flex flex-col truncate">
                                <span class="text-[11px] text-gray-500 leading-4">Last/Due/Important Project</span>
                                <h3 class="font-bold text-lg leading-5 truncate uppercase">{{ importantProject.name }}</h3>
                                <span class="text-xs text-gray-500 uppercase tracking-wide truncate">{{ importantProject.customer_str.name }}</span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2 text-right">
                            <span class="text-xs text-gray-600">Due date {{ importantProject.end_date }}</span>
                            <v-chip
                                size="small"
                                class="text-body-2"
                                :color="getStatusColor(importantProject.status)"
                                variant="outlined"
                            >
                                {{ importantProject.status }}
                            </v-chip>
                        </div>
                    </div>
                </v-card>
                
                <div class="grid grid-cols-2 gap-4 items-stretch">
                    <!-- analytics -->
                    <div class="flex flex-col h-full">
                        <v-card class="col-span-5 h-full flex flex-col" elevation="0" rounded="lg" style="border: 1px solid #F4F4F4;">
                            <v-row no-gutters>
                                <v-col cols="12" class="mb-2">
                                    
                                </v-col>
                                <!-- Placeholder for analytics chart -->
                                <v-col cols="12" class="mb-4">
                                    <ProjectStatistics :data="dashboardData.project_status" />
                                </v-col>
                            </v-row>
                        </v-card>
                    </div>
                    <div class="flex flex-col gap-4 h-full">
                        <!-- summary -->
                        <v-card class="col-span-7 pa-5 rounded-2xl flex-1" elevation="0" rounded="lg" style="border: 1px solid #F4F4F4;">
                            <h4 class="text-body-1 font-weight-semibold mb-4">Team</h4>
                            <div class="d-flex ga-16 b-4">
                                <div
                                    v-for="datas in teamMetrics"
                                    :key="datas.title"
                                    class="d-flex align-center ga-2"
                                >
                                    <div class="d-flex flex-column">
                                        <span class="text-caption text-grey-darken-1">{{ datas.title }}</span>
                                        <span class="text-h6 font-weight-semibold">{{ datas.value }}</span>
                                    </div>
                                </div>
                            </div>
                            <v-divider class="my-4" />                           
                            <div class="d-flex justify-between">
                                <div
                                    v-for="datas in summaryMetrics"
                                    :key="datas.title"
                                    class="d-flex align-center ga-2"
                                >
                                
                                    <div class="d-flex flex-column">
                                        <span class="text-caption text-grey-darken-1">{{ datas.title }}</span>
                                        <span class="text-h6 font-weight-semibold">{{ datas.value }}</span>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                        <!-- Recent Activities -->
                        <v-card class="pa-4 rounded-sm flex-1" elevation="0" rounded="lg" style="border: 1px solid #F4F4F4;">
                            <h4 class="font-semibold mb-4">Recent Activities</h4>
                            <div class="flex flex-col gap-4">
                                <div class="flex justify-between items-start"> <!--v-for="act in recentActivities" :key="act.project + act.date"-->
                                    <div class="flex items-start gap-3">
                                        <v-avatar size="30" color="primary"></v-avatar>
                                        <div>
                                            <div class="text-sm font-medium">Type (Add Project)</div>
                                            <div class="text-xs text-gray-500">name user</div>
                                        </div>
                                    </div>
                                    <div class="text-right text-xs">
                                        <div>date 2025-10-12</div>
                                        <div class="text-green-600">description (success)</div>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </div>
                </div>

                <!-- Engineer Workload -->
                <v-card v-if="dashboardData?.engineers" class="pa-0" elevation="0" rounded="lg" style="border: 1px solid #F4F4F4;">
                    <div class="pa-4 pb-3">
                        <h5 class="text-h6 font-weight-semibold">Engineer's Workload</h5>
                    </div>
                    <v-divider></v-divider>
                    <!-- Scrollable workload list -->
                    <div class="pa-4 d-flex flex-column ga-3 position-relative" style="max-height: 400px; overflow: hidden;">
                        <div class="engineer-workload-scroll" ref="scrollWorkload" style="overflow-y: auto; padding-right: 8px;">
                            <div
                                v-for="eng in dashboardData.engineers"
                                :key="eng.engineer.id"
                                class="mb-3"                                
                            >
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center ga-3">
                                        <v-avatar 
                                            :image="apiMedia + eng.engineer.photo" 
                                            size="48"
                                            style="border: 2px solid #e0e0e0;"
                                            loading="lazy"
                                        />
                                        <div>
                                            <div class="text-body-1 font-weight-semibold">{{ eng.engineer.full_name }}</div>
                                            <div class="text-caption text-grey-darken-1">{{ eng.engineer.job_titles }}</div>
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column align-end ga-1">
                                        <v-chip
                                            :color="eng.workload > 80 ? 'error' : eng.workload > 60 ? 'warning' : 'success'"
                                            variant="tonal"
                                            size="small"
                                            class="font-weight-semibold"
                                        >
                                            {{ eng.workload }}%
                                        </v-chip>
                                        <div class="d-flex align-center ga-1"> 
                                            <span class="text-caption text-grey-darken-1">
                                                <strong class="text-grey-darken-3">{{ eng.projects }}</strong> Project{{ eng.projects > 1 ? 's' : '' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <v-progress-linear 
                                    :model-value="eng.workload" 
                                    height="4" 
                                    rounded
                                    :color="eng.workload > 80 ? 'error' : eng.workload > 60 ? 'warning' : 'success'"
                                    bg-color="#e0e0e0"
                                />
                            </div>
                        </div>
                        
                        <!-- Gradient fade overlay for scroll indication -->
                        <div 
                            v-if="dashboardData.engineers && dashboardData.engineers.length > 3"
                            style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; pointer-events: none; background: linear-gradient(to bottom, transparent, white);"
                        ></div>
                    </div>
                </v-card>
            </v-col>

            <!-- Right Column: Project List -->
            <v-col cols="5" class="d-flex flex-column pr-0">
                <v-card class="pa-0" elevation="0" rounded="lg" style="border: 1px solid #F4F4F4;">
                    <div class="pa-4 pb-3 d-flex align-center justify-space-between">
                        <h5 class="text-h6 font-weight-semibold">Project list</h5>
                        <v-btn-toggle
                            v-model="projectSortOrder"
                            mandatory
                            density="compact"
                            variant="outlined"
                            color="primary"
                            divided
                        >
                            <v-btn value="newest" size="small" class="text-none">
                                <v-icon size="small" class="mr-1">mdi-sort-calendar-descending</v-icon>
                                Newest
                            </v-btn>
                            <v-btn value="oldest" size="small" class="text-none">
                                <v-icon size="small" class="mr-1">mdi-sort-calendar-ascending</v-icon>
                                Oldest
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                    <v-divider></v-divider>
                    
                    <div class="project-list-scroll" ref="scrollProjects" style="overflow-y: auto; max-height: calc(100vh - 64px);">
                        <div
                            v-for="project in sortedProjects"
                            :key="project.id"
                            v-auto-animate
                            style="border-bottom: 1px solid #f5f5f5;"
                        >
                        <UiProjectCard
                            :projectData="project"
                            :color="getStatusColor(project.status)"
                        >
                            <!-- PM, Team, Status Badge Row -->
                            <div class="d-flex align-center justify-space-between mb-3">
                                <div class="d-flex align-center ga-2">
                                    <span class="text-caption text-grey-darken-1">PM:</span>
                                    <v-avatar
                                        v-if="project.pm_str"
                                        size="32"
                                        :image="config.public.apiMedia + project.pm_str.photo"
                                        style="border: 1px solid #f4f4f4;"
                                         loading="lazy"
                                    ></v-avatar>
                                    <span v-else class="text-caption">-</span>
                                </div>
                                <div class="d-flex align-center ga-4">
                                    <div class="d-flex align-center ga-2">
                                        <span class="text-caption text-grey-darken-1">Team:</span>
                                        <AvatarGroup
                                            :users="project.engineer"
                                            :pm="project.pm_str"
                                        />
                                    </div>
                                    <v-chip
                                        :color="getStatusColor(project.status)"
                                        :variant="['in progress','complete'].includes(project.status.toLowerCase()) ? 'tonal' : 'flat'"
                                        size="small"
                                        label
                                        class="text-caption font-weight-medium"
                                        >
                                        {{ project.status }}
                                    </v-chip>
                                </div>
                            </div>

                            <!-- Finance Section -->
                            <div class="mb-4">
                                <div class="text-caption font-weight-medium text-grey-darken-2 mb-3">Finance:</div>
                                <div class="d-flex flex-column ga-3">
                                    <div
                                        v-for="finance in project.finances"
                                        :key="finance.id || finance.name"
                                        class="d-flex align-center ga-3"
                                    >
                                        <div style="width: 4px; height: 48px; background-color: #FF5F00; border-radius: 2px; flex-shrink: 0;"></div>
                                        <div class="d-flex align-center justify-space-between flex-grow-1">
                                            <div class="d-flex flex-column ga-1">
                                                <div class="text-body-2 font-weight-bold">{{ finance.name }}</div>
                                                <div class="text-caption text-grey-darken-1">{{ finance.status }}</div>
                                            </div>
                                            <div
                                                class="text-caption text-grey-darken-1" style="white-space: nowrap; margin-top: 4px;"
                                            >
                                                Due date {{ finance.date_of_payment }}
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="!project.finances || project.finances.length === 0" class="text-caption text-grey-darken-1 pl-5">
                                        No finance data
                                    </div>
                                </div>
                            </div>

                            <!-- Project Status Steps -->
                            <div v-if="project.project_status && project.project_status.length">
                                <div class="text-caption font-weight-medium text-grey-darken-2 mb-3">Project Status:</div>
                                <div class="d-flex flex-column ga-3">
                                    <div
                                        v-for="status in project.project_status"
                                        :key="status.id || status.description + status.date_submit"
                                        class="d-flex align-center ga-3"
                                    >
                                        <div style="width: 4px; height: 48px; background-color: #3B82F6; border-radius: 2px; flex-shrink: 0;"></div>
                                        <div class="d-flex align-center justify-space-between flex-grow-1">
                                            <div class="text-body-2 font-weight-medium">{{ status.description }}</div>
                                            <v-chip
                                                :color="getStatusColor(status.status)"
                                                :variant="['in progress','complete'].includes(status.status.toLowerCase()) ? 'tonal' : 'flat'"
                                                size="x-small"
                                                label
                                                class="text-caption"
                                            >
                                                {{ status.status }}
                                            </v-chip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </UiProjectCard>
                    </div>
                    <div v-if="!projectList.length" class="text-center pa-8 text-body-2 text-grey">No project found</div>
                </div>
                </v-card>
            </v-col>
        </v-row>
    </div>

    <!-- Loading Skeleton -->
    <div class="w-full flex flex-col gap-2" v-else>
        <v-row>
            <v-col>
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
            <v-col>
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
            <v-col>
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
            <v-col>
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
        </v-row>
        <div class="grid gap-2">
            <div class="col-start-1 col-end-3 row-start-1 row-end-2">
                <v-skeleton-loader type="image"></v-skeleton-loader>
            </div>
            <div class="col-start-3 col-end-5 row-start-1 row-end-3">
                <v-skeleton-loader
                    type="ossein"
                    class="h-full"
                ></v-skeleton-loader>
            </div>
            <div class="col-start-1 col-end-3 row-start-2 row-end-3">
                <v-skeleton-loader
                    type="image"
                    class="h-full"
                ></v-skeleton-loader>
            </div>
            <div class="col-start-1 col-end-5 row-start-3">
                <v-skeleton-loader
                    type="ossein"
                    class="h-full"
                ></v-skeleton-loader>
            </div>
        </div>
    </div>

    <v-dialog v-model="dialogLogout" max-width="500">
        <v-card class="p-5">
            <v-card-title class="leading-3 text-center mt-5"
                >Logout Confirmation</v-card-title
            >
            <v-card-text class="text-center">
                Are you sure you want to logout?
            </v-card-text>
            <v-card-actions class="flex justify-center items-center mb-5">
                <v-btn
                    text
                    @click="dialogLogout = false"
                    color="error"
                    variant="outlined"
                    >Cancel</v-btn
                >
                <v-btn color="error" variant="flat" @click="confirmLogout"
                    >Confirm</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style>
.v-timeline--vertical.v-timeline
    .v-timeline-item:first-child
    .v-timeline-divider,
.v-timeline--vertical.v-timeline
    .v-timeline-item:first-child
    .v-timeline-item__body,
.v-timeline--vertical.v-timeline
    .v-timeline-item:first-child
    .v-timeline-item__opposite {
    padding-block-start: 12px !important;
}

.v-timeline--vertical.v-timeline
    .v-timeline-item:last-child
    .v-timeline-divider,
.v-timeline--vertical.v-timeline
    .v-timeline-item:last-child
    .v-timeline-item__body,
.v-timeline--vertical.v-timeline
    .v-timeline-item:last-child
    .v-timeline-item__opposite {
    padding-block-end: 12px !important;
}

.v-timeline--vertical.v-timeline {
    grid-row-gap: 12px !important;
}

.v-timeline-item__body {
    padding: 0 10px !important;
    width: 100%;
}

.project-list-scroll {
    scrollbar-width: thin;
    scrollbar-color: #e0e0e0 transparent;
}

.project-list-scroll::-webkit-scrollbar {
    width: 6px;
}

.project-list-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.project-list-scroll::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 3px;
}

.project-list-scroll::-webkit-scrollbar-thumb:hover {
    background-color: #d0d0d0;
}

.engineer-workload-scroll {
    scrollbar-width: thin;
    scrollbar-color: #e0e0e0 transparent;
}

.engineer-workload-scroll::-webkit-scrollbar {
    width: 6px;
}

.engineer-workload-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.engineer-workload-scroll::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 3px;
}

.engineer-workload-scroll::-webkit-scrollbar-thumb:hover {
    background-color: #d0d0d0;
}
</style>
