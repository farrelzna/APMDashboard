<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
    finances: Object,
});

const headers = [
    { title: 'Invoice Number', value: 'invoice_number', sortable: false },
    { title: 'Name', value: 'name', sortable: false },
    { title: 'PO', value: 'po', sortable: false },
    { title: 'Status', value: 'status', sortable: false },
    { title: 'Date Of Payment', value: 'date_of_payment', sortable: false },
];

const page = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [10, 25, 50];

const filteredItems = computed(() => (props.finances || []).filter(i => i && !('delete_id' in i)));
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
</script>

<template>
    <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-grey-darken-1">Finances Table</div>
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
    <v-divider class="mt-4"></v-divider>
    <v-data-table
        :items="filteredItems"
        :headers="headers"
        item-value="id"
        density="compact"
        :items-per-page-options="[]"
        :items-per-page="itemsPerPage"
        v-model:page="page"
        hide-default-footer
        show-expand
    >
        <template v-slot:item.status="{ item }">
            <v-chip size="small" :color="colorByStatus(item.status)">{{
                item.status
            }}</v-chip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
            <tr>
                <td :colspan="columns.length">
                    <strong>Note : </strong>
                    <span>{{ item.raw ? item.raw.note : item.note }}</span>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>
