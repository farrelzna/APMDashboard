<template>
    <v-container class="flex flex-col">
        <div v-can="pagePermission.projectFinance.add" v-if="!isInfo">
            <v-divider>Project finance form</v-divider>
            <br />
            <v-row>
                <!-- NAME -->
                <v-col cols="4">
                    <v-text-field
                        v-model="newFinance.name"
                        name="name"
                        label="Name"
                        variant="outlined"
                        hide-details
                        :error-messages="errors.name"
                    ></v-text-field>
                </v-col>

                <!-- DATE -->
                <v-col cols="4">
                    <v-date-input
                        v-model="newFinance.date"
                        name="date"
                        hide-details
                        label="Date"
                        variant="outlined"
                        :error-messages="errors.date"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                        @input="formatDate"
                    ></v-date-input>
                </v-col>

                <!-- DATE OF PAYMENT -->
                <v-col cols="4">
                    <v-date-input
                        label="Date of Payment"
                        variant="outlined"
                        v-model="newFinance.date_of_payment"
                        name="date_of_payment"
                        :error-messages="errors.date_of_payment"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                        @input="formatDate"
                        hide-details
                    ></v-date-input>
                </v-col>

                <!-- PO -->
                <v-col cols="4">
                    <v-text-field
                        v-model="newFinance.po"
                        name="po"
                        label="PO"
                        hide-details
                        variant="outlined"
                        :error-messages="errors.po"
                    ></v-text-field>
                </v-col>

                <!-- INVOICE NUMBER -->
                <v-col cols="4">
                    <v-text-field
                        hide-details
                        v-model="newFinance.invoice_number"
                        name="invoice_number"
                        label="Invoice Number"
                        variant="outlined"
                        :error-messages="errors.invoice_number"
                    ></v-text-field>
                </v-col>

                <!-- STATUS -->
                <v-col cols="4">
                    <v-select
                        v-model="newFinance.status"
                        name="status"
                        :items="statusOptions"
                        hide-details
                        label="Status"
                        variant="outlined"
                        :error-messages="errors.status"
                    ></v-select>
                </v-col>

                <v-col cols="12">
                    <v-textarea
                        v-model="newFinance.note"
                        name="note"
                        label="Note"
                        hide-details
                        variant="outlined"
                        :error-messages="errors.note"
                        auto-grow
                    ></v-textarea>
                </v-col>
            </v-row>
            <div class="flex gap-2 pt-5">
                <v-btn
                    color="primary"
                    class="flex self-end"
                    @click="submitForm"
                >
                    {{ isEditing ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn
                    v-if="isEditing"
                    variant="outlined"
                    color="secondary"
                    @click="resetForm"
                >
                    Cancel
                </v-btn>
            </div>
        </div>
        <v-divider>Project finances</v-divider>
        <v-data-table
            :items="formData.finances"
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
                    @click="editFinance(item)"
                ></v-btn>
                <v-btn
                    variant="plain"
                    color="error"
                    icon="mdi-minus-circle"
                    v-can="pagePermission.projectFinance.delete"
                    @click="removeFinance(item)"
                ></v-btn>
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
import { ref, toRefs } from 'vue';
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
    { title: 'Invoice Number', value: 'invoice_number', sortable: false },
    { title: 'Name', value: 'name', sortable: false },
    { title: 'PO', value: 'po', sortable: false },
    { title: 'Status', value: 'status', sortable: false },
    { title: 'Date Of Payment', value: 'date_of_payment', sortable: false },
    { title: '', key: 'actions', sortable: false },
];

const newFinance = ref({
    id: null,
    name: '',
    po: '',
    invoice_number: '',
    status: '',
    note: '',
    date: null,
    date_of_payment: null,
});

const isEditing = ref(false);

const props = defineProps({
    formData: Object,
    errors: Object,
    isInfo: Boolean,
});

const { formData, errors } = toRefs(props);
const deletedFinance = ref([]);

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

    if (!newFinance.value.name) {
        errors.value.name = 'Name is required';
        isValid = false;
    }

    if (!newFinance.value.po) {
        errors.value.po = 'PO is required';
        isValid = false;
    }

    if (!newFinance.value.status) {
        errors.value.status = 'Status is required';
        isValid = false;
    }

    return isValid;
};

const removeFinance = finance => {
    const index = formData.value.finances.findIndex(
        item => item.id === finance.id
    );
    if (index !== -1) {
        if (finance.id) {
            deletedFinance.value.push(finance.id);
        }

        formData.value.finances.splice(index, 1);
    }

    if (
        !formData.value.finances.find(item => item.hasOwnProperty('delete_id'))
    ) {
        formData.value.finances.push({
            delete_id: [...new Set(deletedFinance.value)],
        });
    } else {
        formData.value.finances.find(item =>
            item.hasOwnProperty('delete_id')
        ).delete_id = [...new Set(deletedFinance.value)];
    }
};

const editFinance = finance => {
    newFinance.value = { ...finance };
    newFinance.value.date = new Date(finance.date);
    newFinance.value.date_of_payment = new Date(finance.date_of_payment);
    isEditing.value = true;
};

const submitForm = () => {
    if (!validateForm()) {
        toast.error('Please fill in all required fields correctly.');
        return;
    }

    if (isEditing.value) {
        const updatedFinances = formData.value.finances.map(item => {
            if (item.id === newFinance.value.id) {
                return {
                    ...newFinance.value,
                    date: formatDate(newFinance.value.date),
                    date_of_payment: formatDate(
                        newFinance.value.date_of_payment
                    ),
                };
            }
            return item;
        });

        formData.value.finances = updatedFinances;
    } else {
        formData.value.finances.push({
            ...newFinance.value,
            date: formatDate(newFinance.value.date),
            date_of_payment: formatDate(newFinance.value.date_of_payment),
        });

        delete formData.value.finances[formData.value.finances.length - 1].id;
    }

    formData.value.finances = formData.value.finances.filter(
        item => !deletedFinance.value.includes(item.id)
    );

    resetForm();
};

const resetForm = () => {
    newFinance.value = {
        id: null,
        name: '',
        po: '',
        invoice_number: '',
        status: '',
        note: '',
        date: null,
        date_of_payment: null,
    };
    isEditing.value = false;
};
</script>
