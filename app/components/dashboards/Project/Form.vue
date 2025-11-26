<template>
    <v-tabs v-model="tab" color="primary">
        <v-tab value="project">Project Information</v-tab>
        <v-tab value="engineers" v-can="pagePermission.projectEngineer.view">
            Engineer
        </v-tab>
        <v-tab value="finances" v-can="pagePermission.projectFinance.view">
            Finances
        </v-tab>
        <v-tab value="status" v-can="pagePermission.projectStatus.view">
            Status
        </v-tab>
        <v-tab value="documents" v-can="pagePermission.projectDocument.view">
            Documents
        </v-tab>
    </v-tabs>

    <form class="w-full" @submit.prevent="submitForm">
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="project">
                <div class="d-flex flex-row">
                    <v-tabs
                        v-model="subTabs"
                        color="primary"
                        direction="vertical"
                    >
                        <v-tab
                            text="Basic Information"
                            value="basic-info"
                        ></v-tab>
                        <v-tab
                            text="Contract Information"
                            value="contract-info"
                        ></v-tab>
                    </v-tabs>
                    <v-tabs-window v-model="subTabs" class="w-full">
                        <v-tabs-window-item value="basic-info">
                            <BasicForm
                                :formData="formData"
                                :errors="errors"
                                :isInfo="isInfo"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="contract-info">
                            <ContractForm
                                :formData="formData"
                                :errors="errors"
                                :isInfo="isInfo"
                            />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="engineers">
                <DashboardsEngineerForm
                    :formData="formData"
                    :errors="errors"
                    :isInfo="isInfo"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="finances">
                <DashboardsProjectFinanceForm
                    :formData="formData"
                    :errors="errors"
                    :isInfo="isInfo"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="status">
                <DashboardsProjectStatusForm
                    :formData="formData"
                    :errors="errors"
                    :isInfo="isInfo"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <h1>Form documents</h1>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-btn type="submit" color="primary" class="ml-5 mb-5" v-if="!isInfo">
            Save
        </v-btn>
    </form>
</template>

<script setup>
import { toast } from 'vue-sonner';
import ContractForm from './ContractForm.vue';
import BasicForm from './BasicForm.vue';

const tab = ref('project');
const subTabs = ref('basic-info');
const projectStore = useProjectStore();

const props = defineProps({
    defaultItem: Object,
    editedItem: Object,
    isInfo: Boolean,
    closeModal: Function,
});

const emit = defineEmits(['refreshData']);

const formData = ref({ ...props.editedItem });

const errors = ref({
    year: '',
    pid: '',
    name: '',
    status: '',
    customer: '',
    end_user: '',
    remarks: '',
    am: '',
    pm: '',
    sales: '',
    admin_tender: '',
    pic: '',
    start_date: '',
    end_date: '',
    term_of_payment: '',
    scope_of_work: '',
    engineer_eksternal: '',
    project_type: '',
    po_contract_no: '',
    po_contract_date: '',
    amount_inc_tax: '',
    amount_exc_tax: '',
    finance: [],
    project_status: [],
    engineer: [],
});

const requiredRule = value => !!value || 'Required.';
const yearRule = value =>
    (value && value > 1900 && value <= new Date().getFullYear()) ||
    'Invalid year.';
const dateRule = value =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) || 'Invalid date format. Use YYYY-MM-DD.';
const amountRule = value => !isNaN(value) || 'Invalid amount.';

const validateForm = () => {
    let valid = true;
    const requiredFields = [
        'year',
        'pid',
        'name',
        'status',
        'customer',
        'end_user',
        'pic',
        'start_date',
        'end_date',
        'term_of_payment',
        'scope_of_work',
        'project_type',
        'po_contract_no',
        'po_contract_date',
        'amount_inc_tax',
        'amount_exc_tax',
    ];

    requiredFields.forEach(field => {
        if (!formData.value[field]) {
            errors.value[field] = 'Required.';
            valid = false;
        } else {
            errors.value[field] = '';
        }
    });

    if (formData.value.year && !yearRule(formData.value.year)) {
        errors.value.year = yearRule(formData.value.year);
        valid = false;
    }
    if (formData.value.start_date && !dateRule(formData.value.start_date)) {
        errors.value.start_date = dateRule(formData.value.start_date);
        valid = false;
    }
    if (formData.value.end_date && !dateRule(formData.value.end_date)) {
        errors.value.end_date = dateRule(formData.value.end_date);
        valid = false;
    }
    if (
        formData.value.amount_inc_tax &&
        !amountRule(formData.value.amount_inc_tax)
    ) {
        errors.value.amount_inc_tax = amountRule(formData.value.amount_inc_tax);
        valid = false;
    }
    if (
        formData.value.amount_exc_tax &&
        !amountRule(formData.value.amount_exc_tax)
    ) {
        errors.value.amount_exc_tax = amountRule(formData.value.amount_exc_tax);
        valid = false;
    }

    return valid;
};

const submitForm = async () => {
    const valid = validateForm();

    if (valid) {
        try {
            formData.value.engineer.map(item => {
                if (item.isNew) {
                    return {
                        engineer: item.id,
                        workload: item.workload,
                        workload_status: item.workload_status,
                    };
                } else {
                    return {
                        id: item.id,
                        workload: item.workload,
                        workload_status: item.workload_status,
                    };
                }
            });

            if (formData.value.id) {
                await projectStore.update(
                    formData.value.id,
                    formData.value,
                    props.editedItem
                );
            } else {
                await projectStore.add(formData.value);
            }
            setTimeout(() => {
                emit('refreshData');
            }, 500);
        } catch (error) {
            toast.error('Failed to save project.');
        }
    } else {
        toast.error('Form is invalid.');
    }
};
</script>
