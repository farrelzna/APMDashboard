<template>
    <v-container class="flex flex-col">
        <div v-can="pagePermission.projectFinance.add" v-if="!isInfo" class="mb-5">
            <v-row align="end">
                <!-- NAME -->
                <v-col cols="4">
                    <label for="name" :class="['field-label', {'field-label--active': isActive('name')}]">Name*</label>
                    <v-text-field
                        v-model="newFinance.name"
                        name="name"
                        variant="outlined"
                        hide-details
                        :error-messages="errors.name"
                        @focus="focusStates.name = true" @blur="focusStates.name = false"
                        density="compact"
                    ></v-text-field>
                </v-col>

                <!-- DATE -->
                <v-col cols="4">
                    <label for="date" :class="['field-label', {'field-label--active': isActive('date')}]">Date</label>
                    <v-date-input
                        v-model="newFinance.date"
                        name="date"
                        hide-details
                        variant="outlined"
                        :error-messages="errors.date"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                        @input="formatDate"
                        @focus="focusStates.date = true" @blur="focusStates.date = false"
                        density="compact"
                    ></v-date-input>
                </v-col>

                <!-- DATE OF PAYMENT -->
                <v-col cols="4">
                    <label for="date_of_payment" :class="['field-label', {'field-label--active': isActive('date_of_payment')}]">Date of Payment</label>
                    <v-date-input
                        variant="outlined"
                        v-model="newFinance.date_of_payment"
                        name="date_of_payment"
                        :error-messages="errors.date_of_payment"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                        @input="formatDate"
                        hide-details
                        @focus="focusStates.date_of_payment = true" @blur="focusStates.date_of_payment = false"
                        density="compact"
                    ></v-date-input>
                </v-col>

                <!-- PO -->
                <v-col cols="4">
                    <label for="po" :class="['field-label', {'field-label--active': isActive('po')}]">PO</label>
                    <v-text-field
                        v-model="newFinance.po"
                        name="po"
                        hide-details
                        variant="outlined"
                        :error-messages="errors.po"
                        @focus="focusStates.po = true" @blur="focusStates.po = false"
                        density="compact"
                    ></v-text-field>
                </v-col>

                <!-- INVOICE NUMBER -->
                <v-col cols="4">
                    <label for="invoice_number" :class="['field-label', {'field-label--active': isActive('invoice_number')}]">Invoice Number</label>
                    <v-text-field
                        hide-details
                        v-model="newFinance.invoice_number"
                        name="invoice_number"
                        variant="outlined"
                        :error-messages="errors.invoice_number"
                        @focus="focusStates.invoice_number = true" @blur="focusStates.invoice_number = false"
                        density="compact"
                    ></v-text-field>
                </v-col>

                <!-- STATUS -->
                <v-col cols="4">
                    <label for="status" :class="['field-label', {'field-label--active': isActive('status')}]">Status*</label>
                    <v-select
                        v-model="newFinance.status"
                        name="status"
                        :items="statusOptions"
                        hide-details
                        variant="outlined"
                        :error-messages="errors.status"
                        @focus="focusStates.status = true" @blur="focusStates.status = false"
                        density="compact"
                    ></v-select>
                </v-col>

                <v-col cols="8">
                    <label for="note" :class="['field-label', {'field-label--active': isActive('note')}]">Note</label>
                    <v-textarea
                        v-model="newFinance.note"
                        name="note"
                        hide-details
                        variant="outlined"
                        :error-messages="errors.note"
                        @focus="focusStates.note = true" @blur="focusStates.note = false"
                        auto-grow
                        density="compact"
                    ></v-textarea>
                </v-col>

                <v-col cols="4">
                    <div class="flex justify-end gap-2">
                        <v-btn
                            :style="{ background:'#111', color:'#fff', fontWeight:600 }"
                            class="flex self-end"
                            width="40%"
                            rounded="lg"
                            @click="submitForm"
                        >
                            {{ isEditing ? 'Update' : 'Add' }}
                        </v-btn>
                        <v-btn
                            v-if="isEditing"
                            variant="outlined"
                            color="secondary"
                            @click="resetForm"
                            rounded="lg"
                        >
                            Cancel
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </div>
        <v-divider></v-divider>
        <div class="flex items-center justify-between py-5">
            <div class="text-xl font-bold text-grey-darken-1">Project Finances</div>
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
            :items="filteredItems"
            :headers="headers"
            item-value="id"
            :items-per-page-options="[]"
            :items-per-page="itemsPerPage"
            v-model:page="page"
            hide-default-footer
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
import { ref, toRefs, computed, watch, reactive } from 'vue';
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
const editingIndex = ref(-1);

const props = defineProps({
    formData: Object,
    errors: Object,
    isInfo: Boolean,
});

const { formData, errors } = toRefs(props);
const deletedFinance = ref([]);

// Controlled pagination with compact header selector
const page = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [10, 25, 50];

const filteredItems = computed(() => (formData.value.finances || []).filter(i => i && !('delete_id' in i)));
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
    newFinance.value.date = finance?.date ? new Date(finance.date) : null;
    newFinance.value.date_of_payment = finance?.date_of_payment ? new Date(finance.date_of_payment) : null;
    editingIndex.value = formData.value.finances.findIndex(i => i === finance);
    isEditing.value = true;
};

const submitForm = () => {
    if (!validateForm()) {
        toast.error('Please fill in all required fields correctly.');
        return;
    }

    if (isEditing.value) {
        const updated = {
            ...newFinance.value,
            date: formatDate(newFinance.value.date),
            date_of_payment: formatDate(newFinance.value.date_of_payment),
        };
        if (
            editingIndex.value >= 0 &&
            editingIndex.value < formData.value.finances.length
        ) {
            formData.value.finances.splice(editingIndex.value, 1, updated);
        } else {
            const byId = formData.value.finances.findIndex(
                item => item && item.id && item.id === newFinance.value.id
            );
            if (byId !== -1) {
                formData.value.finances.splice(byId, 1, updated);
            }
        }
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
    editingIndex.value = -1;
};

const focusStates = reactive({
    name: false,
    date: false,
    date_of_payment: false,
    po: false,
    invoice_number: false,
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