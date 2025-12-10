<script setup>
const props = defineProps({
    status: {
        required: false,
        default: 'eksternal',
        type: String,
    },
});

const userStore = useUserStore();
const clientStore = useClientStore();

const dialog = ref(false);
const dialogDelete = ref(false);
const infoShow = ref(false);
const loading = ref(true);
const search = ref(null);
const currentPage = ref(1);
const currentSort = ref([]);

const clients = reactive({
    page: { per_page: 10, count_result: 0 },
    results: [],
});
const editedIndex = ref(-1);

const editedItem = reactive({
    logo: '',
    logoFile: null,
    name: '',
    phone: '',
    email: '',
    web: '',
    address: '',
    status: props.status
});

const defaultItem = {
    logo: '',
    logoFile: null,
    name: '',
    phone: '',
    email: '',
    web: '',
    address: '',
    status: props.status
};

const deletedItem = ref(null); // ← Will be removed, use editedItem instead

const formTitle = computed(() => {
    if (editedIndex.value === -1) {
        return props.status === 'eksternal' ? 'Create New End User' : 'Create New Client';
    }
    return props.status === 'eksternal' ? 'Update End User Information' : 'Update Client Information';
});

const status = ref(props.status);

onMounted(() => {
    try {
        userStore.fetchUser();
    } catch (e) {}
});

watch(dialog, val => {
    if (!val) close();
});
watch(dialogDelete, val => {
    if (!val) closeDelete();
});

// Reload data when page changes via top chevrons
watch(currentPage, async (page) => {
    try {
        await loadItems({ page, itemsPerPage: clients.page.per_page, sortBy: currentSort.value });
    } catch (error) {
        console.error('Failed to load page:', error);
    }
});

// Reset to first page and reload when search changes
watch(search, async () => {
    currentPage.value = 1;
    await loadItems({ page: 1, itemsPerPage: clients.page.per_page, sortBy: currentSort.value });
});

const loadItems = async ({ page, itemsPerPage, sortBy = [] }) => {
    loading.value = true;
    currentPage.value = page;
    currentSort.value = Array.isArray(sortBy) ? sortBy : [];

    try {
        // Fetch first page to get count and per_page
        const firstPage = await clientStore.fetchAll(
            1,
            search.value || '',
            status.value,
            itemsPerPage || clients.page.per_page
        );
        
        if (!firstPage?.page) {
            clients.results = [];
            clients.page.count_result = 0;
            return;
        }

        const totalCount = firstPage.page.count_result || 0;
        const perPage = firstPage.page.per_page || (itemsPerPage || clients.page.per_page);
        clients.page.count_result = totalCount;
        clients.page.per_page = perPage;

        // Build dataset for sorting across pages when sort is active
        let allResults = Array.isArray(firstPage.results) ? [...firstPage.results] : [];
        const totalPages = Math.ceil(totalCount / perPage);
        const hasSort = Array.isArray(sortBy) && sortBy.length > 0;
        
        // OPTIMIZATION: Limit max pages for client-side sorting to prevent performance issues
        const MAX_SORT_PAGES = 10; // Max 100 items (10 pages × 10 items)
        
        if (hasSort && totalPages > 1) {
            if (totalPages > MAX_SORT_PAGES) {
                console.warn(`Too many pages (${totalPages}) for client-side sorting. Limited to ${MAX_SORT_PAGES} pages.`);
            }
            const pagesToFetch = Math.min(totalPages, MAX_SORT_PAGES);
            
            for (let p = 2; p <= pagesToFetch; p++) {
                const pageData = await clientStore.fetchAll(p, search.value || '', status.value, perPage);
                if (Array.isArray(pageData.results)) allResults.push(...pageData.results);
            }
        } else if (!hasSort && page !== 1) {
            // No sort: fetch only requested page and use it directly
            const pageData = await clientStore.fetchAll(page, search.value || '', status.value, perPage);
            const pageResults = Array.isArray(pageData.results) ? [...pageData.results] : [];
            clients.results = pageResults.map((client, index) => ({
                ...client,
                number: (page - 1) * perPage + index + 1,
            }));
            return;
        }

        // Apply client-side sort globally
        if (Array.isArray(sortBy) && sortBy.length > 0) {
            const { key, order } = sortBy[0];
            const dir = order === 'desc' ? -1 : 1;
            allResults.sort((a, b) => {
                const va = a?.[key] ?? '';
                const vb = b?.[key] ?? '';
                if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
                return String(va).localeCompare(String(vb)) * dir;
            });
        }

        // If sorting, slice globally-sorted dataset; else use first page directly
        if (hasSort) {
            const startIndex = (page - 1) * perPage;
            const pageSlice = allResults.slice(startIndex, startIndex + perPage);
            clients.results = pageSlice.map((client, index) => ({
                ...client,
                number: startIndex + index + 1,
            }));
        } else {
            const firstPageResults = Array.isArray(firstPage.results) ? firstPage.results : [];
            clients.results = firstPageResults.map((client, index) => ({
                ...client,
                number: index + 1,
            }));
        }
    } catch (error) {
        console.error('Failed to load items:', error);
        clients.results = [];
    } finally {
        loading.value = false;
    }
};

const initialize = async () => {
    // Reset detail panel saat refresh
    infoShow.value = false;
    Object.assign(editedItem, defaultItem);
    editedIndex.value = -1;
    
    await loadItems({ 
        page: 1, 
        itemsPerPage: clients.page.per_page, 
        sortBy: currentSort.value 
    });
};

const editItem = item => {
    editedIndex.value = clients.results.indexOf(item);
    Object.assign(editedItem, item);
    infoShow.value = false; // ensure form is visible when editing
    dialog.value = true;
};

const infoItem = item => {
    editedIndex.value = clients.results.indexOf(item);
    Object.assign(editedItem, item);
    infoShow.value = true;
};

const deleteItem = item => {
    editedIndex.value = clients.results.indexOf(item);
    Object.assign(editedItem, item);
    dialogDelete.value = true;
};

const deleteItemConfirm = async () => {
    try {
        await clientStore.destroy(editedItem.id);
        await initialize();
        closeDelete();
    } catch (error) {
        console.error('Delete failed:', error);
    }
};

const openNewDialog = () => {
    // Reset state untuk create mode
    editedIndex.value = -1;
    infoShow.value = false;
    Object.assign(editedItem, defaultItem);
    dialog.value = true;
};

const close = () => {
    dialog.value = false;
    infoShow.value = false;
    Object.assign(editedItem, defaultItem);
    editedIndex.value = -1;
};

const closeDelete = () => {
    dialogDelete.value = false;
    Object.assign(editedItem, defaultItem);
    editedIndex.value = -1;
};

const save = async () => {
    try {
        if (editedIndex.value > -1) {
            // Edit mode: await API call dulu
            await clientStore.update(clients.results[editedIndex.value].id, editedItem);
        } else {
            // Create mode: await API call dulu
            await clientStore.add({ ...editedItem });
        }
        
        // Close dialog
        close();
        
        // Refresh setelah API berhasil
        await initialize();
    } catch (error) {
        console.error('Save failed:', error);
        // Optional: show error toast
    }
};

const updateEditedItem = item => {
    Object.assign(editedItem, item);
};

onMounted(async () => {
    try {
        await Promise.all([
            userStore.fetchUser(),
            initialize()
        ]);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
});

const pageStart = computed(() => {
    if (clients.page.count_result === 0) return 0;
    return (currentPage.value - 1) * clients.page.per_page + 1;
});
const pageEnd = computed(() => {
    return Math.min(currentPage.value * clients.page.per_page, clients.page.count_result);
});
const totalItems = computed(() => clients.page.count_result);
const totalPages = computed(() => Math.ceil(totalItems.value / clients.page.per_page));

const goFirst = () => { 
    if (currentPage.value > 1) currentPage.value = 1; 
};
const goPrev = () => { 
    if (currentPage.value > 1) currentPage.value--; 
};
const goNext = () => { 
    if (currentPage.value < totalPages.value) currentPage.value++; 
};
const goLast = () => { 
    if (currentPage.value < totalPages.value) currentPage.value = totalPages.value; 
};

// Export functionality
const exportData = (format) => {
    const data = clients.results.map(client => ({
        Name: client.name,
        Email: client.email,
        Phone: client.phone,
        Website: client.web,
        Address: client.address,
    }));

    if (format === 'csv') {
        // CSV Export
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${status.value}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    } else if (format === 'excel') {
        // Excel Export (CSV with .xls extension, opens in Excel)
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join('\t'),
            ...data.map(row => headers.map(header => row[header] || '').join('\t'))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${status.value}-${new Date().toISOString().split('T')[0]}.xls`;
        link.click();
    }
};

// Sort functionality
const currentSortValue = ref('name-asc');
const handleSort = (sortValue) => {
    currentSortValue.value = sortValue;
    const sorted = [...clients.results];
    
    switch (sortValue) {
        case 'name-asc':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            break;
    }
    
    clients.results = sorted;
};
</script>

<template>
    <div>
        <!-- Main Content: Header + List on Left, Detail Panel on Right -->
        <div class="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 items-stretch">
            <!-- Left Section (60%): Header + List -->
            <div class="flex flex-col gap-4">
                <!-- Header Section -->
                <SharedDataTableHeader
                    :search="search"
                    :search-placeholder="`Search ${status === 'eksternal' ? 'end users' : 'clients'}...`"
                    :current-page="currentPage"
                    :items-per-page="clients.page.per_page"
                    :total-items="totalItems"
                    :page-start="pageStart"
                    :page-end="pageEnd"
                    :action-label="`New ${status === 'eksternal' ? 'End User' : 'Client'}`"
                    :show-export="true"
                    @update:search="search = $event"
                    @go-first="goFirst"
                    @go-prev="goPrev"
                    @go-next="goNext"
                    @go-last="goLast"
                    @action-click="openNewDialog"
                    @export="exportData"
                />

                <!-- Client List -->
                <SharedDataTableList
                    :items="clients.results"
                    :loading="loading"
                    :title="`${status === 'eksternal' ? 'End User' : 'Client'} List`"
                    :total-items="totalItems"
                    :loading-text="`Loading ${status === 'eksternal' ? 'end users' : 'clients'}...`"
                    :empty-icon="'mdi-account-multiple-outline'"
                    :empty-title="`No ${status === 'eksternal' ? 'end users' : 'clients'} found`"
                    :empty-message="'Try adjusting your search'"
                    :show-sort="true"
                    :current-sort="currentSortValue"
                    @refresh="initialize"
                    @sort="handleSort"
                >
                    <template #items>
                        <SharedDataTableListItem
                            v-for="client in clients.results"
                            :key="client.id"
                            :title="client.name"
                            :subtitle="client.email"
                            :is-selected="infoShow && editedItem.id === client.id"
                            :avatar-src="client.logo"
                            :avatar-fallback="client.name?.charAt(0)?.toUpperCase()"
                            :show-checkbox="false"
                            :actions="[
                                { id: 'view', icon: 'mdi-eye-outline' },
                                { id: 'edit', icon: 'mdi-square-edit-outline' },
                                { id: 'delete', icon: 'mdi-trash-can-outline' }
                            ]"
                            @select="infoItem(client)"
                            @action="(actionId) => {
                                if (actionId === 'view') infoItem(client);
                                else if (actionId === 'edit') editItem(client);
                                else if (actionId === 'delete') deleteItem(client);
                            }"
                        >
                            <template #extra-button>
                                <a 
                                    v-if="client.web" 
                                    :href="client.web" 
                                    target="_blank"
                                    class="visit-badge"
                                    @click.stop
                                >
                                    <v-icon size="12">mdi-open-in-new</v-icon>
                                    Visit
                                </a>
                            </template>
                        </SharedDataTableListItem>
                    </template>
                </SharedDataTableList>
            </div>

            <!-- Right Section (40%): Detail Panel -->
            <div class="flex flex-col h-full">
                <SharedDataTableDetailPanel>
                    <template #user-card>
                        <SharedUserCard :user="userStore.user" />
                    </template>
                    
                    <template #content>
                        <div v-if="infoShow && editedItem.id">
                            <SharedDataTableDetailView
                                :show-logo="true"
                                :logo-src="editedItem.logo"
                                :logo-alt="editedItem.name"
                                :fields="[
                                    { key: 'name', label: 'Full Name', value: editedItem.name },
                                    { key: 'phone', label: 'Phone Number', value: editedItem.phone },
                                    { key: 'email', label: 'Email Address', value: editedItem.email },
                                    { key: 'web', label: 'Website URL', value: editedItem.web, type: 'link' },
                                    { key: 'address', label: 'Address', value: editedItem.address, multiline: true }
                                ]"
                            >
                                <template #title>
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex-1">
                                            <h3 class="client-name">{{ editedItem.name }}</h3>
                                            <p class="client-email">{{ editedItem.email }}</p>
                                        </div>
                                        <a 
                                            v-if="editedItem.web" 
                                            :href="editedItem.web" 
                                            target="_blank"
                                            class="visit-badge"
                                        >
                                            <v-icon size="12">mdi-open-in-new</v-icon>
                                            Visit
                                        </a>
                                    </div>
                                </template>
                            </SharedDataTableDetailView>                                                       
                        </div>
                        
                        <SharedDataTableEmptyState
                            v-else
                            icon="mdi-account-outline"
                            :title="`No ${status === 'eksternal' ? 'end user' : 'client'} selected`"
                            message="Select an item from the list to view details"
                        />
                    </template>
                </SharedDataTableDetailPanel>
            </div>
        </div>

        <!-- Dialog: Add/Edit Form -->
        <v-dialog
            v-model="dialog"
            class="d-flex justify-center"
            max-width="65%"
            persistent
            transition="dialog-bottom-transition"
            scrim="rgba(0,0,0,0.4)"
        >
            <v-card class="rounded-xl" style="border-radius: 20px 20px 0 0; margin: 0;">
                <v-card-text class="px-6 py-6">
                    <form @submit.prevent="save" enctype="multipart/form-data">
                        <DashboardsClientForm
                            :editedItem="editedItem"
                            @update:editedItem="updateEditedItem"
                        />
                        <v-card-actions class="px-6 py-4 border-t border-gray-200">
                            <div class="text-sm font-medium text-gray-800">{{formTitle}}</div>
                            <v-spacer />
                            <v-btn
                                variant="outlined"
                                color="grey-darken-1"
                                rounded="lg"
                                @click="close"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                variant="flat"
                                color="grey-darken-1"
                                rounded="lg"
                                :style="{ background:'#1e1e1e', color:'#fff', minWidth: '150px' }"
                                @click="save"
                            >
                                Save {{ status === 'eksternal' ? 'End User' : 'Client'}}
                            </v-btn>
                        </v-card-actions>
                    </form>
                </v-card-text>

            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <DashboardsFormsDeleteConfirm
            :showModal="dialogDelete"
            @update:showModal="dialogDelete = $event"
            :closeAction="closeDelete"
            :deleteAction="deleteItemConfirm"
            :title="status === 'eksternal' ? 'End User' : 'Client'"
        />
    </div>
</template>

<style scoped>
.visit-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 18px;
    text-decoration: none;
    transition: all 0.15s ease;
    white-space: nowrap;
}

.visit-badge:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
    color: #1e1e1e;
}

.client-name {
    font-size: 16px;
    font-weight: 600;
    color: #000;
    margin: 0;
    line-height: 1.3;
}

.client-email {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
}

/* Remove Vuetify default shadows globally for this page */
:deep(.v-card) {
    box-shadow: none !important;
}
</style>
