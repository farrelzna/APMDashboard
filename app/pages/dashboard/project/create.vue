<script setup>
import { toast } from 'vue-sonner';
definePageMeta({
    middleware: 'auth',
});
const currentStep = ref(1);
const totalSteps = 5;
const projectStore = useProjectStore();
const formData = reactive({
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
    engineer_eksternal: [],
    project_type: '',
    po_contract_no: '',
    po_contract_date: '',
    amount_inc_tax: '',
    amount_exc_tax: '',
    id: '',
    customer_str: {},
    pm_str: {},
    finances: [],
    project_status: [],
    engineer: [],
    number: '',
});

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
    finances: [],
    project_status: [],
    engineer: [],
});

const formatLabel = key => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
};

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
        if (!formData[field]) {
            errors.value[field] = 'Required.';
            valid = false;
        } else {
            errors.value[field] = '';
        }
    });

    return valid;
};

const submitForm = async () => {
    const valid = validateForm();

    if (valid) {
        await projectStore.add(formData);
        navigateTo('/dashboard/project');
    } else {
        toast.error('Form is invalid.');
    }
};

const nextStep = () => {
    if (currentStep.value < totalSteps) {
        currentStep.value += 1;
    } else {
        submitForm();
    }
};

const cancel = () => {
    navigateTo('/dashboard/project');
};

const previousStep = () => {
    if (currentStep.value > 1) {
        currentStep.value -= 1;
    }
};
</script>

<template>
    <v-container class="bg-white shadow rounded text-black">
        <!-- Tabs-style navigation -->
        <v-tabs v-model="currentStep" color="primary" class="mb-4">
            <v-tab :value="1">General Informations</v-tab>
            <v-tab :value="2">Contract Informations</v-tab>
            <v-tab :value="3">Project Finance</v-tab>
            <v-tab :value="4">Engineers</v-tab>
            <v-tab :value="5">Tasks</v-tab>
        </v-tabs>

        <v-window v-model="currentStep" class="elevation-0">
            <v-window-item :value="1">
                <v-card flat>
                    <v-card-title class="stepper-title">
                        <dashboards-project-basic-form
                            :form-data="formData"
                            :errors="errors"
                            :is-info="false"
                        />
                    </v-card-title>
                </v-card>
            </v-window-item>

            <v-window-item :value="2">
                <v-card flat>
                    <v-card-title class="stepper-title">
                        <dashboards-project-contract-form
                            :form-data="formData"
                            :errors="errors"
                            :is-info="false"
                        />
                    </v-card-title>
                </v-card>
            </v-window-item>

            <v-window-item :value="3">
                <v-card flat>
                    <v-card-title class="stepper-title">
                        <dashboards-project-finance-form
                            :form-data="formData"
                            :errors="errors"
                            :is-info="false"
                        />
                    </v-card-title>
                </v-card>
            </v-window-item>

            <v-window-item :value="4">
                <v-card flat>
                    <v-card-title class="stepper-title">
                        <dashboards-engineer-form
                            :form-data="formData"
                            :errors="errors"
                            :is-info="false"
                        />
                    </v-card-title>
                </v-card>
            </v-window-item>

            <v-window-item :value="5">
                <v-card flat>
                    <v-card-title class="stepper-title">
                        <dashboards-project-task-form
                            :form-data="formData"
                            :errors="errors"
                            :with-template="true"
                        />
                    </v-card-title>
                </v-card>
            </v-window-item>
        </v-window>
        <v-divider class="my-4"></v-divider>
        <v-row justify="space-between" class="p-5">
            <div class="text-xl font-semibold text-gray-800">Create New Project</div>
            <div class="d-flex gap-3">
                <div>
                    <v-btn v-if="currentStep === 1" @click="cancel" variant="outlined" rounded="lg" :style="{ color: '#111'}">
                        Cancel
                    </v-btn>
                    <v-btn v-else @click="previousStep" variant="outlined" rounded="lg" :style="{ color: '#111'}">
                        Previous
                    </v-btn>
                </div>
                <v-btn @click="nextStep" rounded="lg" :style="{ background:'#111', color:'#fff', fontWeight:600, maxWidth: '180px', minWidth: '100px' }">
                        {{ currentStep === totalSteps ? 'Done' : 'Next' }}
                </v-btn>
            </div>
        </v-row>
    </v-container>
</template>

<style scoped>
.stepper-title {
    font-size: 1rem;
}
</style>
