<template>
    <v-row class="p-5">
        <v-col cols="6">
            <label for="amount_inc_tax" :class="['field-label', {'field-label--active': isActive('amount_inc_tax')}]">Amount Inc. Tax*</label>
            <v-text-field
                v-model="formData.amount_inc_tax"
                :rules="[requiredRule, amountRule]"
                :error-messages="errors.amount_inc_tax"
                hide-details
                @focus="focusStates.amount_inc_tax = true" @blur="focusStates.amount_inc_tax = false"
                density="compact"
            ></v-text-field>
            <div class="mt-3">
                <label for="amount_exc_tax" :class="['field-label', {'field-label--active': isActive('amount_exc_tax')}]">Amount Exc. Tax*</label>
                <v-text-field
                    v-model="formData.amount_exc_tax"
                    :rules="[requiredRule, amountRule]"
                    :error-messages="errors.amount_exc_tax"
                    hide-details
                    @focus="focusStates.amount_exc_tax = true" @blur="focusStates.amount_exc_tax = false"
                    density="compact"
                ></v-text-field>
            </div>
            <div class="mt-3">
                <label for="scope_of_work" :class="['field-label', {'field-label--active': isActive('scope_of_work')}]">Scope of Work*</label>
                <v-textarea
                    v-model="formData.scope_of_work"
                    :rules="[requiredRule]"
                    :error-messages="errors.scope_of_work"
                    hide-details
                    @focus="focusStates.scope_of_work = true" @blur="focusStates.scope_of_work = false"
                    density="compact"
                ></v-textarea>
            </div>
        </v-col>
        <v-col cols="6">
            <label for="po_contract_date" :class="['field-label', {'field-label--active': isActive('po_contract_date')}]">PO/Contract Date*</label>
            <v-date-input
                v-model="formatedDate"
                :error-messages="errors.po_contract_date"
                variant="outlined"
                hide-details
                prepend-icon=""
                @focus="focusStates.po_contract_date = true" @blur="focusStates.po_contract_date = false"
                density="compact"
            ></v-date-input>
            <div class="mt-3">
                <label for="po_contract_no" :class="['field-label', {'field-label--active': isActive('po_contract_no')}]">PO/Contract No*</label>
                <v-text-field
                    v-model="formData.po_contract_no"
                    :rules="[requiredRule]"
                    :error-messages="errors.po_contract_no"
                    hide-details
                    class="capitalize-input"
                    @focus="focusStates.po_contract_no = true" @blur="focusStates.po_contract_no = false"
                    density="compact"
                ></v-text-field>
            </div>
            <div class="mt-3">
                <label for="term_of_payment" :class="['field-label', {'field-label--active': isActive('term_of_payment')}]">Term of Payment*</label>
                <v-text-field
                    v-model="formData.term_of_payment"
                    :rules="[requiredRule]"
                    :error-messages="errors.term_of_payment"
                    hide-details
                    @focus="focusStates.term_of_payment = true" @blur="focusStates.term_of_payment = false"
                    density="compact"
                ></v-text-field>
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
const props = defineProps({
    formData: Object,
    errors: Object,
    isInfo: Boolean,
});

const formatedDate = ref(
    new Date(formatDateForInput(props.formData.po_contract_date))
);
const { formData, errors } = toRefs(props);

const requiredRule = value => !!value || 'Required.';
const amountRule = value => !isNaN(value) || 'Invalid amount.';

const focusStates = reactive({
    amount_inc_tax: false,
    amount_exc_tax: false,
    scope_of_work: false,
    po_contract_date: false,
    po_contract_no: false,
    term_of_payment: false,
});

const isActive = (key) => focusStates[key];

watch(formatedDate, (newValue, oldValue) => {
    formData.value.po_contract_date = formatDateForInput(newValue);
});
</script>

<style scoped>
.field-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280; /* gray-500 */
    display: inline-block;
    margin-bottom: 6px;
    transition: color 0.2s ease;
}
.field-label--active {
    color: rgb(var(--v-theme-primary)) !important;
}
.capitalize-input {
    text-transform: capitalize !important;
}
</style>
