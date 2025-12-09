<template>
    <v-menu location="start">
        <template v-slot:activator="{ props }">
            <v-icon
                v-bind="props"
                size="large"
                icon="mdi-dots-vertical"
            ></v-icon>
        </template>
        <v-list>
            <v-list-item key="" value="" @click="infoItem(item)">
                <div class="flex gap-2 items-center">
                    <v-icon size="small">mdi-eye</v-icon>
                    <v-list-item-title>Details</v-list-item-title>
                </div>
            </v-list-item>
            <v-list-item key="" value="" @click="editItem(item)">
                <div class="flex gap-2 items-center">
                    <v-icon size="small">mdi-pencil</v-icon>
                    <v-list-item-title>Edit</v-list-item-title>
                </div>
            </v-list-item>
            <v-list-item key="" value="" @click="deleteItem(item)">
                <div class="flex gap-2 items-center">
                    <v-icon size="small">mdi-delete</v-icon>
                    <v-list-item-title>Delete</v-list-item-title>
                </div>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup>
const props = defineProps({
    data: {
        type: String,
        required: true,
    },
    item: {
        type: Object,
        required: true,
    },
});

const userPermissions = usePermissions();
const clientPermissions = computed(() => pagePermission[props.data] || {});

const emit = defineEmits(['edit-item', 'info-item', 'delete-item']);

const editItem = item => {
    emit('edit-item', item);
};

const infoItem = item => {
    emit('info-item', item);
};

const deleteItem = item => {
    emit('delete-item', item);
};
</script>
