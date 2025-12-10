<script setup>
definePageMeta({
    middleware: 'auth',
});
import { toast } from 'vue-sonner';

const route = useRoute();
const projectStore = useProjectStore();

const currentStep = ref(1);
const totalSteps = 5;

const formData = ref({
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
    ];

    requiredFields.forEach(field => {
        if (!formData.value[field]) {
            errors.value[field] = 'Required.';
            valid = false;
        } else {
            errors.value[field] = '';
        }
    });

    return valid;
};

// Form submission
const submitForm = async () => {
    const valid = validateForm();
    if (formData.value.engineer) {
        formData.value.engineer.map(item => {
            if (item.isNew) {
                return {
                    engineer: item.id,
                    workload: item.workload,
                    workload_status: item.workload_status,
                };
            } else {
                if (item.id) {
                    delete item.engineer;
                    return {
                        id: item.id,
                        workload: item.workload,
                        workload_status: item.workload_status,
                    };
                }
            }
        });
    }

    if (valid) {
        try {
            await projectStore.update(
                route.params.id,
                formData.value,
                formData.value
            );
            navigateTo('/dashboard/project');
        } catch (error) {
            toast.error('Failed to create project.');
        }
    } else {
        toast.error('Form is invalid.');
    }
};

// Next and previous step navigation
const nextStep = () => {
    if (currentStep.value < totalSteps) {
        currentStep.value += 1;
    } else {
        submitForm();
    }
};

const previousStep = () => {
    if (currentStep.value > 1) {
        currentStep.value -= 1;
    }
};

const cancel = () => {
    navigateTo('/dashboard/project');
};

// Load project data by ID
const loadData = async () => {
    try {
        const data = await projectStore.searchById(route.params.id);
        formData.value = { ...formData.value, ...data };
    } catch (error) {
        toast.error('Failed to load project data.');
    }
};

// Load data when component is mounted
onMounted(() => {
    loadData();
});
</script>

<template>
    <v-container class="bg-white shadow rounded text-black">
        <!-- Tabs-style navigation aligned with create -->
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
            <div class="text-xl font-semibold text-gray-800">Update Project</div>
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
