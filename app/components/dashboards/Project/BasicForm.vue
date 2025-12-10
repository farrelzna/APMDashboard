<template>
    <v-row class="p-2">
        <v-col cols="12" lg="9">
            <v-row dense>
                <v-col cols="12" md="4">
                    <label for="name" :class="['field-label', { 'field-label--active': isActive('name') } ]">Project Name *</label>
                    <v-text-field v-model="formData.name" :rules="[requiredRule]"
                        :error-messages="errors.name" :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'"
                        hide-details @focus="focusStates.name = true" @blur="focusStates.name = false"
                        density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                    <label for="project_type" :class="['field-label', { 'field-label--active': isActive('project_type') } ]">Project Type *</label>
                    <v-text-field v-model="formData.project_type" :rules="[requiredRule]"
                        :error-messages="errors.project_type" :readonly="isInfo"
                        :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.project_type = true" @blur="focusStates.project_type = false"
                        density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                    <label for="year" :class="['field-label', { 'field-label--active': isActive('year') } ]">Year *</label>
                    <v-text-field v-model="formData.year" :rules="[requiredRule, yearRule]"
                        :error-messages="errors.year" :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'"
                        hide-details @focus="focusStates.year = true" @blur="focusStates.year = false"
                        density="compact"></v-text-field>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="12" md="4">
                    <label for="status" :class="['field-label', { 'field-label--active': isActive('status') } ]">Status*</label>
                    <v-select :items="projectStatus" v-model="formData.status" :rules="[requiredRule]"
                        :error-messages="errors.status" :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'"
                        hide-details @focus="focusStates.status = true" @blur="focusStates.status = false"
                        density="compact"></v-select>
                </v-col>
                <v-col cols="12" md="4">
                    <label for="start_date" :class="['field-label', { 'field-label--active': isActive('start_date') } ]">Start Date*</label>
                    <v-date-input v-model="date.start_date" prepend-icon=""
                        prepend-inner-icon="$calendar" :error-messages="errors.start_date" placeholder="YYYY-MM-DD"
                        :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'" hide-details
                        @focus="focusStates.start_date = true" @blur="focusStates.start_date = false" @input="formatDate" density="compact"></v-date-input>
                </v-col>
                <v-col cols="12" md="4">
                    <label for="end_date" :class="['field-label', { 'field-label--active': isActive('end_date') } ]">End Date*</label>
                    <v-date-input v-model="date.end_date" prepend-icon=""
                        prepend-inner-icon="$calendar" :error-messages="errors.end_date" placeholder="YYYY-MM-DD"
                        :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'" hide-details
                        @focus="focusStates.end_date = true" @blur="focusStates.end_date = false" @input="formatDate"
                        density="compact"></v-date-input>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="12" md="4">
                    <label for="remarks" :class="['field-label', { 'field-label--active': isActive('remarks') } ]">Remarks</label>
                    <v-textarea v-model="formData.remarks" rows="8" :readonly="isInfo"
                        :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.remarks = true" @blur="focusStates.remarks = false"
                        density="compact"></v-textarea>
                </v-col>
                <v-col cols="12" md="8">
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <label for="am" :class="['field-label', { 'field-label--active': isActive('am') } ]">AM</label>
                            <v-autocomplete v-model="formData.am" :items="userByRole.pm" :readonly="isInfo"
                                :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.am = true" @blur="focusStates.am = false"
                                density="compact"></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <label for="pm" :class="['field-label', { 'field-label--active': isActive('pm') } ]">PM</label>
                            <v-autocomplete v-model="formData.pm" :items="userByRole.pm" :readonly="isInfo"
                                :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.pm = true" @blur="focusStates.pm = false" density="compact"></v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <label for="sales" :class="['field-label', { 'field-label--active': isActive('sales') } ]">Sales</label>
                            <v-autocomplete v-model="formData.sales" :items="userByRole.sales" :readonly="isInfo"
                                :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.sales = true" @blur="focusStates.sales = false" density="compact"></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <label for="admin_tender" :class="['field-label', { 'field-label--active': isActive('admin_tender') } ]">Admin Tender</label>
                            <v-autocomplete v-model="formData.admin_tender" :items="userByRole.admin_tender"
                                :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'"
                                hide-details @focus="focusStates.admin_tender = true" @blur="focusStates.admin_tender = false" density="compact"></v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <label for="customer" :class="['field-label', { 'field-label--active': isActive('customer') } ]">Client*</label>
                            <v-autocomplete v-model="formData.customer" :items="userByRole.customers"
                                :rules="[requiredRule]" :error-messages="errors.customer" :readonly="isInfo"
                                :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.customer = true" @blur="focusStates.customer = false" density="compact"></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <label for="end_user" :class="['field-label', { 'field-label--active': isActive('end_user') } ]">End User *</label>
                            <v-autocomplete v-model="formData.end_user" :rules="[requiredRule]"
                                :error-messages="errors.end_user" :items="userByRole.end_user" :readonly="isInfo"
                                :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.end_user = true" @blur="focusStates.end_user = false" density="compact"></v-autocomplete>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12" lg="3" class="lg:border-l lg:pl-6">
            <v-row dense>
                <v-col cols="12">
                    <label for="pic" :class="['field-label', { 'field-label--active': isActive('pic') } ]">PIC *</label>
                    <v-text-field v-model="formData.pic" :rules="[requiredRule]"
                        :error-messages="errors.pic" :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'"
                        hide-details @focus="focusStates.pic = true" @blur="focusStates.pic = false" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <label for="pid" :class="['field-label', { 'field-label--active': isActive('pid') } ]">PID *</label>
                    <v-text-field v-model="formData.pid" :rules="[requiredRule]"
                        :error-messages="errors.pid" :readonly="isInfo" :variant="isInfo ? 'underlined' : 'outlined'"
                        hide-details @focus="focusStates.pid = true" @blur="focusStates.pid = false" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <label for="engineer_eksternal" :class="['field-label', { 'field-label--active': isActive('engineer_eksternal') } ]">Engineer Eksternal</label>
                    <v-autocomplete v-model="formData.engineer_eksternal"
                        :items="userByRole.engineer_eksternal" multiple :readonly="isInfo"
                        :variant="isInfo ? 'underlined' : 'outlined'" hide-details @focus="focusStates.engineer_eksternal = true" @blur="focusStates.engineer_eksternal = false" density="compact"></v-autocomplete>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup>
const userStore = useUserStore();
const clientStore = useClientStore();
const props = defineProps({
    formData: Object,
    errors: Object,
    isInfo: Boolean,
});

const date = ref({
    start_date: null,
    end_date: null,
});

const { formData, errors } = toRefs(props);
const userByRole = ref({
    am: [],
    pm: [],
    sales: [],
    admin_tender: [],
    customers: [],
    end_user: [],
});

const projectStatus = [
    'Complete',
    'In Progress',
    'PM / CM',
    'On Hold',
    'Waiting Payment',
    'Almost Due',
    'Not Started Yet',
    'Maintenance',
];

async function initUsers() {
    const userRoles = ['AM', 'PM', 'Sales', 'Admin Tender', 'Engineer'];
    const clientsData = await clientStore.all();
    const clients = clientsData;
    const allUser = await userStore.getAll();

    // Initialize the date values only if they exist in formData
    date.value.start_date = formData.value.start_date
        ? new Date(formData.value.start_date)
        : null;
    date.value.end_date = formData.value.end_date
        ? new Date(formData.value.end_date)
        : null;

    userByRole.value = userRoles.reduce((acc, role) => {
        let formattedRole = role.toLowerCase().replace(/ /g, '_');

        if (role === 'Engineer') {
            const engineers = allUser.filter(user => user.role === 'Engineer');

            acc['engineer_eksternal'] = engineers
                .filter(user => user.status === 'Eksternal')
                .map(user => ({
                    title: `${user.first_name} ${user.last_name}`,
                    value: user.id,
                }));

            acc['engineer_internal'] = engineers
                .filter(user => user.status === 'Internal')
                .map(user => ({
                    title: `${user.first_name} ${user.last_name}`,
                    value: user.id,
                }));
        } else {
            acc[formattedRole] = allUser
                .filter(user => user.role === role)
                .map(user => ({
                    title: `${user.first_name} ${user.last_name}`,
                    value: user.id,
                }));
        }
        return acc;
    }, {});

    userByRole.value.customers = clients
        .filter(client => client.status === 'internal')
        .map(client => ({
            value: client.id,
            title: client.name,
        }));
    userByRole.value.end_user = clients
        .filter(client => client.status === 'eksternal')
        .map(client => ({
            value: client.id,
            title: client.name,
        }));
}

const requiredRule = value => !!value || 'Required.';
const yearRule = value =>
    (value && value > 1900 && value <= new Date().getFullYear()) ||
    'Invalid year.';

onMounted(async () => {
    await initUsers();
});

const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Track focus state per field to drive active label coloring
const focusStates = reactive({
    name: false,
    project_type: false,
    year: false,
    status: false,
    start_date: false,
    end_date: false,
    remarks: false,
    am: false,
    pm: false,
    sales: false,
    admin_tender: false,
    customer: false,
    end_user: false,
    pic: false,
    pid: false,
    engineer_eksternal: false,
});

// Active state should reflect only focus, not filled values
const isActive = (key) => focusStates[key];

watch(
    () => date.value.start_date,
    newValue => {
        formData.value.start_date = formatDate(newValue);
    }
);

watch(
    () => date.value.end_date,
    newValue => {
        formData.value.end_date = formatDate(newValue);
    }
);

watch(
    () => formData.value.engineer_eksternal,
    newValue => {
        const filteredValues = newValue.filter(value => value !== '');
        if (filteredValues.length !== newValue.length) {
            formData.value.engineer_eksternal = filteredValues;
        }
    }
);
</script>

<style scoped>
.field-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280; /* gray-500 */
    display: inline-block;
    margin-bottom: 6px;
    transition: color 0.2s ease;
}
.field-label--active {
    color: rgb(var(--v-theme-primary)) !important;
}
</style>
