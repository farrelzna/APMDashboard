<script setup>
import { computed } from 'vue';

const props = defineProps({
    project: Object,
});

const projectLoaded = computed(
    () => !!props.project && Object.keys(props.project).length > 0
);

const formatCurrency = value => {
    return value
        ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
          }).format(value)
        : '-';
};

const information = computed(() => [
    { icon: 'mdi-tune', label: 'PID', value: props.project?.pid || '-' },
    {
        icon: 'mdi-folder-multiple',
        label: 'Project Type',
        value: props.project?.project_type || '-',
    },
    {
        icon: 'mdi-domain',
        label: 'User',
        value: props.project?.customer_str?.name || '-',
    },
    {
        icon: 'mdi-account-tie',
        label: 'PIC',
        value: props.project?.pic || '-',
    },
    {
        icon: 'mdi-account-cash-outline',
        label: 'AM',
        value: props.project?.am_str.full_name || '-',
    },
    {
        icon: 'mdi-briefcase',
        label: 'PM',
        value: props.project?.pm_str?.full_name || '-',
    },
    {
        icon: 'mdi-cash-register',
        label: 'Sales',
        value: props.project?.sales_str.full_name || '-',
    },
    {
        icon: 'mdi-file-document',
        label: 'Admin Tender',
        value: props.project?.admin_tender_str.full_name || '-',
    },
]);

const contractInformation = computed(() => [
    {
        icon: 'mdi-map',
        label: 'Scope of work',
        value: props.project?.scope_of_work,
    },
    {
        icon: 'mdi-wallet',
        label: 'Term of payment',
        value: props.project?.term_of_payment,
    },
    {
        icon: 'mdi-cash-plus',
        label: 'Amount Inc. Tax',
        value: formatCurrency(props.project?.amount_inc_tax),
    },
    {
        icon: 'mdi-cash-minus',
        label: 'Amount Exc. Tax',
        value: formatCurrency(props.project?.amount_exc_tax),
    },
    {
        icon: 'mdi-file-document-outline',
        label: 'PO Contract No',
        value: props.project?.po_contract_no || '-',
    },
    {
        icon: 'mdi-calendar-outline',
        label: 'PO Contract Date',
        value: props.project?.po_contract_date || '-',
    },
]);
</script>

<template>
    <v-row v-if="projectLoaded">
        <v-col cols="12">
            <div class="w-full flex flex-col gap-5">
                <h3 class="text-body-1 font-weight-semibold">Informations</h3>
                <v-row class="p-3">
                    <v-col
                        v-for="(item, index) in information"
                        :key="index"
                        cols="12"
                        sm="12"
                        md="6"
                        lg="6"
                    >
                        <div class="text-xs grid grid-cols-12 gap-2 w-full">
                            <div
                                class="flex gap-2 col-span-6 md:col-span-5 lg:col-span-4"
                            >
                                <v-icon class="text-gray-400">{{
                                    item.icon
                                }}</v-icon>
                                <b>{{ item.label }}</b>
                            </div>
                            <b class="col-span-2">:</b>
                            <span
                                class="text-end col-span-4 md:col-span-5 lg:col-span-6"
                            >
                                {{ item.value || '-' }}
                            </span>
                        </div>
                    </v-col>
                </v-row>

                <v-divider></v-divider>

                <h3 class="text-body-1 font-weight-semibold">Contract Informations</h3>
                <v-row class="p-3">
                    <v-col
                        v-for="(item, index) in contractInformation"
                        :key="index"
                        cols="12"
                        sm="12"
                        md="6"
                        lg="6"
                    >
                        <div class="text-xs grid grid-cols-12 gap-2 w-full">
                            <div
                                class="flex gap-2 col-span-6 md:col-span-5 lg:col-span-4"
                            >
                                <v-icon class="text-gray-400">{{
                                    item.icon
                                }}</v-icon>
                                <b>{{ item.label }}</b>
                            </div>
                            <b class="col-span-2">:</b>
                            <span
                                class="text-end col-span-4 md:col-span-5 lg:col-span-6"
                            >
                                {{ item.value || '-' }}
                            </span>
                        </div>
                    </v-col>
                </v-row>
            </div>
        </v-col>
    </v-row>

    <div v-else>
        <v-skeleton-loader
            v-for="i in 6"
            :key="i"
            type="table-row"
            class="w-full h-full"
        />
        <v-skeleton-loader type="table-row-divider" class="w-full h-full" />
    </div>
</template>

<style scoped>
/* No custom styles needed - using Vuetify utility classes */
</style>
