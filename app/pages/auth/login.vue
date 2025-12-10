<script setup lang="ts">
definePageMeta({
    layout: 'blank',
    middleware: ['guest'],
});
</script>
<template>
    <div class="min-h-screen w-full relative overflow-hidden" style="background-color: #2c2c2c;">
        <!-- Background Image -->
        <div class="absolute inset-0 z-0">
            <img 
                src="/images/backgrounds/Group-89-2-scaled.jpg" 
                alt="Background" 
                class="w-full h-full object-cover opacity-60"
            />
        </div>

        <!-- Text APM di pojok kiri atas -->
        <div class="absolute top-8 left-8 z-10">            
            <LayoutFullLogoDark />
        </div>

        <!-- Let's Talk di pojok kanan atas -->
        <div class="absolute top-8 right-12 z-10">
            <a 
                href="https://daas.co.id/about/#contact" 
                target="_blank"
                class="text-white font-medium text-lg hover:text-orange-500 transition-colors duration-300 flex items-center gap-2"
                style="text-decoration: none;"
            >
                Let's Talk
                <v-icon icon="mdi-arrow-right" size="small" />
            </a>
        </div>

        <!-- Desktop layout -->
        <div class="hidden lg:block">
            <!-- Logo + Text Dasa di pojok kiri bawah -->
            <div class="absolute bottom-12 left-12 z-10 items-end">
                <h1 class="text-white font-light leading-tight" style="font-size: clamp(2rem, 6vw, 4rem); line-height: 1.1;">
                        Most Reliable and <br/> Trusted Technology Company
                </h1>        
            </div>

            <!-- Login Card di pojok kanan bawah -->
            <div class="absolute bottom-12 right-12 z-10">
                    <v-card
                            class="px-4 py-6"
                            max-width="500"
                            width="500"                                
                            style="background: black !important;" 
                    >
                            <v-card-item class="pa-4">
                                    <AuthLoginForm />
                            </v-card-item>
                    </v-card>
            </div>
        </div>

        <!-- Mobile/Tablet layout -->
        <div class="lg:hidden relative z-10 px-6 absolute top-1/4 py-8 flex flex-col items-center gap-6">
            <h1 class="text-white text-center font-light leading-tight" style="font-size: clamp(1.5rem, 7vw, 2.25rem); line-height: 1.2;">
                Most Reliable and <br/> Trusted Technology Company
            </h1>
            <v-card
                class="px-4 py-6"
                max-width="500"
                style="background: black !important;"
            >
                <v-card-item class="pa-2">
                    <AuthLoginForm />
                </v-card-item>
            </v-card>
        </div>

        <!-- Decorative gradient overlay (optional) -->
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none"></div>
    </div>
</template>
