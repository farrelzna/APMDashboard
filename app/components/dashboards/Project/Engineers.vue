<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
    engineers: Object,
    engineer_eksternal: Object,
});

const config = useRuntimeConfig();
const search = ref('');

const combinedEngineers = computed(() => {
    return props.engineers.concat(props.engineer_eksternal);
});

const items = computed(() =>
    combinedEngineers.value.map((engineer, index) => ({
        no: index + 1,
        engineer: engineer.engineer,
        role: engineer.engineer || '-',
        workload: engineer.workload || '-',
        status: engineer.workload_status || '-',
    }))
);

const headers = ref([
    { title: 'No', key: 'no', sortable: true },
    { title: 'Engineer', key: 'engineer', sortable: false },
    { title: 'Role', key: 'role.job_titles', sortable: false },
    { title: 'Workload', key: 'workload', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
]);

const page = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [10, 25, 50];
const totalItems = computed(() => items.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const rangeStart = computed(() => (totalItems.value === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1));
const rangeEnd = computed(() => Math.min(totalItems.value, page.value * itemsPerPage.value));
const pagedItems = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value;
    return items.value.slice(start, start + itemsPerPage.value);
});

watch(itemsPerPage, () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
});

watch(items, () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
});
</script>

<template>
    <v-card flat v-if="items">
        <div class="flex items-center justify-between">
            <div class="text-lg font-bold text-grey-darken-1">Engineers Table</div>
            <div class="flex items-center gap-1 text-sm text-grey-darken-1">
                <v-select
                    class="mx-2"
                    :items="perPageOptions"
                    v-model="itemsPerPage"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    hide-details
                    style="max-width: 90px;"
                />
                <span class="text-xs font-medium text-gray-500">{{ rangeStart }}-{{ rangeEnd }} of {{ totalItems }}</span>
                <v-btn size="small" variant="text" icon="mdi-page-first" :disabled="page === 1" @click="page = 1" />
                <v-btn size="small" variant="text" icon="mdi-chevron-left" :disabled="page === 1" @click="page = Math.max(1, page - 1)" />
                <v-btn size="small" variant="text" icon="mdi-chevron-right" :disabled="page === pageCount" @click="page = Math.min(pageCount, page + 1)" />
                <v-btn size="small" variant="text" icon="mdi-page-last" :disabled="page === pageCount" @click="page = pageCount" />
            </div>
        </div>
        <v-divider class="mt-4"></v-divider>
        <v-data-table
            v-model:search="search"
            :items="pagedItems"
            :headers="headers"
            item-key="no"
            class="elevation-1"
            hide-default-footer
        >
            <template v-slot:item.engineer="{ index, item }">
                <div class="flex gap-3">
                    <v-avatar v-if="item.engineer">
                        <v-img
                            :src="
                                config.public.apiMedia +
                                '/' +
                                item.engineer.photo
                            "
                            cover
                        ></v-img>
                    </v-avatar>
                    <div class="flex flex-col" v-if="item.engineer">
                        <span class="text-xs font-bold">
                            {{ item.engineer.full_name }}
                        </span>
                        <span class="text-xs font-thin text-gray-400">
                            {{
                                item.engineer.role + ' ' + item.engineer.status
                            }}
                        </span>
                    </div>
                    <div class="flex flex-col" v-else>
                        <span class="text-xs font-bold">
                            {{ combinedEngineers[index].full_name }}
                        </span>
                        <span class="text-xs font-thin text-gray-400">
                            Engineer Eksternal
                        </span>
                    </div>
                </div>
            </template>

            <template v-slot:item.status="{ item }">
                <v-chip :color="colorByStatus(item.status)" size="small">{{
                    item.status
                }}</v-chip>
            </template>
        </v-data-table>
    </v-card>
</template>
