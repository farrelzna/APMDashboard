<template>
    <v-row class="p-5">
        <v-col>
            <div class="flex flex-col gap-2">
                <v-row align="center" v-if="!isInfo">
                    <v-col cols="8">
                        <label for="engineersSelected" :class="['field-label', { 'field-label--active': isActive('engineersSelected') } ]"  >Add engineer</label>
                        <v-autocomplete variant="outlined" :items="engineersList"
                            v-model="engineersSelected" @focus="focusStates.engineersSelected = true" @blur="focusStates.engineersSelected = false" density="compact"></v-autocomplete>
                    </v-col>
                    <v-col cols="4">
                        <v-btn width="40%" rounded="lg" :style="{ background:'#111', color:'#fff', fontWeight:600 }" @click="addSelectedEngineer">
                            Add
                        </v-btn>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <div class="flex items-center justify-between py-5">
                    <div class="text-xl font-bold text-grey-darken-1">Engineers Project</div>
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
                <v-data-table
                    :items="pagedItems"
                    :headers="headers"
                    item-value="id"
                    :items-per-page-options="[]"
                    :items-per-page="itemsPerPage"
                    v-model:page="page"
                    hide-default-footer
                >
                    <template #item.number="{ index }">
                        {{ index + 1 }}
                    </template>
                    <template #item.workload="{ item }">
                        <v-text-field v-model="item.workload" variant="outlined" label="Workload *" :name="`${item.id}`"
                            dense @input="updateWorkload(item)" density="compact" required></v-text-field>
                    </template>
                    <template #item.status="{ item }">
                        <v-select v-model="item.workload_status" :items="statusOptions" :name="`${item.id}`"
                            variant="outlined" dense @update:modelValue="updateStatus(item)" density="compact" label="Status"></v-select>
                    </template>
                    <template #item.actions="{ item }">
                        <v-btn variant="plain" class="mb-5" color="error" icon="mdi-minus-circle"
                            v-can="pagePermission.projectEngineer.delete" @click="removeEngineer(item)"></v-btn>
                    </template>
                </v-data-table>
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, onMounted, toRefs, computed, watch, reactive } from 'vue';
import { toast } from 'vue-sonner';

const headers = [
    { title: '#', key: 'number', sortable: false },
    { title: 'Name', key: 'engineer.full_name', sortable: false },
    { title: 'Workload', key: 'workload', sortable: false },
    { title: 'Status', key: 'status', sortable: false },
    { title: '', key: 'actions', sortable: false },
];

const props = defineProps({
    formData: Object,
    errors: Object,
    isInfo: Boolean,
});

const { formData, errors } = toRefs(props);
const items = ref([]);
const engineersSelected = ref(null);
const userStore = useUserStore();
const engineersList = ref([]);
const loading = ref(false);
const deletedEngineer = ref([]);
const statusOptions = [
    'Complete',
    'In Progress',
    'PM / CM',
    'On Hold',
    'Waiting Payment',
    'Almost Due',
    'Not Started Yet',
    'Maintenance',
];

// Header pagination controls state
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

async function initialize() {
    if (formData.value.id) {
        items.value = formData.value.engineer;
    }

    loading.value = true;
    try {
        const engineersData = await userStore.getUsers('Engineer', 'Internal');
        const engineers = engineersData.items;
        engineersList.value = engineers.map(engineer => ({
            value: {
                id: engineer.id,
                engineer: {
                    full_name: engineer.first_name + ' ' + engineer.last_name,
                },
                workload: '',
                workload_status: '',
                isNew: true,
            },
            title: engineer.first_name + ' ' + engineer.last_name,
        }));
    } catch (error) {
        toast.error('Failed to fetch engineers.');
    } finally {
        loading.value = false;
    }
}

const addSelectedEngineer = () => {
    if (!engineersSelected.value) {
        return;
    }

    const isEngineerExist = items.value.some(
        engineer => engineer.engineer?.id === engineersSelected.value.id
    );

    if (!isEngineerExist) {
        items.value.push(engineersSelected.value);
        updateFormData();
    } else {
        toast.error('Engineer already exists!');
    }
    engineersSelected.value = null;
};

const removeEngineer = engineer => {
    if (engineer.id) {
        deletedEngineer.value.push(engineer.id);
    }
    items.value = items.value.filter(item => item.id !== engineer.id);
    updateFormData();
};

const updateWorkload = engineer => {
    updateFormData();
};

const updateStatus = engineer => {
    updateFormData();
};

function updateFormData() {
    const updatedEngineers = items.value.map(item => {
        if (item.isNew) {
            return {
                engineer: item.id,
                workload: item.workload,
                workload_status: item.workload_status,
            };
        } else {
            return {
                id: item.id,
                engineer: item.id,
                workload: item.workload,
                workload_status: item.workload_status,
            };
        }
    });

    if (deletedEngineer.value.length > 0) {
        formData.value.engineer.delete_id = [];
        formData.value.engineer.delete_id = [
            ...new Set([
                ...formData.value.engineer.delete_id,
                ...deletedEngineer.value,
            ]),
        ];
        formData.value.engineer = [
            ...updatedEngineers,
            { delete_id: formData.value.engineer.delete_id },
        ];
    } else {
        formData.value.engineer = [...updatedEngineers];
    }
    console.log(formData.value.engineer);
}

const focusStates = reactive({
    engineersSelected: false,
});

const isActive = (key) => focusStates[key];

onMounted(() => {
    initialize();
});
</script>

<style scoped>
.field-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    display: inline-block;
    margin-bottom: 6px;
    transition: color 0.2s ease;
}
.field-label--active {
    color: rgb(var(--v-theme-primary)) !important;
}
</style>