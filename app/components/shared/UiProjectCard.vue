<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
    projectData: Object,
    color: String,
});

const config = useRuntimeConfig();
const isHovered = ref(false);
</script>

<template>
    <v-card-item class="pa-4">
        <div class="d-flex align-start justify-space-between w-100 mb-3">
            <div class="d-flex align-center ga-3 flex-grow-1" style="min-width: 0;">
                <v-avatar size="48" color="grey-lighten-4" rounded="xl" style="border: 1px solid #f4f4f4;">
                    <template v-if="props.projectData?.customer_str?.logo">
                        <v-img :src="config.public.apiMedia + props.projectData.customer_str.logo" cover />
                    </template>
                    <template v-else>
                        <span class="text-grey-darken-2 font-weight-medium text-h6">{{ (projectData?.name || '?').charAt(0) }}</span>
                    </template>
                </v-avatar>
                <div class="d-flex flex-column" style="min-width: 0; flex: 1;">
                    <div class="text-h6 font-weight-bold text-truncate" style="line-height: 1.3;">{{ projectData?.name }}</div>
                    <span class="text-caption text-grey-darken-1 text-uppercase" style="letter-spacing: 0.5px;">{{ projectData?.customer_str?.name }}</span>
                </div>
            </div>
            <div class="text-caption text-grey-darken-1" style="white-space: nowrap; margin-top: 4px;">
                Due date {{ props.projectData?.end_date }}
            </div>
        </div>
        <slot />
    </v-card-item>
</template>
