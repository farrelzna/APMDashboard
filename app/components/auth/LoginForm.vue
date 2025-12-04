<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const showPassword = ref(false);

const userStore = useUserStore();

const handleLogin = async () => {
    const success = await userStore.login(username.value, password.value);
    if (success) {
        navigateTo('/');
    }
};

const toggleShowPassword = () => {
    showPassword.value = !showPassword.value;
};
</script>

<template>
    <div>
        <div class="mb-6">
            <h2 class="text-h5 font-weight-bold mb-2">Welcome Back</h2>
            <p class="text-body-2 text-medium-emphasis">Sign in to continue</p>
        </div>
        
        <v-form @submit.prevent="handleLogin">
            <v-row class="mb-0">
                <v-col cols="12" class="pb-2">
                    <v-label class="font-weight-medium mb-2 text-body-2" color="white">Username</v-label>
                    <v-text-field 
                        v-model="username"                         
                        variant="outlined" 
                        density="comfortable"
                        hide-details 
                        color="white" 
                        placeholder="Enter your username"
                    ></v-text-field>
                </v-col>
                
                <v-col cols="12" class="py-2">
                    <v-label class="font-weight-medium mb-2 text-body-2">Password</v-label>
                    <v-text-field 
                        v-model="password"                         
                        variant="outlined"
                        density="comfortable"
                        :type="showPassword ? 'text' : 'password'" 
                        hide-details
                        color="primary" 
                        placeholder="Enter your password"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="toggleShowPassword"
                    ></v-text-field>
                </v-col>
                
                <v-col cols="12" class="pt-4">
                    <v-btn 
                        size="large"                     
                        block 
                        type="submit" 
                        flat
                        class="text-none font-weight-medium rounded-sm"
                    >
                        Sign In
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
    </div>
</template>

<style scoped>
.v-label, .v-text-field, h2 {
    color: white !important;
}
</style>
