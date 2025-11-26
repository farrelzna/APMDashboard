<template>
    <v-container class="flex flex-col">
        <div v-if="!isInfo">
            <v-divider>Project Status Form</v-divider>
            <br />
            <v-row>
                <!-- DESCRIPTION -->
                <v-col cols="4">
                    <v-text-field
                        v-model="newStatus.description"
                        label="Description"
                        variant="outlined"
                        :error-messages="errors.description"
                    ></v-text-field>
                </v-col>

                <!-- DATE SUBMIT -->
                <v-col cols="4">
                    <v-date-input
                        v-model="newStatus.date_submit"
                        label="Date Submit"
                        variant="outlined"
                        :error-messages="errors.date_submit"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                    ></v-date-input>
                </v-col>

                <!-- DATE UPDATE -->
                <v-col cols="4">
                    <v-date-input
                        label="Date Update"
                        variant="outlined"
                        v-model="newStatus.date_update"
                        :error-messages="errors.date_update"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                    ></v-date-input>
                </v-col>

                <!-- STATUS -->
                <v-col cols="4">
                    <v-select
                        v-model="newStatus.status"
                        :items="statusOptions"
                        label="Status"
                        variant="outlined"
                        :error-messages="errors.status"
                    ></v-select>
                </v-col>

                <v-col cols="12">
                    <v-textarea
                        v-model="newStatus.note"
                        label="Note"
                        variant="outlined"
                        :error-messages="errors.note"
                        auto-grow
                    ></v-textarea>
                </v-col>
            </v-row>
            <div class="flex gap-2">
                <v-btn color="primary" @click="addUpdate">
                    {{ isEditing ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn color="secondary" variant="outlined" @click="resetForm">
                    Cancel
                </v-btn>
            </div>
        </div>
        <v-divider>Project Status</v-divider>
        <v-data-table
            :items="formData.project_status"
            :headers="headers"
            item-value="id"
            :items-per-page-options="[]"
            show-expand
        >
            <template v-slot:expanded-row="{ columns, item }">
                <tr>
                    <td :colspan="columns.length">
                        <strong>Note : </strong>
                        <span>{{ item.note }}</span>
                    </td>
                </tr>
            </template>
            <template #item.actions="{ item }" v-if="!isInfo">
                <v-btn
                    variant="text"
                    color="warning"
                    size="small"
                    icon="mdi-pencil"
                    @click="editStatus(item)"
                ></v-btn>
                <v-btn
                    variant="plain"
                    color="error"
                    icon="mdi-minus-circle"
                    v-can="pagePermission.projectStatus.delete"
                    @click="removeStatus(item)"
                ></v-btn>
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { toast } from 'vue-sonner';

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

const headers = [
    { title: 'Description', key: 'description', sortable: false },
    { title: 'Date Submit', key: 'date_submit', sortable: false },
    { title: 'Status', key: 'status', sortable: false },
    { title: 'Date Update', key: 'date_update', sortable: false },
    { title: '', key: 'actions', sortable: false },
];

const newStatus = ref({
    description: '',
    status: '',
    note: '',
});

const props = defineProps({
    formData: Object,
    errors: Object,
    isInfo: Boolean,
});

const { formData, errors } = toRefs(props);
const isEditing = ref(false);
const deletedStatus = ref([]);

const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const validateForm = () => {
    Object.keys(errors.value).forEach(key => {
        errors.value[key] = null;
    });

    let isValid = true;

    if (!newStatus.value.description) {
        errors.value.description = 'Description is required';
        isValid = false;
    }

    if (!newStatus.value.date_submit) {
        errors.value.date_submit = 'Date Submit is required';
        isValid = false;
    }

    if (!newStatus.value.status) {
        errors.value.status = 'Status is required';
        isValid = false;
    }

    return isValid;
};

const addUpdate = () => {
    if (!validateForm()) {
        toast.error('Please fill in all required fields correctly.');
        return;
    }

    if (isEditing.value) {
        const index = formData.value.project_status.findIndex(
            item => item.id === newStatus.value.id
        );
        formData.value.project_status[index] = {
            ...newStatus.value,
            date_submit: formatDate(newStatus.value.date_submit),
            date_update: formatDate(newStatus.value.date_update),
        };
    } else {
        formData.value.project_status.push({
            description: newStatus.value.description,
            date_submit: formatDate(newStatus.value.date_submit),
            status: newStatus.value.status,
            date_update: formatDate(newStatus.value.date_update),
            note: newStatus.value.note,
        });
    }

    resetForm();

    toast.success('Update added successfully!');
};

const editStatus = status => {
    newStatus.value = { ...status };
    newStatus.value.date_submit = new Date(status.date_submit);
    newStatus.value.date_update = new Date(status.date_update);
    isEditing.value = true;
};

const resetForm = () => {
    newStatus.value = {
        description: '',
        date_submit: '',
        status: '',
        date_update: '',
        note: '',
    };
    isEditing.value = false;
};

const removeStatus = status => {
    if (status.id) {
        deletedStatus.value.push(status.id);
    }
    formData.value.project_status = formData.value.project_status.filter(
        item => item !== status
    );
    if (
        !formData.value.project_status.find(item =>
            item.hasOwnProperty('delete_id')
        )
    ) {
        formData.value.project_status.push({
            delete_id: [...new Set(deletedStatus.value)],
        });
    } else {
        formData.value.project_status.find(item =>
            item.hasOwnProperty('delete_id')
        ).delete_id = [...new Set(deletedStatus.value)];
    }
};
</script>
