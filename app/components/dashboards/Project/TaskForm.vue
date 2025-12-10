<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="12">
                <v-card title="Task Form" class="elevation-0">
                    <v-card-text>
                        <v-form v-model="valid">
                            <v-row align="end">
                                <v-col cols="12" md="4">
                                    <label for="description" :class="['field-label', { 'field-label--active': isActive('description') }]">Description</label>
                                    <v-text-field
                                        v-model="task.description"
                                        name="description"
                                        variant="outlined"
                                        hide-details
                                        density="compact"
                                        @focus="focusStates.description = true" @blur="focusStates.description = false"
                                    ></v-text-field>
                                </v-col>

                                <v-col cols="12" md="4">
                                    <label for="status" :class="['field-label', { 'field-label--active': isActive('status') }]">Status</label>
                                    <v-select
                                        v-model="task.status"
                                        name="status"
                                        :items="statuses"
                                        variant="outlined"
                                        hide-details
                                        density="compact"
                                        @focus="focusStates.status = true" @blur="focusStates.status = false"
                                    ></v-select>
                                </v-col>

                                <v-col cols="12" md="8">
                                    <label for="note" :class="['field-label', { 'field-label--active': isActive('note') }]">Note</label>
                                    <v-textarea
                                        v-model="task.note"
                                        name="note"
                                        variant="outlined"
                                        hide-details
                                        auto-grow
                                        density="compact"
                                        @focus="focusStates.note = true" @blur="focusStates.note = false"
                                    ></v-textarea>
                                </v-col>

                                <v-col cols="4">
                                    <div class="flex justify-end">
                                        <v-btn
                                            :style="{ background:'#111', color:'#fff', fontWeight:600 }"
                                            width="40%"
                                            rounded="lg"
                                            @click="saveTask"
                                        >
                                            {{ isEditing ? 'Save Task' : 'Add Task' }}
                                        </v-btn>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-row>
            <v-col cols="12">
                <div class="flex items-center justify-between py-5">
                    <div class="text-xl font-bold text-grey-darken-1">Task Table</div>
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
                    :headers="headers"
                    :items="filteredItems"
                    item-value="description"
                    show-expand
                    :items-per-page="itemsPerPage"
                    v-model:page="page"
                    hide-default-footer
                    class="elevation-0"
                >
                    <template v-slot:expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length">
                                <strong>Note : </strong>
                                <span>{{ item.note }}</span>
                            </td>
                        </tr>
                    </template>
                    <template v-slot:item.checkbox="{ item }">
                        <v-checkbox
                            :model-value="item.status === 'Complete'"
                            density="compact"
                            class="h-10"
                            hide-details
                            @update:modelValue="val => item.status = val ? 'Complete' : 'In Progress'"
                        />
                    </template>
                    <template v-slot:item.status="{ item }">
                        <v-chip :color="colorByStatus(item.status)">
                            {{ item.status }}
                        </v-chip>
                    </template>

                    <template v-slot:item.actions="{ item, index }">
                        <v-btn
                            variant="plain"
                            class="mb-5"
                            color="warning"
                            icon="mdi-pencil-outline"
                            @click="editTask(index)"
                        ></v-btn>
                        <v-btn
                            variant="plain"
                            class="mb-5"
                            color="error"
                            icon="mdi-minus-circle"
                            @click="deleteTask(item, index)"
                        ></v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
const props = defineProps({
    formData: Object, // Expecting `formData` as a prop
    errors: Object, // If there are validation errors
    withTemplate: Boolean,
});

const defaultTasks = [
    {
        description: 'Initiate Project',
        status: 'In Progress',
        note: '',
    },
    {
        description: 'Plan Project',
        status: 'In Progress',
        note: '',
    },
    {
        description: 'Execute Project',
        status: 'In Progress',
        note: '',
    },
    {
        description: 'Monitor Project',
        status: 'In Progress',
        note: '',
    },
    {
        description: 'Close Project',
        status: 'In Progress',
        note: '',
    },
];

const task = ref({
    description: '',
    status: '',
    note: '',
});

const sub = ref({
    description: '',
    status: '',
});

const isEditing = ref(false); // Track if a task is being edited
const editingIndex = ref(null); // Store the index of the task being edited

const statuses = [
    'Complete',
    'In Progress',
    'PM / CM',
    'On Hold',
    'Waiting Payment',
    'Almost Due',
    'Not Started Yet',
    'Maintenance',
    'Opti',
];

const headers = [
    { title: '#', key: 'checkbox', width: '1%' },
    { title: 'Description', key: 'description' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions' },
];

const valid = ref(false);
const validsub = ref(false);

const addTask = () => {
    if (valid.value) {
        if (!props.formData.project_status) {
            props.formData.project_status = [];
        }

        props.formData.project_status.push({ ...task.value });

        task.value.description = '';
        task.value.status = '';
        task.value.note = '';
    }
};

// Function to save task (either edit or add)
const saveTask = () => {
    if (valid.value) {
        if (isEditing.value) {
            // Update the task
            props.formData.project_status[editingIndex.value] = {
                ...task.value,
            };
            isEditing.value = false;
            editingIndex.value = null;
        } else {
            // Add new task
            addTask();
        }

        // Clear the form
        task.value.description = '';
        task.value.status = '';
        task.value.note = '';
    }
};

// Function to edit a task
const editTask = index => {
    // Populate the form with the selected task data
    task.value = { ...props.formData.project_status[index] };
    isEditing.value = true;
    editingIndex.value = index;
};

// Function to mark a task for deletion by adding delete_id
const deleteTask = (item, index) => {
    if (!props.formData.project_status.delete_id) {
        props.formData.project_status.delete_id = [];
    }

    if (item.id) {
        props.formData.project_status.delete_id.push(item.id);
    }

    // Optionally, you can still remove the task from the UI (or leave it visible)
    props.formData.project_status.splice(index, 1);
};

onMounted(() => {
    // Check if formData.project_status is empty and assign default tasks if so
    if (
        !props.formData.project_status ||
        props.formData.project_status.length === 0
    ) {
        props.formData.project_status = [...defaultTasks];
    }
});

const page = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [10, 25, 50];

const filteredItems = computed(() => (props.formData.project_status || []).filter(i => i && !('delete_id' in i)));
const totalItems = computed(() => filteredItems.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const rangeStart = computed(() => (totalItems.value === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1));
const rangeEnd = computed(() => Math.min(totalItems.value, page.value * itemsPerPage.value));

watch(itemsPerPage, () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
});

watch(filteredItems, () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
});

const focusStates = reactive({
    description: false,
    status: false,
    note: false,
});

const isActive = (key) => focusStates[key];
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
