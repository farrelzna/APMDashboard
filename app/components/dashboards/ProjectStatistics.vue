<template>
    <v-skeleton-loader
        :loading="loading"
        class="pa-4"
        :loading-text="'Loading...'"
    >
        <template v-slot:default>
            <v-card-item class="pa-0">
                <!-- Metrics Grid 2x3 -->
                <div class="pa-4" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                    <h4 class="font-semibold">Projects Analytics</h4>
                    <!-- <div style="grid-column: 1 / -1;">
                    </div> -->
                    <div>
                        <div class="text-caption text-grey mb-1">Maintenance</div>
                        <div class="text-h4 font-weight-medium">{{ props.data['Maintenance'] ?? 0 }}</div>
                    </div>
                    <div>
                        <div class="text-caption text-grey mb-1">Complete</div>
                        <div class="text-h4 font-weight-medium">{{ props.data['Complete'] ?? 0 }}</div>
                    </div>
                    <div>
                        <div class="text-caption text-grey mb-1">On-going</div>
                        <div class="text-h4 font-weight-medium">{{ props.data['In Progress'] ?? 0 }}</div>
                    </div>
                    <div>
                        <div class="text-caption text-grey mb-1">Almost Due</div>
                        <div class="text-h4 font-weight-medium">{{ props.data['Almost Due'] ?? 0 }}</div>
                    </div>
                    <div>
                        <div class="text-caption text-grey mb-1">Overdue</div>
                        <div class="text-h4 font-weight-medium text-error">{{ overdueCount }}</div>
                    </div>
                </div>

                <!-- Chart Area -->
                <div>
                    <apexchart
                        ref="chartRef"
                        type="line"
                        height="140"
                        width="100%"
                        :options="chartOptions"
                        :series="chartSeries"
                    ></apexchart>
                </div>
            </v-card-item>
        </template>
    </v-skeleton-loader>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { VSkeletonLoader } from 'vuetify/components';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const loading = ref(true);
const chartRef = ref(null);

// Computed property to calculate overdue projects
const overdueCount = computed(() => {
    return props.data['Overdue'] ?? 0;
});

const chartSeries = ref([
    {
        name: 'Projects',
        data: [
            props.data['Maintenance'] || 0,
            props.data['Complete'] || 0,
            props.data['In Progress'] || 0,
            props.data['Almost Due'] || 0,
            props.data['Overdue'] || 0,
        ]
    }
]);

watch(
    () => props.data,
    newData => {
                chartSeries.value = [{
                    name: 'Projects',
                    data: [
                        newData['Maintenance'] || 0,
                        newData['Complete'] || 0,
                        newData['In Progress'] || 0,
                        newData['Almost Due'] || 0,
                        newData['Overdue'] || 0,
                    ]
                }];
        loading.value = false;
    },
    { deep: true, immediate: true }
);

// Resize observer untuk adaptasi chart saat sidebar berubah
let resizeObserver = null;
let rafId = null;
let lastWidth = null;
let updateTimeout = null;
let lastUpdateTime = 0;

const updateChartSize = () => {
    const now = Date.now();
    
    // Throttle: minimum 300ms between actual chart updates
    if (now - lastUpdateTime < 300) {
        return;
    }
    
    // Cancel previous animation frame and timeout
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
    
    // Use minimal debounce (50ms) for batching rapid resize events
    updateTimeout = setTimeout(() => {
        if (chartRef.value && chartRef.value.chart) {
            const container = chartRef.value.$el?.parentElement;
            if (container) {
                const newWidth = container.offsetWidth;
                // Only update if width actually changed significantly (>15px)
                if (lastWidth === null || Math.abs(newWidth - lastWidth) > 15) {
                    lastWidth = newWidth;
                    lastUpdateTime = Date.now();
                    
                    rafId = requestAnimationFrame(() => {
                        try {
                            if (chartRef.value?.chart) {
                                // Use updateOptions with minimal parameters for performance
                                chartRef.value.chart.updateOptions({
                                    chart: {
                                        width: newWidth
                                    }
                                }, false, false); // Disable animation and redraw
                            }
                        } catch (e) {
                            console.error('Chart update error:', e);
                        }
                        rafId = null;
                    });
                }
            }
        }
        updateTimeout = null;
    }, 50); // Short debounce
};

onMounted(() => {
    nextTick(() => {
        // Observe chart container langsung
        const chartContainer = chartRef.value?.$el?.parentElement;
        if (chartContainer) {
            lastWidth = chartContainer.offsetWidth;
            resizeObserver = new ResizeObserver(() => {
                updateChartSize();
            });
            resizeObserver.observe(chartContainer);
        }
    });
});

onBeforeUnmount(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
});

const chartOptions = computed(() => ({
    chart: {
        height: 140,
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        toolbar: { show: false },
        background: 'transparent',
        animations: {
            enabled: false
        },
        sparkline: {
            enabled: false
        }
    },
    stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#6b7280']
    },
    markers: {
        size: 0,
        strokeWidth: 0
    },
    xaxis: {
        categories: ['Maintenance', 'Complete', 'On-going', 'Almost Due', 'Overdue'],
        labels: { 
            show: true,
            style: { 
                colors: '#9ca3af',
                fontSize: '11px',
                fontWeight: 500
            }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
    },
    yaxis: {
        labels: { 
            show: false,
            style: { 
                colors: '#9ca3af',
                fontSize: '11px'
            }
        }
    },
    dataLabels: {
        enabled: false
    },
    legend: {
        show: false
    },
    grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 3,
        padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }
    },
    tooltip: {
        enabled: true,
        theme: 'dark',
        style: {
            fontSize: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        },
        y: {
            formatter: function(value) {
                return value + ' projects';
            },
            title: {
                formatter: function(seriesName) {
                    return seriesName;
                }
            }
        },
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
            const category = w.globals.labels[dataPointIndex];
            const value = series[seriesIndex][dataPointIndex];
            return `<div style="background: #1e1e1e; padding: 8px 12px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">${category}</div>
                <div style="color: #fff; font-size: 14px; font-weight: 600;">${value} projects</div>
            </div>`;
        }
    }
}));

const projectList = ref(null);
</script>
