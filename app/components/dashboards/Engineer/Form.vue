<template>
    <v-row class="p-5">
        <v-col>
            <div class="flex flex-col gap-2">
                <div class="flex gap-2" v-if="!isInfo">
                    <v-autocomplete variant="outlined" label="Add engineer" :items="engineersList"
                        v-model="engineersSelected"></v-autocomplete>
                    <v-btn variant="outlined" size="x-large" color="primary" @click="addSelectedEngineer">
                        Add
                    </v-btn>
                </div>
                <v-data-table :items="items" :headers="headers" item-value="id" :items-per-page-options="[]">
                    <template #item.number="{ index }">
                        {{ index + 1 }}
                    </template>
                    <template #item.workload="{ item }">
                        <v-text-field v-model="item.workload" variant="outlined" label="Workload *" :name="`${item.id}`"
                            dense @input="updateWorkload(item)" required></v-text-field>
                    </template>
                    <template #item.status="{ item }">
                        <v-select v-model="item.workload_status" :items="statusOptions" :name="`${item.id}`"
                            variant="outlined" dense @update:modelValue="updateStatus(item)" label="Status"></v-select>
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
import { ref, onMounted, toRefs, defineProps } from 'vue';
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

const toast = useToast();

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

onMounted(() => {
    initialize();
});
</script>
