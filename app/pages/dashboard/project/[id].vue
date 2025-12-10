<script setup>
definePageMeta({
    middleware: 'auth',
});

const tab = ref('info');
const route = useRoute();
const projectStore = useProjectStore();
const projectData = ref({});
const config = useRuntimeConfig();
async function initialize() {
    projectData.value = await projectStore.searchById(route.params.id);
    projectData.value = {
        ...projectData.value,
        progress: {
            task_total: projectData.value.project_status.length,
            task_complete: projectData.value.project_status.filter(
                status => status.status === 'Complete'
            ).length,
        },
    };
}

const projectPercentage = computed(() => {
    if (!projectData.value?.progress) return 0;

    const { task_complete, task_total } = projectData.value.progress;

    return task_total ? Math.round((task_complete / task_total) * 100) : 0;
});

const formatDate = value => {
    return new Date(value).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

onMounted(() => {
    initialize();
});
</script>

<template>
    <v-row :no-gutters="true" class="rounded-lg shadow">
        <v-col cols="12" sm="12" lg="6">
            <div
                class="w-full bg-white p-5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5"
            >
                <div
                    class="w-32 h-32 flex justify-center items-center text-white p-0 overflow-hidden"
                >
                    <img
                        v-if="projectData.end_user_str"
                        :src="`${
                            config.public.apiMedia +
                            '/' +
                            projectData.end_user_str.logo
                        }`"
                        :alt="projectData.name"
                        class="w-full h-full contain"
                    />
                    <v-skeleton-loader
                        v-else
                        type="image"
                        class="w-full"
                    ></v-skeleton-loader>
                </div>
                <div
                    class="pb-2"
                    v-if="projectData && projectData.end_user_str"
                >
                    <h1 class="font-bold text-black text-lg leading-4">
                        {{ projectData.name }}
                    </h1>
                    <div class="flex gap-2 pt-2 text-gray-400">
                        <span class="text-xs font-thin">
                            {{ projectData.end_user_str.name }}
                        </span>
                    </div>
                    <p class="text-xs line-clamp-4 mt-3 text-gray-500">
                        {{ projectData.remarks }}
                    </p>
                </div>
                <v-skeleton-loader
                    v-else
                    type="article"
                    class="w-full h-full"
                ></v-skeleton-loader>
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="6">
            <div
                class="w-full bg-white p-5 h-full flex items-end flex-col relative"
            >
                <v-chip
                    class="ma-2 px-5 self-end font-bold"
                    :color="colorByStatus(projectData.status)"
                    label
                    size="small"
                    v-if="projectData.status"
                >
                    <b>{{ projectData.status }}</b>
                </v-chip>

                <div class="w-full flex gap-2 flex-wrap lg:justify-end">
                    <div class="w-28">
                        <h1 class="text-xs font-bold text-black">Start Date</h1>
                        <v-chip
                            v-if="projectData.start_date"
                            class="px-5 py-3 font-bold"
                            color="info"
                            label
                            size="x-small"
                        >
                            <b>{{ formatDate(projectData.start_date) }}</b>
                        </v-chip>
                        <v-skeleton-loader
                            v-else
                            type="list-item"
                            class=""
                        ></v-skeleton-loader>
                    </div>
                    <div class="w-28">
                        <h1 class="text-xs font-bold text-black">End Date</h1>
                        <v-chip
                            v-if="projectData.end_date"
                            class="px-5 py-3 font-bold"
                            color="error"
                            label
                            size="x-small"
                        >
                            <b>{{ formatDate(projectData.end_date) }}</b>
                        </v-chip>
                        <v-skeleton-loader
                            v-else
                            type="list-item"
                            class=""
                        ></v-skeleton-loader>
                    </div>
                    <div class="w-52 flex flex-col gap-2">
                        <span class="text-xs font-bold text-black">Progress</span>
                        <v-progress-linear
                            v-if="projectData.progress"
                            :model-value="projectData.progress.task_complete"
                            :max="projectData.progress.task_total"
                            color="info"
                            rounded
                        ></v-progress-linear>
                        <v-skeleton-loader
                            v-else
                            type="list-item"
                        ></v-skeleton-loader>
                        <span
                            class="text-xs text-black font-bold"
                            v-if="projectData.progress"
                            >{{ projectPercentage }}%</span
                        >
                    </div>
                </div>
            </div>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" sm="12" lg="12">
            <div class="w-full text-black bg-white shadow rounded flex flex-col relative">
                <v-btn
                    color="warning"
                    class="position-absolute -right-2 -top-2 p-5 elevation-0"
                    density="default"
                    icon="mdi-pencil"
                    size="small"
                    rounded="xll"
                    @click="
                        $router.push(
                            `/dashboard/project/update/${projectData.id}`
                        )
                    "
                >
                </v-btn>
                <div class="flex justify-between items-center border-b px-5">
                    <v-tabs v-model="tab" class="px-5">
                        <v-tab value="info" size="small">Informations</v-tab>
                        <v-tab value="finances" size="small">Finances</v-tab>
                        <v-tab value="engineers" size="small">Engineers</v-tab>
                        <v-tab value="tasks" size="small">Tasks</v-tab>
                    </v-tabs>
                    <v-btn
                        class="me-8 action-btn"
                        variant="flat"
                        prepend-icon="mdi-arrow-left"
                        @click="navigateTo('/dashboard/project')"
                    >
                        Back to projects
                    </v-btn>
                </div>
                <v-card-text>
                    <v-tabs-window v-model="tab">
                        <v-tabs-window-item value="info">
                            <dashboards-project-informations
                                :project="projectData"
                            />
                        </v-tabs-window-item>

                        <v-tabs-window-item value="finances">
                            <dashboards-project-finances
                                :finances="projectData.finances"
                            />
                        </v-tabs-window-item>

                        <v-tabs-window-item
                            value="engineers"
                            v-if="projectData.engineer"
                        >
                            <dashboards-project-engineers
                                :engineers="projectData.engineer"
                                :engineer_eksternal="
                                    projectData.engineer_eksternal_str
                                "
                            />
                        </v-tabs-window-item>

                        <v-tabs-window-item value="tasks">
                            <dashboards-project-tasks
                                :tasks="projectData.project_status"
                            />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </v-card-text>
            </div>
        </v-col>
    </v-row>
</template>
