<template>
    <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-grey-darken-1">Tasks Table</div>
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
        v-model:selection="selected"
        :headers="headers"
        :items="pagedItems"
        item-value="description"
        :items-per-page="itemsPerPage"
        show-expand
        expand-on-click
        v-model:expanded="expanded"
        hover
        density="compact"
        hide-default-footer
    >
        <!-- Status column with colored chip -->
        <template v-slot:item.status="{ item }">
            <v-chip size="small" :color="colorByStatus(item.status)">
                {{ item.status }}
            </v-chip>
        </template>

        <!-- Row number -->
        <template v-slot:item.number="{ item }">
            {{ pagedItems.indexOf(item) + 1 }}
        </template>

        <!-- Checkbox column -->
        <template v-slot:item.checkbox="{ item }">
            <v-checkbox
                :model-value="item.status === 'Complete'"
                density="compact"
                class="h-10"
                hide-details
                disabled
            />
        </template>

        <!-- Expanded row with notes and children -->
        <template v-slot:expanded-row="{ columns, item }">
            <tr v-if="item.note">
                <td :colspan="columns.length">
                    <div class="p-2 bg-gray-100 rounded">
                        <strong>Note : </strong>
                        <span>{{ item.note }}</span>
                    </div>
                </td>
            </tr>
            <tr v-for="child in getChildren(item)" :key="child.name">
                <td>
                    <v-checkbox
                        v-model="child.selected"
                        density="compact"
                        class="h-10"
                    />
                </td>
                <td>{{ child.name }}</td>
                <td>
                    <v-chip size="small" :color="colorByStatus(child.status)">
                        {{ child.status }}
                    </v-chip>
                </td>
                <td>{{ child.note }}</td>
            </tr>
        </template>
    </v-data-table>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
    tasks: Array,
});

const headers = ref([
    { title: '#', key: 'number', width: '1%' },
    { title: '', key: 'checkbox', width: '1%', sortable: false },
    { title: 'Task', key: 'description' },
    { title: 'Status', key: 'status' },
]);

const selected = ref([]);
const expanded = ref([]);

const page = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [10, 25, 50];

const tasks = computed(() => props.tasks || []);
const totalItems = computed(() => tasks.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const rangeStart = computed(() => (totalItems.value === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1));
const rangeEnd = computed(() => Math.min(totalItems.value, page.value * itemsPerPage.value));
const pagedItems = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value;
    return tasks.value.slice(start, start + itemsPerPage.value);
});

watch(itemsPerPage, () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
});

watch(tasks, () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
});

function getChildren(parent) {
    return parent.children || [];
}
</script>
