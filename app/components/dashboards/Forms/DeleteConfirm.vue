<template>
    <v-dialog
        :model-value="showModal"
        @update:model-value="emit('update:showModal', $event)"
        class="d-flex justify-center"
        max-width="60%"
        persistent
        transition="dialog-bottom-transition"
        scrim="rgba(0,0,0,0.4)"
    >
        <v-card class="rounded-xl border border-gray-200" elevation="0">
            <v-card-text class="pa-6">
                <h3 class="text-h6 font-weight-bold text-error mb-3">Are you sure?</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                    This action <strong>CANNOT</strong> be undone. Please be
                    absolutely certain you want to proceed before confirming.
                </p>
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-actions class="pa-4 d-flex ga-3 justify-end">
                <div class="text-sm font-medium text-gray-800">Delete {{ title }}</div>
                <v-spacer/>
                <v-btn
                    variant="outlined"
                    color="grey-darken-1"
                    class="text-none px-6 rounded-lg"
                    @click="closeAction"
                >
                    Cancel
                </v-btn>
                <v-btn
                    variant="flat"
                    color="error"
                    class="text-none px-6 rounded-lg"
                    @click="deleteAction"
                >
                    Confirm Delete
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
const props = defineProps({
    showModal: Boolean,
    closeAction: Function,
    deleteAction: Function,
    title: { type: String, default: 'Item' },
});

const emit = defineEmits(['update:showModal']);
</script>
