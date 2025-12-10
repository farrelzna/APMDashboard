<template>
  <v-dialog 
    :model-value="showModal" 
    @update:modelValue="$emit('update:showModal', $event)" 
    class="d-flex justify-center"
    max-width="60%"
    persistent
    transition="dialog-bottom-transition"
    scrim="rgba(0,0,0,0.4)"
  >
    <v-card class="py-5 px-3">
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon color="warning" class="me-2">mdi-alert-circle-outline</v-icon>
        Confirm Deletion
      </v-card-title>
      <v-card-text>Are you sure you want to delete this user? This action cannot be undone.</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <div class="text-sm font-medium text-gray-800">Delete User</div>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeAction">Cancel</v-btn>
        <v-btn color="error" rounded="lg" variant="flat" @click="deleteAction">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  showModal: Boolean,
});
const emit = defineEmits(['update:showModal', 'closeAction', 'deleteAction']);

const closeAction = () => {
  emit('closeAction');
  emit('update:showModal', false);
}
const deleteAction = () => {
  emit('deleteAction');
}
</script>